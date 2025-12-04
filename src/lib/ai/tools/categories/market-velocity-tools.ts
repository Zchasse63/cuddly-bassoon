/**
 * Market Velocity AI Tools
 * 13 tools for analyzing buyer demand intensity and market heat
 * Uses RentCast for market data and Shovels for permit/development data
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import type { ToolDefinition, ToolHandler } from '../types';
import {
  getVelocityForZipCode,
  findHotMarkets,
  findColdMarkets,
  compareMarketVelocity,
  getVelocityTrend,
  getVelocityRankings,
  getVelocityForBounds,
} from '@/lib/velocity';
import {
  interpretDOM,
  interpretAbsorption,
  interpretInventory,
  interpretPermits,
  interpretInvestment,
  generateWholesaleImplications,
} from '@/lib/velocity/calculator';

// =============================================
// 1. Get Market Velocity Tool
// =============================================

const getMarketVelocityInput = z.object({
  zipCode: z.string().optional().describe('5-digit zip code'),
  city: z.string().optional().describe('City name'),
  state: z.string().optional().describe('2-letter state code'),
  county: z.string().optional().describe('County name'),
});

const getMarketVelocityOutput = z.object({
  success: z.boolean(),
  data: z.object({
    zipCode: z.string(),
    velocityIndex: z.number(),
    classification: z.string(),
    avgDaysOnMarket: z.number(),
    monthsOfInventory: z.number(),
    absorptionRate: z.number(),
    permitVolume: z.number(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  interpretation: z.string(),
});

type GetMarketVelocityInput = z.infer<typeof getMarketVelocityInput>;
type GetMarketVelocityOutput = z.infer<typeof getMarketVelocityOutput>;

const getMarketVelocityDefinition: ToolDefinition<GetMarketVelocityInput, GetMarketVelocityOutput> = {
  id: 'market_velocity.get_velocity',
  name: 'Get Market Velocity',
  description: `Get the Market Velocity Index for a specific location. The velocity index
    measures buyer demand intensity on a 0-100 scale. Higher scores mean properties sell
    faster and wholesalers can assign contracts more confidently. Use this when users ask
    about market heat, buyer demand, how fast things are selling, or whether an area is
    good for wholesaling.`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: getMarketVelocityInput,
  outputSchema: getMarketVelocityOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 30,
  tags: ['velocity', 'market', 'demand', 'wholesaling', 'heat'],
};

const getMarketVelocityHandler: ToolHandler<GetMarketVelocityInput, GetMarketVelocityOutput> = async (input) => {
  console.log('[Market Velocity] Getting velocity for:', input);

  try {
    if (!input.zipCode && !input.city) {
      throw new Error('Either zipCode or city is required');
    }

    const velocity = await getVelocityForZipCode(input.zipCode || '');

    const interpretation = generateWholesaleImplications(velocity);

    return {
      success: true,
      data: {
        zipCode: velocity.zipCode,
        velocityIndex: velocity.velocityIndex,
        classification: velocity.classification,
        avgDaysOnMarket: velocity.avgDaysOnMarket,
        monthsOfInventory: velocity.monthsOfInventory,
        absorptionRate: velocity.absorptionRate,
        permitVolume: velocity.permitVolume,
        city: velocity.city,
        state: velocity.state,
      },
      interpretation,
    };
  } catch (error) {
    console.error('[Market Velocity] Error:', error);
    throw error;
  }
};

// =============================================
// 2. Find Hot Markets Tool
// =============================================

const findHotMarketsInput = z.object({
  state: z.string().optional().describe('Filter to specific state (2-letter code)'),
  region: z.enum(['northeast', 'southeast', 'midwest', 'southwest', 'west']).optional()
    .describe('Filter to region'),
  minVelocity: z.number().default(70).describe('Minimum velocity score (default 70 = Hot)'),
  limit: z.number().default(20).describe('Number of results to return'),
});

const findHotMarketsOutput = z.object({
  success: z.boolean(),
  count: z.number(),
  markets: z.array(z.object({
    zipCode: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    velocityIndex: z.number(),
    classification: z.string(),
  })),
  summary: z.string(),
});

type FindHotMarketsInput = z.infer<typeof findHotMarketsInput>;
type FindHotMarketsOutput = z.infer<typeof findHotMarketsOutput>;

const findHotMarketsDefinition: ToolDefinition<FindHotMarketsInput, FindHotMarketsOutput> = {
  id: 'market_velocity.find_hot_markets',
  name: 'Find Hot Markets',
  description: `Find markets with high buyer velocity/demand. Use when users say things
    like "show me hot areas", "where should I focus", "find markets with high demand",
    "where are things selling fast", or "best areas for wholesaling". Can filter by state
    or region.`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: findHotMarketsInput,
  outputSchema: findHotMarketsOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 20,
  tags: ['velocity', 'hot', 'markets', 'demand', 'wholesaling'],
};

const findHotMarketsHandler: ToolHandler<FindHotMarketsInput, FindHotMarketsOutput> = async (input) => {
  console.log('[Market Velocity] Finding hot markets:', input);

  try {
    const markets = await findHotMarkets({
      state: input.state,
      region: input.region,
      minVelocity: input.minVelocity,
      limit: input.limit,
    });

    return {
      success: true,
      count: markets.length,
      markets: markets.map((m) => ({
        zipCode: m.zipCode,
        city: m.city,
        state: m.state,
        velocityIndex: m.velocityIndex,
        classification: m.classification,
      })),
      summary: `Found ${markets.length} markets with velocity >= ${input.minVelocity}`,
    };
  } catch (error) {
    console.error('[Market Velocity] Error finding hot markets:', error);
    throw error;
  }
};

// =============================================
// 3. Find Cold Markets Tool
// =============================================

const findColdMarketsInput = z.object({
  state: z.string().optional(),
  maxVelocity: z.number().default(40).describe('Maximum velocity score'),
  limit: z.number().default(20),
});

const findColdMarketsOutput = z.object({
  success: z.boolean(),
  count: z.number(),
  markets: z.array(z.object({
    zipCode: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    velocityIndex: z.number(),
    classification: z.string(),
  })),
  warning: z.string(),
});

type FindColdMarketsInput = z.infer<typeof findColdMarketsInput>;
type FindColdMarketsOutput = z.infer<typeof findColdMarketsOutput>;

const findColdMarketsDefinition: ToolDefinition<FindColdMarketsInput, FindColdMarketsOutput> = {
  id: 'market_velocity.find_cold_markets',
  name: 'Find Cold Markets',
  description: `Find markets with low buyer velocity - useful for identifying areas to
    avoid or for finding deep value plays (though risky for wholesaling). Use when users
    ask about slow markets, cold areas, or places to avoid.`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: findColdMarketsInput,
  outputSchema: findColdMarketsOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 20,
  tags: ['velocity', 'cold', 'markets', 'slow', 'avoid'],
};

const findColdMarketsHandler: ToolHandler<FindColdMarketsInput, FindColdMarketsOutput> = async (input) => {
  console.log('[Market Velocity] Finding cold markets:', input);

  try {
    const markets = await findColdMarkets({
      state: input.state,
      maxVelocity: input.maxVelocity,
      limit: input.limit,
    });

    return {
      success: true,
      count: markets.length,
      markets: markets.map((m) => ({
        zipCode: m.zipCode,
        city: m.city,
        state: m.state,
        velocityIndex: m.velocityIndex,
        classification: m.classification,
      })),
      warning: 'Low velocity markets have higher assignment risk',
    };
  } catch (error) {
    console.error('[Market Velocity] Error finding cold markets:', error);
    throw error;
  }
};

// =============================================
// 4. Compare Market Velocity Tool
// =============================================

const compareMarketVelocityInput = z.object({
  locations: z.array(z.object({
    zipCode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  })).min(2).max(10).describe('List of locations to compare'),
});

const compareMarketVelocityOutput = z.object({
  success: z.boolean(),
  rankings: z.array(z.object({
    rank: z.number(),
    location: z.string(),
    velocityIndex: z.number(),
    classification: z.string(),
  })),
  winner: z.object({
    zipCode: z.string(),
    city: z.string().optional(),
    velocityIndex: z.number(),
    classification: z.string(),
  }),
  analysis: z.string(),
});

type CompareMarketVelocityInput = z.infer<typeof compareMarketVelocityInput>;
type CompareMarketVelocityOutput = z.infer<typeof compareMarketVelocityOutput>;

const compareMarketVelocityDefinition: ToolDefinition<CompareMarketVelocityInput, CompareMarketVelocityOutput> = {
  id: 'market_velocity.compare_markets',
  name: 'Compare Market Velocity',
  description: `Compare market velocity between multiple locations. Use when users want
    to compare markets, decide between areas, or understand relative demand. Examples:
    "compare Tampa and Orlando", "which is hotter, Buffalo or Syracuse?", "rank these
    zip codes by demand".`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: compareMarketVelocityInput,
  outputSchema: compareMarketVelocityOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 15,
  tags: ['velocity', 'compare', 'markets', 'rank'],
};

const compareMarketVelocityHandler: ToolHandler<CompareMarketVelocityInput, CompareMarketVelocityOutput> = async (input) => {
  console.log('[Market Velocity] Comparing markets:', input.locations);

  try {
    const comparison = await compareMarketVelocity(input.locations);

    return {
      success: true,
      rankings: comparison.rankings.map((m, i) => ({
        rank: i + 1,
        location: m.city || m.zipCode,
        velocityIndex: m.velocityIndex,
        classification: m.classification,
      })),
      winner: {
        zipCode: comparison.winner.zipCode,
        city: comparison.winner.city,
        velocityIndex: comparison.winner.velocityIndex,
        classification: comparison.winner.classification,
      },
      analysis: comparison.analysis,
    };
  } catch (error) {
    console.error('[Market Velocity] Error comparing markets:', error);
    throw error;
  }
};

// =============================================
// 5. Explain Velocity Score Tool
// =============================================

const explainVelocityScoreInput = z.object({
  zipCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

const explainVelocityScoreOutput = z.object({
  success: z.boolean(),
  location: z.string(),
  overallScore: z.number(),
  classification: z.string(),
  breakdown: z.object({
    daysOnMarket: z.object({
      score: z.number(),
      weight: z.string(),
      rawValue: z.number(),
      interpretation: z.string(),
    }),
    absorption: z.object({
      score: z.number(),
      weight: z.string(),
      rawValue: z.number(),
      interpretation: z.string(),
    }),
    inventory: z.object({
      score: z.number(),
      weight: z.string(),
      rawValue: z.number(),
      interpretation: z.string(),
    }),
    permitActivity: z.object({
      score: z.number(),
      weight: z.string(),
      rawValue: z.number(),
      interpretation: z.string(),
    }),
    investmentConviction: z.object({
      score: z.number(),
      weight: z.string(),
      rawValue: z.number(),
      interpretation: z.string(),
    }),
  }),
  wholesaleImplications: z.string(),
});

type ExplainVelocityScoreInput = z.infer<typeof explainVelocityScoreInput>;
type ExplainVelocityScoreOutput = z.infer<typeof explainVelocityScoreOutput>;

const explainVelocityScoreDefinition: ToolDefinition<ExplainVelocityScoreInput, ExplainVelocityScoreOutput> = {
  id: 'market_velocity.explain_score',
  name: 'Explain Velocity Score',
  description: `Explain why a specific area has its velocity score. Breaks down the
    component factors (DOM, absorption, inventory, permit activity). Use when users ask
    "why is this area hot?", "what's driving demand here?", "explain this score".`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: explainVelocityScoreInput,
  outputSchema: explainVelocityScoreOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 30,
  tags: ['velocity', 'explain', 'breakdown', 'analysis'],
};

const explainVelocityScoreHandler: ToolHandler<ExplainVelocityScoreInput, ExplainVelocityScoreOutput> = async (input) => {
  console.log('[Market Velocity] Explaining score for:', input);

  try {
    const velocity = await getVelocityForZipCode(input.zipCode || '');

    return {
      success: true,
      location: velocity.city || velocity.zipCode,
      overallScore: velocity.velocityIndex,
      classification: velocity.classification,
      breakdown: {
        daysOnMarket: {
          score: velocity.daysOnMarketScore,
          weight: '40%',
          rawValue: velocity.avgDaysOnMarket,
          interpretation: interpretDOM(velocity.avgDaysOnMarket),
        },
        absorption: {
          score: velocity.absorptionScore,
          weight: '25%',
          rawValue: velocity.absorptionRate,
          interpretation: interpretAbsorption(velocity.absorptionRate),
        },
        inventory: {
          score: velocity.inventoryScore,
          weight: '10%',
          rawValue: velocity.monthsOfInventory,
          interpretation: interpretInventory(velocity.monthsOfInventory),
        },
        permitActivity: {
          score: velocity.permitActivityScore,
          weight: '15%',
          rawValue: velocity.permitVolume,
          interpretation: interpretPermits(velocity.permitVolume),
        },
        investmentConviction: {
          score: velocity.investmentConvictionScore,
          weight: '10%',
          rawValue: velocity.permitValueTotal,
          interpretation: interpretInvestment(velocity.permitValueTotal),
        },
      },
      wholesaleImplications: generateWholesaleImplications(velocity),
    };
  } catch (error) {
    console.error('[Market Velocity] Error explaining score:', error);
    throw error;
  }
};

// =============================================
// 6. Get Velocity Trend Tool
// =============================================

const getVelocityTrendInput = z.object({
  zipCode: z.string(),
  timeframe: z.enum(['30d', '90d', '6m', '1y']).default('90d'),
});

const getVelocityTrendOutput = z.object({
  success: z.boolean(),
  zipCode: z.string(),
  currentVelocity: z.number(),
  previousVelocity: z.number(),
  change: z.number(),
  trend: z.enum(['Rising', 'Stable', 'Falling']),
  trendStrength: z.enum(['Strong', 'Moderate', 'Weak']),
  history: z.array(z.object({
    date: z.string(),
    velocityIndex: z.number(),
    classification: z.string(),
  })),
  forecast: z.object({
    predictedVelocity: z.number(),
    confidence: z.number(),
  }).optional(),
});

type GetVelocityTrendInput = z.infer<typeof getVelocityTrendInput>;
type GetVelocityTrendOutput = z.infer<typeof getVelocityTrendOutput>;

const getVelocityTrendDefinition: ToolDefinition<GetVelocityTrendInput, GetVelocityTrendOutput> = {
  id: 'market_velocity.get_trend',
  name: 'Get Velocity Trend',
  description: `Get the historical trend of market velocity for an area. Shows whether
    the market is heating up, cooling down, or stable. Use when users ask "is this market
    getting hotter?", "how has demand changed?", "velocity trend".`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: getVelocityTrendInput,
  outputSchema: getVelocityTrendOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 30,
  tags: ['velocity', 'trend', 'history', 'forecast'],
};

const getVelocityTrendHandler: ToolHandler<GetVelocityTrendInput, GetVelocityTrendOutput> = async (input) => {
  console.log('[Market Velocity] Getting trend for:', input.zipCode);

  try {
    const trend = await getVelocityTrend(input.zipCode, input.timeframe);

    return {
      success: true,
      zipCode: trend.zipCode,
      currentVelocity: trend.currentVelocity,
      previousVelocity: trend.previousVelocity,
      change: trend.change,
      trend: trend.trend,
      trendStrength: trend.trendStrength,
      history: trend.history,
      forecast: trend.forecast,
    };
  } catch (error) {
    console.error('[Market Velocity] Error getting trend:', error);
    throw error;
  }
};

// =============================================
// 7. Get Velocity Rankings Tool
// =============================================

const getVelocityRankingsInput = z.object({
  type: z.enum(['top', 'bottom']).default('top'),
  limit: z.number().default(20),
  state: z.string().optional(),
});

const getVelocityRankingsOutput = z.object({
  success: z.boolean(),
  rankings: z.array(z.object({
    rank: z.number(),
    zipCode: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    velocityIndex: z.number(),
    classification: z.string(),
  })),
});

type GetVelocityRankingsInput = z.infer<typeof getVelocityRankingsInput>;
type GetVelocityRankingsOutput = z.infer<typeof getVelocityRankingsOutput>;

const getVelocityRankingsDefinition: ToolDefinition<GetVelocityRankingsInput, GetVelocityRankingsOutput> = {
  id: 'market_velocity.get_rankings',
  name: 'Get Velocity Rankings',
  description: `Get ranked list of markets by velocity. Use when users want to see
    "top markets", "best performing areas", "highest velocity zip codes", or rankings.`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: getVelocityRankingsInput,
  outputSchema: getVelocityRankingsOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['velocity', 'rankings', 'top', 'bottom'],
};

const getVelocityRankingsHandler: ToolHandler<GetVelocityRankingsInput, GetVelocityRankingsOutput> = async (input) => {
  console.log('[Market Velocity] Getting rankings:', input);

  try {
    const rankings = await getVelocityRankings(input.type, input.limit, input.state);

    return {
      success: true,
      rankings: rankings.map((m, i) => ({
        rank: i + 1,
        zipCode: m.zipCode,
        city: m.city,
        state: m.state,
        velocityIndex: m.velocityIndex,
        classification: m.classification,
      })),
    };
  } catch (error) {
    console.error('[Market Velocity] Error getting rankings:', error);
    throw error;
  }
};

// =============================================
// 8. Get Velocity for Bounds Tool (Heat Map)
// =============================================

const getVelocityForBoundsInput = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

const getVelocityForBoundsOutput = z.object({
  success: z.boolean(),
  dataPoints: z.array(z.object({
    zipCode: z.string(),
    velocityIndex: z.number(),
    classification: z.string(),
    centerLat: z.number(),
    centerLng: z.number(),
  })),
  count: z.number(),
});

type GetVelocityForBoundsInput = z.infer<typeof getVelocityForBoundsInput>;
type GetVelocityForBoundsOutput = z.infer<typeof getVelocityForBoundsOutput>;

const getVelocityForBoundsDefinition: ToolDefinition<GetVelocityForBoundsInput, GetVelocityForBoundsOutput> = {
  id: 'market_velocity.get_for_bounds',
  name: 'Get Velocity for Map Bounds',
  description: `Get velocity data for a geographic bounding box. Used internally for
    heat map rendering.`,
  category: 'market_analysis',
  requiredPermission: 'read',
  inputSchema: getVelocityForBoundsInput,
  outputSchema: getVelocityForBoundsOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['velocity', 'bounds', 'heatmap', 'map'],
};

const getVelocityForBoundsHandler: ToolHandler<GetVelocityForBoundsInput, GetVelocityForBoundsOutput> = async (input) => {
  console.log('[Market Velocity] Getting velocity for bounds');

  try {
    const data = await getVelocityForBounds(input);

    return {
      success: true,
      dataPoints: data.map((d) => ({
        zipCode: d.zipCode,
        velocityIndex: d.velocityIndex,
        classification: d.classification,
        centerLat: d.centerLat || 0,
        centerLng: d.centerLng || 0,
      })),
      count: data.length,
    };
  } catch (error) {
    console.error('[Market Velocity] Error getting velocity for bounds:', error);
    throw error;
  }
};

// =============================================
// Register All Market Velocity Tools
// =============================================

export function registerMarketVelocityTools(): void {
  toolRegistry.register(getMarketVelocityDefinition, getMarketVelocityHandler);
  toolRegistry.register(findHotMarketsDefinition, findHotMarketsHandler);
  toolRegistry.register(findColdMarketsDefinition, findColdMarketsHandler);
  toolRegistry.register(compareMarketVelocityDefinition, compareMarketVelocityHandler);
  toolRegistry.register(explainVelocityScoreDefinition, explainVelocityScoreHandler);
  toolRegistry.register(getVelocityTrendDefinition, getVelocityTrendHandler);
  toolRegistry.register(getVelocityRankingsDefinition, getVelocityRankingsHandler);
  toolRegistry.register(getVelocityForBoundsDefinition, getVelocityForBoundsHandler);

  console.log('[Market Velocity Tools] Registered 8 tools');
}

// Export tool definitions for reference
export const marketVelocityTools = {
  getMarketVelocity: getMarketVelocityDefinition,
  findHotMarkets: findHotMarketsDefinition,
  findColdMarkets: findColdMarketsDefinition,
  compareMarketVelocity: compareMarketVelocityDefinition,
  explainVelocityScore: explainVelocityScoreDefinition,
  getVelocityTrend: getVelocityTrendDefinition,
  getVelocityRankings: getVelocityRankingsDefinition,
  getVelocityForBounds: getVelocityForBoundsDefinition,
};
