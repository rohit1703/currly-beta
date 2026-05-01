import DashboardClient from '@/components/DashboardClient';
import { quickSearch, getLatestTools, getToolsByCategory } from '@/actions/search';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CATEGORIES } from '@/lib/categories';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const category = params.category || '';

  const supabase = createAdminClient();
  const userSupabase = createClient(await cookies());

  const [searchResult, { data: categoryRows, count: totalCount }, { data: { user } }] = await Promise.all([
    category
      ? getToolsByCategory(category).then(tools => ({ tools, fuzzy: false }))
      : query
      ? quickSearch(query)
      : getLatestTools(50).then(tools => ({ tools, fuzzy: false })),
    supabase
      .from('tools')
      .select('main_category', { count: 'exact' })
      .eq('launch_status', 'Live'),
    userSupabase.auth.getUser(),
  ]);

  const tools = 'tools' in searchResult ? searchResult.tools : searchResult;
  const isFuzzy = 'fuzzy' in searchResult ? searchResult.fuzzy : false;

  // Build category list with counts — only canonical categories, always exactly 12
  const canonicalNames = new Set(CATEGORIES.map(c => c.name));
  const catMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const c = row.main_category;
    if (c && canonicalNames.has(c)) catMap[c] = (catMap[c] || 0) + 1;
  }
  const allCategories = CATEGORIES.map(c => ({ name: c.name, count: catMap[c.name] || 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
      initialCategory={category}
    />
  );
}
