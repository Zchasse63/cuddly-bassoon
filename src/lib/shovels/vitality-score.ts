/**
 * Vitality Score Calculation
 * Calculates neighborhood vitality scores based on permit activity
 */

import { createClient } from '@/lib/supabase/server';
import { getCityMetrics, getCountyMetrics } from './client';

// ============================================
// Types
// ============================================

export interface VitalityScoreComponents {
  permitVolumeScore: number; // 30% weight
  yoyGrowthScore: number; // 25% weight
  highValueRatioScore: number; // 20% weight
  improvementRatioScore: number; // 15% weight
  inspectionPassScore: number; // 10% weight
}

export interface VitalityScoreResult {
  geoId: string;
  geoType: 'zip' | 'city' | 'county';
  vitalityScore: number;
  components: VitalityScoreComponents;
  rawMetrics: {
    totalPermits: number;
    permitsCurrentYear: number;
    permitsPriorYear: number;
    yoyGrowthPercent: number;
    highValuePermitCount: number;
    improvementPermitCount: number;
    avgInspectionPassRate: number;
    avgPermitValue: number;
  };
}

// ============================================
// Score Normalization
// ============================================

/**
 * Normalize a value to 0-100 scale.
 */
function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

// ============================================
// Vitality Score Calculation
// ============================================

/**
 * Calculate vitality score for a geographic area.
 */
export async function calculateVitalityScore(
  geoId: string,
  geoType: 'city' | 'county',
  metroAvgPermits?: number
): Promise<VitalityScoreResult> {
  // Fetch metrics from Shovels
  const metrics = geoType === 'city' ? await getCityMetrics(geoId) : await getCountyMetrics(geoId);

  const currentYear = new Date().getFullYear();
  const monthlyData = metrics.metrics.permits_by_month || [];

  // Calculate current year permits
  const permitsCurrentYear = monthlyData
    .filter((m) => m.month.startsWith(String(currentYear)))
    .reduce((sum, m) => sum + m.count, 0);

  // Calculate prior year permits
  const permitsPriorYear = monthlyData
    .filter((m) => m.month.startsWith(String(currentYear - 1)))
    .reduce((sum, m) => sum + m.count, 0);

  // Calculate YoY growth
  const yoyGrowthPercent =
    permitsPriorYear > 0 ? ((permitsCurrentYear - permitsPriorYear) / permitsPriorYear) * 100 : 0;

  // Use metro average or default
  const metroAvg = metroAvgPermits || metrics.metrics.total_permits;

  // Component calculations
  // 1. Permit Volume Score (relative to metro average)
  const permitVolumeRatio =
    metroAvg > 0 ? (metrics.metrics.total_permits / metroAvg) * 100 : 50;
  const permitVolumeScore = Math.min(100, permitVolumeRatio);

  // 2. YoY Growth Score (-50% to +50% mapped to 0-100)
  const yoyGrowthScore = normalizeScore(yoyGrowthPercent, -50, 50);

  // 3. High Value Ratio Score (permits > $50K)
  const avgValue =
    metrics.metrics.permit_value_total / Math.max(1, metrics.metrics.total_permits);
  const highValueRatioScore = normalizeScore(avgValue, 10000, 100000);

  // 4. Improvement Ratio Score (remodel, kitchen, bath, addition permits)
  const improvementRatioScore = 50; // Default - would need tag breakdown

  // 5. Inspection Pass Rate Score
  const inspectionPassScore = metrics.metrics.avg_inspection_pass_rate || 80;

  // Calculate weighted final score
  const vitalityScore =
    permitVolumeScore * 0.3 +
    yoyGrowthScore * 0.25 +
    highValueRatioScore * 0.2 +
    improvementRatioScore * 0.15 +
    inspectionPassScore * 0.1;

  return {
    geoId,
    geoType,
    vitalityScore: Math.round(vitalityScore * 100) / 100,
    components: {
      permitVolumeScore: Math.round(permitVolumeScore * 100) / 100,
      yoyGrowthScore: Math.round(yoyGrowthScore * 100) / 100,
      highValueRatioScore: Math.round(highValueRatioScore * 100) / 100,
      improvementRatioScore: Math.round(improvementRatioScore * 100) / 100,
      inspectionPassScore: Math.round(inspectionPassScore * 100) / 100,
    },
    rawMetrics: {
      totalPermits: metrics.metrics.total_permits,
      permitsCurrentYear,
      permitsPriorYear,
      yoyGrowthPercent: Math.round(yoyGrowthPercent * 100) / 100,
      highValuePermitCount: 0,
      improvementPermitCount: 0,
      avgInspectionPassRate: metrics.metrics.avg_inspection_pass_rate || 0,
      avgPermitValue: Math.round(avgValue),
    },
  };
}

/**
 * Batch calculate vitality scores for multiple areas.
 */
export async function batchCalculateVitalityScores(
  geoIds: Array<{ geoId: string; geoType: 'city' | 'county' }>,
  metroAvgPermits?: number
): Promise<VitalityScoreResult[]> {
  const results: VitalityScoreResult[] = [];

  for (const geo of geoIds) {
    try {
      const score = await calculateVitalityScore(geo.geoId, geo.geoType, metroAvgPermits);
      results.push(score);
    } catch (error) {
      console.error(`Failed to calculate vitality for ${geo.geoId}:`, error);
    }
  }

  return results;
}

/**
 * Store vitality score in database.
 */
export async function storeVitalityScore(score: VitalityScoreResult): Promise<void> {
  const supabase = await createClient();

  await supabase.from('geo_vitality_scores').upsert(
    {
      geo_key: `${score.geoType}:${score.geoId}`,
      geo_type: score.geoType,
      state: score.geoId.split(',')[1]?.trim() || 'Unknown',
      vitality_score: score.vitalityScore,
      permit_volume_score: score.components.permitVolumeScore,
      yoy_growth_score: score.components.yoyGrowthScore,
      high_value_ratio_score: score.components.highValueRatioScore,
      improvement_ratio_score: score.components.improvementRatioScore,
      inspection_pass_score: score.components.inspectionPassScore,
      total_permits: score.rawMetrics.totalPermits,
      permits_last_12_months: score.rawMetrics.permitsCurrentYear,
      permits_prior_12_months: score.rawMetrics.permitsPriorYear,
      yoy_growth_rate: score.rawMetrics.yoyGrowthPercent,
      avg_job_value: score.rawMetrics.avgPermitValue,
      avg_inspection_pass_rate: score.rawMetrics.avgInspectionPassRate,
      calculated_at: new Date().toISOString(),
    },
    { onConflict: 'geo_key' }
  );
}

