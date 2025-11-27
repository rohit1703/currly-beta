import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { parse } from 'csv-parse/sync';

export const maxDuration = 300; // 5 minutes timeout

// CHANGED: GET -> POST for security (prevent accidental triggers)
export async function POST(request: Request) {
  // --- 1. SECURITY GATE ---
  const authHeader = request.headers.get('authorization');
  
  // We require a specific Bearer token to run this script
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const SHEET_URL = process.env.GOOGLE_SHEET_URL;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  if (!SHEET_URL || !SUPABASE_KEY || !OPENAI_KEY) {
    return NextResponse.json({ success: false, error: 'Missing Server-Side Keys' }, { status: 500 });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);
    const openai = new OpenAI({ apiKey: OPENAI_KEY });

    // 2. Fetch CSV Data
    console.log("Fetching Google Sheet CSV...");
    const csvResponse = await fetch(SHEET_URL, { cache: 'no-store' });
    if (!csvResponse.ok) throw new Error(`Failed to fetch CSV: ${csvResponse.status}`);
    const csvText = await csvResponse.text();

    // 3. Parse CSV
    const records = parse(csvText, {
      columns: true, 
      skip_empty_lines: true,
      trim: true,
    }) as any[];

    // Filter for "Live" status
    // Note: Ensure your CSV column name matches exactly "Launch Status" or adjust here
    const liveTools = records.filter((r: any) => r['Launch Status']?.trim() === 'Live');
    console.log(`Found ${liveTools.length} live tools.`);

    // Helper
    const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

    // 4. Process & Embed in Batches
    const BATCH_SIZE = 10;
    const processedTools: any[] = [];

    for (let i = 0; i < liveTools.length; i += BATCH_SIZE) {
      const batch = liveTools.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (record: any) => {
        const name = record['Tool Name'] || record['Name'];
        if (!name) return null;

        // Map CSV columns
        const description = record['Description'] || '';
        const mainCategory = record['Main Category'] || 'General';
        const pricing = record['Pricing Model'] || 'Unknown';
        const website = record['Website'] || '';
        const launchDate = record['Date Added'] || new Date().toISOString();
        
        // Metadata for Embedding
        const keyFeatures = record['Key Features'] || '';
        const useCase = record['Use Case Summary'] || '';
        const founder = record['Founder Name'] || '';
        const imageUrl = record['Image'] || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

        // Generate Embedding
        let embedding = null;
        try {
          const contentToEmbed = `
            Tool: ${name}. 
            Description: ${description}. 
            Category: ${mainCategory}. 
            Pricing: ${pricing}. 
            Features: ${keyFeatures}. 
            Use Cases: ${useCase}. 
            Founder: ${founder}.
          `.trim();

          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: contentToEmbed,
            encoding_format: 'float',
          });
          embedding = embeddingResponse.data[0].embedding;
        } catch (e) {
          console.error(`Failed to embed ${name}`, e);
        }

        const notion_id = slugify(name) + '-csv'; 

        return {
          notion_id, 
          name,
          slug: slugify(name),
          website,
          description,
          main_category: mainCategory,
          pricing_model: pricing,
          image_url: imageUrl,
          launch_date: new Date(launchDate).toISOString(),
          embedding
        };
      });

      const results = await Promise.all(batchPromises);
      const validResults = results.filter(t => t !== null);
      processedTools.push(...validResults);
    }

    // 5. Upsert to Supabase
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