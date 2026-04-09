import { createAdminClient } from '@/utils/supabase/admin';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  // Use admin client to bypass RLS — homepage shows public tool data to everyone
  const supabase = createAdminClient();

  const [{ data: tools }, { data: categoryRows }] = await Promise.all([
    supabase
      .from('tools')
      .select('id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date')
      .or('launch_status.eq.Live,launch_status.is.null')
      .order('launch_date', { ascending: false })
      .limit(24),
    supabase
      .from('tools')
      .select('main_category')
      .or('launch_status.eq.Live,launch_status.is.null'),
  ]);

  // Build category counts from actual data
  const categoryMap: Record<string, number> = {};
  for (const row of categoryRows || []) {
    const cat = row.main_category;
    if (cat) categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, slug: name.toLowerCase() }));

  return <HomeClient tools={tools || []} categories={categories} />;
}
