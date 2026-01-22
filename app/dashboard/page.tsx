import DashboardClient from '@/components/DashboardClient';
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
    // Uses the cached fast search for < 100ms load times
    tools = await quickSearch(query);
  } else {
    tools = await getLatestTools(50);
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}