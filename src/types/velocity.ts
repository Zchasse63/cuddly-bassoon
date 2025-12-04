/**
 * Market Velocity Index Types
 * Type definitions for the Market Velocity Index feature
 */

import { z } from 'zod';

// =============================================
// Classification Types
// =============================================

export const VelocityClassification = {
  COLD: 'Cold',
  COOL: 'Cool',
  BALANCED: 'Balanced',
  WARM: 'Warm',
  HOT: 'Hot',
  ON_FIRE: 'On Fire',
} as const;

export type VelocityClassification = (typeof VelocityClassification)[keyof typeof VelocityClassification];

export const VelocityTrend = {
  RISING: 'Rising',
  STABLE: 'Stable',
  FALLING: 'Falling',
} as const;

export type VelocityTrend = (typeof VelocityTrend)[keyof typeof VelocityTrend];

// =============================================
// Core Market Velocity Index Interface
// =============================================

export interface MarketVelocityIndex {
  zipCode: string;
  geoId?: string;

  // Geographic info
  city?: string;
  state?: string;
  county?: string;

  // Component Scores (0-100)
  daysOnMarketScore: number;
  absorptionScore: number;
  inventoryScore: number;
  permitActivityScore: number;
  investmentConvictionScore: number;

  // Raw Metrics
  avgDaysOnMarket: number;
  medianDaysOnMarket: number;
  absorptionRate: number;
  monthsOfInventory: number;
  totalListings: number;
  permitVolume: number;
  permitValueTotal: number;

  // Composite
  velocityIndex: number; // 0-100
  classification: VelocityClassification;

  // Trend (compared to previous calculation)
  velocityTrend?: VelocityTrend;
  velocityChange?: number;

  // Geo coordinates
  centerLat?: number;
  centerLng?: number;

  // Metadata
  calculatedAt: string;
  dataFreshness: {
    rentcastLastUpdated?: string;
    shovelsLastUpdated?: string;
  };
}

// =============================================
// Zod Schemas for Validation
// =============================================

export const MarketVelocityIndexSchema = z.object({
  zipCode: z.string(),
  geoId: z.string().optional(),

  city: z.string().optional(),
  state: z.string().optional(),
  county: z.string().optional(),

  daysOnMarketScore: z.number().min(0).max(100),
  absorptionScore: z.number().min(0).max(100),
  inventoryScore: z.number().min(0).max(100),
  permitActivityScore: z.number().min(0).max(100),
  investmentConvictionScore: z.number().min(0).max(100),

  avgDaysOnMarket: z.number(),
  medianDaysOnMarket: z.number(),
  absorptionRate: z.number(),
  monthsOfInventory: z.number(),
  totalListings: z.number(),
  permitVolume: z.number(),
  permitValueTotal: z.number(),

  velocityIndex: z.number().min(0).max(100),
  classification: z.enum(['Cold', 'Cool', 'Balanced', 'Warm', 'Hot', 'On Fire']),

  velocityTrend: z.enum(['Rising', 'Stable', 'Falling']).optional(),
  velocityChange: z.number().optional(),

  centerLat: z.number().optional(),
  centerLng: z.number().optional(),

  calculatedAt: z.string(),
  dataFreshness: z.object({
    rentcastLastUpdated: z.string().optional(),
    shovelsLastUpdated: z.string().optional(),
  }),
});

// =============================================
// Database Row Types (for Supabase)
// =============================================

