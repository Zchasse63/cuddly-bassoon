/**
 * AI Chat Streaming Endpoint
 * POST /api/ai/chat
 * Handles streaming chat responses with Claude models
 */

import { NextRequest } from 'next/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, CoreMessage } from 'ai';
import { z } from 'zod';

import { CLAUDE_MODELS, ClaudeModelId } from '@/lib/ai/models';
import { classifyAndRoute } from '@/lib/ai/router';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.enum([CLAUDE_MODELS.OPUS, CLAUDE_MODELS.SONNET, CLAUDE_MODELS.HAIKU]).optional(),
  systemPrompt: z.string().optional(),
  autoRoute: z.boolean().optional().default(true),
  maxTokens: z.number().optional().default(4096),
  temperature: z.number().min(0).max(1).optional().default(0.7),
});

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid request', details: validatedData.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, model: requestedModel, systemPrompt, autoRoute, maxTokens, temperature } = validatedData.data;

    // Determine which model to use
    let selectedModel: ClaudeModelId = requestedModel || CLAUDE_MODELS.SONNET;

    if (autoRoute && !requestedModel && messages.length > 0) {
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        const routingDecision = await classifyAndRoute(lastUserMessage.content);
        selectedModel = routingDecision.model;
      }
    }

    // Convert messages to CoreMessage format
    const coreMessages: CoreMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Create streaming response
    const result = streamText({
      model: anthropic(selectedModel),
      messages: coreMessages,
      system: systemPrompt,
      maxOutputTokens: maxTokens,
      temperature,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

