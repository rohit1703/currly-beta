import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem'; // Using the component we fixed earlier
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  LayoutGrid, 
  Filter, 
  Zap, 
  Menu,
  Globe
} from 'lucide-react';

export default async function Home() {
  // 1. Initialize Supabase (Next.js 16 Safe)
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('launch_status', 'Live') // Only show live tools
    .order('launch_date', { ascending: false });

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black md:block">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <span className="font-bold">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Currly</span>
        </div>

        <nav className="space-y-6">
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">Discover</h3>
            <div className="space-y-1">
              <button className="flex w-full items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <LayoutGrid className="h-4 w-4" />
                All Tools
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">
                <Sparkles className="h-4 w-4" />
                Featured
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800">
                <Globe className="h-4 w-4" />
                Global Top 10
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-400">Filters</h3>
            <div className="space-y-1">
              {/* Placeholder filters for Sprint 2 */}
              <div className="px-3 py-2 text-sm text-gray-500">Price Model</div>
              <div className="px-3 py-2 text-sm text-gray-500">Team Size</div>
              <div className="px-3 py-2 text-sm text-gray-500">Industry</div>
            </div>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1">
        
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
          <div className="flex flex-1 items-center gap-4">
            <button className="md:hidden">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search 700+ AI tools..." 
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black">
              Sign In
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover AI Tools</h1>
              <p className="text-sm text-gray-500">The world's first AI tools discovery engine.</p>
            </div>
            
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-black dark:text-gray-300">
                <Filter className="h-4 w-4" /> Filters
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools?.map((tool) => (
              <ToolCard 
                key={tool.id}
                title={tool.name || 'Untitled'}
                description={tool.description || ''}
                category={tool.main_category || 'General'}
                pricing={tool.pricing_model || 'Unknown'} 
                image={tool.image_url || ''}
                url={tool.website || '#'}
              />
            ))}
            
            {(!tools || tools.length === 0) && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-4 dark:bg-blue-900/20">
                  <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Database is Empty</h3>
                <p className="max-w-md text-gray-500">
                  Add the <strong>SUPABASE_SERVICE_ROLE_KEY</strong> to Vercel and run the sync API to populate your 700+ tools.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}