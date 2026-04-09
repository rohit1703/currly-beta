'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import OpenAI from 'openai';
import { Tool } from '@/types';
import { unstable_cache } from 'next/cache';
import { rateLimit } from '@/lib/rate-limit';

// Words to strip from natural language queries before FTS
// e.g. "I need a free tool for image editing" → "free image editing"
const STOP_WORDS = new Set([
  'i', 'a', 'an', 'the', 'for', 'to', 'and', 'or', 'is', 'are', 'want',
  'need', 'looking', 'find', 'get', 'can', 'will', 'do', 'that', 'this',
  'with', 'in', 'on', 'at', 'by', 'from', 'of', 'it', 'my', 'me', 'we',
  'best', 'good', 'some', 'any', 'help', 'use', 'make', 'build', 'create',
  'tool', 'tools', 'app', 'software', 'ai', 'platform'
]);

function extractKeywords(query: string): string {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => !STOP_WORDS.has(word) && word.length > 2)
    .join(' ');
}

const COLUMNS = 'id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date, is_featured';

// --- 1. FAST SEARCH (Text Only - Instant & Cached) ---
// We use createPublicClient here because unstable_cache cannot access request cookies.
export async function quickSearch(query: string): Promise<{ tools: Tool[]; fuzzy: boolean }> {
  if (!query) return { tools: [], fuzzy: false };

  // Rate limit: 30 searches per minute per IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return { tools: [], fuzzy: false };
  }

  const getCachedText = unstable_cache(
    async (q: string): Promise<{ tools: Tool[]; fuzzy: boolean }> => {
      const supabase = createPublicClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const keywords = extractKeywords(q);

      // Step 1: Try FTS with extracted keywords
      if (keywords) {
        const { data: ftsData } = await supabase
          .from('tools')
          .select(COLUMNS)
          .textSearch('fts', keywords, { type: 'websearch', config: 'english' })
          .limit(20);

        if (ftsData && ftsData.length > 0) return { tools: ftsData as Tool[], fuzzy: false };
      }

      // Step 2: FTS returned nothing — fall back to broad ilike search
      const terms = (keywords || q).split(/\s+/).filter(Boolean);
      const primaryTerm = terms[0];
      if (!primaryTerm) return { tools: [], fuzzy: false };

      const { data: fallbackData } = await supabase
        .from('tools')
        .select(COLUMNS)
        .or(terms.map(t => `name.ilike.%${t}%,description.ilike.%${t}%`).join(','))
        .limit(20);

      if (fallbackData && fallbackData.length > 0) {
        return { tools: fallbackData as Tool[], fuzzy: false };
      }

      // Step 3: Nothing matched — try trigram fuzzy search (catches typos)
      const { data: fuzzyData } = await supabase
        .rpc('fuzzy_search_tools', { search_query: q, match_count: 20 });

      return { tools: (fuzzyData as Tool[]) || [], fuzzy: (fuzzyData?.length ?? 0) > 0 };
    },
    ['text-search'],
    { revalidate: 3600, tags: ['tools'] }
  );

  return getCachedText(query);
}

// Cached embedding fetch — same query never hits OpenAI twice within 24h
const getCachedEmbedding = unstable_cache(
  async (q: string) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q,
      encoding_format: 'float',
    });
    return res.data[0].embedding;
  },
  ['query-embedding'],
  { revalidate: 86400 } // 24 hours
);

// --- 2. SMART SEARCH (Semantic / Vector) ---
// Uses OpenAI embeddings + pgvector. No cookies needed — vector search is a public read.
export async function smartSearch(query: string): Promise<Tool[]> {
  if (!query || !process.env.OPENAI_API_KEY) return [];

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const queryEmbedding = await getCachedEmbedding(query.toLowerCase().trim());

    const { data, error } = await supabase.rpc('match_tools', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 20
    });

    if (error) {
      console.error("Vector match error:", error);
      return [];
    }
    return (data as Tool[]) || [];
  } catch (err) {
    console.error("SmartSearch error:", err);
    return [];
  }
}

// --- 3. SUGGESTIONS (Autocomplete) ---
export type Suggestion = { text: string; type: 'query' | 'tool' };

export async function getSuggestions(query: string): Promise<Suggestion[]> {
  if (!query || query.length < 2) return [];

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch popular past queries + tool names in parallel
  const [{ data: pastQueries }, { data: toolNames }] = await Promise.all([
    supabase
      .from('search_queries')
      .select('query')
      .ilike('query', `%${query}%`)
      .order('count', { ascending: false })
      .limit(4),
    supabase
      .from('tools')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(4),
  ]);

  const querySet = new Set<string>();
  const results: Suggestion[] = [];

  for (const row of (pastQueries || [])) {
    if (!querySet.has(row.query.toLowerCase())) {
      querySet.add(row.query.toLowerCase());
      results.push({ text: row.query, type: 'query' });
    }
  }

  for (const row of (toolNames || [])) {
    if (!querySet.has(row.name.toLowerCase())) {
      querySet.add(row.name.toLowerCase());
      results.push({ text: row.name, type: 'tool' });
    }
  }

  return results.slice(0, 6);
}

// --- 4. LOG SEARCH ---
export async function logSearchEvent(query: string): Promise<void> {
  const normalized = query.trim().toLowerCase();
  if (!normalized || normalized.length < 2) return;

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase.from('search_events').insert({
    query: normalized,
    searched_at: new Date().toISOString(),
  });
}

export async function logToolClick(toolId: string, query?: string): Promise<void> {
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase.from('tool_clicks').insert({
    tool_id: toolId,
    query: query?.trim().toLowerCase() || null,
    clicked_at: new Date().toISOString(),
  });
}

export async function logSearch(query: string): Promise<void> {
  const normalized = query.trim().toLowerCase();
  if (!normalized || normalized.length < 2) return;

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Try to insert; if already exists, increment count via RPC
  const { error } = await supabase.from('search_queries').insert({
    query: normalized,
    count: 1,
    last_searched_at: new Date().toISOString(),
  });

  // Duplicate — increment the count instead
  if (error?.code === '23505') {
    await supabase.rpc('increment_search_count', { search_query: normalized });
  }
}

// --- 4. FALLBACK / UTILS ---
export async function searchTools(query: string): Promise<Tool[]> {
  return smartSearch(query);
}

export async function getLatestTools(limit: number = 50): Promise<Tool[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('tools')
    .select(COLUMNS)
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false })
    .limit(limit);
  return (data as Tool[]) || [];
}

// --- 5. PAGINATED LOAD MORE ---
export async function loadMoreTools(offset: number, limit: number = 24): Promise<Tool[]> {
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('tools')
    .select(COLUMNS)
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false })
    .range(offset, offset + limit - 1);

  return (data as Tool[]) || [];
}