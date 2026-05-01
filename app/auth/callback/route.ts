import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Check if this user has completed onboarding
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from('user_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      const destination = profile
        ? next
        : `/onboarding?next=${encodeURIComponent(next)}`;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
