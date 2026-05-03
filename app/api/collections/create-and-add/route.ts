import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const Schema = z.object({
  name:    z.string().min(1).max(100),
  tool_id: z.string().uuid(),
});

export async function POST(request: Request) {
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

  const result = Schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const { name, tool_id } = result.data;
  const admin = createAdminClient();

  // Enforce max 50 collections per user
  const { count } = await admin
    .from('collections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) >= 50) {
    return NextResponse.json({ error: 'Maximum of 50 collections reached.' }, { status: 400 });
  }

  // Step 1 — create collection
  const { data: collection, error: createError } = await admin
    .from('collections')
    .insert({ user_id: user.id, name })
    .select('id, name, description, is_public, share_token, created_at, updated_at')
    .single();

  if (createError) {
    if (createError.code === '23505') {
      return NextResponse.json({ error: 'A collection with that name already exists.' }, { status: 409 });
    }
    console.error('create-and-add: create collection:', createError.message);
    return NextResponse.json({ error: 'Failed to create collection.' }, { status: 500 });
  }

  // Step 2 — add tool
  const { error: addError } = await admin
    .from('collection_tools')
    .insert({ collection_id: collection.id, tool_id });

  if (addError) {
    // Roll back the newly created collection so no orphan is left
    await admin.from('collections').delete().eq('id', collection.id);

    const reason = addError.code === '23503' ? 'tool_not_found' : 'add_failed';
    console.error('create-and-add: add tool:', addError.message);
    return NextResponse.json(
      { error: 'Collection created but tool could not be added.', reason },
      { status: 500 }
    );
  }

  return NextResponse.json({ collection: { ...collection, tool_count: 1 } }, { status: 201 });
}
