/**
 * Map Utility Functions
 * Helper functions for map calculations and transformations
 */

import type { LngLatBounds } from 'mapbox-gl';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Convert Mapbox LngLatBounds to a plain object
 */
export function boundsToObject(bounds: LngLatBounds): MapBounds {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

/**
 * Check if a point is within bounds
 */
export function isPointInBounds(point: GeoPoint, bounds: MapBounds): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

/**
 * Calculate distance between two points in miles (Haversine formula)
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get center point of bounds
 */
export function getBoundsCenter(bounds: MapBounds): GeoPoint {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
}

/**
 * Expand bounds by a percentage
 */
export function expandBounds(bounds: MapBounds, percentage: number = 0.1): MapBounds {
  const latDiff = (bounds.north - bounds.south) * percentage;
  const lngDiff = (bounds.east - bounds.west) * percentage;

  return {
    north: bounds.north + latDiff,
    south: bounds.south - latDiff,
    east: bounds.east + lngDiff,
    west: bounds.west - lngDiff,
  };
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(point: GeoPoint, precision: number = 4): string {
  return `${point.lat.toFixed(precision)}, ${point.lng.toFixed(precision)}`;
}

/**
 * Convert bounds to query string format
 */
export function boundsToQueryString(bounds: MapBounds): string {
  return `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
}

/**
 * Parse bounds from query string
 */
export function parseBoundsFromQueryString(queryString: string): MapBounds | null {
  const parts = queryString.split(',').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) {
    return null;
  }
  return {
    south: parts[0]!,
    west: parts[1]!,
    north: parts[2]!,
    east: parts[3]!,
  };
}

