/**
 * OpenAI Client
 * Initializes and configures the OpenAI SDK client for embeddings
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Get or create the OpenAI client singleton
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Test the OpenAI connection
 */
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = getOpenAIClient();
    // Test with a minimal embedding request
    await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test',
      dimensions: 1536,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { OpenAI };

