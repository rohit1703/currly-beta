import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  // 1. Initialize Supabase securely on the server
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools (Only 'Live' ones, newest first)
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  if (error) {
    console.error("Error fetching tools for homepage:", error);
  }

  // 3. Pass data to the Client Component (Your Design)
  return <HomeClient tools={tools || []} />;
}