/**
 * AI Module Index
 * Central export point for all AI-related functionality
 */

// Anthropic client and configuration
export { getAnthropicClient, testAnthropicConnection, defaultClaudeConfig } from './anthropic';

// OpenAI client
export { getOpenAIClient, testOpenAIConnection } from './openai';

// Model constants and utilities
export {
  CLAUDE_MODELS,
  MODEL_DISPLAY_NAMES,
  MODEL_CONTEXT_LIMITS,
  MODEL_OUTPUT_LIMITS,
  MODEL_COSTS,
  MODEL_TIERS,
  MODEL_CAPABILITIES,
  DEFAULT_MODEL,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  getModelByTier,
  type ClaudeModelId,
  type ModelTier,
  type ModelCapabilities,
} from './models';

// Claude service
export {
  createChatCompletion,
  createStreamingChatCompletion,
  getContextLimit,
  type ChatMessage,
  type ClaudeRequestOptions,
  type ClaudeResponse,
} from './claude-service';

// Embeddings service
export {
  generateEmbedding,
  generateBatchEmbeddings,
  normalizeEmbedding,
  cosineSimilarity,
  formatEmbeddingForPgVector,
  type EmbeddingResult,
  type BatchEmbeddingResult,
} from './embeddings-service';

// Model router
export {
  routeByCategory,
  classifyAndRoute,
  getRoutingRules,
  logRoutingDecision,
  type TaskCategory,
  type RoutingDecision,
  type RouterOptions,
} from './router';

// Streaming utilities
export {
  getAnthropicModel,
  createStreamingResponse,
  streamToResponse,
  textStreamGenerator,
  collectStream,
  createInitialStreamingState,
  type StreamingOptions,
  type StreamingMessage,
  type StreamingState,
} from './streaming';

// Token management
export {
  estimateTokens,
  countMessageTokens,
  analyzeConversationTokens,
  wouldExceedLimit,
  truncateMessages,
  getContextWarningLevel,
  formatTokenCount,
  type TokenCount,
  type ConversationTokens,
} from './token-counter';

// Rate limiting
export {
  checkRateLimit,
  recordRequest,
  type RateLimitStatus,
} from './rate-limiter';

// Cost tracking
export {
  calculateCost,
  trackUsage,
  getUsageSummary,
  estimateCost,
  getCheapestModel,
  type UsageRecord,
  type UsageSummary,
} from './cost-tracker';

// Error handling
export {
  AIError,
  AIRateLimitError,
  AIContextLengthError,
  AIContentFilterError,
  AIConnectionError,
  AIAuthError,
  AIInvalidRequestError,
  parseAnthropicError,
  isRetryableError,
  getErrorMessage,
} from './errors';

// Retry logic
export {
  withRetry,
  makeRetryable,
  withRetryAndFallback,
  createCircuitBreaker,
  type RetryOptions,
} from './retry';

// Prompts
export {
  BASE_SYSTEM_PROMPT,
  DEAL_ANALYSIS_PROMPT,
  PROPERTY_DESCRIPTION_PROMPT,
  OFFER_LETTER_PROMPT,
  CLASSIFICATION_PROMPT,
  fillTemplate,
  PROMPT_VERSIONS,
  // Prompt layers
  LAYER_1_CORE_IDENTITY,
  LAYER_2_DOMAIN_EXPERTISE,
  LAYER_3_PLATFORM_CAPABILITIES,
  LAYER_4_RESPONSE_GUIDELINES,
  LAYER_5_SAFETY_COMPLIANCE,
  PROMPT_LAYERS,
  LAYER_METADATA,
  // Prompt combiner
  combinePromptLayers,
  createMinimalPrompt,
  createContextualPrompt,
  createDomainPrompt,
  estimatePromptTokens,
  type PromptCombinerOptions,
  type UserPreferences,
} from './prompts';

// ViewContext
export * from './context';

// Tools
export {
  toolRegistry,
  executeTool,
  getExecutionLogs,
  getExecutionLog,
  ToolExecutionError,
  executeOrchestrationPlan,
  createSimplePlan,
  registerAllTools,
  type ToolCategory,
  type PermissionLevel,
  type ToolExecutionStatus,
  type ToolDefinition,
  type ToolExecutionContext,
  type ToolExecutionResult,
  type ToolExecutionLog,
  type ToolHandler,
  type RegisteredTool,
  type ToolFilter,
  type ToolOrchestrationPlan,
  type ToolOrchestrationStep,
  type OrchestrationResult,
} from './tools';

