/**
 * Dynamic Re-Retrieval for RAG
 *
 * When tool results contain unexpected terms (probate, lien, etc.),
 * this module fetches additional RAG context to help the AI
 * provide more accurate and informed responses.
 *
 * This is triggered AFTER tool execution, before the AI generates
 * its response, allowing it to have relevant context for interpreting
 * tool results.
 */

import { searchDocuments, type SearchResult } from './search';

export interface RetrievalTrigger {
  terms: string[];
  categories: string[];
  urgency: 'high' | 'medium' | 'low';
}

/**
 * Terms that trigger additional RAG retrieval when found in tool results
 * Grouped by topic area
 */
export const RETRIEVAL_TRIGGERS: Record<string, RetrievalTrigger> = {
  // Legal/Title Issues - HIGH priority
  legal_issues: {
    terms: [
      'probate', 'lien', 'judgment', 'bankruptcy', 'title issue',
      'encumbrance', 'lis pendens', 'mechanic lien', 'tax lien',
      'quiet title', 'deed restriction', 'easement',
    ],
    categories: ['Risk Factors', 'Legal & Compliance'],
    urgency: 'high',
  },

  // Deal Structure Terms - MEDIUM priority
  deal_structure: {
    terms: [
      'subject-to', 'seller financing', 'lease option', 'land contract',
      'wraparound', 'novation', 'assignment', 'double close',
      'simultaneous close', 'transactional funding',
    ],
    categories: ['Deal Analysis', 'Legal & Compliance', 'Fundamentals'],
    urgency: 'medium',
  },

  // Risk Signals - HIGH priority
  risk_signals: {
    terms: [
      'red flag', 'fraud', 'warning', 'deal killer', 'suspicious',
      'undisclosed', 'unreported', 'violation', 'code enforcement',
      'condemned', 'uninhabitable', 'hazardous',
    ],
    categories: ['Risk Factors'],
    urgency: 'high',
  },

  // Motivation Indicators - MEDIUM priority
  motivation_indicators: {
    terms: [
      'distress', 'foreclosure', 'pre-foreclosure', 'delinquent',
      'behind on', 'default', 'notice of sale', 'auction',
      'estate sale', 'inherited', 'divorce', 'relocation',
    ],
    categories: ['Filter System', 'Fundamentals'],
    urgency: 'medium',
  },

  // Valuation Terms - MEDIUM priority
  valuation_terms: {
    terms: [
      'below market', 'above market', 'appreciation', 'depreciation',
      'market correction', 'bubble', 'overvalued', 'undervalued',
      'cash flow negative', 'negative equity', 'underwater',
    ],
    categories: ['Market Analysis', 'Deal Analysis', 'Fundamentals'],
    urgency: 'medium',
  },

  // Property Condition - MEDIUM priority
  property_condition: {
    terms: [
      'foundation issue', 'structural damage', 'mold', 'asbestos',
      'lead paint', 'termite', 'pest infestation', 'water damage',
      'fire damage', 'unpermitted', 'illegal addition',
    ],
    categories: ['Risk Factors', 'Deal Analysis'],
    urgency: 'medium',
  },

  // Buyer/Exit Related - LOW priority
  buyer_exit: {
    terms: [
      'no buyers', 'buyer fell through', 'assignment failed',
      'proof of funds', 'hard money', 'private lender',
      'inspection contingency', 'appraisal contingency',
    ],
    categories: ['Buyer Intelligence', 'Deal Analysis'],
    urgency: 'low',
  },
};

export interface ToolResultAnalysis {
  unexpectedTerms: string[];
  suggestedCategories: string[];
  urgency: 'high' | 'medium' | 'low' | 'none';
  shouldRetrieve: boolean;
  triggerGroups: string[];
}

/**
 * Analyze a tool result for terms that warrant additional RAG retrieval
 */
