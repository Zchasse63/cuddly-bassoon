import { redis } from '@/lib/cache/redis';
import { getQuotaManager, type QuotaStatus, type UsageStats } from './quota';
import { getRateLimiter, type RateLimitResult } from './rate-limiter';
import { getRentCastCache, type CacheStats } from './cache';

// ============================================
// Usage Tracking Configuration
// ============================================

const USAGE_PREFIX = 'rentcast:usage:';
const REQUEST_LOG_PREFIX = 'rentcast:requests:';
const MAX_REQUEST_LOG_SIZE = 1000;

// ============================================
// Request Log Entry
// ============================================

export interface RequestLogEntry {
  id: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  durationMs: number;
  statusCode: number;
  cached: boolean;
  error?: string;
}

// ============================================
// Usage Tracker
// ============================================

export interface UsageMetrics {
  quota: QuotaStatus;
  usage: UsageStats;
  rateLimits: Record<string, RateLimitResult>;
  cache: CacheStats;
  recentRequests: RequestLogEntry[];
  summary: {
    totalRequestsToday: number;
    avgResponseTimeMs: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

/**
 * Comprehensive usage tracking for RentCast API.
 */
export class UsageTracker {
  private readonly quotaManager = getQuotaManager();
  private readonly rateLimiter = getRateLimiter();
  private readonly cache = getRentCastCache();

  /**
   * Log a request for tracking.
   */
  async logRequest(entry: Omit<RequestLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: RequestLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    const dayKey = this.getDayKey();
    const key = `${REQUEST_LOG_PREFIX}${dayKey}`;

    try {
      // Add to sorted set with timestamp as score
      await redis.zadd(key, {
        score: fullEntry.timestamp.getTime(),
        member: JSON.stringify(fullEntry),
      });

      // Trim to max size
      await redis.zremrangebyrank(key, 0, -MAX_REQUEST_LOG_SIZE - 1);

      // Set expiry (2 days)
      await redis.expire(key, 2 * 24 * 60 * 60);

      // Update aggregated metrics
      await this.updateAggregates(fullEntry);
    } catch (error) {
      console.error('Failed to log request:', error);
    }
  }

  /**
   * Get comprehensive usage metrics.
   */
  async getMetrics(): Promise<UsageMetrics> {
    const [quota, usage, rateLimits, cacheStats, recentRequests, summary] = await Promise.all([
      this.quotaManager.getQuotaStatus(),
      this.quotaManager.getUsageStats(),
      this.rateLimiter.getStatus(),
      this.cache.getStats(),
      this.getRecentRequests(50),
      this.getSummary(),
    ]);

    return {
      quota,
      usage,
      rateLimits,
      cache: cacheStats,
      recentRequests,
      summary,
    };
  }

  /**
   * Get recent request log entries.
   */
  async getRecentRequests(limit: number = 50): Promise<RequestLogEntry[]> {
    const dayKey = this.getDayKey();
    const key = `${REQUEST_LOG_PREFIX}${dayKey}`;

    try {
      const entries = await redis.zrange(key, -limit, -1);
      return entries
        .map((entry) => {
          try {
            const parsed = JSON.parse(entry as string);
            return {
              ...parsed,
              timestamp: new Date(parsed.timestamp),
            };
          } catch {
            return null;
          }
        })
        .filter((e): e is RequestLogEntry => e !== null)
        .reverse();
    } catch (error) {
      console.error('Failed to get recent requests:', error);
      return [];
    }
  }

  /**
   * Get summary statistics.
   */
  private async getSummary(): Promise<UsageMetrics['summary']> {
    const dayKey = this.getDayKey();

    try {
      const [totalRequestsRaw, totalDurationRaw, errorCountRaw] = await Promise.all([
        redis.get<number>(`${USAGE_PREFIX}count:${dayKey}`),
        redis.get<number>(`${USAGE_PREFIX}duration:${dayKey}`),
        redis.get<number>(`${USAGE_PREFIX}errors:${dayKey}`),
      ]);

      const totalRequests = totalRequestsRaw ?? 0;
      const totalDuration = totalDurationRaw ?? 0;
      const errorCount = errorCountRaw ?? 0;

      const cacheStats = await this.cache.getStats();

      return {
        totalRequestsToday: totalRequests,
        avgResponseTimeMs: totalRequests > 0 ? totalDuration / totalRequests : 0,
        errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
        cacheHitRate: cacheStats.hitRate,
      };
    } catch (error) {
      console.error('Failed to get summary:', error);
      return {
        totalRequestsToday: 0,
        avgResponseTimeMs: 0,
        errorRate: 0,
        cacheHitRate: 0,
      };
    }
  }

  /**
   * Update aggregated metrics.
   */
  private async updateAggregates(entry: RequestLogEntry): Promise<void> {
    const dayKey = this.getDayKey();

    try {
      const pipeline = redis.pipeline();

      // Increment request count
      pipeline.incr(`${USAGE_PREFIX}count:${dayKey}`);
      pipeline.expire(`${USAGE_PREFIX}count:${dayKey}`, 2 * 24 * 60 * 60);

      // Add to total duration
      pipeline.incrby(`${USAGE_PREFIX}duration:${dayKey}`, entry.durationMs);
      pipeline.expire(`${USAGE_PREFIX}duration:${dayKey}`, 2 * 24 * 60 * 60);

      // Track errors
      if (entry.error || entry.statusCode >= 400) {
        pipeline.incr(`${USAGE_PREFIX}errors:${dayKey}`);
        pipeline.expire(`${USAGE_PREFIX}errors:${dayKey}`, 2 * 24 * 60 * 60);
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Failed to update aggregates:', error);
    }
  }

  private getDayKey(): string {
    return new Date().toISOString().split('T')[0] ?? '';
  }
}

// Export singleton instance
let usageTrackerInstance: UsageTracker | null = null;

export function getUsageTracker(): UsageTracker {
  if (!usageTrackerInstance) {
    usageTrackerInstance = new UsageTracker();
  }
  return usageTrackerInstance;
}

