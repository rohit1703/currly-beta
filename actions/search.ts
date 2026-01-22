'use server';

import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Tool } from '@/types';
import { unstable_cache } from 'next/cache';

// --- 1. FAST SEARCH (Text Only - Instant & Cached) ---
// We use createPublicClient here because unstable_cache cannot access request cookies.
export async function quickSearch(query: string): Promise<Tool[]> {
  if (!query) return [];

  const getCachedText = unstable_cache(
    async (q: string) => {
      // Initialize a basic client without cookies for caching public data
      const supabase = createPublicClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from('tools')
        .select('*')
        .textSearch('fts', q, {
          type: 'websearch',
          config: 'english'
        })
        .limit(20);
      return (data as Tool[]) || [];
    },
    ['text-search'], 
    { revalidate: 3600, tags: ['tools'] }
  );

  return getCachedText(query);
}

// --- 2. SMART SEARCH (Vector Only - Slow but Better) ---
// This is called dynamically by the client, so it can use the standard server client.
export async function smartSearch(query: string): Promise<Tool[]> {
  if (!query || !process.env.OPENAI_API_KEY) return [];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  try {
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    const { data, error } = await supabase.rpc('match_tools', {
      query_embedding: queryEmbedding,
      match_threshold: 0.01,
      match_count: 20
    });

    if (error) console.error("Vector match error:", error);
    return (data as Tool[]) || [];
  } catch (err) {
    console.error("OpenAI error:", err);
    return [];
  }
}

// --- 3. FALLBACK / UTILS ---
export async function searchTools(query: string): Promise<Tool[]> {
  return smartSearch(query);
}

export async function getLatestTools(limit: number = 50): Promise<Tool[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase
    .from('tools')
    .select('*')
    .order('launch_date', { ascending: false })
    .limit(limit);
  return (data as Tool[]) || [];
}