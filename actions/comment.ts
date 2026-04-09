'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function postComment(
  toolId: string,
  toolSlug: string,
  body: string
): Promise<{ success: boolean; message: string }> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length < 2) return { success: false, message: 'Comment cannot be empty.' };
  if (trimmed.length > 1000) return { success: false, message: 'Comment is too long (max 1000 chars).' };

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Please sign in to comment.' };

  const { error } = await supabase.from('tool_comments').insert({
    user_id: user.id,
    tool_id: toolId,
    body: trimmed,
  });

  if (error) {
    console.error('postComment error:', error);
    return { success: false, message: 'Failed to post comment.' };
  }

  revalidatePath(`/tool/${toolSlug}`);
  return { success: true, message: 'Comment posted!' };
}

export async function deleteComment(
  commentId: string,
  toolSlug: string
): Promise<void> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('tool_comments').delete().eq('id', commentId).eq('user_id', user.id);
  revalidatePath(`/tool/${toolSlug}`);
}