export function analyzeToolResult(
  toolName: string,
  toolOutput: unknown,
  existingCategories: string[] = []
): ToolResultAnalysis {
  // Convert tool output to searchable string
  const outputStr = typeof toolOutput === 'string'
    ? toolOutput.toLowerCase()
    : JSON.stringify(toolOutput).toLowerCase();

  const unexpectedTerms: string[] = [];
  const suggestedCategories = new Set<string>();
  const triggerGroups: string[] = [];
  let highestUrgency: 'high' | 'medium' | 'low' | 'none' = 'none';

  const existingCatSet = new Set(existingCategories);

  // Check each trigger group
  for (const [groupName, trigger] of Object.entries(RETRIEVAL_TRIGGERS)) {
    for (const term of trigger.terms) {
      if (outputStr.includes(term.toLowerCase())) {
        // Found a trigger term
        unexpectedTerms.push(term);
        triggerGroups.push(groupName);

        // Add categories if not already fetched
        for (const category of trigger.categories) {
          if (!existingCatSet.has(category)) {
            suggestedCategories.add(category);
          }
        }

        // Track highest urgency
        if (trigger.urgency === 'high') {
          highestUrgency = 'high';
        } else if (trigger.urgency === 'medium' && highestUrgency !== 'high') {
          highestUrgency = 'medium';
        } else if (trigger.urgency === 'low' && highestUrgency === 'none') {
          highestUrgency = 'low';
        }
      }
    }
  }

  // Decide if we should retrieve
  const shouldRetrieve = unexpectedTerms.length > 0 &&
    suggestedCategories.size > 0 &&
    highestUrgency !== 'none';

  return {
    unexpectedTerms: [...new Set(unexpectedTerms)],
    suggestedCategories: Array.from(suggestedCategories),
    urgency: highestUrgency,
    shouldRetrieve,
    triggerGroups: [...new Set(triggerGroups)],
  };
}

export interface DynamicRetrievalResult {
  additionalContext: string;
  sources: Array<{ title: string; category: string; slug: string }>;
  retrievedCategories: string[];
}

/**
 * Perform dynamic retrieval based on tool result analysis
 */
export async function dynamicRetrieve(
  analysis: ToolResultAnalysis,
  existingDocIds: string[] = [],
  options: { limit?: number; threshold?: number } = {}
): Promise<DynamicRetrievalResult> {
  const { limit = 3, threshold = 0.5 } = options;

  if (!analysis.shouldRetrieve || analysis.suggestedCategories.length === 0) {
    return {
      additionalContext: '',
      sources: [],
      retrievedCategories: [],
    };
  }

  try {
    // Build a search query from the unexpected terms
    const searchQuery = analysis.unexpectedTerms.join(' ');

    // Search with suggested categories
    const results = await searchDocuments(searchQuery, {
      limit,
      threshold,
      categories: analysis.suggestedCategories,
    });

    // Filter out already-fetched documents
    const existingDocSet = new Set(existingDocIds);
    const newResults = results.filter(r => !existingDocSet.has(r.documentId));

    if (newResults.length === 0) {
      return {
        additionalContext: '',
        sources: [],
        retrievedCategories: [],
      };
    }

    // Build additional context
    const contextParts: string[] = [];
    const sources: Array<{ title: string; category: string; slug: string }> = [];
    const retrievedCategories = new Set<string>();

    for (const result of newResults) {
      contextParts.push(`### ${result.metadata.title}\n${result.content}`);
      sources.push({
        title: result.metadata.title,
        category: result.metadata.category,
        slug: result.metadata.slug,
      });
      retrievedCategories.add(result.metadata.category);
    }

    return {
      additionalContext: contextParts.join('\n\n'),
      sources,
      retrievedCategories: Array.from(retrievedCategories),
    };
  } catch (error) {
    console.error('[DynamicRetrieval] Error during retrieval:', error);
    return {
      additionalContext: '',
      sources: [],
      retrievedCategories: [],
    };
  }
}

/**
 * Quick check if a tool result might need re-retrieval
 * (Faster than full analysis, for filtering)
 */
export function mightNeedReRetrieval(toolOutput: unknown): boolean {
  const outputStr = typeof toolOutput === 'string'
    ? toolOutput.toLowerCase()
    : JSON.stringify(toolOutput).toLowerCase();

  // Check high-priority terms only for quick filtering
  const highPriorityTerms = [
    'probate', 'lien', 'bankruptcy', 'foreclosure', 'fraud',
    'red flag', 'title issue', 'code violation', 'condemned',
  ];

  return highPriorityTerms.some(term => outputStr.includes(term));
}

/**
 * Get all trigger terms for a specific urgency level
 */
export function getTriggerTermsByUrgency(urgency: 'high' | 'medium' | 'low'): string[] {
  const terms: string[] = [];

  for (const trigger of Object.values(RETRIEVAL_TRIGGERS)) {
    if (trigger.urgency === urgency) {
      terms.push(...trigger.terms);
    }
  }

  return [...new Set(terms)];
}
