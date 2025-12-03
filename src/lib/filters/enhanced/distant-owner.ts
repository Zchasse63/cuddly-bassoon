/**
 * Distant Owner Filter
 * Identifies properties where owner lives far from the property (100+ miles)
 * Uses Haversine formula for distance calculation
 */

import type { PropertyData, FilterMatch } from '../types';

export interface DistantOwnerParams {
  minDistanceMiles?: number;
}

const DEFAULT_MIN_DISTANCE = 100;
const EARTH_RADIUS_MILES = 3959;

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

/**
 * Approximate coordinates from zip code (fallback)
 * In production, this would use a geocoding service or zip code database
 */
function estimateStateCenter(state: string): { lat: number; lon: number } | null {
  // Approximate state centers for distance estimation
  const stateCenters: Record<string, { lat: number; lon: number }> = {
    'AL': { lat: 32.3, lon: -86.9 }, 'AK': { lat: 64.2, lon: -152.5 },
    'AZ': { lat: 34.0, lon: -111.0 }, 'AR': { lat: 35.2, lon: -91.8 },
    'CA': { lat: 36.8, lon: -119.4 }, 'CO': { lat: 39.1, lon: -105.4 },
    'CT': { lat: 41.6, lon: -72.7 }, 'DE': { lat: 39.0, lon: -75.5 },
    'FL': { lat: 27.8, lon: -81.7 }, 'GA': { lat: 32.9, lon: -83.1 },
    'HI': { lat: 19.9, lon: -155.6 }, 'ID': { lat: 44.2, lon: -114.4 },
    'IL': { lat: 40.6, lon: -89.0 }, 'IN': { lat: 40.3, lon: -86.1 },
    'IA': { lat: 42.0, lon: -93.2 }, 'KS': { lat: 38.5, lon: -98.0 },
    'KY': { lat: 37.8, lon: -84.3 }, 'LA': { lat: 30.5, lon: -92.0 },
    'ME': { lat: 45.3, lon: -69.4 }, 'MD': { lat: 39.0, lon: -76.6 },
    'MA': { lat: 42.4, lon: -71.4 }, 'MI': { lat: 44.3, lon: -85.6 },
    'MN': { lat: 46.4, lon: -94.6 }, 'MS': { lat: 32.7, lon: -89.7 },
    'MO': { lat: 38.5, lon: -92.3 }, 'MT': { lat: 46.9, lon: -110.4 },
    'NE': { lat: 41.1, lon: -98.3 }, 'NV': { lat: 38.3, lon: -117.1 },
    'NH': { lat: 43.5, lon: -71.5 }, 'NJ': { lat: 40.3, lon: -74.5 },
    'NM': { lat: 34.8, lon: -106.2 }, 'NY': { lat: 43.3, lon: -74.9 },
    'NC': { lat: 35.6, lon: -79.8 }, 'ND': { lat: 47.5, lon: -100.5 },
    'OH': { lat: 40.4, lon: -82.9 }, 'OK': { lat: 35.0, lon: -97.5 },
    'OR': { lat: 44.0, lon: -120.5 }, 'PA': { lat: 41.2, lon: -77.2 },
    'RI': { lat: 41.7, lon: -71.5 }, 'SC': { lat: 34.0, lon: -80.9 },
    'SD': { lat: 43.9, lon: -99.4 }, 'TN': { lat: 35.5, lon: -86.0 },
    'TX': { lat: 31.0, lon: -100.0 }, 'UT': { lat: 39.3, lon: -111.1 },
    'VT': { lat: 44.0, lon: -72.7 }, 'VA': { lat: 37.8, lon: -78.2 },
    'WA': { lat: 47.4, lon: -120.7 }, 'WV': { lat: 38.5, lon: -80.5 },
    'WI': { lat: 43.8, lon: -89.5 }, 'WY': { lat: 43.1, lon: -107.3 },
  };

  const normalized = state.toUpperCase().trim();
  return stateCenters[normalized] || null;
}

/**
 * Check if owner is distant from property
 */
export function applyDistantOwnerFilter(
  property: PropertyData,
  params: DistantOwnerParams = {}
): FilterMatch {
  const minDistance = params.minDistanceMiles ?? DEFAULT_MIN_DISTANCE;

  // Try to use exact coordinates if available
  const propertyLat = property.latitude;
  const propertyLon = property.longitude;

  // For owner location, we typically need to geocode mailing address
  // For now, use state-level estimation as fallback
  const propertyState = property.state?.toUpperCase();
  const ownerState = (property.ownerState || property.mailingState)?.toUpperCase();

  if (!propertyState) {
    return {
      filterId: 'distant_owner',
      matched: false,
      score: 0,
      reason: 'Property state not available',
    };
  }

  if (!ownerState) {
    return {
      filterId: 'distant_owner',
      matched: false,
      score: 0,
      reason: 'Owner state not available',
    };
  }

  // Same state - likely not distant (though could be in large states)
  if (propertyState === ownerState && !propertyLat) {
    return {
      filterId: 'distant_owner',
      matched: false,
      score: 0,
      reason: 'Owner and property in same state (distance cannot be verified without coordinates)',
    };
  }

  // Different states - estimate distance
  const propertyCenter = estimateStateCenter(propertyState);
  const ownerCenter = estimateStateCenter(ownerState);

  if (!propertyCenter || !ownerCenter) {
    return {
      filterId: 'distant_owner',
      matched: false,
      score: 0,
      reason: 'Unable to determine location coordinates',
    };
  }

  const distance = calculateDistance(
    propertyLat || propertyCenter.lat,
    propertyLon || propertyCenter.lon,
    ownerCenter.lat,
    ownerCenter.lon
  );

  if (distance >= minDistance) {
    const score = Math.min(100, 60 + Math.floor(distance / 50));

    return {
      filterId: 'distant_owner',
      matched: true,
      score,
      reason: `Owner is approximately ${Math.round(distance)} miles from property`,
      data: {
        estimatedDistance: Math.round(distance),
        propertyState,
        ownerState,
        isEstimate: !propertyLat,
      },
    };
  }

  return {
    filterId: 'distant_owner',
    matched: false,
    score: 0,
    reason: `Estimated distance of ${Math.round(distance)} miles is below ${minDistance} mile threshold`,
    data: { estimatedDistance: Math.round(distance) },
  };
}

