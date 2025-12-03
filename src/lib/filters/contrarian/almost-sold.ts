/**
 * Almost Sold Filter
 * Identifies properties where a deal fell through (under contract, then cancelled)
 * These sellers are often highly motivated
 */

import type { PropertyData, FilterMatch } from '../types';

export interface AlmostSoldParams {
  lookbackMonths?: number;
}

const DEFAULT_LOOKBACK_MONTHS = 6;

/**
 * Extended property data with transaction history
 */
export interface PropertyWithTransactionHistory extends PropertyData {
  pendingCancelledDate?: string;
  wasUnderContract?: boolean;
  contractCancelReason?: string;
  listingHistory?: Array<{
    status: string;
    date: string;
    price?: number;
  }>;
}

/**
 * Check if property had a deal fall through recently
 */
export function applyAlmostSoldFilter(
  property: PropertyWithTransactionHistory,
  params: AlmostSoldParams = {}
): FilterMatch {
  const lookbackMonths = params.lookbackMonths ?? DEFAULT_LOOKBACK_MONTHS;
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - lookbackMonths);

  // Check explicit pending cancelled flag
  if (property.wasUnderContract && property.pendingCancelledDate) {
    const cancelDate = new Date(property.pendingCancelledDate);
    
    if (cancelDate >= cutoffDate) {
      const daysSinceCancel = Math.floor(
        (Date.now() - cancelDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // More recent = higher score
      const score = Math.round(95 - (daysSinceCancel / 30) * 5);

      return {
        filterId: 'almost_sold',
        matched: true,
        score: Math.max(70, score),
        reason: `Contract cancelled ${daysSinceCancel} days ago`,
        data: {
          pendingCancelledDate: property.pendingCancelledDate,
          cancelReason: property.contractCancelReason,
          daysSinceCancel,
        },
      };
    }
  }

  // Check listing history for pending -> cancelled/expired pattern
  if (property.listingHistory && property.listingHistory.length > 1) {
    const sortedHistory = [...property.listingHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = sortedHistory[i]!;
      const previous = sortedHistory[i + 1]!;

      const currentStatus = current.status.toLowerCase();
      const previousStatus = previous.status.toLowerCase();

      // Look for pending -> cancelled/withdrawn/expired pattern
      const wasPending = previousStatus.includes('pending') || 
                         previousStatus.includes('under contract');
      const nowCancelled = currentStatus.includes('cancel') || 
                          currentStatus.includes('withdrawn') ||
                          currentStatus.includes('expired') ||
                          currentStatus.includes('back on market');

      if (wasPending && nowCancelled) {
        const transitionDate = new Date(current.date);
        
        if (transitionDate >= cutoffDate) {
          return {
            filterId: 'almost_sold',
            matched: true,
            score: 85,
            reason: `Property went from "${previous.status}" to "${current.status}"`,
            data: {
              previousStatus: previous.status,
              currentStatus: current.status,
              transitionDate: current.date,
            },
          };
        }
      }
    }
  }

  // Check current listing status for back on market indicators
  if (property.listingStatus) {
    const status = property.listingStatus.toLowerCase();
    
    if (status.includes('back on market') || status.includes('bom')) {
      return {
        filterId: 'almost_sold',
        matched: true,
        score: 80,
        reason: 'Property is back on market (previous deal likely fell through)',
        data: {
          listingStatus: property.listingStatus,
          listingDate: property.listingDate,
        },
      };
    }
  }

  return {
    filterId: 'almost_sold',
    matched: false,
    score: 0,
    reason: 'No evidence of cancelled contract or failed sale',
  };
}

