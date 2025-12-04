'use client';

import { useMemo } from 'react';

export type HeatMapLayerType =
  // Global Layers (7)
  | 'price_trends'
  | 'market_activity'
  | 'days_on_market'
  | 'inventory_levels'
  | 'price_per_sqft'
  | 'appreciation_rate'
  | 'rental_yield'
  // Differentiator Layers (7)
  | 'distressed_properties'
  | 'foreclosure_density'
  | 'vacant_properties'
  | 'absentee_owners'
  | 'equity_levels'
  | 'property_age'
  | 'renovation_potential'
  // User-Specific Layers (5)
  | 'my_searches'
  | 'my_saved_properties'
  | 'my_deals'
  | 'my_buyer_matches'
  | 'my_success_areas'
  // Shovels Layers (7) - from Multi-Vertical Lead Generation spec
  | 'vitality'
  | 'permit_activity'
  | 'property_values'
  | 'rent_growth'
  | 'renovation_wave'
  | 'electrification'
  | 'contractor_saturation';

export interface HeatMapDataPoint {
  lat: number;
  lng: number;
  value: number;
  zipCode?: string;
  metadata?: Record<string, unknown>;
}

export interface HeatMapLayerConfig {
  id: HeatMapLayerType;
  name: string;
  description: string;
  category: 'global' | 'differentiator' | 'user' | 'shovels';
  colorScale: string[];
  minValue: number;
  maxValue: number;
  unit: string;
  enabled: boolean;
  dataSource?: 'rentcast' | 'shovels' | 'combined';
}

