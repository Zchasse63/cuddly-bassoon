/**
 * Calculate Velocity Indexes Job
 * Background job to calculate market velocity for tracked zip codes
 */

import { createClient } from '@/lib/supabase/server';
import { getRentCastClient } from '@/lib/rentcast/client';
import { getCityMetrics, searchCities } from '@/lib/shovels/client';
import { calculateMarketVelocityIndex } from '@/lib/velocity/calculator';
import {
  cacheVelocityIndex,
  getPreviousVelocity,
  updateTrackedZipCodeTimestamp,
  getTrackedZipCodes,
} from '@/lib/velocity/cache';

export interface JobResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
  duration: number;
}

/**
 * Calculate velocity indexes for all tracked zip codes
 */
export async function calculateAllVelocityIndexes(options?: {
  batchSize?: number;
  delayBetweenBatches?: number;
  state?: string;
  limit?: number;
}): Promise<JobResult> {
  const {
    batchSize = 20,
    delayBetweenBatches = 1000,
    state,
    limit,
  } = options || {};

  const startTime = Date.now();
  const results: JobResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    duration: 0,
  };

  console.log('[Velocity Job] Starting velocity calculation...');

  try {
    // Get all tracked zip codes
    const zipCodes = await getTrackedZipCodes({
      activeOnly: true,
      state,
      limit,
    });

    console.log(`[Velocity Job] Found ${zipCodes.length} zip codes to process`);

    if (zipCodes.length === 0) {
      console.log('[Velocity Job] No zip codes to process');
      results.duration = Date.now() - startTime;
      return results;
    }

    // Get RentCast client
    const rentcastClient = getRentCastClient();

    // Process in batches to respect rate limits
    for (let i = 0; i < zipCodes.length; i += batchSize) {
      const batch = zipCodes.slice(i, i + batchSize);

      console.log(
        `[Velocity Job] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(zipCodes.length / batchSize)}`
      );

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(async (zip) => {
          try {
            // Fetch RentCast market data
            const marketData = await rentcastClient.getMarketData(zip.zip_code);

            // Try to get Shovels data
            let shovelsMetrics = null;
            try {
              if (zip.geo_id) {
                shovelsMetrics = await getCityMetrics(zip.geo_id);
              } else {
                // Try to find city geo_id
                const cities = await searchCities(zip.zip_code);
                if (cities.length > 0) {
                  shovelsMetrics = await getCityMetrics(cities[0]!.geo_id);
                }
              }
            } catch (shovelsError) {
              console.warn(
                `[Velocity Job] Could not fetch Shovels data for ${zip.zip_code}:`,
                shovelsError
              );
              // Continue without Shovels data
            }

            // Get previous velocity for trend calculation
            const previousVelocity = await getPreviousVelocity(zip.zip_code);

            // Calculate velocity index
            const velocity = calculateMarketVelocityIndex(marketData, shovelsMetrics, {
              zipCode: zip.zip_code,
              city: zip.city || marketData.city || undefined,
              state: zip.state || marketData.state || undefined,
              geoId: zip.geo_id || shovelsMetrics?.geo_id,
              centerLat: zip.center_lat || undefined,
              centerLng: zip.center_lng || undefined,
            });

            // Add trend information
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
            await updateTrackedZipCodeTimestamp(zip.zip_code);

            return { zipCode: zip.zip_code, success: true };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`${zip.zip_code}: ${errorMessage}`);
          }
        })
      );

      // Process batch results
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(result.reason?.message || 'Unknown error');
        }
      }

      // Delay between batches to respect rate limits
      if (i + batchSize < zipCodes.length) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
      }
    }
  } catch (error) {
    console.error('[Velocity Job] Fatal error:', error);
    results.errors.push(
      `Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  results.duration = Date.now() - startTime;

  console.log(
    `[Velocity Job] Complete: ${results.success} success, ${results.failed} failed, ${results.duration}ms`
  );

  return results;
}

/**
 * Calculate velocity for a single zip code
 */
export async function calculateVelocityForZip(zipCode: string): Promise<void> {
  console.log(`[Velocity Job] Calculating velocity for ${zipCode}`);

  const rentcastClient = getRentCastClient();
  const marketData = await rentcastClient.getMarketData(zipCode);

  // Try to get Shovels data
  let shovelsMetrics = null;
  try {
    const cities = await searchCities(zipCode);
    if (cities.length > 0) {
      shovelsMetrics = await getCityMetrics(cities[0]!.geo_id);
    }
  } catch {
    // Continue without Shovels data
  }

  // Get previous velocity for trend
  const previousVelocity = await getPreviousVelocity(zipCode);

  // Calculate velocity
  const velocity = calculateMarketVelocityIndex(marketData, shovelsMetrics, {
    zipCode,
    city: marketData.city || undefined,
    state: marketData.state || undefined,
    geoId: shovelsMetrics?.geo_id,
  });

  // Add trend
  if (previousVelocity !== undefined) {
    const change = velocity.velocityIndex - previousVelocity;
    velocity.velocityChange = change;
    if (change > 5) velocity.velocityTrend = 'Rising';
    else if (change < -5) velocity.velocityTrend = 'Falling';
    else velocity.velocityTrend = 'Stable';
  }

  // Cache result
  await cacheVelocityIndex(velocity, previousVelocity);
  await updateTrackedZipCodeTimestamp(zipCode);

  console.log(
    `[Velocity Job] ${zipCode} calculated: ${velocity.velocityIndex} (${velocity.classification})`
  );
}

/**
 * Calculate velocity aggregates for cities and counties
 */
export async function calculateVelocityAggregates(): Promise<{
  cities: number;
  counties: number;
  states: number;
}> {
  console.log('[Velocity Job] Calculating velocity aggregates...');

  const supabase = await createClient();

  // Calculate city-level aggregates
  const { data: cityAggregates, error: cityError } = await supabase.rpc(
    'calculate_city_velocity_aggregates'
  );

  if (cityError) {
    console.error('[Velocity Job] Error calculating city aggregates:', cityError);
  }

  return {
    cities: cityAggregates?.length || 0,
    counties: 0, // TODO: Implement county aggregates
    states: 0, // TODO: Implement state aggregates
  };
}

/**
 * Seed tracked zip codes from properties table
 * Run once to populate the initial list of zip codes to track
 */
export async function seedTrackedZipCodes(options?: {
  state?: string;
  limit?: number;
}): Promise<number> {
  console.log('[Velocity Job] Seeding tracked zip codes...');

  const supabase = await createClient();

  // Get distinct zip codes from properties table
  let query = supabase
    .from('properties')
    .select('zip, city, state, latitude, longitude')
    .not('zip', 'is', null);

  if (options?.state) {
    query = query.eq('state', options.state);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: properties, error } = await query;

  if (error) {
    console.error('[Velocity Job] Error fetching properties:', error);
    throw error;
  }

  // Group by zip code and get representative data
  const zipMap = new Map<
    string,
    {
      zip: string;
      city?: string;
      state?: string;
      lat?: number;
      lng?: number;
    }
  >();

  for (const prop of properties || []) {
    if (!prop.zip) continue;

    if (!zipMap.has(prop.zip)) {
      zipMap.set(prop.zip, {
        zip: prop.zip,
        city: prop.city || undefined,
        state: prop.state || undefined,
        lat: prop.latitude || undefined,
        lng: prop.longitude || undefined,
      });
    }
  }

  // Insert into tracked_zip_codes
  const zipCodes = Array.from(zipMap.values());
  let insertedCount = 0;

  for (const zip of zipCodes) {
    if (!zip.state) continue;

    try {
      const { error: insertError } = await supabase.from('tracked_zip_codes').upsert(
        {
          zip_code: zip.zip,
          city: zip.city,
          state: zip.state,
          center_lat: zip.lat,
          center_lng: zip.lng,
          is_active: true,
          priority: 5,
        },
        {
          onConflict: 'zip_code',
        }
      );

      if (!insertError) {
        insertedCount++;
      }
    } catch {
      // Ignore duplicates
    }
  }

  console.log(`[Velocity Job] Seeded ${insertedCount} zip codes`);
  return insertedCount;
}
