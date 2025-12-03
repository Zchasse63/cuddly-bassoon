/**
 * Failed Listing Filter
 * Identifies properties with expired or withdrawn listings
 */

import type { PropertyData, FilterMatch } from '../types';

export interface FailedListingParams {
  lookbackMonths?: number;
}

const DEFAULT_LOOKBACK_MONTHS = 12;

/**
 * Check if a date is within the lookback window
 */
function isWithinLookback(dateStr: string | null | undefined, monthsBack: number): boolean {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const lookbackDate = new Date();
  lookbackDate.setMonth(lookbackDate.getMonth() - monthsBack);

  return date >= lookbackDate && date <= now;
}

/**
 * Normalize listing status
 */
function normalizeStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  return status.toLowerCase().trim();
}

/**
 * Check if property has a failed listing
 */
export function applyFailedListingFilter(
  property: PropertyData,
  params: FailedListingParams = {}
): FilterMatch {
  const lookbackMonths = params.lookbackMonths ?? DEFAULT_LOOKBACK_MONTHS;
  const status = normalizeStatus(property.listingStatus);

  // Check for failed listing statuses
  const failedStatuses = ['expired', 'withdrawn', 'cancelled', 'canceled', 'off market'];
  
  if (!status) {
    return {
      filterId: 'failed_listing',
      matched: false,
      score: 0,
      reason: 'No listing status available',
    };
  }

  const isFailed = failedStatuses.some(fs => status.includes(fs));

  if (!isFailed) {
    return {
      filterId: 'failed_listing',
      matched: false,
      score: 0,
      reason: `Listing status "${property.listingStatus}" is not a failed status`,
      data: { listingStatus: property.listingStatus },
    };
  }

  // Check if within lookback period
  if (property.listingDate) {
    if (!isWithinLookback(property.listingDate, lookbackMonths)) {
      return {
        filterId: 'failed_listing',
        matched: false,
        score: 0,
        reason: `Failed listing is older than ${lookbackMonths} months`,
        data: {
          listingStatus: property.listingStatus,
          listingDate: property.listingDate,
        },
      };
    }
  }

  // Calculate score based on recency
  let score = 80;
  if (property.daysOnMarket) {
    // Higher score for properties that were listed longer (more seller motivation)
    if (property.daysOnMarket > 90) score = 95;
    else if (property.daysOnMarket > 60) score = 90;
    else if (property.daysOnMarket > 30) score = 85;
  }

  return {
    filterId: 'failed_listing',
    matched: true,
    score,
    reason: `Property listing ${status} (was on market ${property.daysOnMarket || 'unknown'} days)`,
    data: {
      listingStatus: property.listingStatus,
      listingDate: property.listingDate,
      daysOnMarket: property.daysOnMarket,
    },
  };
}

