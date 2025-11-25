import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCardItem'; 
import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  // 1. Initialize Supabase
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Build Query
  let dbQuery = supabase
    .from('tools')
    .select('*')
    .order('launch_date', { ascending: false });

  // 3. Search Logic
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,main_category.ilike.%${query}%`);
  }

  const { data: tools, error } = await dbQuery;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {query ? `Results for "${query}"` : 'All Tools'}
            </h1>
          </div>
        </div>
      </header>

      {/* Grid */}
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
              slug={tool.slug} // <--- CRITICAL: Passing the slug here too
            />
          ))}

          {(!tools || tools.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <Search className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tools found</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}