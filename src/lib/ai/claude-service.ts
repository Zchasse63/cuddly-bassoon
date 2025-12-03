/**
 * Claude Service
 * High-level service for interacting with Claude AI models
 */

import type { MessageParam, ContentBlock } from '@anthropic-ai/sdk/resources/messages';

import { getAnthropicClient } from './anthropic';
import {
  CLAUDE_MODELS,
  ClaudeModelId,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  MODEL_CONTEXT_LIMITS,
} from './models';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequestOptions {
  model?: ClaudeModelId;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

export interface ClaudeResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
}

/**
 * Create a chat completion with Claude
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: ClaudeRequestOptions = {}
): Promise<ClaudeResponse> {
  const client = getAnthropicClient();

  const {
    model = CLAUDE_MODELS.SONNET,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
    stopSequences,
  } = options;

  const anthropicMessages: MessageParam[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: anthropicMessages,
    stop_sequences: stopSequences,
  });

  const textContent = response.content.find(
    (block): block is ContentBlock & { type: 'text' } => block.type === 'text'
  );

  return {
    content: textContent?.text ?? '',
    model: response.model,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    stopReason: response.stop_reason,
  };
}

/**
 * Create a streaming chat completion with Claude
 */
export async function* createStreamingChatCompletion(
  messages: ChatMessage[],
  options: ClaudeRequestOptions = {}
): AsyncGenerator<string, ClaudeResponse, undefined> {
  const client = getAnthropicClient();

  const {
    model = CLAUDE_MODELS.SONNET,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    systemPrompt,
    stopSequences,
  } = options;

  const anthropicMessages: MessageParam[] = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let responseModel: ClaudeModelId = model;
  let stopReason: string | null = null;

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: anthropicMessages,
    stop_sequences: stopSequences,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta;
      if ('text' in delta) {
        fullContent += delta.text;
        yield delta.text;
      }
    } else if (event.type === 'message_start') {
      // Cast to ClaudeModelId as we know we're using Claude models
      responseModel = event.message.model as ClaudeModelId;
      inputTokens = event.message.usage.input_tokens;
    } else if (event.type === 'message_delta') {
      outputTokens = event.usage.output_tokens;
      stopReason = event.delta.stop_reason;
    }
  }

  return {
    content: fullContent,
    model: responseModel,
    usage: { inputTokens, outputTokens },
    stopReason,
  };
}

/**
 * Get context limit for a model
 */
export function getContextLimit(model: ClaudeModelId): number {
  return MODEL_CONTEXT_LIMITS[model];
}

