'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export type ImportRow = {
  name: string;
  website?: string;
  description?: string;
  main_category?: string;
  pricing_model?: string;
  is_india_based?: boolean;
};

export type ImportResult = {
  imported: number;
  skipped: number;
  skippedNames: string[];
  errors: string[];
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function importTools(rows: ImportRow[]): Promise<ImportResult> {
  const supabase = createAdminClient();
  const result: ImportResult = { imported: 0, skipped: 0, skippedNames: [], errors: [] };

  if (!rows.length) return result;

  // Fetch existing names and websites for deduplication
  const { data: existing } = await supabase
    .from('tools')
    .select('name, website');

  const existingNames = new Set((existing || []).map((t: any) => t.name.toLowerCase()));
  const existingWebsites = new Set(
    (existing || []).filter((t: any) => t.website).map((t: any) => t.website.toLowerCase())
  );

  const toInsert = [];

  for (const row of rows) {
    if (!row.name?.trim()) continue;

    const isDupName = existingNames.has(row.name.trim().toLowerCase());
    const isDupWebsite = row.website && existingWebsites.has(row.website.trim().toLowerCase());

    if (isDupName || isDupWebsite) {
      result.skipped++;
      result.skippedNames.push(row.name.trim());
      continue;
    }

    toInsert.push({
      name: row.name.trim(),
      slug: toSlug(row.name.trim()),
      website: row.website?.trim() || null,
      description: row.description?.trim() || null,
      main_category: row.main_category?.trim() || 'Other',
      pricing_model: row.pricing_model?.trim() || 'Free',
      is_india_based: row.is_india_based ?? false,
      launch_status: 'Live',
      launch_date: new Date().toISOString(),
    });
  }

  if (toInsert.length) {
    const { error } = await supabase.from('tools').insert(toInsert);
    if (error) {
      result.errors.push(error.message);
    } else {
      result.imported = toInsert.length;
    }
  }

  revalidatePath('/admin/manage');
  revalidatePath('/');
  return result;
}
