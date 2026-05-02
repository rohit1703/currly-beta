import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Basic UUID format check
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(token)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('collections')
    .select(`
      id, name, description, is_public, created_at,
      collection_tools (
        added_at,
        tools (
          id, name, slug, description, image_url, main_category,
          pricing_model, website, is_india_based
        )
      )
    `)
    .eq('share_token', token)
    .eq('is_public', true)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const tools = ((data.collection_tools as any[]) || [])
    .map((ct: any) => ct.tools)
    .filter(Boolean);

  return NextResponse.json({
    collection: {
      id: data.id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
      tools,
    },
  });
}
