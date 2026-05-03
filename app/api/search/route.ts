import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { runRankedSearch } from '@/actions/ai-search';
import { getCachedTextSearch, getSuggestions } from '@/actions/search';

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
    if (mode === 'autocomplete') {
      const suggestions = await getSuggestions(q);
      return NextResponse.json({ tools: [], suggestions, intent: null, fuzzy: false });
    }

    if (mode === 'quick') {
      const { tools, fuzzy } = await getCachedTextSearch(q);
      return NextResponse.json({ tools, intent: null, fuzzy });
    }

    // hybrid (default)
    const { tools, intent } = await runRankedSearch(
      q,
      filters?.category ?? null,
      filters?.pricing  ?? null,
      page,
      pageSize,
    );
    return NextResponse.json({ tools, intent, fuzzy: false });
  } catch (err) {
    console.error('[POST /api/search]', { mode, q: q.slice(0, 100) }, err);
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 });
  }
}
