/**
 * Response Generator for RAG
 * Generates responses using xAI Grok models with streaming support
 *
 * Features:
 * - Query preprocessing with intent classification (Grok Fast)
 * - Category-based search filtering for improved accuracy
 * - Word-buffered + time-based streaming for smoother output
 * - Performance logging for monitoring
 */

import { createXai } from '@ai-sdk/xai';
import { generateText, streamText } from 'ai';
import { searchDocuments, type SearchResult } from './search';
import { buildContext, formatPrompt, type RAGContext } from './context-builder';
import { ragCache, type CachedRAGResponse } from './cache';
import { GROK_MODELS } from '@/lib/ai/models';

// Buffering configuration
const BUFFER_FLUSH_INTERVAL_MS = 100; // Time-based flush interval

// Logging utility
const LOG_PREFIX = '[RAG]';

interface RAGMetrics {
  queryLength: number;
  classificationMs?: number;
  searchMs?: number;
  generationMs?: number;
  totalMs: number;
  resultsFound: number;
  categories: string[];
  complexity?: string;
}

function logMetrics(metrics: RAGMetrics): void {
  const parts = [
    `query=${metrics.queryLength}chars`,
    metrics.classificationMs !== undefined ? `classify=${metrics.classificationMs}ms` : null,
    `search=${metrics.searchMs}ms`,
    `results=${metrics.resultsFound}`,
    `categories=[${metrics.categories.join(',')}]`,
    metrics.complexity ? `complexity=${metrics.complexity}` : null,
    `total=${metrics.totalMs}ms`,
  ].filter(Boolean);

  console.log(`${LOG_PREFIX} ${parts.join(' ')}`);
}

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

// All 10 knowledge base categories (exact database values)
// Used for validation and reference
const _ALL_CATEGORIES = [
  'Fundamentals',
  'Filter System',
  'Buyer Intelligence',
  'Market Analysis',
  'Deal Analysis',
  'Negotiations',
  'Outreach & Communication',
  'Risk Factors',
  'Legal & Compliance',
  'Case Studies & Examples',
] as const;
void _ALL_CATEGORIES; // Suppress unused warning - kept for documentation

