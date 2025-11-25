import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

// NOTE: We do NOT initialize clients here anymore to prevent build crashes.

export async function GET() {
  // 1. Check for Keys (Safety First)
  if (!process.env.NOTION_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'Missing API Keys in Environment Variables' 
    }, { status: 500 });
  }

  try {
    // 2. Initialize Clients (ONLY happens when the API is called)
    const notion = new Client({ auth: process.env.NOTION_SECRET_KEY });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Fetch Data from Notion
    // Casting to 'any' to avoid Vercel TS strictness errors
    const notionResponse = await (notion.databases as any).query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: 'Launch Status', 
        select: {
          equals: 'Live',
        },
      },
    });

    const tools = notionResponse.results.map((page: any) => {
      const props = page.properties;

      // Helper functions
      const getSelect = (prop: any) => prop?.select?.name || null;
      const getMultiSelect = (prop: any) => prop?.multi_select?.map((item: any) => item.name) || [];
      const getText = (prop: any) => prop?.rich_text[0]?.plain_text || '';

      return {
        notion_id: page.id,
        name: props['Tool Name']?.title[0]?.plain_text || 'Untitled',
        website: props['Website']?.url || null,
        description: getText(props['Description']),
        main_category: getSelect(props['Main Category']),
        sub_category: getSelect(props['Sub Category']),
        pricing_model: getSelect(props['Pricing Model']),
        industry_focus: getMultiSelect(props['Industry Focus']),
        team_size: getSelect(props['Team Size']),
        geographic_focus: getSelect(props['Geographic Focus']),
        launch_date: props['Date Added']?.date?.start || null,
        founder_name: getText(props['Founder Name']),
        key_features: getMultiSelect(props['Key Features']),
        use_case: getText(props['Use Case Summary']),
        community_interest: props['Community Interest']?.number || 0,
      };
    });

    // 4. Push to Supabase
    const { error } = await supabase
      .from('tools')
      .upsert(tools, { onConflict: 'notion_id' });

    if (error) {
      console.error('Supabase Upsert Error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${tools.length} tools to Currly Database.`,
      data: tools
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}