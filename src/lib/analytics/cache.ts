/**
 * Analytics Cache Utility
 * In-memory caching for analytics data with TTL support
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  key: string;
}

interface CacheConfig {
  defaultTTL: number; // milliseconds
  maxEntries: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
};

class AnalyticsCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Enforce max entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl || this.config.defaultTTL),
      key,
    });
  }

  /**
   * Get or set with async fetcher
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; maxEntries: number; defaultTTL: number } {
    return {
      size: this.cache.size,
      maxEntries: this.config.maxEntries,
      defaultTTL: this.config.defaultTTL,
    };
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < oldestTime) {
        oldestTime = entry.expiresAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Cache key generators
export const cacheKeys = {
  kpis: (userId: string, days: number) => `kpis:${userId}:${days}`,
  pipeline: (userId: string) => `pipeline:${userId}`,
  deals: (userId: string, period: string) => `deals:${userId}:${period}`,
  buyers: (userId: string) => `buyers:${userId}`,
  markets: (userId: string) => `markets:${userId}`,
  heatmap: (userId: string, layer: string) => `heatmap:${userId}:${layer}`,
  insights: (userId: string, period: string) => `insights:${userId}:${period}`,
};

// TTL presets (in milliseconds)
export const cacheTTL = {
  short: 1 * 60 * 1000, // 1 minute
  medium: 5 * 60 * 1000, // 5 minutes
  long: 15 * 60 * 1000, // 15 minutes
  extended: 60 * 60 * 1000, // 1 hour
};

// Singleton instance
export const analyticsCache = new AnalyticsCache();
