import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { UserProfileSchema } from '@/lib/onboarding-schema';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ profile: data });
}

export async function POST(request: Request) {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!rateLimit(`profile:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ success: false, message: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── Skip action ───────────────────────────────────────────────────────
  // Only records the intent — never overwrites a completed profile row.
  if ((body as any)?.action === 'skip') {
    const { data: existing } = await admin
      .from('user_profiles')
      .select('onboarding_status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing?.onboarding_status !== 'completed') {
      const { error } = await admin
        .from('user_profiles')
        .upsert({ user_id: user.id, onboarding_status: 'skipped' }, { onConflict: 'user_id' });
      if (error) {
        console.error('upsert skip user_profiles:', error.message);
        return NextResponse.json({ success: false, message: 'Failed to save.' }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true });
  }

  // ── Full profile submission ───────────────────────────────────────────
  const result = UserProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.error.issues[0]?.message ?? 'Invalid data.' },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from('user_profiles')
    .upsert(
      { user_id: user.id, onboarding_status: 'completed', ...result.data },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('upsert user_profiles:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to save profile.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