export const HEAT_MAP_LAYERS: HeatMapLayerConfig[] = [
  // Global Layers
  {
    id: 'price_trends',
    name: 'Price Trends',
    description: 'Median price changes over time',
    category: 'global',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: -10,
    maxValue: 10,
    unit: '%',
    enabled: true,
  },
  {
    id: 'market_activity',
    name: 'Market Activity',
    description: 'Number of transactions',
    category: 'global',
    colorScale: ['#3b82f6', '#8b5cf6', '#ec4899'],
    minValue: 0,
    maxValue: 100,
    unit: 'deals',
    enabled: false,
  },
  {
    id: 'days_on_market',
    name: 'Days on Market',
    description: 'Average listing duration',
    category: 'global',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 180,
    unit: 'days',
    enabled: false,
  },
  {
    id: 'inventory_levels',
    name: 'Inventory Levels',
    description: 'Available properties',
    category: 'global',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: 0,
    maxValue: 500,
    unit: 'properties',
    enabled: false,
  },
  {
    id: 'price_per_sqft',
    name: 'Price per Sq Ft',
    description: 'Average price per square foot',
    category: 'global',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 50,
    maxValue: 500,
    unit: '$/sqft',
    enabled: false,
  },
  {
    id: 'appreciation_rate',
    name: 'Appreciation Rate',
    description: 'Annual value increase',
    category: 'global',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: -5,
    maxValue: 15,
    unit: '%',
    enabled: false,
  },
  {
    id: 'rental_yield',
    name: 'Rental Yield',
    description: 'Annual rental return',
    category: 'global',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: 2,
    maxValue: 12,
    unit: '%',
    enabled: false,
  },
  // Differentiator Layers
  {
    id: 'distressed_properties',
    name: 'Distressed Properties',
    description: 'Properties in distress',
    category: 'differentiator',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 50,
    unit: 'properties',
    enabled: false,
  },
  {
    id: 'foreclosure_density',
    name: 'Foreclosure Density',
    description: 'Foreclosure concentration',
    category: 'differentiator',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 20,
    unit: '%',
    enabled: false,
  },
  {
    id: 'vacant_properties',
    name: 'Vacant Properties',
    description: 'Vacancy rate',
    category: 'differentiator',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 30,
    unit: '%',
    enabled: false,
  },
  {
    id: 'absentee_owners',
    name: 'Absentee Owners',
    description: 'Non-resident ownership',
    category: 'differentiator',
    colorScale: ['#3b82f6', '#8b5cf6', '#ec4899'],
    minValue: 0,
    maxValue: 50,
    unit: '%',
    enabled: false,
  },
  {
    id: 'equity_levels',
    name: 'Equity Levels',
    description: 'Average home equity',
    category: 'differentiator',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: 0,
    maxValue: 100,
    unit: '%',
    enabled: false,
  },
  {
    id: 'property_age',
    name: 'Property Age',
    description: 'Average building age',
    category: 'differentiator',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 100,
    unit: 'years',
    enabled: false,
  },
  {
    id: 'renovation_potential',
    name: 'Renovation Potential',
    description: 'Flip opportunity score',
    category: 'differentiator',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: 0,
    maxValue: 100,
    unit: 'score',
    enabled: false,
  },
  // User-Specific Layers
  {
    id: 'my_searches',
    name: 'My Searches',
    description: 'Your search activity',
    category: 'user',
    colorScale: ['#3b82f6', '#8b5cf6', '#ec4899'],
    minValue: 0,
    maxValue: 100,
    unit: 'searches',
    enabled: false,
  },
  {
    id: 'my_saved_properties',
    name: 'Saved Properties',
    description: 'Your saved listings',
    category: 'user',
    colorScale: ['#22c55e', '#10b981', '#059669'],
    minValue: 0,
    maxValue: 50,
    unit: 'properties',
    enabled: false,
  },
  {
    id: 'my_deals',
    name: 'My Deals',
    description: 'Your deal locations',
    category: 'user',
    colorScale: ['#f59e0b', '#d97706', '#b45309'],
    minValue: 0,
    maxValue: 20,
    unit: 'deals',
    enabled: false,
  },
  {
    id: 'my_buyer_matches',
    name: 'Buyer Matches',
    description: 'Buyer criteria matches',
    category: 'user',
    colorScale: ['#8b5cf6', '#7c3aed', '#6d28d9'],
    minValue: 0,
    maxValue: 100,
    unit: 'matches',
    enabled: false,
  },
  {
    id: 'my_success_areas',
    name: 'Success Areas',
    description: 'Your high-performance zones',
    category: 'user',
    colorScale: ['#22c55e', '#16a34a', '#15803d'],
    minValue: 0,
    maxValue: 100,
    unit: 'score',
    enabled: false,
  },
  // Shovels Layers (from Multi-Vertical Lead Generation spec)
  {
    id: 'vitality',
    name: 'Vitality Score',
    description: 'Overall construction activity health',
    category: 'shovels',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: 0,
    maxValue: 100,
    unit: 'score',
    enabled: false,
    dataSource: 'shovels',
  },
  {
    id: 'permit_activity',
    name: 'Permit Activity',
    description: 'Recent permit volume',
    category: 'shovels',
    colorScale: ['#3b82f6', '#8b5cf6', '#ec4899'],
    minValue: 0,
    maxValue: 100,
    unit: 'permits',
    enabled: false,
    dataSource: 'shovels',
  },
  {
    id: 'property_values',
    name: 'Property Values',
    description: 'Average property values from permits',
    category: 'shovels',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 1000000,
    unit: '$',
    enabled: false,
    dataSource: 'shovels',
  },
  {
    id: 'rent_growth',
    name: 'Rent Growth',
    description: 'Year-over-year rent increase',
    category: 'shovels',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: -5,
    maxValue: 15,
    unit: '%',
    enabled: false,
    dataSource: 'combined',
  },
  {
    id: 'renovation_wave',
    name: 'Renovation Wave',
    description: 'Areas with high renovation activity',
    category: 'shovels',
    colorScale: ['#3b82f6', '#8b5cf6', '#ec4899'],
    minValue: 0,
    maxValue: 100,
    unit: 'score',
    enabled: false,
    dataSource: 'shovels',
  },
  {
    id: 'electrification',
    name: 'Electrification',
    description: 'Solar/EV/battery adoption rate',
    category: 'shovels',
    colorScale: ['#ef4444', '#eab308', '#22c55e'],
    minValue: 0,
    maxValue: 50,
    unit: '%',
    enabled: false,
    dataSource: 'shovels',
  },
  {
    id: 'contractor_saturation',
    name: 'Contractor Saturation',
    description: 'Contractor density in area',
    category: 'shovels',
    colorScale: ['#22c55e', '#eab308', '#ef4444'],
    minValue: 0,
    maxValue: 100,
    unit: 'contractors',
    enabled: false,
    dataSource: 'shovels',
  },
];

export function getLayerConfig(layerId: HeatMapLayerType): HeatMapLayerConfig | undefined {
  return HEAT_MAP_LAYERS.find((layer) => layer.id === layerId);
}

export function getLayersByCategory(
  category: 'global' | 'differentiator' | 'user' | 'shovels'
): HeatMapLayerConfig[] {
  return HEAT_MAP_LAYERS.filter((layer) => layer.category === category);
}

export function interpolateColor(
  value: number,
  min: number,
  max: number,
  colorScale: string[]
): string {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const index = Math.floor(normalized * (colorScale.length - 1));
  return colorScale[Math.min(index, colorScale.length - 1)] ?? '#000000';
}

export function useHeatMapLayers(enabledLayers: HeatMapLayerType[]) {
  return useMemo(() => {
    return HEAT_MAP_LAYERS.map((layer) => ({
      ...layer,
      enabled: enabledLayers.includes(layer.id),
    }));
  }, [enabledLayers]);
}
