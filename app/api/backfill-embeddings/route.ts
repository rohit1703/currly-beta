import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const maxDuration = 300;

export async function POST(request: Request) {
  // Secured with the same CRON_SECRET as sync-data
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  // Fetch all tools that have no embedding yet
  const { data: tools, error } = await supabase
    .from('tools')
    .select('id, name, description, main_category, pricing_model, key_features, use_case, founder_name')
    .is('embedding', null)
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!tools || tools.length === 0) {
    return NextResponse.json({ message: 'All tools already have embeddings.', count: 0 });
  }

  let processed = 0;
  let failed = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < tools.length; i += BATCH_SIZE) {
    const batch = tools.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (tool) => {
      try {
        const content = [
          `Tool: ${tool.name}`,
          `Description: ${tool.description || ''}`,
          `Category: ${tool.main_category || ''}`,
          `Pricing: ${tool.pricing_model || ''}`,
          `Features: ${Array.isArray(tool.key_features) ? tool.key_features.join(', ') : tool.key_features || ''}`,
          `Use Case: ${tool.use_case || ''}`,
          `Founder: ${tool.founder_name || ''}`,
        ].join('. ').trim();

        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: content,
          encoding_format: 'float',
        });

        const embedding = response.data[0].embedding;

        await supabase
          .from('tools')
          .update({ embedding })
          .eq('id', tool.id);

        processed++;
      } catch {
        failed++;
      }
    }));
  }

  return NextResponse.json({
    success: true,
    processed,
    failed,
    message: `Generated embeddings for ${processed} tools. ${failed} failed.`,
  });
}
