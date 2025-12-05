/**
 * Seller Motivation Scoring System Types
 *
 * This module defines the type system for the stratified seller motivation
 * scoring engine, which uses different scoring models based on owner type.
 */

// ============================================================================
// Owner Classification Types
// ============================================================================

/**
 * Primary owner classification categories
 */
export type OwnerPrimaryClass =
  | 'individual'           // Owner-occupied or absentee individual
  | 'investor_entity'      // LLC, Corp, small investor, portfolio investor
  | 'institutional_distressed'; // Bank REO, government, tax lien

/**
 * Sub-classifications for individual owners
 */
export type IndividualSubClass =
  | 'owner_occupied'       // Lives in the property
  | 'absentee'             // Owns but lives elsewhere
  | 'inherited'            // Recent inheritance indicator
  | 'out_of_state'         // Lives in different state
  | 'unknown';

/**
 * Sub-classifications for investor/entity owners
 */
export type InvestorSubClass =
  | 'small_investor'       // 1-4 properties
  | 'portfolio_investor'   // 5+ properties
  | 'llc_single'           // Single-property LLC
  | 'llc_multi'            // Multi-property LLC
  | 'corporate'            // Corporation
  | 'trust_living'         // Living/revocable trust
  | 'trust_irrevocable'    // Irrevocable trust
  | 'unknown';

/**
 * Sub-classifications for institutional/distressed owners
 */
export type InstitutionalSubClass =
  | 'bank_reo'             // Bank-owned REO
  | 'government_federal'   // Federal agency (HUD, VA, etc.)
  | 'government_state'     // State agency
  | 'government_local'     // County/city
  | 'tax_lien'             // Tax lien holder
  | 'estate_probate'       // Estate in probate
  | 'estate_executor'      // Executor sale
  | 'unknown';

/**
 * Combined sub-class type
 */
export type OwnerSubClass = IndividualSubClass | InvestorSubClass | InstitutionalSubClass;

/**
 * Owner classification result
 */
export interface OwnerClassification {
  primaryClass: OwnerPrimaryClass;
  subClass: OwnerSubClass;
  confidence: number;          // 0-1 confidence in classification
  matchedPatterns: string[];   // Which patterns matched
  rawOwnerName?: string;       // Original owner name
}

// ============================================================================
// Signal Types
// ============================================================================

/**
 * Raw signals from various data sources before normalization
 */
export interface RawPropertySignals {
  // Ownership signals
  ownerName?: string;
  ownerType?: string;           // From RentCast: Individual, Company, Bank, Trust, etc.
  ownerOccupied?: boolean;
  ownerMailingAddress?: string;
  ownerMailingCity?: string;
  ownerMailingState?: string;
  ownerMailingZip?: string;

  // Duration signals
  lastSaleDate?: string;
  lastSalePrice?: number;

  // Equity signals
  estimatedValue?: number;      // Current value
  mortgageBalance?: number;     // Known loan balance
  assessedValue?: number;       // Tax assessed value

  // Property signals
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lotSize?: number;

  // Market signals
  daysOnMarket?: number;
  saleToListRatio?: number;
  inventory?: number;
  medianPrice?: number;
  priceChangeYoY?: number;

  // Permit/condition signals
  recentPermits?: Array<{
    type: string;
    status: 'active' | 'final' | 'inactive' | 'in_review';
    filedDate?: string;
    tags?: string[];
  }>;

  // Distress signals
  preForeclosure?: boolean;
  taxDelinquent?: boolean;
  vacantIndicator?: boolean;
  codeLiens?: number;

  // Census/demographic signals
  neighborhoodMedianIncome?: number;
  neighborhoodMedianAge?: number;
  ownershipRateInArea?: number;
}

/**
 * Normalized signals after transformation (0-100 scale)
 */
export interface NormalizedSignals {
  // Core motivation signals (0-100, higher = more motivated)
  equityScore: number;           // Based on equity position
  durationScore: number;         // Based on ownership duration
  marketPressureScore: number;   // Based on market conditions
  conditionScore: number;        // Based on property condition/permits
  distressScore: number;         // Based on distress indicators

  // Signal metadata
  signalsAvailable: number;      // Count of signals with data
  signalsMissing: string[];      // Which signals are missing
}

// ============================================================================
// Scoring Model Types
// ============================================================================

/**
 * Scoring factor with weight and contribution
 */
export interface ScoringFactor {
  name: string;
  weight: number;                // 0-1, weights should sum to 1
  rawValue: number | string | boolean | null;
  normalizedScore: number;       // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  dataSource: 'rentcast' | 'shovels' | 'census' | 'supabase' | 'derived';
}

/**
 * Scoring model configuration
 */
export interface ScoringModelConfig {
  modelId: string;
  modelName: string;
  description: string;
  ownerClasses: OwnerPrimaryClass[];  // Which owner types this model applies to

  // Signal weight configuration
  weights: {
    equity: number;
    duration: number;
    marketPressure: number;
    condition: number;
    distress: number;
  };

