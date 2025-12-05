/**
 * Portfolio Analysis Tools
 * Tools for analyzing investment portfolio performance
 *
 * Uses REAL data from:
 * - Supabase deals table for user's deal history
 * - Calculated metrics from actual closed deals
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Performance Summary Tool
// ============================================================================
const performanceSummaryInput = z.object({
  timeframe: z.enum(['30d', '90d', '1y', 'ytd', 'all']).default('ytd'),
  includeProjections: z.boolean().default(true),
});

const performanceSummaryOutput = z.object({
  totalDeals: z.number(),
  closedDeals: z.number(),
  totalRevenue: z.number(),
  totalProfit: z.number(),
  avgRoi: z.number(),
  avgDaysToClose: z.number(),
  topPerformingMarket: z.object({ name: z.string(), profit: z.number() }).optional(),
  projectedAnnualProfit: z.number().optional(),
  dataAvailable: z.boolean(),
});

type PerformanceSummaryInput = z.infer<typeof performanceSummaryInput>;
type PerformanceSummaryOutput = z.infer<typeof performanceSummaryOutput>;

const performanceSummaryDefinition: ToolDefinition<PerformanceSummaryInput, PerformanceSummaryOutput> = {
  id: 'portfolio.performance_summary',
  name: 'Portfolio Performance Summary',
  description: 'Get a comprehensive summary of portfolio performance from actual deal data.',
  category: 'portfolio',
  requiredPermission: 'read',
  inputSchema: performanceSummaryInput,
  outputSchema: performanceSummaryOutput,
  requiresConfirmation: false,
  estimatedDuration: 4000,
  rateLimit: 20,
  tags: ['portfolio', 'performance', 'summary', 'analytics'],
};

const performanceSummaryHandler: ToolHandler<PerformanceSummaryInput, PerformanceSummaryOutput> = async (input) => {
  console.log('[Portfolio] Performance summary:', input.timeframe);

  const supabase = await createClient();

  // Calculate date range based on timeframe
  const now = new Date();
  let fromDate: Date;

  switch (input.timeframe) {
    case '30d':
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'ytd':
      fromDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      fromDate = new Date('2000-01-01');
  }

  try {
    // Query deals from database
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, status, close_date, profit, roi, days_in_pipeline, city, state, assignment_fee, purchase_price')
      .gte('created_at', fromDate.toISOString());

    if (error) {
      console.error('[Portfolio] Database error:', error);
      return {
        totalDeals: 0,
        closedDeals: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgRoi: 0,
        avgDaysToClose: 0,
        dataAvailable: false,
      };
    }

    if (!deals || deals.length === 0) {
      return {
        totalDeals: 0,
        closedDeals: 0,
        totalRevenue: 0,
        totalProfit: 0,
        avgRoi: 0,
        avgDaysToClose: 0,
        dataAvailable: true,
      };
    }

    const totalDeals = deals.length;
    const closedDeals = deals.filter(d => d.status === 'closed' || d.status === 'won').length;

    // Calculate metrics from closed deals
    const closedDealData = deals.filter(d => d.status === 'closed' || d.status === 'won');

    let totalRevenue = 0;
    let totalProfit = 0;
    let roiSum = 0;
    let roiCount = 0;
    let daysSum = 0;
    let daysCount = 0;

    // Track profit by market
    const marketProfits: Record<string, number> = {};

    for (const deal of closedDealData) {
      // Revenue = assignment fee or profit
      const revenue = deal.assignment_fee || deal.profit || 0;
      totalRevenue += revenue;

      if (deal.profit) {
        totalProfit += deal.profit;
      }

      if (deal.roi) {
        roiSum += deal.roi;
        roiCount++;
      }

      if (deal.days_in_pipeline) {
        daysSum += deal.days_in_pipeline;
        daysCount++;
      }

      // Track by market
      const market = deal.city && deal.state ? `${deal.city}, ${deal.state}` : 'Unknown';
      marketProfits[market] = (marketProfits[market] || 0) + (deal.profit || 0);
    }

    const avgRoi = roiCount > 0 ? Math.round((roiSum / roiCount) * 100) / 100 : 0;
    const avgDaysToClose = daysCount > 0 ? Math.round(daysSum / daysCount) : 0;

    // Find top performing market
    let topPerformingMarket: { name: string; profit: number } | undefined;
    let maxProfit = 0;
    for (const [market, profit] of Object.entries(marketProfits)) {
      if (profit > maxProfit) {
        maxProfit = profit;
        topPerformingMarket = { name: market, profit };
      }
    }

    // Calculate projected annual profit if requested
    let projectedAnnualProfit: number | undefined;
    if (input.includeProjections && closedDeals > 0) {
      const daysCovered = (now.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000);
      if (daysCovered > 0) {
        const dailyProfit = totalProfit / daysCovered;
        projectedAnnualProfit = Math.round(dailyProfit * 365);
      }
    }

    return {
      totalDeals,
      closedDeals,
      totalRevenue: Math.round(totalRevenue),
      totalProfit: Math.round(totalProfit),
      avgRoi,
      avgDaysToClose,
      topPerformingMarket,
      projectedAnnualProfit,
      dataAvailable: true,
    };
  } catch (error) {
    console.error('[Portfolio] Error calculating performance:', error);
    return {
      totalDeals: 0,
      closedDeals: 0,
      totalRevenue: 0,
      totalProfit: 0,
      avgRoi: 0,
      avgDaysToClose: 0,
      dataAvailable: false,
    };
  }
};

// ============================================================================
// ROI by Strategy Tool
// ============================================================================
const roiByStrategyInput = z.object({
  timeframe: z.enum(['30d', '90d', '1y', 'ytd', 'all']).default('1y'),
  strategies: z.array(z.string()).optional(),
});

const roiByStrategyOutput = z.object({
  strategies: z.array(z.object({
    name: z.string(),
    dealCount: z.number(),
    avgRoi: z.number(),
    totalProfit: z.number(),
    avgHoldTime: z.number(),
    successRate: z.number(),
  })),
  bestStrategy: z.object({ name: z.string(), reason: z.string() }).optional(),
  dataAvailable: z.boolean(),
});

type RoiByStrategyInput = z.infer<typeof roiByStrategyInput>;
type RoiByStrategyOutput = z.infer<typeof roiByStrategyOutput>;

const roiByStrategyDefinition: ToolDefinition<RoiByStrategyInput, RoiByStrategyOutput> = {
  id: 'portfolio.roi_by_strategy',
  name: 'ROI by Strategy',
  description: 'Analyze ROI performance by investment strategy from actual deal data.',
  category: 'portfolio',
  requiredPermission: 'read',
  inputSchema: roiByStrategyInput,
  outputSchema: roiByStrategyOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 15,
  tags: ['portfolio', 'roi', 'strategy', 'analytics'],
};

const roiByStrategyHandler: ToolHandler<RoiByStrategyInput, RoiByStrategyOutput> = async (input) => {
  console.log('[Portfolio] ROI by strategy:', input.timeframe);

  const supabase = await createClient();

  // Calculate date range
  const now = new Date();
  let fromDate: Date;

  switch (input.timeframe) {
    case '30d':
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'ytd':
      fromDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      fromDate = new Date('2000-01-01');
  }

  try {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, status, deal_type, profit, roi, days_in_pipeline')
      .gte('created_at', fromDate.toISOString());

    if (error || !deals || deals.length === 0) {
      return {
        strategies: [],
        dataAvailable: !!deals,
      };
    }

    // Group by strategy/deal_type
    const strategyData: Record<string, {
      deals: number;
      closed: number;
      roiSum: number;
      roiCount: number;
      profitSum: number;
      holdTimeSum: number;
      holdTimeCount: number;
    }> = {};

    for (const deal of deals) {
      const strategy = deal.deal_type || 'Unknown';

      if (!strategyData[strategy]) {
        strategyData[strategy] = {
          deals: 0,
          closed: 0,
          roiSum: 0,
          roiCount: 0,
          profitSum: 0,
          holdTimeSum: 0,
          holdTimeCount: 0,
        };
      }

      const data = strategyData[strategy]!;
      data.deals++;

      if (deal.status === 'closed' || deal.status === 'won') {
        data.closed++;
        if (deal.profit) data.profitSum += deal.profit;
        if (deal.roi) {
          data.roiSum += deal.roi;
          data.roiCount++;
        }
        if (deal.days_in_pipeline) {
          data.holdTimeSum += deal.days_in_pipeline;
          data.holdTimeCount++;
        }
      }
    }

    // Convert to output format
    const strategies = Object.entries(strategyData).map(([name, data]) => ({
      name,
      dealCount: data.deals,
      avgRoi: data.roiCount > 0 ? Math.round((data.roiSum / data.roiCount) * 100) / 100 : 0,
      totalProfit: Math.round(data.profitSum),
      avgHoldTime: data.holdTimeCount > 0 ? Math.round(data.holdTimeSum / data.holdTimeCount) : 0,
      successRate: data.deals > 0 ? Math.round((data.closed / data.deals) * 100) : 0,
    }));

    // Sort by ROI to find best strategy
    const sortedByRoi = [...strategies].sort((a, b) => b.avgRoi - a.avgRoi);
    const bestStrategy = sortedByRoi[0] && sortedByRoi[0].dealCount >= 2
      ? {
          name: sortedByRoi[0].name,
          reason: `Highest average ROI (${sortedByRoi[0].avgRoi}%) with ${sortedByRoi[0].successRate}% success rate`,
        }
      : undefined;

    return {
      strategies,
      bestStrategy,
      dataAvailable: true,
    };
  } catch (error) {
    console.error('[Portfolio] Error calculating ROI by strategy:', error);
    return {
      strategies: [],
      dataAvailable: false,
    };
  }
};

// ============================================================================
// Geographic Concentration Tool
// ============================================================================
const geographicConcentrationInput = z.object({
  groupBy: z.enum(['state', 'city', 'zip']).default('city'),
  limit: z.number().default(10),
});

const geographicConcentrationOutput = z.object({
  locations: z.array(z.object({
    name: z.string(),
    dealCount: z.number(),
    totalInvested: z.number(),
    totalProfit: z.number(),
    avgRoi: z.number(),
    riskScore: z.number(),
  })),
  diversificationScore: z.number(),
  recommendation: z.string(),
  dataAvailable: z.boolean(),
});

type GeographicConcentrationInput = z.infer<typeof geographicConcentrationInput>;
type GeographicConcentrationOutput = z.infer<typeof geographicConcentrationOutput>;

const geographicConcentrationDefinition: ToolDefinition<GeographicConcentrationInput, GeographicConcentrationOutput> = {
  id: 'portfolio.geographic_concentration',
  name: 'Geographic Concentration Analysis',
  description: 'Analyze portfolio geographic concentration and diversification from actual data.',
  category: 'portfolio',
  requiredPermission: 'read',
  inputSchema: geographicConcentrationInput,
  outputSchema: geographicConcentrationOutput,
  requiresConfirmation: false,
  estimatedDuration: 4000,
  rateLimit: 20,
  tags: ['portfolio', 'geographic', 'diversification', 'risk'],
};

const geographicConcentrationHandler: ToolHandler<GeographicConcentrationInput, GeographicConcentrationOutput> = async (input) => {
  console.log('[Portfolio] Geographic concentration by:', input.groupBy);

  const supabase = await createClient();

  try {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, city, state, zip_code, purchase_price, profit, roi, status');

    if (error || !deals || deals.length === 0) {
      return {
        locations: [],
        diversificationScore: 0,
        recommendation: 'No deal data available. Start tracking deals to analyze geographic concentration.',
        dataAvailable: !!deals,
      };
    }

    // Group by location
    const locationData: Record<string, {
      dealCount: number;
      totalInvested: number;
      totalProfit: number;
      roiSum: number;
      roiCount: number;
    }> = {};

    for (const deal of deals) {
      let locationKey: string;

      switch (input.groupBy) {
        case 'state':
          locationKey = deal.state || 'Unknown';
          break;
        case 'zip':
          locationKey = deal.zip_code || 'Unknown';
          break;
        case 'city':
        default:
          locationKey = deal.city && deal.state ? `${deal.city}, ${deal.state}` : 'Unknown';
      }

      if (!locationData[locationKey]) {
        locationData[locationKey] = {
          dealCount: 0,
          totalInvested: 0,
          totalProfit: 0,
          roiSum: 0,
          roiCount: 0,
        };
      }

      const data = locationData[locationKey]!;
      data.dealCount++;

      if (deal.purchase_price) {
        data.totalInvested += deal.purchase_price;
      }

      if (deal.profit && (deal.status === 'closed' || deal.status === 'won')) {
        data.totalProfit += deal.profit;
      }

      if (deal.roi) {
        data.roiSum += deal.roi;
        data.roiCount++;
      }
    }

    // Convert to output format and calculate risk scores
    const totalDeals = deals.length;
    const locations = Object.entries(locationData)
      .map(([name, data]) => {
        // Risk score: higher concentration = higher risk (0-100)
        const concentrationPct = (data.dealCount / totalDeals) * 100;
        const riskScore = Math.min(100, Math.round(concentrationPct * 1.5));

        return {
          name,
          dealCount: data.dealCount,
          totalInvested: Math.round(data.totalInvested),
          totalProfit: Math.round(data.totalProfit),
          avgRoi: data.roiCount > 0 ? Math.round((data.roiSum / data.roiCount) * 100) / 100 : 0,
          riskScore,
        };
      })
      .sort((a, b) => b.dealCount - a.dealCount)
      .slice(0, input.limit);

    // Calculate diversification score (higher = more diversified)
    // Based on Herfindahl-Hirschman Index inverted
    const uniqueLocations = Object.keys(locationData).length;
    const concentrationIndex = Object.values(locationData).reduce((sum, data) => {
      const share = data.dealCount / totalDeals;
      return sum + (share * share);
    }, 0);

    // Diversification = 1 - HHI, scaled to 0-100
    const diversificationScore = Math.round((1 - concentrationIndex) * 100);

    // Generate recommendation
    let recommendation: string;
    if (diversificationScore >= 70) {
      recommendation = 'Well-diversified portfolio across multiple markets. Continue balanced approach.';
    } else if (diversificationScore >= 40) {
      recommendation = `Moderate concentration. Consider expanding to ${Math.max(1, 3 - uniqueLocations)} additional markets.`;
    } else if (diversificationScore >= 20) {
      recommendation = 'High geographic concentration increases market-specific risk. Strongly recommend diversification.';
    } else {
      recommendation = 'Portfolio highly concentrated in a single market. Diversification critical for risk management.';
    }

    return {
      locations,
      diversificationScore,
      recommendation,
      dataAvailable: true,
    };
  } catch (error) {
    console.error('[Portfolio] Error calculating geographic concentration:', error);
    return {
      locations: [],
      diversificationScore: 0,
      recommendation: 'Error analyzing portfolio data.',
      dataAvailable: false,
    };
  }
};

// ============================================================================
// Register All Portfolio Tools
// ============================================================================
export function registerPortfolioTools() {
  toolRegistry.register(performanceSummaryDefinition, performanceSummaryHandler);
  toolRegistry.register(roiByStrategyDefinition, roiByStrategyHandler);
  toolRegistry.register(geographicConcentrationDefinition, geographicConcentrationHandler);
  console.log('[Portfolio Tools] Registered 3 tools with real database queries');
}

export const portfolioTools = {
  performanceSummary: performanceSummaryDefinition,
  roiByStrategy: roiByStrategyDefinition,
  geographicConcentration: geographicConcentrationDefinition,
};
