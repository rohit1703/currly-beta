import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem';
import Link from 'next/link';
import { ArrowLeft, Search, FolderOpen, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

// 1. Dynamic SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Best ${categoryName} AI Tools (2025) | Currly`,
    description: `Discover the top rated AI tools for ${categoryName}. Curated, tested, and reviewed by experts.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools (Case Insensitive)
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .ilike('main_category', `%${slug}%`)
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-black dark:text-white font-sans selection:bg-[#0066FF] selection:text-white overflow-x-hidden transition-colors duration-300">
      
      {/* --- LIGHTHOUSE BEAM (Consistent with Home) --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0066FF] opacity-5 dark:opacity-20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/50 backdrop-blur-xl px-6 py-5 transition-colors">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
             <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* --- HEADER --- */}
      <header className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white dark:bg-[#0066FF]/10 dark:border-[#0066FF]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-6 shadow-sm">
          <FolderOpen className="h-3 w-3" /> Category
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black dark:text-white">
          {categoryName} <span className="text-gray-400 dark:text-gray-600">Tools</span>
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {tools?.length || 0} curated tools found
        </p>
      </header>

      {/* --- GRID --- */}
      <main className="container mx-auto px-4 pb-32 relative z-10">
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

          {/* Empty State (Premium Design) */}
          {(!tools || tools.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/5">
              <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-white/5">
                 <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">No tools found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                We couldn't find any tools tagged with <strong>"{categoryName}"</strong> yet. <br/>
                Our curators are adding new tools every Sunday.
              </p>
              <Link href="/" className="rounded-full bg-[#0066FF] px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                Browse All Tools
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}