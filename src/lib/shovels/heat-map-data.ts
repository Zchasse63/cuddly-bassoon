/**
 * Heat Map Data Provider
 * Provides data for various heat map layers based on Shovels permit data
 */

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Types
// ============================================

export type HeatMapLayer =
  | 'vitality'
  | 'permit_activity'
  | 'property_values'
  | 'rent_growth'
  | 'renovation_wave'
  | 'electrification'
  | 'contractor_saturation';

export interface HeatMapDataPoint {
  geoId: string;
  geoType: 'zip' | 'city' | 'county';
  name: string;
  center: [number, number]; // [lng, lat]
  value: number;
  normalizedValue: number; // 0-100 for color scaling
}

export interface HeatMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ============================================
// Main Heat Map Data Function
// ============================================

/**
 * Get heat map data for a specific layer and geographic bounds.
 */
export async function getHeatMapData(
  layer: HeatMapLayer,
  bounds: HeatMapBounds,
  geoType: 'zip' | 'city' | 'county' = 'zip'
): Promise<HeatMapDataPoint[]> {
  const supabase = await createClient();

  switch (layer) {
    case 'vitality':
      return getVitalityHeatMap(supabase, bounds, geoType);
    case 'permit_activity':
      return getPermitActivityHeatMap(supabase, bounds, geoType);
    case 'renovation_wave':
      return getRenovationWaveHeatMap(supabase, bounds, geoType);
    case 'electrification':
      return getElectrificationHeatMap(supabase, bounds, geoType);
    case 'contractor_saturation':
      return getContractorSaturationHeatMap(supabase, bounds, geoType);
    default:
      return [];
  }
}

// ============================================
// Layer-Specific Functions
// ============================================

async function getVitalityHeatMap(
  supabase: SupabaseClient,
  _bounds: HeatMapBounds,
  geoType: string
): Promise<HeatMapDataPoint[]> {
  const { data } = await supabase.from('geo_vitality_scores').select('*').eq('geo_type', geoType);

  if (!data || data.length === 0) return [];

  const scores = data.map((d) => d.vitality_score || 0);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  return data.map((d) => ({
    geoId: d.geo_key,
    geoType: d.geo_type as 'zip' | 'city' | 'county',
    name: d.city || d.zip_code || d.geo_key,
    center: [0, 0] as [number, number],
    value: d.vitality_score || 0,
    normalizedValue:
      maxScore > minScore
        ? (((d.vitality_score || 0) - minScore) / (maxScore - minScore)) * 100
        : 50,
  }));
}

async function getPermitActivityHeatMap(
  supabase: SupabaseClient,
  _bounds: HeatMapBounds,
  geoType: string
): Promise<HeatMapDataPoint[]> {
  const { data } = await supabase
    .from('geo_vitality_scores')
    .select('geo_key, geo_type, city, zip_code, total_permits')
    .eq('geo_type', geoType);

  if (!data || data.length === 0) return [];

  const permits = data.map((d) => d.total_permits || 0);
  const maxPermits = Math.max(...permits);
  const minPermits = Math.min(...permits);

  return data.map((d) => ({
    geoId: d.geo_key,
    geoType: d.geo_type as 'zip' | 'city' | 'county',
    name: d.city || d.zip_code || d.geo_key,
    center: [0, 0] as [number, number],
    value: d.total_permits || 0,
    normalizedValue:
      maxPermits > minPermits
        ? (((d.total_permits || 0) - minPermits) / (maxPermits - minPermits)) * 100
        : 50,
  }));
}

