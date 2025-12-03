/**
 * Buyer Intelligence Types
 * Types for buyer management, preferences, and matching
 */

export type BuyerType = 'flipper' | 'landlord' | 'wholesaler' | 'developer' | 'other';
export type BuyerStatus = 'active' | 'inactive' | 'qualified' | 'unqualified';
export type BuyerTier = 'A' | 'B' | 'C';
export type ConditionTolerance = 'turnkey' | 'light_rehab' | 'moderate_rehab' | 'heavy_rehab' | 'gut';
export type TransactionType = 'purchase' | 'sale';

// Qualification stages
export type QualificationStage = 
  | 'new'           // Unverified
  | 'contacted'     // Initial conversation
  | 'pof_received'  // Proof of funds received
  | 'verified'      // Ready to transact
  | 'qualified';    // Completed transaction

export interface Buyer {
  id: string;
  user_id: string;
  name: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  buyer_type?: BuyerType | null;
  status?: BuyerStatus | null;
  tier?: BuyerTier | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BuyerPreferences {
  id: string;
  buyer_id: string;
  property_types?: string[] | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  bedroom_min?: number | null;
  bedroom_max?: number | null;
  markets?: Array<{ zip?: string; city?: string; state?: string }> | null;
  condition_tolerance?: ConditionTolerance | null;
  max_rehab_budget?: number | null;
  preferred_roi_percent?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BuyerTransaction {
  id: string;
  buyer_id: string;
  property_address?: string | null;
  purchase_price?: number | null;
  sale_price?: number | null;
  purchase_date?: string | null;
  sale_date?: string | null;
  transaction_type?: TransactionType | null;
  data_source?: string | null;
  created_at?: string | null;
}

// Extended buyer with preferences and transactions
export interface BuyerWithDetails extends Buyer {
  preferences?: BuyerPreferences | null;
  transactions?: BuyerTransaction[];
  score?: number;
  transactionCount?: number;
}

// Input types for CRUD operations
export interface CreateBuyerInput {
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  buyer_type?: BuyerType;
  status?: BuyerStatus;
  notes?: string;
}

export interface UpdateBuyerInput {
  name?: string;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  buyer_type?: BuyerType | null;
  status?: BuyerStatus | null;
  tier?: BuyerTier | null;
  notes?: string | null;
}

export interface CreatePreferencesInput {
  property_types?: string[];
  price_range_min?: number;
  price_range_max?: number;
  bedroom_min?: number;
  bedroom_max?: number;
  markets?: Array<{ zip?: string; city?: string; state?: string }>;
  condition_tolerance?: ConditionTolerance;
  max_rehab_budget?: number;
  preferred_roi_percent?: number;
}

export interface BuyerListFilters {
  status?: BuyerStatus;
  type?: BuyerType;
  tier?: BuyerTier;
  search?: string;
}

// Scoring factors
export interface BuyerScoreFactors {
  transactionVolume: number;    // 25%
  transactionRecency: number;   // 20%
  responseRate: number;         // 15%
  closingRate: number;          // 20%
  proofOfFunds: number;         // 10%
  profileComplete: number;      // 10%
}

// Match factor from matching engine
export interface MatchFactor {
  factor: string;
  score: number;
  maxScore: number;
  reason: string;
}

// Match result
export interface BuyerMatchResult {
  buyer: BuyerWithDetails;
  matchScore: number;
  matchReasons?: string[];
  matchFactors: MatchFactor[];
}

