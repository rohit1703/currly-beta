import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Allow 5 minutes for the sync to complete
export const maxDuration = 300; 

export async function GET(request: Request) {
  // --- 1. SECURITY CHECK (The Firewall) ---
  // We check if the request has the correct "Authorization" header.
  // This prevents random people from triggering your expensive API.
  const authHeader = request.headers.get('authorization');
  
  // We check against a new env variable 'CRON_SECRET'
  // Note: We also allow it if we are in 'development' mode for easy testing
  if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const NOTION_KEY = process.env.NOTION_SECRET_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!NOTION_KEY || !SUPABASE_KEY || !DATABASE_ID || !OPENAI_KEY) {
    return NextResponse.json({ success: false, error: 'Missing API Keys' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    let allTools: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    console.log("Starting Secure Notion Fetch...");
    
    while (hasMore) {
      const notionRes: Response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_cursor: startCursor,
          page_size: 100
        }),
      });

      if (!notionRes.ok) throw new Error(`Notion error: ${notionRes.status}`);
      
      const data = await notionRes.json();
      allTools = [...allTools, ...data.results];
      hasMore = data.has_more;
      startCursor = data.next_cursor ?? undefined;
    }

    const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // Process & Embed
    const BATCH_SIZE = 10;
    const processedTools: any[] = [];

    for (let i = 0; i < allTools.length; i += BATCH_SIZE) {
      const batch = allTools.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (page: any) => {
        const props = page.properties;
        const getTitle = (p: any) => p?.title?.[0]?.plain_text || 'Untitled';
        const name = getTitle(props['Tool Name'] || props['Name']); 
        
        if (name === 'Untitled' || !name) return null;

        const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
        const getSelect = (p: any) => p?.select?.name || '';
        const getUrl = (p: any) => p?.url || null;

        const description = getText(props['Description']);
        const category = getSelect(props['Main Category'] || props['Category']);
        const pricing = getSelect(props['Pricing Model'] || props['Pricing']);
        const website = getUrl(props['Website'] || props['URL']);
        const launchDate = props['Date Added']?.date?.start || null;
        
        const imageProp = props['Image'] || props['Logo'];
        const imageUrl = imageProp?.files?.[0]?.file?.url || imageProp?.files?.[0]?.external?.url || '';

        // Only generate embedding if one doesn't exist? 
        // For MVP we regenerate to ensure accuracy with new descriptions
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

        const slug = `${slugify(name)}-${page.id.slice(0, 6)}`;

        return {
          notion_id: page.id,
          name,
          slug,
          website,
          description,
          main_category: category,
          pricing_model: pricing,
          image_url: imageUrl,
          launch_date: launchDate,
          embedding
        };
      });

      const results = await Promise.all(batchPromises);
      processedTools.push(...results.filter(t => t !== null));
    }

    if (processedTools.length > 0) {
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
      message: `Securely Synced ${processedTools.length} tools.`
    });

  } catch (error: any) {
    console.error('Sync failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}