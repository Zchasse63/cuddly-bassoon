/**
 * Predictive Analytics Tools
 * AI-powered prediction tools for deal analysis
 *
 * Uses REAL APIs and heuristics:
 * - RentCast for property valuations, owner data, and market conditions
 * - Shovels for permit activity and property condition signals
 * - Supabase for cached property data and geo vitality scores
 * - Stratified Seller Motivation Scoring System with owner-type-specific models
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
import {
  calculateSellerMotivation,
  batchCalculateMotivation,
  classifyOwner,
  type ScoringResult,
} from '@/lib/seller-motivation';

// ============================================================================
// Seller Motivation Score Tool
// ============================================================================
const sellerMotivationInput = z.object({
  propertyId: z.string().optional(),
  address: z.string().optional(),
  includeFactors: z.boolean().default(true),
  scoreType: z.enum(['standard', 'dealflow_iq', 'both']).default('standard'),
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
  // Owner classification (new stratified system)
  ownerClassification: z.object({
    primaryClass: z.enum(['individual', 'investor_entity', 'institutional_distressed']),
    subClass: z.string(),
    confidence: z.number(),
  }).optional(),
  modelUsed: z.string().optional(),
  riskFactors: z.array(z.string()).optional(),
  // DealFlow IQ fields (when scoreType includes dealflow_iq)
  dealFlowIQ: z.object({
    iqScore: z.number(),
    aiAdjustments: z.array(z.object({
      factor: z.string(),
      adjustment: z.number(),
      reasoning: z.string(),
    })),
    predictions: z.object({
      timeToDecision: z.string(),
      bestApproachTiming: z.string(),
      optimalOfferRange: z.object({ min: z.number(), max: z.number() }),
    }),
  }).optional(),
});

type SellerMotivationInput = z.infer<typeof sellerMotivationInput>;
type SellerMotivationOutput = z.infer<typeof sellerMotivationOutput>;

const sellerMotivationDefinition: ToolDefinition<SellerMotivationInput, SellerMotivationOutput> = {
  id: 'predict.seller_motivation',
  name: 'Predict Seller Motivation',
  description: 'Analyze property and owner data using stratified scoring models. Uses different scoring logic based on owner type: Individual (long ownership = HIGH motivation), Investor/Entity (long ownership = LOW motivation), Institutional (process-focused). Optionally includes AI-enhanced DealFlow IQ score.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: sellerMotivationInput,
  outputSchema: sellerMotivationOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 20,
  tags: ['predictive', 'motivation', 'seller', 'analysis', 'stratified-scoring'],
};

/**
 * Seller Motivation Handler
 *
 * Uses the stratified scoring system with different models per owner type:
 * - Individual: Long ownership = HIGH motivation (life transition)
 * - Investor/Entity: Long ownership = LOW motivation (stable investment)
 * - Institutional: Process-focused scoring (bureaucratic factors)
 */
