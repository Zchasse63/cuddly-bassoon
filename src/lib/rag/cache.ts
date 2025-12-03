/**
 * RAG Caching Module
 * Provides query result caching and semantic key generation for the RAG system.
 * Uses Upstash Redis for serverless-friendly caching.
 */

import { redis, CachePrefix } from '@/lib/cache/redis';
import crypto from 'crypto';

// RAG-specific TTLs
export const RAGCacheTTL = {
  /** Cache query responses for 1 hour (knowledge base is static) */
  QUERY_RESPONSE: 60 * 60,
  /** Cache embeddings for 24 hours (embeddings are deterministic) */
  EMBEDDING: 24 * 60 * 60,
  /** Rate limit window: 1 minute */
  RATE_LIMIT_WINDOW: 60,
} as const;

/**
 * Generate a deterministic cache key from a query string.
 * Normalizes the query to improve cache hit rate.
 */
export function generateQueryCacheKey(query: string): string {
  // Normalize: lowercase, trim, collapse whitespace
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Create a hash for the key (shorter than full query)
  const hash = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  
  return `${CachePrefix.RAG_QUERY}${hash}`;
}

/**
 * Generate a cache key for an embedding.
 */
export function generateEmbeddingCacheKey(text: string): string {
  const hash = crypto.createHash('sha256').update(text).digest('hex').slice(0, 16);
  return `${CachePrefix.RAG_EMBEDDING}${hash}`;
}

export interface CachedRAGResponse {
  response: string;
  sources: Array<{
    title: string;
    slug: string;
    category: string;
    relevance: number;
  }>;
  cachedAt: number;
  classification?: {
    intent: string;
    topics: string[];
    complexity: string;
    categories: string[];
  };
}

/**
 * RAG-specific cache operations
 */
export const ragCache = {
  /**
   * Get a cached RAG response by query.
   */
  async getResponse(query: string): Promise<CachedRAGResponse | null> {
    try {
      const key = generateQueryCacheKey(query);
      const cached = await redis.get<CachedRAGResponse>(key);
      
      if (cached) {
        console.log(`[RAG Cache] HIT for query hash ${key.slice(-16)}`);
        return cached;
      }
      
      console.log(`[RAG Cache] MISS for query hash ${key.slice(-16)}`);
      return null;
    } catch (error) {
      console.error('[RAG Cache] Error getting cached response:', error);
      return null;
    }
  },

  /**
   * Cache a RAG response.
   */
  async setResponse(query: string, response: CachedRAGResponse): Promise<boolean> {
    try {
      const key = generateQueryCacheKey(query);
      await redis.set(key, response, { ex: RAGCacheTTL.QUERY_RESPONSE });
      console.log(`[RAG Cache] SET for query hash ${key.slice(-16)}`);
      return true;
    } catch (error) {
      console.error('[RAG Cache] Error setting cached response:', error);
      return false;
    }
  },

  /**
   * Get a cached embedding vector.
   */
  async getEmbedding(text: string): Promise<number[] | null> {
    try {
      const key = generateEmbeddingCacheKey(text);
      return await redis.get<number[]>(key);
    } catch (error) {
      console.error('[RAG Cache] Error getting cached embedding:', error);
      return null;
    }
  },

  /**
   * Cache an embedding vector.
   */
  async setEmbedding(text: string, embedding: number[]): Promise<boolean> {
    try {
      const key = generateEmbeddingCacheKey(text);
      await redis.set(key, embedding, { ex: RAGCacheTTL.EMBEDDING });
      return true;
    } catch (error) {
      console.error('[RAG Cache] Error setting cached embedding:', error);
      return false;
    }
  },

  /**
   * Invalidate all RAG query caches.
   * Useful when knowledge base is updated.
   */
  async invalidateAllQueries(): Promise<number> {
    try {
      const keys = await redis.keys(`${CachePrefix.RAG_QUERY}*`);
      if (keys.length === 0) return 0;
      await redis.del(...keys);
      console.log(`[RAG Cache] Invalidated ${keys.length} query caches`);
      return keys.length;
    } catch (error) {
      console.error('[RAG Cache] Error invalidating caches:', error);
      return 0;
    }
  },

  /**
   * Get cache stats for monitoring.
   */
  async getStats(): Promise<{ queryCount: number; embeddingCount: number }> {
    try {
      const [queryKeys, embeddingKeys] = await Promise.all([
        redis.keys(`${CachePrefix.RAG_QUERY}*`),
        redis.keys(`${CachePrefix.RAG_EMBEDDING}*`),
      ]);
      return {
        queryCount: queryKeys.length,
        embeddingCount: embeddingKeys.length,
      };
    } catch (error) {
      console.error('[RAG Cache] Error getting stats:', error);
      return { queryCount: 0, embeddingCount: 0 };
    }
  },
};

