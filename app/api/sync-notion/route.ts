import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // 1. Validate Keys
  if (!process.env.NOTION_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'Missing API Keys. Please check Vercel Environment Variables.' 
    }, { status: 500 });
  }

  try {
    // 2. Initialize Clients
    const notion = new Client({ auth: process.env.NOTION_SECRET_KEY });
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch from Notion
    // We remove the 'as any' cast and use standard query
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: 'Launch Status',
        select: {
          equals: 'Live',
        },
      },
    });

    // 4. Map Data
    const tools = response.results.map((page: any) => {
      const props = page.properties;
      
      // Safe helper for text extraction
      const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
      const getTitle = (p: any) => p?.title?.[0]?.plain_text || 'Untitled';
      const getSelect = (p: any) => p?.select?.name || null;
      const getMulti = (p: any) => p?.multi_select?.map((x: any) => x.name) || [];
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
        // Map other fields as needed
      };
    });

    // 5. Upsert to Supabase
    const { error } = await supabase
      .from('tools')
      .upsert(tools, { onConflict: 'notion_id' });

    if (error) throw error;

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