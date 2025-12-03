/**
 * Buyer Scoring Algorithm
 * Calculate buyer scores and tiers based on activity and reliability
 */

import type { BuyerWithDetails, BuyerTier, BuyerScoreFactors } from './types';
import type { TransactionAnalysis } from './transaction-service';

// Scoring weights
const WEIGHTS = {
  transactionVolume: 25,    // Up to 25 points for transaction history
  transactionRecency: 20,   // Up to 20 points for recent activity
  responseRate: 15,         // Up to 15 points for communication
  closingRate: 20,          // Up to 20 points for deal completion
  proofOfFunds: 10,         // 10 points for verified POF
  profileComplete: 10,      // Up to 10 points for complete profile
};

// Tier thresholds
const TIER_THRESHOLDS = {
  A: 80,  // 80+ = Tier A
  B: 50,  // 50-79 = Tier B
  C: 0,   // 0-49 = Tier C
};

export interface ScoringInput {
  buyer: BuyerWithDetails;
  transactionAnalysis?: TransactionAnalysis;
  responseRate?: number;      // 0-100
  closingRate?: number;       // 0-100
  hasVerifiedPOF?: boolean;
}

export interface ScoringResult {
  score: number;
  tier: BuyerTier;
  factors: BuyerScoreFactors;
  recommendations: string[];
}

/**
 * Calculate buyer score
 */
export function calculateBuyerScore(input: ScoringInput): ScoringResult {
  const factors: BuyerScoreFactors = {
    transactionVolume: 0,
    transactionRecency: 0,
    responseRate: 0,
    closingRate: 0,
    proofOfFunds: 0,
    profileComplete: 0,
  };

  const recommendations: string[] = [];

  // Transaction Volume Score (0-25 points)
  // 5+ transactions = full points, scales linearly
  if (input.transactionAnalysis) {
    const txCount = input.transactionAnalysis.totalTransactions;
    factors.transactionVolume = Math.min(txCount * 5, WEIGHTS.transactionVolume);
    
    if (txCount === 0) {
      recommendations.push('Add transaction history to improve score');
    }
  } else {
    recommendations.push('Import transaction history for better scoring');
  }

  // Transaction Recency Score (0-20 points)
  // Full points if transaction in last 30 days, decreases over time
  if (input.transactionAnalysis?.lastTransaction) {
    const lastTx = new Date(input.transactionAnalysis.lastTransaction);
    const daysSince = Math.floor((Date.now() - lastTx.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince <= 30) {
      factors.transactionRecency = WEIGHTS.transactionRecency;
    } else if (daysSince <= 90) {
      factors.transactionRecency = WEIGHTS.transactionRecency * 0.75;
    } else if (daysSince <= 180) {
      factors.transactionRecency = WEIGHTS.transactionRecency * 0.5;
    } else if (daysSince <= 365) {
      factors.transactionRecency = WEIGHTS.transactionRecency * 0.25;
    } else {
      recommendations.push('Recent transaction activity would improve score');
    }
  }

  // Response Rate Score (0-15 points)
  if (input.responseRate !== undefined) {
    factors.responseRate = (input.responseRate / 100) * WEIGHTS.responseRate;
    if (input.responseRate < 50) {
      recommendations.push('Improve response rate to communications');
    }
  }

  // Closing Rate Score (0-20 points)
  if (input.closingRate !== undefined) {
    factors.closingRate = (input.closingRate / 100) * WEIGHTS.closingRate;
    if (input.closingRate < 50) {
      recommendations.push('Higher deal closing rate would improve tier');
    }
  }

  // Proof of Funds Score (0 or 10 points)
  if (input.hasVerifiedPOF) {
    factors.proofOfFunds = WEIGHTS.proofOfFunds;
  } else {
    recommendations.push('Submit proof of funds for verification');
  }

  // Profile Completeness Score (0-10 points)
  let profilePoints = 0;
  const buyer = input.buyer;
  if (buyer.name) profilePoints += 2;
  if (buyer.email) profilePoints += 2;
  if (buyer.phone) profilePoints += 2;
  if (buyer.buyer_type) profilePoints += 2;
  if (buyer.preferences) profilePoints += 2;
  factors.profileComplete = Math.min(profilePoints, WEIGHTS.profileComplete);
  
  if (profilePoints < WEIGHTS.profileComplete) {
    recommendations.push('Complete buyer profile for better matching');
  }

  // Calculate total score
  const score = Math.round(
    factors.transactionVolume +
    factors.transactionRecency +
    factors.responseRate +
    factors.closingRate +
    factors.proofOfFunds +
    factors.profileComplete
  );

  // Determine tier
  let tier: BuyerTier = 'C';
  if (score >= TIER_THRESHOLDS.A) {
    tier = 'A';
  } else if (score >= TIER_THRESHOLDS.B) {
    tier = 'B';
  }

  return {
    score,
    tier,
    factors,
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
  };
}

/**
 * Get tier description
 */
export function getTierDescription(tier: BuyerTier): string {
  switch (tier) {
    case 'A':
      return 'Premium buyer - High activity, verified, priority matching';
    case 'B':
      return 'Active buyer - Good history, regular engagement';
    case 'C':
      return 'New/Inactive buyer - Needs qualification or re-engagement';
    default:
      return 'Unknown tier';
  }
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: BuyerTier): string {
  switch (tier) {
    case 'A':
      return 'green';
    case 'B':
      return 'yellow';
    case 'C':
      return 'gray';
    default:
      return 'gray';
  }
}

