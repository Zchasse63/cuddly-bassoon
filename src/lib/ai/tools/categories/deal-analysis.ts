/**
 * Deal Analysis Tools
 * Tools for analyzing wholesale deals
 *
 * Uses REAL APIs:
 * - RentCast for property valuations and comps
 * - Supabase for property data
 */

import { z } from 'zod';

import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { getRentCastClient } from '@/lib/rentcast';
import { createClient } from '@/lib/supabase/server';

// Analyze Deal Tool
const analyzeDealInput = z.object({
  propertyId: z.string(),
  askingPrice: z.number().optional(),
  estimatedRepairs: z.number().optional(),
  targetAssignmentFee: z.number().optional().default(10000),
});

const analyzeDealOutput = z.object({
  arv: z.number(),
  repairCost: z.number(),
  mao: z.number(),
  potentialProfit: z.number(),
  dealScore: z.number(),
  recommendation: z.enum(['strong_buy', 'buy', 'hold', 'pass']),
  risks: z.array(z.string()),
  opportunities: z.array(z.string()),
});

type AnalyzeDealInput = z.infer<typeof analyzeDealInput>;
type AnalyzeDealOutput = z.infer<typeof analyzeDealOutput>;

const analyzeDealDefinition: ToolDefinition<AnalyzeDealInput, AnalyzeDealOutput> = {
  id: 'deal_analysis.analyze',
  name: 'Analyze Deal',
  description: 'Perform comprehensive analysis of a wholesale deal including ARV, MAO, and profit calculations',
  category: 'deal_analysis',
  requiredPermission: 'read',
  inputSchema: analyzeDealInput,
  outputSchema: analyzeDealOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 20,
  tags: ['analysis', 'deal', 'arv', 'mao'],
};

