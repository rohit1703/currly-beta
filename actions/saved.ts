'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function saveTool(toolId: string) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  await supabase.from('saved_tools').upsert({ user_id: user.id, tool_id: toolId });
}

export async function unsaveTool(toolId: string) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  await supabase.from('saved_tools').delete().eq('user_id', user.id).eq('tool_id', toolId);
}
