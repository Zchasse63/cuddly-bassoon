/**
 * RAG Rate Limiter
 * Provides sliding window rate limiting for the RAG API using Upstash Redis.
 */

import { redis, CachePrefix } from '@/lib/cache/redis';

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in current window */
  remaining: number;
  /** Seconds until the rate limit resets */
  resetInSeconds: number;
  /** Total limit for the window */
  limit: number;
}

// Default rate limit: 20 requests per minute
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 20,
  windowSeconds: 60,
};

/**
 * Generate rate limit key for an identifier (IP, user ID, etc.)
 */
function getRateLimitKey(identifier: string): string {
  return `${CachePrefix.RAG_RATE_LIMIT}${identifier}`;
}

/**
 * Check and update rate limit for an identifier.
 * Uses sliding window algorithm with Redis INCR and EXPIRE.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitResult> {
  const key = getRateLimitKey(identifier);
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / config.windowSeconds)}`;

  try {
    // Increment counter for current window
    const count = await redis.incr(windowKey);
    
    // Set expiry on first request in window
    if (count === 1) {
      await redis.expire(windowKey, config.windowSeconds);
    }

    // Get TTL to calculate reset time
    const ttl = await redis.ttl(windowKey);
    const resetInSeconds = ttl > 0 ? ttl : config.windowSeconds;

    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    if (!allowed) {
      console.log(`[RAG Rate Limit] BLOCKED ${identifier} - ${count}/${config.maxRequests} requests`);
    }

    return {
      allowed,
      remaining,
      resetInSeconds,
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error('[RAG Rate Limit] Error checking rate limit:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetInSeconds: config.windowSeconds,
      limit: config.maxRequests,
    };
  }
}

/**
 * Get current rate limit status without incrementing.
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitResult> {
  const key = getRateLimitKey(identifier);
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / config.windowSeconds)}`;

  try {
    const count = await redis.get<number>(windowKey) || 0;
    const ttl = await redis.ttl(windowKey);
    const resetInSeconds = ttl > 0 ? ttl : config.windowSeconds;

    return {
      allowed: count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetInSeconds,
      limit: config.maxRequests,
    };
  } catch (error) {
    console.error('[RAG Rate Limit] Error getting status:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetInSeconds: config.windowSeconds,
      limit: config.maxRequests,
    };
  }
}

/**
 * Reset rate limit for an identifier (admin use).
 */
export async function resetRateLimit(identifier: string): Promise<boolean> {
  const key = getRateLimitKey(identifier);
  
  try {
    const keys = await redis.keys(`${key}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('[RAG Rate Limit] Error resetting:', error);
    return false;
  }
}

/**
 * Rate limit configurations for different tiers.
 */
export const RateLimitTiers = {
  /** Anonymous/unauthenticated users: 10 req/min */
  ANONYMOUS: { maxRequests: 10, windowSeconds: 60 },
  /** Authenticated users: 30 req/min */
  AUTHENTICATED: { maxRequests: 30, windowSeconds: 60 },
  /** Premium users: 60 req/min */
  PREMIUM: { maxRequests: 60, windowSeconds: 60 },
} as const;

