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

// All filters combined
export const ALL_FILTERS: FilterConfig[] = [
  ...STANDARD_FILTERS,
  ...ENHANCED_FILTERS,
  ...CONTRARIAN_FILTERS,
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

