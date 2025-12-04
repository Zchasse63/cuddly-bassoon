/**
 * AI Chat Streaming Endpoint
 * POST /api/ai/chat
 * Handles streaming chat responses with xAI Grok models
 * Includes AI tool execution via Vercel AI SDK v5
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

import { NextRequest } from 'next/server';
import { createXai } from '@ai-sdk/xai';
import {
  streamText,
  CoreMessage,
  NoSuchToolError,
  InvalidToolInputError,
} from 'ai';
import { z } from 'zod';

import { GROK_MODELS, GrokModelId } from '@/lib/ai/models';
import { classifyAndRoute } from '@/lib/ai/router';
import {
  ensureToolsInitialized,
  convertToAISDKTools,
  createDefaultContext,
  getActiveToolKeys,
  getToolCount,
} from '@/lib/ai/tools/adapter';
import { ToolCategory } from '@/lib/ai/tools/types';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.enum([GROK_MODELS.REASONING, GROK_MODELS.FAST]).optional(),
  systemPrompt: z.string().optional(),
  autoRoute: z.boolean().optional().default(true),
  maxTokens: z.number().optional().default(4096),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  // Tool-related options
  enableTools: z.boolean().optional().default(true),
  toolCategories: z.array(z.string()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
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

    const {
      messages,
      model: requestedModel,
      systemPrompt,
      autoRoute,
      maxTokens,
      temperature,
      enableTools,
      toolCategories,
      userId,
      sessionId,
    } = validatedData.data;

    // Initialize tools (only runs once)
    await ensureToolsInitialized();

    // Determine which model to use
    let selectedModel: GrokModelId = requestedModel || GROK_MODELS.FAST;

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

    // Create execution context
    const context = createDefaultContext({ userId, sessionId });

    // Get tools if enabled
    const tools = enableTools ? convertToAISDKTools(context) : undefined;

    // Get active tool keys (for limiting available tools by category)
    const activeTools = enableTools && toolCategories?.length
      ? getActiveToolKeys(context, toolCategories as ToolCategory[])
      : undefined;

    // Enhanced system prompt with tool awareness
    const enhancedSystemPrompt = enableTools
      ? `${systemPrompt || 'You are a helpful real estate AI assistant.'}\n\nYou have access to ${getToolCount()} tools to help with real estate tasks including property search, market analysis, deal analysis, map operations, and more. Use these tools when appropriate to provide accurate, data-driven responses.`
      : systemPrompt;

    // Create streaming response with tools
    const result = streamText({
      model: xai(selectedModel),
      messages: coreMessages,
      system: enhancedSystemPrompt,
      maxOutputTokens: maxTokens,
      temperature,
      tools,
      experimental_activeTools: activeTools,
      // Phase 2: onStepFinish for logging
      onStepFinish: async (stepResult) => {
        // Log tool calls if any
        const toolCalls = stepResult.content.filter(
          (part): part is { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown } =>
            'type' in part && part.type === 'tool-call'
        );
        if (toolCalls.length > 0) {
          console.log(`[AI Chat] Tool calls completed:`, toolCalls.map(tc => tc.toolName));
        }
      },
      // Phase 2: Error handling
      onError: async ({ error }) => {
        if (NoSuchToolError.isInstance(error)) {
          console.error('[AI Chat] Unknown tool called:', error.message);
        } else if (InvalidToolInputError.isInstance(error)) {
          console.error('[AI Chat] Invalid tool input:', error.message);
        } else {
          console.error('[AI Chat] Stream error:', error);
        }
      },
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

