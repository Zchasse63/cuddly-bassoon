/**
 * AI Model Router
 * Routes tasks to appropriate Claude models based on complexity and requirements
 */

import { CLAUDE_MODELS, ClaudeModelId, getModelByTier, ModelTier } from './models';
import { createChatCompletion } from './claude-service';

// Task categories for routing
export type TaskCategory =
  | 'complex_analysis'
  | 'content_generation'
  | 'document_summarization'
  | 'rag_response'
  | 'offer_letter'
  | 'intent_classification'
  | 'simple_qa'
  | 'data_extraction'
  | 'deal_analysis'
  | 'property_analysis'
  | 'buyer_matching';

// Routing rules mapping task categories to model tiers
const TASK_ROUTING_RULES: Record<TaskCategory, ModelTier> = {
  complex_analysis: 'high',
  deal_analysis: 'high',
  property_analysis: 'high',
  content_generation: 'medium',
  document_summarization: 'medium',
  rag_response: 'medium',
  offer_letter: 'medium',
  buyer_matching: 'medium',
  intent_classification: 'low',
  simple_qa: 'low',
  data_extraction: 'low',
};

export interface RoutingDecision {
  model: ClaudeModelId;
  category: TaskCategory;
  confidence: number;
  reason: string;
}

export interface RouterOptions {
  forceModel?: ClaudeModelId;
  preferSpeed?: boolean;
  preferQuality?: boolean;
}

/**
 * Route a task to the appropriate model based on its category
 */
export function routeByCategory(
  category: TaskCategory,
  options: RouterOptions = {}
): RoutingDecision {
  // Allow manual override
  if (options.forceModel) {
    return {
      model: options.forceModel,
      category,
      confidence: 1.0,
      reason: 'Manual model override',
    };
  }

  let tier = TASK_ROUTING_RULES[category];

  // Adjust tier based on preferences
  if (options.preferSpeed && tier === 'high') {
    tier = 'medium';
  } else if (options.preferQuality && tier === 'low') {
    tier = 'medium';
  }

  return {
    model: getModelByTier(tier),
    category,
    confidence: 1.0,
    reason: `Routed ${category} to ${tier} tier model`,
  };
}

/**
 * Classify a task using Haiku and route to appropriate model
 */
export async function classifyAndRoute(
  userMessage: string,
  options: RouterOptions = {}
): Promise<RoutingDecision> {
  // Allow manual override
  if (options.forceModel) {
    return {
      model: options.forceModel,
      category: 'simple_qa',
      confidence: 1.0,
      reason: 'Manual model override',
    };
  }

  const classificationPrompt = `Classify the following user request into exactly one category.

Categories:
- complex_analysis: Detailed analysis requiring multi-step reasoning
- deal_analysis: Analyzing real estate deals, calculating ROI, evaluating offers
- property_analysis: Deep property evaluation, ARV calculations, comp analysis
- content_generation: Writing descriptions, summaries, or creative content
- document_summarization: Summarizing documents or long text
- rag_response: Answering questions using knowledge base
- offer_letter: Writing offer letters or contracts
- buyer_matching: Matching properties to buyers
- intent_classification: Simple categorization tasks
- simple_qa: Direct questions with straightforward answers
- data_extraction: Extracting structured data from text

User request: "${userMessage}"

Respond with only the category name, nothing else.`;

  try {
    const response = await createChatCompletion(
      [{ role: 'user', content: classificationPrompt }],
      { model: CLAUDE_MODELS.HAIKU, maxTokens: 50, temperature: 0 }
    );

    const category = response.content.trim().toLowerCase() as TaskCategory;
    const validCategories = Object.keys(TASK_ROUTING_RULES);

    if (validCategories.includes(category)) {
      return routeByCategory(category, options);
    }

    // Fallback to simple_qa if classification fails
    return routeByCategory('simple_qa', options);
  } catch {
    // On error, default to Sonnet for safety
    return {
      model: CLAUDE_MODELS.SONNET,
      category: 'simple_qa',
      confidence: 0.5,
      reason: 'Classification failed, using default model',
    };
  }
}

/**
 * Get routing rules for reference
 */
export function getRoutingRules(): Record<TaskCategory, ModelTier> {
  return { ...TASK_ROUTING_RULES };
}

/**
 * Log routing decision for analytics
 */
export function logRoutingDecision(decision: RoutingDecision, userId?: string): void {
  console.log('[AI Router]', {
    model: decision.model,
    category: decision.category,
    confidence: decision.confidence,
    reason: decision.reason,
    userId,
    timestamp: new Date().toISOString(),
  });
}

