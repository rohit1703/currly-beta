'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Tool } from '@/types';
import { unstable_cache } from 'next/cache';

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

const COLUMNS = 'id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date';

// --- 1. FAST SEARCH (Text Only - Instant & Cached) ---
// We use createPublicClient here because unstable_cache cannot access request cookies.
export async function quickSearch(query: string): Promise<Tool[]> {
  if (!query) return [];

  const getCachedText = unstable_cache(
    async (q: string) => {
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

        if (ftsData && ftsData.length > 0) return ftsData as Tool[];
      }

      // Step 2: FTS returned nothing — fall back to broad ilike search
      const terms = (keywords || q).split(/\s+/).filter(Boolean);
      const primaryTerm = terms[0];
      if (!primaryTerm) return [];

      const { data: fallbackData } = await supabase
        .from('tools')
        .select(COLUMNS)
        .or(
          terms.map(t => `name.ilike.%${t}%,description.ilike.%${t}%`).join(',')
        )
        .limit(20);

      return (fallbackData as Tool[]) || [];
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
export async function getSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('tools')
    .select('name')
    .ilike('name', `%${query}%`)
    .limit(6);

  return (data || []).map((t: any) => t.name);
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
    .select('id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date')
    .order('launch_date', { ascending: false })
    .limit(limit);
  return (data as Tool[]) || [];
}