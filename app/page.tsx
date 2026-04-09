import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  // 1. Initialize Supabase securely on the server
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools (Only 'Live' ones, newest first — no embedding column, capped at 24)
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date')
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false })
    .limit(24);

  if (error) {
    console.error("Error fetching tools for homepage:", error);
  }

  // 3. Pass data to the Client Component (Your Design)
  return <HomeClient tools={tools || []} />;
}