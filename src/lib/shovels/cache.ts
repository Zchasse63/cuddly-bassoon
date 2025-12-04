/**
 * Shovels API Cache
 * Redis-backed caching for Shovels.ai API responses
 */

import { redis } from '@/lib/cache/redis';

// ============================================
// Cache TTL Configuration (in seconds)
// ============================================

export const ShovelsCacheTTL = {
  /** Permit data: 30 days (permits rarely change once issued) */
  PERMITS: 30 * 24 * 60 * 60,
  /** Permit search results: 1 hour */
  PERMIT_SEARCH: 60 * 60,
  /** Address metrics: 1 day */
  ADDRESS_METRICS: 24 * 60 * 60,
  /** Geographic metrics: 1 day */
  GEO_METRICS: 24 * 60 * 60,
  /** Vitality scores: 1 day */
  VITALITY_SCORES: 24 * 60 * 60,
  /** Contractor data: 7 days */
  CONTRACTORS: 7 * 24 * 60 * 60,
  /** Address residents: 7 days */
  RESIDENTS: 7 * 24 * 60 * 60,
} as const;

export type ShovelsCacheType = keyof typeof ShovelsCacheTTL;

// Cache key prefix
const CACHE_PREFIX = 'shovels:cache:';
const CACHE_STATS_KEY = 'shovels:cache:stats';

// ============================================
// Cache Class
// ============================================

export class ShovelsCache {
  /**
   * Generate a cache key from type and params.
   */
  private generateKey(type: ShovelsCacheType, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${JSON.stringify(params[k])}`)
      .join('&');
    return `${CACHE_PREFIX}${type}:${sortedParams}`;
  }

  /**
   * Get cached data if available.
   */
  async get<T>(type: ShovelsCacheType, params: Record<string, unknown>): Promise<T | null> {
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
      console.error('Shovels cache get error:', error);
      await this.recordMiss();
      return null;
    }
  }

  /**
   * Store data in cache with appropriate TTL.
   */
  async set<T>(type: ShovelsCacheType, params: Record<string, unknown>, data: T): Promise<void> {
    const key = this.generateKey(type, params);
    const ttl = ShovelsCacheTTL[type];

    try {
      await redis.set(key, JSON.stringify(data), { ex: ttl });
    } catch (error) {
      console.error('Shovels cache set error:', error);
    }
  }

  /**
   * Invalidate cached data.
   */
  async invalidate(type: ShovelsCacheType, params: Record<string, unknown>): Promise<void> {
    const key = this.generateKey(type, params);

    try {
      await redis.del(key);
    } catch (error) {
      console.error('Shovels cache invalidate error:', error);
    }
  }

  /**
   * Invalidate all cached data for a type.
   */
  async invalidateType(type: ShovelsCacheType): Promise<number> {
    try {
      const pattern = `${CACHE_PREFIX}${type}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error('Shovels cache invalidate type error:', error);
      return 0;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result.
   */
  async getOrSet<T>(
    type: ShovelsCacheType,
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
   * Get cache statistics.
   */
  async getStats(): Promise<{ hits: number; misses: number; hitRate: number }> {
    try {
      const stats = await redis.hgetall(CACHE_STATS_KEY);
      const hits = parseInt(String(stats?.hits || 0), 10);
      const misses = parseInt(String(stats?.misses || 0), 10);
      const total = hits + misses;
      return {
        hits,
        misses,
        hitRate: total > 0 ? hits / total : 0,
      };
    } catch {
      return { hits: 0, misses: 0, hitRate: 0 };
    }
  }
}

// Singleton instance
let cacheInstance: ShovelsCache | null = null;

export function getShovelsCache(): ShovelsCache {
  if (!cacheInstance) {
    cacheInstance = new ShovelsCache();
  }
  return cacheInstance;
}

