'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function clearbitLogo(website: string | null): string | null {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    return `https://logo.clearbit.com/${new URL(url).hostname}`;
  } catch { return null; }
}

export async function createTool(formData: FormData) {
  const supabase = createAdminClient();
  const name = (formData.get('name') as string)?.trim();
  const website = (formData.get('website') as string)?.trim() || null;
  const imageUrl = (formData.get('image_url') as string)?.trim() || clearbitLogo(website);

  const { error } = await supabase.from('tools').insert({
    name,
    slug: toSlug(name),
    description: (formData.get('description') as string)?.trim() || null,
    website,
    image_url: imageUrl,
    main_category: formData.get('main_category') as string,
    pricing_model: formData.get('pricing_model') as string,
    is_india_based: formData.get('is_india_based') === 'true',
    launch_status: (formData.get('launch_status') as string) || 'Live',
    launch_date: new Date().toISOString(),
  });

  if (error) {
    const msg = error.code === '23505'
      ? 'A tool with this name or slug already exists.'
      : error.message;
    redirect(`/admin/manage/new?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath('/admin/manage');
  revalidatePath('/dashboard');
  redirect('/admin/manage');
}

export async function updateTool(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = (formData.get('name') as string)?.trim();
  const website = (formData.get('website') as string)?.trim() || null;
  const imageUrl = (formData.get('image_url') as string)?.trim() || clearbitLogo(website);

  const { error } = await supabase.from('tools').update({
    name,
    slug: toSlug(name),
    description: (formData.get('description') as string)?.trim() || null,
    website,
    image_url: imageUrl,
    main_category: formData.get('main_category') as string,
    pricing_model: formData.get('pricing_model') as string,
    is_india_based: formData.get('is_india_based') === 'true',
    launch_status: formData.get('launch_status') as string,
  }).eq('id', id);

  if (error) {
    const msg = error.code === '23505'
      ? 'A tool with this name or slug already exists.'
      : error.message;
    redirect(`/admin/manage/${id}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath('/admin/manage');
  revalidatePath('/dashboard');
  redirect('/admin/manage');
}

export async function deleteTool(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('tools').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/manage');
  revalidatePath('/');
  redirect('/admin/manage');
}
