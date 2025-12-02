import { redis, CacheTTL, CachePrefix, type CachePrefixKey } from './redis';

/**
 * Type-safe caching service with automatic serialization.
 */
export const cache = {
  /**
   * Get a cached value by key.
   * Returns null if not found or expired.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get<T>(key);
      return value;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a cached value with optional TTL.
   * Defaults to MEDIUM TTL (30 minutes) if not specified.
   */
  async set<T>(key: string, value: T, ttlSeconds: number = CacheTTL.MEDIUM): Promise<boolean> {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete a cached value by key.
   */
  async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete all keys matching a pattern.
   * Useful for invalidating related cache entries.
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
      return 0;
    }
  },

  /**
   * Check if a key exists in cache.
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get remaining TTL for a key in seconds.
   * Returns -1 if key exists but has no TTL, -2 if key doesn't exist.
   */
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache ttl error for key ${key}:`, error);
      return -2;
    }
  },

  /**
   * Get or set pattern - fetch from cache, or compute and cache if missing.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = CacheTTL.MEDIUM
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  },
};

/**
 * Generate a cache key with proper prefix and components.
 */
export function cacheKey(prefix: CachePrefixKey, ...parts: (string | number)[]): string {
  return `${CachePrefix[prefix]}${parts.join(':')}`;
}

/**
 * Invalidate all cache entries for a specific entity type.
 */
export async function invalidateCache(prefix: CachePrefixKey): Promise<number> {
  return cache.deletePattern(`${CachePrefix[prefix]}*`);
}

// Re-export for convenience
export { redis, CacheTTL, CachePrefix } from './redis';
