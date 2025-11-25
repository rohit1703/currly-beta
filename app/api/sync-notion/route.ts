import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We are bypassing the Notion SDK and using raw fetch to avoid version errors
export async function GET() {
  const NOTION_KEY = process.env.NOTION_SECRET_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Validate Keys
  if (!NOTION_KEY || !SUPABASE_KEY || !DATABASE_ID) {
    return NextResponse.json({ 
      success: false, 
      error: 'Missing API Keys. Please check Vercel Environment Variables.' 
    }, { status: 500 });
  }

  try {
    // 2. Initialize Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

    // 3. Fetch from Notion (Using Raw HTTP Request)
    console.log("Fetching from Notion via Raw API...");
    
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
          select: {
            equals: 'Live',
          },
        },
      }),
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.text();
      throw new Error(`Notion API Error: ${notionResponse.status} - ${errorData}`);
    }

    const data = await notionResponse.json();
    const results = data.results || [];

    console.log(`Found ${results.length} tools.`);

    // 4. Map Data
    const tools = results.map((page: any) => {
      const props = page.properties;
      
      // Helpers
      const getTitle = (p: any) => p?.title?.[0]?.plain_text || 'Untitled';
      const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
      const getSelect = (p: any) => p?.select?.name || null;
      const getUrl = (p: any) => p?.url || null;

      return {
        notion_id: page.id,
        name: getTitle(props['Tool Name']),
        website: getUrl(props['Website']),
        description: getText(props['Description']),
        main_category: getSelect(props['Main Category']),
        pricing_model: getSelect(props['Pricing Model']),
        image_url: props['Image']?.files?.[0]?.file?.url || props['Image']?.files?.[0]?.external?.url || '',
        launch_date: props['Date Added']?.date?.start || null,
        // Add mapping for other fields if needed
      };
    });

    // 5. Upsert to Supabase
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
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    }, { status: 500 });
  }
}