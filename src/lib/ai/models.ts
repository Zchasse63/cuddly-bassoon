/**
 * AI Model Constants and Configuration
 * Defines available xAI Grok models with their capabilities and limits
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

// xAI Grok Model Identifiers (from docs.x.ai)
// Note: FAST and STANDARD use the same model ID (per user requirement: no dumbing down)
export const GROK_MODELS = {
  // High tier: Frontier reasoning model with full capabilities
  REASONING: 'grok-4-1-fast-reasoning',
  // Medium/Low tier: Fast variant without reasoning overhead (full capabilities)
  FAST: 'grok-4-1-fast-non-reasoning',
} as const;

export type GrokModelId = (typeof GROK_MODELS)[keyof typeof GROK_MODELS];

// Model Display Names
export const MODEL_DISPLAY_NAMES: Record<GrokModelId, string> = {
  [GROK_MODELS.REASONING]: 'Grok 4.1 Fast Reasoning',
  [GROK_MODELS.FAST]: 'Grok 4.1 Fast',
};

// Context Window Limits (input tokens) - Grok 4.1 has 2M context
export const MODEL_CONTEXT_LIMITS: Record<GrokModelId, number> = {
  [GROK_MODELS.REASONING]: 2000000,
  [GROK_MODELS.FAST]: 2000000,
};

// Maximum Output Tokens
export const MODEL_OUTPUT_LIMITS: Record<GrokModelId, number> = {
  [GROK_MODELS.REASONING]: 131072,
  [GROK_MODELS.FAST]: 131072,
};

// Cost per 1M tokens (in USD) - xAI pricing (estimated)
export const MODEL_COSTS = {
  [GROK_MODELS.REASONING]: { input: 3, output: 15 },
  [GROK_MODELS.FAST]: { input: 3, output: 15 },
} as const;

// Model tier for routing decisions
export type ModelTier = 'high' | 'medium' | 'low';

export const MODEL_TIERS: Record<GrokModelId, ModelTier> = {
  [GROK_MODELS.REASONING]: 'high',
  [GROK_MODELS.FAST]: 'medium', // Also used for 'low' tier
};

// Get model by tier
export function getModelByTier(tier: ModelTier): GrokModelId {
  switch (tier) {
    case 'high':
      return GROK_MODELS.REASONING;
    case 'medium':
    case 'low': // Low tier uses same model as medium (full capabilities)
      return GROK_MODELS.FAST;
    default:
      return GROK_MODELS.FAST;
  }
}

// Model capabilities for routing
export interface ModelCapabilities {
  complexReasoning: boolean;
  codeGeneration: boolean;
  fastResponse: boolean;
  costEfficient: boolean;
}

export const MODEL_CAPABILITIES: Record<GrokModelId, ModelCapabilities> = {
  [GROK_MODELS.REASONING]: {
    complexReasoning: true,
    codeGeneration: true,
    fastResponse: false,
    costEfficient: false,
  },
  [GROK_MODELS.FAST]: {
    complexReasoning: true,
    codeGeneration: true,
    fastResponse: true,
    costEfficient: true,
  },
};

// Default model settings
export const DEFAULT_MODEL = GROK_MODELS.FAST;
export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TEMPERATURE = 0.7;

// OpenAI Embedding Model (reference from embedder.ts)
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

