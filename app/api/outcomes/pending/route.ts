import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

const DAY_MS = 86_400_000;

export async function GET(_request: NextRequest) {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ pending: null });

  const now = Date.now();
  const windows = [
    { check_day: 7  as const, from: new Date(now - 8 * DAY_MS).toISOString(), to: new Date(now - 6 * DAY_MS).toISOString() },
    { check_day: 30 as const, from: new Date(now - 31 * DAY_MS).toISOString(), to: new Date(now - 29 * DAY_MS).toISOString() },
  ];

  const admin = createAdminClient();

  for (const { check_day, from, to } of windows) {
    // Sessions in the check window for this user
    const { data: sessions, error: sessErr } = await admin
      .from('decision_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'decided')
      .gte('created_at', from)
      .lte('created_at', to)
      .limit(5);

    if (sessErr) {
      console.error('[GET /api/outcomes/pending] sessions query:', sessErr.message);
      continue;
    }
    if (!sessions?.length) continue;

    const sessionIds = sessions.map(s => s.id);

    // Which sessions already have an outcome for this check_day?
    const { data: existing, error: existErr } = await admin
      .from('workflow_outcomes')
      .select('decision_session_id')
      .in('decision_session_id', sessionIds)
      .eq('check_day', check_day);

    if (existErr) {
      console.error('[GET /api/outcomes/pending] existing outcomes query:', existErr.message);
      continue;
    }

    const covered = new Set((existing ?? []).map(o => o.decision_session_id));
    const pending = sessionIds.find(id => !covered.has(id));
    if (!pending) continue;

    // Fetch the chosen tool for this session
    const { data: choice } = await admin
      .from('tool_choices')
      .select('tool_id')
      .eq('decision_session_id', pending)
      .maybeSingle();

    if (!choice) continue;

    const { data: tool } = await admin
      .from('tools')
      .select('id, name, slug, image_url')
      .eq('id', choice.tool_id)
      .maybeSingle();

    if (!tool) continue;

    return NextResponse.json({
      pending: {
        session_id: pending,
        check_day,
        tool: { id: tool.id, name: tool.name, slug: tool.slug, image_url: tool.image_url },
      },
    });
  }

  return NextResponse.json({ pending: null });
}
