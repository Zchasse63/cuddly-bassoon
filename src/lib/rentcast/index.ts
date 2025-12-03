/**
 * RentCast Integration Module
 * Provides access to 140M+ property records via RentCast API.
 */

// Client
export { RentCastClient, getRentCastClient, resetRentCastClient } from './client';

// Types
export type {
  PropertyType,
  OwnerType,
  ListingStatus,
  RentCastProperty,
  RentCastValuation,
  RentCastRentEstimate,
  RentCastMarketData,
  RentCastListing,
  PropertySearchParams,
  ListingsSearchParams,
  NormalizedProperty,
  NormalizedValuation,
  NormalizedRentEstimate,
  NormalizedMarketData,
} from './types';

// Type Schemas (for validation)
export {
  PropertyTypeSchema,
  OwnerTypeSchema,
  ListingStatusSchema,
  RentCastPropertySchema,
  RentCastValuationSchema,
  RentCastRentEstimateSchema,
  RentCastMarketDataSchema,
  RentCastListingSchema,
  PropertySearchResponseSchema,
  ListingsSearchResponseSchema,
} from './types';

// Errors
export {
  RentCastApiError,
  RentCastRateLimitError,
  RentCastAuthenticationError,
  RentCastNotFoundError,
  RentCastValidationError,
  RentCastNetworkError,
  RentCastSchemaError,
  isRentCastApiError,
  isRateLimitError,
  isAuthenticationError,
  isNotFoundError,
  isValidationError,
  isRetryableError,
} from './errors';

// Rate Limiting
export {
  RentCastRateLimiter,
  getRateLimiter,
  RATE_LIMITS,
  RequestPriority,
  type RateLimitResult,
} from './rate-limiter';

// Quota Management
export {
  QuotaManager,
  getQuotaManager,
  QUOTA_LIMITS,
  ALERT_THRESHOLDS,
  type QuotaTier,
  type QuotaStatus,
  type UsageStats,
} from './quota';

// Retry Logic
export { withRetry, tryWithRetry, type RetryConfig, type RetryResult } from './retry';

// Caching
export {
  RentCastCache,
  getRentCastCache,
  RentCastCacheTTL,
  type CacheType,
  type CacheStats,
} from './cache';

// Data Transformation
export {
  transformProperty,
  transformProperties,
  transformValuation,
  transformRentEstimate,
  transformMarketData,
} from './transform';

// Property Enrichment
export {
  PropertyEnrichmentService,
  EnrichmentQueue,
  getEnrichmentService,
  getEnrichmentQueue,
  EnrichmentStage,
  type EnrichmentResult,
  type EnrichmentOptions,
  type EnrichmentStatus,
} from './enrichment';

// Usage Tracking
export {
  UsageTracker,
  getUsageTracker,
  type UsageMetrics,
  type RequestLogEntry,
} from './usage';

