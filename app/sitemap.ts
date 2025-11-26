import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Define your Base URL (Change this to your actual domain when you buy one)
  const baseUrl = 'https://currly-beta.vercel.app'; 

  // 2. Initialize Supabase
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 3. Fetch ALL Tools (Slug and Update Time)
  const { data: tools } = await supabase
    .from('tools')
    .select('slug, launch_date')
    // .eq('launch_status', 'Live') // Uncomment if you have a status column
    .order('launch_date', { ascending: false });

  // 4. Generate Tool URLs
  const toolUrls = (tools || []).map((tool) => ({
    url: `${baseUrl}/tool/${tool.slug}`,
    lastModified: new Date(tool.launch_date || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 5. Generate Category URLs (Static list for now, or fetch from DB)
  const categories = ['marketing', 'coding', 'video', 'productivity', 'design', 'writing'];
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 6. Static Pages
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  return [...staticRoutes, ...categoryUrls, ...toolUrls];
}