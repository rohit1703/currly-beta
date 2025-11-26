import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const maxDuration = 60; // Allow up to 60 seconds for this function (Vercel Pro/Hobby limit)

export async function GET() {
  const NOTION_KEY = process.env.NOTION_SECRET_KEY;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  // 1. Validate Keys
  if (!NOTION_KEY || !SUPABASE_KEY || !DATABASE_ID || !OPENAI_KEY) {
    return NextResponse.json({ success: false, error: 'Missing API Keys.' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    // 2. Fetch from Notion (Raw Fetch)
    console.log("Fetching from Notion...");
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
    
    console.log(`Found ${results.length} tools. Processing embeddings...`);

    // Helper: Slugify
    const slugify = (text: string) => {
      return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    };

    // 3. Process Tools & Generate Embeddings
    // We use Promise.all to process in parallel, but be careful with rate limits.
    // For 700 tools, we might need batching, but let's try direct first.
    const tools = await Promise.all(results.map(async (page: any) => {
      const props = page.properties;
      
      // Extraction
      const getTitle = (p: any) => p?.title?.[0]?.plain_text || 'Untitled';
      const getText = (p: any) => p?.rich_text?.[0]?.plain_text || '';
      const getSelect = (p: any) => p?.select?.name || null;
      const getUrl = (p: any) => p?.url || null;

      const name = getTitle(props['Tool Name']);
      const description = getText(props['Description']);
      const category = getSelect(props['Main Category']) || '';
      const pricing = getSelect(props['Pricing Model']) || '';
      
      // --- THE AI MAGIC START ---
      // We create a string that represents the "meaning" of the tool
      const contentToEmbed = `${name}: ${description}. Category: ${category}. Pricing: ${pricing}`;
      
      // Generate Embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: contentToEmbed,
        encoding_format: 'float',
      });
      
      const embedding = embeddingResponse.data[0].embedding;
      // --- THE AI MAGIC END ---

      const slug = `${slugify(name)}-${page.id.slice(0, 5)}`;

      return {
        notion_id: page.id,
        name: name,
        slug: slug,
        website: getUrl(props['Website']),
        description: description,
        main_category: category,
        pricing_model: pricing,
        image_url: props['Image']?.files?.[0]?.file?.url || props['Image']?.files?.[0]?.external?.url || '',
        launch_date: props['Date Added']?.date?.start || null,
        embedding: embedding // <--- Saving the vector to DB
      };
    }));

    // 4. Upsert to Supabase
    if (tools.length > 0) {
      const { error } = await supabase
        .from('tools')
        .upsert(tools, { onConflict: 'notion_id' });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      count: tools.length,
      message: `Synced & Embedded ${tools.length} tools successfully.`
    });

  } catch (error: any) {
    console.error('Sync failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}