const sellerMotivationHandler: ToolHandler<SellerMotivationInput, SellerMotivationOutput> = async (input) => {
  console.log('[Predictive] Seller motivation for:', input.propertyId || input.address);

  if (!input.propertyId && !input.address) {
    throw new Error('Either propertyId or address is required');
  }

  try {
    // Use the new stratified scoring engine
    const result: ScoringResult = await calculateSellerMotivation({
      propertyId: input.propertyId,
      address: input.address,
      scoreType: input.scoreType,
      useCache: true,
      cacheTtlSeconds: 3600, // 1 hour cache
    });

    // Transform factors to the expected output format
    const factors = input.includeFactors
      ? result.standardScore.factors.map(f => ({
          name: f.name,
          impact: f.impact,
          weight: f.weight,
          description: f.description,
        }))
      : [];

    // Build response
    const response: SellerMotivationOutput = {
      score: result.standardScore.score,
      confidence: result.standardScore.confidence,
      factors,
      recommendation: result.standardScore.recommendation,
      ownerClassification: {
        primaryClass: result.classification.primaryClass,
        subClass: result.classification.subClass,
        confidence: result.classification.confidence,
      },
      modelUsed: result.standardScore.modelUsed,
      riskFactors: result.standardScore.riskFactors,
    };

    // Add DealFlow IQ if requested
    if (result.dealFlowIQ) {
      response.dealFlowIQ = {
        iqScore: result.dealFlowIQ.iqScore,
        aiAdjustments: result.dealFlowIQ.aiAdjustments,
        predictions: result.dealFlowIQ.predictions,
      };
    }

    // Log timing for performance monitoring
    console.log(`[Predictive] Scoring completed in ${result.timing.totalMs}ms (fetch: ${result.timing.fetchMs}ms, classify: ${result.timing.classifyMs}ms, score: ${result.timing.scoreMs}ms)`);

    return response;
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
// Owner Classification Tool
// ============================================================================
const classifyOwnerInput = z.object({
  ownerName: z.string().describe('The owner name to classify'),
  ownerType: z.string().optional().describe('Optional owner type hint from property data'),
  ownerOccupied: z.boolean().optional().describe('Whether the property is owner-occupied'),
  mailingState: z.string().optional().describe('Owner mailing address state'),
  propertyState: z.string().optional().describe('Property state for out-of-state detection'),
});

const classifyOwnerOutput = z.object({
  primaryClass: z.enum(['individual', 'investor_entity', 'institutional_distressed']),
  subClass: z.string(),
  confidence: z.number(),
  matchedPatterns: z.array(z.string()),
  interpretation: z.string(),
});

type ClassifyOwnerInput = z.infer<typeof classifyOwnerInput>;
type ClassifyOwnerOutput = z.infer<typeof classifyOwnerOutput>;

const classifyOwnerDefinition: ToolDefinition<ClassifyOwnerInput, ClassifyOwnerOutput> = {
  id: 'predict.classify_owner',
  name: 'Classify Owner Type',
  description: 'Classify a property owner into categories: Individual (owner-occupied/absentee), Investor/Entity (LLC, corporation, trust), or Institutional (bank REO, government, estate). Uses pattern matching on owner name and optional signals.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: classifyOwnerInput,
  outputSchema: classifyOwnerOutput,
  requiresConfirmation: false,
  estimatedDuration: 500,
  rateLimit: 50,
  tags: ['predictive', 'owner', 'classification', 'entity-detection'],
};

const classifyOwnerHandler: ToolHandler<ClassifyOwnerInput, ClassifyOwnerOutput> = async (input) => {
  console.log('[Predictive] Classifying owner:', input.ownerName);

  const classification = classifyOwner(input.ownerName, {
    ownerType: input.ownerType,
    ownerOccupied: input.ownerOccupied,
    mailingState: input.mailingState,
    propertyState: input.propertyState,
  });

  // Generate interpretation
  const interpretations: Record<string, string> = {
    individual: 'Individual owners respond to personal approaches. Focus on their life situation and timeline.',
    investor_entity: 'Investor/entities are numbers-driven. Focus on ROI, quick closes, and professional terms.',
    institutional_distressed: 'Institutional owners have strict processes. Follow protocols and expect longer timelines.',
  };

  const subClassDetails: Record<string, string> = {
    owner_occupied: 'Lives in property - emotional attachment, life events drive decisions.',
    absentee: 'Doesn\'t live there - may be tired landlord or inherited property.',
    out_of_state: 'Lives far away - management burden increases motivation.',
    inherited: 'Likely inherited - beneficiaries often want quick liquidation.',
    small_investor: 'Small portfolio (1-4 properties) - may be approachable.',
    portfolio_investor: 'Large portfolio (5+) - professional, ROI-focused.',
    llc_single: 'Single-property LLC - could be personal asset protection.',
    llc_multi: 'Multi-property LLC - active investor, less likely motivated.',
    corporate: 'Corporation - professional investor with holding power.',
    trust_living: 'Living trust - estate planning, owner still in control.',
    trust_irrevocable: 'Irrevocable trust - complex decision process.',
    bank_reo: 'Bank REO - motivated but slow process (45-60 days).',
    government_federal: 'Federal agency - strict protocols, limited negotiation.',
    government_state: 'State agency - bureaucratic process.',
    government_local: 'Local government - may have community programs.',
    tax_lien: 'Tax lien holder - property may be redeemable.',
    estate_probate: 'Estate in probate - highly motivated, legal clearance needed.',
    estate_executor: 'Executor sale - motivated to settle estate.',
  };

  return {
    primaryClass: classification.primaryClass,
    subClass: classification.subClass,
    confidence: classification.confidence,
    matchedPatterns: classification.matchedPatterns,
    interpretation: `${interpretations[classification.primaryClass]} ${subClassDetails[classification.subClass] || ''}`.trim(),
  };
};

// ============================================================================
// Batch Motivation Scoring Tool
// ============================================================================
const batchMotivationInput = z.object({
  properties: z.array(z.object({
    propertyId: z.string().optional(),
    address: z.string(),
  })).max(20).describe('List of properties to score (max 20)'),
  scoreType: z.enum(['standard', 'dealflow_iq']).default('standard'),
});

const batchMotivationOutput = z.object({
  results: z.array(z.object({
    address: z.string(),
    propertyId: z.string().optional(),
    score: z.number().nullable(),
    confidence: z.number().nullable(),
    ownerClass: z.string().nullable(),
    recommendation: z.string().nullable(),
    error: z.string().optional(),
  })),
  summary: z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
    avgScore: z.number(),
    highMotivationCount: z.number(),
  }),
});

