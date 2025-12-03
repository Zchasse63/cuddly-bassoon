/**
 * Competitor Exit Filter
 * Identifies properties recently sold by known investors/wholesalers
 * These may be properties that didn't work out for the previous investor
 */

import type { PropertyData, FilterMatch } from '../types';

export interface CompetitorExitParams {
  lookbackMonths?: number;
  knownInvestorPatterns?: string[];
}

const DEFAULT_LOOKBACK_MONTHS = 12;

// Common investor/wholesaler name patterns
const DEFAULT_INVESTOR_PATTERNS = [
  'llc',
  'inc',
  'corp',
  'properties',
  'investments',
  'holdings',
  'capital',
  'ventures',
  'real estate',
  'realty',
  'home buyers',
  'cash buyers',
  'acquisitions',
  'group',
  'partners',
  'fund',
];

/**
 * Extended property data with transaction history
 */
export interface PropertyWithTransactionData extends PropertyData {
  previousOwnerName?: string;
  previousOwnerType?: string;
  previousOwnershipDuration?: number; // months
  transactionHistory?: Array<{
    date: string;
    buyerName?: string;
    sellerName?: string;
    price?: number;
    transactionType?: string;
  }>;
}

/**
 * Check if name matches investor patterns
 */
function isLikelyInvestor(name: string, patterns: string[]): boolean {
  if (!name) return false;
  
  const lowerName = name.toLowerCase();
  return patterns.some((pattern) => lowerName.includes(pattern));
}

/**
 * Check if property was recently sold by an investor
 */
export function applyCompetitorExitFilter(
  property: PropertyWithTransactionData,
  params: CompetitorExitParams = {}
): FilterMatch {
  const lookbackMonths = params.lookbackMonths ?? DEFAULT_LOOKBACK_MONTHS;
  const patterns = params.knownInvestorPatterns ?? DEFAULT_INVESTOR_PATTERNS;
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - lookbackMonths);

  // Check previous owner
  if (property.previousOwnerName) {
    const wasInvestor = isLikelyInvestor(property.previousOwnerName, patterns);
    
    if (wasInvestor) {
      // Check if sale was recent
      if (property.lastSaleDate) {
        const saleDate = new Date(property.lastSaleDate);
        
        if (saleDate >= cutoffDate) {
          // Short hold = likely flip that didn't work
          const holdMonths = property.previousOwnershipDuration || 0;
          let score = 75;
          let reason = `Sold by investor "${property.previousOwnerName}"`;

          if (holdMonths > 0 && holdMonths < 12) {
            score = 90;
            reason += ` after only ${holdMonths} months`;
          } else if (holdMonths >= 12 && holdMonths < 24) {
            score = 80;
            reason += ` after ${holdMonths} months`;
          }

          return {
            filterId: 'competitor_exit',
            matched: true,
            score,
            reason,
            data: {
              previousOwner: property.previousOwnerName,
              holdDuration: holdMonths,
              saleDate: property.lastSaleDate,
            },
          };
        }
      }
    }
  }

  // Check transaction history
  if (property.transactionHistory && property.transactionHistory.length > 0) {
    const recentTransactions = property.transactionHistory.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= cutoffDate;
    });

    for (const tx of recentTransactions) {
      if (tx.sellerName && isLikelyInvestor(tx.sellerName, patterns)) {
        return {
          filterId: 'competitor_exit',
          matched: true,
          score: 80,
          reason: `Recently sold by investor "${tx.sellerName}"`,
          data: {
            sellerName: tx.sellerName,
            transactionDate: tx.date,
            salePrice: tx.price,
          },
        };
      }
    }
  }

  // Check previous owner type
  if (property.previousOwnerType) {
    const type = property.previousOwnerType.toLowerCase();
    
    if (type.includes('investor') || type.includes('company') || type.includes('llc')) {
      if (property.lastSaleDate) {
        const saleDate = new Date(property.lastSaleDate);
        
        if (saleDate >= cutoffDate) {
          return {
            filterId: 'competitor_exit',
            matched: true,
            score: 70,
            reason: `Previous owner type was "${property.previousOwnerType}"`,
            data: {
              previousOwnerType: property.previousOwnerType,
              saleDate: property.lastSaleDate,
            },
          };
        }
      }
    }
  }

  return {
    filterId: 'competitor_exit',
    matched: false,
    score: 0,
    reason: 'No evidence of recent investor/competitor exit',
  };
}

