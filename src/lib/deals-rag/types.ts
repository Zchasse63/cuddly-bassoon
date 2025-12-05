/**
 * Historical Deals RAG Types
 * Type definitions for the deal outcome prediction system
 */

export type DealType = 'wholesale' | 'fix_flip' | 'brrrr' | 'subject_to' | 'owner_finance' | 'other';
export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'mobile' | 'land' | 'other';
export type SellerType = 'individual' | 'bank_reo' | 'trust' | 'estate' | 'corporate' | 'government' | 'other';
export type DealOutcome = 'success' | 'failed_financing' | 'failed_inspection' | 'seller_backed_out' | 'buyer_backed_out' | 'title_issues' | 'other_failure';
export type MarketCondition = 'hot' | 'warm' | 'neutral' | 'cooling' | 'cold';

/**
 * Historical deal record
 */
export interface HistoricalDeal {
  id: string;
  externalId?: string;

  // Property details
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  lotSize?: number;

  // Deal financials
  purchasePrice: number;
  arv?: number;
  repairCost?: number;
  salePrice?: number;
  assignmentFee?: number;
  holdingCost?: number;
  closingCost?: number;
  profit?: number;
  roi?: number;

  // Deal characteristics
  dealType?: DealType;
  acquisitionSource?: string;
  exitStrategy?: string;

  // Seller information
  sellerType?: SellerType;
  sellerMotivationScore?: number;
  wasAbsenteeOwner?: boolean;
  ownershipDurationMonths?: number;

  // Timeline
  contractDate?: Date;
  closeDate?: Date;
  daysToClose?: number;

  // Market conditions
  marketDomAtDeal?: number;
  marketSaleToListRatio?: number;
  marketInventoryAtDeal?: number;

  // Outcome
  outcome?: DealOutcome;
  outcomeNotes?: string;
  lessonsLearned?: string;

  // Metadata
  dataSource?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Search result from semantic search
 */
export interface DealSearchResult {
  dealId: string;
  address: string;
  city?: string;
  state?: string;
  dealType?: DealType;
  purchasePrice: number;
  arv?: number;
  profit?: number;
  roi?: number;
  outcome?: DealOutcome;
  daysToClose?: number;
  sellerType?: SellerType;
  lessonsLearned?: string;
  similarity: number;
}

/**
 * Similar deal result from attribute matching
 */
export interface SimilarDealResult extends DealSearchResult {
  relevanceScore: number;
}

/**
 * Deal outcome pattern aggregate
 */
export interface DealOutcomePattern {
  patternKey: string;
  city?: string;
  state?: string;
  dealType?: DealType;
  sellerType?: SellerType;
  marketCondition?: MarketCondition;

  // Aggregated stats
  totalDeals: number;
  successfulDeals: number;
  successRate: number;
  avgProfit?: number;
  avgRoi?: number;
  avgDaysToClose?: number;
  avgDiscountFromArv?: number;
  failureRate: number;
  mostCommonFailureReason?: string;
  sampleSize: number;
}

/**
 * Options for semantic search
 */
export interface DealSearchOptions {
  limit?: number;
  similarityThreshold?: number;
  filterDealType?: DealType;
  filterOutcome?: DealOutcome;
  filterState?: string;
}

/**
 * Options for similar deal search
 */
export interface SimilarDealOptions {
  city?: string;
  state?: string;
  dealType?: DealType;
  sellerType?: SellerType;
  priceMin?: number;
  priceMax?: number;
  limit?: number;
}

/**
 * Context for deal predictions using RAG
 */
export interface DealPredictionContext {
  similarDeals: DealSearchResult[];
  outcomePattern?: DealOutcomePattern;
  predictedSuccessRate: number;
  predictedDaysToClose: number;
  predictedProfit?: number;
  riskFactors: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * Ingestion result for historical deals
 */
export interface DealIngestionResult {
  success: boolean;
  dealsProcessed: number;
  embeddingsGenerated: number;
  patternsCalculated: number;
  errors: Array<{ dealId?: string; error: string }>;
  duration: number;
}
