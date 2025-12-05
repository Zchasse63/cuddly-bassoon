/**
 * Predictive Analytics Tools
 * AI-powered prediction tools for deal analysis
 *
 * Uses REAL APIs and heuristics:
 * - RentCast for property valuations, owner data, and market conditions
 * - Shovels for permit activity and property condition signals
 * - Supabase for cached property data and geo vitality scores
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { getRentCastClient } from '@/lib/rentcast';
import { getPermitsForAddress, searchAddresses, getCityMetrics } from '@/lib/shovels/client';
import { createClient } from '@/lib/supabase/server';
import {
  buildDealPredictionContext,
  getHistoricalDealCount,
  type DealType,
  type SellerType,
} from '@/lib/deals-rag';

// ============================================================================
// Seller Motivation Score Tool
// ============================================================================
const sellerMotivationInput = z.object({
  propertyId: z.string().optional(),
  address: z.string().optional(),
  includeFactors: z.boolean().default(true),
});

const sellerMotivationOutput = z.object({
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  factors: z.array(z.object({
    name: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral']),
    weight: z.number(),
    description: z.string(),
  })),
  recommendation: z.string(),
});

type SellerMotivationInput = z.infer<typeof sellerMotivationInput>;
type SellerMotivationOutput = z.infer<typeof sellerMotivationOutput>;

const sellerMotivationDefinition: ToolDefinition<SellerMotivationInput, SellerMotivationOutput> = {
  id: 'predict.seller_motivation',
  name: 'Predict Seller Motivation',
  description: 'Analyze property and owner data to predict seller motivation level using real API data.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: sellerMotivationInput,
  outputSchema: sellerMotivationOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 20,
  tags: ['predictive', 'motivation', 'seller', 'analysis'],
};

interface MotivationFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
  score: number; // 0-100 contribution to motivation
}

const sellerMotivationHandler: ToolHandler<SellerMotivationInput, SellerMotivationOutput> = async (input) => {
  console.log('[Predictive] Seller motivation for:', input.propertyId || input.address);

  if (!input.propertyId && !input.address) {
    throw new Error('Either propertyId or address is required');
  }

  const factors: MotivationFactor[] = [];
  let totalWeight = 0;
  let weightedScore = 0;
  let dataPointsAvailable = 0;

  try {
    const rentcastClient = getRentCastClient();
    let address = input.address;

    // If we have a propertyId, try to get address from Supabase first
    if (input.propertyId) {
      const supabase = await createClient();
      const { data: shovelsData } = await supabase
        .from('shovels_address_metrics')
        .select('formatted_address')
        .eq('address_id', input.propertyId)
        .single();

      if (shovelsData?.formatted_address) {
        address = shovelsData.formatted_address;
      }
    }

    if (!address) {
      throw new Error('Could not resolve property address');
    }

    // Fetch property data from RentCast
    let propertyData = null;
    let marketData = null;

    try {
      const properties = await rentcastClient.searchProperties({ address, limit: 1 });
      propertyData = properties[0] || null;

      if (propertyData?.zipCode) {
        marketData = await rentcastClient.getMarketData(propertyData.zipCode);
      }
    } catch (apiError) {
      console.warn('[Predictive] RentCast API error:', apiError);
    }

    // Factor 1: Owner Type (weight: 25%)
    // Bank-owned (REO), Trust, Corporate owners often more motivated
    if (propertyData?.owner?.ownerType) {
      dataPointsAvailable++;
      const ownerType = propertyData.owner.ownerType;
      let ownerScore = 50;
      let description = 'Individual owner - typical motivation';
      let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (ownerType === 'Bank') {
        ownerScore = 90;
        description = 'Bank-owned (REO) property - high motivation to sell';
        impact = 'positive';
      } else if (ownerType === 'Trust') {
        ownerScore = 75;
        description = 'Trust ownership - often indicates estate sale or inheritance';
        impact = 'positive';
      } else if (ownerType === 'Company') {
        ownerScore = 65;
        description = 'Corporate owner - may be motivated to liquidate';
        impact = 'positive';
      } else if (ownerType === 'Government') {
        ownerScore = 40;
        description = 'Government-owned - slower process, less flexibility';
        impact = 'negative';
      }

      factors.push({
        name: 'Owner Type',
        impact,
        weight: 0.25,
        description,
        score: ownerScore,
      });
      totalWeight += 0.25;
      weightedScore += ownerScore * 0.25;
    }

    // Factor 2: Ownership Duration (weight: 20%)
    // Long-term owners (10+ years) often have high equity and may be ready to sell
    if (propertyData?.lastSaleDate) {
      dataPointsAvailable++;
      const lastSale = new Date(propertyData.lastSaleDate);
      const yearsOwned = (Date.now() - lastSale.getTime()) / (365 * 24 * 60 * 60 * 1000);
      let durationScore = 50;
      let description = 'Average ownership duration';
      let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (yearsOwned > 15) {
        durationScore = 85;
        description = `Long-term owner (${Math.round(yearsOwned)} years) - likely high equity, potentially ready to move`;
        impact = 'positive';
      } else if (yearsOwned > 10) {
        durationScore = 70;
        description = `${Math.round(yearsOwned)} years ownership - substantial equity likely`;
        impact = 'positive';
      } else if (yearsOwned > 5) {
        durationScore = 55;
        description = `${Math.round(yearsOwned)} years ownership - moderate equity`;
        impact = 'neutral';
      } else if (yearsOwned < 2) {
        durationScore = 30;
        description = `Recent purchase (${Math.round(yearsOwned * 12)} months) - likely underwater or minimal equity`;
        impact = 'negative';
      }

      factors.push({
        name: 'Ownership Duration',
        impact,
        weight: 0.2,
        description,
        score: durationScore,
      });
      totalWeight += 0.2;
      weightedScore += durationScore * 0.2;
    }

    // Factor 3: Absentee Owner (weight: 15%)
    if (propertyData?.ownerOccupied !== undefined) {
      dataPointsAvailable++;
      const isAbsentee = !propertyData.ownerOccupied;
      const absenteeScore = isAbsentee ? 75 : 40;
      const description = isAbsentee
        ? 'Absentee owner - often more motivated to sell investment property'
        : 'Owner-occupied - typically less motivated, emotional attachment';
      const impact: 'positive' | 'negative' | 'neutral' = isAbsentee ? 'positive' : 'negative';

      factors.push({
        name: 'Absentee Owner',
        impact,
        weight: 0.15,
        description,
        score: absenteeScore,
      });
      totalWeight += 0.15;
      weightedScore += absenteeScore * 0.15;
    }

    // Factor 4: Property Condition via Permits (weight: 20%)
    // Recent repair/renovation permits may indicate distress or owner preparing to sell
    try {
      const addresses = await searchAddresses(address);
      if (addresses.length > 0) {
        dataPointsAvailable++;
        const addressId = addresses[0].address_id;
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        const permits = await getPermitsForAddress(addressId, {
          from: twoYearsAgo.toISOString().split('T')[0],
        });

        let conditionScore = 50;
        let description = 'No recent permit activity';
        let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

        if (permits.length > 0) {
          const repairTags = ['remodel', 'roofing', 'plumbing', 'electrical', 'hvac'];
          const hasRepairPermits = permits.some(p =>
            p.tags?.some(tag => repairTags.includes(tag))
          );
          const hasInactivePermits = permits.some(p => p.status === 'inactive');

          if (hasInactivePermits) {
            conditionScore = 80;
            description = 'Abandoned permits found - indicates potential distress';
            impact = 'positive';
          } else if (hasRepairPermits) {
            conditionScore = 65;
            description = 'Recent repair permits - property may need updates';
            impact = 'positive';
          } else {
            conditionScore = 45;
            description = 'Recent permits but no repair indicators';
            impact = 'neutral';
          }
        }

        factors.push({
          name: 'Property Condition (Permits)',
          impact,
          weight: 0.2,
          description,
          score: conditionScore,
        });
        totalWeight += 0.2;
        weightedScore += conditionScore * 0.2;
      }
    } catch (shovelsError) {
      console.warn('[Predictive] Shovels API error:', shovelsError);
    }

    // Factor 5: Market Conditions (weight: 20%)
    // High DOM, low sale-to-list ratio indicates buyer's market = more motivated sellers
    if (marketData) {
      dataPointsAvailable++;
      let marketScore = 50;
      let description = 'Average market conditions';
      let impact: 'positive' | 'negative' | 'neutral' = 'neutral';

      const dom = marketData.daysOnMarket || 30;
      const saleToList = marketData.saleToListRatio || 0.98;

      if (dom > 60 && saleToList < 0.95) {
        marketScore = 85;
        description = `Slow market (${dom} DOM, ${Math.round(saleToList * 100)}% sale-to-list) - sellers motivated`;
        impact = 'positive';
      } else if (dom > 45 || saleToList < 0.97) {
        marketScore = 70;
        description = `Cooling market (${dom} DOM) - increased seller flexibility`;
        impact = 'positive';
      } else if (dom < 20 && saleToList > 1.0) {
        marketScore = 25;
        description = `Hot market (${dom} DOM, ${Math.round(saleToList * 100)}% sale-to-list) - sellers have leverage`;
        impact = 'negative';
      } else if (dom < 30) {
        marketScore = 40;
        description = `Active market (${dom} DOM) - balanced conditions`;
        impact = 'neutral';
      }

      factors.push({
        name: 'Market Conditions',
        impact,
        weight: 0.2,
        description,
        score: marketScore,
      });
      totalWeight += 0.2;
      weightedScore += marketScore * 0.2;
    }

    // Calculate final score
    let finalScore = totalWeight > 0 ? weightedScore / totalWeight : 50;
    finalScore = Math.round(Math.max(0, Math.min(100, finalScore)));

    // Calculate confidence based on data availability
    const maxDataPoints = 5;
    const confidence = Math.round((dataPointsAvailable / maxDataPoints) * 100) / 100;

    // Generate recommendation
    let recommendation = '';
    if (finalScore >= 80) {
      recommendation = 'Very high motivation detected. Excellent candidate for aggressive offer (15-20% below market). Act quickly.';
    } else if (finalScore >= 65) {
      recommendation = 'High motivation indicators. Consider making an offer 10-15% below market with quick close terms.';
    } else if (finalScore >= 50) {
      recommendation = 'Moderate motivation. Standard negotiation approach recommended. Look for additional motivation signals.';
    } else if (finalScore >= 35) {
      recommendation = 'Low motivation signals. May need to offer closer to market value or find other deal leverage.';
    } else {
      recommendation = 'Minimal motivation indicators. Consider deprioritizing or waiting for circumstances to change.';
    }

    return {
      score: finalScore,
      confidence,
      factors: input.includeFactors ? factors.map(({ name, impact, weight, description }) => ({
        name,
        impact,
        weight,
        description,
      })) : [],
      recommendation,
    };
  } catch (error) {
    console.error('[Predictive] Seller motivation error:', error);
    throw new Error(`Failed to calculate seller motivation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// ============================================================================
// Deal Close Probability Tool
// ============================================================================
const dealCloseProbabilityInput = z.object({
  dealId: z.string().optional(),
  propertyId: z.string().optional(),
  address: z.string().optional(),
  askingPrice: z.number().optional(),
  offerPrice: z.number().optional(),
  includeRisks: z.boolean().default(true),
});

const dealCloseProbabilityOutput = z.object({
  probability: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  risks: z.array(z.object({
    category: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    mitigation: z.string(),
  })),
  estimatedCloseDate: z.string().optional(),
});

type DealCloseProbabilityInput = z.infer<typeof dealCloseProbabilityInput>;
type DealCloseProbabilityOutput = z.infer<typeof dealCloseProbabilityOutput>;

const dealCloseProbabilityDefinition: ToolDefinition<DealCloseProbabilityInput, DealCloseProbabilityOutput> = {
  id: 'predict.deal_close_probability',
  name: 'Predict Deal Close Probability',
  description: 'Predict the likelihood of a deal closing using market velocity and property data.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: dealCloseProbabilityInput,
  outputSchema: dealCloseProbabilityOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 20,
  tags: ['predictive', 'deals', 'probability', 'risk'],
};

interface DealRisk {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
  probabilityImpact: number; // negative impact on probability
}

const dealCloseProbabilityHandler: ToolHandler<DealCloseProbabilityInput, DealCloseProbabilityOutput> = async (input) => {
  console.log('[Predictive] Deal close probability for:', input.dealId || input.propertyId || input.address);

  if (!input.dealId && !input.propertyId && !input.address) {
    throw new Error('Either dealId, propertyId, or address is required');
  }

  const risks: DealRisk[] = [];
  let baseProbability = 65; // Start with base probability
  let dataPointsAvailable = 0;

  try {
    const rentcastClient = getRentCastClient();
    let address = input.address;
    let zipCode: string | undefined;

    // Resolve address if needed
    if (input.propertyId && !address) {
      const supabase = await createClient();
      const { data: shovelsData } = await supabase
        .from('shovels_address_metrics')
        .select('formatted_address, zip_code')
        .eq('address_id', input.propertyId)
        .single();

      if (shovelsData) {
        address = shovelsData.formatted_address;
        zipCode = shovelsData.zip_code;
      }
    }

    // Get market data for velocity analysis
    let marketData = null;
    let propertyData = null;

    if (address) {
      try {
        const properties = await rentcastClient.searchProperties({ address, limit: 1 });
        propertyData = properties[0] || null;
        zipCode = propertyData?.zipCode || zipCode;
      } catch (e) {
        console.warn('[Predictive] Property fetch error:', e);
      }
    }

    if (zipCode) {
      try {
        marketData = await rentcastClient.getMarketData(zipCode);
        dataPointsAvailable++;
      } catch (e) {
        console.warn('[Predictive] Market data fetch error:', e);
      }
    }

    // Factor 1: Market Velocity
    if (marketData) {
      const dom = marketData.daysOnMarket || 30;
      const inventory = marketData.inventory || 0;
      const saleToList = marketData.saleToListRatio || 0.98;

      // Fast market = higher close probability
      if (dom < 20) {
        baseProbability += 15;
      } else if (dom < 30) {
        baseProbability += 8;
      } else if (dom > 60) {
        baseProbability -= 10;
        risks.push({
          category: 'Market Conditions',
          severity: 'medium',
          description: `Slow market with ${dom} average days on market`,
          mitigation: 'Consider adjusting price or terms to be more competitive',
          probabilityImpact: -10,
        });
      }

      // Sale-to-list ratio indicates negotiation room
      if (saleToList < 0.95) {
        baseProbability -= 5;
        risks.push({
          category: 'Pricing',
          severity: 'low',
          description: 'Market shows significant price negotiation (sale-to-list below 95%)',
          mitigation: 'Expect seller counteroffers; budget for negotiation',
          probabilityImpact: -5,
        });
      }
    }

    // Factor 2: Price Alignment
    if (input.askingPrice && input.offerPrice) {
      dataPointsAvailable++;
      const offerPercent = (input.offerPrice / input.askingPrice) * 100;

      if (offerPercent >= 95) {
        baseProbability += 20;
      } else if (offerPercent >= 85) {
        baseProbability += 10;
      } else if (offerPercent >= 75) {
        baseProbability -= 5;
        risks.push({
          category: 'Pricing',
          severity: 'medium',
          description: `Offer is ${Math.round(100 - offerPercent)}% below asking price`,
          mitigation: 'Prepare strong justification for discount (repairs, market data)',
          probabilityImpact: -5,
        });
      } else {
        baseProbability -= 15;
        risks.push({
          category: 'Pricing',
          severity: 'high',
          description: `Aggressive offer at ${Math.round(offerPercent)}% of asking price`,
          mitigation: 'May need multiple rounds of negotiation or seller motivation change',
          probabilityImpact: -15,
        });
      }
    }

    // Factor 3: Property Condition (via permits)
    if (address) {
      try {
        const addresses = await searchAddresses(address);
        if (addresses.length > 0) {
          dataPointsAvailable++;
          const addressId = addresses[0].address_id;
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          const permits = await getPermitsForAddress(addressId, {
            from: oneYearAgo.toISOString().split('T')[0],
          });

          const hasOpenPermits = permits.some(p => p.status === 'active' || p.status === 'in_review');

          if (hasOpenPermits) {
            baseProbability -= 10;
            risks.push({
              category: 'Title/Permits',
              severity: 'medium',
              description: 'Open permits found on property',
              mitigation: 'Request permit status from seller; may need to close permits before sale',
              probabilityImpact: -10,
            });
          }

          // Check for major work that might affect title
          const majorTags = ['new_construction', 'addition', 'adu'];
          const hasMajorWork = permits.some(p => p.tags?.some(tag => majorTags.includes(tag)));

          if (hasMajorWork && hasOpenPermits) {
            risks.push({
              category: 'Title/Permits',
              severity: 'high',
              description: 'Major construction with open permits - potential title issues',
              mitigation: 'Order preliminary title report; verify all work is permitted and closed',
              probabilityImpact: -5,
            });
            baseProbability -= 5;
          }
        }
      } catch (e) {
        console.warn('[Predictive] Permit check error:', e);
      }
    }

    // Factor 4: Owner Type Risk
    if (propertyData?.owner?.ownerType) {
      dataPointsAvailable++;
      const ownerType = propertyData.owner.ownerType;

      if (ownerType === 'Bank') {
        risks.push({
          category: 'Process',
          severity: 'medium',
          description: 'Bank-owned property (REO) - extended closing timeline typical',
          mitigation: 'Plan for 45-60 day close; follow bank protocols precisely',
          probabilityImpact: -5,
        });
        baseProbability -= 5;
      } else if (ownerType === 'Trust') {
        risks.push({
          category: 'Process',
          severity: 'low',
          description: 'Trust ownership - may require trustee approval',
          mitigation: 'Verify trustee authority; allow extra time for signatures',
          probabilityImpact: -3,
        });
        baseProbability -= 3;
      }
    }

    // Calculate estimated close date based on market velocity
    let estimatedDays = 35; // Default
    if (marketData?.daysOnMarket) {
      // Under contract typically closes faster than average DOM
      estimatedDays = Math.max(21, Math.min(60, Math.round(marketData.daysOnMarket * 0.7)));
    }

    const estimatedCloseDate = new Date();
    estimatedCloseDate.setDate(estimatedCloseDate.getDate() + estimatedDays);

    // Calculate confidence
    const maxDataPoints = 4;
    const confidence = Math.round((dataPointsAvailable / maxDataPoints) * 100) / 100;

    // Clamp probability
    const finalProbability = Math.round(Math.max(5, Math.min(95, baseProbability)));

    return {
      probability: finalProbability,
      confidence,
      risks: input.includeRisks ? risks.map(({ category, severity, description, mitigation }) => ({
        category,
        severity,
        description,
        mitigation,
      })) : [],
      estimatedCloseDate: estimatedCloseDate.toISOString(),
    };
  } catch (error) {
    console.error('[Predictive] Deal close probability error:', error);
    throw new Error(`Failed to calculate deal probability: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// ============================================================================
// Optimal Offer Price Tool
// ============================================================================
const optimalOfferPriceInput = z.object({
  propertyId: z.string().optional(),
  address: z.string().optional(),
  strategy: z.enum(['aggressive', 'balanced', 'conservative']).default('balanced'),
  targetProfit: z.number().optional(),
  estimatedRepairs: z.number().optional(),
});

const optimalOfferPriceOutput = z.object({
  recommendedOffer: z.number(),
  priceRange: z.object({ min: z.number(), max: z.number() }),
  arv: z.number(),
  estimatedRepairs: z.number(),
  projectedProfit: z.number(),
  confidence: z.number(),
  methodology: z.string(),
});

type OptimalOfferPriceInput = z.infer<typeof optimalOfferPriceInput>;
type OptimalOfferPriceOutput = z.infer<typeof optimalOfferPriceOutput>;

const optimalOfferPriceDefinition: ToolDefinition<OptimalOfferPriceInput, OptimalOfferPriceOutput> = {
  id: 'predict.optimal_offer_price',
  name: 'Calculate Optimal Offer Price',
  description: 'Calculate optimal offer price using real ARV from RentCast and market data.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: optimalOfferPriceInput,
  outputSchema: optimalOfferPriceOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 15,
  tags: ['predictive', 'pricing', 'offer', 'analysis'],
};

const optimalOfferPriceHandler: ToolHandler<OptimalOfferPriceInput, OptimalOfferPriceOutput> = async (input) => {
  console.log('[Predictive] Optimal offer for:', input.propertyId || input.address);

  if (!input.propertyId && !input.address) {
    throw new Error('Either propertyId or address is required');
  }

  try {
    const rentcastClient = getRentCastClient();
    let address = input.address;
    let arv = 0;
    let arvConfidence = 0;
    let compsCount = 0;

    // Resolve address if needed
    if (input.propertyId && !address) {
      const supabase = await createClient();
      const { data: shovelsData } = await supabase
        .from('shovels_address_metrics')
        .select('formatted_address')
        .eq('address_id', input.propertyId)
        .single();

      if (shovelsData?.formatted_address) {
        address = shovelsData.formatted_address;
      }
    }

    if (!address) {
      throw new Error('Could not resolve property address');
    }

    // Get ARV from RentCast
    try {
      const valuation = await rentcastClient.getValuation(address);
      arv = valuation.price || 0;
      arvConfidence = valuation.confidence || 0.75;
      compsCount = valuation.comparables?.length || 0;
    } catch (e) {
      console.warn('[Predictive] Valuation fetch error:', e);
      throw new Error('Could not get property valuation - ARV required for offer calculation');
    }

    if (arv <= 0) {
      throw new Error('Invalid ARV returned from valuation service');
    }

    // Estimate repairs if not provided
    let repairs = input.estimatedRepairs || 0;
    if (!input.estimatedRepairs) {
      // Try to estimate from permits/property condition
      try {
        const addresses = await searchAddresses(address);
        if (addresses.length > 0) {
          const addressId = addresses[0].address_id;
          const twoYearsAgo = new Date();
          twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

          const permits = await getPermitsForAddress(addressId, {
            from: twoYearsAgo.toISOString().split('T')[0],
          });

          // If recent major repairs, assume property in better condition
          const recentMajorWork = permits.filter(p =>
            p.status === 'final' &&
            p.tags?.some(tag => ['roofing', 'hvac', 'plumbing', 'electrical'].includes(tag))
          );

          if (recentMajorWork.length >= 2) {
            repairs = Math.round(arv * 0.05); // Light repairs
          } else if (recentMajorWork.length === 1) {
            repairs = Math.round(arv * 0.10); // Moderate repairs
          } else {
            repairs = Math.round(arv * 0.15); // Assume standard repairs for wholesale
          }
        } else {
          repairs = Math.round(arv * 0.15); // Default 15% of ARV
        }
      } catch (e) {
        repairs = Math.round(arv * 0.15); // Default
      }
    }

    // Calculate MAO based on strategy
    // MAO = ARV * (investor margin) - Repairs - Assignment Fee
    const assignmentFee = input.targetProfit || 10000;

    let investorMargin: number;
    let methodology: string;

    switch (input.strategy) {
      case 'aggressive':
        investorMargin = 0.65; // 65% of ARV rule
        methodology = 'Aggressive: 65% ARV rule for maximum profit margin, suitable for distressed properties or motivated sellers';
        break;
      case 'conservative':
        investorMargin = 0.75; // 75% of ARV rule
        methodology = 'Conservative: 75% ARV rule for safer margin, better for competitive markets or newer investors';
        break;
      default:
        investorMargin = 0.70; // Standard 70% rule
        methodology = 'Balanced: Standard 70% ARV rule, industry-standard for wholesale deals';
    }

    const mao = (arv * investorMargin) - repairs - assignmentFee;

    // Calculate price range based on ARV confidence
    const confidenceRange = 1 - arvConfidence;
    const minOffer = Math.round(mao * (1 - confidenceRange * 0.5));
    const maxOffer = Math.round(mao * (1 + confidenceRange * 0.3));

    // Calculate projected profit at recommended price
    const projectedProfit = assignmentFee;

    // Overall confidence based on ARV confidence and comps
    const compConfidence = Math.min(1, compsCount / 5);
    const overallConfidence = Math.round(((arvConfidence + compConfidence) / 2) * 100) / 100;

    return {
      recommendedOffer: Math.round(Math.max(0, mao)),
      priceRange: {
        min: Math.round(Math.max(0, minOffer)),
        max: Math.round(Math.max(0, maxOffer)),
      },
      arv: Math.round(arv),
      estimatedRepairs: Math.round(repairs),
      projectedProfit: Math.round(projectedProfit),
      confidence: overallConfidence,
      methodology,
    };
  } catch (error) {
    console.error('[Predictive] Optimal offer error:', error);
    throw new Error(`Failed to calculate optimal offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// ============================================================================
// Time to Close Prediction Tool
// ============================================================================
const timeToCloseInput = z.object({
  dealId: z.string().optional(),
  propertyId: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  dealType: z.enum(['wholesale', 'fix_flip', 'rental', 'other']).default('wholesale'),
  includeBreakdown: z.boolean().default(true),
});

const timeToCloseOutput = z.object({
  estimatedDays: z.number(),
  confidence: z.number(),
  breakdown: z.array(z.object({
    phase: z.string(),
    estimatedDays: z.number(),
    status: z.enum(['completed', 'in_progress', 'pending']),
  })),
  bottlenecks: z.array(z.string()),
  marketVelocity: z.object({
    avgDaysOnMarket: z.number(),
    saleToListRatio: z.number(),
    marketTrend: z.enum(['hot', 'warm', 'neutral', 'cooling', 'cold']),
  }).optional(),
});

type TimeToCloseInput = z.infer<typeof timeToCloseInput>;
type TimeToCloseOutput = z.infer<typeof timeToCloseOutput>;

const timeToCloseDefinition: ToolDefinition<TimeToCloseInput, TimeToCloseOutput> = {
  id: 'predict.time_to_close',
  name: 'Predict Time to Close',
  description: 'Predict deal timeline using market velocity data and deal type analysis.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: timeToCloseInput,
  outputSchema: timeToCloseOutput,
  requiresConfirmation: false,
  estimatedDuration: 4000,
  rateLimit: 25,
  tags: ['predictive', 'timeline', 'deals'],
};

const timeToCloseHandler: ToolHandler<TimeToCloseInput, TimeToCloseOutput> = async (input) => {
  console.log('[Predictive] Time to close for:', input.dealId || input.propertyId || input.zipCode);

  try {
    const rentcastClient = getRentCastClient();
    let zipCode = input.zipCode;
    let marketData = null;
    let dataPointsAvailable = 0;

    // Resolve zip code if not provided
    if (!zipCode && input.address) {
      try {
        const properties = await rentcastClient.searchProperties({ address: input.address, limit: 1 });
        zipCode = properties[0]?.zipCode || undefined;
      } catch (e) {
        console.warn('[Predictive] Address resolution error:', e);
      }
    }

    if (!zipCode && input.propertyId) {
      const supabase = await createClient();
      const { data: shovelsData } = await supabase
        .from('shovels_address_metrics')
        .select('zip_code')
        .eq('address_id', input.propertyId)
        .single();

      zipCode = shovelsData?.zip_code;
    }

    // Get market velocity data
    if (zipCode) {
      try {
        marketData = await rentcastClient.getMarketData(zipCode);
        dataPointsAvailable++;
      } catch (e) {
        console.warn('[Predictive] Market data error:', e);
      }
    }

    // Base timeline by deal type
    let baseDays: number;
    const breakdown: Array<{ phase: string; estimatedDays: number; status: 'completed' | 'in_progress' | 'pending' }> = [];
    const bottlenecks: string[] = [];

    switch (input.dealType) {
      case 'wholesale':
        baseDays = 21;
        breakdown.push(
          { phase: 'Contract Negotiation', estimatedDays: 3, status: 'pending' },
          { phase: 'Due Diligence', estimatedDays: 7, status: 'pending' },
          { phase: 'Buyer Assignment', estimatedDays: 5, status: 'pending' },
          { phase: 'Closing Coordination', estimatedDays: 6, status: 'pending' },
        );
        break;
      case 'fix_flip':
        baseDays = 45;
        breakdown.push(
          { phase: 'Contract & Inspection', estimatedDays: 10, status: 'pending' },
          { phase: 'Financing Approval', estimatedDays: 14, status: 'pending' },
          { phase: 'Title & Escrow', estimatedDays: 14, status: 'pending' },
          { phase: 'Closing', estimatedDays: 7, status: 'pending' },
        );
        bottlenecks.push('Financing approval may extend timeline');
        break;
      case 'rental':
        baseDays = 35;
        breakdown.push(
          { phase: 'Offer & Acceptance', estimatedDays: 5, status: 'pending' },
          { phase: 'Inspection & Appraisal', estimatedDays: 10, status: 'pending' },
          { phase: 'Loan Processing', estimatedDays: 14, status: 'pending' },
          { phase: 'Closing', estimatedDays: 6, status: 'pending' },
        );
        break;
      default:
        baseDays = 30;
        breakdown.push(
          { phase: 'Negotiation', estimatedDays: 7, status: 'pending' },
          { phase: 'Due Diligence', estimatedDays: 10, status: 'pending' },
          { phase: 'Closing Process', estimatedDays: 13, status: 'pending' },
        );
    }

    // Adjust based on market velocity
    let marketVelocity: { avgDaysOnMarket: number; saleToListRatio: number; marketTrend: 'hot' | 'warm' | 'neutral' | 'cooling' | 'cold' } | undefined;

    if (marketData) {
      const dom = marketData.daysOnMarket || 30;
      const saleToList = marketData.saleToListRatio || 0.98;

      // Determine market trend
      let marketTrend: 'hot' | 'warm' | 'neutral' | 'cooling' | 'cold' = 'neutral';
      if (dom < 15 && saleToList > 1.0) {
        marketTrend = 'hot';
        baseDays = Math.round(baseDays * 0.8); // 20% faster in hot markets
      } else if (dom < 25 && saleToList > 0.98) {
        marketTrend = 'warm';
        baseDays = Math.round(baseDays * 0.9);
      } else if (dom > 60 && saleToList < 0.95) {
        marketTrend = 'cold';
        baseDays = Math.round(baseDays * 1.3); // 30% slower
        bottlenecks.push('Cold market - expect longer negotiation periods');
      } else if (dom > 45 || saleToList < 0.97) {
        marketTrend = 'cooling';
        baseDays = Math.round(baseDays * 1.15);
      }

      marketVelocity = {
        avgDaysOnMarket: dom,
        saleToListRatio: saleToList,
        marketTrend,
      };
    }

    // Check for permit-related bottlenecks
    if (input.propertyId || input.address) {
      try {
        let addressId: string | undefined;

        if (input.address) {
          const addresses = await searchAddresses(input.address);
          addressId = addresses[0]?.address_id;
        }

        if (addressId) {
          const permits = await getPermitsForAddress(addressId);
          const openPermits = permits.filter(p => p.status === 'active' || p.status === 'in_review');

          if (openPermits.length > 0) {
            baseDays += 14; // Add 2 weeks for permit resolution
            bottlenecks.push(`${openPermits.length} open permit(s) may delay closing`);
          }
        }
      } catch (e) {
        console.warn('[Predictive] Permit check error:', e);
      }
    }

    // Recalculate breakdown proportionally
    const totalBreakdownDays = breakdown.reduce((sum, b) => sum + b.estimatedDays, 0);
    const scaleFactor = baseDays / totalBreakdownDays;
    breakdown.forEach(b => {
      b.estimatedDays = Math.round(b.estimatedDays * scaleFactor);
    });

    // Calculate confidence
    const maxDataPoints = 2;
    const confidence = Math.round(Math.max(0.5, dataPointsAvailable / maxDataPoints) * 100) / 100;

    return {
      estimatedDays: baseDays,
      confidence,
      breakdown: input.includeBreakdown ? breakdown : [],
      bottlenecks,
      marketVelocity,
    };
  } catch (error) {
    console.error('[Predictive] Time to close error:', error);
    throw new Error(`Failed to predict time to close: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// ============================================================================
// Register All Predictive Tools
// ============================================================================
export function registerPredictiveTools() {
  toolRegistry.register(sellerMotivationDefinition, sellerMotivationHandler);
  toolRegistry.register(dealCloseProbabilityDefinition, dealCloseProbabilityHandler);
  toolRegistry.register(optimalOfferPriceDefinition, optimalOfferPriceHandler);
  toolRegistry.register(timeToCloseDefinition, timeToCloseHandler);
  console.log('[Predictive Tools] Registered 4 tools with real heuristics');
}

export const predictiveTools = {
  sellerMotivation: sellerMotivationDefinition,
  dealCloseProbability: dealCloseProbabilityDefinition,
  optimalOfferPrice: optimalOfferPriceDefinition,
  timeToClose: timeToCloseDefinition,
};
