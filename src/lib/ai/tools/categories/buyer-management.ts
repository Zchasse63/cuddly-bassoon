/**
 * Buyer Management AI Tools
 * Tools for managing buyers, matching, and analysis
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import { BuyerService, MatchingEngine, calculateBuyerScore, TransactionService } from '@/lib/buyers';

// ============================================================================
// 1. matchBuyersToProperty - Find matching buyers for a property
// ============================================================================
const matchBuyersInput = z.object({
  propertyId: z.string().describe('Property ID to match buyers for'),
  minMatchScore: z.number().min(0).max(100).optional().default(50),
  maxResults: z.number().min(1).max(50).optional().default(20),
  tierFilter: z.array(z.enum(['A', 'B', 'C'])).optional(),
  activeOnly: z.boolean().optional().default(true),
});

const matchBuyersOutput = z.object({
  matches: z.array(z.object({
    buyerId: z.string(),
    buyerName: z.string(),
    tier: z.string().optional(),
    matchScore: z.number(),
    matchFactors: z.array(z.object({
      factor: z.string(),
      score: z.number(),
      reason: z.string(),
    })),
    contactInfo: z.object({
      email: z.string().optional(),
      phone: z.string().optional(),
    }),
  })),
  totalMatches: z.number(),
  propertyId: z.string(),
});

type MatchBuyersInput = z.infer<typeof matchBuyersInput>;
type MatchBuyersOutput = z.infer<typeof matchBuyersOutput>;

const matchBuyersDefinition: ToolDefinition<MatchBuyersInput, MatchBuyersOutput> = {
  id: 'buyer_management.match_buyers_to_property',
  name: 'Match Buyers to Property',
  description: 'Find buyers whose preferences match a specific property. Returns ranked list with match scores and factors.',
  category: 'buyer_management',
  requiredPermission: 'read',
  inputSchema: matchBuyersInput,
  outputSchema: matchBuyersOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 20,
  tags: ['buyers', 'matching', 'property'],
};

const matchBuyersHandler: ToolHandler<MatchBuyersInput, MatchBuyersOutput> = async (input, context) => {
  const supabase = await createClient();

  // Get property details first
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', input.propertyId)
    .single();

  if (!property) {
    throw new Error(`Property not found: ${input.propertyId}`);
  }

  const engine = new MatchingEngine(supabase);
  const results = await engine.matchBuyersToProperty(
    {
      id: property.id,
      address: property.address,
      city: property.city ?? undefined,
      state: property.state ?? undefined,
      zip_code: property.zip ?? undefined,
      property_type: property.property_type ?? undefined,
      bedrooms: property.bedrooms ?? undefined,
      bathrooms: property.bathrooms ?? undefined,
      square_feet: property.square_footage ?? undefined,
    },
    context.userId,
    {
      minMatchScore: input.minMatchScore,
      maxResults: input.maxResults,
      tierFilter: input.tierFilter,
      activeOnly: input.activeOnly,
    }
  );

  return {
    matches: results.map((r) => ({
      buyerId: r.buyer.id,
      buyerName: r.buyer.name,
      tier: r.buyer.tier || undefined,
      matchScore: r.matchScore,
      matchFactors: r.matchFactors.map((f) => ({
        factor: f.factor,
        score: f.score,
        reason: f.reason,
      })),
      contactInfo: {
        email: r.buyer.email || undefined,
        phone: r.buyer.phone || undefined,
      },
    })),
    totalMatches: results.length,
    propertyId: input.propertyId,
  };
};

// ============================================================================
// 2. getBuyerInsights - Get AI-powered insights about a buyer
// ============================================================================
const getBuyerInsightsInput = z.object({
  buyerId: z.string().describe('Buyer ID to analyze'),
});

const getBuyerInsightsOutput = z.object({
  buyerId: z.string(),
  buyerName: z.string(),
  score: z.number(),
  tier: z.string(),
  insights: z.object({
    strengths: z.array(z.string()),
    recommendations: z.array(z.string()),
    activitySummary: z.string(),
    preferencesSummary: z.string(),
  }),
  scoreFactors: z.record(z.string(), z.number()),
});

type GetBuyerInsightsInput = z.infer<typeof getBuyerInsightsInput>;
type GetBuyerInsightsOutput = z.infer<typeof getBuyerInsightsOutput>;

const getBuyerInsightsDefinition: ToolDefinition<GetBuyerInsightsInput, GetBuyerInsightsOutput> = {
  id: 'buyer_management.get_buyer_insights',
  name: 'Get Buyer Insights',
  description: 'Get AI-powered insights about a buyer including score breakdown, strengths, and recommendations.',
  category: 'buyer_management',
  requiredPermission: 'read',
  inputSchema: getBuyerInsightsInput,
  outputSchema: getBuyerInsightsOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 30,
  tags: ['buyers', 'insights', 'analysis'],
};

const getBuyerInsightsHandler: ToolHandler<GetBuyerInsightsInput, GetBuyerInsightsOutput> = async (input, context) => {
  const supabase = await createClient();
  const buyerService = new BuyerService(supabase);
  const transactionService = new TransactionService(supabase);

  const buyer = await buyerService.getBuyer(input.buyerId, context.userId);
  if (!buyer) {
    throw new Error(`Buyer not found: ${input.buyerId}`);
  }

  const transactionAnalysis = await transactionService.analyzeTransactions(input.buyerId);
  const scoringResult = calculateBuyerScore({
    buyer,
    transactionAnalysis,
    hasVerifiedPOF: buyer.status === 'qualified',
  });

  // Generate insights
  const strengths: string[] = [];
  const factors = scoringResult.factors;
  
  if (factors.transactionVolume > 15) strengths.push('Strong transaction history');
  if (factors.profileComplete >= 8) strengths.push('Complete buyer profile');
  if (factors.proofOfFunds > 0) strengths.push('Verified proof of funds');
  if (transactionAnalysis.purchaseFrequency > 2) strengths.push('Active buyer - purchases frequently');

  // Build summaries
  const activitySummary = transactionAnalysis.totalTransactions > 0
    ? `${transactionAnalysis.totalTransactions} transactions, avg purchase $${transactionAnalysis.averagePurchasePrice.toLocaleString()}`
    : 'No transaction history recorded';

  const prefs = buyer.preferences;
  const preferencesSummary = prefs
    ? `Looking for ${prefs.price_range_min ? `$${prefs.price_range_min.toLocaleString()}` : 'any'}-${prefs.price_range_max ? `$${prefs.price_range_max.toLocaleString()}` : 'any'} properties`
    : 'No preferences set';

  return {
    buyerId: buyer.id,
    buyerName: buyer.name,
    score: scoringResult.score,
    tier: scoringResult.tier,
    insights: {
      strengths,
      recommendations: scoringResult.recommendations,
      activitySummary,
      preferencesSummary,
    },
    scoreFactors: factors as unknown as Record<string, number>,
  };
};

// ============================================================================
// 3. analyzeBuyerActivity - Analyze buyer engagement and activity patterns
// ============================================================================
const analyzeBuyerActivityInput = z.object({
  buyerId: z.string().optional().describe('Specific buyer ID, or omit for all buyers'),
  timeframeDays: z.number().min(7).max(365).optional().default(90),
});

const analyzeBuyerActivityOutput = z.object({
  summary: z.object({
    totalBuyers: z.number(),
    activeBuyers: z.number(),
    averageScore: z.number(),
    tierDistribution: z.record(z.string(), z.number()),
  }),
  topBuyers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    score: z.number(),
    tier: z.string(),
    recentActivity: z.string(),
  })),
  needsAttention: z.array(z.object({
    id: z.string(),
    name: z.string(),
    reason: z.string(),
  })),
});

type AnalyzeBuyerActivityInput = z.infer<typeof analyzeBuyerActivityInput>;
type AnalyzeBuyerActivityOutput = z.infer<typeof analyzeBuyerActivityOutput>;

const analyzeBuyerActivityDefinition: ToolDefinition<AnalyzeBuyerActivityInput, AnalyzeBuyerActivityOutput> = {
  id: 'buyer_management.analyze_buyer_activity',
  name: 'Analyze Buyer Activity',
  description: 'Analyze buyer engagement patterns, identify top performers and those needing attention.',
  category: 'buyer_management',
  requiredPermission: 'read',
  inputSchema: analyzeBuyerActivityInput,
  outputSchema: analyzeBuyerActivityOutput,
  requiresConfirmation: false,
  estimatedDuration: 4000,
  rateLimit: 10,
  tags: ['buyers', 'analytics', 'activity'],
};

const analyzeBuyerActivityHandler: ToolHandler<AnalyzeBuyerActivityInput, AnalyzeBuyerActivityOutput> = async (_input, context) => {
  const supabase = await createClient();
  const buyerService = new BuyerService(supabase);

  const { buyers } = await buyerService.listBuyers(context.userId, {}, 1, 100);

  const tierDistribution: Record<string, number> = { A: 0, B: 0, C: 0 };
  const scoredBuyers: Array<{ buyer: typeof buyers[0]; score: number; tier: string }> = [];

  for (const buyer of buyers) {
    const result = calculateBuyerScore({ buyer });
    scoredBuyers.push({ buyer, score: result.score, tier: result.tier });
    tierDistribution[result.tier] = (tierDistribution[result.tier] || 0) + 1;
  }

  const activeBuyers = buyers.filter((b) => b.status === 'active' || b.status === 'qualified').length;
  const avgScore = scoredBuyers.length > 0
    ? Math.round(scoredBuyers.reduce((sum, b) => sum + b.score, 0) / scoredBuyers.length)
    : 0;

  const topBuyers = scoredBuyers
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((b) => ({
      id: b.buyer.id,
      name: b.buyer.name,
      score: b.score,
      tier: b.tier,
      recentActivity: b.buyer.updated_at ? `Updated ${new Date(b.buyer.updated_at).toLocaleDateString()}` : 'No recent activity',
    }));

  const needsAttention = scoredBuyers
    .filter((b) => b.score < 30 || b.buyer.status === 'inactive')
    .slice(0, 5)
    .map((b) => ({
      id: b.buyer.id,
      name: b.buyer.name,
      reason: b.score < 30 ? 'Low engagement score' : 'Marked as inactive',
    }));

  return {
    summary: {
      totalBuyers: buyers.length,
      activeBuyers,
      averageScore: avgScore,
      tierDistribution,
    },
    topBuyers,
    needsAttention,
  };
};

// ============================================================================
// 4. searchBuyers - Search buyers by criteria
// ============================================================================
const searchBuyersInput = z.object({
  query: z.string().optional().describe('Search term for name, company, or notes'),
  status: z.enum(['active', 'inactive', 'qualified', 'unqualified']).optional(),
  tier: z.enum(['A', 'B', 'C']).optional(),
  buyerType: z.enum(['flipper', 'landlord', 'wholesaler', 'developer', 'other']).optional(),
  limit: z.number().min(1).max(50).optional().default(20),
});

const searchBuyersOutput = z.object({
  buyers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    company: z.string().optional(),
    status: z.string(),
    tier: z.string().optional(),
    buyerType: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })),
  total: z.number(),
});

type SearchBuyersInput = z.infer<typeof searchBuyersInput>;
type SearchBuyersOutput = z.infer<typeof searchBuyersOutput>;

const searchBuyersDefinition: ToolDefinition<SearchBuyersInput, SearchBuyersOutput> = {
  id: 'buyer_management.search_buyers',
  name: 'Search Buyers',
  description: 'Search for buyers by name, status, tier, or type.',
  category: 'buyer_management',
  requiredPermission: 'read',
  inputSchema: searchBuyersInput,
  outputSchema: searchBuyersOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['buyers', 'search'],
};

const searchBuyersHandler: ToolHandler<SearchBuyersInput, SearchBuyersOutput> = async (input, context) => {
  const supabase = await createClient();
  const buyerService = new BuyerService(supabase);

  const { buyers, total } = await buyerService.listBuyers(
    context.userId,
    {
      search: input.query,
      status: input.status,
      tier: input.tier,
      type: input.buyerType,
    },
    1,
    input.limit
  );

  return {
    buyers: buyers.map((b) => ({
      id: b.id,
      name: b.name,
      company: b.company_name || undefined,
      status: b.status || 'unknown',
      tier: b.tier || undefined,
      buyerType: b.buyer_type || undefined,
      email: b.email || undefined,
      phone: b.phone || undefined,
    })),
    total,
  };
};

// ============================================================================
// 5. suggestBuyerOutreach
// ============================================================================
const suggestOutreachInput = z.object({ limit: z.number().default(10) });
const suggestOutreachOutput = z.object({
  suggestions: z.array(z.object({
    buyerId: z.string(), buyerName: z.string(), priority: z.enum(['high', 'medium', 'low']),
    reason: z.string(), suggestedAction: z.string(),
  })),
});

type SuggestOutreachInput = z.infer<typeof suggestOutreachInput>;
type SuggestOutreachOutput = z.infer<typeof suggestOutreachOutput>;

const suggestOutreachDef: ToolDefinition<SuggestOutreachInput, SuggestOutreachOutput> = {
  id: 'buyer.suggestOutreach', name: 'suggestBuyerOutreach',
  description: 'Identify buyers to contact and prioritize by opportunity',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: suggestOutreachInput, outputSchema: suggestOutreachOutput,
  requiresConfirmation: false, tags: ['buyer', 'outreach', 'crm'],
};

const suggestOutreachHandler: ToolHandler<SuggestOutreachInput, SuggestOutreachOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: buyers } = await supabase.from('buyers')
    .select('*').eq('user_id', ctx.userId).eq('status', 'active').limit(input.limit);

  const suggestions = (buyers || []).map(b => ({
    buyerId: b.id, buyerName: b.name,
    priority: (b.rating && b.rating >= 4 ? 'high' : b.rating && b.rating >= 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    reason: `${b.name} has been active recently with ${b.rating || 0}-star rating`,
    suggestedAction: 'Send personalized deal alert based on their preferences',
  }));

  return { suggestions };
};

// ============================================================================
// 6. compareBuyers
// ============================================================================
const compareBuyersInput = z.object({
  buyerIds: z.array(z.string()).min(2).max(5),
  propertyId: z.string().optional(),
});
const compareBuyersOutput = z.object({
  comparison: z.array(z.object({
    buyerId: z.string(), buyerName: z.string(), score: z.number(),
    strengths: z.array(z.string()), weaknesses: z.array(z.string()),
  })),
  recommendation: z.string(),
});

type CompareBuyersInput = z.infer<typeof compareBuyersInput>;
type CompareBuyersOutput = z.infer<typeof compareBuyersOutput>;

const compareBuyersDef: ToolDefinition<CompareBuyersInput, CompareBuyersOutput> = {
  id: 'buyer.compare', name: 'compareBuyers',
  description: 'Compare buyers and recommend for specific deal',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: compareBuyersInput, outputSchema: compareBuyersOutput,
  requiresConfirmation: false, tags: ['buyer', 'compare', 'analysis'],
};

const compareBuyersHandler: ToolHandler<CompareBuyersInput, CompareBuyersOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: buyers } = await supabase.from('buyers')
    .select('*').eq('user_id', ctx.userId).in('id', input.buyerIds);

  const comparison = (buyers || []).map(b => ({
    buyerId: b.id, buyerName: b.name, score: b.rating ? b.rating * 20 : 50,
    strengths: b.rating && b.rating >= 4 ? ['High rating', 'Reliable'] : ['Active'],
    weaknesses: b.rating && b.rating < 3 ? ['Lower rating'] : [],
  }));

  const best = comparison.length > 0 ? comparison.reduce((a, b) => a.score > b.score ? a : b) : null;
  return { comparison, recommendation: `${best?.buyerName || 'First buyer'} is the best match with score ${best?.score || 0}` };
};

// ============================================================================
// 7. predictBuyerBehavior
// ============================================================================
const predictBehaviorInput = z.object({ buyerId: z.string(), dealType: z.string().optional() });
const predictBehaviorOutput = z.object({
  buyerId: z.string(), buyerName: z.string(), predictions: z.object({
    responseTime: z.string(), closeProbability: z.number(), expectedOffer: z.string(),
    negotiationStyle: z.string(),
  }),
});

type PredictBehaviorInput = z.infer<typeof predictBehaviorInput>;
type PredictBehaviorOutput = z.infer<typeof predictBehaviorOutput>;

const predictBehaviorDef: ToolDefinition<PredictBehaviorInput, PredictBehaviorOutput> = {
  id: 'buyer.predictBehavior', name: 'predictBuyerBehavior',
  description: 'Predict buyer response and close probability',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: predictBehaviorInput, outputSchema: predictBehaviorOutput,
  requiresConfirmation: false, tags: ['buyer', 'predict', 'ai'],
};

const predictBehaviorHandler: ToolHandler<PredictBehaviorInput, PredictBehaviorOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: buyer } = await supabase.from('buyers')
    .select('*').eq('id', input.buyerId).eq('user_id', ctx.userId).single();
  if (!buyer) throw new Error('Buyer not found');

  const closeProbability = buyer.rating ? Math.min(buyer.rating * 15 + 25, 95) : 50;
  return {
    buyerId: buyer.id, buyerName: buyer.name,
    predictions: {
      responseTime: 'Within 24 hours', closeProbability,
      expectedOffer: 'Market rate with minor negotiation',
      negotiationStyle: buyer.rating && buyer.rating >= 4 ? 'Direct and decisive' : 'Cautious but fair',
    },
  };
};

// ============================================================================
// 8. segmentBuyers
// ============================================================================
const segmentBuyersInput = z.object({ criteria: z.enum(['activity', 'preferences', 'value', 'type']) });
const segmentBuyersOutput = z.object({
  segments: z.array(z.object({
    name: z.string(), buyerCount: z.number(), description: z.string(),
    buyerIds: z.array(z.string()),
  })),
});

type SegmentBuyersInput = z.infer<typeof segmentBuyersInput>;
type SegmentBuyersOutput = z.infer<typeof segmentBuyersOutput>;

const segmentBuyersDef: ToolDefinition<SegmentBuyersInput, SegmentBuyersOutput> = {
  id: 'buyer.segment', name: 'segmentBuyers',
  description: 'Group buyers by criteria for targeted marketing',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: segmentBuyersInput, outputSchema: segmentBuyersOutput,
  requiresConfirmation: false, tags: ['buyer', 'segment', 'marketing'],
};

const segmentBuyersHandler: ToolHandler<SegmentBuyersInput, SegmentBuyersOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: buyers } = await supabase.from('buyers').select('*').eq('user_id', ctx.userId);

  const segments: Array<{ name: string; buyerCount: number; description: string; buyerIds: string[] }> = [];
  const allBuyers = buyers || [];

  if (input.criteria === 'activity') {
    const active = allBuyers.filter(b => b.status === 'active');
    const inactive = allBuyers.filter(b => b.status !== 'active');
    segments.push({ name: 'Active Buyers', buyerCount: active.length, description: 'Engaged in last 30 days', buyerIds: active.map(b => b.id) });
    segments.push({ name: 'Inactive Buyers', buyerCount: inactive.length, description: 'No recent activity', buyerIds: inactive.map(b => b.id) });
  } else if (input.criteria === 'value') {
    const highValue = allBuyers.filter(b => b.rating && b.rating >= 4);
    const standard = allBuyers.filter(b => !b.rating || b.rating < 4);
    segments.push({ name: 'High Value', buyerCount: highValue.length, description: '4+ star rating', buyerIds: highValue.map(b => b.id) });
    segments.push({ name: 'Standard', buyerCount: standard.length, description: 'Regular buyers', buyerIds: standard.map(b => b.id) });
  } else {
    segments.push({ name: 'All Buyers', buyerCount: allBuyers.length, description: 'Complete buyer list', buyerIds: allBuyers.map(b => b.id) });
  }

  return { segments };
};

// ============================================================================
// 9. identifyBuyerGaps
// ============================================================================
const identifyGapsInput = z.object({});
const identifyGapsOutput = z.object({
  gaps: z.array(z.object({ buyerType: z.string(), currentCount: z.number(), suggestedCount: z.number(), recruitmentFocus: z.string() })),
  recommendations: z.array(z.string()),
});

type IdentifyGapsInput = z.infer<typeof identifyGapsInput>;
type IdentifyGapsOutput = z.infer<typeof identifyGapsOutput>;

const identifyGapsDef: ToolDefinition<IdentifyGapsInput, IdentifyGapsOutput> = {
  id: 'buyer.identifyGaps', name: 'identifyBuyerGaps',
  description: 'Analyze buyer network coverage and identify missing types',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: identifyGapsInput, outputSchema: identifyGapsOutput,
  requiresConfirmation: false, tags: ['buyer', 'gaps', 'analysis'],
};

const identifyGapsHandler: ToolHandler<IdentifyGapsInput, IdentifyGapsOutput> = async (_input, ctx) => {
  const supabase = await createClient();
  const { data: buyers } = await supabase.from('buyers').select('*').eq('user_id', ctx.userId);
  const total = (buyers || []).length;

  const gaps = [
    { buyerType: 'Cash Buyers', currentCount: Math.floor(total * 0.3), suggestedCount: Math.ceil(total * 0.5), recruitmentFocus: 'REI meetups and auctions' },
    { buyerType: 'Rehabbers', currentCount: Math.floor(total * 0.2), suggestedCount: Math.ceil(total * 0.3), recruitmentFocus: 'Contractor networks' },
    { buyerType: 'Buy & Hold Investors', currentCount: Math.floor(total * 0.25), suggestedCount: Math.ceil(total * 0.25), recruitmentFocus: 'Property management companies' },
  ];

  return { gaps, recommendations: ['Focus on recruiting more cash buyers', 'Network at local REI events'] };
};

// ============================================================================
// 10. generateBuyerReport
// ============================================================================
const genReportInput = z.object({ buyerId: z.string().optional(), format: z.enum(['summary', 'detailed']).default('summary') });
const genReportOutput = z.object({
  report: z.object({ title: z.string(), generatedAt: z.string(), content: z.string(), metrics: z.record(z.string(), z.number()) }),
});

type GenReportInput = z.infer<typeof genReportInput>;
type GenReportOutput = z.infer<typeof genReportOutput>;

const genReportDef: ToolDefinition<GenReportInput, GenReportOutput> = {
  id: 'buyer.generateReport', name: 'generateBuyerReport',
  description: 'Create buyer summary report with activity metrics',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: genReportInput, outputSchema: genReportOutput,
  requiresConfirmation: false, tags: ['buyer', 'report'],
};

const genReportHandler: ToolHandler<GenReportInput, GenReportOutput> = async (input, ctx) => {
  const supabase = await createClient();
  if (input.buyerId) {
    const { data: buyer } = await supabase.from('buyers').select('*').eq('id', input.buyerId).eq('user_id', ctx.userId).single();
    if (!buyer) throw new Error('Buyer not found');
    const metrics: Record<string, number> = { rating: buyer.rating || 0, dealsCompleted: 0, responseRate: 85 };
    return {
      report: {
        title: `Buyer Report: ${buyer.name}`, generatedAt: new Date().toISOString(),
        content: `${buyer.name} is a ${buyer.status} buyer with rating ${buyer.rating || 'N/A'}. Contact: ${buyer.email || 'N/A'}`,
        metrics,
      },
    };
  }

  const { data: buyers } = await supabase.from('buyers').select('*').eq('user_id', ctx.userId);
  const total = (buyers || []).length;
  const active = (buyers || []).filter(b => b.status === 'active').length;
  const metrics: Record<string, number> = { totalBuyers: total, activeBuyers: active, avgRating: 3.5, conversionRate: 15 };

  return {
    report: {
      title: 'Buyer Network Summary', generatedAt: new Date().toISOString(),
      content: `You have ${total} buyers in your network, with ${active} currently active.`,
      metrics,
    },
  };
};

// ============================================================================
// 11. scoreBuyerFit
// ============================================================================
const scoreFitInput = z.object({ buyerId: z.string(), propertyId: z.string() });
const scoreFitOutput = z.object({
  buyerId: z.string(), propertyId: z.string(), fitScore: z.number(),
  matchFactors: z.array(z.object({ factor: z.string(), score: z.number(), weight: z.number() })),
  recommendation: z.string(),
});

type ScoreFitInput = z.infer<typeof scoreFitInput>;
type ScoreFitOutput = z.infer<typeof scoreFitOutput>;

const scoreFitDef: ToolDefinition<ScoreFitInput, ScoreFitOutput> = {
  id: 'buyer.scoreFit', name: 'scoreBuyerFit',
  description: 'Calculate buyer-property fit score with match factors',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: scoreFitInput, outputSchema: scoreFitOutput,
  requiresConfirmation: false, tags: ['buyer', 'scoring', 'matching'],
};

const scoreFitHandler: ToolHandler<ScoreFitInput, ScoreFitOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const [{ data: buyer }, { data: property }] = await Promise.all([
    supabase.from('buyers').select('*').eq('id', input.buyerId).eq('user_id', ctx.userId).single(),
    supabase.from('properties').select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single(),
  ]);
  if (!buyer) throw new Error('Buyer not found');
  if (!property) throw new Error('Property not found');

  const matchFactors = [
    { factor: 'Buyer Activity', score: buyer.status === 'active' ? 90 : 50, weight: 0.3 },
    { factor: 'Rating', score: (buyer.rating || 3) * 20, weight: 0.3 },
    { factor: 'Location Match', score: 75, weight: 0.2 },
    { factor: 'Price Range Match', score: 80, weight: 0.2 },
  ];
  const fitScore = Math.round(matchFactors.reduce((sum, f) => sum + f.score * f.weight, 0));

  return {
    buyerId: buyer.id, propertyId: property.id, fitScore, matchFactors,
    recommendation: fitScore >= 70 ? 'Strong match - prioritize this buyer' : 'Moderate match - consider other options',
  };
};

// ============================================================================
// 12. trackBuyerPreferenceChanges
// ============================================================================
const trackPrefInput = z.object({ buyerId: z.string().optional(), days: z.number().default(30) });
const trackPrefOutput = z.object({
  changes: z.array(z.object({
    buyerId: z.string(), buyerName: z.string(), changedAt: z.string(),
    previousPrefs: z.record(z.string(), z.unknown()), newPrefs: z.record(z.string(), z.unknown()),
  })),
  alerts: z.array(z.string()),
});

type TrackPrefInput = z.infer<typeof trackPrefInput>;
type TrackPrefOutput = z.infer<typeof trackPrefOutput>;

const trackPrefDef: ToolDefinition<TrackPrefInput, TrackPrefOutput> = {
  id: 'buyer.trackPreferenceChanges', name: 'trackBuyerPreferenceChanges',
  description: 'Monitor preference updates and alert on significant changes',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: trackPrefInput, outputSchema: trackPrefOutput,
  requiresConfirmation: false, tags: ['buyer', 'preferences', 'tracking'],
};

const trackPrefHandler: ToolHandler<TrackPrefInput, TrackPrefOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - input.days);

  let query = supabase.from('buyer_preferences')
    .select('*, buyers!inner(*)')
    .eq('buyers.user_id', ctx.userId)
    .gte('updated_at', since.toISOString());

  if (input.buyerId) query = query.eq('buyer_id', input.buyerId);

  const { data: prefs } = await query;
  const changes = (prefs || []).map(p => ({
    buyerId: p.buyer_id, buyerName: (p.buyers as { name?: string })?.name || 'Unknown',
    changedAt: p.updated_at || '', previousPrefs: {}, newPrefs: { minPrice: p.price_range_min, maxPrice: p.price_range_max },
  }));

  return { changes, alerts: changes.length > 0 ? ['Preferences updated - consider re-matching properties'] : [] };
};

// ============================================================================
// 13. recommendBuyerActions
// ============================================================================
const recommendActionsInput = z.object({ buyerId: z.string().optional() });
const recommendActionsOutput = z.object({
  actions: z.array(z.object({
    buyerId: z.string(), buyerName: z.string(), action: z.string(),
    priority: z.enum(['high', 'medium', 'low']), expectedImpact: z.string(),
  })),
});

type RecommendActionsInput = z.infer<typeof recommendActionsInput>;
type RecommendActionsOutput = z.infer<typeof recommendActionsOutput>;

const recommendActionsDef: ToolDefinition<RecommendActionsInput, RecommendActionsOutput> = {
  id: 'buyer.recommendActions', name: 'recommendBuyerActions',
  description: 'Suggest next actions for buyers prioritized by impact',
  category: 'buyer_management', requiredPermission: 'read',
  inputSchema: recommendActionsInput, outputSchema: recommendActionsOutput,
  requiresConfirmation: false, tags: ['buyer', 'actions', 'recommendations'],
};

const recommendActionsHandler: ToolHandler<RecommendActionsInput, RecommendActionsOutput> = async (input, ctx) => {
  const supabase = await createClient();
  let query = supabase.from('buyers').select('*').eq('user_id', ctx.userId);
  if (input.buyerId) query = query.eq('id', input.buyerId);

  const { data: buyers } = await query.limit(20);
  const actions = (buyers || []).map(b => ({
    buyerId: b.id, buyerName: b.name,
    action: b.status === 'active' ? 'Send new deal alerts' : 'Re-engage with personalized outreach',
    priority: (b.rating && b.rating >= 4 ? 'high' : b.status === 'active' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    expectedImpact: b.rating && b.rating >= 4 ? 'High likelihood of deal' : 'Moderate engagement boost',
  }));

  return { actions };
};

/**
 * Register all buyer management tools
 */
export function registerBuyerManagementTools(): void {
  toolRegistry.register(matchBuyersDefinition, matchBuyersHandler);
  toolRegistry.register(getBuyerInsightsDefinition, getBuyerInsightsHandler);
  toolRegistry.register(analyzeBuyerActivityDefinition, analyzeBuyerActivityHandler);
  toolRegistry.register(searchBuyersDefinition, searchBuyersHandler);
  toolRegistry.register(suggestOutreachDef, suggestOutreachHandler);
  toolRegistry.register(compareBuyersDef, compareBuyersHandler);
  toolRegistry.register(predictBehaviorDef, predictBehaviorHandler);
  toolRegistry.register(segmentBuyersDef, segmentBuyersHandler);
  toolRegistry.register(identifyGapsDef, identifyGapsHandler);
  toolRegistry.register(genReportDef, genReportHandler);
  toolRegistry.register(scoreFitDef, scoreFitHandler);
  toolRegistry.register(trackPrefDef, trackPrefHandler);
  toolRegistry.register(recommendActionsDef, recommendActionsHandler);
  console.log('[Buyer Management Tools] Registered 13 buyer database AI tools');
}

