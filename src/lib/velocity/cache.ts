/**
 * Market Velocity Index Cache
 * Caching layer for velocity calculations using Supabase
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import type {
  MarketVelocityIndex,
  MarketVelocityIndexRow,
  MarketVelocityHistoryRow,
  TrackedZipCodeRow,
} from '@/types/velocity';
import { rowToMarketVelocityIndex } from '@/types/velocity';

// =============================================
// Cache Configuration
// =============================================

const CACHE_TTL_HOURS = 24;

// =============================================
// Get Cached Velocity
// =============================================

/**
 * Get cached velocity index for a zip code
 * Returns null if not cached or expired
 */
export async function getCachedVelocity(zipCode: string): Promise<MarketVelocityIndex | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('market_velocity_index')
    .select('*')
    .eq('zip_code', zipCode)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return rowToMarketVelocityIndex(data as MarketVelocityIndexRow);
}

/**
 * Get cached velocity indexes for multiple zip codes
 */
export async function getCachedVelocities(
  zipCodes: string[]
): Promise<Map<string, MarketVelocityIndex>> {
  const supabase = await createClient();
  const results = new Map<string, MarketVelocityIndex>();

  const { data, error } = await supabase
    .from('market_velocity_index')
    .select('*')
    .in('zip_code', zipCodes)
    .gt('expires_at', new Date().toISOString());

  if (error || !data) {
    return results;
  }

  for (const row of data as MarketVelocityIndexRow[]) {
    results.set(row.zip_code, rowToMarketVelocityIndex(row));
  }

  return results;
}

// =============================================
// Save Velocity to Cache
// =============================================

/**
 * Save a calculated velocity index to the cache
 */
export async function cacheVelocityIndex(
  velocity: MarketVelocityIndex,
  previousVelocity?: number
): Promise<void> {
  const supabase = await createClient();

  // Calculate trend
  let velocityTrend: string | null = null;
  let velocityChange: number | null = null;

  if (previousVelocity !== undefined) {
    velocityChange = velocity.velocityIndex - previousVelocity;
    if (velocityChange > 5) {
      velocityTrend = 'Rising';
    } else if (velocityChange < -5) {
      velocityTrend = 'Falling';
    } else {
      velocityTrend = 'Stable';
    }
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  // Upsert the velocity index
  const { error: upsertError } = await supabase.from('market_velocity_index').upsert(
    {
      zip_code: velocity.zipCode,
      geo_id: velocity.geoId,
      city: velocity.city,
      state: velocity.state,
      county: velocity.county,
      days_on_market_score: velocity.daysOnMarketScore,
      absorption_score: velocity.absorptionScore,
      inventory_score: velocity.inventoryScore,
      permit_activity_score: velocity.permitActivityScore,
      investment_conviction_score: velocity.investmentConvictionScore,
      avg_days_on_market: velocity.avgDaysOnMarket,
      median_days_on_market: velocity.medianDaysOnMarket,
      absorption_rate: velocity.absorptionRate,
      months_of_inventory: velocity.monthsOfInventory,
      total_listings: velocity.totalListings,
      permit_volume: velocity.permitVolume,
      permit_value_total: velocity.permitValueTotal,
      velocity_index: velocity.velocityIndex,
      classification: velocity.classification,
      velocity_trend: velocityTrend,
      velocity_change: velocityChange,
      center_lat: velocity.centerLat,
      center_lng: velocity.centerLng,
      calculated_at: velocity.calculatedAt,
      rentcast_data_date: velocity.dataFreshness.rentcastLastUpdated,
      shovels_data_date: velocity.dataFreshness.shovelsLastUpdated,
      expires_at: expiresAt.toISOString(),
    },
    {
      onConflict: 'zip_code',
    }
  );

  if (upsertError) {
    console.error('[Velocity Cache] Error caching velocity index:', upsertError);
    throw upsertError;
  }

  // Save to history for trend tracking
  const { error: historyError } = await supabase.from('market_velocity_history').insert({
    zip_code: velocity.zipCode,
    velocity_index: velocity.velocityIndex,
    classification: velocity.classification,
    component_scores: {
      dom: velocity.daysOnMarketScore,
      absorption: velocity.absorptionScore,
      inventory: velocity.inventoryScore,
      permits: velocity.permitActivityScore,
      investment: velocity.investmentConvictionScore,
    },
    raw_metrics: {
      avgDaysOnMarket: velocity.avgDaysOnMarket,
      absorptionRate: velocity.absorptionRate,
      monthsOfInventory: velocity.monthsOfInventory,
      totalListings: velocity.totalListings,
      permitVolume: velocity.permitVolume,
      permitValueTotal: velocity.permitValueTotal,
    },
  });

  if (historyError) {
    // Non-critical error, just log it
    console.warn('[Velocity Cache] Error saving to history:', historyError);
  }
}

// =============================================
// Get Previous Velocity for Trend
// =============================================

/**
 * Get the previous velocity index for trend calculation
 */
export async function getPreviousVelocity(zipCode: string): Promise<number | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('market_velocity_index')
    .select('velocity_index')
    .eq('zip_code', zipCode)
    .single();

  if (error || !data) {
    return undefined;
  }

  return data.velocity_index;
}

