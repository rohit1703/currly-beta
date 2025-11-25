import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem'; 
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, Zap, Filter } from 'lucide-react';

export default async function Home() {
  // 1. Initialize Supabase (Next.js 16 Safe)
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      
      {/* --- NAVBAR --- */}
      <nav className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-gray-800 dark:bg-black">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <span className="font-bold">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Currly</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white">
            For Creators
          </Link>
          <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black">
            Sign In
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION (The part you were missing) --- */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-white pt-24 pb-20 dark:border-gray-800 dark:bg-black">
        <div className="container mx-auto px-4 text-center">
          
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400">
            <Sparkles className="mr-2 h-4 w-4" />
            The World's First AI Tools Discovery Engine
          </div>
          
          {/* Headline */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white md:text-7xl">
            Discover the best <span className="text-blue-600">AI Tools</span> <br />
            for your workflow.
          </h1>
          
          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Currly tracks over 700+ AI tools to help you find exactly what you need. 
            Stop searching, start building.
          </p>

          {/* Centered Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for 'video editor', 'chatbot', or 'coding assistant'..." 
                className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 pl-12 pr-4 text-lg outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
              <button className="absolute right-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                Search
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span>Popular:</span>
              <span className="cursor-pointer hover:text-blue-600">ChatGPT</span>
              <span className="cursor-pointer hover:text-blue-600">Midjourney</span>
              <span className="cursor-pointer hover:text-blue-600">Notion AI</span>
              <span className="cursor-pointer hover:text-blue-600">Jasper</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- TOOLS GRID SECTION --- */}
      <section className="container mx-auto py-16 px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
          <div className="flex items-center gap-3">
             <span className="text-sm text-gray-500">{tools?.length || 0} tools indexed</span>
             <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-black dark:text-gray-300">
                <Filter className="h-4 w-4" /> Filters
              </button>
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          
          {/* Empty State */}
          {(!tools || tools.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 rounded-full bg-blue-50 p-6 dark:bg-blue-900/20">
                 <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Database is Empty</h3>
              <p className="mt-2 max-w-md text-gray-500">
                Add the <strong>SUPABASE_SERVICE_ROLE_KEY</strong> to Vercel and run the sync API to populate your tools.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}