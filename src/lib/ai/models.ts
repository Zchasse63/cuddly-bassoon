/**
 * AI Model Constants and Configuration
 * Defines available Claude 4.5 models with their capabilities and limits
 * Updated December 2025
 */

// Claude 4.5 Model Identifiers (from platform.claude.com/docs)
export const CLAUDE_MODELS = {
  OPUS: 'claude-opus-4-5-20251101',     // Premium model - maximum intelligence
  SONNET: 'claude-sonnet-4-5-20250929', // Best balance of intelligence, speed, cost
  HAIKU: 'claude-haiku-4-5-20251001',   // Fastest, most cost-efficient
} as const;

export type ClaudeModelId = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

// Model Display Names
export const MODEL_DISPLAY_NAMES: Record<ClaudeModelId, string> = {
  [CLAUDE_MODELS.OPUS]: 'Claude Opus 4.5',
  [CLAUDE_MODELS.SONNET]: 'Claude Sonnet 4.5',
  [CLAUDE_MODELS.HAIKU]: 'Claude Haiku 4.5',
};

// Context Window Limits (input tokens)
export const MODEL_CONTEXT_LIMITS: Record<ClaudeModelId, number> = {
  [CLAUDE_MODELS.OPUS]: 200000,
  [CLAUDE_MODELS.SONNET]: 200000, // Supports 1M tokens with beta header
  [CLAUDE_MODELS.HAIKU]: 200000,
};

// Maximum Output Tokens
export const MODEL_OUTPUT_LIMITS: Record<ClaudeModelId, number> = {
  [CLAUDE_MODELS.OPUS]: 64000,
  [CLAUDE_MODELS.SONNET]: 64000,
  [CLAUDE_MODELS.HAIKU]: 64000,
};

// Cost per 1M tokens (in USD) - from platform.claude.com/docs
export const MODEL_COSTS = {
  [CLAUDE_MODELS.OPUS]: { input: 5, output: 25 },
  [CLAUDE_MODELS.SONNET]: { input: 3, output: 15 },
  [CLAUDE_MODELS.HAIKU]: { input: 1, output: 5 },
} as const;

// Model tier for routing decisions
export type ModelTier = 'high' | 'medium' | 'low';

export const MODEL_TIERS: Record<ClaudeModelId, ModelTier> = {
  [CLAUDE_MODELS.OPUS]: 'high',
  [CLAUDE_MODELS.SONNET]: 'medium',
  [CLAUDE_MODELS.HAIKU]: 'low',
};

// Get model by tier
export function getModelByTier(tier: ModelTier): ClaudeModelId {
  switch (tier) {
    case 'high':
      return CLAUDE_MODELS.OPUS;
    case 'medium':
      return CLAUDE_MODELS.SONNET;
    case 'low':
      return CLAUDE_MODELS.HAIKU;
    default:
      return CLAUDE_MODELS.SONNET;
  }
}

// Model capabilities for routing
export interface ModelCapabilities {
  complexReasoning: boolean;
  codeGeneration: boolean;
  fastResponse: boolean;
  costEfficient: boolean;
}

export const MODEL_CAPABILITIES: Record<ClaudeModelId, ModelCapabilities> = {
  [CLAUDE_MODELS.OPUS]: {
    complexReasoning: true,
    codeGeneration: true,
    fastResponse: false,
    costEfficient: false,
  },
  [CLAUDE_MODELS.SONNET]: {
    complexReasoning: true,
    codeGeneration: true,
    fastResponse: true,
    costEfficient: true,
  },
  [CLAUDE_MODELS.HAIKU]: {
    complexReasoning: false,
    codeGeneration: false,
    fastResponse: true,
    costEfficient: true,
  },
};

// Default model settings
export const DEFAULT_MODEL = CLAUDE_MODELS.SONNET;
export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TEMPERATURE = 0.7;

// OpenAI Embedding Model (reference from embedder.ts)
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

