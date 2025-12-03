/**
 * Property Filter Types
 * Defines types for all 21 property filters (6 Standard, 5 Enhanced, 10 Contrarian)
 */

// Filter categories
export type FilterCategory = 'standard' | 'enhanced' | 'contrarian';

// All filter identifiers
export type StandardFilterId = 
  | 'absentee_owner'
  | 'high_equity'
  | 'free_clear'
  | 'tired_landlord'
  | 'out_of_state'
  | 'failed_listing';

export type EnhancedFilterId =
  | 'new_absentee'
  | 'distant_owner'
  | 'multi_property'
  | 'equity_sweet_spot'
  | 'accidental_landlord';

export type ContrarianFilterId =
  | 'almost_sold'
  | 'shrinking_landlord'
  | 'underwater_landlord'
  | 'tax_squeeze'
  | 'quiet_equity'
  | 'negative_momentum'
  | 'fsbo_fatigue'
  | 'life_stage'
  | 'orphan_property'
  | 'competitor_exit';

export type FilterId = StandardFilterId | EnhancedFilterId | ContrarianFilterId;

// Filter parameter configuration
export interface FilterParameter {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'range';
  defaultValue: number | string | boolean | [number, number];
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
}

// Filter configuration with parameters
export interface FilterConfig {
  id: FilterId;
  name: string;
  description: string;
  category: FilterCategory;
  defaultEnabled: boolean;
  parameters?: FilterParameter[];
  // Config map for validation (derived from parameters)
  config?: Record<string, { type: string; min?: number; max?: number }>;
}

// Active filter state
export interface ActiveFilter {
  filterId: FilterId;
  enabled?: boolean;
  params?: Record<string, unknown>;
  weight?: number; // For weighted combination mode
}

// Filter result with match info
export interface FilterMatch {
  filterId: FilterId;
  matched: boolean;
  score: number; // 0-100 confidence score
  reason: string;
  data?: Record<string, unknown>;
}

// Property with filter matches
export interface PropertyWithFilters {
  propertyId: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  estimatedValue?: number;
  rentEstimate?: number;
  ownerName?: string;
  ownerType?: string;
  equityPercent?: number;
  ownershipMonths?: number;
  matchedFilters: FilterMatch[];
  totalScore: number;
  matchCount: number;
}

// Filter function signature
export type FilterFunction = (
  property: PropertyData,
  params: Record<string, unknown>
) => FilterMatch;

// Property data required for filtering
export interface PropertyData {
  id: string;
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  county?: string | null;
  propertyType?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFootage?: number | null;
  yearBuilt?: number | null;
  lotSize?: number | null;
  ownerName?: string | null;
  ownerType?: string | null;
  ownerState?: string | null;
  mailingAddress?: string | null;
  mailingCity?: string | null;
  mailingState?: string | null;
  mailingZip?: string | null;
  ownershipMonths?: number | null;
  isOwnerOccupied?: boolean | null;
  estimatedValue?: number | null;
  mortgageBalance?: number | null;
  equityPercent?: number | null;
  equityAmount?: number | null;
  rentEstimate?: number | null;
  taxAmount?: number | null;
  taxAmountPrior?: number | null;
  listingStatus?: string | null;
  listingDate?: string | null;
  daysOnMarket?: number | null;
  lastSaleDate?: string | null;
  lastSalePrice?: number | null;
  priorSaleDate?: string | null;
  isPrimaryResidence?: boolean | null;
  isRental?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Filter combination mode
export type FilterCombinationMode = 'AND' | 'OR' | 'WEIGHTED';

// Search/Filter request
export interface PropertySearchRequest {
  filters: ActiveFilter[];
  filterMode?: FilterCombinationMode;
  minMatchCount?: number; // For OR mode
  minScore?: number; // For WEIGHTED mode
  location?: {
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
  };
  offset?: number;
  limit?: number;
  sortBy?: 'match_score' | 'value' | 'equity' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Search result item
export interface PropertySearchResultItem {
  property: PropertyData;
  filterResults: {
    matches: FilterMatch[];
    matchedFilters: FilterId[];
    combinedScore: number;
    passesFilter: boolean;
  };
  rank: number;
}

// Search response
export interface PropertySearchResponse {
  results: PropertySearchResultItem[];
  total: number;
  offset: number;
  limit: number;
  executionTimeMs: number;
  appliedFilters: FilterId[];
}

