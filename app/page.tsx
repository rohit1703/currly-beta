import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import HomeClient from '@/components/HomeClient'; // Import your UI

export default async function Home() {
  // 1. Fetch Data on the Server
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('launch_status', 'Live')
    .order('launch_date', { ascending: false });

  // 2. Pass Data to your Design Component
  return <HomeClient tools={tools || []} />;
}