// =============================================
// Velocity History
// =============================================

/**
 * Get velocity history for a zip code
 */
export async function getVelocityHistory(
  zipCode: string,
  timeframe: '30d' | '90d' | '6m' | '1y'
): Promise<MarketVelocityHistoryRow[]> {
  const supabase = await createClient();

  // Calculate the date cutoff
  const cutoffDate = new Date();
  switch (timeframe) {
    case '30d':
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      break;
    case '6m':
      cutoffDate.setMonth(cutoffDate.getMonth() - 6);
      break;
    case '1y':
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      break;
  }

  const { data, error } = await supabase
    .from('market_velocity_history')
    .select('*')
    .eq('zip_code', zipCode)
    .gte('calculated_at', cutoffDate.toISOString())
    .order('calculated_at', { ascending: true });

  if (error) {
    console.error('[Velocity Cache] Error fetching history:', error);
    return [];
  }

  return (data as MarketVelocityHistoryRow[]) || [];
}

// =============================================
// Velocity Rankings
// =============================================

/**
 * Get top or bottom velocity rankings
 */
export async function getVelocityRankings(
  type: 'top' | 'bottom',
  limit: number = 20,
  state?: string
): Promise<MarketVelocityIndex[]> {
  const supabase = await createClient();

  let query = supabase
    .from('market_velocity_index')
    .select('*')
    .gt('expires_at', new Date().toISOString());

  if (state) {
    query = query.eq('state', state);
  }

  if (type === 'top') {
    query = query.order('velocity_index', { ascending: false });
  } else {
    query = query.order('velocity_index', { ascending: true });
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('[Velocity Cache] Error fetching rankings:', error);
    return [];
  }

  return (data as MarketVelocityIndexRow[]).map(rowToMarketVelocityIndex);
}

// =============================================
// Velocity for Bounds (Heat Map)
// =============================================

/**
 * Get velocity data within geographic bounds for heat map rendering
 */
