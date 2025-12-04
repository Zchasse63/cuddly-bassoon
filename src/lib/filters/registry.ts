/**
 * Filter Registry
 * Central registry of all 21 property filters with metadata and configurations
 */

import type { FilterConfig, FilterCategory, FilterId } from './types';

// Standard Filters (6)
export const STANDARD_FILTERS: FilterConfig[] = [
  {
    id: 'absentee_owner',
    name: 'Absentee Owner',
    description: 'Owner does not live at the property (mailing address differs from property address)',
    category: 'standard',
    defaultEnabled: false,
  },
  {
    id: 'high_equity',
    name: 'High Equity',
    description: 'Property has significant equity position (typically >40%)',
    category: 'standard',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minEquityPercent',
        label: 'Minimum Equity %',
        type: 'number',
        defaultValue: 40,
        min: 0,
        max: 100,
        step: 5,
      },
    ],
  },
  {
    id: 'free_clear',
    name: 'Free & Clear',
    description: 'Property has no mortgage (100% equity)',
    category: 'standard',
    defaultEnabled: false,
  },
  {
    id: 'tired_landlord',
    name: 'Tired Landlord',
    description: 'Long-term rental property owner (10+ years ownership)',
    category: 'standard',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minOwnershipYears',
        label: 'Min Ownership (Years)',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 50,
        step: 1,
      },
    ],
  },
  {
    id: 'out_of_state',
    name: 'Out-of-State Owner',
    description: 'Owner lives in a different state than the property',
    category: 'standard',
    defaultEnabled: false,
  },
  {
    id: 'failed_listing',
    name: 'Failed Listing',
    description: 'Property listing expired or was withdrawn',
    category: 'standard',
    defaultEnabled: false,
    parameters: [
      {
        key: 'lookbackMonths',
        label: 'Look Back (Months)',
        type: 'number',
        defaultValue: 12,
        min: 1,
        max: 24,
        step: 1,
      },
    ],
  },
];

// Enhanced Filters (5)
export const ENHANCED_FILTERS: FilterConfig[] = [
  {
    id: 'new_absentee',
    name: 'New Absentee',
    description: 'Recently became an absentee owner (within last 2 years)',
    category: 'enhanced',
    defaultEnabled: false,
    parameters: [
      {
        key: 'maxYearsSinceAbsentee',
        label: 'Max Years Since Absentee',
        type: 'number',
        defaultValue: 2,
        min: 1,
        max: 5,
        step: 1,
      },
    ],
  },
  {
    id: 'distant_owner',
    name: 'Distant Owner',
    description: 'Owner lives far from property (100+ miles)',
    category: 'enhanced',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minDistanceMiles',
        label: 'Min Distance (Miles)',
        type: 'number',
        defaultValue: 100,
        min: 25,
        max: 500,
        step: 25,
      },
    ],
  },
  {
    id: 'multi_property',
    name: 'Multi-Property Owner',
    description: 'Owner has multiple properties (2+)',
    category: 'enhanced',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minPropertyCount',
        label: 'Min Properties Owned',
        type: 'number',
        defaultValue: 2,
        min: 2,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    id: 'equity_sweet_spot',
    name: 'Equity Sweet Spot',
    description: 'Property has ideal equity range (40-70%)',
    category: 'enhanced',
    defaultEnabled: false,
    parameters: [
      {
        key: 'equityRange',
        label: 'Equity Range %',
        type: 'range',
        defaultValue: [40, 70] as [number, number],
        min: 0,
        max: 100,
        step: 5,
      },
    ],
  },
  {
    id: 'accidental_landlord',
    name: 'Accidental Landlord',
    description: 'Property was previously owner-occupied, now rented',
    category: 'enhanced',
    defaultEnabled: false,
  },
];

// Shovels Filters (3) - Permit-based filters
export const SHOVELS_FILTERS: FilterConfig[] = [
  {
    id: 'stalled_permit',
    name: 'Stalled Permit',
    description: 'Active permit 180+ days without progress - indicates construction problems',
    category: 'shovels',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minDaysStalled',
        label: 'Min Days Stalled',
        type: 'number',
        defaultValue: 180,
        min: 90,
        max: 365,
        step: 30,
      },
    ],
  },
  {
    id: 'failed_inspection',
    name: 'Failed Inspection',
    description: 'Inspection pass rate below 50% - indicates construction quality issues',
    category: 'shovels',
    defaultEnabled: false,
    parameters: [
      {
        key: 'maxPassRate',
        label: 'Max Pass Rate %',
        type: 'number',
        defaultValue: 50,
        min: 20,
        max: 80,
        step: 10,
      },
    ],
  },
  {
    id: 'expired_permit',
    name: 'Expired Permit',
    description: 'Permit expired without final inspection - incomplete work',
    category: 'shovels',
    defaultEnabled: false,
  },
];

