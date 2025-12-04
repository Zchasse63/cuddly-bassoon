/**
 * Comp Selection Service
 * Main service that orchestrates Census geocoding, TIGERweb boundaries,
 * and comp scoring into a complete analysis workflow
 */

import {
  SubjectProperty,
  RawComparable,
  GeocodedComparable,
  ScoredComparable,
  CompAnalysis,
  CompScoringConfig,
  DEFAULT_COMP_CONFIG,
  CensusGeography,
  CensusBoundaryFeature,
} from '@/types/comp-selection';
import { getCensusGeography, batchCensusGeocode } from '../census/geocoder';
import { getSubjectBoundaries } from '../census/tigerweb';
import { scoreAndRankComps, createCompAnalysis, calculateWeightedARV } from './scoring';

// ============================================
// Service Configuration
// ============================================

interface CompSelectionOptions {
  config?: Partial<CompScoringConfig>;
  includePolygons?: boolean;
  skipGeocoding?: boolean;
}

// ============================================
// Main Service Functions
// ============================================

/**
 * Analyze comparables for a subject property
 * This is the main entry point for the comp selection workflow
 */
export async function analyzeComps(
  subject: {
    id?: string;
    latitude: number;
    longitude: number;
    address: string;
    subdivision?: string;
    squareFootage?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    blockGroupGeoid?: string;
    tractGeoid?: string;
  },
  rawComps: RawComparable[],
  options: CompSelectionOptions = {}
): Promise<CompAnalysis> {
  const { config: partialConfig, includePolygons = false, skipGeocoding = false } = options;

  // Merge provided config with defaults
  const config: CompScoringConfig = {
    weights: {
      ...DEFAULT_COMP_CONFIG.weights,
      ...partialConfig?.weights,
    },
    thresholds: {
      ...DEFAULT_COMP_CONFIG.thresholds,
      ...partialConfig?.thresholds,
    },
  };

  // Step 1: Geocode subject property if not already done
  const subjectWithGeo: SubjectProperty = {
    id: subject.id || crypto.randomUUID(),
    latitude: subject.latitude,
    longitude: subject.longitude,
    address: subject.address,
    subdivision: subject.subdivision,
    squareFootage: subject.squareFootage,
    bedrooms: subject.bedrooms,
    bathrooms: subject.bathrooms,
    yearBuilt: subject.yearBuilt,
    blockGroupGeoid: subject.blockGroupGeoid,
    tractGeoid: subject.tractGeoid,
  };

  if (!skipGeocoding && (!subject.blockGroupGeoid || !subject.tractGeoid)) {
    const subjectGeo = await getCensusGeography(subject.latitude, subject.longitude);
    if (subjectGeo) {
      subjectWithGeo.blockGroupGeoid = subjectGeo.blockGroupGeoid;
      subjectWithGeo.tractGeoid = subjectGeo.tractGeoid;
    }
  }

  // Step 2: Geocode all comps
  let geocodedComps: GeocodedComparable[];

  if (skipGeocoding) {
    geocodedComps = rawComps as GeocodedComparable[];
  } else {
    geocodedComps = await geocodeComparables(rawComps);
  }

  // Step 3: Score and rank comps
  const scoredComps = scoreAndRankComps(subjectWithGeo, geocodedComps, config);

  // Step 4: Fetch boundary polygons if requested
  let boundaries: {
    blockGroup: CensusBoundaryFeature | null;
    tract: CensusBoundaryFeature | null;
  } = {
    blockGroup: null,
    tract: null,
  };
  if (includePolygons && subjectWithGeo.blockGroupGeoid && subjectWithGeo.tractGeoid) {
    boundaries = await getSubjectBoundaries(
      subjectWithGeo.blockGroupGeoid,
      subjectWithGeo.tractGeoid
    );
  }

  // Step 5: Create and return analysis
  const analysis = createCompAnalysis(subjectWithGeo, scoredComps, config, boundaries);

  // Calculate weighted ARV if we have prices
  const weightedARV = calculateWeightedARV(scoredComps);
  if (weightedARV !== undefined) {
    analysis.summary.estimatedARV = weightedARV;
  }

  return analysis;
}

