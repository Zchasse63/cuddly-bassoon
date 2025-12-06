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

const performanceSummaryDefinition: ToolDefinition<
  PerformanceSummaryInput,
  PerformanceSummaryOutput
> = {
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

const performanceSummaryHandler: ToolHandler<
  PerformanceSummaryInput,
  PerformanceSummaryOutput
> = async (input) => {
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
    // Query deals from database - use actual columns that exist
    const { data: deals, error } = await supabase
      .from('deals')
      .select(
        'id, status, stage, assignment_fee, offer_price, contract_price, property_address, created_at, updated_at'
      )
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
    // Check both status='completed' and stage='closed'
    const closedDeals = deals.filter(
      (d) => d.status === 'completed' || d.stage === 'closed'
    ).length;

    // Calculate metrics from closed deals
    const closedDealData = deals.filter((d) => d.status === 'completed' || d.stage === 'closed');

    let totalRevenue = 0;
    let totalProfit = 0;
    let roiSum = 0;
    let roiCount = 0;
    let daysSum = 0;
    let daysCount = 0;

    // Track profit by market (extract city/state from address)
    const marketProfits: Record<string, number> = {};

    for (const deal of closedDealData) {
      // Revenue = assignment fee
      const revenue = deal.assignment_fee || 0;
      totalRevenue += revenue;

      // Profit is the assignment fee (in wholesale, assignment fee IS the profit)
      const profit = deal.assignment_fee || 0;
      totalProfit += profit;

      // Calculate ROI if we have offer_price (investment)
      if (deal.offer_price && profit > 0) {
        const roi = (profit / deal.offer_price) * 100;
        roiSum += roi;
        roiCount++;
      }

      // Calculate days in pipeline from created_at to updated_at
      if (deal.created_at && deal.updated_at) {
        const days = Math.floor(
          (new Date(deal.updated_at).getTime() - new Date(deal.created_at).getTime()) /
            (24 * 60 * 60 * 1000)
        );
        if (days >= 0) {
          daysSum += days;
          daysCount++;
        }
      }

      // Extract market from address (simplified: just use "Unknown" for now)
      const market = 'Unknown';
      marketProfits[market] = (marketProfits[market] || 0) + profit;
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
  strategies: z.array(
    z.object({
      name: z.string(),
      dealCount: z.number(),
      avgRoi: z.number(),
      totalProfit: z.number(),
      avgHoldTime: z.number(),
      successRate: z.number(),
    })
  ),
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

const roiByStrategyHandler: ToolHandler<RoiByStrategyInput, RoiByStrategyOutput> = async (
  input
) => {
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
      .select('id, status, stage, assignment_fee, offer_price, created_at, updated_at')
      .gte('created_at', fromDate.toISOString());

    if (error || !deals || deals.length === 0) {
      return {
        strategies: [],
        dataAvailable: !!deals,
      };
    }

    // Group by stage (use as strategy proxy)
    const strategyData: Record<
      string,
      {
        deals: number;
        closed: number;
        roiSum: number;
        roiCount: number;
        profitSum: number;
        holdTimeSum: number;
        holdTimeCount: number;
      }
    > = {};

    for (const deal of deals) {
      // Use stage as a strategy proxy (wholesale is the main strategy)
      const strategy = 'Wholesale'; // Default strategy since we don't have deal_type

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

      if (deal.status === 'completed' || deal.stage === 'closed') {
        data.closed++;
        const profit = deal.assignment_fee || 0;
        if (profit) data.profitSum += profit;
        if (deal.offer_price && profit > 0) {
          const roi = (profit / deal.offer_price) * 100;
          data.roiSum += roi;
          data.roiCount++;
        }
        if (deal.created_at && deal.updated_at) {
          const days = Math.floor(
            (new Date(deal.updated_at).getTime() - new Date(deal.created_at).getTime()) /
              (24 * 60 * 60 * 1000)
          );
          if (days >= 0) {
            data.holdTimeSum += days;
            data.holdTimeCount++;
          }
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
    const bestStrategy =
      sortedByRoi[0] && sortedByRoi[0].dealCount >= 2
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
  locations: z.array(
    z.object({
      name: z.string(),
      dealCount: z.number(),
      totalInvested: z.number(),
      totalProfit: z.number(),
      avgRoi: z.number(),
      riskScore: z.number(),
    })
  ),
  diversificationScore: z.number(),
  recommendation: z.string(),
  dataAvailable: z.boolean(),
});

type GeographicConcentrationInput = z.infer<typeof geographicConcentrationInput>;
type GeographicConcentrationOutput = z.infer<typeof geographicConcentrationOutput>;

const geographicConcentrationDefinition: ToolDefinition<
  GeographicConcentrationInput,
  GeographicConcentrationOutput
> = {
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

const geographicConcentrationHandler: ToolHandler<
  GeographicConcentrationInput,
  GeographicConcentrationOutput
> = async (input) => {
  console.log('[Portfolio] Geographic concentration by:', input.groupBy);

  const supabase = await createClient();

  try {
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, property_address, offer_price, assignment_fee, status, stage');

    if (error || !deals || deals.length === 0) {
      return {
        locations: [],
        diversificationScore: 0,
        recommendation:
          'No deal data available. Start tracking deals to analyze geographic concentration.',
        dataAvailable: !!deals,
      };
    }

    // Group by location (extract from property_address)
    const locationData: Record<
      string,
      {
        dealCount: number;
        totalInvested: number;
        totalProfit: number;
        roiSum: number;
        roiCount: number;
      }
    > = {};

    for (const deal of deals) {
      // Try to extract location from property_address
      // Address format is typically: "123 Main St, City, ST 12345"
      let locationKey = 'Unknown';
      if (deal.property_address) {
        const parts = deal.property_address.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          // Try to extract state from last part (e.g., "ST 12345" -> "ST")
          const lastPart = parts[parts.length - 1] || '';
          const stateMatch = lastPart.match(/([A-Z]{2})\s*\d*/);
          const state = stateMatch ? stateMatch[1] : '';
          const city = parts.length >= 3 ? parts[parts.length - 2] : parts[1];

          switch (input.groupBy) {
            case 'state':
              locationKey = state || 'Unknown';
              break;
            case 'zip':
              const zipMatch = lastPart.match(/\d{5}/);
              locationKey = zipMatch ? zipMatch[0] : 'Unknown';
              break;
            case 'city':
            default:
              locationKey = city && state ? `${city}, ${state}` : city || 'Unknown';
          }
        }
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

      if (deal.offer_price) {
        data.totalInvested += deal.offer_price;
      }

      const profit = deal.assignment_fee || 0;
      if (profit && (deal.status === 'completed' || deal.stage === 'closed')) {
        data.totalProfit += profit;
      }

      if (deal.offer_price && profit > 0) {
        const roi = (profit / deal.offer_price) * 100;
        data.roiSum += roi;
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
      return sum + share * share;
    }, 0);

    // Diversification = 1 - HHI, scaled to 0-100
    const diversificationScore = Math.round((1 - concentrationIndex) * 100);

    // Generate recommendation
    let recommendation: string;
    if (diversificationScore >= 70) {
      recommendation =
        'Well-diversified portfolio across multiple markets. Continue balanced approach.';
    } else if (diversificationScore >= 40) {
      recommendation = `Moderate concentration. Consider expanding to ${Math.max(1, 3 - uniqueLocations)} additional markets.`;
    } else if (diversificationScore >= 20) {
      recommendation =
        'High geographic concentration increases market-specific risk. Strongly recommend diversification.';
    } else {
      recommendation =
        'Portfolio highly concentrated in a single market. Diversification critical for risk management.';
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
