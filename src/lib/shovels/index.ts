/**
 * Shovels API Module
 * Barrel export for all Shovels.ai integration components
 */

// Types
export {
  SHOVELS_PERMIT_TAGS,
  SHOVELS_PERMIT_STATUS,
  type ShovelsPermitTag,
  type ShovelsPermitStatus,
  type ShovelsPermit,
  type ShovelsContractor,
  type ShovelsGeoMetrics,
  type ShovelsAddressResident,
  type ShovelsSearchParams,
  type ShovelsPaginatedResponse,
} from './types';

// Errors
export {
  ShovelsApiError,
  ShovelsRateLimitError,
  ShovelsAuthenticationError,
  ShovelsNotFoundError,
  ShovelsValidationError,
  ShovelsNetworkError,
  ShovelsQuotaExceededError,
  isShovelsApiError,
  isRateLimitError,
  isAuthenticationError,
  isNotFoundError,
  isValidationError,
  isQuotaExceededError,
  isRetryableError,
} from './errors';

// Rate Limiter
export {
  ShovelsRateLimiter,
  getShovelsRateLimiter,
  RequestPriority,
  type RateLimitResult,
} from './rate-limiter';

// Cache
export {
  ShovelsCache,
  getShovelsCache,
  ShovelsCacheTTL,
  type ShovelsCacheType,
} from './cache';

// Client
export {
  ShovelsClient,
  getShovelsClient,
  // Permit operations
  searchPermits,
  getPermitsByIds,
  getPermitsForAddress,
  // Geographic operations
  searchCities,
  getCityMetrics,
  getCountyMetrics,
  getJurisdictionMetrics,
  // Address operations
  searchAddresses,
  getAddressMetrics,
  getAddressResidents,
  // Contractor operations
  searchContractors,
  getContractorById,
  getContractorPermits,
} from './client';

// Address Matcher
export {
  normalizeAddress,
  matchPropertyToShovels,
  batchMatchProperties,
  calculateAddressMetrics,
  type MatchResult,
} from './address-matcher';

// Vitality Score
export {
  calculateVitalityScore,
  batchCalculateVitalityScores,
  storeVitalityScore,
  type VitalityScoreComponents,
  type VitalityScoreResult,
} from './vitality-score';

// Heat Map Data
export {
  getHeatMapData,
  HEAT_MAP_LAYERS,
  type HeatMapLayer,
  type HeatMapDataPoint,
  type HeatMapBounds,
} from './heat-map-data';

