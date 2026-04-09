import DashboardClient from '@/components/DashboardClient';
import { quickSearch, getLatestTools } from '@/actions/search';
import { createAdminClient } from '@/utils/supabase/admin';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  const supabase = createAdminClient();

  const [searchResult, { data: categoryRows, count: totalCount }] = await Promise.all([
    query ? quickSearch(query) : getLatestTools(50).then(tools => ({ tools, fuzzy: false })),
    supabase
      .from('tools')
      .select('main_category', { count: 'exact' })
      .eq('launch_status', 'Live'),
  ]);

  const tools = 'tools' in searchResult ? searchResult.tools : searchResult;
  const isFuzzy = 'fuzzy' in searchResult ? searchResult.fuzzy : false;

  // Build category list with counts
  const catMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const c = row.main_category;
    if (c) catMap[c] = (catMap[c] || 0) + 1;
  }
  const allCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <DashboardClient
      initialTools={tools}
      searchQuery={query}
      isFuzzy={isFuzzy}
      allCategories={allCategories}
      totalCount={totalCount || 0}
    />
  );
}
