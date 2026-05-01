import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: savedTools } = await admin
    .from('saved_tools')
    .select(`
      saved_at: created_at,
      tool: tools (
        name, slug, website, main_category, pricing_model
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: apiUsage } = await admin
    .from('api_usage')
    .select('endpoint, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      email: user.email,
      name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
    },
    saved_tools: savedTools || [],
    api_usage_last_30_days: apiUsage || [],
    note: 'Search events and click events are stored anonymously and cannot be attributed to your account.',
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="currly-data-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
