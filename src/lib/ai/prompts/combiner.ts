/**
 * Prompt Combiner
 * Combines prompt layers with context to create complete system prompts
 */

import {
  PROMPT_LAYERS,
  LAYER_1_CORE_IDENTITY,
  LAYER_2_DOMAIN_EXPERTISE,
  LAYER_3_PLATFORM_CAPABILITIES,
  LAYER_4_RESPONSE_GUIDELINES,
  LAYER_5_SAFETY_COMPLIANCE,
} from './layers';
import { ViewContext } from '../context/types';
import { serializeContext } from '../context/capture';

export interface PromptCombinerOptions {
  /** Include all layers (default: true) */
  fullPrompt?: boolean;
  /** Specific layers to include (1-5) */
  layers?: number[];
  /** View context to include */
  viewContext?: ViewContext;
  /** Additional context string */
  additionalContext?: string;
  /** Task-specific instructions */
  taskInstructions?: string;
  /** User preferences */
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  responseLength?: 'concise' | 'detailed';
  technicalLevel?: 'beginner' | 'intermediate' | 'expert';
  focusAreas?: string[];
}

/**
 * Combine prompt layers into a complete system prompt
 */
export function combinePromptLayers(options: PromptCombinerOptions = {}): string {
  const {
    fullPrompt = true,
    layers,
    viewContext,
    additionalContext,
    taskInstructions,
    userPreferences,
  } = options;

  const sections: string[] = [];

  // Add selected layers
  if (fullPrompt && !layers) {
    sections.push(...PROMPT_LAYERS);
  } else if (layers) {
    const layerMap: Record<number, string> = {
      1: LAYER_1_CORE_IDENTITY,
      2: LAYER_2_DOMAIN_EXPERTISE,
      3: LAYER_3_PLATFORM_CAPABILITIES,
      4: LAYER_4_RESPONSE_GUIDELINES,
      5: LAYER_5_SAFETY_COMPLIANCE,
    };
    for (const layerNum of layers) {
      if (layerMap[layerNum]) {
        sections.push(layerMap[layerNum]);
      }
    }
  }

  // Add view context
  if (viewContext) {
    sections.push(`## Current Context\n${serializeContext(viewContext)}`);
  }

  // Add additional context
  if (additionalContext) {
    sections.push(`## Additional Context\n${additionalContext}`);
  }

  // Add task instructions
  if (taskInstructions) {
    sections.push(`## Task Instructions\n${taskInstructions}`);
  }

  // Add user preferences
  if (userPreferences) {
    const prefLines: string[] = ['## User Preferences'];
    if (userPreferences.responseLength) {
      prefLines.push(`- Response Length: ${userPreferences.responseLength}`);
    }
    if (userPreferences.technicalLevel) {
      prefLines.push(`- Technical Level: ${userPreferences.technicalLevel}`);
    }
    if (userPreferences.focusAreas?.length) {
      prefLines.push(`- Focus Areas: ${userPreferences.focusAreas.join(', ')}`);
    }
    sections.push(prefLines.join('\n'));
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Create a minimal prompt for quick tasks
 */
export function createMinimalPrompt(taskInstructions: string): string {
  return combinePromptLayers({
    layers: [1, 5], // Core identity and safety only
    taskInstructions,
  });
}

/**
 * Create a full prompt with view context
 */
export function createContextualPrompt(
  viewContext: ViewContext,
  taskInstructions?: string
): string {
  return combinePromptLayers({
    fullPrompt: true,
    viewContext,
    taskInstructions,
  });
}

/**
 * Create a domain-focused prompt
 */
export function createDomainPrompt(
  additionalContext?: string,
  taskInstructions?: string
): string {
  return combinePromptLayers({
    layers: [1, 2, 4, 5], // Skip platform capabilities
    additionalContext,
    taskInstructions,
  });
}

/**
 * Estimate token count for a combined prompt
 */
export function estimatePromptTokens(options: PromptCombinerOptions): number {
  const prompt = combinePromptLayers(options);
  // Rough estimate: ~4 characters per token
  return Math.ceil(prompt.length / 4);
}

