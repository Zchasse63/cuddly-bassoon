/**
 * Property Search Query Builder
 * Builds and executes property searches with filter combinations
 */

import type {
  PropertyData,
  FilterMatch,
  ActiveFilter,
  FilterId,
  PropertySearchRequest,
  PropertySearchResponse,
  FilterCombinationMode,
} from './types';
import { getFilterById, ALL_FILTERS } from './registry';
import { getCachedOrCompute, filterCache } from './cache';

// Import all filter functions
// Standard filters
import { applyAbsenteeOwnerFilter } from './standard/absentee-owner';
import { applyHighEquityFilter } from './standard/high-equity';
import { applyFreeClearFilter } from './standard/free-clear';
import { applyTiredLandlordFilter } from './standard/tired-landlord';
import { applyOutOfStateFilter } from './standard/out-of-state';
import { applyFailedListingFilter } from './standard/failed-listing';
// Enhanced filters
import { applyNewAbsenteeFilter } from './enhanced/new-absentee';
import { applyDistantOwnerFilter } from './enhanced/distant-owner';
import { applyMultiPropertyFilter } from './enhanced/multi-property';
import { applyEquitySweetSpotFilter } from './enhanced/equity-sweet-spot';
import { applyAccidentalLandlordFilter } from './enhanced/accidental-landlord';
// Contrarian filters
import { applyAlmostSoldFilter } from './contrarian/almost-sold';
import { applyShrinkingLandlordFilter } from './contrarian/shrinking-landlord';
import { applyUnderwaterLandlordFilter } from './contrarian/underwater-landlord';
import { applyTaxSqueezeFilter } from './contrarian/tax-squeeze';
import { applyQuietEquityFilter } from './contrarian/quiet-equity';
import { applyNegativeMomentumFilter } from './contrarian/negative-momentum';
import { applyFSBOFatigueFilter } from './contrarian/fsbo-fatigue';
import { applyLifeStageFilter } from './contrarian/life-stage';
import { applyOrphanPropertyFilter } from './contrarian/orphan-property';
import { applyCompetitorExitFilter } from './contrarian/competitor-exit';
// Shovels filters
import { applyStalledPermitFilter, applyFailedInspectionFilter, applyExpiredPermitFilter } from './shovels';
// Combined filters
import { applyOverImprovedFilter, applySunkCostFilter, applyDeferredMaintenanceFilter, applyFallingBehindFilter, applyMajorSystemDueFilter } from './combined';
// Home services filters
import { applyAgingRoofFilter, applyStormDamageFilter, applyNoReroofHistoryFilter, applyHvacReplacementDueFilter, applyHeatPumpCandidateFilter, applyNoHvacHistoryFilter, applyPanelUpgradeCandidateFilter, applyEvChargerReadyFilter, applyNoElectricalUpgradesFilter, applyRepipingCandidateFilter, applyWaterHeaterDueFilter, applyNoPlumbingPermitsFilter, applySolarReadyFilter, applyBatteryUpgradeFilter, applyHighConsumptionAreaFilter } from './home-services';

/**
 * Filter function type
 */
type FilterFunction = (property: PropertyData, params: Record<string, unknown>) => FilterMatch;

/**
 * Map of filter IDs to their implementation functions
 */
