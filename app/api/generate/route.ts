import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server'; //
import { cookies } from 'next/headers';

export const runtime = 'edge';

export async function POST(req: Request) {
  // 1. Check Authentication
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response('Unauthorized: You must be logged in to use AI features.', { status: 401 });
  }

  // 2. Proceed with Generation
  const { prompt, context } = await req.json();

  const systemPrompt = `
    You are Currly, an expert software advisor. 
    The user is searching for tools. 
    Here is the data we found in our database: ${JSON.stringify(context)}
    
    Your goal:
    1. Summarize why these specific tools match their search.
    2. Highlight "India-based" tools if present.
    3. Compare the pricing briefly.
    4. Keep it under 3 sentences. Be concise and helpful.
  `;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    prompt: prompt,
  });

  return result.toTextStreamResponse();
}