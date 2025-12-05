/**
 * Micro-Territory Comp Selection Types
 * Types for Census geography, comp scoring, and visualization
 */

import { z } from 'zod';

// ============================================
// Census Geography Types
// ============================================

/**
 * Census geography data returned from the Geocoder API
 */
export interface CensusGeography {
  blockGroupGeoid: string; // 12-digit unique block group ID
  tractGeoid: string; // 11-digit unique tract ID
  countyFips: string; // 5-digit state+county FIPS
  stateFips: string; // 2-digit state FIPS
  blockGroupName: string; // Human-readable block group name
  tractName: string; // Human-readable tract name
}

/**
 * Census Geocoder API response schema
 */
export const CensusBlockGroupSchema = z.object({
  GEOID: z.string(),
  STATE: z.string(),
  COUNTY: z.string(),
  TRACT: z.string(),
  BLKGRP: z.string(),
  NAME: z.string(),
});

export const CensusTractSchema = z.object({
  GEOID: z.string(),
  STATE: z.string(),
  COUNTY: z.string(),
  TRACT: z.string(),
  NAME: z.string(),
});

export const CensusGeocoderResponseSchema = z.object({
  result: z.object({
    geographies: z.object({
      'Census Block Groups': z.array(CensusBlockGroupSchema).optional(),
      'Census Tracts': z.array(CensusTractSchema).optional(),
    }),
  }),
});

export type CensusGeocoderResponse = z.infer<typeof CensusGeocoderResponseSchema>;

// ============================================
// TIGERweb Boundary Types
// ============================================

/**
 * GeoJSON Feature for Census boundaries
 */
export interface CensusBoundaryFeature {
  type: 'Feature';
  properties: {
    GEOID: string;
    NAME: string;
    AREALAND?: number;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface CensusBoundaryResponse {
  type: 'FeatureCollection';
  features: CensusBoundaryFeature[];
}

export type GeographyType = 'blockGroup' | 'tract';

// ============================================
// Comp Scoring Types
// ============================================

/**
 * Comparable property tier classification
 */
export type CompTier = 'excellent' | 'good' | 'acceptable' | 'marginal';

/**
 * Configuration for comp scoring weights and thresholds
 */
export interface CompScoringConfig {
  weights: {
    sameBlockGroup: number; // Weight for same block group match
    sameTract: number; // Weight for same tract match
    sameSubdivision: number; // Weight for same subdivision match
    rentCastCorrelation: number; // Weight for RentCast similarity score
    distance: number; // Weight for proximity (inverse)
  };
  thresholds: {
    maxDistanceMiles: number; // Maximum distance for valid comps
    minCorrelation: number; // Minimum RentCast correlation score
    maxCompCount: number; // Maximum number of comps to return
  };
}

/**
 * Default comp scoring configuration
 */
export const DEFAULT_COMP_CONFIG: CompScoringConfig = {
  weights: {
    sameBlockGroup: 0.3,
    sameTract: 0.15,
    sameSubdivision: 0.25,
    rentCastCorrelation: 0.2,
    distance: 0.1,
  },
  thresholds: {
    maxDistanceMiles: 3,
    minCorrelation: 0.6,
    maxCompCount: 10,
  },
};

/**
 * Subject property with Census geography data
 */
export interface SubjectProperty {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  blockGroupGeoid?: string;
  tractGeoid?: string;
  subdivision?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
}

/**
 * Raw comparable from RentCast valuation API
 */
export interface RawComparable {
  id: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  price: number;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  distance?: number; // Miles from subject
  correlation?: number; // RentCast similarity score (0-1)
  saleDate?: string;
  subdivision?: string;
}

/**
 * Comparable with Census geography data attached
 */
export interface GeocodedComparable extends RawComparable {
  blockGroupGeoid?: string;
  tractGeoid?: string;
}

/**
 * Scored comparable with tier classification
 */
export interface ScoredComparable extends GeocodedComparable {
  score: number; // Overall comp score (0-1)
  tier: CompTier; // Quality classification
  rank: number; // Rank in final selection
  matchDetails: {
    sameBlockGroup: boolean;
    sameTract: boolean;
    sameSubdivision: boolean;
    distanceScore: number;
    correlationScore: number;
  };
}

// ============================================
// Comp Analysis Types
// ============================================

/**
 * Geocoding error for a specific property
 */
export interface GeocodingError {
  id: string;
  error: string;
}

/**
 * Complete comp analysis result
 */
export interface CompAnalysis {
  id: string;
  subjectProperty: SubjectProperty;
  subjectBlockGroupPolygon?: CensusBoundaryFeature;
  subjectTractPolygon?: CensusBoundaryFeature;
  scoredComps: ScoredComparable[];
  analysisDate: Date;
  scoringConfig: CompScoringConfig;
  /** Errors encountered during geocoding - empty if all geocoding succeeded */
  geocodingErrors?: GeocodingError[];
  summary: {
    totalCompsAnalyzed: number;
    excellentCount: number;
    goodCount: number;
    acceptableCount: number;
    marginalCount: number;
    averageScore: number;
    averageDistance: number;
    estimatedARV?: number;
    arvConfidence?: number;
    /** Count of comps that failed geocoding */
    geocodingFailedCount?: number;
  };
}

// ============================================
// Map Visualization Types
// ============================================

/**
 * Marker colors for comp tiers
 */
export const COMP_TIER_COLORS: Record<CompTier, string> = {
  excellent: '#10B981', // Emerald/Green
  good: '#3B82F6', // Blue
  acceptable: '#F59E0B', // Amber/Yellow
  marginal: '#EF4444', // Red
};

/**
 * Boundary layer styling
 */
export const BOUNDARY_STYLES: {
  blockGroup: {
    fillColor: string;
    fillOpacity: number;
    lineColor: string;
    lineWidth: number;
  };
  tract: {
    fillColor: string;
    fillOpacity: number;
    lineColor: string;
    lineWidth: number;
    lineDasharray: number[];
  };
} = {
  blockGroup: {
    fillColor: '#10B981',
    fillOpacity: 0.15,
    lineColor: '#10B981',
    lineWidth: 3,
  },
  tract: {
    fillColor: '#6B7280',
    fillOpacity: 0.1,
    lineColor: '#6B7280',
    lineWidth: 2,
    lineDasharray: [4, 2],
  },
};

// ============================================
// API Request/Response Types
// ============================================

/**
 * Request to geocode coordinates
 */
export interface GeocodeRequest {
  latitude: number;
  longitude: number;
}

/**
 * Request to analyze comps for a property
 */
export interface CompAnalysisRequest {
  subjectPropertyId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  includePolygons?: boolean;
  config?: Partial<CompScoringConfig>;
}

/**
 * Batch geocode request
 */
export interface BatchGeocodeRequest {
  coordinates: Array<{
    id: string;
    latitude: number;
    longitude: number;
  }>;
}

/**
 * Batch geocode response
 */
export interface BatchGeocodeResponse {
  results: Map<string, CensusGeography>;
  errors: Array<{ id: string; error: string }>;
}
