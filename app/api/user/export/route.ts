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

  const [{ data: collections }, { data: apiUsage }] = await Promise.all([
    admin
      .from('collections')
      .select(`
        name, description, is_public, created_at,
        collection_tools (
          added_at,
          tools ( name, slug, website, main_category, pricing_model )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    admin
      .from('api_usage')
      .select('endpoint, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      email: user.email,
      name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
    },
    collections: (collections || []).map((c: any) => ({
      name: c.name,
      description: c.description,
      is_public: c.is_public,
      created_at: c.created_at,
      tools: (c.collection_tools || []).map((ct: any) => ({
        ...ct.tools,
        added_at: ct.added_at,
      })),
    })),
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
