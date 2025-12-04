/**
 * Anthropic Claude Client
 * @deprecated This module is deprecated. Use xai.ts instead.
 * Kept for backwards compatibility during migration.
 * Updated December 2025 - Now wraps xAI Grok functionality
 */

import { getXaiProvider, testXaiConnection, defaultGrokConfig } from './xai';
import { GROK_MODELS } from './models';

/**
 * @deprecated Use getXaiProvider() from './xai' instead
 * This function now returns the xAI provider for backwards compatibility
 */
export function getAnthropicClient() {
  console.warn('[DEPRECATED] getAnthropicClient is deprecated. Use getXaiProvider() from ./xai instead.');
  return getXaiProvider();
}

/**
 * @deprecated Use defaultGrokConfig from './xai' instead
 */
export const defaultClaudeConfig = defaultGrokConfig;

/**
 * @deprecated Use testXaiConnection() from './xai' instead
 */
export async function testAnthropicConnection(): Promise<{
  success: boolean;
  model: string;
  message?: string;
  error?: string;
}> {
  console.warn('[DEPRECATED] testAnthropicConnection is deprecated. Use testXaiConnection() from ./xai instead.');
  return testXaiConnection();
}

// Re-export xAI functionality for backwards compatibility
export { getXaiProvider, testXaiConnection, GROK_MODELS };

