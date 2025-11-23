import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
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

  // CHANGED: New method for returning the stream
  return result.toDataStreamResponse();
}