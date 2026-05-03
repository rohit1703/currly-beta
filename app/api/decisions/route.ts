import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DecisionSchema = z.object({
  tool_ids:       z.array(z.string().uuid()).min(2).max(10),
  chosen_tool_id: z.string().uuid().nullable(),
  confidence:     z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  context:        z.enum(['compare', 'stack']),
  source_path:    z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`decisions:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = DecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Bad request.' }, { status: 400 });
  }

  const { tool_ids, chosen_tool_id, confidence, context, source_path } = parsed.data;

  if (chosen_tool_id && !tool_ids.includes(chosen_tool_id)) {
    return NextResponse.json({ error: 'chosen_tool_id must be one of tool_ids.' }, { status: 400 });
  }
  if (chosen_tool_id && confidence === undefined) {
    return NextResponse.json({ error: 'confidence is required when choosing a tool.' }, { status: 400 });
  }

  // Auth is optional — anonymous decisions stored with user_id = null
  let userId: string | null = null;
  let icpDomain: string | null = null;
  let budgetBand: string | null = null;

  try {
    const userSupabase = createClient(await cookies());
    const { data: { user } } = await userSupabase.auth.getUser();
    if (user) {
      userId = user.id;
      const { data: profile } = await createAdminClient()
        .from('user_profiles')
        .select('primary_use_case, monthly_budget_range')
        .eq('user_id', user.id)
        .maybeSingle();
      icpDomain  = profile?.primary_use_case    ?? null;
      budgetBand = profile?.monthly_budget_range ?? null;
    }
  } catch {
    // non-critical — proceed as anonymous
  }

  const admin = createAdminClient();

  // Create session
  const { data: session, error: sessionErr } = await admin
    .from('decision_sessions')
    .insert({
      user_id:     userId,
      context,
      tool_ids,
      icp_domain:  icpDomain,
      budget_band: budgetBand,
      source_path: source_path ?? null,
      status:      chosen_tool_id ? 'decided' : 'undecided',
    })
    .select('id')
    .single();

  if (sessionErr || !session) {
    console.error('[POST /api/decisions] session insert:', sessionErr?.message);
    return NextResponse.json({ error: 'Failed to record decision.' }, { status: 500 });
  }

  // If a tool was chosen, write choice + rejections
  if (chosen_tool_id && confidence !== undefined) {
    const rejectedIds = tool_ids.filter(id => id !== chosen_tool_id);

    const [choiceErr, rejectionErr] = await Promise.all([
      admin.from('tool_choices').insert({
        decision_session_id: session.id,
        tool_id:             chosen_tool_id,
        confidence,
      }).then(r => r.error),

      rejectedIds.length > 0
        ? admin.from('tool_rejections').insert(
            rejectedIds.map(id => ({
              decision_session_id: session.id,
              tool_id:             id,
            }))
          ).then(r => r.error)
        : Promise.resolve(null),
    ]);

    if (choiceErr) {
      console.error('[POST /api/decisions] choice insert:', choiceErr.message);
    }
    if (rejectionErr) {
      console.error('[POST /api/decisions] rejection insert:', rejectionErr.message);
    }
  }

  return NextResponse.json({ session_id: session.id }, { status: 201 });
}