export async function getVelocityForBounds(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}): Promise<MarketVelocityIndex[]> {
  // Use admin client for public velocity data (bypasses RLS issues with cookie-based auth)
  const supabase = createAdminClient();

  console.log('[Velocity Cache] Querying with bounds:', bounds);
  console.log('[Velocity Cache] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[Velocity Cache] Secret key exists:', !!process.env.SUPABASE_SECRET_KEY);

  // First, let's try a simple count query to verify connection
  const { count, error: countError } = await supabase
    .from('market_velocity_index')
    .select('*', { count: 'exact', head: true });

  console.log('[Velocity Cache] Table count:', { count, countError });

  // Fetch all velocity data and filter in JS (Supabase client has issues with numeric comparisons)
  const { data, error } = await supabase
    .from('market_velocity_index')
    .select('zip_code, velocity_index, classification, center_lat, center_lng')
    .not('center_lat', 'is', null)
    .not('center_lng', 'is', null);

  console.log('[Velocity Cache] Raw query result:', {
    error,
    dataCount: data?.length ?? 0,
    firstRow: data?.[0],
  });

  if (error || !data) {
    console.error('[Velocity Cache] Error fetching velocity data:', error);
    return [];
  }

  // Filter in JavaScript since Supabase client has issues with numeric type comparisons
  const filtered = data.filter((row) => {
    const lat = parseFloat(String(row.center_lat));
    const lng = parseFloat(String(row.center_lng));
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
  });

  console.log('[Velocity Cache] Filtered result:', { count: filtered.length, bounds });

  // Map filtered data to MarketVelocityIndex format
  // Note: center_lat/center_lng may be strings from database, so we parse them
  return filtered.map((row) => ({
    zipCode: row.zip_code,
    velocityIndex: row.velocity_index,
    classification: row.classification,
    centerLat: parseFloat(String(row.center_lat)),
    centerLng: parseFloat(String(row.center_lng)),
    // Fill in defaults for other fields
    daysOnMarketScore: 0,
    absorptionScore: 0,
    inventoryScore: 0,
    permitActivityScore: 0,
    investmentConvictionScore: 0,
    avgDaysOnMarket: 0,
    medianDaysOnMarket: 0,
    absorptionRate: 0,
    monthsOfInventory: 0,
    totalListings: 0,
    permitVolume: 0,
    permitValueTotal: 0,
    calculatedAt: new Date().toISOString(),
    dataFreshness: {},
  })) as MarketVelocityIndex[];
}

// =============================================
// Tracked Zip Codes Management
// =============================================

/**
 * Get all tracked zip codes
 */
export async function getTrackedZipCodes(
  options: {
    activeOnly?: boolean;
    state?: string;
    limit?: number;
  } = {}
): Promise<TrackedZipCodeRow[]> {
  const supabase = await createClient();

  let query = supabase.from('tracked_zip_codes').select('*');

  if (options.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  if (options.state) {
    query = query.eq('state', options.state);
  }

  query = query.order('priority', { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Velocity Cache] Error fetching tracked zip codes:', error);
    return [];
  }

  return (data as TrackedZipCodeRow[]) || [];
}

/**
 * Add a zip code to tracking
 */
export async function addTrackedZipCode(
  zipCode: string,
  options: {
    geoId?: string;
    city?: string;
    state: string;
    county?: string;
    centerLat?: number;
    centerLng?: number;
    priority?: number;
  }
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('tracked_zip_codes').upsert(
    {
      zip_code: zipCode,
      geo_id: options.geoId,
      city: options.city,
      state: options.state,
      county: options.county,
      center_lat: options.centerLat,
      center_lng: options.centerLng,
      priority: options.priority || 5,
      is_active: true,
    },
    {
      onConflict: 'zip_code',
    }
  );

  if (error) {
    console.error('[Velocity Cache] Error adding tracked zip code:', error);
    throw error;
  }
}

/**
 * Update last calculated timestamp for a zip code
 */
export async function updateTrackedZipCodeTimestamp(zipCode: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tracked_zip_codes')
    .update({ last_calculated_at: new Date().toISOString() })
    .eq('zip_code', zipCode);

  if (error) {
    console.warn('[Velocity Cache] Error updating tracked zip timestamp:', error);
  }
}

// =============================================
// Cache Utilities
// =============================================

/**
 * Check if a velocity index is still fresh
 */
export function isVelocityExpired(velocity: MarketVelocityIndex): boolean {
  const calculatedAt = new Date(velocity.calculatedAt);
  const expiresAt = new Date(calculatedAt);
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

  return new Date() > expiresAt;
}

/**
 * Clear expired velocity entries (for maintenance)
 */
export async function clearExpiredVelocities(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('market_velocity_index')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');

  if (error) {
    console.error('[Velocity Cache] Error clearing expired entries:', error);
    return 0;
  }

  return data?.length || 0;
}
