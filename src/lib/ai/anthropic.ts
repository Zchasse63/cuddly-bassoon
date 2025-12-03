/**
 * Anthropic Claude Client
 * Initializes and configures the Anthropic SDK client
 */

import Anthropic from '@anthropic-ai/sdk';

import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE, CLAUDE_MODELS } from './models';

let anthropicClient: Anthropic | null = null;

/**
 * Get or create the Anthropic client singleton
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/**
 * Default configuration for Claude requests
 */
export const defaultClaudeConfig = {
  model: CLAUDE_MODELS.SONNET,
  max_tokens: DEFAULT_MAX_TOKENS,
  temperature: DEFAULT_TEMPERATURE,
} as const;

/**
 * Test the Anthropic connection with a simple prompt
 */
export async function testAnthropicConnection(): Promise<{
  success: boolean;
  model: string;
  message?: string;
  error?: string;
}> {
  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: CLAUDE_MODELS.HAIKU,
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say "connected" in one word.' }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    return {
      success: true,
      model: response.model,
      message: textContent?.type === 'text' ? textContent.text : undefined,
    };
  } catch (error) {
    return {
      success: false,
      model: CLAUDE_MODELS.HAIKU,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { Anthropic };