// Topic to category mapping for search filtering
// Comprehensive mapping based on actual document tags and content
const TOPIC_CATEGORY_MAP: Record<string, string[]> = {
  // Fundamentals - core concepts and formulas
  '70% rule': ['Fundamentals'],
  'arv': ['Fundamentals', 'Deal Analysis'],
  'after repair value': ['Fundamentals', 'Deal Analysis'],
  'repair': ['Fundamentals', 'Deal Analysis'],
  'mao': ['Fundamentals', 'Deal Analysis'],
  'maximum allowable offer': ['Fundamentals', 'Deal Analysis'],
  'motivation': ['Fundamentals'],
  'motivated seller': ['Fundamentals', 'Filter System'],
  'comps': ['Fundamentals'],
  'comparable': ['Fundamentals'],
  'closing cost': ['Fundamentals'],
  'wholesale fee': ['Fundamentals'],
  'assignment fee': ['Fundamentals', 'Legal & Compliance'],
  'profit margin': ['Fundamentals'],
  'formula': ['Fundamentals'],
  'calculation': ['Fundamentals', 'Deal Analysis'],

  // Filter System - lead generation and property filters
  'filter': ['Filter System'],
  'absentee': ['Filter System'],
  'probate': ['Filter System'],
  'foreclosure': ['Filter System'],
  'pre-foreclosure': ['Filter System'],
  'tax': ['Filter System', 'Legal & Compliance'],
  'tax lien': ['Filter System'],
  'tax delinquent': ['Filter System'],
  'vacant': ['Filter System'],
  'distress': ['Filter System'],
  'inheritance': ['Filter System'],
  'divorce': ['Filter System'],
  'estate': ['Filter System'],
  'deceased': ['Filter System'],
  'expired listing': ['Filter System'],
  'cancelled listing': ['Filter System'],
  'failed listing': ['Filter System'],
  'out of state': ['Filter System'],
  'distant owner': ['Filter System'],
  'high equity': ['Filter System'],
  'free and clear': ['Filter System'],
  'accidental landlord': ['Filter System'],
  'tired landlord': ['Filter System'],
  'code violation': ['Filter System'],
  'lead': ['Filter System'],
  'list': ['Filter System'],
  'list stacking': ['Filter System'],

  // Buyer Intelligence - cash buyers and investor management
  'buyer': ['Buyer Intelligence'],
  'cash buyer': ['Buyer Intelligence'],
  'investor': ['Buyer Intelligence'],
  'buyer list': ['Buyer Intelligence'],
  'buyer criteria': ['Buyer Intelligence'],
  'buyer relationship': ['Buyer Intelligence'],
  'buyer qualification': ['Buyer Intelligence'],
  'buyer vetting': ['Buyer Intelligence'],
  'buyer scoring': ['Buyer Intelligence'],
  'proof of funds': ['Buyer Intelligence'],
  'pof': ['Buyer Intelligence'],
  'fix and flip': ['Buyer Intelligence', 'Deal Analysis'],
  'brrrr': ['Buyer Intelligence'],
  'rental': ['Buyer Intelligence', 'Market Analysis'],

  // Market Analysis - neighborhood and market research
  'market': ['Market Analysis'],
  'neighborhood': ['Market Analysis'],
  'area': ['Market Analysis'],
  'location': ['Market Analysis'],
  'absorption': ['Market Analysis'],
  'days on market': ['Market Analysis'],
  'dom': ['Market Analysis'],
  'hot market': ['Market Analysis'],
  'buyer market': ['Market Analysis'],
  'seller market': ['Market Analysis'],
  'competition': ['Market Analysis'],
  'supply': ['Market Analysis'],
  'demand': ['Market Analysis'],
  'trend': ['Market Analysis'],
  'price': ['Market Analysis', 'Deal Analysis'],

  // Deal Analysis - property and deal evaluation
  'deal': ['Deal Analysis'],
  'analyze': ['Deal Analysis'],
  'evaluation': ['Deal Analysis'],
  'assessment': ['Deal Analysis'],
  'property': ['Deal Analysis'],
  'walkthrough': ['Deal Analysis'],
  'inspection': ['Deal Analysis'],
  'condition': ['Deal Analysis'],
  'scope of work': ['Deal Analysis'],
  'rehab': ['Deal Analysis'],
  'renovation': ['Deal Analysis'],
  'checklist': ['Deal Analysis'],
  'due diligence': ['Deal Analysis', 'Risk Factors'],

  // Negotiations - offers and deal making
  'negotiat': ['Negotiations'],
  'offer': ['Negotiations'],
  'counter': ['Negotiations'],
  'anchor': ['Negotiations'],
  'objection': ['Negotiations'],
  'closing technique': ['Negotiations'],
  'rapport': ['Negotiations'],
  'persuasion': ['Negotiations'],
  'psychology': ['Negotiations'],
  'seller conversation': ['Negotiations'],
  'price reduction': ['Negotiations'],

  // Outreach & Communication - marketing and scripts
  'outreach': ['Outreach & Communication'],
  'script': ['Outreach & Communication'],
  'communication': ['Outreach & Communication'],
  'cold call': ['Outreach & Communication'],
  'direct mail': ['Outreach & Communication'],
  'sms': ['Outreach & Communication'],
  'text': ['Outreach & Communication'],
  'email': ['Outreach & Communication'],
  'marketing': ['Outreach & Communication'],
  'follow up': ['Outreach & Communication'],
  'campaign': ['Outreach & Communication'],
  'ringless voicemail': ['Outreach & Communication'],
  'rvm': ['Outreach & Communication'],

  // Risk Factors - due diligence and risk management
  'risk': ['Risk Factors'],
  'red flag': ['Risk Factors'],
  'warning': ['Risk Factors'],
  'lien': ['Risk Factors', 'Legal & Compliance'],
  'title issue': ['Risk Factors', 'Legal & Compliance'],
  'encumbrance': ['Risk Factors'],
  'lawsuit': ['Risk Factors', 'Legal & Compliance'],
  'judgment': ['Risk Factors'],
  'bankruptcy': ['Risk Factors'],
  'fraud': ['Risk Factors', 'Legal & Compliance'],
  'scam': ['Risk Factors'],
  'deal killer': ['Risk Factors'],
  'mistake': ['Risk Factors'],

  // Legal & Compliance - contracts and regulations
  'legal': ['Legal & Compliance'],
  'contract': ['Legal & Compliance'],
  'disclosure': ['Legal & Compliance'],
  'compliance': ['Legal & Compliance'],
  'assignment': ['Legal & Compliance'],
  'double close': ['Legal & Compliance'],
  'title': ['Legal & Compliance'],
  'escrow': ['Legal & Compliance'],
  'earnest money': ['Legal & Compliance'],
  'contingency': ['Legal & Compliance'],
  'clause': ['Legal & Compliance'],
  'regulation': ['Legal & Compliance'],
  'license': ['Legal & Compliance'],
  'llc': ['Legal & Compliance'],
  'entity': ['Legal & Compliance'],
  'state law': ['Legal & Compliance'],
  'fair housing': ['Legal & Compliance'],

  // Case Studies & Examples - real-world examples
  'case study': ['Case Studies & Examples'],
  'example': ['Case Studies & Examples'],
  'success story': ['Case Studies & Examples'],
  'real deal': ['Case Studies & Examples'],
  'actual deal': ['Case Studies & Examples'],
  'how i': ['Case Studies & Examples'],
  'step by step': ['Case Studies & Examples'],
  'walkthrough example': ['Case Studies & Examples'],
};

