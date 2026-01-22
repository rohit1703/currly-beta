import DashboardClient from '@/components/DashboardClient';
// CRITICAL: Import quickSearch for the initial load
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
    // FIX: Use quickSearch here. 
    // This is the "Text-Only" search that runs in < 200ms.
    // The DashboardClient will handle the "Smart Search" upgrade.
    tools = await quickSearch(query);
  } else {
    tools = await getLatestTools(50);
  }

  // We pass these "fast" results to the client immediately
  return <DashboardClient initialTools={tools} searchQuery={query} />;
}