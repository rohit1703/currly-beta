import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem';
import Link from 'next/link';
import { ArrowLeft, Search, FolderOpen } from 'lucide-react';
import type { Metadata } from 'next';

// 1. Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Capitalize slug for title (e.g., "marketing" -> "Marketing")
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `Best AI Tools for ${categoryName} (2025) | Currly`,
    description: `Discover the top rated AI tools for ${categoryName}. Curated, tested, and reviewed by experts.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools matching the category
  // Note: We use ilike for case-insensitive matching
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .ilike('main_category', `%${slug}%`) // Matches "Marketing" or "Email Marketing"
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center gap-2">
               <FolderOpen className="h-4 w-4 text-blue-600" />
               <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                 {categoryName}
               </h1>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              {tools?.length || 0} tools
            </span>
          </div>
        </div>
      </header>

      {/* --- GRID --- */}
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
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                 <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tools found in {categoryName}</h3>
              <p className="mt-2 text-gray-500">
                We couldn't find any tools tagged with this category yet.
              </p>
              <Link href="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Browse All Tools
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}