function mapTopicsToCategories(topics: string[], query: string): string[] {
  const categories = new Set<string>();
  const lowerQuery = query.toLowerCase();

  // Check topics from classification
  for (const topic of topics) {
    const lowerTopic = topic.toLowerCase();
    for (const [keyword, cats] of Object.entries(TOPIC_CATEGORY_MAP)) {
      if (lowerTopic.includes(keyword) || keyword.includes(lowerTopic)) {
        cats.forEach(cat => categories.add(cat));
      }
    }
  }

  // Also check original query for key terms (in case classification missed them)
  for (const [keyword, cats] of Object.entries(TOPIC_CATEGORY_MAP)) {
    if (lowerQuery.includes(keyword)) {
      cats.forEach(cat => categories.add(cat));
    }
  }

  return Array.from(categories);
}

export interface QueryClassification {
  intent: 'question' | 'how-to' | 'calculation' | 'comparison' | 'general';
  topics: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  categories: string[];
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  searchLimit?: number;
  searchThreshold?: number;
  skipClassification?: boolean; // Skip preprocessing for simple queries
  bufferStreaming?: boolean; // Enable word/time buffering (default: true)
  skipCache?: boolean; // Skip cache lookup/storage (default: false)
}

export interface GenerationResult {
  response: string;
  sources: RAGContext['sources'];
  searchResults: SearchResult[];
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Generate a response to a user query using RAG
 * Now with query preprocessing, caching, and improved accuracy
 */
export async function generateResponse(
  query: string,
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  const startTime = Date.now();
  const {
    maxTokens = 1024,
    temperature = 0.7,
    searchLimit = 5,
    searchThreshold = 0.5,
    skipClassification = false,
    skipCache = false,
  } = options;

  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cached = await ragCache.getResponse(query);
    if (cached) {
      console.log(`${LOG_PREFIX} Cache hit - returning cached response`);
      return {
        response: cached.response,
        sources: cached.sources,
        searchResults: [], // Not stored in cache
        usage: { inputTokens: 0, outputTokens: 0 }, // No API usage for cached
      };
    }
  }

  const xai = getXaiClient();

  // Step 1: Classify query for better search targeting (unless skipped)
  let classification: QueryClassification | null = null;
  let effectiveLimit = searchLimit;
  let categories: string[] = [];
  let classificationMs: number | undefined;

  if (!skipClassification) {
    const classifyStart = Date.now();
    classification = await classifyQuery(query);
    classificationMs = Date.now() - classifyStart;
    categories = classification.categories;

    // Adjust search limit based on complexity
    if (classification.complexity === 'complex') {
      effectiveLimit = Math.max(searchLimit, 8);
    } else if (classification.complexity === 'simple') {
      effectiveLimit = Math.min(searchLimit, 3);
    }
  }

  // Step 2: Search for relevant documents with category filtering
  const searchStart = Date.now();
  const searchResults = await searchDocuments(query, {
    limit: effectiveLimit,
    threshold: searchThreshold,
    categories,
  });
  const searchMs = Date.now() - searchStart;

  // Build context from search results
  const context = buildContext(query, searchResults);
  const userPrompt = formatPrompt(context, query);

  // Generate response using Grok
  const result = await generateText({
    model: xai(GROK_MODELS.REASONING),
    system: context.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxOutputTokens: maxTokens,
    temperature,
  });

  const responseText = result.text;

  // Log metrics
  logMetrics({
    queryLength: query.length,
    classificationMs,
    searchMs,
    totalMs: Date.now() - startTime,
    resultsFound: searchResults.length,
    categories,
    complexity: classification?.complexity,
  });

  // Cache the response (async, don't await)
  if (!skipCache) {
    const cacheData: CachedRAGResponse = {
      response: responseText,
      sources: context.sources,
      cachedAt: Date.now(),
      classification: classification || undefined,
    };
    ragCache.setResponse(query, cacheData).catch(err =>
      console.error(`${LOG_PREFIX} Failed to cache response:`, err)
    );
  }

