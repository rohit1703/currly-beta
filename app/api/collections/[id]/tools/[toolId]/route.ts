import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; toolId: string }> }
) {
  const { id: collectionId, toolId } = await params;
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(`collections:${user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const admin = createAdminClient();

  // Ownership check via collection join
  const { data: collection } = await admin
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 });

  const { error } = await admin
    .from('collection_tools')
    .delete()
    .eq('collection_id', collectionId)
    .eq('tool_id', toolId);

  if (error) {
    console.error('DELETE /api/collections/[id]/tools/[toolId]:', error.message);
    return NextResponse.json({ error: 'Failed to remove tool.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
