/**
 * Competitive Intelligence Tools
 * Tools for market and competitor analysis
 *
 * Uses REAL APIs:
 * - RentCast for market data (DOM, inventory, price trends)
 * - Shovels for permit activity (indicates investor/flipper activity)
 * - Supabase for geo vitality scores
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { getRentCastClient } from '@/lib/rentcast';
import { searchPermits } from '@/lib/shovels/client';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Competitor Activity Tool
// Uses Shovels permit data to detect investor/flipper activity
// ============================================================================
const competitorActivityInput = z.object({
  zipCodes: z.array(z.string()).min(1).max(10),
  timeframeDays: z.number().min(7).max(90).default(30),
  includeDetails: z.boolean().default(true),
});

const competitorActivityOutput = z.object({
  totalActivity: z.number(),
  byZipCode: z.array(
    z.object({
      zipCode: z.string(),
      permitCount: z.number(),
      flipIndicators: z.number(), // Permits that suggest flip activity
      avgJobValue: z.number().optional(),
    })
  ),
  activityTrend: z.enum(['increasing', 'stable', 'decreasing']),
  investorSignals: z.array(z.string()),
  confidence: z.number(),
});

type CompetitorActivityInput = z.infer<typeof competitorActivityInput>;
type CompetitorActivityOutput = z.infer<typeof competitorActivityOutput>;

const competitorActivityDefinition: ToolDefinition<
  CompetitorActivityInput,
  CompetitorActivityOutput
> = {
  id: 'intel.competitor_activity',
  name: 'Analyze Competitor Activity',
  description: 'Analyze investor/flipper activity in zip codes using permit data.',
  category: 'intelligence',
  requiredPermission: 'read',
  inputSchema: competitorActivityInput,
  outputSchema: competitorActivityOutput,
  requiresConfirmation: false,
  estimatedDuration: 8000,
  rateLimit: 10,
  tags: ['intelligence', 'competitors', 'market', 'permits'],
};

const competitorActivityHandler: ToolHandler<
  CompetitorActivityInput,
  CompetitorActivityOutput
> = async (input) => {
  console.log('[Intelligence] Competitor activity for:', input.zipCodes);

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - input.timeframeDays);
  const toDate = new Date();

  const byZipCode: Array<{
    zipCode: string;
    permitCount: number;
    flipIndicators: number;
    avgJobValue?: number;
  }> = [];

  let totalActivity = 0;
  const investorSignals: string[] = [];
  let dataPointsAvailable = 0;

  // Flip-indicative permit tags
  const flipTags = ['remodel', 'roofing', 'plumbing', 'electrical', 'hvac', 'kitchen', 'bathroom'];

  for (const zipCode of input.zipCodes) {
    try {
      // Search permits in this zip code
      const permitResult = await searchPermits({
        geo_id: zipCode,
        permit_from: fromDate.toISOString().split('T')[0]!,
        permit_to: toDate.toISOString().split('T')[0]!,
        property_type: 'residential',
        size: 100,
      });

      const permits = permitResult.items || [];
      dataPointsAvailable++;

      // Count flip indicators
      let flipIndicators = 0;
      let totalJobValue = 0;
      let jobValueCount = 0;

      for (const permit of permits) {
        const isFlipIndicator = permit.tags?.some((tag) => flipTags.includes(tag));
        if (isFlipIndicator) {
          flipIndicators++;
        }
        if (permit.job_value) {
          totalJobValue += permit.job_value;
          jobValueCount++;
        }
      }

      byZipCode.push({
        zipCode,
        permitCount: permits.length,
        flipIndicators,
        avgJobValue: jobValueCount > 0 ? Math.round(totalJobValue / jobValueCount) : undefined,
      });

      totalActivity += permits.length;

      // Generate signals
      if (flipIndicators > 10) {
        investorSignals.push(
          `High flip activity in ${zipCode} (${flipIndicators} renovation permits)`
        );
      }
      if (jobValueCount > 0) {
        const avgValue = totalJobValue / jobValueCount;
        if (avgValue > 50000) {
          investorSignals.push(
            `Large renovation projects in ${zipCode} (avg $${Math.round(avgValue).toLocaleString()})`
          );
        }
      }
    } catch (error) {
      console.warn(`[Intelligence] Failed to fetch permits for ${zipCode}:`, error);
      byZipCode.push({
        zipCode,
        permitCount: 0,
        flipIndicators: 0,
      });
    }
  }

  // Determine trend (would need historical comparison - simplified here)
  let activityTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
  const avgPerZip = totalActivity / input.zipCodes.length;

  if (avgPerZip > 50) {
    activityTrend = 'increasing';
    investorSignals.push('Above average permit activity suggests active investor interest');
  } else if (avgPerZip < 10) {
    activityTrend = 'decreasing';
    investorSignals.push('Low permit activity - market may be underserved');
  }

  const confidence = Math.min(1, dataPointsAvailable / input.zipCodes.length);

  return {
    totalActivity,
    byZipCode,
    activityTrend,
    investorSignals:
      investorSignals.length > 0 ? investorSignals : ['Standard market activity levels'],
    confidence,
  };
};

// ============================================================================
// Market Saturation Tool
// Uses RentCast market data and Shovels metrics
// ============================================================================
const marketSaturationInput = z.object({
  zipCode: z.string(),
  includeRecommendations: z.boolean().default(true),
});

const marketSaturationOutput = z.object({
  saturationScore: z.number().min(0).max(100),
  metrics: z.object({
    daysOnMarket: z.number(),
    inventory: z.number(),
    saleToListRatio: z.number(),
    pricePerSqft: z.number().optional(),
    yearOverYearChange: z.number().optional(),
  }),
  permitActivity: z
    .object({
      totalPermits: z.number(),
      avgApprovalDuration: z.number().optional(),
      activeContractors: z.number().optional(),
    })
    .optional(),
  interpretation: z.string(),
  opportunities: z.array(z.string()),
  confidence: z.number(),
});

type MarketSaturationInput = z.infer<typeof marketSaturationInput>;
type MarketSaturationOutput = z.infer<typeof marketSaturationOutput>;

const marketSaturationDefinition: ToolDefinition<MarketSaturationInput, MarketSaturationOutput> = {
  id: 'intel.market_saturation',
  name: 'Analyze Market Saturation',
  description: 'Analyze market saturation using real market data and permit activity.',
  category: 'intelligence',
  requiredPermission: 'read',
  inputSchema: marketSaturationInput,
  outputSchema: marketSaturationOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 15,
  tags: ['intelligence', 'market', 'saturation'],
};

const marketSaturationHandler: ToolHandler<MarketSaturationInput, MarketSaturationOutput> = async (
  input
) => {
  console.log('[Intelligence] Market saturation for:', input.zipCode);

  const rentcastClient = getRentCastClient();
  let marketData = null;
  let geoMetrics = null;
  let dataPointsAvailable = 0;

  // Fetch RentCast market data
  try {
    marketData = await rentcastClient.getMarketData(input.zipCode);
    dataPointsAvailable++;
  } catch (error) {
    console.warn('[Intelligence] RentCast market data error:', error);
  }

  // Try to get geo vitality score from Supabase
  try {
    const supabase = await createClient();
    const { data: vitalityData } = await supabase
      .from('geo_vitality_scores')
      .select('*')
      .eq('zip_code', input.zipCode)
      .single();

    if (vitalityData) {
      geoMetrics = vitalityData;
      dataPointsAvailable++;
    }
  } catch (error) {
    console.warn('[Intelligence] Geo vitality fetch error:', error);
  }

  // Calculate saturation score based on market indicators
  let saturationScore = 50; // Base score

  const dom = marketData?.daysOnMarket || 30;
  const inventory = marketData?.inventory || 0;
  const saleToList = marketData?.saleToListRatio || 0.98;
  const yoyChange = marketData?.yearOverYearChange || 0;

  // Adjust saturation based on DOM (lower = more saturated/competitive)
  if (dom < 15) {
    saturationScore += 25; // Very competitive
  } else if (dom < 25) {
    saturationScore += 15;
  } else if (dom > 60) {
    saturationScore -= 20; // Less competition
  } else if (dom > 45) {
    saturationScore -= 10;
  }

  // Adjust based on inventory (lower = more competition)
  if (inventory < 100) {
    saturationScore += 15;
  } else if (inventory > 500) {
    saturationScore -= 15;
  }

  // Adjust based on sale-to-list ratio (higher = more competition)
  if (saleToList > 1.0) {
    saturationScore += 10; // Sellers getting above asking
  } else if (saleToList < 0.95) {
    saturationScore -= 10; // Buyers have leverage
  }

  // Factor in permit activity if available
  let permitActivity = undefined;
  if (geoMetrics) {
    permitActivity = {
      totalPermits: geoMetrics.total_permits || 0,
      avgApprovalDuration: undefined,
      activeContractors: undefined,
    };

    // High permit activity suggests active investment area
    if (geoMetrics.total_permits && geoMetrics.total_permits > 100) {
      saturationScore += 5;
    }
  }

  saturationScore = Math.max(0, Math.min(100, saturationScore));

  // Generate interpretation
  let interpretation: string;
  if (saturationScore >= 75) {
    interpretation =
      'Highly competitive market with strong investor presence. Off-market strategies recommended.';
  } else if (saturationScore >= 50) {
    interpretation =
      'Moderately competitive market. Mix of on-market and off-market strategies viable.';
  } else if (saturationScore >= 25) {
    interpretation = 'Less saturated market with opportunities. On-market deals may be viable.';
  } else {
    interpretation =
      'Undersaturated market. Potential for less competition but verify demand exists.';
  }

  // Generate opportunities based on data
  const opportunities: string[] = [];

  if (dom > 45) {
    opportunities.push('Extended DOM suggests motivated sellers - target price reductions');
  }
  if (saleToList < 0.97) {
    opportunities.push('Buyers have negotiating power - can offer below asking');
  }
  if (inventory > 300) {
    opportunities.push('High inventory creates selection opportunities');
  }
  if (yoyChange < 0) {
    opportunities.push('Price softening may indicate distressed seller opportunities');
  }
  if (saturationScore < 40) {
    opportunities.push('Less investor competition - direct mail campaigns may be effective');
  }

  if (opportunities.length === 0) {
    opportunities.push('Standard market conditions - focus on building seller relationships');
  }

  const confidence = Math.min(1, dataPointsAvailable / 2);

  return {
    saturationScore,
    metrics: {
      daysOnMarket: dom,
      inventory,
      saleToListRatio: saleToList,
      pricePerSqft: marketData?.pricePerSquareFoot || undefined,
      yearOverYearChange: yoyChange || undefined,
    },
    permitActivity,
    interpretation,
    opportunities,
    confidence,
  };
};

// ============================================================================
// Market Velocity Analysis Tool
// Uses RentCast data for comprehensive market velocity metrics
// (Replaces Emerging Markets - per user feedback)
// ============================================================================
const marketVelocityInput = z.object({
  zipCode: z.string(),
  compareToRegion: z.boolean().default(false),
});

const marketVelocityOutput = z.object({
  velocity: z.object({
    score: z.number().min(0).max(100),
    trend: z.enum(['hot', 'warm', 'neutral', 'cooling', 'cold']),
    daysOnMarket: z.number(),
    saleToListRatio: z.number(),
    inventory: z.number(),
    absorptionRate: z.number().optional(),
  }),
  priceMetrics: z.object({
    medianPrice: z.number().optional(),
    pricePerSqft: z.number().optional(),
    yearOverYearChange: z.number().optional(),
  }),
  investorGuidance: z.object({
    recommendation: z.string(),
    idealStrategy: z.string(),
    timeToAct: z.enum(['immediate', 'soon', 'patient', 'wait']),
  }),
  confidence: z.number(),
});

type MarketVelocityInput = z.infer<typeof marketVelocityInput>;
type MarketVelocityOutput = z.infer<typeof marketVelocityOutput>;

const marketVelocityDefinition: ToolDefinition<MarketVelocityInput, MarketVelocityOutput> = {
  id: 'intel.market_velocity',
  name: 'Analyze Market Velocity',
  description: 'Comprehensive market velocity analysis for investment timing decisions.',
  category: 'intelligence',
  requiredPermission: 'read',
  inputSchema: marketVelocityInput,
  outputSchema: marketVelocityOutput,
  requiresConfirmation: false,
  estimatedDuration: 4000,
  rateLimit: 20,
  tags: ['intelligence', 'market', 'velocity', 'timing'],
};

const marketVelocityHandler: ToolHandler<MarketVelocityInput, MarketVelocityOutput> = async (
  input
) => {
  console.log('[Intelligence] Market velocity for:', input.zipCode);

  const rentcastClient = getRentCastClient();
  let marketData = null;

  try {
    marketData = await rentcastClient.getMarketData(input.zipCode);
  } catch (error) {
    console.error('[Intelligence] RentCast error:', error);
    throw new Error('Failed to fetch market data for velocity analysis');
  }

  const dom = marketData.daysOnMarket || 30;
  const saleToList = marketData.saleToListRatio || 0.98;
  const inventory = marketData.inventory || 0;
  const yoyChange = marketData.yearOverYearChange || 0;

  // Calculate velocity score (0-100, higher = faster market)
  let velocityScore = 50;

  // DOM factor (lower = faster)
  if (dom < 15) {
    velocityScore += 30;
  } else if (dom < 25) {
    velocityScore += 20;
  } else if (dom < 35) {
    velocityScore += 10;
  } else if (dom > 60) {
    velocityScore -= 25;
  } else if (dom > 45) {
    velocityScore -= 15;
  }

  // Sale-to-list factor
  if (saleToList > 1.02) {
    velocityScore += 15;
  } else if (saleToList > 1.0) {
    velocityScore += 10;
  } else if (saleToList < 0.95) {
    velocityScore -= 15;
  } else if (saleToList < 0.97) {
    velocityScore -= 5;
  }

  velocityScore = Math.max(0, Math.min(100, velocityScore));

  // Determine trend
  let trend: 'hot' | 'warm' | 'neutral' | 'cooling' | 'cold';
  if (velocityScore >= 80) {
    trend = 'hot';
  } else if (velocityScore >= 60) {
    trend = 'warm';
  } else if (velocityScore >= 40) {
    trend = 'neutral';
  } else if (velocityScore >= 20) {
    trend = 'cooling';
  } else {
    trend = 'cold';
  }

  // Calculate absorption rate if we have inventory
  const absorptionRate = inventory > 0 ? Math.round((30 / dom) * 100) / 100 : undefined;

  // Generate investor guidance
  let recommendation: string;
  let idealStrategy: string;
  let timeToAct: 'immediate' | 'soon' | 'patient' | 'wait';

  switch (trend) {
    case 'hot':
      recommendation =
        'Fast-moving market. Must act quickly on deals. Pre-negotiated buyer lists essential.';
      idealStrategy = 'Wholesale with pre-assigned buyers or quick flips';
      timeToAct = 'immediate';
      break;
    case 'warm':
      recommendation = 'Active market with good velocity. Standard wholesale timeline viable.';
      idealStrategy = 'Traditional wholesale or short-term flip';
      timeToAct = 'soon';
      break;
    case 'neutral':
      recommendation = 'Balanced market. Focus on finding motivated sellers for best deals.';
      idealStrategy = 'Selective wholesale or BRRRR for holds';
      timeToAct = 'patient';
      break;
    case 'cooling':
      recommendation = 'Slowing market. Negotiate harder and ensure exit strategies are solid.';
      idealStrategy = 'Deep discount wholesale or long-term rental';
      timeToAct = 'patient';
      break;
    case 'cold':
      recommendation = 'Slow market. Only pursue deeply discounted deals with clear exit paths.';
      idealStrategy = 'Buy and hold or creative financing';
      timeToAct = 'wait';
      break;
  }

  return {
    velocity: {
      score: velocityScore,
      trend,
      daysOnMarket: dom,
      saleToListRatio: saleToList,
      inventory,
      absorptionRate,
    },
    priceMetrics: {
      medianPrice: marketData.medianSalePrice || undefined,
      pricePerSqft: marketData.pricePerSquareFoot || undefined,
      yearOverYearChange: yoyChange || undefined,
    },
    investorGuidance: {
      recommendation,
      idealStrategy,
      timeToAct,
    },
    confidence: 0.85, // RentCast data is generally reliable
  };
};

// ============================================================================
// Register All Intelligence Tools
// ============================================================================
export function registerIntelligenceTools() {
  toolRegistry.register(competitorActivityDefinition, competitorActivityHandler);
  toolRegistry.register(marketSaturationDefinition, marketSaturationHandler);
  toolRegistry.register(marketVelocityDefinition, marketVelocityHandler);
  console.log('[Intelligence Tools] Registered 3 tools with real API data');
}

export const intelligenceTools = {
  competitorActivity: competitorActivityDefinition,
  marketSaturation: marketSaturationDefinition,
  marketVelocity: marketVelocityDefinition,
};
