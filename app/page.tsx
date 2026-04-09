import { createAdminClient } from '@/utils/supabase/admin';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  const supabase = createAdminClient();

  // No launch_status column exists — fetch all tools
  const [{ data: tools, count: totalCount }, { data: categoryRows }] = await Promise.all([
    supabase
      .from('tools')
      .select('id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date', { count: 'exact' })
      .order('launch_date', { ascending: false })
      .limit(24),
    supabase
      .from('tools')
      .select('main_category'),
  ]);

  const categoryMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const cat = row.main_category;
    if (cat) categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, slug: name.toLowerCase() }));

  return <HomeClient tools={tools || []} categories={categories} totalCount={totalCount || 0} />;
}
