/**
 * Deal Pipeline AI Tools
 * 12 tools for deal management, stages, offers, and buyer assignment
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import { DealService, ActivityService, DealStage, DEAL_STAGES } from '@/lib/deals';

// ============================================================================
// 1. createDeal - Create a new deal
// ============================================================================
const createDealInput = z.object({
  propertyAddress: z.string().describe('Property address'),
  sellerName: z.string().optional(),
  sellerPhone: z.string().optional(),
  askingPrice: z.number().optional(),
  estimatedArv: z.number().optional(),
  estimatedRepairs: z.number().optional(),
  notes: z.string().optional(),
});

const createDealOutput = z.object({
  dealId: z.string(),
  propertyAddress: z.string(),
  stage: z.string(),
  message: z.string(),
});

type CreateDealInput = z.infer<typeof createDealInput>;
type CreateDealOutput = z.infer<typeof createDealOutput>;

const createDealDef: ToolDefinition<CreateDealInput, CreateDealOutput> = {
  id: 'deal.create',
  name: 'createDeal',
  description: 'Create a new deal in the pipeline',
  category: 'deal_pipeline',
  requiredPermission: 'write',
  inputSchema: createDealInput,
  outputSchema: createDealOutput,
  requiresConfirmation: true,
  tags: ['deal', 'create', 'pipeline'],
};

const createDealHandler: ToolHandler<CreateDealInput, CreateDealOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.createDeal(ctx.userId, {
    property_address: input.propertyAddress,
    seller_name: input.sellerName,
    seller_phone: input.sellerPhone,
    asking_price: input.askingPrice,
    estimated_arv: input.estimatedArv,
    estimated_repairs: input.estimatedRepairs,
    notes: input.notes,
  });

  return {
    dealId: deal.id,
    propertyAddress: deal.property_address,
    stage: deal.stage,
    message: `Deal created for ${deal.property_address}`,
  };
};

// ============================================================================
// 2. updateDealStage - Move deal to different stage
// ============================================================================
const updateStageInput = z.object({
  dealId: z.string().describe('Deal ID'),
  newStage: z.enum([
    'lead',
    'contacted',
    'appointment',
    'offer',
    'contract',
    'assigned',
    'closing',
    'closed',
    'lost',
  ]),
  reason: z.string().optional(),
});

const updateStageOutput = z.object({
  dealId: z.string(),
  previousStage: z.string(),
  newStage: z.string(),
  message: z.string(),
});

type UpdateStageInput = z.infer<typeof updateStageInput>;
type UpdateStageOutput = z.infer<typeof updateStageOutput>;

const updateStageDef: ToolDefinition<UpdateStageInput, UpdateStageOutput> = {
  id: 'deal.updateStage',
  name: 'updateDealStage',
  description: 'Move a deal to a different pipeline stage',
  category: 'deal_pipeline',
  requiredPermission: 'write',
  inputSchema: updateStageInput,
  outputSchema: updateStageOutput,
  requiresConfirmation: true,
  tags: ['deal', 'stage', 'update'],
};

const updateStageHandler: ToolHandler<UpdateStageInput, UpdateStageOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const current = await service.getDeal(input.dealId, ctx.userId);
  if (!current) throw new Error('Deal not found');

  const previousStage = current.stage;
  await service.updateDeal(input.dealId, ctx.userId, { stage: input.newStage });

  return {
    dealId: input.dealId,
    previousStage: previousStage as string,
    newStage: input.newStage,
    message: `Deal moved from ${DEAL_STAGES[previousStage as DealStage].label} to ${DEAL_STAGES[input.newStage].label}`,
  };
};

// ============================================================================
// 3. analyzeDealProgress - Analyze deal status and time in pipeline
// ============================================================================
const analyzeProgressInput = z.object({
  dealId: z.string().describe('Deal ID to analyze'),
});

const analyzeProgressOutput = z.object({
  dealId: z.string(),
  propertyAddress: z.string(),
  currentStage: z.string(),
  daysInStage: z.number(),
  isStale: z.boolean(),
  recommendation: z.string(),
  nextSteps: z.array(z.string()),
});

type AnalyzeProgressInput = z.infer<typeof analyzeProgressInput>;
type AnalyzeProgressOutput = z.infer<typeof analyzeProgressOutput>;

const analyzeProgressDef: ToolDefinition<AnalyzeProgressInput, AnalyzeProgressOutput> = {
  id: 'deal.analyzeProgress',
  name: 'analyzeDealProgress',
  description: 'Analyze deal progress and identify bottlenecks',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: analyzeProgressInput,
  outputSchema: analyzeProgressOutput,
  requiresConfirmation: false,
  tags: ['deal', 'analysis', 'progress'],
};

const analyzeProgressHandler: ToolHandler<AnalyzeProgressInput, AnalyzeProgressOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.getDeal(input.dealId, ctx.userId);
  if (!deal) throw new Error('Deal not found');

  const daysInStage = deal.days_in_stage || 0;
  const isStale = daysInStage > 7;
  const stageConfig = DEAL_STAGES[deal.stage as DealStage];

  const nextSteps: string[] = [];
  if (deal.stage === 'lead') nextSteps.push('Make initial contact with seller');
  if (deal.stage === 'contacted') nextSteps.push('Schedule property viewing');
  if (deal.stage === 'offer') nextSteps.push('Follow up on offer response');
  if (deal.stage === 'contract') nextSteps.push('Begin buyer matching process');

  return {
    dealId: deal.id,
    propertyAddress: deal.property_address,
    currentStage: stageConfig.label,
    daysInStage,
    isStale,
    recommendation: isStale
      ? `Deal has been in ${stageConfig.label} for ${daysInStage} days - take action`
      : 'Deal is progressing normally',
    nextSteps,
  };
};

// ============================================================================
// 4. generateOfferStrategy - Calculate tiered offer prices
// ============================================================================
const genStrategyInput = z.object({
  dealId: z.string().describe('Deal ID'),
  arv: z.number().describe('After Repair Value'),
  repairs: z.number().describe('Estimated repair costs'),
  wholesaleFee: z.number().optional().default(10000),
  marketCondition: z.enum(['hot', 'normal', 'cold']).optional(),
});

const genStrategyOutput = z.object({
  dealId: z.string(),
  optimalPrice: z.number(),
  targetPrice: z.number(),
  maximumPrice: z.number(),
  walkAwayPrice: z.number(),
  tips: z.array(z.string()),
});

type GenStrategyInput = z.infer<typeof genStrategyInput>;
type GenStrategyOutput = z.infer<typeof genStrategyOutput>;

const genStrategyDef: ToolDefinition<GenStrategyInput, GenStrategyOutput> = {
  id: 'deal.generateOfferStrategy',
  name: 'generateOfferStrategy',
  description: 'Calculate tiered offer prices (optimal, target, max, walk-away)',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: genStrategyInput,
  outputSchema: genStrategyOutput,
  requiresConfirmation: false,
  tags: ['deal', 'offer', 'strategy', 'pricing'],
};

const genStrategyHandler: ToolHandler<GenStrategyInput, GenStrategyOutput> = async (input) => {
  const { calculateOfferStrategy } = await import('@/lib/crm/offer-strategy');

  const strategy = calculateOfferStrategy({
    arv: input.arv,
    estimatedRepairs: input.repairs,
    wholesaleFee: input.wholesaleFee,
    marketCondition: input.marketCondition,
  });

  return {
    dealId: input.dealId,
    optimalPrice: strategy.optimal_price,
    targetPrice: strategy.target_price,
    maximumPrice: strategy.maximum_price,
    walkAwayPrice: strategy.walk_away_price,
    tips: strategy.negotiation_tips,
  };
};

// ============================================================================
// 5. assignBuyerToDeal - Assign a buyer to a deal
// ============================================================================
const assignBuyerInput = z.object({
  dealId: z.string(),
  buyerId: z.string(),
  assignmentFee: z.number().optional(),
});

const assignBuyerOutput = z.object({
  dealId: z.string(),
  buyerId: z.string(),
  message: z.string(),
});

type AssignBuyerInput = z.infer<typeof assignBuyerInput>;
type AssignBuyerOutput = z.infer<typeof assignBuyerOutput>;

const assignBuyerDef: ToolDefinition<AssignBuyerInput, AssignBuyerOutput> = {
  id: 'deal.assignBuyer',
  name: 'assignBuyerToDeal',
  description: 'Assign a buyer to a deal and move to assigned stage',
  category: 'deal_pipeline',
  requiredPermission: 'write',
  inputSchema: assignBuyerInput,
  outputSchema: assignBuyerOutput,
  requiresConfirmation: true,
  tags: ['deal', 'buyer', 'assignment'],
};

const assignBuyerHandler: ToolHandler<AssignBuyerInput, AssignBuyerOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);
  const activityService = new ActivityService(supabase);

  await service.updateDeal(input.dealId, ctx.userId, {
    assigned_buyer_id: input.buyerId,
    assignment_fee: input.assignmentFee,
    stage: 'assigned',
  });

  await activityService.logActivity(input.dealId, ctx.userId, {
    activity_type: 'stage_change',
    description: `Buyer assigned to deal`,
  });

  return {
    dealId: input.dealId,
    buyerId: input.buyerId,
    message: 'Buyer successfully assigned to deal',
  };
};

// ============================================================================
// 6. getDealTimeline - Get activity timeline for a deal
// ============================================================================
const getTimelineInput = z.object({ dealId: z.string() });
const getTimelineOutput = z.object({
  dealId: z.string(),
  activities: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      date: z.string(),
    })
  ),
  totalActivities: z.number(),
});

type GetTimelineInput = z.infer<typeof getTimelineInput>;
type GetTimelineOutput = z.infer<typeof getTimelineOutput>;

const getTimelineDef: ToolDefinition<GetTimelineInput, GetTimelineOutput> = {
  id: 'deal.getTimeline',
  name: 'getDealTimeline',
  description: 'Get activity timeline for a deal',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: getTimelineInput,
  outputSchema: getTimelineOutput,
  requiresConfirmation: false,
  tags: ['deal', 'timeline', 'activities'],
};

const getTimelineHandler: ToolHandler<GetTimelineInput, GetTimelineOutput> = async (input) => {
  const supabase = await createClient();
  const activityService = new ActivityService(supabase);

  const { activities, total } = await activityService.getDealActivities(input.dealId, 50);

  return {
    dealId: input.dealId,
    activities: activities.map((a) => ({
      type: a.activity_type,
      description: a.description || '',
      date: a.created_at || new Date().toISOString(),
    })),
    totalActivities: total,
  };
};

// ============================================================================
// 7. predictDealOutcome - Predict likelihood of deal closing
// ============================================================================
const predictOutcomeInput = z.object({ dealId: z.string() });
const predictOutcomeOutput = z.object({
  dealId: z.string(),
  closeProbability: z.number(),
  estimatedCloseDate: z.string().optional(),
  riskFactors: z.array(z.string()),
  positiveFactors: z.array(z.string()),
});

type PredictOutcomeInput = z.infer<typeof predictOutcomeInput>;
type PredictOutcomeOutput = z.infer<typeof predictOutcomeOutput>;

const predictOutcomeDef: ToolDefinition<PredictOutcomeInput, PredictOutcomeOutput> = {
  id: 'deal.predictOutcome',
  name: 'predictDealOutcome',
  description: 'Predict likelihood of deal closing successfully',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: predictOutcomeInput,
  outputSchema: predictOutcomeOutput,
  requiresConfirmation: false,
  tags: ['deal', 'prediction', 'ai'],
};

const predictOutcomeHandler: ToolHandler<PredictOutcomeInput, PredictOutcomeOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.getDeal(input.dealId, ctx.userId);
  if (!deal) throw new Error('Deal not found');

  // Simple probability based on stage
  const stageProbabilities: Record<string, number> = {
    lead: 10,
    contacted: 20,
    appointment: 35,
    offer: 50,
    contract: 70,
    assigned: 85,
    closing: 95,
    closed: 100,
    lost: 0,
  };

  const baseProbability = stageProbabilities[deal.stage] || 25;
  const riskFactors: string[] = [];
  const positiveFactors: string[] = [];

  if (deal.days_in_stage && deal.days_in_stage > 14)
    riskFactors.push('Deal has been stale for over 2 weeks');
  if (!deal.seller_phone) riskFactors.push('No seller contact information');
  if (deal.asking_price && deal.estimated_arv && deal.asking_price > deal.estimated_arv * 0.8) {
    riskFactors.push('Asking price may be too high');
  }

  if (deal.estimated_arv && deal.estimated_repairs)
    positiveFactors.push('Complete financial analysis');
  if (deal.assigned_buyer_id) positiveFactors.push('Buyer already assigned');

  return {
    dealId: deal.id,
    closeProbability: Math.min(
      baseProbability + positiveFactors.length * 5 - riskFactors.length * 10,
      100
    ),
    riskFactors,
    positiveFactors,
  };
};

// ============================================================================
// 8. generateDealSummary - Generate AI summary of deal
// ============================================================================
const genSummaryInput = z.object({ dealId: z.string() });
const genSummaryOutput = z.object({
  dealId: z.string(),
  summary: z.string(),
  keyMetrics: z.record(z.string(), z.union([z.string(), z.number()])),
  status: z.string(),
});

type GenSummaryInput = z.infer<typeof genSummaryInput>;
type GenSummaryOutput = z.infer<typeof genSummaryOutput>;

const genSummaryDef: ToolDefinition<GenSummaryInput, GenSummaryOutput> = {
  id: 'deal.generateSummary',
  name: 'generateDealSummary',
  description: 'Generate a comprehensive summary of a deal',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: genSummaryInput,
  outputSchema: genSummaryOutput,
  requiresConfirmation: false,
  tags: ['deal', 'summary', 'report'],
};

const genSummaryHandler: ToolHandler<GenSummaryInput, GenSummaryOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.getDeal(input.dealId, ctx.userId);
  if (!deal) throw new Error('Deal not found');

  const stageConfig = DEAL_STAGES[deal.stage as DealStage];
  const potentialProfit =
    deal.estimated_arv && deal.asking_price
      ? deal.estimated_arv - deal.asking_price - (deal.estimated_repairs || 0)
      : null;

  return {
    dealId: deal.id,
    summary: `${deal.property_address} is in ${stageConfig.label} stage. ${deal.seller_name ? `Seller: ${deal.seller_name}.` : ''} ${potentialProfit ? `Potential profit: $${potentialProfit.toLocaleString()}.` : ''}`,
    keyMetrics: {
      stage: stageConfig.label,
      daysInPipeline: deal.days_in_stage || 0,
      askingPrice: deal.asking_price || 'Not set',
      arv: deal.estimated_arv || 'Not set',
      repairs: deal.estimated_repairs || 'Not set',
    },
    status: deal.status || 'active',
  };
};

// ============================================================================
// 9-12: Additional tools (compareDealToPortfolio, suggestDealActions, calculateDealMetrics, flagDealIssues)
// ============================================================================
const compareDealInput = z.object({ dealId: z.string() });
const compareDealOutput = z.object({
  dealId: z.string(),
  comparison: z.object({
    avgAskingPrice: z.number(),
    avgArv: z.number(),
    avgDaysToClose: z.number(),
  }),
  percentile: z.number(),
  insights: z.array(z.string()),
});

type CompareDealInput = z.infer<typeof compareDealInput>;
type CompareDealOutput = z.infer<typeof compareDealOutput>;

const compareDealDef: ToolDefinition<CompareDealInput, CompareDealOutput> = {
  id: 'deal.compareToPortfolio',
  name: 'compareDealToPortfolio',
  description: 'Compare deal metrics to portfolio averages',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: compareDealInput,
  outputSchema: compareDealOutput,
  requiresConfirmation: false,
  tags: ['deal', 'compare', 'portfolio'],
};

const compareDealHandler: ToolHandler<CompareDealInput, CompareDealOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.getDeal(input.dealId, ctx.userId);
  if (!deal) throw new Error('Deal not found');

  const stats = await service.getPipelineStats(ctx.userId);

  return {
    dealId: deal.id,
    comparison: {
      avgAskingPrice: stats.totalPipelineValue / Math.max(stats.totalDeals, 1),
      avgArv: 0,
      avgDaysToClose: stats.avgDaysToClose,
    },
    percentile: 50,
    insights: ['Deal is performing at average level compared to portfolio'],
  };
};

const suggestActionsInput = z.object({ dealId: z.string() });
const suggestActionsOutput = z.object({
  dealId: z.string(),
  actions: z.array(
    z.object({
      action: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      reason: z.string(),
    })
  ),
});

type SuggestActionsInput = z.infer<typeof suggestActionsInput>;
type SuggestActionsOutput = z.infer<typeof suggestActionsOutput>;

const suggestActionsDef: ToolDefinition<SuggestActionsInput, SuggestActionsOutput> = {
  id: 'deal.suggestActions',
  name: 'suggestDealActions',
  description: 'Suggest next actions for a deal',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: suggestActionsInput,
  outputSchema: suggestActionsOutput,
  requiresConfirmation: false,
  tags: ['deal', 'actions', 'suggestions'],
};

const suggestActionsHandler: ToolHandler<SuggestActionsInput, SuggestActionsOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.getDeal(input.dealId, ctx.userId);
  if (!deal) throw new Error('Deal not found');

  const actions: Array<{ action: string; priority: 'high' | 'medium' | 'low'; reason: string }> =
    [];

  if (deal.stage === 'lead') {
    actions.push({
      action: 'Contact seller',
      priority: 'high',
      reason: 'New lead needs initial contact',
    });
  }
  if (deal.stage === 'offer' && deal.days_in_stage && deal.days_in_stage > 3) {
    actions.push({
      action: 'Follow up on offer',
      priority: 'high',
      reason: 'Offer pending for over 3 days',
    });
  }
  if (deal.stage === 'contract' && !deal.assigned_buyer_id) {
    actions.push({
      action: 'Find buyer',
      priority: 'high',
      reason: 'Contract signed but no buyer assigned',
    });
  }

  return { dealId: deal.id, actions };
};

const calcMetricsInput = z.object({ dealId: z.string() });
const calcMetricsOutput = z.object({
  dealId: z.string(),
  metrics: z.object({
    potentialProfit: z.number(),
    roi: z.number(),
    spreadPercentage: z.number(),
    daysInPipeline: z.number(),
  }),
});

type CalcMetricsInput = z.infer<typeof calcMetricsInput>;
type CalcMetricsOutput = z.infer<typeof calcMetricsOutput>;

const calcMetricsDef: ToolDefinition<CalcMetricsInput, CalcMetricsOutput> = {
  id: 'deal.calculateMetrics',
  name: 'calculateDealMetrics',
  description: 'Calculate financial metrics for a deal',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: calcMetricsInput,
  outputSchema: calcMetricsOutput,
  requiresConfirmation: false,
  tags: ['deal', 'metrics', 'financial'],
};

const calcMetricsHandler: ToolHandler<CalcMetricsInput, CalcMetricsOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const deal = await service.getDeal(input.dealId, ctx.userId);
  if (!deal) throw new Error('Deal not found');

  const arv = deal.estimated_arv || 0;
  const asking = deal.asking_price || 0;
  const repairs = deal.estimated_repairs || 0;
  const profit = arv - asking - repairs;
  const roi = asking > 0 ? (profit / asking) * 100 : 0;
  const spread = arv > 0 ? ((arv - asking) / arv) * 100 : 0;

  return {
    dealId: deal.id,
    metrics: {
      potentialProfit: profit,
      roi: Math.round(roi * 100) / 100,
      spreadPercentage: Math.round(spread * 100) / 100,
      daysInPipeline: deal.days_in_stage || 0,
    },
  };
};

const flagIssuesInput = z.object({ dealId: z.string().optional() });
const flagIssuesOutput = z.object({
  issues: z.array(
    z.object({
      dealId: z.string(),
      propertyAddress: z.string(),
      issue: z.string(),
      severity: z.enum(['critical', 'warning', 'info']),
    })
  ),
  totalIssues: z.number(),
});

type FlagIssuesInput = z.infer<typeof flagIssuesInput>;
type FlagIssuesOutput = z.infer<typeof flagIssuesOutput>;

const flagIssuesDef: ToolDefinition<FlagIssuesInput, FlagIssuesOutput> = {
  id: 'deal.flagIssues',
  name: 'flagDealIssues',
  description: 'Identify deals with issues that need attention',
  category: 'deal_pipeline',
  requiredPermission: 'read',
  inputSchema: flagIssuesInput,
  outputSchema: flagIssuesOutput,
  requiresConfirmation: false,
  tags: ['deal', 'issues', 'alerts'],
};

const flagIssuesHandler: ToolHandler<FlagIssuesInput, FlagIssuesOutput> = async (_input, ctx) => {
  const supabase = await createClient();
  const service = new DealService(supabase);

  const { deals } = await service.listDeals(ctx.userId, {}, 1, 100);
  const issues: Array<{
    dealId: string;
    propertyAddress: string;
    issue: string;
    severity: 'critical' | 'warning' | 'info';
  }> = [];

  for (const deal of deals) {
    if (deal.days_in_stage && deal.days_in_stage > 14) {
      issues.push({
        dealId: deal.id,
        propertyAddress: deal.property_address,
        issue: `Stale for ${deal.days_in_stage} days`,
        severity: deal.days_in_stage > 30 ? 'critical' : 'warning',
      });
    }
    if (!deal.estimated_arv && deal.stage !== 'lead') {
      issues.push({
        dealId: deal.id,
        propertyAddress: deal.property_address,
        issue: 'Missing ARV estimate',
        severity: 'warning',
      });
    }
  }

  return { issues, totalIssues: issues.length };
};

/**
 * Register all deal pipeline tools
 */
export function registerDealPipelineTools(): void {
  toolRegistry.register(createDealDef, createDealHandler);
  toolRegistry.register(updateStageDef, updateStageHandler);
  toolRegistry.register(analyzeProgressDef, analyzeProgressHandler);
  toolRegistry.register(genStrategyDef, genStrategyHandler);
  toolRegistry.register(assignBuyerDef, assignBuyerHandler);
  toolRegistry.register(getTimelineDef, getTimelineHandler);
  toolRegistry.register(predictOutcomeDef, predictOutcomeHandler);
  toolRegistry.register(genSummaryDef, genSummaryHandler);
  toolRegistry.register(compareDealDef, compareDealHandler);
  toolRegistry.register(suggestActionsDef, suggestActionsHandler);
  toolRegistry.register(calcMetricsDef, calcMetricsHandler);
  toolRegistry.register(flagIssuesDef, flagIssuesHandler);
  console.log('[Deal Pipeline Tools] Registered 12 deal pipeline AI tools');
}
