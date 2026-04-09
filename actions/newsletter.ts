'use server';

import { createClient } from '@supabase/supabase-js';

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from('email_subscribers').insert({
    email: trimmed,
    source: 'homepage',
  });

  if (error?.code === '23505') {
    return { success: true, message: "You're already subscribed!" };
  }

  if (error) {
    console.error('Newsletter subscribe error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }

  return { success: true, message: "You're in! Weekly AI tool picks, straight to your inbox." };
}
