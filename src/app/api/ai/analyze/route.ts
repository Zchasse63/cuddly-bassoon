/**
 * AI Analyze Endpoint
 * POST /api/ai/analyze
 * Analyzes property data and provides deal insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createChatCompletion } from '@/lib/ai/grok-service';
import { GROK_MODELS } from '@/lib/ai/models';
import { DEAL_ANALYSIS_PROMPT } from '@/lib/ai/prompts';
import { parseAIError, getErrorMessage } from '@/lib/ai/errors';
import { withRetry } from '@/lib/ai/retry';
import { trackUsage } from '@/lib/ai/cost-tracker';

const analyzeRequestSchema = z.object({
  property: z.object({
    address: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    propertyType: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    squareFootage: z.number().optional(),
    yearBuilt: z.number().optional(),
    estimatedValue: z.number().optional(),
    askingPrice: z.number().optional(),
    ownershipLength: z.number().optional(),
    ownerType: z.string().optional(),
  }),
  marketData: z
    .object({
      medianHomeValue: z.number().optional(),
      pricePerSqft: z.number().optional(),
      daysOnMarket: z.number().optional(),
    })
    .optional(),
  analysisType: z.enum(['quick', 'detailed', 'investment']).optional().default('detailed'),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = analyzeRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { property, marketData, analysisType, userId } = validated.data;

    // Build the analysis prompt
    const propertyDetails = Object.entries(property)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `- ${formatKey(k)}: ${v}`)
      .join('\n');

    const marketDetails = marketData
      ? Object.entries(marketData)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `- ${formatKey(k)}: ${v}`)
          .join('\n')
      : 'No market data available';

    const userMessage = `Please analyze this property for a wholesale deal opportunity.

## Property Details
${propertyDetails}

## Market Data
${marketDetails}

## Analysis Type
${analysisType === 'quick' ? 'Provide a brief summary' : analysisType === 'investment' ? 'Focus on investment metrics and ROI' : 'Provide a comprehensive analysis'}`;

    const response = await withRetry(
      async () =>
        createChatCompletion([{ role: 'user', content: userMessage }], {
          model: GROK_MODELS.REASONING,
          systemPrompt: DEAL_ANALYSIS_PROMPT,
          maxTokens: analysisType === 'quick' ? 1000 : 4000,
        }),
      { maxRetries: 2 }
    );

    // Track usage
    if (userId) {
      await trackUsage({
        userId,
        model: GROK_MODELS.REASONING,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        feature: 'analyze',
      });
    }

    return NextResponse.json({
      analysis: response.content,
      property: property.address,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('[AI Analyze] Error:', error);
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