const FILTER_FUNCTIONS: Record<FilterId, FilterFunction> = {
  // Standard
  absentee_owner: applyAbsenteeOwnerFilter,
  high_equity: applyHighEquityFilter,
  free_clear: applyFreeClearFilter,
  tired_landlord: applyTiredLandlordFilter,
  out_of_state: applyOutOfStateFilter,
  failed_listing: applyFailedListingFilter,
  // Enhanced
  new_absentee: applyNewAbsenteeFilter,
  distant_owner: applyDistantOwnerFilter,
  multi_property: applyMultiPropertyFilter as FilterFunction,
  equity_sweet_spot: applyEquitySweetSpotFilter,
  accidental_landlord: applyAccidentalLandlordFilter as FilterFunction,
  // Contrarian
  almost_sold: applyAlmostSoldFilter as FilterFunction,
  shrinking_landlord: applyShrinkingLandlordFilter as FilterFunction,
  underwater_landlord: applyUnderwaterLandlordFilter as FilterFunction,
  tax_squeeze: applyTaxSqueezeFilter as FilterFunction,
  quiet_equity: applyQuietEquityFilter as FilterFunction,
  negative_momentum: applyNegativeMomentumFilter as FilterFunction,
  fsbo_fatigue: applyFSBOFatigueFilter as FilterFunction,
  life_stage: applyLifeStageFilter as FilterFunction,
  orphan_property: applyOrphanPropertyFilter as FilterFunction,
  competitor_exit: applyCompetitorExitFilter as FilterFunction,
  // Shovels
  stalled_permit: applyStalledPermitFilter as FilterFunction,
  failed_inspection: applyFailedInspectionFilter as FilterFunction,
  expired_permit: applyExpiredPermitFilter as FilterFunction,
  // Combined
  over_improved: applyOverImprovedFilter as FilterFunction,
  sunk_cost: applySunkCostFilter as FilterFunction,
  deferred_maintenance: applyDeferredMaintenanceFilter as FilterFunction,
  falling_behind: applyFallingBehindFilter as FilterFunction,
  major_system_due: applyMajorSystemDueFilter as FilterFunction,
  // Home Services - Roofing
  aging_roof: applyAgingRoofFilter as FilterFunction,
  storm_damage: applyStormDamageFilter as FilterFunction,
  no_reroof_history: applyNoReroofHistoryFilter as FilterFunction,
  // Home Services - HVAC
  hvac_replacement_due: applyHvacReplacementDueFilter as FilterFunction,
  heat_pump_candidate: applyHeatPumpCandidateFilter as FilterFunction,
  no_hvac_history: applyNoHvacHistoryFilter as FilterFunction,
  // Home Services - Electrical
  panel_upgrade_candidate: applyPanelUpgradeCandidateFilter as FilterFunction,
  ev_charger_ready: applyEvChargerReadyFilter as FilterFunction,
  no_electrical_upgrades: applyNoElectricalUpgradesFilter as FilterFunction,
  // Home Services - Plumbing
  repiping_candidate: applyRepipingCandidateFilter as FilterFunction,
  water_heater_due: applyWaterHeaterDueFilter as FilterFunction,
  no_plumbing_permits: applyNoPlumbingPermitsFilter as FilterFunction,
  // Home Services - Solar
  solar_ready: applySolarReadyFilter as FilterFunction,
  battery_upgrade: applyBatteryUpgradeFilter as FilterFunction,
  high_consumption_area: applyHighConsumptionAreaFilter as FilterFunction,
};

/**
 * Apply a single filter to a property (with caching)
 */
export function applyFilter(
  property: PropertyData,
  filter: ActiveFilter,
  useCache = true
): FilterMatch {
  const filterFn = FILTER_FUNCTIONS[filter.filterId];

  if (!filterFn) {
    return {
      filterId: filter.filterId,
      matched: false,
      score: 0,
      reason: `Unknown filter: ${filter.filterId}`,
    };
  }

  if (useCache) {
    return getCachedOrCompute(property, filter, () =>
      filterFn(property, filter.params || {})
    );
  }

  return filterFn(property, filter.params || {});
}

/**
 * Clear the filter cache
 */
export function clearFilterCache(): void {
  filterCache.clear();
}

/**
 * Get cache statistics
 */
export function getFilterCacheStats() {
  return filterCache.getStats();
}

/**
 * Apply multiple filters to a property
 */
export function applyFilters(
  property: PropertyData,
  filters: ActiveFilter[]
): FilterMatch[] {
  return filters.map((filter) => applyFilter(property, filter));
}

export interface FilterCombinationOptions {
  mode: FilterCombinationMode;
  minMatchCount?: number; // For OR mode: minimum filters that must match
  minScore?: number; // Minimum combined score to include
}

/**
 * Combined filter result for a property
 */
export interface CombinedFilterResult {
  property: PropertyData;
  matches: FilterMatch[];
  matchedFilters: FilterId[];
  combinedScore: number;
  passesFilter: boolean;
}

/**
 * Apply filters with combination logic
 */
