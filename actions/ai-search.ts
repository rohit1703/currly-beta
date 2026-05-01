'use server';

import OpenAI from 'openai';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { Tool } from '@/types';
import { CATEGORIES } from '@/lib/categories';
import { rateLimit } from '@/lib/rate-limit';

const COLUMNS = 'id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date, is_featured';

export interface SearchIntent {
  terms: string[];
  category: string | null;
  pricing: string[] | null;
  summary: string;
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

// Reciprocal Rank Fusion — merges ranked lists into one scored list
function rrfMerge(lists: Tool[][], k = 60): Tool[] {
  const scores = new Map<string, number>();
  const byId = new Map<string, Tool>();

  for (const list of lists) {
    list.forEach((tool, i) => {
      const key = String(tool.id);
      scores.set(key, (scores.get(key) ?? 0) + 1 / (k + i + 1));
      byId.set(key, tool);
    });
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => byId.get(id)!)
    .filter(Boolean)
    .slice(0, 20);
}

// Full hybrid search — cached 1h per query
const runHybridSearch = unstable_cache(
  async (query: string): Promise<AISearchResult> => {
    const supabase = createPublicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Intent parse and embedding run in parallel — both cached independently
    const [intent, embedding] = await Promise.all([
      parseIntent(query),
      getEmbedding(query),
    ]);

    // FTS on expanded terms + optional category filter
    const ftsQuery = intent.terms.join(' | ');
    let ftsReq = supabase
      .from('tools')
      .select(COLUMNS)
      .eq('launch_status', 'Live')
      .textSearch('fts', ftsQuery, { type: 'websearch', config: 'english' })
      .limit(20);

    if (intent.category) ftsReq = ftsReq.eq('main_category', intent.category);

    // Vector search on original query
    const vectorReq = embedding
      ? supabase.rpc('match_tools', { query_embedding: embedding, match_threshold: 0.25, match_count: 20 })
      : Promise.resolve({ data: [] as any[] });

    const [ftsRes, vectorRes] = await Promise.all([ftsReq, vectorReq]);

    let ftsTools = (ftsRes.data || []) as Tool[];
    let vectorTools = (vectorRes.data || []) as Tool[];

    // Apply pricing filter as post-process (works across both result sets)
    if (intent.pricing?.length) {
      const filter = (t: Tool) => {
        const pm = t.pricing_model?.toLowerCase() ?? '';
        return intent.pricing!.some(p => pm.includes(p.toLowerCase()));
      };
      ftsTools = ftsTools.filter(filter);
      vectorTools = vectorTools.filter(filter);
    }

    let tools: Tool[];

    if (ftsTools.length > 0 || vectorTools.length > 0) {
      tools = rrfMerge([ftsTools, vectorTools]);
    } else {
      // Fallback: ilike on expanded terms without strict filters
      const fallbackQuery = intent.terms.map(t => `name.ilike.%${t}%,description.ilike.%${t}%`).join(',');
      const { data } = await supabase
        .from('tools')
        .select(COLUMNS)
        .eq('launch_status', 'Live')
        .or(fallbackQuery)
        .limit(20);
      tools = (data || []) as Tool[];
    }

    return { tools, intent };
  },
  ['hybrid-search'],
  { revalidate: 3600, tags: ['tools'] }
);

export async function aiSearch(query: string): Promise<AISearchResult> {
  if (!query) return { tools: [], intent: EMPTY_INTENT };

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return { tools: [], intent: EMPTY_INTENT };
  }

  return runHybridSearch(query);
}
