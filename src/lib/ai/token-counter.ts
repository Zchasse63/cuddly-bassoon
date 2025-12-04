/**
 * Token Counter
 * Utilities for counting and estimating tokens for AI models
 */

import { encode } from 'gpt-tokenizer';

import { GrokModelId, MODEL_CONTEXT_LIMITS, MODEL_OUTPUT_LIMITS } from './models';

// Grok uses a similar tokenization to GPT models
// This provides a reasonable estimate (typically within 10%)
const GROK_TOKEN_MULTIPLIER = 1.1; // Grok tends to use slightly more tokens

export interface TokenCount {
  estimated: number;
  exact?: number;
}

export interface ConversationTokens {
  systemPrompt: number;
  messages: number;
  total: number;
  remaining: number;
  percentUsed: number;
}

/**
 * Estimate token count for text (Grok approximation)
 * Uses GPT tokenizer with a multiplier for Grok compatibility
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) return 0;

  try {
    const gptTokens = encode(text).length;
    return Math.ceil(gptTokens * GROK_TOKEN_MULTIPLIER);
  } catch {
    // Fallback: rough estimate of 4 characters per token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Count tokens in an array of messages
 */
export function countMessageTokens(
  messages: Array<{ role: string; content: string }>
): number {
  let total = 0;

  for (const message of messages) {
    // Add tokens for role markers (approximately 4 tokens per message overhead)
    total += 4;
    total += estimateTokens(message.content);
  }

  return total;
}

/**
 * Analyze token usage in a conversation
 */
export function analyzeConversationTokens(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string | undefined,
  model: GrokModelId
): ConversationTokens {
  const contextLimit = MODEL_CONTEXT_LIMITS[model];
  const outputLimit = MODEL_OUTPUT_LIMITS[model];

  const systemTokens = systemPrompt ? estimateTokens(systemPrompt) : 0;
  const messageTokens = countMessageTokens(messages);
  const total = systemTokens + messageTokens;

  // Reserve space for output tokens
  const availableForInput = contextLimit - outputLimit;
  const remaining = Math.max(0, availableForInput - total);
  const percentUsed = (total / availableForInput) * 100;

  return {
    systemPrompt: systemTokens,
    messages: messageTokens,
    total,
    remaining,
    percentUsed: Math.round(percentUsed * 10) / 10,
  };
}

/**
 * Check if adding content would exceed context limits
 */
export function wouldExceedLimit(
  currentTokens: number,
  additionalContent: string,
  model: GrokModelId,
  reserveForOutput: number = 0
): boolean {
  const additionalTokens = estimateTokens(additionalContent);
  const contextLimit = MODEL_CONTEXT_LIMITS[model];
  const outputReserve = reserveForOutput || MODEL_OUTPUT_LIMITS[model];

  return currentTokens + additionalTokens > contextLimit - outputReserve;
}

/**
 * Truncate messages to fit within context window
 * Preserves system prompt and most recent messages
 */
export function truncateMessages(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string | undefined,
  model: GrokModelId,
  preserveRecent: number = 4
): Array<{ role: string; content: string }> {
  const contextLimit = MODEL_CONTEXT_LIMITS[model];
  const outputLimit = MODEL_OUTPUT_LIMITS[model];
  const maxInputTokens = contextLimit - outputLimit;

  const systemTokens = systemPrompt ? estimateTokens(systemPrompt) : 0;
  let availableTokens = maxInputTokens - systemTokens;

  // Start with most recent messages
  const result: Array<{ role: string; content: string }> = [];
  const reversed = [...messages].reverse();

  for (let i = 0; i < reversed.length; i++) {
    const msg = reversed[i];
    if (!msg) continue;
    const msgTokens = estimateTokens(msg.content) + 4; // Include overhead

    // Always include the most recent preserveRecent messages if possible
    if (i < preserveRecent || availableTokens >= msgTokens) {
      result.unshift(msg);
      availableTokens -= msgTokens;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Get context utilization warning level
 */
export function getContextWarningLevel(
  percentUsed: number
): 'safe' | 'warning' | 'critical' {
  if (percentUsed < 70) return 'safe';
  if (percentUsed < 90) return 'warning';
  return 'critical';
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return tokens.toString();
  return `${(tokens / 1000).toFixed(1)}k`;
}

