import { redis } from '@/lib/cache/redis';

// ============================================
// Rate Limit Configuration
// ============================================

/**
 * Rate limits per endpoint (requests per minute)
 */
export const RATE_LIMITS: Record<string, number> = {
  '/properties': 100,
  '/properties/': 100, // Property details
  '/avm': 50,
  '/avm/value': 50,
  '/avm/rent': 50,
  '/markets': 100,
  '/listings': 100,
  default: 100,
};

/**
 * Priority levels for request queuing
 */
export enum RequestPriority {
  HIGH = 1,    // User-initiated searches
  NORMAL = 2,  // Background enrichment
  LOW = 3,     // Prefetching and caching
}

// Redis key prefixes
const RATE_LIMIT_PREFIX = 'rentcast:rate:';
const SLIDING_WINDOW_SIZE = 60; // 1 minute in seconds

// ============================================
// Rate Limiter Class
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
  currentCount: number;
}

export interface QueuedRequest {
  id: string;
  endpoint: string;
  priority: RequestPriority;
  timestamp: number;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

/**
 * Rate limiter for RentCast API using sliding window algorithm.
 * Tracks requests per minute by endpoint using Redis.
 */
export class RentCastRateLimiter {
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private readonly throttleDelayMs = 100; // Delay between requests when throttled

  /**
   * Check if a request is allowed under rate limits.
   * Uses sliding window algorithm for accurate rate limiting.
   */
  async checkRateLimit(endpoint: string): Promise<RateLimitResult> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const limit = RATE_LIMITS[normalizedEndpoint] ?? RATE_LIMITS.default ?? 100;
    const key = `${RATE_LIMIT_PREFIX}${normalizedEndpoint}`;
    const now = Date.now();
    const windowStart = now - SLIDING_WINDOW_SIZE * 1000;

    try {
      // Remove expired entries and count current window
      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);
      const results = await pipeline.exec();

      const currentCount = (results?.[1] as number) || 0;
      const effectiveLimit = limit ?? 100;
      const remaining = Math.max(0, effectiveLimit - currentCount);
      const allowed = currentCount < effectiveLimit;

      // Calculate reset time (when oldest entry expires)
      let resetInMs = SLIDING_WINDOW_SIZE * 1000;
      if (currentCount > 0) {
        const oldestScore = await redis.zrange(key, 0, 0, { withScores: true });
        if (oldestScore.length > 0 && oldestScore[0]) {
          const oldestTimestamp = (oldestScore[0] as { score: number }).score;
          resetInMs = Math.max(0, oldestTimestamp + SLIDING_WINDOW_SIZE * 1000 - now);
        }
      }

      return { allowed, remaining, resetInMs, currentCount };
    } catch (error) {
      // If Redis fails, allow the request but log the error
      console.error('Rate limit check failed:', error);
      const fallbackLimit = limit ?? 100;
      return { allowed: true, remaining: fallbackLimit, resetInMs: 0, currentCount: 0 };
    }
  }

  /**
   * Record a request in the rate limit window.
   */
  async recordRequest(endpoint: string): Promise<void> {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const key = `${RATE_LIMIT_PREFIX}${normalizedEndpoint}`;
    const now = Date.now();

    try {
      const pipeline = redis.pipeline();
      // Add current request with timestamp as score
      pipeline.zadd(key, { score: now, member: `${now}:${crypto.randomUUID()}` });
      // Set expiry on the key
      pipeline.expire(key, SLIDING_WINDOW_SIZE + 10);
      await pipeline.exec();
    } catch (error) {
      console.error('Failed to record request:', error);
    }
  }

  /**
   * Wait for rate limit if necessary.
   * Returns the delay waited in milliseconds.
   */
  async waitForRateLimit(endpoint: string): Promise<number> {
    const result = await this.checkRateLimit(endpoint);

    if (result.allowed) {
      return 0;
    }

    // Wait for the rate limit window to reset
    const waitTime = Math.min(result.resetInMs + 100, 60000); // Max 60s wait
    await this.delay(waitTime);
    return waitTime;
  }

  /**
   * Execute a request with rate limiting and queuing.
   */
  async executeWithRateLimit<T>(
    endpoint: string,
    execute: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    // Check if we can execute immediately
    const result = await this.checkRateLimit(endpoint);

    if (result.allowed) {
      await this.recordRequest(endpoint);
      return execute();
    }

    // Queue the request if we're rate limited
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: crypto.randomUUID(),
        endpoint,
        priority,
        timestamp: Date.now(),
        execute: execute as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      };

      this.enqueueRequest(request);
      this.processQueue();
    });
  }

  private enqueueRequest(request: QueuedRequest): void {
    // Insert based on priority (lower number = higher priority)
    const insertIndex = this.requestQueue.findIndex(
      (r) => r.priority > request.priority
    );

    if (insertIndex === -1) {
      this.requestQueue.push(request);
    } else {
      this.requestQueue.splice(insertIndex, 0, request);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];
      if (!request) break;

      const result = await this.checkRateLimit(request.endpoint);

      if (!result.allowed) {
        // Wait before retrying
        await this.delay(Math.min(result.resetInMs, 5000));
        continue;
      }

      // Execute the request
      this.requestQueue.shift();
      await this.recordRequest(request.endpoint);

      try {
        const value = await request.execute();
        request.resolve(value);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      }

      // Small delay between requests to prevent bursting
      await this.delay(this.throttleDelayMs);
    }

    this.isProcessingQueue = false;
  }

  private normalizeEndpoint(endpoint: string): string {
    // Remove query params and normalize path
    const path = endpoint.split('?')[0] ?? endpoint;

    // Check for exact matches first
    if (path && RATE_LIMITS[path]) {
      return path;
    }

    // Check for prefix matches (e.g., /properties/123 -> /properties/)
    for (const key of Object.keys(RATE_LIMITS)) {
      if (key.endsWith('/') && path && path.startsWith(key.slice(0, -1))) {
        return key;
      }
    }

    return 'default';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status for monitoring.
   */
  async getStatus(): Promise<Record<string, RateLimitResult>> {
    const status: Record<string, RateLimitResult> = {};

    for (const endpoint of Object.keys(RATE_LIMITS)) {
      if (endpoint !== 'default') {
        status[endpoint] = await this.checkRateLimit(endpoint);
      }
    }

    return status;
  }

  /**
   * Get queue length for monitoring.
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }
}

// Export singleton instance
let rateLimiterInstance: RentCastRateLimiter | null = null;

export function getRateLimiter(): RentCastRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RentCastRateLimiter();
  }
  return rateLimiterInstance;
}

