import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function GET() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('collections')
    .select('id, name, description, is_public, share_token, created_at, updated_at, collection_tools(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('GET /api/collections:', error.message);
    return NextResponse.json({ error: 'Failed to fetch collections.' }, { status: 500 });
  }

  const collections = (data || []).map((c: any) => ({
    ...c,
    tool_count: c.collection_tools?.[0]?.count ?? 0,
    collection_tools: undefined,
  }));

  return NextResponse.json({ collections });
}

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

  const result = CreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
  }

  const admin = createAdminClient();

  // Enforce max 50 collections per user
  const { count } = await admin
    .from('collections')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) >= 50) {
    return NextResponse.json({ error: 'Maximum of 50 collections reached.' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('collections')
    .insert({ user_id: user.id, ...result.data })
    .select('id, name, description, is_public, share_token, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A collection with that name already exists.' }, { status: 409 });
    }
    console.error('POST /api/collections:', error.message);
    return NextResponse.json({ error: 'Failed to create collection.' }, { status: 500 });
  }

  return NextResponse.json({ collection: { ...data, tool_count: 0 } }, { status: 201 });
}
