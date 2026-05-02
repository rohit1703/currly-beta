import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const PatchSchema = z.object({
  name:                 z.string().min(1).max(100).optional(),
  description:          z.string().max(500).optional(),
  is_public:            z.boolean().optional(),
  generate_share_token: z.boolean().optional(),
  revoke_share_token:   z.boolean().optional(),
});

async function getOwnedCollection(admin: ReturnType<typeof createAdminClient>, collectionId: string, userId: string) {
  const { data } = await admin
    .from('collections')
    .select('id, name, user_id, share_token, is_public')
    .eq('id', collectionId)
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const result = PatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const admin = createAdminClient();
  const collection = await getOwnedCollection(admin, id, user.id);
  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 });

  const { generate_share_token, revoke_share_token, ...fields } = result.data;
  const updates: Record<string, unknown> = { ...fields };

  if (generate_share_token && !collection.share_token) {
    updates.share_token = crypto.randomUUID();
  }
  if (revoke_share_token) {
    updates.share_token = null;
    updates.is_public = false;
  }

  const { data, error } = await admin
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select('id, name, description, is_public, share_token, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A collection with that name already exists.' }, { status: 409 });
    }
    console.error('PATCH /api/collections/[id]:', error.message);
    return NextResponse.json({ error: 'Failed to update collection.' }, { status: 500 });
  }

  return NextResponse.json({ collection: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!rateLimit(`collections:${user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const admin = createAdminClient();
  const collection = await getOwnedCollection(admin, id, user.id);
  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 });

  // Prevent deleting the last collection
  const { count } = await admin
    .from('collections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) <= 1) {
    return NextResponse.json({ error: 'You must have at least one collection.' }, { status: 400 });
  }

  const { error } = await admin.from('collections').delete().eq('id', id);
  if (error) {
    console.error('DELETE /api/collections/[id]:', error.message);
    return NextResponse.json({ error: 'Failed to delete collection.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
