/**
 * Market Velocity Index Service
 * Business logic layer for velocity operations
 */

import { getRentCastClient } from '@/lib/rentcast/client';
import { getCityMetrics, getCountyMetrics, searchCities } from '@/lib/shovels/client';
import type { MarketVelocityIndex, VelocityTrend } from '@/types/velocity';
import { calculateMarketVelocityIndex, generateComparisonAnalysis } from './calculator';
import {
  getCachedVelocity,
  cacheVelocityIndex,
  getPreviousVelocity,
  getVelocityRankings,
  getVelocityHistory,
  updateTrackedZipCodeTimestamp,
} from './cache';

// =============================================
// Get Velocity for Location
// =============================================

export interface GetVelocityParams {
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
}

/**
 * Get velocity for a location (zip code, city, or county)
 * Fetches fresh data if not cached or expired
 */
export async function getVelocityForLocation(
  params: GetVelocityParams
): Promise<MarketVelocityIndex> {
  // Prioritize zip code if provided
  if (params.zipCode) {
    return getVelocityForZipCode(params.zipCode);
  }

  // For city/county, we need to look up the appropriate zip codes
  if (params.city && params.state) {
    // Search for the city to get a representative zip
    const cities = await searchCities(`${params.city}, ${params.state}`);
    if (cities.length > 0) {
      // Get the geo_id and use it to find velocity
      const geoId = cities[0]!.geo_id;
      return getVelocityForGeoId(geoId, 'city', params);
    }
  }

  // Fallback: if we can't find specific data, throw an error
  throw new Error(
    'Could not find velocity data for the specified location. Please provide a zip code.'
  );
}

/**
 * Get velocity for a specific zip code
 */
export async function getVelocityForZipCode(zipCode: string): Promise<MarketVelocityIndex> {
  // Check cache first
  const cached = await getCachedVelocity(zipCode);
  if (cached) {
    console.log(`[Velocity Service] Returning cached velocity for ${zipCode}`);
    return cached;
  }

  console.log(`[Velocity Service] Calculating fresh velocity for ${zipCode}`);

  // Fetch RentCast market data
  const rentcastClient = getRentCastClient();
  const marketData = await rentcastClient.getMarketData(zipCode);

  // Try to get Shovels data
  let shovelsMetrics = null;
  try {
    // Search for the city to get geo_id
    const cities = await searchCities(zipCode);
    if (cities.length > 0) {
      const geoId = cities[0]!.geo_id;
      shovelsMetrics = await getCityMetrics(geoId);
    }
  } catch (error) {
    console.warn(`[Velocity Service] Could not fetch Shovels data for ${zipCode}:`, error);
    // Continue without Shovels data
  }

  // Get previous velocity for trend calculation
  const previousVelocity = await getPreviousVelocity(zipCode);

  // Calculate velocity index
  const velocity = calculateMarketVelocityIndex(marketData, shovelsMetrics, {
    zipCode,
    city: marketData.city || undefined,
    state: marketData.state || undefined,
    county: marketData.county || undefined,
    geoId: shovelsMetrics?.geo_id,
  });

  // Add trend information if we have previous data
  if (previousVelocity !== undefined) {
    const change = velocity.velocityIndex - previousVelocity;
    velocity.velocityChange = change;
    if (change > 5) {
      velocity.velocityTrend = 'Rising';
    } else if (change < -5) {
      velocity.velocityTrend = 'Falling';
    } else {
      velocity.velocityTrend = 'Stable';
    }
  }

  // Cache the result
  await cacheVelocityIndex(velocity, previousVelocity);

  // Update tracked zip code timestamp
  await updateTrackedZipCodeTimestamp(zipCode);

  return velocity;
}

/**
 * Get velocity for a Shovels geo_id
 */
async function getVelocityForGeoId(
  geoId: string,
  geoType: 'city' | 'county',
  params: GetVelocityParams
): Promise<MarketVelocityIndex> {
  // Get Shovels metrics
  const shovelsMetrics =
    geoType === 'city' ? await getCityMetrics(geoId) : await getCountyMetrics(geoId);

  // For city/county, we need to get market data from RentCast
  // We'll use the state to search for representative data
  const rentcastClient = getRentCastClient();

  // Try to get properties in the city to get zip codes
  const properties = await rentcastClient.searchProperties({
    city: params.city,
    state: params.state,
    limit: 1,
  });

  let marketData;
  if (properties.length > 0 && properties[0]!.zipCode) {
    marketData = await rentcastClient.getMarketData(properties[0]!.zipCode);
  } else {
    // Fallback: create default market data
    marketData = {
      zipCode: '',
      city: params.city,
      state: params.state,
      daysOnMarket: 30,
      inventory: 50,
    };
  }

  // Calculate velocity
  const velocity = calculateMarketVelocityIndex(marketData, shovelsMetrics, {
    zipCode: properties[0]?.zipCode || '',
    city: params.city,
    state: params.state,
    county: params.county,
    geoId,
  });

  return velocity;
}

// =============================================
// Find Hot/Cold Markets
// =============================================

/**
 * Find markets with high velocity (hot markets)
 */