  // Model-specific scoring rules
  scoringRules: ScoringRules;
}

/**
 * Rules for normalizing signals differently per model
 */
export interface ScoringRules {
  // Duration scoring (inverted for investors)
  duration: {
    shortTermThresholdYears: number;  // Below this = short term
    longTermThresholdYears: number;   // Above this = long term
    shortTermScore: number;           // Score for short term owners
    longTermScore: number;            // Score for long term owners
    invertForInvestor: boolean;       // If true, long term = LOW motivation
  };

  // Equity scoring (inverted for investors)
  equity: {
    lowEquityPercent: number;         // Below this = low equity
    highEquityPercent: number;        // Above this = high equity
    lowEquityScore: number;
    highEquityScore: number;
    invertForInvestor: boolean;       // If true, high equity = LOW motivation
  };

  // Market pressure scoring
  market: {
    hotMarketDom: number;             // Below this = hot
    coldMarketDom: number;            // Above this = cold
    hotMarketScore: number;
    coldMarketScore: number;
  };

  // Special adjustments
  adjustments: {
    trustBonusPoints: number;         // Extra points for trust/estate
    reoDiscountPoints: number;        // Discount for REO (slow process)
    distressMultiplier: number;       // Multiplier for distress signals
  };
}

// ============================================================================
// Output Types
// ============================================================================

/**
 * Standard motivation score output (rules-based)
 */
export interface StandardMotivationScore {
  score: number;                      // 0-100
  confidence: number;                 // 0-1
  modelUsed: string;                  // Which scoring model was applied
  ownerClassification: OwnerClassification;
  factors: ScoringFactor[];
  recommendation: string;
  riskFactors: string[];
}

/**
 * DealFlow IQ™ score output (AI-enhanced)
 */
export interface DealFlowIQScore {
  iqScore: number;                    // 0-100
  standardScore: number;              // Base score for comparison
  confidence: number;                 // 0-1

  // AI enhancements
  aiAdjustments: Array<{
    factor: string;
    adjustment: number;               // Points added/subtracted
    reasoning: string;
  }>;

  // Market intelligence
  marketContext: {
    seasonalAdjustment: number;
    similarPropertyOutcomes: number;  // % of similar properties that sold
    competitorActivity: number;       // Level of investor activity (0-100)
  };

  // Predictions
  predictions: {
    timeToDecision: string;           // "2-4 weeks", "1-2 months", etc.
    bestApproachTiming: string;       // "Now", "Wait 30 days", etc.
    optimalOfferRange: { min: number; max: number };
  };

  // Full breakdown
  ownerClassification: OwnerClassification;
  factors: ScoringFactor[];
}

// ============================================================================
// A/B Testing Types
// ============================================================================

/**
 * Experiment configuration
 */
export interface ExperimentConfig {
  experimentId: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';

  // Traffic allocation
  controlPercentage: number;          // % of traffic to control (0-100)

  // Variants
  controlConfig: ScoringModelConfig;
  treatmentConfig: ScoringModelConfig;

  // Metrics
  primaryMetric: 'conversion_rate' | 'avg_score_accuracy' | 'time_to_contact';
  secondaryMetrics: string[];

  // Timeline
  startDate: string;
  endDate?: string;
  minSampleSize: number;
}

/**
 * Experiment assignment for a property
 */
export interface ExperimentAssignment {
  experimentId: string;
  variant: 'control' | 'treatment';
  assignedAt: string;
  propertyId: string;
}

/**
 * Experiment outcome tracking
 */
export interface ExperimentOutcome {
  experimentId: string;
  propertyId: string;
  variant: 'control' | 'treatment';

  // Scores
  scoreAtAssignment: number;

  // Outcomes
  contacted: boolean;
  contactedAt?: string;
  responded: boolean;
  respondedAt?: string;
  dealCreated: boolean;
  dealId?: string;
  dealClosed: boolean;
  dealProfit?: number;
}

// ============================================================================
// Database Schema Types (for Supabase)
// ============================================================================

/**
 * Owner classification record for caching
 */
export interface OwnerClassificationRecord {
  id: string;
  property_id: string;
  owner_name: string;
  primary_class: OwnerPrimaryClass;
  sub_class: OwnerSubClass;
  confidence: number;
  matched_patterns: string[];
  classified_at: string;
  expires_at: string;
}

/**
 * Motivation score record for history/analytics
 */
export interface MotivationScoreRecord {
  id: string;
  property_id: string;
  score_type: 'standard' | 'dealflow_iq';
  score: number;
  confidence: number;
  model_used: string;
  owner_classification_id: string;
  factors: ScoringFactor[];
  created_by?: string;
  created_at: string;
}

/**
 * Property signal cache record
 */
export interface PropertySignalRecord {
  id: string;
  property_id: string;
  signal_source: 'rentcast' | 'shovels' | 'census' | 'supabase';
  signal_data: RawPropertySignals;
  fetched_at: string;
  expires_at: string;
}
