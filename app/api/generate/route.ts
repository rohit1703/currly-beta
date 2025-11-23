import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, context } = await req.json();

  // The "Context" is the list of tools we found in Supabase.
  // We feed this to the AI so it doesn't hallucinate.
  const systemPrompt = `
    You are Currly, an expert software advisor. 
    The user is searching for tools. 
    Here is the data we found in our database: ${JSON.stringify(context)}
    
    Your goal:
    1. Summarize why these specific tools match their search.
    2. Highlight "India-based" tools if present.
    3. Compare the pricing briefly.
    4. Keep it under 3 sentences. Be concise and helpful.
    5. If no tools match, suggest what they might search for instead.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}