import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const maxDuration = 300; // Request 5-minute timeout (if on Vercel Pro)

export async function GET() {
  const NOTION_KEY = process.env.NOTION_SECRET_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!NOTION_KEY || !SUPABASE_KEY || !DATABASE_ID || !OPENAI_KEY) {
    return NextResponse.json({ success: false, error: 'Missing Keys' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    let allTools: any[] = [];
    let hasMore = true;
    let startCursor = undefined;

    // 1. Fetch ALL pages from Notion (Pagination Loop)
    console.log("Starting Notion Fetch...");
    
    while (hasMore) {
      const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
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
          },
          start_cursor: startCursor,
          page_size: 100 // Max allowed by Notion
        }),
      });

      if (!response.ok) throw new Error(`Notion error: ${response.status}`);
      
      const data = await response.json();
      allTools = [...allTools, ...data.results];
      hasMore = data.has_more;
      startCursor = data.next_cursor;
      
      console.log(`Fetched ${allTools.length} tools so far...`);
    }

    console.log(`Finished fetching. Total Tools: ${allTools.length}`);

    // Helper
    const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // 2. Process & Embed in Batches (To avoid rate limits/timeouts)
    // We process 10 items at a time
    const BATCH_SIZE = 10;
    const processedTools = [];

    for (let i = 0; i < allTools.length; i += BATCH_SIZE) {
      const batch = allTools.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (page: any) => {
        const props = page.properties;
        const name = props['Tool Name']?.title?.[0]?.plain_text || 'Untitled';
        const description = props['Description']?.rich_text?.[0]?.plain_text || '';
        const category = props['Main Category']?.select?.name || '';
        const pricing = props['Pricing Model']?.select?.name || '';
        
        // Skip embedding if name is Untitled
        if (name === 'Untitled') return null;

        // AI Embedding
        let embedding = null;
        try {
          const contentToEmbed = `${name}: ${description}. Category: ${category}. Pricing: ${pricing}`;
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: contentToEmbed,
            encoding_format: 'float',
          });
          embedding = embeddingResponse.data[0].embedding;
        } catch (e) {
          console.error(`Failed to embed ${name}`, e);
        }

        // Unique Slug
        const slug = `${slugify(name)}-${page.id.slice(0, 6)}`; // Short ID suffix

        return {
          notion_id: page.id,
          name,
          slug,
          website: props['Website']?.url || null,
          description,
          main_category: category,
          pricing_model: pricing,
          image_url: props['Image']?.files?.[0]?.file?.url || props['Image']?.files?.[0]?.external?.url || '',
          launch_date: props['Date Added']?.date?.start || null,
          embedding
        };
      });

      const results = await Promise.all(batchPromises);
      processedTools.push(...results.filter(t => t !== null));
      console.log(`Processed ${Math.min(i + BATCH_SIZE, allTools.length)}/${allTools.length}`);
    }

    // 3. Upsert to Supabase
    if (processedTools.length > 0) {
      // Upsert in chunks of 50 to be safe
      for (let i = 0; i < processedTools.length; i += 50) {
        const chunk = processedTools.slice(i, i + 50);
        const { error } = await supabase
          .from('tools')
          .upsert(chunk, { onConflict: 'notion_id' });
        
        if (error) throw error;
      }
    }

    return NextResponse.json({
      success: true,
      count: processedTools.length,
      message: `Synced & Embedded ${processedTools.length} tools.`
    });

  } catch (error: any) {
    console.error('Sync failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}