type BatchMotivationInput = z.infer<typeof batchMotivationInput>;
type BatchMotivationOutput = z.infer<typeof batchMotivationOutput>;

const batchMotivationDefinition: ToolDefinition<BatchMotivationInput, BatchMotivationOutput> = {
  id: 'predict.batch_motivation',
  name: 'Batch Score Seller Motivation',
  description: 'Calculate seller motivation scores for multiple properties at once. Returns scores, owner classifications, and recommendations for up to 20 properties. Useful for prioritizing lead lists.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: batchMotivationInput,
  outputSchema: batchMotivationOutput,
  requiresConfirmation: false,
  estimatedDuration: 30000,
  rateLimit: 5,
  tags: ['predictive', 'motivation', 'batch', 'lead-scoring'],
};

const batchMotivationHandler: ToolHandler<BatchMotivationInput, BatchMotivationOutput> = async (input) => {
  console.log('[Predictive] Batch scoring', input.properties.length, 'properties');

  const batchResults = await batchCalculateMotivation(
    input.properties,
    { scoreType: input.scoreType, concurrency: 5 }
  );

  const results = batchResults.map(({ input: prop, result, error }) => ({
    address: prop.address,
    propertyId: prop.propertyId,
    score: result?.standardScore.score ?? null,
    confidence: result?.standardScore.confidence ?? null,
    ownerClass: result ? `${result.classification.primaryClass}/${result.classification.subClass}` : null,
    recommendation: result?.standardScore.recommendation ?? null,
    error,
  }));

  const successful = results.filter(r => r.score !== null);
  const avgScore = successful.length > 0
    ? successful.reduce((sum, r) => sum + (r.score || 0), 0) / successful.length
    : 0;
  const highMotivationCount = successful.filter(r => (r.score || 0) >= 65).length;

  return {
    results,
    summary: {
      total: results.length,
      successful: successful.length,
      failed: results.length - successful.length,
      avgScore: Math.round(avgScore),
      highMotivationCount,
    },
  };
};

// ============================================================================
// Compare Motivation Scores Tool
// ============================================================================
const compareMotivationInput = z.object({
  propertyIds: z.array(z.string()).min(2).max(10).optional(),
  addresses: z.array(z.string()).min(2).max(10).optional(),
}).refine(data => data.propertyIds || data.addresses, {
  message: 'Either propertyIds or addresses must be provided',
});

const compareMotivationOutput = z.object({
  comparisons: z.array(z.object({
    address: z.string(),
    score: z.number(),
    ownerClass: z.string(),
    keyFactor: z.string(),
    rank: z.number(),
  })),
  analysis: z.object({
    highestScore: z.object({ address: z.string(), score: z.number() }),
    lowestScore: z.object({ address: z.string(), score: z.number() }),
    recommendation: z.string(),
    priorityOrder: z.array(z.string()),
  }),
});

type CompareMotivationInput = z.infer<typeof compareMotivationInput>;
type CompareMotivationOutput = z.infer<typeof compareMotivationOutput>;

