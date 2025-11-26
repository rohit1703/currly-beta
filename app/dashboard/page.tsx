import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem'; 
import Link from 'next/link';
import { Search, ArrowLeft, Sparkles } from 'lucide-react';
import OpenAI from 'openai';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  // 1. Initialize Clients
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  let tools: any[] = [];
  let searchMethod = "Latest";

  // 2. Search Logic
  if (query) {
    searchMethod = "AI Semantic Match";
    
    // A. Initialize OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
      // B. Convert Query to Vector
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float',
      });
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // C. Search Supabase via RPC (Vector Match)
      const { data, error } = await supabase.rpc('match_tools', {
        query_embedding: queryEmbedding,
        match_threshold: -1, // Lower threshold to allow broader matches
        match_count: 20
      });

      if (error) throw error;
      tools = data || [];

    } catch (err) {
      console.error("Vector search failed, falling back to text:", err);
      // Fallback to text search if OpenAI fails
      const { data } = await supabase
        .from('tools')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,main_category.ilike.%${query}%`)
        .limit(20);
      tools = data || [];
    }

  } else {
    // Default: Show Latest
    const { data } = await supabase
      .from('tools')
      .select('*')
      .order('launch_date', { ascending: false })
      .limit(50);
    tools = data || [];
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-black dark:text-white font-sans selection:bg-[#0066FF] selection:text-white">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/80 px-6 py-4 backdrop-blur-md transition-colors">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 rounded-lg p-2 text-sm font-bold text-gray-600 hover:text-[#0066FF] dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-black dark:text-white leading-none">
                {query ? `"${query}"` : 'All Tools'}
              </h1>
              {query && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066FF] flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3" /> {searchMethod}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <form action="/dashboard" className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input 
                name="q"
                type="text" 
                placeholder="Search again..." 
                defaultValue={query}
                className="h-10 w-64 rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 dark:border-white/10 dark:bg-white/5 dark:text-white transition-all"
              />
            </form>
          </div>
        </div>
      </header>

      {/* --- RESULTS GRID --- */}
      <main className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools?.map((tool) => (
            <ToolCard 
              key={tool.id}
              title={tool.name || 'Untitled'}
              description={tool.description || ''}
              category={tool.main_category || 'General'}
              pricing={tool.pricing_model || 'Unknown'} 
              image={tool.image_url || ''}
              url={tool.website || '#'}
              slug={tool.slug}
            />
          ))}

          {/* Empty State */}
          {(!tools || tools.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
              <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-white/5">
                 <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-2">No tools found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                We couldn&apos;t find any tools matching your search. <br />
                Try broader terms like &quot;Video&quot; or &quot;Writing&quot;.
              </p>
              <Link href="/" className="rounded-full bg-[#0066FF] px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Clear Search
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}