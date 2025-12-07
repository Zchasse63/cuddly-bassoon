/**
 * Query Reformulator for RAG
 *
 * Transforms action-oriented queries into knowledge-seeking queries
 * for better RAG retrieval. Action queries like "Find deals in Miami"
 * get reformulated into knowledge queries like "deal analysis property
 * search criteria price filtering wholesale opportunities Miami market".
 *
 * This improves RAG retrieval by matching against conceptual knowledge
 * rather than trying to match action language.
 */

import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { GROK_MODELS } from '@/lib/ai/models';

// Topic to category mapping (imported concept from generator.ts)
const CONCEPT_CATEGORY_MAP: Record<string, string[]> = {
  // Deal concepts
  'deal': ['Deal Analysis', 'Fundamentals'],
  'analyze': ['Deal Analysis', 'AI Tools'],
  'arv': ['Fundamentals', 'Deal Analysis'],
  'mao': ['Fundamentals', 'Deal Analysis'],
  'repair': ['Fundamentals', 'Deal Analysis'],
  'profit': ['Fundamentals', 'Deal Analysis'],

  // Search/filter concepts
  'search': ['Filter System', 'AI Tools'],
  'filter': ['Filter System'],
  'find': ['Filter System', 'AI Tools'],
  'absentee': ['Filter System'],
  'motivated': ['Filter System', 'Fundamentals'],
  'equity': ['Filter System', 'Fundamentals'],
  'distress': ['Filter System'],

  // Buyer concepts
  'buyer': ['Buyer Intelligence'],
  'investor': ['Buyer Intelligence'],
  'match': ['Buyer Intelligence', 'AI Tools'],
  'cash buyer': ['Buyer Intelligence'],

  // Market concepts
  'market': ['Market Analysis'],
  'neighborhood': ['Market Analysis'],
  'area': ['Market Analysis'],
  'price': ['Market Analysis', 'Deal Analysis'],

  // Data concepts
  'data': ['Data Sources'],
  'property': ['Data Sources', 'Deal Analysis'],
  'permit': ['Data Sources'],
  'census': ['Data Sources', 'Market Analysis'],

  // Tool concepts
  'tool': ['AI Tools'],
  'workflow': ['Platform Workflows', 'AI Tools'],
  'automation': ['Platform Workflows', 'AI Tools'],
  'batch': ['AI Tools'],

  // Risk/legal concepts
  'risk': ['Risk Factors'],
  'lien': ['Risk Factors', 'Legal & Compliance'],
  'title': ['Risk Factors', 'Legal & Compliance'],
  'contract': ['Legal & Compliance'],
};

export interface ReformulatedQuery {
  originalQuery: string;
  knowledgeQuery: string;       // Reformulated for RAG
  concepts: string[];           // Extracted domain concepts
  suggestedCategories: string[]; // KB categories to prioritize
  confidence: number;           // 0-1 confidence score
  isActionQuery: boolean;       // Was this an action query that needed reformulation?
}

export interface ReformulationOptions {
  maxConcepts?: number;
  timeout?: number;
  skipIfKnowledgeSeeking?: boolean;
}

// Patterns that indicate a knowledge-seeking query (don't need reformulation)
const KNOWLEDGE_SEEKING_PATTERNS = [
  /^what is/i,
  /^what are/i,
  /^how (do|does|can|should)/i,
  /^why (do|does|is|are)/i,
  /^explain/i,
  /^define/i,
  /^tell me about/i,
  /^describe/i,
  /meaning of/i,
  /difference between/i,
  /^when (do|should|can)/i,
];

// Patterns that indicate an action query (needs reformulation)
const ACTION_QUERY_PATTERNS = [
  /^find/i,
  /^search/i,
  /^get/i,
  /^show/i,
  /^list/i,
  /^analyze/i,
  /^calculate/i,
  /^score/i,
  /^match/i,
  /^create/i,
  /^generate/i,
  /^run/i,
  /^check/i,
  /^look up/i,
  /^pull/i,
];

let xaiClient: ReturnType<typeof createXai> | null = null;

function getXaiClient() {
  if (!xaiClient) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error('XAI_API_KEY environment variable is required');
    }
    xaiClient = createXai({ apiKey });
  }
  return xaiClient;
}

/**
 * Check if a query is already knowledge-seeking
 */
function isKnowledgeSeekingQuery(query: string): boolean {
  return KNOWLEDGE_SEEKING_PATTERNS.some(pattern => pattern.test(query));
}

/**
 * Check if a query is action-oriented
 */
function isActionQuery(query: string): boolean {
  return ACTION_QUERY_PATTERNS.some(pattern => pattern.test(query));
}

/**
 * Extract concepts from query using keyword matching (fast fallback)
 */
function extractConceptsFromKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const concepts = new Set<string>();

  for (const [keyword] of Object.entries(CONCEPT_CATEGORY_MAP)) {
    if (lowerQuery.includes(keyword)) {
      concepts.add(keyword);
    }
  }

  return Array.from(concepts);
}

