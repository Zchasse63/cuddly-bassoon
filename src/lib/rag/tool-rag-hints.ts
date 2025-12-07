/**
 * Tool-Aware RAG Hints
 *
 * Pre-associates AI tools with relevant RAG categories so domain
 * knowledge is fetched proactively when certain tools are likely
 * to be used.
 *
 * This allows the AI to have relevant context BEFORE using tools,
 * improving response quality and accuracy.
 */

import type { QueryClassification } from './generator';

export interface ToolRAGHint {
  categories: string[];    // KB categories to prioritize
  keywords: string[];      // Additional search keywords
  priority: 'high' | 'medium' | 'low';
}

/**
 * Map of tool IDs to their RAG hints
 * Tools are grouped by category for easier maintenance
 */
export const TOOL_RAG_HINTS: Record<string, ToolRAGHint> = {
  // ============================================
  // DEAL ANALYSIS TOOLS
  // ============================================
  'deal_analysis.analyze': {
    categories: ['Fundamentals', 'Deal Analysis', 'AI Tools'],
    keywords: ['arv', 'mao', 'repair', '70% rule', 'deal analysis'],
    priority: 'high',
  },
  'deal_analysis.calculate_mao': {
    categories: ['Fundamentals', 'Deal Analysis'],
    keywords: ['maximum allowable offer', 'formula', 'mao calculation'],
    priority: 'high',
  },
  'deal_analysis.score': {
    categories: ['Deal Analysis', 'Fundamentals'],
    keywords: ['deal scoring', 'evaluation', 'quality'],
    priority: 'medium',
  },

  // ============================================
  // PROPERTY SEARCH TOOLS
  // ============================================
  'property_search.search': {
    categories: ['Filter System', 'Fundamentals', 'AI Tools'],
    keywords: ['filter', 'search', 'property criteria'],
    priority: 'medium',
  },
  'property_search.advanced': {
    categories: ['Filter System', 'AI Tools'],
    keywords: ['advanced filter', 'list stacking', 'criteria'],
    priority: 'medium',
  },

  // ============================================
  // MOTIVATION & OWNER TOOLS
  // ============================================
  'motivation.score_owner': {
    categories: ['Filter System', 'Fundamentals', 'AI Tools'],
    keywords: ['motivation', 'seller', 'distress signals', 'absentee'],
    priority: 'high',
  },
  'motivation.batch_score': {
    categories: ['Filter System', 'Fundamentals'],
    keywords: ['batch scoring', 'motivation signals'],
    priority: 'medium',
  },
  'owner.classify': {
    categories: ['Filter System', 'Fundamentals'],
    keywords: ['owner type', 'absentee', 'investor', 'classification'],
    priority: 'medium',
  },
  'owner.get_portfolio': {
    categories: ['Filter System', 'Buyer Intelligence'],
    keywords: ['portfolio', 'multiple properties', 'owner analysis'],
    priority: 'medium',
  },

  // ============================================
  // BUYER MANAGEMENT TOOLS
  // ============================================
  'buyer_management.match_buyers_to_property': {
    categories: ['Buyer Intelligence', 'AI Tools'],
    keywords: ['buyer criteria', 'cash buyer', 'matching'],
    priority: 'high',
  },
  'buyer_management.get_buyer_insights': {
    categories: ['Buyer Intelligence'],
    keywords: ['buyer analysis', 'preferences', 'activity'],
    priority: 'medium',
  },
  'buyer_management.search_buyers': {
    categories: ['Buyer Intelligence'],
    keywords: ['buyer list', 'investor search'],
    priority: 'medium',
  },
  'buyer_management.analyze_buyer_activity': {
    categories: ['Buyer Intelligence'],
    keywords: ['buyer behavior', 'purchase history'],
    priority: 'low',
  },

  // ============================================
  // MARKET ANALYSIS TOOLS
  // ============================================
  'market.analyze': {
    categories: ['Market Analysis', 'AI Tools'],
    keywords: ['market trends', 'statistics', 'area analysis'],
    priority: 'high',
  },
  'market.compare': {
    categories: ['Market Analysis'],
    keywords: ['market comparison', 'submarket', 'area'],
    priority: 'medium',
  },
  'market.get_statistics': {
    categories: ['Market Analysis', 'Data Sources'],
    keywords: ['dom', 'price trends', 'inventory'],
    priority: 'medium',
  },

  // ============================================
  // PROPERTY DETAIL TOOLS
  // ============================================
  'property.details': {
    categories: ['Data Sources', 'Deal Analysis'],
    keywords: ['property data', 'characteristics', 'features'],
    priority: 'medium',
  },
  'property.valuation': {
    categories: ['Fundamentals', 'Data Sources', 'Deal Analysis'],
    keywords: ['avm', 'valuation', 'arv', 'comparable'],
    priority: 'high',
  },
  'property.owner': {
    categories: ['Filter System', 'Data Sources'],
    keywords: ['owner information', 'ownership', 'mailing address'],
    priority: 'medium',
  },
  'property.issues': {
    categories: ['Risk Factors', 'Legal & Compliance'],
    keywords: ['lien', 'title', 'red flags', 'issues'],
    priority: 'high',
  },
  'property.comps': {
    categories: ['Fundamentals', 'Deal Analysis'],
    keywords: ['comparable sales', 'comps', 'arv calculation'],
    priority: 'high',
  },

  // ============================================
  // PERMIT & CONTRACTOR TOOLS
  // ============================================
  'permits.get_history': {
    categories: ['Data Sources', 'Deal Analysis'],
    keywords: ['permit history', 'renovation', 'construction'],
    priority: 'medium',
  },
  'permits.analyze_activity': {
    categories: ['Data Sources', 'Market Analysis'],
    keywords: ['permit activity', 'renovation trends'],
    priority: 'low',
  },
  'contractor.search': {
    categories: ['Data Sources'],
    keywords: ['contractor', 'builder', 'renovation'],
    priority: 'low',
  },
  'contractor.details': {
    categories: ['Data Sources'],
    keywords: ['contractor quality', 'permit history'],
    priority: 'low',
  },

  // ============================================
  // DEAL PIPELINE TOOLS
  // ============================================
  'deal.create': {
    categories: ['Deal Analysis', 'Platform Workflows'],
    keywords: ['deal pipeline', 'new deal', 'acquisition'],
    priority: 'medium',
  },
  'deal.update_stage': {
    categories: ['Platform Workflows'],
    keywords: ['deal stage', 'pipeline', 'progress'],
    priority: 'low',
  },
  'deal.generate_offer_strategy': {
    categories: ['Negotiations', 'Deal Analysis'],
    keywords: ['offer strategy', 'negotiation', 'pricing'],
    priority: 'high',
  },

  // ============================================
  // CRM & LEAD TOOLS
  // ============================================
  'crm.create_lead_list': {
    categories: ['Filter System', 'Platform Workflows'],
    keywords: ['lead list', 'list building', 'prospecting'],
    priority: 'medium',
  },
  'crm.rank_by_motivation': {
    categories: ['Filter System', 'Fundamentals'],
    keywords: ['motivation ranking', 'lead prioritization'],
    priority: 'medium',
  },
  'crm.suggest_outreach': {
    categories: ['Outreach & Communication', 'Platform Workflows'],
    keywords: ['outreach', 'follow-up', 'communication'],
    priority: 'medium',
  },

  // ============================================
  // COMMUNICATION TOOLS
  // ============================================
  'notification.send_sms': {
    categories: ['Outreach & Communication'],
    keywords: ['sms', 'text message', 'marketing'],
    priority: 'low',
  },
  'notification.send_email': {
    categories: ['Outreach & Communication'],
    keywords: ['email', 'communication', 'marketing'],
    priority: 'low',
  },
  'comms.generate_talking_points': {
    categories: ['Negotiations', 'Outreach & Communication'],
    keywords: ['talking points', 'script', 'conversation'],
    priority: 'medium',
  },

  // ============================================
  // DOCUMENT GENERATION TOOLS
  // ============================================
  'document.generate_offer_letter': {
    categories: ['Legal & Compliance', 'Negotiations'],
    keywords: ['offer letter', 'contract', 'agreement'],
    priority: 'high',
  },
  'document.generate_buyer_package': {
    categories: ['Buyer Intelligence', 'Deal Analysis'],
    keywords: ['buyer package', 'deal presentation'],
    priority: 'medium',
  },
  'document.generate_property_report': {
    categories: ['Deal Analysis', 'Data Sources'],
    keywords: ['property report', 'analysis summary'],
    priority: 'medium',
  },
};

