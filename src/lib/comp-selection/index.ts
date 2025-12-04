/**
 * Comp Selection Module
 * Exports all comp selection related services and utilities
 */

export * from './service';
export * from './scoring';

// Re-export types for convenience
export type {
  SubjectProperty,
  RawComparable,
  GeocodedComparable,
  ScoredComparable,
  CompTier,
  CompScoringConfig,
  CompAnalysis,
  CensusBoundaryFeature,
} from '@/types/comp-selection';

export { DEFAULT_COMP_CONFIG, COMP_TIER_COLORS, BOUNDARY_STYLES } from '@/types/comp-selection';
