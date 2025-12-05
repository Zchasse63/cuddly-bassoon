/**
 * TIGERweb Boundary Service
 * Fetches Census boundary polygons for map visualization
 * using the free Census Bureau TIGERweb REST API
 */

import {
  CensusBoundaryFeature,
  CensusBoundaryResponse,
  GeographyType,
} from '@/types/comp-selection';

// ============================================
// Configuration
// ============================================

const TIGERWEB_BASE_URL =
  'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Layer IDs for different geography types in TIGERweb
 */
const LAYER_IDS: Record<GeographyType, number> = {
  tract: 0, // Census Tracts
  blockGroup: 1, // Block Groups
};

// ============================================
// Error Classes
// ============================================

export class TIGERwebError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = 'TIGERwebError';
  }
}

export class TIGERwebTimeoutError extends TIGERwebError {
  constructor(message: string, requestId?: string) {
    super(message, 408, requestId);
    this.name = 'TIGERwebTimeoutError';
  }
}

export class TIGERwebNotFoundError extends TIGERwebError {
  constructor(message: string, requestId?: string) {
    super(message, 404, requestId);
    this.name = 'TIGERwebNotFoundError';
  }
}

// ============================================
// TIGERweb Client
// ============================================

interface BoundaryOptions {
  timeout?: number;
  requestId?: string;
}

/**
 * Get Census boundary polygon by GEOID
 */
export async function getCensusBoundary(
  geoid: string,
  type: GeographyType,
  options: BoundaryOptions = {}
): Promise<CensusBoundaryFeature | null> {
  const { timeout = DEFAULT_TIMEOUT, requestId = crypto.randomUUID() } = options;

  const layerId = LAYER_IDS[type];

  // Build URL with query parameters
  const url = new URL(`${TIGERWEB_BASE_URL}/${layerId}/query`);
  url.searchParams.set('where', `GEOID='${geoid}'`);
  url.searchParams.set('outFields', 'GEOID,NAME,AREALAND');
  url.searchParams.set('returnGeometry', 'true');
  url.searchParams.set('outSR', '4326'); // WGS84 coordinate system
  url.searchParams.set('f', 'geojson');

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
      throw new TIGERwebError(
        `TIGERweb API error: ${response.statusText}`,
        response.status,
        requestId
      );
    }

    const data: CensusBoundaryResponse = await response.json();

    // Check if we got a valid feature
    if (!data.features || data.features.length === 0) {
      return null;
    }

    return data.features[0] ?? null;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof TIGERwebError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TIGERwebTimeoutError(`TIGERweb request timed out after ${timeout}ms`, requestId);
      }
      throw new TIGERwebError(error.message, undefined, requestId);
    }

    throw new TIGERwebError('Unknown error occurred', undefined, requestId);
  }
}

/**
 * Get Census boundary polygon by point (lat/lng)
 * Uses spatial intersection query
 */
export async function getCensusBoundaryByPoint(
  lat: number,
  lng: number,
  type: GeographyType,
  options: BoundaryOptions = {}
): Promise<CensusBoundaryFeature | null> {
  const { timeout = DEFAULT_TIMEOUT, requestId = crypto.randomUUID() } = options;

  const layerId = LAYER_IDS[type];

  // Build URL with spatial query parameters
  const url = new URL(`${TIGERWEB_BASE_URL}/${layerId}/query`);
  url.searchParams.set('geometry', `${lng},${lat}`);
  url.searchParams.set('geometryType', 'esriGeometryPoint');
  url.searchParams.set('inSR', '4326');
  url.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
  url.searchParams.set('outFields', 'GEOID,NAME,AREALAND');
  url.searchParams.set('returnGeometry', 'true');
  url.searchParams.set('outSR', '4326');
  url.searchParams.set('f', 'geojson');

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
      throw new TIGERwebError(
        `TIGERweb API error: ${response.statusText}`,
        response.status,
        requestId
      );
    }

    const data: CensusBoundaryResponse = await response.json();

    // Check if we got a valid feature
    if (!data.features || data.features.length === 0) {
      return null;
    }

    return data.features[0] ?? null;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof TIGERwebError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new TIGERwebTimeoutError(`TIGERweb request timed out after ${timeout}ms`, requestId);
      }
      throw new TIGERwebError(error.message, undefined, requestId);
    }

    throw new TIGERwebError('Unknown error occurred', undefined, requestId);
  }
}