/**
 * Query patterns that suggest specific tool usage
 */
const QUERY_TOOL_PATTERNS: Array<{ pattern: RegExp; tools: string[] }> = [
  // Deal analysis patterns
  { pattern: /analyz.*deal|deal.*analys|evaluate.*property/i, tools: ['deal_analysis.analyze'] },
  { pattern: /mao|maximum.*offer|allowable.*offer/i, tools: ['deal_analysis.calculate_mao'] },
  { pattern: /arv|after.*repair|repair.*value/i, tools: ['property.valuation', 'property.comps'] },

  // Search patterns
  { pattern: /find.*propert|search.*propert|look.*propert/i, tools: ['property_search.search'] },
  { pattern: /absentee|out.*state.*owner|distant.*owner/i, tools: ['motivation.score_owner', 'owner.classify'] },
  { pattern: /motivat|distress|willing.*sell/i, tools: ['motivation.score_owner'] },

  // Buyer patterns
  { pattern: /match.*buyer|find.*buyer|buyer.*for/i, tools: ['buyer_management.match_buyers_to_property'] },
  { pattern: /buyer.*list|cash.*buyer/i, tools: ['buyer_management.search_buyers'] },

  // Market patterns
  { pattern: /market.*analys|neighborhood|area.*trend/i, tools: ['market.analyze'] },
  { pattern: /compare.*market|market.*vs/i, tools: ['market.compare'] },

  // Risk patterns
  { pattern: /lien|title.*issue|red.*flag|problem.*property/i, tools: ['property.issues'] },

  // Negotiation patterns
  { pattern: /offer.*strateg|negotiat|how.*much.*offer/i, tools: ['deal.generate_offer_strategy'] },
];

