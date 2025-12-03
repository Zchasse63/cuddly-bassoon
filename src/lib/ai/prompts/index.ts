/**
 * Prompt Templates Index
 * Central export for all prompt templates
 */

export {
  BASE_SYSTEM_PROMPT,
  DEAL_ANALYSIS_PROMPT,
  PROPERTY_DESCRIPTION_PROMPT,
  OFFER_LETTER_PROMPT,
  CLASSIFICATION_PROMPT,
} from './base-system';

// Prompt layers
export {
  LAYER_1_CORE_IDENTITY,
  LAYER_2_DOMAIN_EXPERTISE,
  LAYER_3_PLATFORM_CAPABILITIES,
  LAYER_4_RESPONSE_GUIDELINES,
  LAYER_5_SAFETY_COMPLIANCE,
  PROMPT_LAYERS,
  LAYER_METADATA,
} from './layers';

// Prompt combiner
export {
  combinePromptLayers,
  createMinimalPrompt,
  createContextualPrompt,
  createDomainPrompt,
  estimatePromptTokens,
  type PromptCombinerOptions,
  type UserPreferences,
} from './combiner';

/**
 * Template variable replacement
 */
export function fillTemplate(template: string, variables: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return result;
}

/**
 * Template metadata for versioning
 */
export interface PromptVersion {
  id: string;
  version: string;
  lastUpdated: Date;
  description: string;
}

export const PROMPT_VERSIONS: Record<string, PromptVersion> = {
  BASE_SYSTEM: {
    id: 'base_system',
    version: '1.0.0',
    lastUpdated: new Date('2025-12-02'),
    description: 'Core system prompt for the AI assistant',
  },
  DEAL_ANALYSIS: {
    id: 'deal_analysis',
    version: '1.0.0',
    lastUpdated: new Date('2025-12-02'),
    description: 'Prompt for analyzing wholesale deals',
  },
  PROPERTY_DESCRIPTION: {
    id: 'property_description',
    version: '1.0.0',
    lastUpdated: new Date('2025-12-02'),
    description: 'Prompt for generating property descriptions',
  },
  OFFER_LETTER: {
    id: 'offer_letter',
    version: '1.0.0',
    lastUpdated: new Date('2025-12-02'),
    description: 'Prompt for generating offer letters',
  },
  CLASSIFICATION: {
    id: 'classification',
    version: '1.0.0',
    lastUpdated: new Date('2025-12-02'),
    description: 'Prompt for classifying user intent',
  },
};

