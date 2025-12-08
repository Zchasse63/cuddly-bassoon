/**
 * Conversation Context Manager for RAG
 *
 * Tracks fetched documents and concepts across conversation turns
 * to avoid redundant fetches and build cumulative understanding.
 *
 * Uses Redis for session state management with automatic TTL.
 */

import { redis, CachePrefix, CacheTTL } from '@/lib/cache/redis';
import type { CoreMessage } from 'ai';

export interface ConversationRAGState {
  sessionId: string;
  fetchedCategories: string[];
  fetchedDocIds: string[];
  accumulatedConcepts: string[];
  lastQueryTime: number;
  messageCount: number;
}

export interface ConversationSummary {
  currentTopic: string;
  keyEntities: string[];         // Addresses, property IDs, amounts
  conceptsNeeded: string[];      // Concepts that might need explanation
  previousTopics: string[];      // Topics from earlier in conversation
}

export interface ContextAwareQuery {
  query: string;
  categories: string[];
  excludeDocIds: string[];
  boostConcepts: string[];       // Concepts to boost in search
}

// Session TTL: 30 minutes of inactivity (reserved for future Redis session expiry)
const _SESSION_TTL = CacheTTL.MEDIUM; // 30 minutes
void _SESSION_TTL; // Suppress unused variable warning

/**
 * Get the Redis key for a session
 */
function getSessionKey(sessionId: string): string {
  return `${CachePrefix.RAG_QUERY}session:${sessionId}`;
}

/**
 * Get conversation state from Redis
 */
export async function getConversationState(
  sessionId: string
): Promise<ConversationRAGState | null> {
  try {
    const key = getSessionKey(sessionId);
    const data = await redis.get(key);

    if (!data) return null;

    // Handle both string and object responses from Redis
    if (typeof data === 'string') {
      return JSON.parse(data) as ConversationRAGState;
    }
    return data as ConversationRAGState;
  } catch (error) {
    console.error('[ConversationContext] Error getting state:', error);
    return null;
  }
}

/**
 * Update conversation state in Redis
 */
export async function updateConversationState(
  sessionId: string,
  update: Partial<ConversationRAGState>
): Promise<void> {
  try {
    const key = getSessionKey(sessionId);
    const existing = await getConversationState(sessionId);

    const newState: ConversationRAGState = {
      sessionId,
      fetchedCategories: update.fetchedCategories || existing?.fetchedCategories || [],
      fetchedDocIds: update.fetchedDocIds || existing?.fetchedDocIds || [],
      accumulatedConcepts: update.accumulatedConcepts || existing?.accumulatedConcepts || [],
      lastQueryTime: Date.now(),
      messageCount: (existing?.messageCount || 0) + (update.messageCount || 0),
    };

    // Limit accumulated data to prevent bloat
    newState.fetchedDocIds = newState.fetchedDocIds.slice(-50);
    newState.accumulatedConcepts = newState.accumulatedConcepts.slice(-30);
    newState.fetchedCategories = [...new Set(newState.fetchedCategories)];

    await redis.setex(key, 1800, JSON.stringify(newState)); // 30 min TTL
  } catch (error) {
    console.error('[ConversationContext] Error updating state:', error);
  }
}

/**
 * Extract key entities from messages (addresses, amounts, property IDs)
 */
function extractEntities(messages: CoreMessage[]): string[] {
  const entities: string[] = [];

  // Patterns for common entities
  const patterns = {
    address: /\d+\s+[\w\s]+(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|ct|court|way|pl|place)\b/gi,
    zipCode: /\b\d{5}(?:-\d{4})?\b/g,
    price: /\$[\d,]+(?:k|K|m|M)?|\d+(?:,\d{3})*\s*(?:thousand|million|k|K|m|M)\b/gi,
    propertyId: /property[_\s-]?id[:\s]*[\w-]+/gi,
  };

  for (const message of messages) {
    if (message.role === 'user' && typeof message.content === 'string') {
      const content = message.content;

      for (const [, pattern] of Object.entries(patterns)) {
        const matches = content.match(pattern);
        if (matches) {
          entities.push(...matches);
        }
      }
    }
  }

  return [...new Set(entities)].slice(0, 10);
}

/**
 * Extract topics from messages
 */
function extractTopics(messages: CoreMessage[]): string[] {
  const topics: string[] = [];

  // Topic keywords to look for
  const topicKeywords = [
    'deal', 'property', 'buyer', 'seller', 'market', 'offer',
    'arv', 'mao', 'repair', 'motivation', 'equity', 'absentee',
    'probate', 'foreclosure', 'wholesale', 'flip', 'rental',
  ];

  for (const message of messages) {
    if (message.role === 'user' && typeof message.content === 'string') {
      const lowerContent = message.content.toLowerCase();

      for (const keyword of topicKeywords) {
        if (lowerContent.includes(keyword)) {
          topics.push(keyword);
        }
      }
    }
  }

  return [...new Set(topics)];
}