  return {
    response: responseText,
    sources: context.sources,
    searchResults,
    usage: {
      inputTokens: result.usage?.totalTokens ?? 0,
      outputTokens: result.usage?.totalTokens ?? 0,
    },
  };
}

/**
 * Stream buffer that implements word-based + time-based flushing
 * Produces smoother, more natural streaming output
 */
class StreamBuffer {
  private buffer = '';
  private lastFlushTime = Date.now();
  private flushIntervalMs: number;
  private minChunkSize: number;

  constructor(flushIntervalMs = BUFFER_FLUSH_INTERVAL_MS, minChunkSize = 20) {
    this.flushIntervalMs = flushIntervalMs;
    this.minChunkSize = minChunkSize;
  }

  /**
   * Add text to buffer and return content to flush
   * Flushes on: sentence boundaries, word boundaries (if buffer large enough), or time interval
   */
  add(text: string): string | null {
    this.buffer += text;

    const now = Date.now();
    const timeSinceFlush = now - this.lastFlushTime;

    // Time-based flush: flush entire buffer if interval exceeded and buffer has content
    if (timeSinceFlush >= this.flushIntervalMs && this.buffer.length > 0) {
      return this.flush();
    }

    // Sentence-based flush: flush on sentence endings for natural breaks
    const sentenceEndMatch = this.buffer.match(/^(.*?[.!?]\s+)/);
    const matchedSentence = sentenceEndMatch?.[1];
    if (matchedSentence && matchedSentence.length >= this.minChunkSize) {
      this.buffer = this.buffer.slice(matchedSentence.length);
      this.lastFlushTime = now;
      return matchedSentence;
    }

    // Word-based flush: only flush if we have enough content for a meaningful chunk
    if (this.buffer.length >= this.minChunkSize) {
      const lastSpaceIndex = this.buffer.lastIndexOf(' ');
      const lastNewlineIndex = this.buffer.lastIndexOf('\n');
      const lastBoundary = Math.max(lastSpaceIndex, lastNewlineIndex);

      if (lastBoundary > 0) {
        const toFlush = this.buffer.slice(0, lastBoundary + 1);
        this.buffer = this.buffer.slice(lastBoundary + 1);
        this.lastFlushTime = now;
        return toFlush;
      }
    }

    return null;
  }

  /**
   * Force flush any remaining content
   */
  flush(): string {
    const content = this.buffer;
    this.buffer = '';
    this.lastFlushTime = Date.now();
    return content;
  }

  /**
   * Check if buffer has content
   */
  hasContent(): boolean {
    return this.buffer.length > 0;
  }
}

export interface StreamingChunk {
  type: 'text' | 'sources' | 'classification' | 'done' | 'cached';
  content: string | RAGContext['sources'] | QueryClassification | boolean;
}

/**
 * Generate a streaming response to a user query using RAG
 * Now with query preprocessing, caching, and buffered streaming
 */
