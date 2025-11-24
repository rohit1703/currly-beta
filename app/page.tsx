import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export default async function Home() {
  // 1. Initialize Supabase Client (Server Side)
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools from DB
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    //.eq('launch_status', 'Live') // Uncomment this once you are ready to filter by status
    .order('launch_date', { ascending: false });

  if (error) {
    console.error('Error fetching tools:', error);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-white pt-24 pb-16 dark:border-gray-800 dark:bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400">
            <Sparkles className="mr-2 h-4 w-4" />
            The World's First AI Tools Discovery Engine
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-6xl">
            Discover the best <span className="text-blue-600">AI Tools</span> <br />
            for your workflow.
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Currly tracks over 700+ AI tools to help you find exactly what you need. 
            Stop searching, start building.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
              Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <button className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
              <Search className="mr-2 h-4 w-4" /> Search Tools
            </button>
          </div>
        </div>
      </section>

      {/* --- TOOLS GRID --- */}
      <section className="container mx-auto py-16 px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
          <span className="text-sm text-gray-500">{tools?.length || 0} tools indexed</span>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools?.map((tool) => (
            <ToolCard 
              key={tool.id}
              title={tool.name || 'Untitled Tool'}
              description={tool.description || 'No description available.'}
              category={tool.main_category || 'Uncategorized'}
              pricing={tool.pricing_model || 'Unknown'} 
              image={tool.image_url || ''}
              url={tool.website || '#'}
            />
          ))}
          
          {(!tools || tools.length === 0) && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No tools found. Try running the sync API!
            </div>
          )}
        </div>
      </section>
    </main>
  );
}