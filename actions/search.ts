'use server';

import { createClient } from '@/utils/supabase/server'; //
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Tool } from '@/types'; //

export async function searchTools(query: string): Promise<Tool[]> {
  if (!query) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Try Semantic Search (Vector) if Key exists
    // This part remains unchanged to keep your "hybrid" search power.
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float',
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      const { data, error } = await supabase.rpc('match_tools', {
        query_embedding: queryEmbedding,
        match_threshold: 0.01, // Low threshold to ensure results
        match_count: 20
      });

      // If vector search finds good matches, return them immediately
      if (!error && data && data.length > 0) {
        return data as Tool[];
      }
    }

    // 2. Fallback to Full Text Search (Optimized)
    // REPLACED: The old .or(ilike) query with .textSearch()
    // This uses the 'fts' column index for vastly improved performance.
    const { data } = await supabase
      .from('tools')
      .select('*')
      .textSearch('fts', query, {
        type: 'websearch', // Supports operators like "quoted phrase" or -exclusion
        config: 'english'
      })
      .limit(20);
      
    return (data as Tool[]) || [];

  } catch (error) {
    console.error("Search Action Failed:", error);
    return [];
  }
}

export async function getLatestTools(limit: number = 50): Promise<Tool[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from('tools')
    .select('*')
    .order('launch_date', { ascending: false })
    .limit(limit);

  return (data as Tool[]) || [];
}