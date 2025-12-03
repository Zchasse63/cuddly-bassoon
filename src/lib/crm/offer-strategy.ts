/**
 * Tiered Offer Strategy Engine
 * Calculates optimal, target, maximum, and walk-away prices
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { OfferStrategy, CreateOfferStrategyInput } from './types';

export interface OfferStrategyInput {
  arv: number; // After Repair Value
  estimatedRepairs: number; // Repair costs
  wholesaleFee?: number; // Desired wholesale fee (default 10k)
  buyerMargin?: number; // Buyer's required margin (default 25%)
  holdingCosts?: number; // Monthly holding costs
  closingCosts?: number; // Estimated closing costs
  marketCondition?: 'hot' | 'normal' | 'cold';
  motivationLevel?: 'hot' | 'warm' | 'cold';
}

export interface CalculatedStrategy {
  optimal_price: number;
  target_price: number;
  maximum_price: number;
  walk_away_price: number;
  breakdown: {
    arv: number;
    repairs: number;
    buyerMargin: number;
    wholesaleFee: number;
    holdingCosts: number;
    closingCosts: number;
    totalCosts: number;
    profitMargin: number;
    marketAdjustment: number;
  };
  negotiation_tips: string[];
}

/**
 * Calculate tiered offer strategy
 */
export function calculateOfferStrategy(input: OfferStrategyInput): CalculatedStrategy {
  const {
    arv,
    estimatedRepairs,
    wholesaleFee = 10000,
    buyerMargin = 0.25,
    holdingCosts = 0,
    closingCosts = arv * 0.03,
    marketCondition = 'normal',
    motivationLevel = 'warm',
  } = input;

  // Calculate buyer's maximum allowable offer (MAO)
  const buyerMAO = arv * (1 - buyerMargin) - estimatedRepairs - holdingCosts - closingCosts;

  // Our maximum is buyer's MAO minus our fee
  const baseMax = buyerMAO - wholesaleFee;

  // Market condition adjustments
  const marketMultiplier = {
    hot: 1.05, // Can pay more in hot markets
    normal: 1.0,
    cold: 0.9, // Need bigger spreads in cold markets
  }[marketCondition];

  // Motivation adjustments
  const motivationDiscount = {
    hot: 0.85, // Highly motivated sellers accept less
    warm: 0.9,
    cold: 0.95, // Less motivated need closer to asking
  }[motivationLevel];

  // Calculate tiered prices
  const optimalPrice = Math.round(baseMax * 0.7 * motivationDiscount);
  const targetPrice = Math.round(baseMax * 0.8 * motivationDiscount);
  const maximumPrice = Math.round(baseMax * 0.9 * marketMultiplier);
  const walkAwayPrice = Math.round(baseMax * 0.95);

  // Generate negotiation tips
  const negotiation_tips = generateNegotiationTips(
    optimalPrice,
    targetPrice,
    maximumPrice,
    motivationLevel,
    marketCondition
  );

  return {
    optimal_price: Math.max(optimalPrice, 0),
    target_price: Math.max(targetPrice, 0),
    maximum_price: Math.max(maximumPrice, 0),
    walk_away_price: Math.max(walkAwayPrice, 0),
    breakdown: {
      arv,
      repairs: estimatedRepairs,
      buyerMargin: arv * buyerMargin,
      wholesaleFee,
      holdingCosts,
      closingCosts,
      totalCosts: estimatedRepairs + holdingCosts + closingCosts + wholesaleFee,
      profitMargin: buyerMargin,
      marketAdjustment: marketMultiplier,
    },
    negotiation_tips,
  };
}

function generateNegotiationTips(
  optimal: number,
  target: number,
  max: number,
  motivation: string,
  market: string
): string[] {
  const tips: string[] = [];

  tips.push(
    `Start at $${optimal.toLocaleString()} (optimal) and work up to $${target.toLocaleString()} (target)`
  );

  if (motivation === 'hot') {
    tips.push('Seller shows high motivation - emphasize speed and certainty of close');
    tips.push('Consider offering quick close (7-14 days) for lower price');
  } else if (motivation === 'cold') {
    tips.push('Seller not highly motivated - focus on building relationship first');
    tips.push('May need multiple follow-ups before serious negotiation');
  }

  if (market === 'hot') {
    tips.push('Competitive market - be prepared to move quickly on good deals');
  } else if (market === 'cold') {
    tips.push("Buyer's market - plenty of inventory, maintain firm pricing");
  }

  tips.push(`Walk away at $${max.toLocaleString()} - no deal is worth negative margin`);

  return tips;
}

export class OfferStrategyService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async saveStrategy(
    dealId: string,
    userId: string,
    strategy: CreateOfferStrategyInput
  ): Promise<OfferStrategy> {
    const { data, error } = await this.supabase
      .from('offer_strategies')
      .upsert({
        deal_id: dealId,
        user_id: userId,
        optimal_price: strategy.optimal_price,
        target_price: strategy.target_price,
        maximum_price: strategy.maximum_price,
        walk_away_price: strategy.walk_away_price,
        arv: strategy.arv,
        repair_estimate: strategy.repair_estimate,
        profit_margin: strategy.profit_margin,
        market_factor: strategy.market_factor,
        strategy_reasoning: strategy.strategy_reasoning,
        negotiation_tips: strategy.negotiation_tips,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save strategy: ${error.message}`);
    }

    return data as OfferStrategy;
  }

  async getStrategy(dealId: string): Promise<OfferStrategy | null> {
    const { data, error } = await this.supabase
      .from('offer_strategies')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get strategy: ${error.message}`);
    }

    return data as OfferStrategy;
  }
}
