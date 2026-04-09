import { createAdminClient } from '@/utils/supabase/admin';
import HomeClient from '@/components/HomeClient';
import { categoryToSlug } from '@/lib/categories';

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

  const categoryMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const cat = row.main_category;
    if (cat) categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, slug: categoryToSlug(name) }));

  return <HomeClient tools={tools || []} categories={categories} totalCount={totalCount || 0} />;
}
