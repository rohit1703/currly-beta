import DashboardClient from '@/components/DashboardClient';
import { quickSearch, getLatestTools } from '@/actions/search';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  const supabase = createAdminClient();
  const userSupabase = createClient(await cookies());

  const [searchResult, { data: categoryRows, count: totalCount }, { data: { user } }] = await Promise.all([
    query ? quickSearch(query) : getLatestTools(50).then(tools => ({ tools, fuzzy: false })),
    supabase
      .from('tools')
      .select('main_category', { count: 'exact' })
      .eq('launch_status', 'Live'),
    userSupabase.auth.getUser(),
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
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  // Fetch saved tool IDs for this user
  let savedToolIds: string[] = [];
  if (user) {
    const { data: saved } = await userSupabase
      .from('saved_tools')
      .select('tool_id')
      .eq('user_id', user.id);
    savedToolIds = (saved || []).map((s: any) => s.tool_id);
  }

  return (
    <DashboardClient
      initialTools={tools}
      searchQuery={query}
      isFuzzy={isFuzzy}
      allCategories={allCategories}
      totalCount={totalCount || 0}
      isLoggedIn={!!user}
      savedToolIds={savedToolIds}
    />
  );
}
