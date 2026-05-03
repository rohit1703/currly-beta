'use server';

import OpenAI from 'openai';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { headers, cookies } from 'next/headers';
import { Tool, SearchScores, UserProfile } from '@/types';
import { CATEGORIES } from '@/lib/categories';
import { rateLimit } from '@/lib/rate-limit';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { applyICPBoost } from '@/lib/icp-boost';

const COLUMNS = 'id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date, is_featured';

export interface SearchIntent {
  terms: string[];
  category: string | null;
  pricing: string[] | null;
  summary: string;
}

export interface SearchFilters {
  category?: string | null;
  pricing?: string[] | null;
}

export interface AISearchResult {
  tools: Tool[];
  intent: SearchIntent;
}

const EMPTY_INTENT: SearchIntent = { terms: [], category: null, pricing: null, summary: '' };

// Parse query intent with gpt-4o-mini — cached 24h (same query = same meaning)
const parseIntent = unstable_cache(
  async (query: string): Promise<SearchIntent> => {
    if (!process.env.OPENAI_API_KEY) {
      return { terms: [query], category: null, pricing: null, summary: query };
    }
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const categoryNames = CATEGORIES.map(c => c.name).join(', ');

      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You extract search intent for an AI tool discovery platform. Return only JSON.
Categories available: ${categoryNames}
Pricing options: free, freemium, paid, open source

Return: {"terms": string[], "category": string|null, "pricing": string[]|null, "summary": string}
- terms: 3-6 specific keywords including synonyms and related concepts (expand the query)
- category: exact category name from the list if clearly implied, else null
- pricing: array of relevant pricing types if mentioned, else null
- summary: ≤8 words describing what the user wants`,
          },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 150,
        temperature: 0,
      });

      const p = JSON.parse(res.choices[0].message.content || '{}');
      return {
        terms: Array.isArray(p.terms) && p.terms.length ? p.terms : [query],
        category: typeof p.category === 'string' && CATEGORIES.some(c => c.name === p.category) ? p.category : null,
        pricing: Array.isArray(p.pricing) && p.pricing.length ? p.pricing : null,
        summary: typeof p.summary === 'string' ? p.summary : query,
      };
    } catch {
      return { terms: [query], category: null, pricing: null, summary: query };
    }
  },
  ['search-intent'],
  { revalidate: 86400 }
);

// Cache query embeddings 24h
const getEmbedding = unstable_cache(
  async (q: string): Promise<number[] | null> => {
    if (!process.env.OPENAI_API_KEY) return null;
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const res = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: q,
        encoding_format: 'float',
      });
      return res.data[0].embedding;
    } catch {
      return null;
    }
  },
  ['search-embedding'],
  { revalidate: 86400 }
);

// Core ranked search — results cached 1h per unique (query, category, pricing, page, pageSize).
// Exported so the /api/search route can call it directly after its own rate-limit check.
export const runRankedSearch = unstable_cache(
  async (
    query: string,
    filterCategory: string | null,
    filterPricing: string[] | null,
    page: number,
    pageSize: number
  ): Promise<AISearchResult> => {
    const supabase = createPublicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Intent parse and embedding run in parallel — both cached independently
    const [intent, embedding] = await Promise.all([
      parseIntent(query),
      getEmbedding(query),
    ]);

    // Merge intent-derived filters with explicit caller filters (caller wins)
    const effectiveCategory = filterCategory !== undefined ? filterCategory : intent.category;
    const effectivePricing  = filterPricing  !== undefined ? filterPricing  : intent.pricing;

    // FTS query: join intent-expanded terms with OR
    const ftsQuery = intent.terms.join(' | ');

    // Call the unified ranked RPC
    const { data: rankedData, error } = await supabase.rpc('match_tools_ranked', {
      query_embedding:  embedding    ?? null,
      query_fts:        ftsQuery     || null,
      match_mode:       'search',
      filter_category:  effectiveCategory ?? null,
      filter_pricing:   effectivePricing  ?? null,
      page_number:      page,
      page_size:        pageSize,
    });

    if (error) {
      console.error('[match_tools_ranked] RPC error:', error.message);
    }

    let tools = mapRankedRows(rankedData ?? []);

    // Fallback: ilike on expanded terms if RPC returned nothing
    if (tools.length === 0) {
      const fallbackQuery = intent.terms
        .map(t => `name.ilike.%${t}%,description.ilike.%${t}%`)
        .join(',');
      const { data } = await supabase
        .from('tools')
        .select(COLUMNS)
        .eq('launch_status', 'Live')
        .or(fallbackQuery)
        .limit(pageSize);
      tools = (data || []) as Tool[];
    }

    // Fallback: trigram fuzzy search if ilike also returned nothing
    if (tools.length === 0) {
      const { data } = await supabase.rpc('fuzzy_search_tools', {
        search_query: query,
        match_count: pageSize,
      });
      tools = (data as Tool[]) || [];
    }

    return { tools, intent };
  },
  ['ranked-search'],
  { revalidate: 3600, tags: ['tools'] }
);

// Map RPC rows: strip score columns into _scores, return Tool objects
function mapRankedRows(rows: Record<string, unknown>[]): Tool[] {
  return rows.map(row => {
    const scores: SearchScores = {
      lexical:   (row.lexical_score  as number) ?? 0,
      semantic:  (row.semantic_score as number) ?? 0,
      quality:   (row.quality_score  as number) ?? 0,
      freshness: (row.freshness_score as number) ?? 0,
      behavior:  (row.behavior_score as number) ?? 0,
      final:     (row.final_score    as number) ?? 0,
    };
    const tool: Tool = {
      id:            row.id            as string,
      name:          row.name          as string,
      slug:          row.slug          as string,
      description:   row.description   as string,
      main_category: row.main_category as string,
      pricing_model: row.pricing_model as string,
      image_url:     row.image_url     as string,
      is_india_based: row.is_india_based as boolean | undefined,
      website:       row.website       as string,
      launch_date:   row.launch_date   as string,
      is_featured:   row.is_featured   as boolean | undefined,
      _scores:       scores,
    };
    return tool;
  });
}

export async function aiSearch(
  query: string,
  options: { page?: number; pageSize?: number; filters?: SearchFilters } = {}
): Promise<AISearchResult> {
  if (!query) return { tools: [], intent: EMPTY_INTENT };

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return { tools: [], intent: EMPTY_INTENT };
  }

  const page     = options.page     ?? 1;
  const pageSize = options.pageSize ?? 20;
  const category = options.filters?.category ?? null;
  const pricing  = options.filters?.pricing  ?? null;

  return runRankedSearch(query, category, pricing, page, pageSize);
}

// Deduped per request — safe to call from both personalizedSearch and the page component
const getSessionProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    const userSupabase = createServerClient(await cookies());
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return null;
    const { data } = await createAdminClient()
      .from('user_profiles')
      .select('onboarding_status, role, primary_use_case, monthly_budget_range')
      .eq('user_id', user.id)
      .maybeSingle();
    return (data as UserProfile | null);
  } catch {
    return null;
  }
});

/**
 * Hybrid search with ICP-aware re-ranking for authenticated users.
 * Fetches 3× the requested page size from the ranked RPC so the boost
 * has enough candidates to promote relevant tools without pagination gaps.
 * Falls back to plain ranked results for unauthenticated or unfinished profiles.
 */
export async function personalizedSearch(
  query: string,
  options: { page?: number; pageSize?: number; filters?: SearchFilters } = {}
): Promise<AISearchResult> {
  if (!query) return { tools: [], intent: EMPTY_INTENT };

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return { tools: [], intent: EMPTY_INTENT };
  }

  const page     = options.page     ?? 1;
  const pageSize = options.pageSize ?? 20;
  const category = options.filters?.category ?? null;
  const pricing  = options.filters?.pricing  ?? null;

  const profile = await getSessionProfile();

  // Without a completed profile there's nothing to boost — use the plain cached path
  if (!profile || profile.onboarding_status !== 'completed') {
    return runRankedSearch(query, category, pricing, page, pageSize);
  }

  // Fetch a wider candidate window so boosted tools from lower positions can surface
  const candidateSize = pageSize * 3;
  const { tools: candidates, intent } = await runRankedSearch(
    query, category, pricing, 1, candidateSize
  );

  const reranked = applyICPBoost(candidates, profile);
  const start    = (page - 1) * pageSize;

  return { tools: reranked.slice(start, start + pageSize), intent };
}
