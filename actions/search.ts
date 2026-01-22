'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Tool } from '@/types';
import { unstable_cache } from 'next/cache';

// 1. FAST SEARCH (Text Only - Instant & Cached)
// This is what the Page loads initially. It must be < 200ms.
export async function quickSearch(query: string): Promise<Tool[]> {
  if (!query) return [];

  const getCachedText = unstable_cache(
    async (q: string) => {
      const supabase = createClient(await cookies());
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

// 2. SMART SEARCH (Vector Only - Slow but Better)
// This is what the Client calls in the background.
export async function smartSearch(query: string): Promise<Tool[]> {
  if (!query || !process.env.OPENAI_API_KEY) return [];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const supabase = createClient(await cookies());

  try {
    // This await is what causes the 1s+ delay
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

// 3. Fallback / Legacy
export async function searchTools(query: string): Promise<Tool[]> {
  // We default to smart search for legacy calls, 
  // but the UI should prefer splitting them.
  return smartSearch(query);
}

export async function getLatestTools(limit: number = 50): Promise<Tool[]> {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from('tools')
    .select('*')
    .order('launch_date', { ascending: false })
    .limit(limit);
  return (data as Tool[]) || [];
}