import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

export const runtime = 'edge';

// 1. Define Input Schema (Validation)
const GenerateSchema = z.object({
  prompt: z.string().min(5).max(1000), // Limit length to prevent context overflow
  context: z.array(z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 2. Authentication Check
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 3. Input Validation (Zod)
    const body = await req.json();
    const validation = GenerateSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { prompt, context } = validation.data;

    // 4. Rate Limiting (Supabase-Native)
    // Rule: Max 10 requests per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('endpoint', 'generate')
      .gt('created_at', oneMinuteAgo);

    if (count && count >= 10) {
      return new Response('Rate limit exceeded. Try again in a minute.', { status: 429 });
    }

    // Log this request (Fire and forget)
    await supabase.from('api_usage').insert({
      user_id: user.id,
      endpoint: 'generate'
    });

    // 5. Generate AI Response
    const systemPrompt = `
      You are Currly, an expert software advisor. 
      The user is searching for tools. 
      Here is the data we found: ${JSON.stringify(context)}
      
      Goal: Summarize matches, highlight India-based tools, compare pricing.
      Keep it under 3 sentences.
    `;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: prompt,
    });

    return result.toTextStreamResponse();

  } catch (err) {
    console.error('API Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}