/**
 * Get both block group and tract boundaries for a subject property
 */
export async function getSubjectBoundaries(
  blockGroupGeoid: string,
  tractGeoid: string,
  options: BoundaryOptions = {}
): Promise<{
  blockGroup: CensusBoundaryFeature | null;
  tract: CensusBoundaryFeature | null;
}> {
  const [blockGroup, tract] = await Promise.all([
    getCensusBoundary(blockGroupGeoid, 'blockGroup', options),
    getCensusBoundary(tractGeoid, 'tract', options),
  ]);

  return { blockGroup, tract };
}

/**
 * Get both block group and tract boundaries by coordinates
 */
export async function getBoundariesByPoint(
  lat: number,
  lng: number,
  options: BoundaryOptions = {}
): Promise<{
  blockGroup: CensusBoundaryFeature | null;
  tract: CensusBoundaryFeature | null;
}> {
  const [blockGroup, tract] = await Promise.all([
    getCensusBoundaryByPoint(lat, lng, 'blockGroup', options),
    getCensusBoundaryByPoint(lat, lng, 'tract', options),
  ]);

  return { blockGroup, tract };
}

/**
 * Calculate approximate area of a polygon feature in square miles
 */
export function getFeatureAreaSqMiles(feature: CensusBoundaryFeature): number {
  // AREALAND is in square meters
  if (feature.properties.AREALAND) {
    return feature.properties.AREALAND / 2589988.11; // Convert sq meters to sq miles
  }
  return 0;
}

/**
 * Get the center point of a boundary feature
 */
export function getFeatureCenter(
  feature: CensusBoundaryFeature
): { lat: number; lng: number } | null {
  const { geometry } = feature;

  if (!geometry || !geometry.coordinates) {
    return null;
  }

  // Handle both Polygon and MultiPolygon
  let coords: number[][] | undefined;

  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0] as number[][];
  } else if (geometry.type === 'MultiPolygon') {
    // Use the first polygon of the multipolygon
    const firstPoly = geometry.coordinates[0] as number[][][] | undefined;
    coords = firstPoly?.[0];
  }

  if (!coords || coords.length === 0) {
    return null;
  }

  // Calculate centroid
  let sumLng = 0;
  let sumLat = 0;

  for (const coord of coords) {
    if (coord[0] !== undefined && coord[1] !== undefined) {
      sumLng += coord[0];
      sumLat += coord[1];
    }
  }

  return {
    lng: sumLng / coords.length,
    lat: sumLat / coords.length,
  };
}

/**
 * Check if a point is inside a boundary feature
 */
export function isPointInFeature(
  lat: number,
  lng: number,
  feature: CensusBoundaryFeature
): boolean {
  const { geometry } = feature;

  if (!geometry || !geometry.coordinates) {
    return false;
  }

  // Get the polygon coordinates
  let rings: number[][][];

  if (geometry.type === 'Polygon') {
    rings = geometry.coordinates as number[][][];
  } else if (geometry.type === 'MultiPolygon') {
    // For simplicity, check all polygons
    for (const polygon of geometry.coordinates as number[][][][]) {
      if (isPointInRings(lat, lng, polygon)) {
        return true;
      }
    }
    return false;
  } else {
    return false;
  }

  return isPointInRings(lat, lng, rings);
}

/**
 * Ray casting algorithm to check if point is in polygon rings
 */
function isPointInRings(lat: number, lng: number, rings: number[][][]): boolean {
  const exteriorRing = rings[0];
  if (!exteriorRing) {
    return false;
  }

  // Check exterior ring
  if (!isPointInRing(lat, lng, exteriorRing)) {
    return false;
  }

  // Check interior rings (holes)
  for (let i = 1; i < rings.length; i++) {
    const ring = rings[i];
    if (ring && isPointInRing(lat, lng, ring)) {
      return false; // Point is in a hole
    }
  }

  return true;
}

/**
 * Ray casting algorithm for single ring
 */
function isPointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const ringI = ring[i];
    const ringJ = ring[j];

    if (!ringI || !ringJ) continue;

    const xi = ringI[0];
    const yi = ringI[1];
    const xj = ringJ[0];
    const yj = ringJ[1];

    if (xi === undefined || yi === undefined || xj === undefined || yj === undefined) {
      continue;
    }

    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
