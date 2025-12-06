/**
 * Smart Filter Suggestions Hook
 *
 * Analyzes active filters and suggests complementary filters
 * based on common real estate investment patterns
 */

import { useMemo } from 'react';
import type { ActiveFilter, FilterId } from '@/lib/filters/types';
import {
  STANDARD_FILTERS,
  ENHANCED_FILTERS,
  CONTRARIAN_FILTERS,
  SHOVELS_FILTERS,
  COMBINED_FILTERS,
} from '@/lib/filters/registry';

export interface FilterSuggestion {
  filterId: FilterId;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

// Suggestion rules based on common investment strategies
// Uses valid FilterId values from src/lib/filters/types.ts
const SUGGESTION_RULES: Record<FilterId, FilterSuggestion[]> = {
  // Equity-based strategies
  high_equity: [
    {
      filterId: 'tired_landlord',
      reason: 'High equity owners tired of managing often sell quickly',
      confidence: 'high',
    },
    {
      filterId: 'absentee_owner',
      reason: 'Absentee owners with equity may be ready to exit',
      confidence: 'high',
    },
    {
      filterId: 'out_of_state',
      reason: 'Out-of-state owners with equity are motivated sellers',
      confidence: 'medium',
    },
  ],

  // Tired landlord strategies
  tired_landlord: [
    {
      filterId: 'high_equity',
      reason: 'Tired landlords with equity have negotiating room',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Tired landlords often defer maintenance',
      confidence: 'high',
    },
    {
      filterId: 'absentee_owner',
      reason: 'Absentee landlords tire of remote management',
      confidence: 'medium',
    },
  ],

  // Tax squeeze strategies
  tax_squeeze: [
    {
      filterId: 'tired_landlord',
      reason: 'Tax pressure often creates tired landlords',
      confidence: 'high',
    },
    {
      filterId: 'high_equity',
      reason: 'Owners with equity can absorb tax burdens longer',
      confidence: 'medium',
    },
    {
      filterId: 'absentee_owner',
      reason: 'Absentee owners may not track tax changes',
      confidence: 'medium',
    },
  ],

  // Absentee owner strategies
  absentee_owner: [
    {
      filterId: 'tired_landlord',
      reason: 'Long-term absentee owners often become tired landlords',
      confidence: 'high',
    },
    {
      filterId: 'out_of_state',
      reason: 'Out-of-state absentees face management challenges',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Remote owners may defer property upkeep',
      confidence: 'medium',
    },
  ],

  // Out of state strategies
  out_of_state: [
    {
      filterId: 'absentee_owner',
      reason: 'Out-of-state owners are typically absentee',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Distance creates management fatigue',
      confidence: 'high',
    },
    {
      filterId: 'distant_owner',
      reason: 'Distant owners face similar challenges',
      confidence: 'medium',
    },
  ],

  // Failed listing strategies
  failed_listing: [
    { filterId: 'fsbo_fatigue', reason: 'Failed listings often try FSBO next', confidence: 'high' },
    {
      filterId: 'negative_momentum',
      reason: 'Failed listings indicate negative momentum',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Failed sales create frustrated owners',
      confidence: 'medium',
    },
  ],

  // Free and clear strategies
  free_clear: [
    {
      filterId: 'high_equity',
      reason: 'Free and clear properties have maximum equity',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Long-held free properties often have tired owners',
      confidence: 'medium',
    },
    {
      filterId: 'life_stage',
      reason: 'Free and clear often indicates life stage transition',
      confidence: 'medium',
    },
  ],

  // New absentee strategies
  new_absentee: [
    {
      filterId: 'accidental_landlord',
      reason: 'New absentees are often accidental landlords',
      confidence: 'high',
    },
    { filterId: 'out_of_state', reason: 'New absentees may have relocated', confidence: 'medium' },
    {
      filterId: 'tired_landlord',
      reason: 'New landlords tire quickly of management',
      confidence: 'medium',
    },
  ],

  // Distant owner strategies
  distant_owner: [
    {
      filterId: 'out_of_state',
      reason: 'Distant owners are often out of state',
      confidence: 'high',
    },
    {
      filterId: 'absentee_owner',
      reason: 'Distance correlates with absentee status',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Distance makes maintenance difficult',
      confidence: 'medium',
    },
  ],

  // Multi-property strategies
  multi_property: [
    {
      filterId: 'shrinking_landlord',
      reason: 'Multi-property owners may be downsizing',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Multiple properties increase burnout risk',
      confidence: 'high',
    },
    {
      filterId: 'absentee_owner',
      reason: 'Multi-property owners are often absentee',
      confidence: 'medium',
    },
  ],

  // Equity sweet spot strategies
  equity_sweet_spot: [
    {
      filterId: 'high_equity',
      reason: 'Sweet spot equity enables creative deals',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Moderate equity owners may be ready to sell',
      confidence: 'medium',
    },
  ],

  // Accidental landlord strategies
  accidental_landlord: [
    {
      filterId: 'new_absentee',
      reason: 'Accidental landlords are often new to absentee ownership',
      confidence: 'high',
    },
    { filterId: 'tired_landlord', reason: 'Accidental landlords tire quickly', confidence: 'high' },
    {
      filterId: 'deferred_maintenance',
      reason: 'Inexperienced landlords defer maintenance',
      confidence: 'medium',
    },
  ],

  // Almost sold strategies
  almost_sold: [
    {
      filterId: 'failed_listing',
      reason: 'Almost sold properties may have had failed listings',
      confidence: 'high',
    },
    {
      filterId: 'negative_momentum',
      reason: 'Near-sales indicate motivated but stuck sellers',
      confidence: 'high',
    },
    {
      filterId: 'fsbo_fatigue',
      reason: 'Failed sales may lead to FSBO attempts',
      confidence: 'medium',
    },
  ],

  // Shrinking landlord strategies
  shrinking_landlord: [
    {
      filterId: 'multi_property',
      reason: 'Shrinking landlords are reducing portfolio',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Portfolio reduction indicates fatigue',
      confidence: 'high',
    },
    {
      filterId: 'life_stage',
      reason: 'Downsizing often tied to life changes',
      confidence: 'medium',
    },
  ],

  // Underwater landlord strategies
  underwater_landlord: [
    {
      filterId: 'negative_momentum',
      reason: 'Underwater status creates negative momentum',
      confidence: 'high',
    },
    {
      filterId: 'tax_squeeze',
      reason: 'Underwater owners feel tax pressure more',
      confidence: 'medium',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Negative equity creates owner fatigue',
      confidence: 'medium',
    },
  ],

  // Quiet equity strategies
  quiet_equity: [
    {
      filterId: 'high_equity',
      reason: 'Quiet equity indicates untapped value',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Long-held quiet equity often means tired owner',
      confidence: 'medium',
    },
  ],

  // Negative momentum strategies
  negative_momentum: [
    {
      filterId: 'failed_listing',
      reason: 'Negative momentum often follows failed listings',
      confidence: 'high',
    },
    {
      filterId: 'underwater_landlord',
      reason: 'Declining values create underwater situations',
      confidence: 'high',
    },
    { filterId: 'tired_landlord', reason: 'Negative trends exhaust owners', confidence: 'medium' },
  ],

  // FSBO fatigue strategies
  fsbo_fatigue: [
    {
      filterId: 'failed_listing',
      reason: 'FSBO attempts often follow failed agent listings',
      confidence: 'high',
    },
    { filterId: 'tired_landlord', reason: 'FSBO efforts exhaust owners', confidence: 'high' },
    { filterId: 'almost_sold', reason: 'FSBO sellers often had near-misses', confidence: 'medium' },
  ],

  // Life stage strategies
  life_stage: [
    {
      filterId: 'free_clear',
      reason: 'Life transitions often involve paid-off properties',
      confidence: 'high',
    },
    {
      filterId: 'shrinking_landlord',
      reason: 'Life changes drive portfolio reduction',
      confidence: 'high',
    },
    {
      filterId: 'high_equity',
      reason: 'Long-term owners in transition have equity',
      confidence: 'medium',
    },
  ],

  // Orphan property strategies
  orphan_property: [
    {
      filterId: 'absentee_owner',
      reason: 'Orphan properties typically have absentee owners',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Orphan properties often have deferred upkeep',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Neglected properties indicate tired owners',
      confidence: 'medium',
    },
  ],

  // Competitor exit strategies
  competitor_exit: [
    {
      filterId: 'shrinking_landlord',
      reason: 'Competitor exits indicate market opportunity',
      confidence: 'high',
    },
    {
      filterId: 'multi_property',
      reason: 'Exiting competitors often have multiple units',
      confidence: 'medium',
    },
  ],

  // Stalled permit strategies
  stalled_permit: [
    {
      filterId: 'deferred_maintenance',
      reason: 'Stalled permits indicate maintenance issues',
      confidence: 'high',
    },
    { filterId: 'tired_landlord', reason: 'Stalled projects exhaust owners', confidence: 'high' },
    { filterId: 'sunk_cost', reason: 'Stalled permits represent sunk costs', confidence: 'medium' },
  ],

  // Failed inspection strategies
  failed_inspection: [
    {
      filterId: 'stalled_permit',
      reason: 'Failed inspections cause permit stalls',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Failed inspections reveal maintenance issues',
      confidence: 'high',
    },
    {
      filterId: 'sunk_cost',
      reason: 'Failed inspections increase sunk costs',
      confidence: 'medium',
    },
  ],

  // Expired permit strategies
  expired_permit: [
    {
      filterId: 'stalled_permit',
      reason: 'Expired permits often had stalled work',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Expired permits indicate abandoned projects',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Permit expiration shows owner fatigue',
      confidence: 'medium',
    },
  ],

  // Over improved strategies
  over_improved: [
    {
      filterId: 'sunk_cost',
      reason: 'Over-improvement creates sunk cost pressure',
      confidence: 'high',
    },
    {
      filterId: 'negative_momentum',
      reason: 'Over-improved properties face value challenges',
      confidence: 'medium',
    },
  ],

  // Sunk cost strategies
  sunk_cost: [
    {
      filterId: 'over_improved',
      reason: 'Sunk costs often from over-improvement',
      confidence: 'high',
    },
    {
      filterId: 'stalled_permit',
      reason: 'Stalled projects represent sunk costs',
      confidence: 'high',
    },
    { filterId: 'tired_landlord', reason: 'Sunk costs create owner fatigue', confidence: 'medium' },
  ],

  // Deferred maintenance strategies
  deferred_maintenance: [
    {
      filterId: 'tired_landlord',
      reason: 'Deferred maintenance indicates tired owners',
      confidence: 'high',
    },
    { filterId: 'absentee_owner', reason: 'Absentees often defer maintenance', confidence: 'high' },
    {
      filterId: 'falling_behind',
      reason: 'Deferred maintenance compounds over time',
      confidence: 'medium',
    },
  ],

  // Falling behind strategies
  falling_behind: [
    {
      filterId: 'deferred_maintenance',
      reason: 'Falling behind leads to deferred maintenance',
      confidence: 'high',
    },
    {
      filterId: 'major_system_due',
      reason: 'Falling behind often precedes major repairs',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Properties falling behind have tired owners',
      confidence: 'medium',
    },
  ],

  // Major system due strategies
  major_system_due: [
    {
      filterId: 'falling_behind',
      reason: 'Major systems due indicate falling behind',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'System replacements are often deferred',
      confidence: 'high',
    },
    {
      filterId: 'tired_landlord',
      reason: 'Pending major repairs exhaust owners',
      confidence: 'medium',
    },
  ],

  // Home services filters - aging roof
  aging_roof: [
    {
      filterId: 'major_system_due',
      reason: 'Aging roof is a major system need',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Roof issues indicate deferred maintenance',
      confidence: 'high',
    },
  ],

  storm_damage: [
    { filterId: 'aging_roof', reason: 'Storm damage accelerates roof aging', confidence: 'high' },
    {
      filterId: 'deferred_maintenance',
      reason: 'Storm damage repairs are often deferred',
      confidence: 'medium',
    },
  ],

  no_reroof_history: [
    { filterId: 'aging_roof', reason: 'No history suggests aging roof', confidence: 'high' },
    {
      filterId: 'deferred_maintenance',
      reason: 'Missing roof work indicates deferred maintenance',
      confidence: 'medium',
    },
  ],

  hvac_replacement_due: [
    {
      filterId: 'major_system_due',
      reason: 'HVAC replacement is a major system need',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'HVAC issues indicate deferred maintenance',
      confidence: 'high',
    },
  ],

  heat_pump_candidate: [
    {
      filterId: 'hvac_replacement_due',
      reason: 'Heat pump candidates often need HVAC work',
      confidence: 'high',
    },
  ],

  no_hvac_history: [
    {
      filterId: 'hvac_replacement_due',
      reason: 'No history suggests HVAC replacement due',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Missing HVAC work indicates deferred maintenance',
      confidence: 'medium',
    },
  ],

  panel_upgrade_candidate: [
    {
      filterId: 'major_system_due',
      reason: 'Panel upgrade is a major system need',
      confidence: 'high',
    },
    {
      filterId: 'no_electrical_upgrades',
      reason: 'Panel candidates often lack upgrades',
      confidence: 'medium',
    },
  ],

  ev_charger_ready: [
    {
      filterId: 'panel_upgrade_candidate',
      reason: 'EV charging often requires panel upgrade',
      confidence: 'medium',
    },
  ],

  no_electrical_upgrades: [
    {
      filterId: 'panel_upgrade_candidate',
      reason: 'No upgrades suggests panel work needed',
      confidence: 'high',
    },
    {
      filterId: 'deferred_maintenance',
      reason: 'Missing electrical work indicates deferred maintenance',
      confidence: 'medium',
    },
  ],

  repiping_candidate: [
    { filterId: 'major_system_due', reason: 'Repiping is a major system need', confidence: 'high' },
    { filterId: 'water_heater_due', reason: 'Plumbing issues often cluster', confidence: 'medium' },
  ],

  water_heater_due: [
    {
      filterId: 'repiping_candidate',
      reason: 'Water heater issues may indicate pipe problems',
      confidence: 'medium',
    },
    {
      filterId: 'no_plumbing_permits',
      reason: 'Water heater due often means no recent plumbing work',
      confidence: 'medium',
    },
  ],

  no_plumbing_permits: [
    {
      filterId: 'repiping_candidate',
      reason: 'No permits suggests aging plumbing',
      confidence: 'high',
    },
    {
      filterId: 'water_heater_due',
      reason: 'No permits often means water heater due',
      confidence: 'medium',
    },
  ],

  solar_ready: [
    {
      filterId: 'high_consumption_area',
      reason: 'Solar-ready properties benefit in high consumption areas',
      confidence: 'high',
    },
  ],

  battery_upgrade: [
    {
      filterId: 'solar_ready',
      reason: 'Battery upgrades pair well with solar',
      confidence: 'high',
    },
  ],

  high_consumption_area: [
    {
      filterId: 'solar_ready',
      reason: 'High consumption areas benefit from solar',
      confidence: 'high',
    },
    {
      filterId: 'hvac_replacement_due',
      reason: 'High consumption may indicate HVAC issues',
      confidence: 'medium',
    },
  ],
};

export function useFilterSuggestions(activeFilters: ActiveFilter[]): FilterSuggestion[] {
  return useMemo(() => {
    if (activeFilters.length === 0) {
      return [];
    }

    // Get all active filter IDs
    const activeFilterIds = new Set(activeFilters.map((f) => f.filterId));

    // Collect suggestions based on active filters
    const suggestionMap = new Map<FilterId, FilterSuggestion>();

    activeFilters.forEach((filter) => {
      const suggestions = SUGGESTION_RULES[filter.filterId];
      if (suggestions) {
        suggestions.forEach((suggestion) => {
          // Don't suggest filters that are already active
          if (!activeFilterIds.has(suggestion.filterId)) {
            // If we already have this suggestion, keep the highest confidence
            const existing = suggestionMap.get(suggestion.filterId);
            if (
              !existing ||
              getConfidenceScore(suggestion.confidence) > getConfidenceScore(existing.confidence)
            ) {
              suggestionMap.set(suggestion.filterId, suggestion);
            }
          }
        });
      }
    });

    // Convert map to array and sort by confidence
    const suggestions = Array.from(suggestionMap.values());
    suggestions.sort((a, b) => getConfidenceScore(b.confidence) - getConfidenceScore(a.confidence));

    // Return top 5 suggestions
    return suggestions.slice(0, 5);
  }, [activeFilters]);
}

function getConfidenceScore(confidence: 'high' | 'medium' | 'low'): number {
  switch (confidence) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
  }
}

/**
 * Get filter name by ID
 */
export function getFilterName(filterId: FilterId): string {
  const allFilters = [
    ...STANDARD_FILTERS,
    ...ENHANCED_FILTERS,
    ...CONTRARIAN_FILTERS,
    ...SHOVELS_FILTERS,
    ...COMBINED_FILTERS,
  ];

  const filter = allFilters.find((f) => f.id === filterId);
  return filter?.name || filterId;
}
