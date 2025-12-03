/**
 * Free & Clear Filter
 * Identifies properties with no mortgage (100% equity)
 */

import type { PropertyData, FilterMatch } from '../types';

export interface FreeClearParams {
  // No configurable parameters
}

/**
 * Check if property is free and clear (no mortgage)
 */
export function applyFreeClearFilter(
  property: PropertyData,
  _params: FreeClearParams = {}
): FilterMatch {
  // Check if equity percent indicates free & clear
  if (property.equityPercent !== null && property.equityPercent !== undefined) {
    if (property.equityPercent >= 100) {
      return {
        filterId: 'free_clear',
        matched: true,
        score: 100,
        reason: 'Property has 100% equity (no mortgage)',
        data: {
          equityPercent: property.equityPercent,
          estimatedValue: property.estimatedValue,
        },
      };
    }
  }

  // Check mortgage balance directly
  if (property.mortgageBalance !== null && property.mortgageBalance !== undefined) {
    if (property.mortgageBalance <= 0) {
      return {
        filterId: 'free_clear',
        matched: true,
        score: 100,
        reason: 'Property has zero mortgage balance',
        data: {
          mortgageBalance: property.mortgageBalance,
          estimatedValue: property.estimatedValue,
        },
      };
    }

    // Has mortgage
    return {
      filterId: 'free_clear',
      matched: false,
      score: 0,
      reason: `Property has mortgage balance of $${property.mortgageBalance.toLocaleString()}`,
      data: {
        mortgageBalance: property.mortgageBalance,
      },
    };
  }

  // Check if equity amount equals estimated value
  if (property.equityAmount && property.estimatedValue) {
    const equityRatio = property.equityAmount / property.estimatedValue;
    if (equityRatio >= 0.99) { // Allow small rounding differences
      return {
        filterId: 'free_clear',
        matched: true,
        score: 95,
        reason: 'Equity amount equals property value (likely no mortgage)',
        data: {
          equityAmount: property.equityAmount,
          estimatedValue: property.estimatedValue,
        },
      };
    }
  }

  // Cannot determine
  return {
    filterId: 'free_clear',
    matched: false,
    score: 0,
    reason: 'Unable to determine mortgage status (missing data)',
  };
}