export async function findHotMarkets(options: {
  state?: string;
  region?: 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west';
  minVelocity?: number;
  limit?: number;
}): Promise<MarketVelocityIndex[]> {
  const { minVelocity = 70, limit = 20 } = options;

  // Get rankings from cache
  const rankings = await getVelocityRankings('top', limit * 2, options.state);

  // Filter by minimum velocity
  let filtered = rankings.filter((v) => v.velocityIndex >= minVelocity);

  // Filter by region if specified
  if (options.region) {
    filtered = filtered.filter((v) => isStateInRegion(v.state || '', options.region!));
  }

  return filtered.slice(0, limit);
}

/**
 * Find markets with low velocity (cold markets)
 */
export async function findColdMarkets(options: {
  state?: string;
  maxVelocity?: number;
  limit?: number;
}): Promise<MarketVelocityIndex[]> {
  const { maxVelocity = 40, limit = 20 } = options;

  // Get rankings from cache
  const rankings = await getVelocityRankings('bottom', limit * 2, options.state);

  // Filter by maximum velocity
  const filtered = rankings.filter((v) => v.velocityIndex <= maxVelocity);

  return filtered.slice(0, limit);
}

// =============================================
// Compare Markets
// =============================================

/**
 * Compare velocity between multiple markets
 */
export async function compareMarketVelocity(
  locations: GetVelocityParams[]
): Promise<{
  rankings: MarketVelocityIndex[];
  winner: MarketVelocityIndex;
  analysis: string;
}> {
  // Fetch velocity for all locations
  const velocities = await Promise.all(locations.map((loc) => getVelocityForLocation(loc)));

  // Sort by velocity descending
  const rankings = [...velocities].sort((a, b) => b.velocityIndex - a.velocityIndex);

  // Generate analysis
  const analysis = generateComparisonAnalysis(rankings);

  return {
    rankings,
    winner: rankings[0]!,
    analysis,
  };
}

// =============================================
// Velocity Trends
// =============================================

/**
 * Get velocity trend for a zip code
 */
export async function getVelocityTrend(
  zipCode: string,
  timeframe: '30d' | '90d' | '6m' | '1y' = '90d'
): Promise<{
  zipCode: string;
  currentVelocity: number;
  previousVelocity: number;
  change: number;
  trend: VelocityTrend;
  trendStrength: 'Strong' | 'Moderate' | 'Weak';
  history: Array<{
    date: string;
    velocityIndex: number;
    classification: string;
  }>;
  forecast?: {
    predictedVelocity: number;
    confidence: number;
  };
}> {
  // Get current velocity
  const currentVelocity = await getVelocityForZipCode(zipCode);

  // Get history
  const history = await getVelocityHistory(zipCode, timeframe);

  // Calculate change from first to last
  const previousVelocity =
    history.length > 0 ? history[0]!.velocity_index : currentVelocity.velocityIndex;
  const change = currentVelocity.velocityIndex - previousVelocity;

  // Determine trend and strength
  let trend: VelocityTrend;
  let trendStrength: 'Strong' | 'Moderate' | 'Weak';

  if (change > 10) {
    trend = 'Rising';
    trendStrength = 'Strong';
  } else if (change > 5) {
    trend = 'Rising';
    trendStrength = 'Moderate';
  } else if (change > 2) {
    trend = 'Rising';
    trendStrength = 'Weak';
  } else if (change < -10) {
    trend = 'Falling';
    trendStrength = 'Strong';
  } else if (change < -5) {
    trend = 'Falling';
    trendStrength = 'Moderate';
  } else if (change < -2) {
    trend = 'Falling';
    trendStrength = 'Weak';
  } else {
    trend = 'Stable';
    trendStrength = 'Weak';
  }

  // Simple forecast based on trend
  let forecast;
  if (history.length >= 3) {
    // Linear projection
    const projectedChange = change * 0.5; // Assume momentum continues at 50%
    const predictedVelocity = Math.max(
      0,
      Math.min(100, currentVelocity.velocityIndex + projectedChange)
    );
    const confidence = history.length >= 6 ? 0.7 : 0.5;
    forecast = {
      predictedVelocity: Math.round(predictedVelocity),
      confidence,
    };
  }

  return {
    zipCode,
    currentVelocity: currentVelocity.velocityIndex,
    previousVelocity,
    change,
    trend,
    trendStrength,
    history: history.map((h) => ({
      date: h.calculated_at,
      velocityIndex: h.velocity_index,
      classification: h.classification,
    })),
    forecast,
  };
}

// =============================================
// Helper Functions
// =============================================

/**
 * Check if a state is in a specific region
 */
function isStateInRegion(state: string, region: string): boolean {
  const regions: Record<string, string[]> = {
    northeast: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
    southeast: ['DE', 'MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS', 'TN', 'KY', 'LA', 'AR'],
    midwest: ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
    southwest: ['TX', 'OK', 'NM', 'AZ'],
    west: ['CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'NV', 'UT', 'CA', 'AK', 'HI'],
  };

  const statesInRegion = regions[region] || [];
  return statesInRegion.includes(state.toUpperCase());
}
