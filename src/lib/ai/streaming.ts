/**
 * AI Streaming Utilities
 * Provides streaming response handling with Vercel AI SDK
 * Updated December 2025 - Migrated from Anthropic to xAI Grok
 */

import { createXai } from '@ai-sdk/xai';
import { streamText, CoreMessage, LanguageModel } from 'ai';

import { GROK_MODELS, GrokModelId, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from './models';

// Initialize xAI Grok provider
const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

export interface StreamingOptions {
  model?: GrokModelId;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  abortSignal?: AbortSignal;
}

export interface StreamingMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Type for streaming result - using Awaited to infer the correct type
type StreamingResult = Awaited<ReturnType<typeof streamText>>;

/**
 * Get the xAI Grok model for Vercel AI SDK
 */
export function getXaiModel(modelId: GrokModelId = GROK_MODELS.FAST): LanguageModel {
  return xai(modelId);
}

// Backwards compatibility alias
export const getAnthropicModel = getXaiModel;

/**
 * Create a streaming text response
 */
export async function createStreamingResponse(
  messages: StreamingMessage[],
  options: StreamingOptions = {}
): Promise<StreamingResult> {
  const {
    model = GROK_MODELS.FAST,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
    abortSignal,
  } = options;

  const coreMessages: CoreMessage[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const result = await streamText({
    model: xai(model),
    messages: coreMessages,
    system: systemPrompt,
    maxOutputTokens: maxTokens,
    temperature,
    abortSignal,
  });

  return result;
}

/**
 * Convert streaming result to a Response for API routes
 */
export function streamToResponse(result: StreamingResult): Response {
  return result.toTextStreamResponse();
}

/**
 * Stream handler for edge functions
 * Returns a ReadableStream of text chunks
 */
export async function* textStreamGenerator(
  messages: StreamingMessage[],
  options: StreamingOptions = {}
): AsyncGenerator<string, void, unknown> {
  const result = await createStreamingResponse(messages, options);

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

/**
 * Streaming state for client-side tracking
 */
export interface StreamingState {
  isLoading: boolean;
  isStreaming: boolean;
  isComplete: boolean;
  error: Error | null;
  content: string;
}

/**
 * Create initial streaming state
 */
export function createInitialStreamingState(): StreamingState {
  return {
    isLoading: false,
    isStreaming: false,
    isComplete: false,
    error: null,
    content: '',
  };
}

/**
 * Helper to collect stream into a string
 */
export async function collectStream(result: StreamingResult): Promise<{
  text: string;
  usage: { inputTokens: number; outputTokens: number };
}> {
  let text = '';
  for await (const chunk of result.textStream) {
    text += chunk;
  }
  const usage = await result.usage;
  return {
    text,
    usage: {
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
    },
  };
}

