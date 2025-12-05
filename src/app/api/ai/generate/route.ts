/**
 * AI Generate Endpoint
 * POST /api/ai/generate
 * Generates content like property descriptions, offer letters, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createChatCompletion } from '@/lib/ai/claude-service';
import { GROK_MODELS } from '@/lib/ai/models';
import { PROPERTY_DESCRIPTION_PROMPT, OFFER_LETTER_PROMPT } from '@/lib/ai/prompts';
import { parseAIError, getErrorMessage } from '@/lib/ai/errors';
import { withRetry } from '@/lib/ai/retry';
import { trackUsage } from '@/lib/ai/cost-tracker';

const generateRequestSchema = z.object({
  type: z.enum(['property_description', 'offer_letter', 'email', 'sms', 'custom']),
  context: z.record(z.string(), z.unknown()),
  customPrompt: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'urgent', 'casual']).optional().default('professional'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  userId: z.string().optional(),
});

const PROMPTS: Record<string, string> = {
  property_description: PROPERTY_DESCRIPTION_PROMPT,
  offer_letter: OFFER_LETTER_PROMPT,
  email:
    'Generate a professional email for real estate communication. Be clear, concise, and action-oriented.',
  sms: 'Generate a brief SMS message (under 160 characters) for real estate communication. Be direct and include a clear call to action.',
  custom: '',
};

const LENGTH_TOKENS: Record<string, number> = {
  short: 500,
  medium: 1500,
  long: 3000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { type, context, customPrompt, tone, length, userId } = validated.data;

    // Build the system prompt
    let systemPrompt = PROMPTS[type] || '';
    if (type === 'custom' && customPrompt) {
      systemPrompt = customPrompt;
    }

    // Add tone instruction
    systemPrompt += `\n\nTone: ${tone}`;

    // Build user message with context
    const contextStr = Object.entries(context)
      .map(([k, v]) => `${formatKey(k)}: ${JSON.stringify(v)}`)
      .join('\n');

    const userMessage = `Generate the requested content using this information:\n\n${contextStr}`;

    const response = await withRetry(
      async () =>
        createChatCompletion([{ role: 'user', content: userMessage }], {
          model: GROK_MODELS.FAST,
          systemPrompt,
          maxTokens: LENGTH_TOKENS[length],
        }),
      { maxRetries: 2 }
    );

    // Track usage
    if (userId) {
      await trackUsage({
        userId,
        model: GROK_MODELS.FAST,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        feature: `generate_${type}`,
      });
    }

    return NextResponse.json({
      content: response.content,
      type,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('[AI Generate] Error:', error);
    const aiError = parseAIError(error);
    return NextResponse.json(
      { error: getErrorMessage(aiError), code: aiError.code },
      { status: aiError.statusCode }
    );
  }
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}
