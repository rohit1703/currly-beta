'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function createTool(formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;

  const { error } = await supabase.from('tools').insert({
    name,
    slug: toSlug(name),
    description: formData.get('description') as string,
    website: formData.get('website') as string,
    image_url: formData.get('image_url') as string,
    main_category: formData.get('main_category') as string,
    pricing_model: formData.get('pricing_model') as string,
    is_india_based: formData.get('is_india_based') === 'true',
    launch_status: formData.get('launch_status') as string || 'Live',
    launch_date: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/manage');
  revalidatePath('/');
  redirect('/admin/manage');
}

export async function updateTool(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;

  const { error } = await supabase.from('tools').update({
    name,
    slug: toSlug(name),
    description: formData.get('description') as string,
    website: formData.get('website') as string,
    image_url: formData.get('image_url') as string,
    main_category: formData.get('main_category') as string,
    pricing_model: formData.get('pricing_model') as string,
    is_india_based: formData.get('is_india_based') === 'true',
    launch_status: formData.get('launch_status') as string,
  }).eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/manage');
  revalidatePath('/');
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