/**
 * Map concepts to KB categories
 */
function mapConceptsToCategories(concepts: string[]): string[] {
  const categories = new Set<string>();

  for (const concept of concepts) {
    const lowerConcept = concept.toLowerCase();
    for (const [keyword, cats] of Object.entries(CONCEPT_CATEGORY_MAP)) {
      if (lowerConcept.includes(keyword) || keyword.includes(lowerConcept)) {
        cats.forEach(cat => categories.add(cat));
      }
    }
  }

  return Array.from(categories);
}

/**
 * Reformulate an action query into a knowledge-seeking query using AI
 */
async function reformulateWithAI(
  query: string,
  timeout: number
): Promise<{ knowledgeQuery: string; concepts: string[] } | null> {
  try {
    const xai = getXaiClient();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const result = await generateText({
      model: xai(GROK_MODELS.FAST),
      messages: [{
        role: 'user',
        content: `Convert this real estate action query into domain concepts for knowledge retrieval.

Action Query: "${query}"

Extract the key domain concepts that would help retrieve relevant knowledge. Return JSON only:
{"knowledgeQuery": "<space-separated domain terms and concepts>", "concepts": ["concept1", "concept2", ...]}

Examples:
- "Find deals in Miami under 200k" -> {"knowledgeQuery": "deal analysis property search price filtering wholesale opportunities Miami market affordable properties", "concepts": ["deal_analysis", "property_search", "price_filtering", "market_analysis"]}
- "Score this seller's motivation" -> {"knowledgeQuery": "seller motivation scoring distress signals equity analysis ownership patterns absentee owner indicators", "concepts": ["motivation_scoring", "seller_analysis", "distress_signals"]}
- "Match buyers to 123 Main St" -> {"knowledgeQuery": "buyer matching property criteria cash buyer preferences investor requirements deal assignment", "concepts": ["buyer_matching", "property_criteria", "deal_assignment"]}`,
      }],
      maxOutputTokens: 200,
      temperature: 0,
      abortSignal: controller.signal,
    });

    clearTimeout(timeoutId);

    const parsed = JSON.parse(result.text);
    return {
      knowledgeQuery: parsed.knowledgeQuery || query,
      concepts: parsed.concepts || [],
    };
  } catch (error) {
    // Timeout or parse error - return null to use fallback
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[QueryReformulator] AI reformulation timed out, using fallback');
    }
    return null;
  }
}

/**
 * Main function: Reformulate a query for better RAG retrieval
 *
 * @param query - The original user query
 * @param options - Configuration options
 * @returns ReformulatedQuery with knowledge-seeking version and extracted concepts
 */
export async function reformulateForRAG(
  query: string,
  options: ReformulationOptions = {}
): Promise<ReformulatedQuery> {
  const {
    maxConcepts = 6,
    timeout = 1500,
    skipIfKnowledgeSeeking = true,
  } = options;

  // Quick check: if already knowledge-seeking, minimal reformulation needed
  if (skipIfKnowledgeSeeking && isKnowledgeSeekingQuery(query)) {
    const concepts = extractConceptsFromKeywords(query);
    const categories = mapConceptsToCategories(concepts);

    return {
      originalQuery: query,
      knowledgeQuery: query,
      concepts: concepts.slice(0, maxConcepts),
      suggestedCategories: categories,
      confidence: 0.9,
      isActionQuery: false,
    };
  }

  const isAction = isActionQuery(query);

  // For action queries, try AI reformulation with timeout
  if (isAction) {
    const aiResult = await reformulateWithAI(query, timeout);

    if (aiResult) {
      const categories = mapConceptsToCategories(aiResult.concepts);

      return {
        originalQuery: query,
        knowledgeQuery: aiResult.knowledgeQuery,
        concepts: aiResult.concepts.slice(0, maxConcepts),
        suggestedCategories: categories,
        confidence: 0.85,
        isActionQuery: true,
      };
    }
  }

  // Fallback: keyword extraction
  const concepts = extractConceptsFromKeywords(query);
  const categories = mapConceptsToCategories(concepts);

  // Build knowledge query from extracted concepts
  const knowledgeQuery = concepts.length > 0
    ? `${query} ${concepts.join(' ')}`
    : query;

  return {
    originalQuery: query,
    knowledgeQuery,
    concepts: concepts.slice(0, maxConcepts),
    suggestedCategories: categories,
    confidence: concepts.length > 0 ? 0.7 : 0.5,
    isActionQuery: isAction,
  };
}

/**
 * Quick concept extraction without AI (for low-latency scenarios)
 */
export function extractConcepts(query: string): string[] {
  return extractConceptsFromKeywords(query);
}

/**
 * Get suggested categories for a query without full reformulation
 */
export function getSuggestedCategories(query: string): string[] {
  const concepts = extractConceptsFromKeywords(query);
  return mapConceptsToCategories(concepts);
}
