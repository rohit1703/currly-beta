import DashboardClient from '@/components/DashboardClient';
import { quickSearch, getLatestTools } from '@/actions/search';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  // Only run fast text search server-side — page renders instantly.
  // Semantic (vector) search runs client-side after mount and silently upgrades results.
  const tools = query ? await quickSearch(query) : await getLatestTools(50);

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}