const compareMotivationDefinition: ToolDefinition<CompareMotivationInput, CompareMotivationOutput> = {
  id: 'predict.compare_motivation',
  name: 'Compare Motivation Scores',
  description: 'Compare seller motivation scores across multiple properties to prioritize outreach. Ranks properties and provides analysis of which to contact first.',
  category: 'predictive',
  requiredPermission: 'read',
  inputSchema: compareMotivationInput,
  outputSchema: compareMotivationOutput,
  requiresConfirmation: false,
  estimatedDuration: 15000,
  rateLimit: 10,
  tags: ['predictive', 'motivation', 'comparison', 'prioritization'],
};

const compareMotivationHandler: ToolHandler<CompareMotivationInput, CompareMotivationOutput> = async (input) => {
  // Build property list
  const properties = input.addresses
    ? input.addresses.map(addr => ({ address: addr }))
    : input.propertyIds!.map(id => ({ propertyId: id, address: '' }));

  console.log('[Predictive] Comparing motivation for', properties.length, 'properties');

  const batchResults = await batchCalculateMotivation(properties, { scoreType: 'standard' });

  // Filter successful results and sort by score
  const successfulResults = batchResults
    .filter(r => r.result !== null)
    .map(r => ({
      address: r.input.address || r.result!.signals.ownerMailingAddress || 'Unknown',
      score: r.result!.standardScore.score,
      ownerClass: `${r.result!.classification.primaryClass}/${r.result!.classification.subClass}`,
      keyFactor: r.result!.standardScore.factors
        .filter(f => f.impact === 'positive')
        .sort((a, b) => b.weight - a.weight)[0]?.name || 'No positive factors',
    }))
    .sort((a, b) => b.score - a.score);

  // Add ranks
  const comparisons = successfulResults.map((r, idx) => ({ ...r, rank: idx + 1 }));

  if (comparisons.length === 0) {
    throw new Error('Could not score any of the provided properties');
  }

  const highest = comparisons[0]!;
  const lowest = comparisons[comparisons.length - 1]!;

  // Generate recommendation
  let recommendation: string;
  const scoreDiff = highest.score - lowest.score;

  if (scoreDiff < 10) {
    recommendation = 'Scores are similar across properties. Consider other factors like property value or location for prioritization.';
  } else if (highest.score >= 70) {
    recommendation = `Prioritize ${highest.address} with a score of ${highest.score}. This property shows strong motivation signals.`;
  } else if (highest.score >= 50) {
    recommendation = `${highest.address} has the highest score (${highest.score}) but motivation is moderate. Consider investigating for additional signals before outreach.`;
  } else {
    recommendation = 'All properties show low motivation scores. Consider waiting for circumstances to change or focusing on other lead sources.';
  }

  return {
    comparisons,
    analysis: {
      highestScore: { address: highest.address, score: highest.score },
      lowestScore: { address: lowest.address, score: lowest.score },
      recommendation,
      priorityOrder: comparisons.map(c => c.address),
    },
  };
};

// ============================================================================
// Register All Predictive Tools
// ============================================================================
export function registerPredictiveTools() {
  // Core prediction tools
  toolRegistry.register(sellerMotivationDefinition, sellerMotivationHandler);
  toolRegistry.register(dealCloseProbabilityDefinition, dealCloseProbabilityHandler);
  toolRegistry.register(optimalOfferPriceDefinition, optimalOfferPriceHandler);
  toolRegistry.register(timeToCloseDefinition, timeToCloseHandler);

  // Owner classification and batch tools
  toolRegistry.register(classifyOwnerDefinition, classifyOwnerHandler);
  toolRegistry.register(batchMotivationDefinition, batchMotivationHandler);
  toolRegistry.register(compareMotivationDefinition, compareMotivationHandler);

  console.log('[Predictive Tools] Registered 7 tools with stratified scoring system');
}

export const predictiveTools = {
  sellerMotivation: sellerMotivationDefinition,
  dealCloseProbability: dealCloseProbabilityDefinition,
  optimalOfferPrice: optimalOfferPriceDefinition,
  timeToClose: timeToCloseDefinition,
  classifyOwner: classifyOwnerDefinition,
  batchMotivation: batchMotivationDefinition,
  compareMotivation: compareMotivationDefinition,
};