/**
 * Geocode an array of raw comparables
 */
export async function geocodeComparables(comps: RawComparable[]): Promise<GeocodedComparable[]> {
  // Prepare coordinates for batch geocoding
  const coordinates = comps
    .filter((comp) => comp.latitude && comp.longitude)
    .map((comp) => ({
      id: comp.id,
      lat: comp.latitude,
      lng: comp.longitude,
    }));

  // Batch geocode all comps
  const { results } = await batchCensusGeocode(coordinates);

  // Attach Census data to comps
  return comps.map((comp) => {
    const geo = results.get(comp.id);
    return {
      ...comp,
      blockGroupGeoid: geo?.blockGroupGeoid,
      tractGeoid: geo?.tractGeoid,
    };
  });
}

/**
 * Get Census geography for a single property
 */
export async function getPropertyGeography(
  latitude: number,
  longitude: number
): Promise<CensusGeography | null> {
  return getCensusGeography(latitude, longitude);
}

/**
 * Enrich subject property with Census data
 */
export async function enrichSubjectWithCensus(
  subject: Omit<SubjectProperty, 'blockGroupGeoid' | 'tractGeoid'>
): Promise<SubjectProperty> {
  const geo = await getCensusGeography(subject.latitude, subject.longitude);

  return {
    ...subject,
    blockGroupGeoid: geo?.blockGroupGeoid,
    tractGeoid: geo?.tractGeoid,
  };
}

/**
 * Quick score a single comp against a subject
 * Useful for real-time UI updates
 */
export function quickScoreComp(
  subject: SubjectProperty,
  comp: GeocodedComparable,
  config: CompScoringConfig = DEFAULT_COMP_CONFIG
): ScoredComparable {
  const scored = scoreAndRankComps(subject, [comp], config);
  return (
    scored[0] || {
      ...comp,
      score: 0,
      tier: 'marginal' as const,
      rank: 1,
      matchDetails: {
        sameBlockGroup: false,
        sameTract: false,
        sameSubdivision: false,
        distanceScore: 0,
        correlationScore: comp.correlation ?? 0,
      },
    }
  );
}

/**
 * Re-score existing comps with a new configuration
 * Useful when user adjusts scoring weights
 */
export function rescoreComps(
  subject: SubjectProperty,
  comps: GeocodedComparable[],
  config: CompScoringConfig
): ScoredComparable[] {
  return scoreAndRankComps(subject, comps, config);
}

/**
 * Filter comps by tier
 */
export function filterCompsByTier(
  comps: ScoredComparable[],
  tiers: Array<'excellent' | 'good' | 'acceptable' | 'marginal'>
): ScoredComparable[] {
  return comps.filter((comp) => tiers.includes(comp.tier));
}

/**
 * Get comp tier distribution
 */
export function getCompTierDistribution(
  comps: ScoredComparable[]
): Record<'excellent' | 'good' | 'acceptable' | 'marginal', number> {
  return comps.reduce(
    (acc, comp) => {
      acc[comp.tier]++;
      return acc;
    },
    { excellent: 0, good: 0, acceptable: 0, marginal: 0 }
  );
}

/**
 * Get comps within a specific block group
 */
export function getCompsInBlockGroup(
  comps: ScoredComparable[],
  blockGroupGeoid: string
): ScoredComparable[] {
  return comps.filter((comp) => comp.blockGroupGeoid === blockGroupGeoid);
}

/**
 * Get comps within a specific census tract
 */
export function getCompsInTract(comps: ScoredComparable[], tractGeoid: string): ScoredComparable[] {
  return comps.filter((comp) => comp.tractGeoid === tractGeoid);
}
