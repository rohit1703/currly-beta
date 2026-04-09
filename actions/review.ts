'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitReview(
  toolId: string,
  toolSlug: string,
  rating: number,
  body: string
): Promise<{ success: boolean; message: string }> {
  if (rating < 1 || rating > 5) return { success: false, message: 'Rating must be 1–5.' };

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Please sign in to leave a review.' };

  const { error } = await supabase.from('tool_reviews').upsert({
    user_id: user.id,
    tool_id: toolId,
    rating,
    body: body.trim() || null,
  }, { onConflict: 'user_id,tool_id' });

  if (error) {
    console.error('submitReview error:', error);
    return { success: false, message: 'Failed to save review.' };
  }

  revalidatePath(`/tool/${toolSlug}`);
  return { success: true, message: 'Review submitted!' };
}

export async function deleteReview(
  toolId: string,
  toolSlug: string
): Promise<void> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('tool_reviews').delete().eq('user_id', user.id).eq('tool_id', toolId);
  revalidatePath(`/tool/${toolSlug}`);
}
