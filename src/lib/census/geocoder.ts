/**
 * Census Geocoder Service
 * Converts lat/lng coordinates to Census geographic identifiers
 * using the free Census Bureau Geocoder API
 */

import { CensusGeography, CensusGeocoderResponseSchema } from '@/types/comp-selection';

// ============================================
// Configuration
// ============================================

const CENSUS_GEOCODER_BASE_URL =
  'https://geocoding.geo.census.gov/geocoder/geographies/coordinates';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const BATCH_SIZE = 5; // Process in batches to avoid overwhelming the API
const BATCH_DELAY_MS = 100; // Delay between batches

// ============================================
// Error Classes
// ============================================

export class CensusGeocoderError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = 'CensusGeocoderError';
  }
}

export class CensusGeocoderTimeoutError extends CensusGeocoderError {
  constructor(message: string, requestId?: string) {
    super(message, 408, requestId);
    this.name = 'CensusGeocoderTimeoutError';
  }
}

export class CensusGeocoderNotFoundError extends CensusGeocoderError {
  constructor(message: string, requestId?: string) {
    super(message, 404, requestId);
    this.name = 'CensusGeocoderNotFoundError';
  }
}

// ============================================
// Census Geocoder Client
// ============================================

interface GeocodeOptions {
  timeout?: number;
  requestId?: string;
}

/**
 * Get Census geography data for a coordinate pair
 * Returns block group, tract, county, and state identifiers
 */
export async function getCensusGeography(
  lat: number,
  lng: number,
  options: GeocodeOptions = {}
): Promise<CensusGeography | null> {
  const { timeout = DEFAULT_TIMEOUT, requestId = crypto.randomUUID() } = options;

  // Build URL with query parameters
  const url = new URL(CENSUS_GEOCODER_BASE_URL);
  url.searchParams.set('x', lng.toString());
  url.searchParams.set('y', lat.toString());
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('vintage', 'Current_Current');
  url.searchParams.set('format', 'json');

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Request-Id': requestId,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new CensusGeocoderError(
        `Census Geocoder API error: ${response.statusText}`,
        response.status,
        requestId
      );
    }

    const data = await response.json();

    // Validate response schema
    const parsed = CensusGeocoderResponseSchema.safeParse(data);

    if (!parsed.success) {
      console.warn('Census Geocoder response validation warning:', parsed.error);
      // Continue with raw data if schema validation fails
    }

    const geographies = data.result?.geographies;
    const blockGroups = geographies?.['Census Block Groups'];
    const tracts = geographies?.['Census Tracts'];

    // Check if we got valid geography data
    if (!blockGroups?.length || !tracts?.length) {
      // Coordinates might be in water, outside US, or other edge case
      return null;
    }

    const blockGroup = blockGroups[0];
    const tract = tracts[0];

    return {
      blockGroupGeoid: blockGroup.GEOID,
      tractGeoid: tract.GEOID,
      countyFips: `${blockGroup.STATE}${blockGroup.COUNTY}`,
      stateFips: blockGroup.STATE,
      blockGroupName: blockGroup.NAME,
      tractName: tract.NAME,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof CensusGeocoderError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new CensusGeocoderTimeoutError(
          `Census Geocoder request timed out after ${timeout}ms`,
          requestId
        );
      }
      throw new CensusGeocoderError(error.message, undefined, requestId);
    }

    throw new CensusGeocoderError('Unknown error occurred', undefined, requestId);
  }
}

/**
 * Batch geocode multiple coordinates with rate limiting
 * Processes in batches to avoid overwhelming the API
 */
export async function batchCensusGeocode(
  coordinates: Array<{ id: string; lat: number; lng: number }>,
  options: GeocodeOptions = {}
): Promise<{
  results: Map<string, CensusGeography>;
  errors: Array<{ id: string; error: string }>;
}> {
  const results = new Map<string, CensusGeography>();
  const errors: Array<{ id: string; error: string }> = [];

  // Process in batches
  for (let i = 0; i < coordinates.length; i += BATCH_SIZE) {
    const batch = coordinates.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (coord) => {
      try {
        const geo = await getCensusGeography(coord.lat, coord.lng, options);
        if (geo) {
          results.set(coord.id, geo);
        } else {
          errors.push({
            id: coord.id,
            error: 'No census geography found for coordinates',
          });
        }
      } catch (error) {
        errors.push({
          id: coord.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    await Promise.all(promises);

    // Add delay between batches to be respectful to the API
    if (i + BATCH_SIZE < coordinates.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return { results, errors };
}

/**
 * Check if two properties share the same block group
 */
export function isSameBlockGroup(
  geo1: CensusGeography | undefined | null,
  geo2: CensusGeography | undefined | null
): boolean {
  if (!geo1?.blockGroupGeoid || !geo2?.blockGroupGeoid) {
    return false;
  }
  return geo1.blockGroupGeoid === geo2.blockGroupGeoid;
}

/**
 * Check if two properties share the same census tract
 */
export function isSameTract(
  geo1: CensusGeography | undefined | null,
  geo2: CensusGeography | undefined | null
): boolean {
  if (!geo1?.tractGeoid || !geo2?.tractGeoid) {
    return false;
  }
  return geo1.tractGeoid === geo2.tractGeoid;
}

/**
 * Check if two properties share the same county
 */
export function isSameCounty(
  geo1: CensusGeography | undefined | null,
  geo2: CensusGeography | undefined | null
): boolean {
  if (!geo1?.countyFips || !geo2?.countyFips) {
    return false;
  }
  return geo1.countyFips === geo2.countyFips;
}

/**
 * Get the geographic proximity level between two properties
 */
export function getGeographicProximityLevel(
  geo1: CensusGeography | undefined | null,
  geo2: CensusGeography | undefined | null
): 'block_group' | 'tract' | 'county' | 'state' | 'none' {
  if (!geo1 || !geo2) return 'none';

  if (isSameBlockGroup(geo1, geo2)) return 'block_group';
  if (isSameTract(geo1, geo2)) return 'tract';
  if (isSameCounty(geo1, geo2)) return 'county';
  if (geo1.stateFips === geo2.stateFips) return 'state';

  return 'none';
}
