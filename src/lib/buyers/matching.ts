/**
 * Buyer-Deal Matching Engine
 * Match properties to buyers based on preferences
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { BuyerWithDetails, BuyerMatchResult, BuyerPreferences, MatchFactor } from './types';

export interface PropertyForMatching {
  id: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  asking_price?: number;
  arv?: number;
  estimated_repair_cost?: number;
  condition?: string;
}

export interface MatchCriteria {
  minMatchScore?: number;  // Minimum score to include (0-100)
  maxResults?: number;     // Maximum buyers to return
  tierFilter?: ('A' | 'B' | 'C')[];  // Filter by tier
  activeOnly?: boolean;    // Only active buyers
}

// Re-export MatchFactor for convenience
export type { MatchFactor } from './types';

export class MatchingEngine {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Find matching buyers for a property
   */
  async matchBuyersToProperty(
    property: PropertyForMatching,
    userId: string,
    criteria: MatchCriteria = {}
  ): Promise<BuyerMatchResult[]> {
    const { minMatchScore = 50, maxResults = 20, tierFilter, activeOnly = true } = criteria;

    // Fetch buyers with preferences
    let query = this.supabase
      .from('buyers')
      .select(`
        *,
        buyer_preferences (*)
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false);

    if (activeOnly) {
      query = query.in('status', ['active', 'qualified']);
    }

    const { data: buyers, error } = await query;
    if (error) throw new Error(`Failed to fetch buyers: ${error.message}`);

    // Score each buyer
    const results: BuyerMatchResult[] = [];

    for (const buyer of buyers || []) {
      // buyer_preferences is an array from the join
      const prefsArray = buyer.buyer_preferences as unknown as Array<BuyerPreferences> | null;
      const preferences = prefsArray?.[0];
      const { score, factors } = this.calculateMatchScore(property, preferences);

      // Apply tier filter
      if (tierFilter && buyer.tier && !tierFilter.includes(buyer.tier as 'A' | 'B' | 'C')) {
        continue;
      }

      // Apply minimum score filter
      if (score >= minMatchScore) {
        results.push({
          buyer: buyer as unknown as BuyerWithDetails,
          matchScore: score,
          matchFactors: factors,
        });
      }
    }

    // Sort by score descending and limit results
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  /**
   * Calculate match score between property and buyer preferences
   */
  calculateMatchScore(
    property: PropertyForMatching,
    preferences?: BuyerPreferences | null
  ): { score: number; factors: MatchFactor[] } {
    const factors: MatchFactor[] = [];

    if (!preferences) {
      return {
        score: 50, // Base score for buyers without preferences
        factors: [{ factor: 'preferences', score: 50, maxScore: 100, reason: 'No preferences set' }],
      };
    }

    // Price Range Match (30 points max)
    const priceScore = this.scorePriceMatch(property, preferences);
    factors.push(priceScore);

    // Property Type Match (20 points max)
    const typeScore = this.scorePropertyTypeMatch(property, preferences);
    factors.push(typeScore);

    // Bedroom Match (15 points max)
    const bedroomScore = this.scoreBedroomMatch(property, preferences);
    factors.push(bedroomScore);

    // Condition/Rehab Match (20 points max)
    const conditionScore = this.scoreConditionMatch(property, preferences);
    factors.push(conditionScore);

    // ROI Match (15 points max)
    const roiScore = this.scoreROIMatch(property, preferences);
    factors.push(roiScore);

    // Calculate total score
    const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
    const maxPossible = factors.reduce((sum, f) => sum + f.maxScore, 0);
    const normalizedScore = Math.round((totalScore / maxPossible) * 100);

    return { score: normalizedScore, factors };
  }

  private scorePriceMatch(property: PropertyForMatching, prefs: BuyerPreferences): MatchFactor {
    const maxScore = 30;
    const price = property.asking_price;

    if (!price) {
      return { factor: 'price', score: maxScore * 0.5, maxScore, reason: 'No price available' };
    }

    const min = prefs.price_range_min;
    const max = prefs.price_range_max;

    if (!min && !max) {
      return { factor: 'price', score: maxScore, maxScore, reason: 'No price preference' };
    }

    if (min && price < min) {
      const diff = ((min - price) / min) * 100;
      if (diff > 30) return { factor: 'price', score: 0, maxScore, reason: 'Below min price range' };
      return { factor: 'price', score: maxScore * 0.5, maxScore, reason: 'Slightly below range' };
    }

    if (max && price > max) {
      const diff = ((price - max) / max) * 100;
      if (diff > 30) return { factor: 'price', score: 0, maxScore, reason: 'Above max price range' };
      return { factor: 'price', score: maxScore * 0.5, maxScore, reason: 'Slightly above range' };
    }

    return { factor: 'price', score: maxScore, maxScore, reason: 'Within price range' };
  }

  private scorePropertyTypeMatch(property: PropertyForMatching, prefs: BuyerPreferences): MatchFactor {
    const maxScore = 20;
    const types = prefs.property_types as string[] | null;

    if (!types || types.length === 0) {
      return { factor: 'type', score: maxScore, maxScore, reason: 'No type preference' };
    }

    if (!property.property_type) {
      return { factor: 'type', score: maxScore * 0.5, maxScore, reason: 'Unknown property type' };
    }

    const match = types.some(
      (t) => t.toLowerCase() === property.property_type?.toLowerCase()
    );

    return match
      ? { factor: 'type', score: maxScore, maxScore, reason: 'Property type matches' }
      : { factor: 'type', score: 0, maxScore, reason: 'Property type not preferred' };
  }

  private scoreBedroomMatch(property: PropertyForMatching, prefs: BuyerPreferences): MatchFactor {
    const maxScore = 15;
    const beds = property.bedrooms;

    if (!beds) {
      return { factor: 'bedrooms', score: maxScore * 0.5, maxScore, reason: 'Unknown bedrooms' };
    }

    const min = prefs.bedroom_min;
    const max = prefs.bedroom_max;

    if (!min && !max) {
      return { factor: 'bedrooms', score: maxScore, maxScore, reason: 'No bedroom preference' };
    }

    if ((min && beds < min) || (max && beds > max)) {
      return { factor: 'bedrooms', score: 0, maxScore, reason: 'Outside bedroom range' };
    }

    return { factor: 'bedrooms', score: maxScore, maxScore, reason: 'Bedroom count matches' };
  }

  private scoreConditionMatch(property: PropertyForMatching, prefs: BuyerPreferences): MatchFactor {
    const maxScore = 20;
    const tolerance = prefs.condition_tolerance;
    const repairCost = property.estimated_repair_cost;

    if (!tolerance) {
      return { factor: 'condition', score: maxScore, maxScore, reason: 'No condition preference' };
    }

    if (!repairCost) {
      return { factor: 'condition', score: maxScore * 0.5, maxScore, reason: 'Unknown repair cost' };
    }

    // Map tolerance to max repair budget
    const toleranceMap: Record<string, number> = {
      turnkey: 5000,
      light_rehab: 25000,
      moderate_rehab: 75000,
      heavy_rehab: 150000,
      gut: Infinity,
    };

    const maxRepair = toleranceMap[tolerance] || Infinity;
    if (repairCost <= maxRepair) {
      return { factor: 'condition', score: maxScore, maxScore, reason: 'Within rehab tolerance' };
    }

    return { factor: 'condition', score: 0, maxScore, reason: 'Exceeds rehab tolerance' };
  }

  private scoreROIMatch(property: PropertyForMatching, prefs: BuyerPreferences): MatchFactor {
    const maxScore = 15;
    const preferredROI = prefs.preferred_roi_percent;

    if (!preferredROI) {
      return { factor: 'roi', score: maxScore, maxScore, reason: 'No ROI preference' };
    }

    const { asking_price, arv, estimated_repair_cost } = property;
    if (!asking_price || !arv) {
      return { factor: 'roi', score: maxScore * 0.5, maxScore, reason: 'Cannot calculate ROI' };
    }

    const totalCost = asking_price + (estimated_repair_cost || 0);
    const profit = arv - totalCost;
    const roi = (profit / totalCost) * 100;

    if (roi >= preferredROI) {
      return { factor: 'roi', score: maxScore, maxScore, reason: `ROI ${roi.toFixed(1)}% meets target` };
    }

    if (roi >= preferredROI * 0.7) {
      return { factor: 'roi', score: maxScore * 0.5, maxScore, reason: `ROI ${roi.toFixed(1)}% close to target` };
    }

    return { factor: 'roi', score: 0, maxScore, reason: `ROI ${roi.toFixed(1)}% below target` };
  }
}

