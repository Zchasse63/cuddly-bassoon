import { Redis } from '@upstash/redis';

/**
 * Upstash Redis client singleton.
 * Uses REST API for serverless-friendly connections.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Default TTL values in seconds for different cache types.
 * Based on project requirements: 15-60 minutes for most data.
 */
export const CacheTTL = {
  /** Short-lived cache for frequently changing data (15 minutes) */
  SHORT: 15 * 60,
  /** Medium cache for moderately stable data (30 minutes) */
  MEDIUM: 30 * 60,
  /** Long cache for stable data (60 minutes) */
  LONG: 60 * 60,
  /** Extended cache for rarely changing data (24 hours) */
  EXTENDED: 24 * 60 * 60,
} as const;

/**
 * Cache key prefixes for organization and easy invalidation.
 */
export const CachePrefix = {
  PROPERTY: 'property:',
  BUYER: 'buyer:',
  DEAL: 'deal:',
  USER: 'user:',
  SEARCH: 'search:',
  API: 'api:',
  SESSION: 'session:',
} as const;

export type CachePrefixKey = keyof typeof CachePrefix;