export async function* generateStreamingResponse(
  query: string,
  options: GenerationOptions = {}
): AsyncGenerator<StreamingChunk> {
  const startTime = Date.now();
  const {
    maxTokens = 1024,
    temperature = 0.7,
    searchLimit = 5,
    searchThreshold = 0.5,
    skipClassification = false,
    bufferStreaming = true,
    skipCache = false,
  } = options;

  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cached = await ragCache.getResponse(query);
    if (cached) {
      console.log(`${LOG_PREFIX} Cache hit - returning cached streaming response`);

      // Yield cached classification if available
      if (cached.classification) {
        yield { type: 'classification', content: cached.classification as QueryClassification };
      }

      // Yield cached sources
      yield { type: 'sources', content: cached.sources };

      // Yield cached response as single text chunk (already complete)
      yield { type: 'text', content: cached.response };
      yield { type: 'cached', content: true };
      yield { type: 'done', content: '' };
      return;
    }
  }

  const xai = getXaiClient();

  // Step 1: Classify query for better search targeting
  let classification: QueryClassification | null = null;
  let effectiveLimit = searchLimit;
  let categories: string[] = [];
  let classificationMs: number | undefined;

  if (!skipClassification) {
    const classifyStart = Date.now();
    classification = await classifyQuery(query);
    classificationMs = Date.now() - classifyStart;
    categories = classification.categories;

    // Yield classification info
    yield { type: 'classification', content: classification };

    // Adjust search limit based on complexity
    if (classification.complexity === 'complex') {
      effectiveLimit = Math.max(searchLimit, 8);
    } else if (classification.complexity === 'simple') {
      effectiveLimit = Math.min(searchLimit, 3);
    }
  }

  // Step 2: Search for relevant documents with category filtering
  const searchStart = Date.now();
  const searchResults = await searchDocuments(query, {
    limit: effectiveLimit,
    threshold: searchThreshold,
    categories,
  });
  const searchMs = Date.now() - searchStart;

  // Yield sources
  const context = buildContext(query, searchResults);
  yield { type: 'sources', content: context.sources };

  const userPrompt = formatPrompt(context, query);

  // Stream response using Grok with buffering
  const stream = streamText({
    model: xai(GROK_MODELS.REASONING),
    system: context.systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    maxOutputTokens: maxTokens,
    temperature,
  });

  // Collect full response for caching
  let fullResponse = '';

  if (bufferStreaming) {
    // Buffered streaming: word-based + time-based
    const buffer = new StreamBuffer();

    for await (const chunk of stream.textStream) {
      fullResponse += chunk;
      const toFlush = buffer.add(chunk);
      if (toFlush) {
        yield { type: 'text', content: toFlush };
      }
    }

    // Flush any remaining content
    if (buffer.hasContent()) {
      yield { type: 'text', content: buffer.flush() };
    }
  } else {
    // Unbuffered streaming: token-by-token
    for await (const chunk of stream.textStream) {
      fullResponse += chunk;
      yield { type: 'text', content: chunk };
    }
  }

  // Log metrics for streaming request
  logMetrics({
    queryLength: query.length,
    classificationMs,
    searchMs,
    totalMs: Date.now() - startTime,
    resultsFound: searchResults.length,
    categories,
    complexity: classification?.complexity,
  });

  // Cache the response (async, don't await)
  if (!skipCache && fullResponse) {
    const cacheData: CachedRAGResponse = {
      response: fullResponse,
      sources: context.sources,
      cachedAt: Date.now(),
      classification: classification || undefined,
    };
    ragCache.setResponse(query, cacheData).catch(err =>
      console.error(`${LOG_PREFIX} Failed to cache streaming response:`, err)
    );
  }

  yield { type: 'done', content: '' };
}

/**
 * Classify a query using Grok Fast (fast, cost-effective)
 * Returns intent, topics, complexity, and mapped categories for search filtering
 */
export async function classifyQuery(query: string): Promise<QueryClassification> {
  const xai = getXaiClient();

  const result = await generateText({
    model: xai(GROK_MODELS.FAST),
    messages: [{
      role: 'user',
      content: `Classify this real estate wholesaling query. Respond with JSON only, no markdown.

Query: "${query}"

Output format: {"intent": "<type>", "topics": ["<topic1>", "<topic2>"], "complexity": "<level>"}

Intent types: question, how-to, calculation, comparison, general

Topics - extract 2-4 specific terms from this list that match the query:
- Formulas & Core Concepts: 70% rule, ARV, MAO, repair estimates, comps, closing costs, wholesale fee
- Filters & Leads: absentee owner, probate, foreclosure, tax lien, vacant, distress, expired listing, high equity, list stacking
- Buyers: cash buyer, investor, buyer list, buyer criteria, proof of funds, fix and flip, BRRRR
- Market: neighborhood, days on market, absorption rate, competition, market trends
- Deals: deal analysis, property condition, due diligence, rehab scope, walkthrough
- Negotiations: offer, counter-offer, objection handling, closing techniques, rapport
- Outreach: cold calling, direct mail, SMS, scripts, follow-up, marketing campaign
- Risk: red flags, liens, title issues, fraud, deal killers, mistakes
- Legal: contracts, disclosure, assignment, double close, earnest money, contingencies, LLC
- Examples: case study, success story, step by step, real deal

Complexity: simple (1 topic), moderate (2-3 topics), complex (4+ topics or cross-category)`,
    }],
    maxOutputTokens: 256,
    temperature: 0,
  });

  try {
    const parsed = JSON.parse(result.text);
    const categories = mapTopicsToCategories(parsed.topics || [], query);

    return {
      intent: parsed.intent || 'general',
      topics: parsed.topics || [],
      complexity: parsed.complexity || 'moderate',
      categories,
    };
  } catch {
    // Fallback: try to extract categories from query directly
    const fallbackCategories = mapTopicsToCategories([], query);
    return {
      intent: 'general',
      topics: [],
      complexity: 'moderate',
      categories: fallbackCategories,
    };
  }
}