// Combined Filters (5) - RentCast + Shovels data
export const COMBINED_FILTERS: FilterConfig[] = [
  {
    id: 'over_improved',
    name: 'Over-Improved',
    description: 'High permit investment with low appreciation - owner can\'t recoup investment',
    category: 'combined',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minPermitValue',
        label: 'Min Permit Value ($)',
        type: 'number',
        defaultValue: 50000,
        min: 20000,
        max: 200000,
        step: 10000,
      },
    ],
  },
  {
    id: 'sunk_cost',
    name: 'Sunk Cost',
    description: 'High equity owner with abandoned project - gave up on renovation',
    category: 'combined',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minEquityPercent',
        label: 'Min Equity %',
        type: 'number',
        defaultValue: 50,
        min: 30,
        max: 80,
        step: 10,
      },
    ],
  },
  {
    id: 'deferred_maintenance',
    name: 'Deferred Maintenance',
    description: 'Long-term absentee owner with no permits in 5+ years',
    category: 'combined',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minOwnershipYears',
        label: 'Min Ownership (Years)',
        type: 'number',
        defaultValue: 10,
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    id: 'falling_behind',
    name: 'Falling Behind',
    description: 'No permits while neighbors are improving - falling behind market',
    category: 'combined',
    defaultEnabled: false,
  },
  {
    id: 'major_system_due',
    name: 'Major System Due',
    description: 'Roof, HVAC, or water heater past expected lifespan',
    category: 'combined',
    defaultEnabled: false,
    parameters: [
      {
        key: 'roofLifespanYears',
        label: 'Roof Lifespan (Years)',
        type: 'number',
        defaultValue: 20,
        min: 15,
        max: 30,
        step: 5,
      },
    ],
  },
];

// Contrarian Filters (10)
export const CONTRARIAN_FILTERS: FilterConfig[] = [
  {
    id: 'almost_sold',
    name: 'Almost Sold',
    description: 'Deal fell through (was under contract, then cancelled)',
    category: 'contrarian',
    defaultEnabled: false,
    parameters: [
      {
        key: 'lookbackMonths',
        label: 'Look Back (Months)',
        type: 'number',
        defaultValue: 6,
        min: 1,
        max: 12,
        step: 1,
      },
    ],
  },
  {
    id: 'shrinking_landlord',
    name: 'Shrinking Landlord',
    description: 'Owner has been selling off rental portfolio',
    category: 'contrarian',
    defaultEnabled: false,
  },
  {
    id: 'underwater_landlord',
    name: 'Underwater Landlord',
    description: 'Rent does not cover mortgage payment (negative cash flow)',
    category: 'contrarian',
    defaultEnabled: false,
  },
  {
    id: 'tax_squeeze',
    name: 'Tax Squeeze',
    description: 'Property taxes increased significantly (>20% YoY)',
    category: 'contrarian',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minTaxIncreasePercent',
        label: 'Min Tax Increase %',
        type: 'number',
        defaultValue: 20,
        min: 10,
        max: 100,
        step: 5,
      },
    ],
  },
  {
    id: 'quiet_equity',
    name: 'Quiet Equity Builder',
    description: 'Long-term owner (15+ years) with no recent refinance',
    category: 'contrarian',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minOwnershipYears',
        label: 'Min Ownership (Years)',
        type: 'number',
        defaultValue: 15,
        min: 10,
        max: 30,
        step: 1,
      },
    ],
  },
  {
    id: 'negative_momentum',
    name: 'Negative Momentum',
    description: 'Property value declining year over year',
    category: 'contrarian',
    defaultEnabled: false,
  },
  {
    id: 'fsbo_fatigue',
    name: 'FSBO Fatigue',
    description: 'For Sale By Owner listing active for 90+ days',
    category: 'contrarian',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minDaysOnMarket',
        label: 'Min Days on Market',
        type: 'number',
        defaultValue: 90,
        min: 30,
        max: 180,
        step: 15,
      },
    ],
  },
  {
    id: 'life_stage',
    name: 'Life Stage Transition',
    description: 'Indicators of life events (probate, divorce, senior)',
    category: 'contrarian',
    defaultEnabled: false,
  },
  {
    id: 'orphan_property',
    name: 'Orphan Property',
    description: 'No transaction activity for 5+ years',
    category: 'contrarian',
    defaultEnabled: false,
    parameters: [
      {
        key: 'minYearsInactive',
        label: 'Min Years Inactive',
        type: 'number',
        defaultValue: 5,
        min: 3,
        max: 15,
        step: 1,
      },
    ],
  },
  {
    id: 'competitor_exit',
    name: 'Competitor Exit',
    description: 'Other investors selling properties in the area',
    category: 'contrarian',
    defaultEnabled: false,
  },
];

