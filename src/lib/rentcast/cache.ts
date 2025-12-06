import { redis } from '@/lib/cache/redis';

// ============================================
// Cache TTL Configuration (in seconds)
// ============================================

export const RentCastCacheTTL = {
  /** Property search results: 15 minutes */
  PROPERTY_SEARCH: 15 * 60,
  /** Property details: 24 hours */
  PROPERTY_DETAIL: 24 * 60 * 60,
  /** Valuations (AVM): 7 days */
  VALUATION: 7 * 24 * 60 * 60,
  /** Rent estimates: 7 days */
  RENT_ESTIMATE: 7 * 24 * 60 * 60,
  /** Market data: 24 hours */
  MARKET_DATA: 24 * 60 * 60,
  /** Active listings: 1 hour */
  LISTINGS_ACTIVE: 60 * 60,
  /** Sold listings: 7 days */
  LISTINGS_SOLD: 7 * 24 * 60 * 60,
} as const;

// Cache key prefixes
const CACHE_PREFIX = 'rentcast:cache:';
const CACHE_STATS_KEY = 'rentcast:cache:stats';

// ============================================
// Cache Statistics
// ============================================

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

// ============================================
// RentCast Cache Layer
// ============================================

export type CacheType = keyof typeof RentCastCacheTTL;

/**
 * Cache layer for RentCast API responses.
 * Uses Redis for distributed caching with configurable TTLs.
 */
export class RentCastCache {
  /**
   * Generate a cache key from endpoint and parameters.
   */
  private generateKey(type: CacheType, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');

    const hash = this.simpleHash(sortedParams);
    return `${CACHE_PREFIX}${type}:${hash}`;
  }

  /**
   * Simple hash function for cache key generation.
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached data if available.
   */
  async get<T>(type: CacheType, params: Record<string, unknown>): Promise<T | null> {
    const key = this.generateKey(type, params);

    try {
      const cached = await redis.get<string>(key);

      if (cached) {
        await this.recordHit();
        return JSON.parse(cached) as T;
      }

      await this.recordMiss();
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      await this.recordMiss();
      return null;
    }
  }

  /**
   * Store data in cache with appropriate TTL.
   */
  async set<T>(type: CacheType, params: Record<string, unknown>, data: T): Promise<void> {
    const key = this.generateKey(type, params);
    const ttl = RentCastCacheTTL[type];

    try {
      await redis.set(key, JSON.stringify(data), { ex: ttl });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Invalidate cached data.
   */
  async invalidate(type: CacheType, params: Record<string, unknown>): Promise<void> {
    const key = this.generateKey(type, params);

    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  /**
   * Invalidate all cache entries of a specific type.
   */
  async invalidateByType(type: CacheType): Promise<number> {
    const pattern = `${CACHE_PREFIX}${type}:*`;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
      }
      return keys.length;
    } catch (error) {
      console.error('Cache invalidate by type error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics.
   */
  async getStats(): Promise<CacheStats> {
    try {
      const stats = await redis.hgetall(CACHE_STATS_KEY);
      const hits = parseInt((stats?.hits as string) || '0', 10);
      const misses = parseInt((stats?.misses as string) || '0', 10);
      const totalRequests = hits + misses;

      return {
        hits,
        misses,
        hitRate: totalRequests > 0 ? (hits / totalRequests) * 100 : 0,
        totalRequests,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { hits: 0, misses: 0, hitRate: 0, totalRequests: 0 };
    }
  }

  /**
   * Reset cache statistics.
   */
  async resetStats(): Promise<void> {
    try {
      await redis.del(CACHE_STATS_KEY);
    } catch (error) {
      console.error('Failed to reset cache stats:', error);
    }
  }

  private async recordHit(): Promise<void> {
    try {
      await redis.hincrby(CACHE_STATS_KEY, 'hits', 1);
    } catch {
      // Silently fail for stats
    }
  }

  private async recordMiss(): Promise<void> {
    try {
      await redis.hincrby(CACHE_STATS_KEY, 'misses', 1);
    } catch {
      // Silently fail for stats
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result.
   */
  async getOrSet<T>(
    type: CacheType,
    params: Record<string, unknown>,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(type, params);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();

    // Cache the result
    await this.set(type, params, data);

    return data;
  }
}

// Export singleton instance
let cacheInstance: RentCastCache | null = null;

export function getRentCastCache(): RentCastCache {
  if (!cacheInstance) {
    cacheInstance = new RentCastCache();
  }
  return cacheInstance;
}
