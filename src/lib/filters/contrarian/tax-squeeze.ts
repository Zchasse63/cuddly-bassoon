/**
 * Tax Squeeze Filter
 * Identifies properties with significant property tax increases (>20% YoY)
 * Rising taxes can squeeze landlord margins and create motivation to sell
 */

import type { PropertyData, FilterMatch } from '../types';

export interface TaxSqueezeParams {
  minTaxIncreasePercent?: number;
}

const DEFAULT_MIN_TAX_INCREASE = 20;

/**
 * Extended property data with tax history
 */
export interface PropertyWithTaxHistory extends PropertyData {
  taxAmountCurrent?: number;
  taxAmountPriorYear?: number;
  taxHistory?: Array<{
    year: number;
    amount: number;
  }>;
  assessedValueCurrent?: number;
  assessedValuePrior?: number;
}

/**
 * Calculate year-over-year tax increase percentage
 */
function calculateTaxIncrease(current: number, prior: number): number {
  if (prior <= 0) return 0;
  return ((current - prior) / prior) * 100;
}

/**
 * Check if property has significant tax increase
 */
export function applyTaxSqueezeFilter(
  property: PropertyWithTaxHistory,
  params: TaxSqueezeParams = {}
): FilterMatch {
  const minIncrease = params.minTaxIncreasePercent ?? DEFAULT_MIN_TAX_INCREASE;

  // Get current and prior tax amounts
  const currentTax = property.taxAmountCurrent || property.taxAmount;
  const priorTax = property.taxAmountPriorYear || property.taxAmountPrior;

  if (!currentTax) {
    return {
      filterId: 'tax_squeeze',
      matched: false,
      score: 0,
      reason: 'Current tax amount not available',
    };
  }

  if (!priorTax) {
    // Check tax history array
    if (property.taxHistory && property.taxHistory.length >= 2) {
      const sorted = [...property.taxHistory].sort((a, b) => b.year - a.year);
      const current = sorted[0]!;
      const prior = sorted[1]!;

      const increase = calculateTaxIncrease(current.amount, prior.amount);

      if (increase >= minIncrease) {
        const score = Math.min(100, 70 + (increase - minIncrease));

        return {
          filterId: 'tax_squeeze',
          matched: true,
          score: Math.round(score),
          reason: `Property taxes increased ${increase.toFixed(1)}% from ${prior.year} to ${current.year}`,
          data: {
            currentYear: current.year,
            currentAmount: current.amount,
            priorYear: prior.year,
            priorAmount: prior.amount,
            increasePercent: increase,
          },
        };
      }

      return {
        filterId: 'tax_squeeze',
        matched: false,
        score: 0,
        reason: `Tax increase of ${increase.toFixed(1)}% is below ${minIncrease}% threshold`,
        data: { increasePercent: increase },
      };
    }

    return {
      filterId: 'tax_squeeze',
      matched: false,
      score: 0,
      reason: 'Prior year tax amount not available',
    };
  }

  // Calculate increase
  const increase = calculateTaxIncrease(currentTax, priorTax);

  if (increase >= minIncrease) {
    const score = Math.min(100, 70 + (increase - minIncrease));

    return {
      filterId: 'tax_squeeze',
      matched: true,
      score: Math.round(score),
      reason: `Property taxes increased ${increase.toFixed(1)}% year-over-year`,
      data: {
        currentTax,
        priorTax,
        increasePercent: increase,
        increaseAmount: currentTax - priorTax,
      },
    };
  }

  return {
    filterId: 'tax_squeeze',
    matched: false,
    score: 0,
    reason: `Tax increase of ${increase.toFixed(1)}% is below ${minIncrease}% threshold`,
    data: {
      currentTax,
      priorTax,
      increasePercent: increase,
    },
  };
}

