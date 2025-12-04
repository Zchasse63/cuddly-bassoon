/**
 * Market Velocity Index Module
 * Central export for market velocity calculations
 */

// Calculator exports
export {
  calculateMarketVelocityIndex,
  calculateAbsorptionRate,
  calculateMonthsOfInventory,
  calculatePermitIntensity,
  calculateInvestmentConviction,
  calculateComponentScores,
  interpretDOM,
  interpretAbsorption,
  interpretInventory,
  interpretPermits,
  interpretInvestment,
  generateWholesaleImplications,
  generateComparisonAnalysis,
  VELOCITY_WEIGHTS,
  SCORE_PARAMS,
  type CalculateVelocityOptions,
} from './calculator';

// Cache exports
export {
  getCachedVelocity,
  getCachedVelocities,
  cacheVelocityIndex,
  getPreviousVelocity,
  getVelocityHistory,
  getVelocityRankings,
  getVelocityForBounds,
  getTrackedZipCodes,
  addTrackedZipCode,
  updateTrackedZipCodeTimestamp,
  isVelocityExpired,
  clearExpiredVelocities,
} from './cache';

// Service exports
export {
  getVelocityForLocation,
  getVelocityForZipCode,
  findHotMarkets,
  findColdMarkets,
  compareMarketVelocity,
  getVelocityTrend,
} from './service';