/**
 * Summarize conversation context
 * Analyzes messages to understand current topic and accumulated context
 */
export async function summarizeConversation(
  messages: CoreMessage[],
  existingState: ConversationRAGState | null
): Promise<ConversationSummary> {
  // Get the last few user messages for current topic detection
  const recentUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => typeof m.content === 'string' ? m.content : '')
    .filter(Boolean);

  const lastMessage = recentUserMessages[recentUserMessages.length - 1] || '';
  const allTopics = extractTopics(messages);
  const currentTopics = extractTopics([{ role: 'user', content: lastMessage }]);

  // Identify concepts that might need explanation (not already fetched)
  const fetchedCategories = new Set(existingState?.fetchedCategories || []);
  const conceptsNeeded = currentTopics.filter(_topic => {
    // If we haven't fetched from related categories, might need context
    const relatedCategories = ['Fundamentals', 'AI Tools', 'Data Interpretation'];
    return !relatedCategories.some(cat => fetchedCategories.has(cat));
  });

  return {
    currentTopic: currentTopics[0] || 'general',
    keyEntities: extractEntities(messages),
    conceptsNeeded,
    previousTopics: allTopics.filter(t => !currentTopics.includes(t)),
  };
}

/**
 * Generate a context-aware query for RAG
 * Considers conversation state to avoid redundant fetches
 */
export function generateContextAwareQuery(
  currentMessage: string,
  summary: ConversationSummary,
  state: ConversationRAGState | null
): ContextAwareQuery {
  // Start with the current message
  let query = currentMessage;

  // Add boost concepts from conversation context
  const boostConcepts: string[] = [];

  // If we have key entities, include them for more specific results
  if (summary.keyEntities.length > 0) {
    boostConcepts.push(...summary.keyEntities.slice(0, 3));
  }

  // If current topic is different from previous, we might need fresh context
  const topicChanged = summary.previousTopics.length > 0 &&
    !summary.previousTopics.includes(summary.currentTopic);

  // Categories to search
  const categories: string[] = [];

  // Add categories based on current topic
  const topicCategoryMap: Record<string, string[]> = {
    'deal': ['Deal Analysis', 'Fundamentals'],
    'property': ['Data Sources', 'Deal Analysis'],
    'buyer': ['Buyer Intelligence'],
    'seller': ['Filter System', 'Negotiations'],
    'market': ['Market Analysis'],
    'offer': ['Negotiations', 'Fundamentals'],
    'arv': ['Fundamentals', 'Deal Analysis'],
    'mao': ['Fundamentals'],
    'repair': ['Fundamentals', 'Deal Analysis'],
    'motivation': ['Filter System', 'Fundamentals'],
    'equity': ['Filter System', 'Fundamentals'],
    'absentee': ['Filter System'],
    'probate': ['Filter System', 'Legal & Compliance'],
    'foreclosure': ['Filter System'],
    'wholesale': ['Fundamentals', 'Legal & Compliance'],
    'flip': ['Deal Analysis', 'Buyer Intelligence'],
    'rental': ['Market Analysis', 'Buyer Intelligence'],
  };

  if (summary.currentTopic) {
    const topicCategories = topicCategoryMap[summary.currentTopic];
    if (topicCategories) {
      categories.push(...topicCategories);
    }
  }

  // If concepts need explanation, add Fundamentals
  if (summary.conceptsNeeded.length > 0) {
    categories.push('Fundamentals', 'Data Interpretation');
  }

  // Exclude already-fetched documents unless topic changed significantly
  let excludeDocIds: string[] = [];
  if (state && !topicChanged) {
    excludeDocIds = state.fetchedDocIds;
  }

  return {
    query,
    categories: [...new Set(categories)],
    excludeDocIds,
    boostConcepts,
  };
}

/**
 * Clear conversation state (for testing or manual reset)
 */
export async function clearConversationState(sessionId: string): Promise<void> {
  try {
    const key = getSessionKey(sessionId);
    await redis.del(key);
  } catch (error) {
    console.error('[ConversationContext] Error clearing state:', error);
  }
}

/**
 * Check if a session is still active
 */
export async function isSessionActive(sessionId: string): Promise<boolean> {
  const state = await getConversationState(sessionId);
  if (!state) return false;

  // Consider inactive if last query was more than 30 minutes ago
  const thirtyMinutes = 30 * 60 * 1000;
  return Date.now() - state.lastQueryTime < thirtyMinutes;
}
