import { createAdminClient } from '@/utils/supabase/admin';
import HomeClient from '@/components/HomeClient';
import { CATEGORIES, categoryToSlug } from '@/lib/categories';

export default async function Home() {
  const supabase = createAdminClient();

  const [{ data: tools, count: totalCount }, { data: categoryRows }] = await Promise.all([
    supabase
      .from('tools')
      .select('id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date', { count: 'exact' })
      .eq('launch_status', 'Live')
      .order('launch_date', { ascending: false })
      .limit(24),
    supabase
      .from('tools')
      .select('main_category')
      .eq('launch_status', 'Live'),
  ]);

  // Count tools per canonical category only — ignore any non-canonical DB values
  const canonicalNames = new Set(CATEGORIES.map(c => c.name));
  const categoryMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const cat = row.main_category;
    if (cat && canonicalNames.has(cat)) categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }

  // Always show all 12 canonical categories (even if count is 0), sorted by count desc
  const categories = CATEGORIES.map(c => ({
    name: c.name,
    count: categoryMap[c.name] || 0,
    slug: categoryToSlug(c.name),
  })).sort((a, b) => b.count - a.count);

  return <HomeClient tools={tools || []} categories={categories} totalCount={totalCount || 0} />;
}
