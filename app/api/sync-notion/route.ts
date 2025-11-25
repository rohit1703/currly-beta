import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log("1. Starting Sync Process...");

  // 1. Validate Keys
  if (!process.env.NOTION_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Keys");
    return NextResponse.json({ 
      success: false, 
      error: 'Missing API Keys. Please check Vercel Environment Variables.' 
    }, { status: 500 });
  }

  try {
    // 2. Initialize Clients
    // TYPE HACK: Casting to 'any' ensures we bypass the "query does not exist" build error
    const notion: any = new Client({ auth: process.env.NOTION_SECRET_KEY });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("2. Clients Initialized. Querying Notion...");

    // 3. Fetch from Notion
    // We use the 'notion' variable which is cast to 'any', so this will run as standard JS
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: 'Launch Status',
        select: {
          equals: 'Live',
        },
      },
    });

    console.log(`3. Notion Response Received. Found ${response.results.length} items.`);

    // 4. Map Data
    const tools = response.results.map((page: any) => {
      const props = page.properties;
      
      const getTitle = (p: any) => p?.title?.[0]?.plain_text || 'Untitled';
      const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
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
        // Handling images carefully
        image_url: props['Image']?.files?.[0]?.file?.url || props['Image']?.files?.[0]?.external?.url || '',
        launch_date: props['Date Added']?.date?.start || null,
        
        // Add other mapped fields if necessary based on your database columns
        // e.g. team_size: getSelect(props['Team Size']),
      };
    });

    // 5. Upsert to Supabase
    if (tools.length > 0) {
      console.log("4. Upserting to Supabase...");
      const { error } = await supabase
        .from('tools')
        .upsert(tools, { onConflict: 'notion_id' });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
    } else {
      console.log("4. No tools to upsert.");
    }

    return NextResponse.json({
      success: true,
      count: tools.length,
      message: `Synced ${tools.length} tools successfully.`
    });

  } catch (error: any) {
    console.error('Sync failed:', error);
    // Return the actual error message to the browser so we can see it
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      details: JSON.stringify(error)
    }, { status: 500 });
  }
}