const analyzeDealHandler: ToolHandler<AnalyzeDealInput, AnalyzeDealOutput> = async (input, _context) => {
  console.log('[Deal Analysis] Analyzing deal for property:', input.propertyId);

  try {
    // Get property data from Supabase first
    const supabase = await createClient();
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', input.propertyId)
      .single();

    let arv = 0;
    let compsCount = 0;

    // Try to get valuation from RentCast
    try {
      const client = getRentCastClient();
      if (property) {
        const valuation = await client.getValuation(property.address);
        arv = valuation.price || 0;
        compsCount = valuation.comparables?.length || 0;
        console.log(`[Deal Analysis] RentCast ARV: $${arv}`);
      }
    } catch (rentcastError) {
      console.warn('[Deal Analysis] RentCast valuation failed:', rentcastError);
      // Use property's stored ARV if available
      arv = property?.arv || property?.estimated_value || 0;
    }

    const repairCost = input.estimatedRepairs || 0;
    const assignmentFee = input.targetAssignmentFee;
    const investorMargin = 0.7; // 70% of ARV rule

    // MAO = ARV * 70% - Repairs - Assignment Fee
    const mao = Math.max(0, (arv * investorMargin) - repairCost - assignmentFee);
    const askingPrice = input.askingPrice || property?.asking_price || 0;
    const potentialProfit = askingPrice > 0 ? mao - askingPrice + assignmentFee : assignmentFee;

    // Calculate deal score (0-10)
    const risks: string[] = [];
    const opportunities: string[] = [];
    let dealScore = 5; // Start neutral

    // Adjust score based on margins
    const spreadPercent = arv > 0 ? ((mao - askingPrice) / arv) * 100 : 0;
    if (spreadPercent > 20) { dealScore += 2; opportunities.push('Excellent margin potential'); }
    else if (spreadPercent > 10) { dealScore += 1; opportunities.push('Good margin potential'); }
    else if (spreadPercent < 0) { dealScore -= 2; risks.push('Negative spread - deal not viable'); }
    else if (spreadPercent < 5) { dealScore -= 1; risks.push('Thin margins'); }

    // Adjust based on repair costs
    if (repairCost > arv * 0.3) { dealScore -= 1; risks.push('High repair costs (>30% of ARV)'); }
    if (repairCost < arv * 0.1) { dealScore += 1; opportunities.push('Low repair requirements'); }

    // Adjust based on comps availability
    if (compsCount >= 5) { opportunities.push(`Strong comp support (${compsCount} comps)`); }
    else if (compsCount < 3) { risks.push('Limited comparable sales data'); }

    // Clamp score
    dealScore = Math.max(1, Math.min(10, dealScore));

    // Determine recommendation
    let recommendation: 'strong_buy' | 'buy' | 'hold' | 'pass' = 'hold';
    if (dealScore >= 8) recommendation = 'strong_buy';
    else if (dealScore >= 6) recommendation = 'buy';
    else if (dealScore <= 3) recommendation = 'pass';

    return {
      arv,
      repairCost,
      mao,
      potentialProfit,
      dealScore,
      recommendation,
      risks,
      opportunities,
    };
  } catch (error) {
    console.error('[Deal Analysis] Error:', error);
    throw new Error(`Deal analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Calculate MAO Tool
const calculateMaoInput = z.object({
  arv: z.number(),
  repairCost: z.number(),
  assignmentFee: z.number().optional().default(10000),
  investorMargin: z.number().optional().default(0.7),
});

const calculateMaoOutput = z.object({
  mao: z.number(),
  breakdown: z.object({
    arvPercentage: z.number(),
    repairDeduction: z.number(),
    feeDeduction: z.number(),
  }),
});

type CalculateMaoInput = z.infer<typeof calculateMaoInput>;
type CalculateMaoOutput = z.infer<typeof calculateMaoOutput>;

const calculateMaoDefinition: ToolDefinition<CalculateMaoInput, CalculateMaoOutput> = {
  id: 'deal_analysis.calculate_mao',
  name: 'Calculate MAO',
  description: 'Calculate Maximum Allowable Offer based on ARV, repairs, and desired margins',
  category: 'deal_analysis',
  requiredPermission: 'read',
  inputSchema: calculateMaoInput,
  outputSchema: calculateMaoOutput,
  requiresConfirmation: false,
  estimatedDuration: 100,
  rateLimit: 100,
  tags: ['mao', 'calculation', 'offer'],
};

const calculateMaoHandler: ToolHandler<CalculateMaoInput, CalculateMaoOutput> = async (input, _context) => {
  const arvPercentage = input.arv * input.investorMargin;
  const mao = arvPercentage - input.repairCost - input.assignmentFee;
  
  return {
    mao: Math.max(0, mao),
    breakdown: {
      arvPercentage,
      repairDeduction: input.repairCost,
      feeDeduction: input.assignmentFee,
    },
  };
};

// Score Deal Tool
const scoreDealInput = z.object({
  propertyId: z.string(),
  factors: z.object({
    motivationScore: z.number().optional(),
    equityPercent: z.number().optional(),
    daysOnMarket: z.number().optional(),
    priceReductions: z.number().optional(),
    marketTrend: z.enum(['up', 'stable', 'down']).optional(),
  }).optional(),
});

const scoreDealOutput = z.object({
  overallScore: z.number(),
  factorScores: z.record(z.string(), z.number()),
  confidence: z.number(),
});

type ScoreDealInput = z.infer<typeof scoreDealInput>;
type ScoreDealOutput = z.infer<typeof scoreDealOutput>;

const scoreDealDefinition: ToolDefinition<ScoreDealInput, ScoreDealOutput> = {
  id: 'deal_analysis.score',
  name: 'Score Deal',
  description: 'Generate a deal score based on multiple factors including motivation, equity, and market conditions',
  category: 'deal_analysis',
  requiredPermission: 'read',
  inputSchema: scoreDealInput,
  outputSchema: scoreDealOutput,
  requiresConfirmation: false,
  estimatedDuration: 500,
  rateLimit: 50,
  tags: ['score', 'deal', 'ranking'],
};

const scoreDealHandler: ToolHandler<ScoreDealInput, ScoreDealOutput> = async (input, _context) => {
  console.log('[Deal Analysis] Scoring deal for property:', input.propertyId);

  try {
    const supabase = await createClient();
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', input.propertyId)
      .single();

    const factors = input.factors || {};
    const factorScores: Record<string, number> = {};
    let totalScore = 0;
    let factorCount = 0;

    // Score motivation (0-10)
    if (factors.motivationScore !== undefined) {
      factorScores['motivation'] = Math.min(10, factors.motivationScore / 10);
      totalScore += factorScores['motivation'];
      factorCount++;
    }

    // Score equity (higher = better, 0-10)
    if (factors.equityPercent !== undefined) {
      factorScores['equity'] = Math.min(10, factors.equityPercent / 10);
      totalScore += factorScores['equity'];
      factorCount++;
    }

    // Score days on market (longer = more motivated, 0-10)
    if (factors.daysOnMarket !== undefined) {
      factorScores['daysOnMarket'] = Math.min(10, factors.daysOnMarket / 30);
      totalScore += factorScores['daysOnMarket'];
      factorCount++;
    }

    // Score price reductions (more = more motivated, 0-10)
    if (factors.priceReductions !== undefined) {
      factorScores['priceReductions'] = Math.min(10, factors.priceReductions * 2.5);
      totalScore += factorScores['priceReductions'];
      factorCount++;
    }

    // Score market trend
    if (factors.marketTrend) {
      factorScores['marketTrend'] = factors.marketTrend === 'down' ? 8 : factors.marketTrend === 'stable' ? 5 : 3;
      totalScore += factorScores['marketTrend'];
      factorCount++;
    }

    // If no factors provided, use property data
    if (factorCount === 0 && property) {
      if (property.days_on_market) {
        factorScores['daysOnMarket'] = Math.min(10, property.days_on_market / 30);
        totalScore += factorScores['daysOnMarket'];
        factorCount++;
      }
      if (property.condition) {
        const conditionScores: Record<string, number> = { distressed: 9, poor: 7, fair: 5, good: 3, excellent: 2 };
        factorScores['condition'] = conditionScores[property.condition] || 5;
        totalScore += factorScores['condition'];
        factorCount++;
      }
    }

    const overallScore = factorCount > 0 ? totalScore / factorCount : 5;
    const confidence = Math.min(1, factorCount / 5); // More factors = higher confidence

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      factorScores,
      confidence,
    };
  } catch (error) {
    console.error('[Deal Analysis] Scoring error:', error);
    throw new Error(`Deal scoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Register all deal analysis tools
 */
export function registerDealAnalysisTools(): void {
  toolRegistry.register(analyzeDealDefinition, analyzeDealHandler);
  toolRegistry.register(calculateMaoDefinition, calculateMaoHandler);
  toolRegistry.register(scoreDealDefinition, scoreDealHandler);
  console.log('[Deal Analysis Tools] Registered 3 tools');
}

