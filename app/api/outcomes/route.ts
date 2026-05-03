import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const OutcomeSchema = z.object({
  decision_session_id: z.string().uuid(),
  check_day:           z.union([z.literal(7), z.literal(30)]),
  satisfaction:        z.number().int().min(1).max(5).optional(),
  realized_cost:       z.string().max(100).optional(),
  time_to_value:       z.enum([
    '< 1 week', '1–4 weeks', '1–3 months', 'Still setting up', 'Not yet',
  ]).optional(),
  notes:               z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`outcomes:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = OutcomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Bad request.' }, { status: 400 });
  }

  const { decision_session_id, check_day, satisfaction, realized_cost, time_to_value, notes } = parsed.data;

  const admin = createAdminClient();

  // Verify session belongs to this user
  const { data: session } = await admin
    .from('decision_sessions')
    .select('id')
    .eq('id', decision_session_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }

  const { error } = await admin
    .from('workflow_outcomes')
    .upsert(
      {
        decision_session_id,
        user_id:       user.id,
        check_day,
        satisfaction:  satisfaction  ?? null,
        realized_cost: realized_cost ?? null,
        time_to_value: time_to_value ?? null,
        notes:         notes         ?? null,
      },
      { onConflict: 'decision_session_id,check_day' }
    );

  if (error) {
    console.error('[POST /api/outcomes] upsert:', error.message);
    return NextResponse.json({ error: 'Failed to record outcome.' }, { status: 500 });
  }

  // Refresh outcome signals when a rated outcome is written (fire-and-forget)
  if (satisfaction !== undefined) {
    void admin.rpc('refresh_outcome_signals').then(({ error: e }) => {
      if (e) console.error('[POST /api/outcomes] refresh signals:', e.message);
    });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
