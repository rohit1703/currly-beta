import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { runRankedSearch } from '@/actions/ai-search';
import { getCachedTextSearch, getSuggestions } from '@/actions/search';
import { createAdminClient } from '@/utils/supabase/admin';

const RequestSchema = z.object({
  q:        z.string().min(1).max(500).trim(),
  mode:     z.enum(['hybrid', 'quick', 'autocomplete']).default('hybrid'),
  page:     z.number().int().min(1).max(100).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
  filters:  z.object({
    category: z.string().nullable().optional(),
    pricing:  z.array(z.string()).nullable().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = RequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? 'Bad request.' }, { status: 400 });
  }

  const { q, mode, page, pageSize, filters } = result.data;

  try {
    let response: NextResponse;

    if (mode === 'autocomplete') {
      const suggestions = await getSuggestions(q);
      response = NextResponse.json({ tools: [], suggestions, intent: null, fuzzy: false });
    } else if (mode === 'quick') {
      const { tools, fuzzy } = await getCachedTextSearch(q);
      response = NextResponse.json({ tools, intent: null, fuzzy });
    } else {
      // hybrid (default)
      const { tools, intent } = await runRankedSearch(
        q,
        filters?.category ?? null,
        filters?.pricing  ?? null,
        page,
        pageSize,
      );
      response = NextResponse.json({ tools, intent, fuzzy: false });
    }

    // Fire-and-forget usage log — does not block the response
    void logUsage(q, mode);

    return response;
  } catch (err) {
    console.error('[POST /api/search]', { mode, q: q.slice(0, 100) }, err);
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 });
  }
}

async function logUsage(query: string, mode: string) {
  try {
    await createAdminClient().from('api_usage').insert({
      user_id:  null,
      endpoint: 'search',
      query:    query.slice(0, 200),
      mode,
    });
  } catch {
    // telemetry is non-critical — silently ignore failures
  }
}
