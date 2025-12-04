/**
 * @deprecated This module is deprecated. Use grok-service.ts instead.
 * All exports are now re-exported from grok-service for backwards compatibility.
 * This file will be removed in a future version.
 */

// Re-export everything from grok-service for backwards compatibility
export {
  createChatCompletion,
  createStreamingChatCompletion,
  getContextLimit,
  type ChatMessage,
  type GrokRequestOptions as ClaudeRequestOptions,
  type GrokResponse as ClaudeResponse,
} from './grok-service';