// Home Services Filters (15) - Vertical-specific filters
export const HOME_SERVICES_FILTERS: FilterConfig[] = [
  // Roofing (3)
  {
    id: 'aging_roof',
    name: 'Aging Roof',
    description: 'Roof 15+ years old based on permit history or year built',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minRoofAgeYears', label: 'Min Roof Age (Years)', type: 'number', defaultValue: 15, min: 10, max: 30, step: 5 }],
  },
  {
    id: 'storm_damage',
    name: 'Storm Damage Potential',
    description: 'Old roof in area with recent roofing activity - potential storm damage',
    category: 'home-services',
    defaultEnabled: false,
  },
  {
    id: 'no_reroof_history',
    name: 'No Reroof History',
    description: 'Property 20+ years old with no roofing permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyAgeYears', label: 'Min Property Age (Years)', type: 'number', defaultValue: 20, min: 15, max: 40, step: 5 }],
  },
  // HVAC (3)
  {
    id: 'hvac_replacement_due',
    name: 'HVAC Replacement Due',
    description: 'HVAC system 15+ years old based on permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minHvacAgeYears', label: 'Min HVAC Age (Years)', type: 'number', defaultValue: 15, min: 10, max: 25, step: 5 }],
  },
  {
    id: 'heat_pump_candidate',
    name: 'Heat Pump Candidate',
    description: 'Has solar but no heat pump - eco-conscious homeowner',
    category: 'home-services',
    defaultEnabled: false,
  },
  {
    id: 'no_hvac_history',
    name: 'No HVAC History',
    description: 'Property 20+ years old with no HVAC permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyAgeYears', label: 'Min Property Age (Years)', type: 'number', defaultValue: 20, min: 15, max: 40, step: 5 }],
  },
  // Electrical (3)
  {
    id: 'panel_upgrade_candidate',
    name: 'Panel Upgrade Candidate',
    description: 'Older home with high-draw additions (solar, EV, heat pump)',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'maxYearBuilt', label: 'Max Year Built', type: 'number', defaultValue: 1990, min: 1960, max: 2000, step: 5 }],
  },
  {
    id: 'ev_charger_ready',
    name: 'EV Charger Ready',
    description: 'High-value home without EV charger installation',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyValue', label: 'Min Property Value ($)', type: 'number', defaultValue: 400000, min: 200000, max: 1000000, step: 50000 }],
  },
  {
    id: 'no_electrical_upgrades',
    name: 'No Electrical Upgrades',
    description: 'Property 30+ years old with no electrical permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyAgeYears', label: 'Min Property Age (Years)', type: 'number', defaultValue: 30, min: 20, max: 50, step: 5 }],
  },
  // Plumbing (3)
  {
    id: 'repiping_candidate',
    name: 'Repiping Candidate',
    description: 'Property 40+ years old with no plumbing permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyAgeYears', label: 'Min Property Age (Years)', type: 'number', defaultValue: 40, min: 30, max: 60, step: 5 }],
  },
  {
    id: 'water_heater_due',
    name: 'Water Heater Due',
    description: 'Water heater 12+ years old based on permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minWaterHeaterAgeYears', label: 'Min Water Heater Age (Years)', type: 'number', defaultValue: 12, min: 8, max: 20, step: 2 }],
  },
  {
    id: 'no_plumbing_permits',
    name: 'No Plumbing Permits',
    description: 'Property 25+ years old with no plumbing permit history',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyAgeYears', label: 'Min Property Age (Years)', type: 'number', defaultValue: 25, min: 15, max: 40, step: 5 }],
  },
  // Solar (3)
  {
    id: 'solar_ready',
    name: 'Solar Ready',
    description: 'Recent roof or high-value home without solar installation',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minPropertyValue', label: 'Min Property Value ($)', type: 'number', defaultValue: 300000, min: 150000, max: 750000, step: 50000 }],
  },
  {
    id: 'battery_upgrade',
    name: 'Battery Upgrade',
    description: 'Has solar installation - battery storage upsell opportunity',
    category: 'home-services',
    defaultEnabled: false,
  },
  {
    id: 'high_consumption_area',
    name: 'High Consumption Area',
    description: 'Large home (2500+ sq ft) without solar - high energy consumption',
    category: 'home-services',
    defaultEnabled: false,
    parameters: [{ key: 'minSquareFootage', label: 'Min Square Footage', type: 'number', defaultValue: 2500, min: 1500, max: 5000, step: 500 }],
  },
];

// All filters combined
export const ALL_FILTERS: FilterConfig[] = [
  ...STANDARD_FILTERS,
  ...ENHANCED_FILTERS,
  ...SHOVELS_FILTERS,
  ...COMBINED_FILTERS,
  ...CONTRARIAN_FILTERS,
  ...HOME_SERVICES_FILTERS,
];

// Filter lookup map
export const FILTER_MAP: Map<string, FilterConfig> = new Map(
  ALL_FILTERS.map((f) => [f.id, f])
);

// Get filters by category
export function getFiltersByCategory(category: FilterCategory): FilterConfig[] {
  return ALL_FILTERS.filter((f) => f.category === category);
}

// Get filter by ID with config derived from parameters
export function getFilterById(id: FilterId): (FilterConfig & { config?: Record<string, { type: string; min?: number; max?: number }> }) | undefined {
  const filter = FILTER_MAP.get(id);
  if (!filter) return undefined;

  // Derive config from parameters
  if (filter.parameters) {
    const config: Record<string, { type: string; min?: number; max?: number }> = {};
    for (const param of filter.parameters) {
      config[param.key] = {
        type: param.type,
        min: param.min,
        max: param.max,
      };
    }
    return { ...filter, config };
  }

  return filter;
}

// Get all filter IDs
export function getAllFilterIds(): FilterId[] {
  return ALL_FILTERS.map((f) => f.id);
}

