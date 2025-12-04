/**
 * Grok AI Service
 * High-level service for interacting with xAI Grok models
 * December 2025 - Primary AI service using xAI Grok
 */

import { generateText, streamText, CoreMessage } from 'ai';
import { createXai } from '@ai-sdk/xai';

import {
  GROK_MODELS,
  GrokModelId,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  MODEL_CONTEXT_LIMITS,
} from './models';

// Initialize xAI provider
const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GrokRequestOptions {
  model?: GrokModelId;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

export interface GrokResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
}

/**
 * Create a chat completion with xAI Grok
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: GrokRequestOptions = {}
): Promise<GrokResponse> {
  const {
    model = GROK_MODELS.FAST,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
    stopSequences,
  } = options;

  const coreMessages: CoreMessage[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const result = await generateText({
    model: xai(model),
    messages: coreMessages,
    system: systemPrompt,
    maxOutputTokens: maxTokens,
    temperature,
    stopSequences,
  });

  return {
    content: result.text,
    model: model,
    usage: {
      inputTokens: result.usage?.totalTokens ?? 0,
      outputTokens: result.usage?.totalTokens ?? 0,
    },
    stopReason: result.finishReason ?? null,
  };
}

/**
 * Create a streaming chat completion with xAI Grok
 */
export async function* createStreamingChatCompletion(
  messages: ChatMessage[],
  options: GrokRequestOptions = {}
): AsyncGenerator<string, GrokResponse, undefined> {
  const {
    model = GROK_MODELS.FAST,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
    stopSequences,
  } = options;

  const coreMessages: CoreMessage[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let stopReason: string | null = null;

  const result = streamText({
    model: xai(model),
    messages: coreMessages,
    system: systemPrompt,
    maxOutputTokens: maxTokens,
    temperature,
    stopSequences,
  });

  for await (const chunk of result.textStream) {
    fullContent += chunk;
    yield chunk;
  }

  // Get final usage after stream completes
  const usage = await result.usage;
  const finishReason = await result.finishReason;
  inputTokens = usage?.totalTokens ?? 0;
  outputTokens = usage?.totalTokens ?? 0;
  stopReason = finishReason ?? null;

  return {
    content: fullContent,
    model: model,
    usage: { inputTokens, outputTokens },
    stopReason,
  };
}

/**
 * Get context limit for a model
 */
export function getContextLimit(model: GrokModelId): number {
  return MODEL_CONTEXT_LIMITS[model];
}
