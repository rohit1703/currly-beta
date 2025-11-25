import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Clients
const notion = new Client({ auth: process.env.NOTION_SECRET_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 2. Fetch Data from Notion
    // Casting to 'any' to bypass Vercel TypeScript error
const notionResponse = await (notion.databases as any).query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: 'Launch Status', // Ensuring we only show active tools
        select: {
          equals: 'Live', // Change 'Live' to whatever your active status is (e.g., 'Published')
        },
      },
    });

    const tools = notionResponse.results.map((page: any) => {
      const props = page.properties;

      // Helper function to safely get Select/Multi-Select values
      const getSelect = (prop: any) => prop?.select?.name || null;
      const getMultiSelect = (prop: any) => prop?.multi_select?.map((item: any) => item.name) || [];
      const getText = (prop: any) => prop?.rich_text[0]?.plain_text || '';

      return {
        // ID for Syncing (Critical)
        notion_id: page.id,

        // Basic Info
        name: props['Tool Name']?.title[0]?.plain_text || 'Untitled',
        website: props['Website']?.url || null,
        description: getText(props['Description']),
        
        // Categorization
        main_category: getSelect(props['Main Category']),
        sub_category: getSelect(props['Sub Category']),
        
        // Filters (Matches your Sidebar Requirements)
        pricing_model: getSelect(props['Pricing Model']), // For Budget Filter
        industry_focus: getMultiSelect(props['Industry Focus']), // For Industry Filter
        team_size: getSelect(props['Team Size']), // For Team Filter
        geographic_focus: getSelect(props['Geographic Focus']), // For India/World Toggle

        // Card Details
        launch_date: props['Date Added']?.date?.start || null,
        founder_name: getText(props['Founder Name']),
        key_features: getMultiSelect(props['Key Features']),
        
        // Metadata
        use_case: getText(props['Use Case Summary']),
        community_interest: props['Community Interest']?.number || 0,
      };
    });

    // 3. Push to Supabase
    const { data, error } = await supabase
      .from('tools')
      .upsert(tools, { onConflict: 'notion_id' });

    if (error) {
      console.error('Supabase Upsert Error:', error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${tools.length} tools to Currly Database.`,
      data: tools // Returning data so you can see it in the browser for testing
    });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}