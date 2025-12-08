/**
 * Property Filter Types
 * Defines types for all property filters including Shovels-based and home services filters
 */

// Filter categories
export type FilterCategory =
  | 'standard'
  | 'enhanced'
  | 'contrarian'
  | 'shovels'
  | 'combined'
  | 'home-services';

// Data source for filters
export type FilterDataSource = 'rentcast' | 'shovels' | 'combined';

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

// Shovels-only filter IDs (permit-based)
export type ShovelsFilterId =
  | 'stalled_permit'
  | 'failed_inspection'
  | 'expired_permit';

// Combined filter IDs (RentCast + Shovels)
export type CombinedFilterId =
  | 'over_improved'
  | 'sunk_cost'
  | 'deferred_maintenance'
  | 'falling_behind'
  | 'major_system_due';

// Home services filter IDs
export type RoofingFilterId =
  | 'aging_roof'
  | 'storm_damage'
  | 'no_reroof_history';

export type HvacFilterId =
  | 'hvac_replacement_due'
  | 'heat_pump_candidate'
  | 'no_hvac_history';

export type ElectricalFilterId =
  | 'panel_upgrade_candidate'
  | 'ev_charger_ready'
  | 'no_electrical_upgrades';

export type PlumbingFilterId =
  | 'repiping_candidate'
  | 'water_heater_due'
  | 'no_plumbing_permits';

export type SolarFilterId =
  | 'solar_ready'
  | 'battery_upgrade'
  | 'high_consumption_area';

export type HomeServicesFilterId =
  | RoofingFilterId
  | HvacFilterId
  | ElectricalFilterId
  | PlumbingFilterId
  | SolarFilterId;

export type FilterId =
  | StandardFilterId
  | EnhancedFilterId
  | ContrarianFilterId
  | ShovelsFilterId
  | CombinedFilterId
  | HomeServicesFilterId;

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

  // Additional property fields from database
  arv?: number | null;
  askingPrice?: number | null;
  condition?: string | null;
  isListed?: boolean | null;
  subdivision?: string | null;

  // Distress indicators
  isPreForeclosure?: boolean | null;
  preForeclosureDate?: string | null;
  isTaxDelinquent?: boolean | null;
  taxDelinquentAmount?: number | null;

  // Shovels-specific fields (from shovels_address_metrics join)
  shovelsAddressId?: string | null;
  totalPermits?: number | null;
  activePermits?: number | null;
  completedPermits?: number | null;
  expiredPermits?: number | null;
  totalJobValue?: number | null;
  avgJobValue?: number | null;
  permitsLast12Months?: number | null;
  permitsPrior12Months?: number | null;
  yoyPermitGrowth?: number | null;
  avgInspectionPassRate?: number | null;
  lastPermitDate?: string | null;
  firstPermitDate?: string | null;
  hasStalledPermit?: boolean | null;
  hasExpiredPermit?: boolean | null;
  lastRoofingDate?: string | null;
  lastHvacDate?: string | null;
  lastWaterHeaterDate?: string | null;
  lastElectricalDate?: string | null;
  lastPlumbingDate?: string | null;
  lastSolarDate?: string | null;
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

