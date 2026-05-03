import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const AddToolSchema = z.object({
  tool_id: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: collectionId } = await params;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(collectionId)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(`collections:${user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = AddToolSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const admin = createAdminClient();

  // Ownership check
  const { data: collection } = await admin
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 });

  const { error } = await admin
    .from('collection_tools')
    .upsert({ collection_id: collectionId, tool_id: result.data.tool_id }, { onConflict: 'collection_id,tool_id' });

  if (error) {
    console.error('POST /api/collections/[id]/tools:', error.message);
    return NextResponse.json({ error: 'Failed to add tool.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
