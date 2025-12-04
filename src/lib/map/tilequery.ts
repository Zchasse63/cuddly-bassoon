/**
 * Tilequery API Service
 * Performs spatial queries against Mapbox tilesets
 */

import { MAPBOX_TOKEN } from './config';

export interface TilequeryOptions {
  /** Longitude of query point */
  lng: number;
  /** Latitude of query point */
  lat: number;
  /** Tileset ID(s) to query - can be comma-separated */
  tilesetId: string;
  /** Search radius in meters (default: 0, max: 10000) */
  radius?: number;
  /** Maximum number of results (default: 5, max: 50) */
  limit?: number;
  /** Filter by geometry type */
  geometry?: 'point' | 'linestring' | 'polygon';
  /** Layers within tileset to query */
  layers?: string[];
  /** Deduplicate results */
  dedupe?: boolean;
}

export interface TilequeryFeature {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJSON.Geometry;
  properties: Record<string, unknown>;
  /** Tilequery-specific properties */
  tilequery: {
    /** Distance in meters from query point */
    distance: number;
    /** Geometry type */
    geometry: string;
    /** Source layer name */
    layer: string;
  };
}

export interface TilequeryResult {
  type: 'FeatureCollection';
  features: TilequeryFeature[];
}

// Common Mapbox tileset IDs for real estate analysis
export const MAPBOX_TILESETS = {
  // Mapbox public tilesets
  boundaries: 'mapbox.enterprise-boundaries-a0-v2', // Admin level 0 (countries)
  places: 'mapbox.mapbox-streets-v8',
  terrain: 'mapbox.mapbox-terrain-v2',
  // Custom tilesets would be added here
} as const;

/**
 * Query features near a point from Mapbox tilesets
 */
export async function queryTileset(options: TilequeryOptions): Promise<TilequeryResult> {
  const {
    lng,
    lat,
    tilesetId,
    radius = 0,
    limit = 5,
    geometry,
    layers,
    dedupe = true,
  } = options;

  const baseUrl = 'https://api.mapbox.com/v4';
  const url = new URL(`${baseUrl}/${tilesetId}/tilequery/${lng},${lat}.json`);

  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('dedupe', dedupe.toString());
  url.searchParams.set('access_token', MAPBOX_TOKEN);

  if (geometry) {
    url.searchParams.set('geometry', geometry);
  }

  if (layers && layers.length > 0) {
    url.searchParams.set('layers', layers.join(','));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Tilequery API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Find all features within a polygon
 * Uses multiple point queries to approximate polygon query
 */
export async function queryWithinPolygon(
  polygon: GeoJSON.Polygon,
  tilesetId: string,
  options?: Partial<Omit<TilequeryOptions, 'lng' | 'lat' | 'tilesetId'>>
): Promise<TilequeryFeature[]> {
  // Get bounding box of polygon
  const coords = polygon.coordinates[0];
  if (!coords || coords.length === 0) {
    return [];
  }
  
  const lngs = coords.map((c) => c[0]).filter((v): v is number => v !== undefined);
  const lats = coords.map((c) => c[1]).filter((v): v is number => v !== undefined);
  
  const center = {
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
  };

  // Calculate approximate radius from center to corner
  const maxLng = Math.max(...lngs);
  const maxLat = Math.max(...lats);
  const radius = Math.sqrt(
    Math.pow((maxLng - center.lng) * 111000, 2) +
    Math.pow((maxLat - center.lat) * 111000, 2)
  );

  const result = await queryTileset({
    ...options,
    lng: center.lng,
    lat: center.lat,
    tilesetId,
    radius: Math.min(radius, 10000), // Max 10km
    limit: options?.limit ?? 50,
  });

  return result.features;
}

/**
 * Get nearby POIs of specific types
 */
export async function getNearbyPOIs(
  lng: number,
  lat: number,
  radiusMeters: number = 1000,
  poiTypes?: string[]
): Promise<TilequeryFeature[]> {
  const result = await queryTileset({
    lng,
    lat,
    tilesetId: MAPBOX_TILESETS.places,
    radius: radiusMeters,
    limit: 50,
    layers: ['poi_label'],
  });

  // Filter by POI types if specified
  if (poiTypes && poiTypes.length > 0) {
    return result.features.filter((f) => {
      const category = f.properties.category_en as string | undefined;
      return category && poiTypes.includes(category);
    });
  }

  return result.features;
}