async function getRenovationWaveHeatMap(
  supabase: SupabaseClient,
  _bounds: HeatMapBounds,
  _geoType: string
): Promise<HeatMapDataPoint[]> {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('shovels_permits')
    .select('zip_code')
    .overlaps('tags', ['remodel', 'kitchen', 'bathroom', 'addition'])
    .gte('file_date', oneYearAgo);

  if (!data || data.length === 0) return [];

  // Group by zip
  const zipCounts: Record<string, number> = {};
  data.forEach((d) => {
    if (d.zip_code) {
      zipCounts[d.zip_code] = (zipCounts[d.zip_code] || 0) + 1;
    }
  });

  const counts = Object.values(zipCounts);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);

  return Object.entries(zipCounts).map(([zip, count]) => ({
    geoId: zip,
    geoType: 'zip' as const,
    name: zip,
    center: [0, 0] as [number, number],
    value: count,
    normalizedValue:
      maxCount > minCount ? ((count - minCount) / (maxCount - minCount)) * 100 : 50,
  }));
}

async function getElectrificationHeatMap(
  supabase: SupabaseClient,
  _bounds: HeatMapBounds,
  _geoType: string
): Promise<HeatMapDataPoint[]> {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('shovels_permits')
    .select('zip_code')
    .overlaps('tags', ['solar', 'ev_charger', 'heat_pump', 'battery'])
    .gte('file_date', oneYearAgo);

  if (!data || data.length === 0) return [];

  const zipCounts: Record<string, number> = {};
  data.forEach((d) => {
    if (d.zip_code) {
      zipCounts[d.zip_code] = (zipCounts[d.zip_code] || 0) + 1;
    }
  });

  const counts = Object.values(zipCounts);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);

  return Object.entries(zipCounts).map(([zip, count]) => ({
    geoId: zip,
    geoType: 'zip' as const,
    name: zip,
    center: [0, 0] as [number, number],
    value: count,
    normalizedValue:
      maxCount > minCount ? ((count - minCount) / (maxCount - minCount)) * 100 : 50,
  }));
}

async function getContractorSaturationHeatMap(
  supabase: SupabaseClient,
  _bounds: HeatMapBounds,
  _geoType: string
): Promise<HeatMapDataPoint[]> {
  const { data } = await supabase
    .from('shovels_contractors')
    .select('zip_code')
    .not('zip_code', 'is', null);

  if (!data || data.length === 0) return [];

  const zipCounts: Record<string, number> = {};
  data.forEach((d) => {
    if (d.zip_code) {
      zipCounts[d.zip_code] = (zipCounts[d.zip_code] || 0) + 1;
    }
  });

  const counts = Object.values(zipCounts);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);

  return Object.entries(zipCounts).map(([zip, count]) => ({
    geoId: zip,
    geoType: 'zip' as const,
    name: zip,
    center: [0, 0] as [number, number],
    value: count,
    normalizedValue:
      maxCount > minCount ? ((count - minCount) / (maxCount - minCount)) * 100 : 50,
  }));
}

// ============================================
// Layer Metadata
// ============================================

export const HEAT_MAP_LAYERS: Record<
  HeatMapLayer,
  { name: string; description: string; colorScale: 'green' | 'blue' | 'orange' | 'purple' }
> = {
  vitality: {
    name: 'Neighborhood Vitality',
    description: 'Overall construction activity and growth score',
    colorScale: 'green',
  },
  permit_activity: {
    name: 'Permit Activity',
    description: 'Total number of permits filed',
    colorScale: 'blue',
  },
  property_values: {
    name: 'Property Values',
    description: 'Average property values in the area',
    colorScale: 'green',
  },
  rent_growth: {
    name: 'Rent Growth',
    description: 'Year-over-year rent growth percentage',
    colorScale: 'orange',
  },
  renovation_wave: {
    name: 'Renovation Wave',
    description: 'Areas with high remodel/addition activity',
    colorScale: 'orange',
  },
  electrification: {
    name: 'Electrification',
    description: 'Solar, EV charger, heat pump, and battery installations',
    colorScale: 'blue',
  },
  contractor_saturation: {
    name: 'Contractor Saturation',
    description: 'Number of active contractors in the area',
    colorScale: 'purple',
  },
};