export function applyFiltersWithCombination(
  property: PropertyData,
  filters: ActiveFilter[],
  options: FilterCombinationOptions = { mode: 'AND' }
): CombinedFilterResult {
  const matches = applyFilters(property, filters);
  const matchedFilters = matches
    .filter((m) => m.matched)
    .map((m) => m.filterId);

  let combinedScore = 0;
  let passesFilter = false;

  switch (options.mode) {
    case 'AND':
      // All filters must match
      passesFilter = matches.every((m) => m.matched);
      if (passesFilter) {
        combinedScore = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;
      }
      break;

    case 'OR':
      // At least minMatchCount filters must match
      const minCount = options.minMatchCount ?? 1;
      passesFilter = matchedFilters.length >= minCount;
      if (passesFilter) {
        const matchedScores = matches.filter((m) => m.matched).map((m) => m.score);
        combinedScore = matchedScores.reduce((sum, s) => sum + s, 0) / matchedScores.length;
      }
      break;

    case 'WEIGHTED':
      // Calculate weighted score based on filter weights
      let totalWeight = 0;
      let weightedSum = 0;
      
      for (const filter of filters) {
        const match = matches.find((m) => m.filterId === filter.filterId);
        const weight = filter.weight ?? 1;
        totalWeight += weight;
        
        if (match?.matched) {
          weightedSum += match.score * weight;
        }
      }
      
      combinedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      passesFilter = combinedScore >= (options.minScore ?? 50);
      break;
  }

  return {
    property,
    matches,
    matchedFilters,
    combinedScore,
    passesFilter,
  };
}

/**
 * Search result with filter matches
 */
export interface PropertySearchResult {
  property: PropertyData;
  filterResults: CombinedFilterResult;
  rank: number;
}

/**
 * Execute a property search with filters
 */
export async function executePropertySearch(
  properties: PropertyData[],
  request: PropertySearchRequest
): Promise<PropertySearchResponse> {
  const startTime = Date.now();

  // Apply filters to all properties
  const results: PropertySearchResult[] = [];

  for (const property of properties) {
    const filterResults = applyFiltersWithCombination(
      property,
      request.filters,
      {
        mode: request.filterMode || 'AND',
        minMatchCount: request.minMatchCount,
        minScore: request.minScore,
      }
    );

    if (filterResults.passesFilter) {
      results.push({
        property,
        filterResults,
        rank: 0, // Will be set after sorting
      });
    }
  }

  // Sort by combined score (descending)
  results.sort((a, b) => b.filterResults.combinedScore - a.filterResults.combinedScore);

  // Assign ranks
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  // Apply pagination
  const offset = request.offset ?? 0;
  const limit = request.limit ?? 50;
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: results.length,
    offset,
    limit,
    executionTimeMs: Date.now() - startTime,
    appliedFilters: request.filters.map((f) => f.filterId),
  };
}

/**
 * Get filter suggestions based on property data availability
 */
export function getApplicableFilters(property: PropertyData): FilterId[] {
  const applicable: FilterId[] = [];

  // Check which filters can be applied based on available data
  for (const filter of ALL_FILTERS) {
    const result = applyFilter(property, { filterId: filter.id });

    // If the filter returned a meaningful result (not "data not available")
    if (!result.reason.toLowerCase().includes('not available') &&
        !result.reason.toLowerCase().includes('unable to determine')) {
      applicable.push(filter.id);
    }
  }

  return applicable;
}

/**
 * Validate filter configuration
 */
export function validateFilterConfig(filters: ActiveFilter[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const filter of filters) {
    const filterDef = getFilterById(filter.filterId);

    if (!filterDef) {
      errors.push(`Unknown filter ID: ${filter.filterId}`);
      continue;
    }

    // Validate params against filter config
    if (filter.params && filterDef.config) {
      for (const [key, value] of Object.entries(filter.params)) {
        const configField = filterDef.config[key];

        if (!configField) {
          errors.push(`Unknown parameter "${key}" for filter "${filter.filterId}"`);
          continue;
        }

        // Type validation
        if (configField.type === 'number' && typeof value !== 'number') {
          errors.push(`Parameter "${key}" for filter "${filter.filterId}" must be a number`);
        }

        // Range validation
        if (typeof value === 'number') {
          if (configField.min !== undefined && value < configField.min) {
            errors.push(`Parameter "${key}" for filter "${filter.filterId}" must be >= ${configField.min}`);
          }
          if (configField.max !== undefined && value > configField.max) {
            errors.push(`Parameter "${key}" for filter "${filter.filterId}" must be <= ${configField.max}`);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

