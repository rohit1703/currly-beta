'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function toggleUpvote(toolId: string): Promise<{ upvoted: boolean; count: number }> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('tool_upvotes')
    .select('id')
    .eq('user_id', user.id)
    .eq('tool_id', toolId)
    .maybeSingle();

  if (existing) {
    await supabase.from('tool_upvotes').delete().eq('id', existing.id);
  } else {
    await supabase.from('tool_upvotes').insert({ user_id: user.id, tool_id: toolId });
  }

  const { count } = await supabase
    .from('tool_upvotes')
    .select('id', { count: 'exact', head: true })
    .eq('tool_id', toolId);

  return { upvoted: !existing, count: count || 0 };
}

export async function getUpvoteState(toolId: string): Promise<{ upvoted: boolean; count: number }> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count }, upvoteRow] = await Promise.all([
    supabase
      .from('tool_upvotes')
      .select('id', { count: 'exact', head: true })
      .eq('tool_id', toolId),
    user
      ? supabase.from('tool_upvotes').select('id').eq('user_id', user.id).eq('tool_id', toolId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return { upvoted: !!upvoteRow.data, count: count || 0 };
}
