/**
 * Negative Momentum Filter
 * Identifies properties with declining values (year over year)
 * Owners of depreciating assets may be motivated to sell
 */

import type { PropertyData, FilterMatch } from '../types';

export interface NegativeMomentumParams {
  minDeclinePercent?: number;
}

const DEFAULT_MIN_DECLINE_PERCENT = 0; // Any decline qualifies

/**
 * Extended property data with value history
 */
export interface PropertyWithValueHistory extends PropertyData {
  estimatedValuePrior?: number;
  valueHistory?: Array<{
    date: string;
    value: number;
  }>;
  yearOverYearChange?: number;
}

/**
 * Calculate year-over-year value change percentage
 */
function calculateValueChange(current: number, prior: number): number {
  if (prior <= 0) return 0;
  return ((current - prior) / prior) * 100;
}

/**
 * Check if property has declining value
 */
export function applyNegativeMomentumFilter(
  property: PropertyWithValueHistory,
  params: NegativeMomentumParams = {}
): FilterMatch {
  const minDecline = params.minDeclinePercent ?? DEFAULT_MIN_DECLINE_PERCENT;

  // Use pre-calculated YoY change if available
  if (property.yearOverYearChange !== undefined && property.yearOverYearChange !== null) {
    if (property.yearOverYearChange < -minDecline) {
      const declinePercent = Math.abs(property.yearOverYearChange);
      const score = Math.min(100, 70 + declinePercent * 2);

      return {
        filterId: 'negative_momentum',
        matched: true,
        score: Math.round(score),
        reason: `Property value declined ${declinePercent.toFixed(1)}% year-over-year`,
        data: {
          yearOverYearChange: property.yearOverYearChange,
          currentValue: property.estimatedValue,
        },
      };
    }

    return {
      filterId: 'negative_momentum',
      matched: false,
      score: 0,
      reason: property.yearOverYearChange >= 0
        ? `Property value increased ${property.yearOverYearChange.toFixed(1)}%`
        : `Decline of ${Math.abs(property.yearOverYearChange).toFixed(1)}% below threshold`,
    };
  }

  // Calculate from current and prior values
  const currentValue = property.estimatedValue;
  const priorValue = property.estimatedValuePrior;

  if (!currentValue) {
    return {
      filterId: 'negative_momentum',
      matched: false,
      score: 0,
      reason: 'Current estimated value not available',
    };
  }

  if (!priorValue) {
    // Check value history
    if (property.valueHistory && property.valueHistory.length >= 2) {
      const sorted = [...property.valueHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Get values approximately 1 year apart
      const latest = sorted[0]!;
      const oneYearAgo = new Date(latest.date);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const priorEntry = sorted.find((entry) => {
        const entryDate = new Date(entry.date);
        const diffDays = Math.abs(oneYearAgo.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 90; // Within 90 days of 1 year ago
      });

      if (priorEntry) {
        const change = calculateValueChange(latest.value, priorEntry.value);

        if (change < -minDecline) {
          const score = Math.min(100, 70 + Math.abs(change) * 2);

          return {
            filterId: 'negative_momentum',
            matched: true,
            score: Math.round(score),
            reason: `Value declined ${Math.abs(change).toFixed(1)}% from ${new Date(priorEntry.date).toLocaleDateString()}`,
            data: {
              currentValue: latest.value,
              priorValue: priorEntry.value,
              changePercent: change,
            },
          };
        }
      }
    }

    return {
      filterId: 'negative_momentum',
      matched: false,
      score: 0,
      reason: 'Prior year value not available for comparison',
    };
  }

  // Calculate change
  const change = calculateValueChange(currentValue, priorValue);

  if (change < -minDecline) {
    const score = Math.min(100, 70 + Math.abs(change) * 2);

    return {
      filterId: 'negative_momentum',
      matched: true,
      score: Math.round(score),
      reason: `Property value declined ${Math.abs(change).toFixed(1)}% year-over-year`,
      data: {
        currentValue,
        priorValue,
        changePercent: change,
        declineAmount: priorValue - currentValue,
      },
    };
  }

  return {
    filterId: 'negative_momentum',
    matched: false,
    score: 0,
    reason: change >= 0
      ? `Property value increased ${change.toFixed(1)}%`
      : `Decline of ${Math.abs(change).toFixed(1)}% below ${minDecline}% threshold`,
    data: { changePercent: change },
  };
}

