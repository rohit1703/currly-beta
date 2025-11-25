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

  // 2. Build the Database Query
  // We removed the .eq('launch_status') filter because the data is already filtered at the source
  let dbQuery = supabase
    .from('tools')
    .select('*')
    .order('launch_date', { ascending: false });

  // 3. Apply Search Filter (if query exists)
  if (query) {
    // This searches Name OR Description OR Category (case insensitive)
    dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,main_category.ilike.%${query}%`);
  }

  // 4. Fetch Data
  const { data: tools, error } = await dbQuery;

  if (error) {
    console.error("Search Error:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      
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
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {query ? `Results for "${query}"` : 'All Tools'}
            </h1>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              {tools?.length || 0} found
            </span>
          </div>
        </div>
      </header>

      {/* --- RESULTS GRID --- */}
      <main className="container mx-auto py-10 px-4">
        
        {/* Results */}
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
            />
          ))}

          {/* Empty State */}
          {(!tools || tools.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
                 <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tools found</h3>
              <p className="mt-2 text-gray-500">
                We couldn't find anything matching "{query}". <br />
                Try searching for a category like "Marketing" or "Video".
              </p>
              <Link href="/" className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Clear Search
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}