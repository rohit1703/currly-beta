import DashboardClient from '@/components/DashboardClient';
// CHANGE: Import quickSearch
import { quickSearch, getLatestTools } from '@/actions/search'; 

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  
  let tools;

  if (query) {
    // CHANGE: Use quickSearch (Fast Text) instead of searchTools (Slow AI)
    tools = await quickSearch(query);
  } else {
    tools = await getLatestTools(50);
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}