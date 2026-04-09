import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://currly-beta.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: tools } = await supabase
    .from('tools')
    .select('slug, launch_date, main_category')
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  // Derive unique categories from actual tools in DB
  const categorySet = new Set(
    (tools || []).map((t) => t.main_category?.toLowerCase()).filter(Boolean)
  );

  const toolUrls: MetadataRoute.Sitemap = (tools || []).map((tool) => ({
    url: `${baseUrl}/tool/${tool.slug}`,
    lastModified: new Date(tool.launch_date || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = Array.from(categorySet).map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  return [...staticRoutes, ...categoryUrls, ...toolUrls];
}
