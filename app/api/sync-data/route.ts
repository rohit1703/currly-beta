import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { parse } from 'csv-parse/sync'; // The new parser

export const maxDuration = 300; // 5 minutes timeout

export async function GET() {
  const SHEET_URL = process.env.GOOGLE_SHEET_URL;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!SHEET_URL || !SUPABASE_KEY || !OPENAI_KEY) {
    return NextResponse.json({ success: false, error: 'Missing Keys (Check CSV URL)' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    // 1. Fetch CSV Data
    console.log("Fetching Google Sheet CSV...");
    const csvResponse = await fetch(SHEET_URL, { cache: 'no-store' });
    
    if (!csvResponse.ok) throw new Error(`Failed to fetch CSV: ${csvResponse.status}`);
    
    const csvText = await csvResponse.text();

    // 2. Parse CSV
    const records = parse(csvText, {
      columns: true, // Use the header row (Row 1) as keys
      skip_empty_lines: true,
      trim: true,
    });

    // Filter for "Live" status only
    const liveTools = records.filter((r: any) => r['Status']?.trim() === 'Live');

    console.log(`Found ${liveTools.length} live tools (out of ${records.length} total).`);

    // Helper
    const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // 3. Process & Embed in Batches
    const BATCH_SIZE = 10;
    const processedTools: any[] = [];

    for (let i = 0; i < liveTools.length; i += BATCH_SIZE) {
      const batch = liveTools.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (record: any) => {
        const name = record['Tool Name'];
        
        if (!name) return null;

        // Map CSV columns to variables
        const description = record['Description'] || '';
        const category = record['Category'] || 'General';
        const pricing = record['Pricing'] || 'Unknown';
        const website = record['Website'] || '';
        const imageUrl = record['Image'] || '';
        
        // Generate Embedding
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

        // Create Unique ID based on Name (since CSV doesn't have a unique ID like Notion)
        // We use a hash-like approach or just name for simplicity, but adding a random string ensures uniqueness if names duplicate
        // Ideally, add an 'ID' column to your sheet, but we can generate one:
        const notion_id = slugify(name) + '-csv'; 
        const slug = slugify(name);

        return {
          notion_id: notion_id, // We keep the column name 'notion_id' in DB to avoid schema changes
          name,
          slug,
          website,
          description,
          main_category: category,
          pricing_model: pricing,
          image_url: imageUrl,
          launch_date: new Date().toISOString(), // CSV doesn't track date usually, so we default to now
          embedding
        };
      });

      const results = await Promise.all(batchPromises);
      const validResults = results.filter(t => t !== null);
      processedTools.push(...validResults);
      
      console.log(`Processed ${Math.min(i + BATCH_SIZE, liveTools.length)}/${liveTools.length}`);
    }

    // 4. Upsert to Supabase
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
      message: `Synced & Embedded ${processedTools.length} tools from Google Sheets.`
    });

  } catch (error: any) {
    console.error('Sync failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}