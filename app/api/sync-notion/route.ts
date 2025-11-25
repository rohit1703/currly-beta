import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const NOTION_KEY = process.env.NOTION_SECRET_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!NOTION_KEY || !SUPABASE_KEY || !DATABASE_ID) {
    return NextResponse.json({ success: false, error: 'Missing Keys' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

    // 1. Fetch from Notion
    const notionResponse = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Launch Status',
          select: { equals: 'Live' }
        }
      }),
    });

    if (!notionResponse.ok) throw new Error(`Notion error: ${notionResponse.status}`);
    const data = await notionResponse.json();
    const results = data.results || [];

    // Helper to create "chat-gpt-4" from "Chat GPT 4"
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
    };

    // 2. Map Data
    const tools = results.map((page: any) => {
      const props = page.properties;
      
      const getTitle = (p: any) => p?.title?.[0]?.plain_text || 'Untitled';
      const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
      const getSelect = (p: any) => p?.select?.name || null;
      const getUrl = (p: any) => p?.url || null;

      const name = getTitle(props['Tool Name']);
      
      // GENERATE THE SLUG HERE
      // We append a short random string to ensure uniqueness if two tools have the same name
      const slug = `${slugify(name)}-${Math.random().toString(36).substring(2, 7)}`;

      return {
        notion_id: page.id,
        name: name,
        slug: slug, // <--- This fixes the error
        website: getUrl(props['Website']),
        description: getText(props['Description']),
        main_category: getSelect(props['Main Category']),
        pricing_model: getSelect(props['Pricing Model']),
        image_url: props['Image']?.files?.[0]?.file?.url || props['Image']?.files?.[0]?.external?.url || '',
        launch_date: props['Date Added']?.date?.start || null,
      };
    });

    // 3. Upsert to Supabase
    if (tools.length > 0) {
      const { error } = await supabase
        .from('tools')
        .upsert(tools, { onConflict: 'notion_id' });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      count: tools.length,
      message: `Synced ${tools.length} tools successfully.`
    });

  } catch (error: any) {
    console.error('Sync failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}