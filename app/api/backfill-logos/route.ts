import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

function clearbitLogo(website: string): string | null {
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    return `https://logo.clearbit.com/${new URL(url).hostname}`;
  } catch { return null; }
}

// POST /api/backfill-logos
// Sets image_url from Clearbit for every tool that has a website but no logo.
export async function POST(req: Request) {
  // Simple secret check so this can't be triggered publicly
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, website, image_url')
    .not('website', 'is', null)
    .or('image_url.is.null,image_url.eq.');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  const failed: string[] = [];

  console.log(`[backfill-logos] Starting — ${(tools || []).length} tools need logos`);

  for (const tool of tools || []) {
    const logo = clearbitLogo(tool.website);
    if (!logo) continue;

    const { error: updateErr } = await supabase
      .from('tools')
      .update({ image_url: logo })
      .eq('id', tool.id);

    if (updateErr) {
      console.error(`[backfill-logos] Failed to update ${tool.id}:`, updateErr.message);
      failed.push(tool.id);
    } else {
      updated++;
    }
  }

  console.log(`[backfill-logos] Done — updated: ${updated}, failed: ${failed.length}`);

  return NextResponse.json({
    total: (tools || []).length,
    updated,
    failed: failed.length,
  });
}
