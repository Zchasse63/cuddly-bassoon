/**
 * Seller Motivation Scoring System
 *
 * A stratified scoring system that uses different models based on owner type:
 * - Individual owners: Long ownership = HIGH motivation (life transition)
 * - Investor/Entity: Long ownership = LOW motivation (stable investment)
 * - Institutional: Process-focused scoring (bureaucratic factors)
 *
 * Features:
 * - Owner classification with entity pattern matching
 * - Inverted signal interpretation per owner type
 * - Standard Score (rules-based)
 * - DealFlow IQ™ Score (AI-enhanced)
 * - Multi-source signal aggregation (RentCast, Shovels, Supabase)
 *
 * Usage:
 * ```typescript
 * import { calculateSellerMotivation, quickScore } from '@/lib/seller-motivation';
 *
 * // Full calculation with all details
 * const result = await calculateSellerMotivation({
 *   address: '123 Main St, Phoenix, AZ 85001',
 *   scoreType: 'both', // Get both standard and DealFlow IQ
 * });
 *
 * console.log(result.standardScore.score); // 0-100
 * console.log(result.dealFlowIQ?.iqScore); // 0-100 (AI-enhanced)
 * console.log(result.classification.primaryClass); // 'individual' | 'investor_entity' | 'institutional_distressed'
 *
 * // Quick score for simpler use cases
 * const quick = await quickScore({ address: '123 Main St' });
 * console.log(quick.score, quick.recommendation);
 * ```
 */

// Main scoring functions
export {
  calculateSellerMotivation,
  batchCalculateMotivation,
  quickScore,
  type ScoringOptions,
  type ScoringResult,
} from './scoring-engine';

// Owner classification
export {
  classifyOwner,
  isLikelyEntity,
  getMatchingPatterns,
  entityPatterns,
} from './owner-classifier';

// Scoring models
export {
  calculateMotivationScore,
  getModelForOwnerClass,
  scoringModels,
  individualOwnerModel,
  investorOwnerModel,
  institutionalOwnerModel,
} from './scoring-models';

// Signal fetching
export {
  fetchPropertySignals,
  getCachedSignals,
  cacheSignals,
  type SignalFetchOptions,
  type SignalFetchResult,
} from './signal-fetcher';

// Types
export type {
  // Owner classification
  OwnerPrimaryClass,
  OwnerSubClass,
  IndividualSubClass,
  InvestorSubClass,
  InstitutionalSubClass,
  OwnerClassification,

  // Signals
  RawPropertySignals,
  NormalizedSignals,

  // Scoring
  ScoringFactor,
  ScoringModelConfig,
  ScoringRules,
  StandardMotivationScore,
  DealFlowIQScore,

  // A/B Testing
  ExperimentConfig,
  ExperimentAssignment,
  ExperimentOutcome,

  // Database
  OwnerClassificationRecord,
  MotivationScoreRecord,
  PropertySignalRecord,
} from './types';
