/**
 * Shrinking Landlord Filter
 * Identifies owners who have been selling off their rental portfolio
 * These owners may be looking to exit real estate entirely
 */

import type { PropertyData, FilterMatch } from '../types';

export interface ShrinkingLandlordParams {
  minRecentSales?: number;
  lookbackMonths?: number;
}

const DEFAULT_MIN_RECENT_SALES = 1;
const DEFAULT_LOOKBACK_MONTHS = 24;

/**
 * Extended property data with owner portfolio history
 */
export interface PropertyWithPortfolioHistory extends PropertyData {
  ownerRecentSales?: number;
  ownerRecentSalesDates?: string[];
  ownerCurrentPortfolioSize?: number;
  ownerPreviousPortfolioSize?: number;
  ownerSoldProperties?: Array<{
    address: string;
    saleDate: string;
    salePrice?: number;
  }>;
}

/**
 * Check if owner is shrinking their portfolio
 */
export function applyShrinkingLandlordFilter(
  property: PropertyWithPortfolioHistory,
  params: ShrinkingLandlordParams = {}
): FilterMatch {
  const minSales = params.minRecentSales ?? DEFAULT_MIN_RECENT_SALES;
  const lookbackMonths = params.lookbackMonths ?? DEFAULT_LOOKBACK_MONTHS;
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - lookbackMonths);

  // Check explicit recent sales count
  if (property.ownerRecentSales !== undefined) {
    if (property.ownerRecentSales >= minSales) {
      // Calculate portfolio reduction if available
      let portfolioReduction: number | undefined;
      if (property.ownerPreviousPortfolioSize && property.ownerCurrentPortfolioSize) {
        portfolioReduction = property.ownerPreviousPortfolioSize - property.ownerCurrentPortfolioSize;
      }

      const score = Math.min(100, 70 + property.ownerRecentSales * 10);

      return {
        filterId: 'shrinking_landlord',
        matched: true,
        score,
        reason: `Owner has sold ${property.ownerRecentSales} properties in the last ${lookbackMonths} months`,
        data: {
          recentSales: property.ownerRecentSales,
          portfolioReduction,
          currentPortfolioSize: property.ownerCurrentPortfolioSize,
          soldProperties: property.ownerSoldProperties,
        },
      };
    }

    return {
      filterId: 'shrinking_landlord',
      matched: false,
      score: 0,
      reason: `Owner recent sales (${property.ownerRecentSales}) below threshold (${minSales})`,
    };
  }

  // Check sold properties list
  if (property.ownerSoldProperties && property.ownerSoldProperties.length > 0) {
    const recentSales = property.ownerSoldProperties.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      return saleDate >= cutoffDate;
    });

    if (recentSales.length >= minSales) {
      return {
        filterId: 'shrinking_landlord',
        matched: true,
        score: 80,
        reason: `Owner sold ${recentSales.length} properties recently`,
        data: {
          recentSales: recentSales.length,
          soldProperties: recentSales,
        },
      };
    }
  }

  // Check for portfolio size reduction
  if (property.ownerPreviousPortfolioSize && property.ownerCurrentPortfolioSize) {
    if (property.ownerCurrentPortfolioSize < property.ownerPreviousPortfolioSize) {
      const reduction = property.ownerPreviousPortfolioSize - property.ownerCurrentPortfolioSize;
      
      return {
        filterId: 'shrinking_landlord',
        matched: true,
        score: 75,
        reason: `Owner portfolio shrunk from ${property.ownerPreviousPortfolioSize} to ${property.ownerCurrentPortfolioSize}`,
        data: {
          portfolioReduction: reduction,
          previousSize: property.ownerPreviousPortfolioSize,
          currentSize: property.ownerCurrentPortfolioSize,
        },
      };
    }
  }

  return {
    filterId: 'shrinking_landlord',
    matched: false,
    score: 0,
    reason: 'No evidence of portfolio reduction (owner sales data not available)',
  };
}

