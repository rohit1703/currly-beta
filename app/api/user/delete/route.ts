import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Delete all user-attributed data before removing the auth record
  // collections cascade-deletes collection_tools automatically
  await Promise.all([
    admin.from('collections').delete().eq('user_id', user.id),
    admin.from('saved_tools').delete().eq('user_id', user.id),
    admin.from('api_usage').delete().eq('user_id', user.id),
  ]);

  // Delete the Supabase Auth user — this is irreversible
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('Failed to delete auth user:', error.message);
    return NextResponse.json({ error: 'Account deletion failed. Please contact founders@currly.ai.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
