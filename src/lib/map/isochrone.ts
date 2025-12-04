/**
 * Isochrone API Service
 * Fetches travel time polygons from Mapbox Isochrone API
 */

import { MAPBOX_TOKEN } from './config';

export type TravelProfile = 'driving' | 'walking' | 'cycling' | 'driving-traffic';

export interface IsochroneOptions {
  center: { lng: number; lat: number };
  minutes: number | number[]; // Single value or array for multiple contours
  profile?: TravelProfile;
  generalize?: number; // Tolerance in meters for simplifying geometry
  denoise?: number; // 0-1, removes small contours
}

export interface IsochroneContour {
  minutes: number;
  color: string;
  geometry: GeoJSON.Polygon;
}

export interface IsochroneResult {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: {
      contour: number;
      color: string;
      opacity: number;
      fill: string;
      'fill-opacity': number;
      fillColor: string;
      fillOpacity: number;
    };
    geometry: GeoJSON.Polygon;
  }>;
}

// Default colors for different time ranges
const CONTOUR_COLORS: Record<number, string> = {
  5: '#22c55e',   // Green - 5 min
  10: '#84cc16',  // Lime - 10 min
  15: '#eab308',  // Yellow - 15 min
  20: '#f97316',  // Orange - 20 min
  30: '#ef4444',  // Red - 30 min
  45: '#dc2626',  // Dark red - 45 min
  60: '#991b1b',  // Darker red - 60 min
};

/**
 * Fetch isochrone data from Mapbox API
 */
export async function fetchIsochrone(options: IsochroneOptions): Promise<IsochroneResult> {
  const {
    center,
    minutes,
    profile = 'driving',
    generalize = 500,
    denoise = 1,
  } = options;

  // Convert minutes to array and create contours string
  const minutesArray = Array.isArray(minutes) ? minutes : [minutes];
  const contoursMinutes = minutesArray.join(',');

  // Build URL
  const baseUrl = 'https://api.mapbox.com/isochrone/v1/mapbox';
  const url = new URL(`${baseUrl}/${profile}/${center.lng},${center.lat}`);
  
  url.searchParams.set('contours_minutes', contoursMinutes);
  url.searchParams.set('polygons', 'true');
  url.searchParams.set('generalize', generalize.toString());
  url.searchParams.set('denoise', denoise.toString());
  url.searchParams.set('access_token', MAPBOX_TOKEN);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Isochrone API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Get color for a given minute value
 */
export function getContourColor(minutes: number): string {
  // Find the closest defined color
  const defined = Object.keys(CONTOUR_COLORS).map(Number).sort((a, b) => a - b);
  for (const threshold of defined) {
    if (minutes <= threshold) {
      return CONTOUR_COLORS[threshold] ?? '#3b82f6';
    }
  }
  return CONTOUR_COLORS[60] ?? '#991b1b';
}

/**
 * Create isochrone layer style for Mapbox GL
 */
export function createIsochroneLayerStyle(id: string, sourceId: string) {
  return {
    fill: {
      id: `${id}-fill`,
      type: 'fill' as const,
      source: sourceId,
      paint: {
        'fill-color': ['get', 'fillColor'],
        'fill-opacity': 0.2,
      },
    },
    outline: {
      id: `${id}-outline`,
      type: 'line' as const,
      source: sourceId,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2,
        'line-opacity': 0.8,
      },
    },
  };
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number, profile: TravelProfile): string {
  const profileLabels: Record<TravelProfile, string> = {
    driving: 'drive',
    'driving-traffic': 'drive (with traffic)',
    walking: 'walk',
    cycling: 'bike ride',
  };
  
  if (minutes < 60) {
    return `${minutes} min ${profileLabels[profile]}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 
    ? `${hours}h ${mins}m ${profileLabels[profile]}`
    : `${hours}h ${profileLabels[profile]}`;
}