export interface MarketVelocityIndexRow {
  id: string;
  zip_code: string;
  geo_id: string | null;
  city: string | null;
  state: string | null;
  county: string | null;
  days_on_market_score: number | null;
  absorption_score: number | null;
  inventory_score: number | null;
  permit_activity_score: number | null;
  investment_conviction_score: number | null;
  avg_days_on_market: number | null;
  median_days_on_market: number | null;
  absorption_rate: number | null;
  months_of_inventory: number | null;
  total_listings: number | null;
  permit_volume: number | null;
  permit_value_total: number | null;
  velocity_index: number;
  classification: string;
  velocity_trend: string | null;
  velocity_change: number | null;
  center_lat: number | null;
  center_lng: number | null;
  calculated_at: string;
  rentcast_data_date: string | null;
  shovels_data_date: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MarketVelocityHistoryRow {
  id: string;
  zip_code: string;
  velocity_index: number;
  classification: string;
  calculated_at: string;
  component_scores: Record<string, number> | null;
  raw_metrics: Record<string, number> | null;
  created_at: string;
}

export interface MarketVelocityAggregateRow {
  id: string;
  geo_type: string;
  geo_name: string;
  geo_id: string | null;
  state: string;
  avg_velocity_index: number | null;
  min_velocity_index: number | null;
  max_velocity_index: number | null;
  median_velocity_index: number | null;
  zip_count: number | null;
  hot_zip_count: number | null;
  cold_zip_count: number | null;
  dominant_classification: string | null;
  velocity_trend: string | null;
  bounds_north: number | null;
  bounds_south: number | null;
  bounds_east: number | null;
  bounds_west: number | null;
  center_lat: number | null;
  center_lng: number | null;
  calculated_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface TrackedZipCodeRow {
  id: string;
  zip_code: string;
  geo_id: string | null;
  city: string | null;
  state: string;
  county: string | null;
  center_lat: number | null;
  center_lng: number | null;
  is_active: boolean;
  priority: number;
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// API Request/Response Types
// =============================================

export interface GetVelocityParams {
  zipCode?: string;
  city?: string;
  state?: string;
  county?: string;
}

export interface VelocityHeatMapParams {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export interface VelocityHeatMapResponse {
  granularity: 'state' | 'metro' | 'county' | 'city' | 'zip';
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  dataPoints: Array<{
    zipCode?: string;
    geoName?: string;
    geoType?: string;
    velocityIndex: number;
    classification: VelocityClassification;
    centerLat: number;
    centerLng: number;
  }>;
}

export interface VelocityRankingsParams {
  type: 'top' | 'bottom';
  limit?: number;
  state?: string;
}

export interface VelocityRankingsResponse {
  rankings: Array<{
    rank: number;
    zipCode: string;
    city?: string;
    state?: string;
    velocityIndex: number;
    classification: VelocityClassification;
    avgDaysOnMarket?: number;
    monthsOfInventory?: number;
  }>;
}

export interface VelocityCompareParams {
  zipCodes: string[];
}

export interface VelocityCompareResponse {
  rankings: Array<{
    rank: number;
    zipCode: string;
    city?: string;
    state?: string;
    velocityIndex: number;
    classification: VelocityClassification;
  }>;
  winner: MarketVelocityIndex;
  analysis: string;
}

export interface VelocityTrendParams {
  zipCode: string;
  timeframe: '30d' | '90d' | '6m' | '1y';
}

export interface VelocityTrendResponse {
  zipCode: string;
  currentVelocity: number;
  previousVelocity: number;
  change: number;
  trend: VelocityTrend;
  trendStrength: 'Strong' | 'Moderate' | 'Weak';
  history: Array<{
    date: string;
    velocityIndex: number;
    classification: VelocityClassification;
  }>;
  forecast?: {
    predictedVelocity: number;
    confidence: number;
  };
}

// =============================================
// Heat Map Layer Configuration
// =============================================

export interface VelocityLayerConfig {
  enabled: boolean;
  opacity: number;
}

export interface VelocityColorScale {
  threshold: number;
  color: string;
  label: VelocityClassification;
}

export const VELOCITY_COLOR_SCALE: VelocityColorScale[] = [
  { threshold: 0, color: '#3B82F6', label: 'Cold' },     // Blue
  { threshold: 25, color: '#22C55E', label: 'Cool' },    // Green
  { threshold: 40, color: '#EAB308', label: 'Balanced' }, // Yellow
  { threshold: 55, color: '#F59E0B', label: 'Warm' },    // Amber
  { threshold: 70, color: '#EA580C', label: 'Hot' },     // Orange
  { threshold: 85, color: '#DC2626', label: 'On Fire' }, // Red
];

export const VELOCITY_CLASSIFICATION_THRESHOLDS = {
  ON_FIRE: 85,
  HOT: 70,
  WARM: 55,
  BALANCED: 40,
  COOL: 25,
  COLD: 0,
} as const;

// =============================================
// Utility Functions
// =============================================

/**
 * Get the color for a velocity index value
 */
export function getVelocityColor(velocityIndex: number): string {
  for (let i = VELOCITY_COLOR_SCALE.length - 1; i >= 0; i--) {
    if (velocityIndex >= VELOCITY_COLOR_SCALE[i]!.threshold) {
      return VELOCITY_COLOR_SCALE[i]!.color;
    }
  }
  return VELOCITY_COLOR_SCALE[0]!.color;
}

/**
 * Get the classification for a velocity index value
 */
export function getVelocityClassification(velocityIndex: number): VelocityClassification {
  if (velocityIndex >= VELOCITY_CLASSIFICATION_THRESHOLDS.ON_FIRE) return 'On Fire';
  if (velocityIndex >= VELOCITY_CLASSIFICATION_THRESHOLDS.HOT) return 'Hot';
  if (velocityIndex >= VELOCITY_CLASSIFICATION_THRESHOLDS.WARM) return 'Warm';
  if (velocityIndex >= VELOCITY_CLASSIFICATION_THRESHOLDS.BALANCED) return 'Balanced';
  if (velocityIndex >= VELOCITY_CLASSIFICATION_THRESHOLDS.COOL) return 'Cool';
  return 'Cold';
}

/**
 * Convert database row to MarketVelocityIndex
 */
export function rowToMarketVelocityIndex(row: MarketVelocityIndexRow): MarketVelocityIndex {
  return {
    zipCode: row.zip_code,
    geoId: row.geo_id ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    county: row.county ?? undefined,
    daysOnMarketScore: row.days_on_market_score ?? 0,
    absorptionScore: row.absorption_score ?? 0,
    inventoryScore: row.inventory_score ?? 0,
    permitActivityScore: row.permit_activity_score ?? 0,
    investmentConvictionScore: row.investment_conviction_score ?? 0,
    avgDaysOnMarket: row.avg_days_on_market ?? 0,
    medianDaysOnMarket: row.median_days_on_market ?? 0,
    absorptionRate: row.absorption_rate ?? 0,
    monthsOfInventory: row.months_of_inventory ?? 0,
    totalListings: row.total_listings ?? 0,
    permitVolume: row.permit_volume ?? 0,
    permitValueTotal: row.permit_value_total ?? 0,
    velocityIndex: row.velocity_index,
    classification: row.classification as VelocityClassification,
    velocityTrend: row.velocity_trend as VelocityTrend | undefined,
    velocityChange: row.velocity_change ?? undefined,
    centerLat: row.center_lat ?? undefined,
    centerLng: row.center_lng ?? undefined,
    calculatedAt: row.calculated_at,
    dataFreshness: {
      rentcastLastUpdated: row.rentcast_data_date ?? undefined,
      shovelsLastUpdated: row.shovels_data_date ?? undefined,
    },
  };
}
