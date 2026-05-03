import DashboardClient from '@/components/DashboardClient';
import { getLatestTools, getToolsByCategory } from '@/actions/search';
import { personalizedSearch } from '@/actions/ai-search';
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
      ? getToolsByCategory(category).then(tools => ({ tools, intent: null }))
      : query
      ? personalizedSearch(query)
      : getLatestTools(50).then(tools => ({ tools, intent: null })),
    supabase
      .from('tools')
      .select('main_category', { count: 'exact' })
      .eq('launch_status', 'Live'),
    userSupabase.auth.getUser(),
  ]);

  const tools = searchResult.tools;
  const searchIntent = 'intent' in searchResult ? searchResult.intent : null;

  // Build category list — only the 12 canonical categories with live counts
  const canonicalNames = new Set(CATEGORIES.map(c => c.name));
  const catMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const c = row.main_category;
    if (c && canonicalNames.has(c)) catMap[c] = (catMap[c] || 0) + 1;
  }
  const allCategories = CATEGORIES.map(c => ({ name: c.name, count: catMap[c.name] || 0 }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Fetch collections + saved tool map for this user
  let userCollections: { id: string; name: string }[] = [];
  let savedToolMap: Record<string, string[]> = {};
  if (user) {
    const { data: cols } = await supabase
      .from('collections')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    userCollections = (cols || []).map((c: any) => ({ id: c.id, name: c.name }));
    if (userCollections.length > 0) {
      const { data: ctRows } = await supabase
        .from('collection_tools')
        .select('tool_id, collection_id')
        .in('collection_id', userCollections.map(c => c.id));
      for (const row of ctRows || []) {
        (savedToolMap[(row as any).tool_id] ??= []).push((row as any).collection_id);
      }
    }
  }

  return (
    <DashboardClient
      initialTools={tools}
      searchQuery={query}
      searchIntent={searchIntent}
      allCategories={allCategories}
      totalCount={totalCount || 0}
      isLoggedIn={!!user}
      userCollections={userCollections}
      savedToolMap={savedToolMap}
      initialCategory={category}
    />
  );
}
