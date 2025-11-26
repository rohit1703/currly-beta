import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import DashboardClient from '@/components/DashboardClient';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  let tools: any[] = [];

  // 1. AI SEARCH LOGIC
  if (query) {
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: query,
          encoding_format: 'float',
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;

        // Search via Vector RPC
        const { data, error } = await supabase.rpc('match_tools', {
          query_embedding: queryEmbedding,
          match_threshold: 0.01,
          match_count: 50
        });

        if (!error) tools = data || [];
      } catch (err) {
        console.error("Vector search failed:", err);
      }
    }
    
    // Fallback to text search if AI fails or finds nothing
    if (tools.length === 0) {
      const { data } = await supabase
        .from('tools')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);
      tools = data || [];
    }
  } else {
    // Default View
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('launch_date', { ascending: false })
      .limit(50);
    tools = data || [];
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}