import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { GROK_MODELS } from '@/lib/ai/models';

/**
 * Prompt Enhancement API
 *
 * Improves user prompts using AI to make them more effective
 * Uses xAI Grok for enhancement
 */

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    // Use Grok to enhance the prompt
    const result = await generateText({
      model: xai(GROK_MODELS.FAST),
      maxOutputTokens: 500,
      temperature: 0.7,
      system: `You are a prompt enhancement specialist for a real estate AI assistant platform. Your job is to take user prompts and make them more effective by:

1. Adding clarity and specificity
2. Including relevant context
3. Structuring the request logically
4. Maintaining the user's original intent

Return a JSON object with:
{
  "enhanced": "the improved prompt",
  "improvements": ["list of 2-3 improvements made"]
}

Do NOT change the fundamental meaning or add information the user didn't intend. Just make it clearer and more effective.`,
      prompt: `Enhance this prompt for better AI results:\n\n"${prompt}"`,
    });

    // Parse the JSON response
    let enhancement;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      enhancement = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse enhancement JSON:', parseError);
      // Fallback: just return the text as enhanced
      enhancement = {
        enhanced: result.text,
        improvements: ['Improved clarity and structure'],
      };
    }

    return NextResponse.json({
      original: prompt,
      enhanced: enhancement.enhanced,
      improvements: enhancement.improvements || [],
    });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json({ error: 'Failed to enhance prompt' }, { status: 500 });
  }
}
