/**
 * Filter Results Cache
 * Provides caching for filter results to improve performance
 */

import type { FilterId, FilterMatch, PropertyData, ActiveFilter } from './types';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

interface FilterCacheKey {
  propertyId: string;
  filterId: FilterId;
  paramsHash: string;
}

// Simple hash function for filter params
function hashParams(params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return 'default';
  return JSON.stringify(params);
}

// Create a cache key string
function createCacheKey(key: FilterCacheKey): string {
  return `${key.propertyId}:${key.filterId}:${key.paramsHash}`;
}

/**
 * In-memory LRU cache for filter results
 */
export class FilterResultsCache {
  private cache: Map<string, CacheEntry<FilterMatch>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor(options: { maxSize?: number; defaultTTL?: number } = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize ?? 10000;
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get a cached filter result
   */
  get(
    propertyId: string,
    filterId: FilterId,
    params?: Record<string, unknown>
  ): FilterMatch | null {
    const key = createCacheKey({
      propertyId,
      filterId,
      paramsHash: hashParams(params),
    });

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set a cached filter result
   */
  set(
    propertyId: string,
    filterId: FilterId,
    result: FilterMatch,
    params?: Record<string, unknown>,
    ttl?: number
  ): void {
    const key = createCacheKey({
      propertyId,
      filterId,
      paramsHash: hashParams(params),
    });

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const now = Date.now();
    this.cache.set(key, {
      value: result,
      timestamp: now,
      expiresAt: now + (ttl ?? this.defaultTTL),
    });
  }

  /**
   * Clear all cached results for a property
   */
  invalidateProperty(propertyId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${propertyId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached results for a filter
   */
  invalidateFilter(filterId: FilterId): void {
    for (const key of this.cache.keys()) {
      if (key.includes(`:${filterId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Global cache instance
export const filterCache = new FilterResultsCache();

/**
 * Batch filter execution with caching
 */
export function getCachedOrCompute(
  property: PropertyData,
  filter: ActiveFilter,
  computeFn: () => FilterMatch
): FilterMatch {
  // Try cache first
  const cached = filterCache.get(property.id, filter.filterId, filter.params);
  if (cached) return cached;

  // Compute and cache
  const result = computeFn();
  filterCache.set(property.id, filter.filterId, result, filter.params);
  return result;
}

