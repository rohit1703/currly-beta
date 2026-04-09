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
    // Run semantic and text search in parallel
    const [semanticResults, textResults] = await Promise.all([
      smartSearch(query),
      quickSearch(query),
    ]);

    // Prefer semantic results — they understand intent, not just keywords
    // Fall back to text results if semantic search has no embeddings yet
    if (semanticResults.length > 0) {
      tools = semanticResults;
    } else {
      tools = textResults;
    }
  } else {
    tools = await getLatestTools(50);
  }

  return <DashboardClient initialTools={tools} searchQuery={query} />;
}
