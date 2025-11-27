import DashboardClient from '@/components/DashboardClient';
import { searchTools, getLatestTools } from '@/actions/search';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  
  let tools;

  if (query) {
    // Use the new Server Action
    tools = await searchTools(query);
  } else {
    // Use the new Server Action
    tools = await getLatestTools(50);
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}