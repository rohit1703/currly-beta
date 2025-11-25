import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem'; // Importing the fixed component
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, Zap, Filter, Globe, Code, LayoutGrid, PenTool } from 'lucide-react';

export default async function Home() {
  // 1. Initialize Supabase
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools (Including the SLUG)
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-white font-sans">
      
      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Currly</span>
          </Link>
          <div className="flex items-center gap-4">
             {/* You can add ThemeToggle here if you have the component */}
            <Link href="/dashboard" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="pt-40 pb-20 px-4 text-center max-w-7xl mx-auto relative">
        
        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-white/10 rounded-full mb-8 border border-blue-100 dark:border-white/10">
          <Globe className="w-4 h-4 text-[#0066FF] dark:text-white" />
          <span className="text-xs font-bold uppercase tracking-wide text-[#0066FF] dark:text-white">The World's First AI Tools Search Engine</span>
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tighter text-gray-900 dark:text-white">
          Discover the Perfect <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-500">AI Tool in Seconds</span>
        </h1>

        <p className="relative text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          Stop searching. Start building. <br className="hidden md:block"/>
          <span className="text-gray-900 dark:text-white font-bold">712+ tools</span> curated by experts.
        </p>

        {/* Simple Search Form */}
        <div className="relative max-w-3xl mx-auto mb-24 z-10">
          <form action="/dashboard" className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0066FF] to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative flex items-center gap-4 bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-white/10">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input 
                name="q"
                type="text" 
                placeholder="Describe your problem (e.g. 'I need to automate invoices')..."
                className="flex-1 text-lg bg-transparent border-none focus:ring-0 outline-none h-12 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* --- TOOLS GRID --- */}
      <section className="container mx-auto py-16 px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
          <span className="text-sm text-gray-500">{tools?.length || 0} tools indexed</span>
        </div>

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
              slug={tool.slug}  // <--- CRITICAL: Passing the slug here
            />
          ))}
          
          {(!tools || tools.length === 0) && (
             <div className="col-span-full text-center py-20">
               <p className="text-gray-500">Database is empty. Please run the sync API.</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
}