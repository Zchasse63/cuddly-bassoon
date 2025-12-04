/**
 * Shovels API Rate Limiter
 * Uses sliding window algorithm with Redis for distributed rate limiting
 */

import { redis } from '@/lib/cache/redis';

// ============================================
// Rate Limit Configuration
// ============================================

// Shovels API rate limit: 5 requests per second
const RATE_LIMIT_PER_SECOND = parseInt(process.env.SHOVELS_RATE_LIMIT_PER_SECOND || '5');
const SLIDING_WINDOW_MS = 1000; // 1 second window
const REDIS_KEY_PREFIX = 'shovels:rate_limit';

// ============================================
// Types
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
  currentCount: number;
}

export enum RequestPriority {
  HIGH = 1, // User-initiated searches
  NORMAL = 2, // Background enrichment
  LOW = 3, // Prefetching and caching
}

interface QueuedRequest {
  id: string;
  priority: RequestPriority;
  timestamp: number;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

// ============================================
// Rate Limiter Class
// ============================================

export class ShovelsRateLimiter {
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private readonly maxRequests = RATE_LIMIT_PER_SECOND;
  private readonly windowMs = SLIDING_WINDOW_MS;
  private readonly key = REDIS_KEY_PREFIX;

  /**
   * Acquire a rate limit slot, waiting if necessary.
   * Returns when a slot is available.
   */
  async acquire(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      // Remove expired entries
      await redis.zremrangebyscore(this.key, 0, windowStart);

      // Count current requests in window
      const count = await redis.zcard(this.key);

      if (count >= this.maxRequests) {
        // Get oldest timestamp to calculate wait time
        const oldestEntries = await redis.zrange(this.key, 0, 0, { withScores: true });
        if (oldestEntries.length > 0) {
          const oldestScore = (oldestEntries[0] as { score: number }).score;
          const waitTime = this.windowMs - (now - oldestScore);
          if (waitTime > 0) {
            await this.delay(waitTime + 10); // Add small buffer
          }
        }
      }

      // Record this request
      await redis.zadd(this.key, { score: now, member: `${now}:${crypto.randomUUID()}` });
      await redis.expire(this.key, 5); // Expire after 5 seconds
    } catch (error) {
      // If Redis fails, use in-memory fallback with conservative delay
      console.error('Shovels rate limit check failed:', error);
      await this.delay(200); // Conservative delay on Redis failure
    }
  }

  /**
   * Check current rate limit status without consuming a slot.
   */
  async checkRateLimit(): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
      await redis.zremrangebyscore(this.key, 0, windowStart);
      const currentCount = await redis.zcard(this.key);
      const remaining = Math.max(0, this.maxRequests - currentCount);
      const allowed = currentCount < this.maxRequests;

      let resetInMs = this.windowMs;
      if (currentCount > 0) {
        const oldestEntries = await redis.zrange(this.key, 0, 0, { withScores: true });
        if (oldestEntries.length > 0) {
          const oldestScore = (oldestEntries[0] as { score: number }).score;
          resetInMs = Math.max(0, oldestScore + this.windowMs - now);
        }
      }

      return { allowed, remaining, resetInMs, currentCount };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true, remaining: this.maxRequests, resetInMs: 0, currentCount: 0 };
    }
  }

  /**
   * Execute a request with rate limiting and priority queuing.
   */
  async executeWithRateLimit<T>(
    execute: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    const result = await this.checkRateLimit();

    if (result.allowed) {
      await this.acquire();
      return execute();
    }

    // Queue the request if rate limited
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: crypto.randomUUID(),
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
    const insertIndex = this.requestQueue.findIndex((r) => r.priority > request.priority);
    if (insertIndex === -1) {
      this.requestQueue.push(request);
    } else {
      this.requestQueue.splice(insertIndex, 0, request);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];
      if (!request) break;

      const result = await this.checkRateLimit();

      if (!result.allowed) {
        await this.delay(Math.min(result.resetInMs + 10, 1000));
        continue;
      }

      this.requestQueue.shift();
      await this.acquire();

      try {
        const value = await request.execute();
        request.resolve(value);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      }

      // Small delay between requests
      await this.delay(50);
    }

    this.isProcessingQueue = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current queue length for monitoring.
   */
  getQueueLength(): number {
    return this.requestQueue.length;
  }

  /**
   * Get rate limit status for monitoring.
   */
  async getStatus(): Promise<RateLimitResult> {
    return this.checkRateLimit();
  }
}

// ============================================
// Singleton Instance
// ============================================

let rateLimiterInstance: ShovelsRateLimiter | null = null;

export function getShovelsRateLimiter(): ShovelsRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new ShovelsRateLimiter();
  }
  return rateLimiterInstance;
}

