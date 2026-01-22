import DashboardClient from '@/components/DashboardClient';
import { quickSearch, getLatestTools } from '@/actions/search'; // Import quickSearch

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  
  let tools;

  if (query) {
    // STRATEGY: Use Quick Search (Text) for immediate HTML render.
    // The Client will assume responsibility for "upgrading" to Vector results.
    tools = await quickSearch(query);
  } else {
    tools = await getLatestTools(50);
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}