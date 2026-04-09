import DashboardClient from '@/components/DashboardClient';
import { quickSearch, smartSearch, getLatestTools } from '@/actions/search';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';

  let tools;

  if (query) {
    // Run both in parallel
    const [semanticResults, textResults] = await Promise.all([
      smartSearch(query),
      quickSearch(query),
    ]);

    // Merge: semantic results first (already ranked by similarity score),
    // then append any text-only matches not already in the semantic set.
    const seenIds = new Set(semanticResults.map((t: any) => t.id));
    const textOnly = textResults.filter((t: any) => !seenIds.has(t.id));
    tools = [...semanticResults, ...textOnly];
  } else {
    tools = await getLatestTools(50);
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}