/**
 * Get RAG hints for a list of tool IDs
 */
export function getRAGHintsForTools(toolIds: string[]): {
  categories: string[];
  keywords: string[];
} {
  const categories = new Set<string>();
  const keywords = new Set<string>();

  for (const toolId of toolIds) {
    const hint = TOOL_RAG_HINTS[toolId];
    if (hint) {
      hint.categories.forEach(cat => categories.add(cat));
      hint.keywords.forEach(kw => keywords.add(kw));
    }
  }

  return {
    categories: Array.from(categories),
    keywords: Array.from(keywords),
  };
}

/**
 * Predict likely tools based on query content
 */
export function predictLikelyTools(query: string): string[] {
  const likelyTools = new Set<string>();

  for (const { pattern, tools } of QUERY_TOOL_PATTERNS) {
    if (pattern.test(query)) {
      tools.forEach(tool => likelyTools.add(tool));
    }
  }

  return Array.from(likelyTools);
}

/**
 * Get categories for RAG based on query and optional classification
 * Combines query analysis with classification results
 */
export function getToolAwareCategories(
  query: string,
  classification?: QueryClassification | null
): string[] {
  const categories = new Set<string>();

  // Add categories from classification if available
  if (classification?.categories) {
    classification.categories.forEach(cat => categories.add(cat));
  }

  // Predict likely tools and add their categories
  const likelyTools = predictLikelyTools(query);
  const toolHints = getRAGHintsForTools(likelyTools);
  toolHints.categories.forEach(cat => categories.add(cat));

  return Array.from(categories);
}

/**
 * Get high-priority tool hints that should always include KB context
 */
export function getHighPriorityHints(): string[] {
  return Object.entries(TOOL_RAG_HINTS)
    .filter(([, hint]) => hint.priority === 'high')
    .map(([toolId]) => toolId);
}
