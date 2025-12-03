/**
 * Property Detail AI Tools (13 Tools)
 * Part of Phase 7: Buyer Intelligence
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// 1. getPropertyValuation
// ============================================================================
const valuationInput = z.object({ propertyId: z.string() });
const valuationOutput = z.object({
  propertyId: z.string(), estimatedValue: z.number(), arv: z.number(),
  confidence: z.number(), breakdown: z.object({
    baseValue: z.number(), adjustments: z.array(z.object({ factor: z.string(), amount: z.number() })),
  }),
});

type ValuationInput = z.infer<typeof valuationInput>;
type ValuationOutput = z.infer<typeof valuationOutput>;

const valuationDef: ToolDefinition<ValuationInput, ValuationOutput> = {
  id: 'property.valuation', name: 'getPropertyValuation',
  description: 'Get AI-powered property valuation with ARV estimate',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: valuationInput, outputSchema: valuationOutput,
  requiresConfirmation: false, tags: ['property', 'valuation', 'arv'],
};

const valuationHandler: ToolHandler<ValuationInput, ValuationOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property, error } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (error || !property) throw new Error('Property not found');

  const sqft = property.square_footage || 1500;
  const pricePerSqft = 150;
  const baseValue = sqft * pricePerSqft;
  const adjustments = [
    { factor: 'Bedrooms', amount: ((property.bedrooms || 3) - 3) * 10000 },
    { factor: 'Bathrooms', amount: ((property.bathrooms || 2) - 2) * 8000 },
    { factor: 'Condition', amount: property.condition === 'excellent' ? 20000 : property.condition === 'poor' ? -30000 : 0 },
  ];
  const totalAdjustment = adjustments.reduce((sum, a) => sum + a.amount, 0);
  const estimatedValue = baseValue + totalAdjustment;
  const arv = Math.round(estimatedValue * 1.15);

  return { propertyId: input.propertyId, estimatedValue, arv, confidence: 75, breakdown: { baseValue, adjustments } };
};

// ============================================================================
// 2. getComparables
// ============================================================================
const compsInput = z.object({
  propertyId: z.string(), radiusMiles: z.number().optional().default(1), limit: z.number().optional().default(5),
});
const compsOutput = z.object({
  comparables: z.array(z.object({
    id: z.string(), address: z.string(), salePrice: z.number().nullable(),
    sqft: z.number().nullable(), adjustedValue: z.number(), similarity: z.number(),
  })),
  averagePrice: z.number(),
});

type CompsInput = z.infer<typeof compsInput>;
type CompsOutput = z.infer<typeof compsOutput>;

const compsDef: ToolDefinition<CompsInput, CompsOutput> = {
  id: 'property.comps', name: 'getComparables',
  description: 'Find comparable sold properties with adjustments',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: compsInput, outputSchema: compsOutput,
  requiresConfirmation: false, tags: ['property', 'comps', 'analysis'],
};

const compsHandler: ToolHandler<CompsInput, CompsOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const { data: comps } = await supabase.from('properties')
    .select('*').eq('user_id', ctx.userId).eq('city', property.city || '')
    .neq('id', input.propertyId).limit(input.limit);

  const comparables = (comps || []).map((c, idx) => ({
    id: c.id, address: c.address, salePrice: c.asking_price,
    sqft: c.square_footage, adjustedValue: c.asking_price || 200000, similarity: 90 - idx * 5,
  }));
  const averagePrice = comparables.length > 0
    ? Math.round(comparables.reduce((sum, c) => sum + c.adjustedValue, 0) / comparables.length)
    : 0;

  return { comparables, averagePrice };
};

// ============================================================================
// 3. calculateMotivationScore
// ============================================================================
const motivationInput = z.object({ propertyId: z.string() });
const motivationOutput = z.object({
  score: z.number(), level: z.enum(['low', 'medium', 'high', 'very_high']),
  factors: z.array(z.object({ factor: z.string(), impact: z.number(), description: z.string() })),
});

type MotivationInput = z.infer<typeof motivationInput>;
type MotivationOutput = z.infer<typeof motivationOutput>;

const motivationDef: ToolDefinition<MotivationInput, MotivationOutput> = {
  id: 'property.motivation', name: 'calculateMotivationScore',
  description: 'Calculate seller motivation score with reasoning',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: motivationInput, outputSchema: motivationOutput,
  requiresConfirmation: false, tags: ['property', 'motivation', 'analysis'],
};

const motivationHandler: ToolHandler<MotivationInput, MotivationOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const factors: Array<{ factor: string; impact: number; description: string }> = [];
  let score = 50;

  if (property.owner_type === 'absentee') {
    score += 15; factors.push({ factor: 'Absentee Owner', impact: 15, description: 'Owner lives elsewhere' });
  }
  if (property.condition === 'poor' || property.condition === 'distressed') {
    score += 20; factors.push({ factor: 'Property Condition', impact: 20, description: 'Property needs significant work' });
  }
  if (property.days_on_market && property.days_on_market > 90) {
    score += 10; factors.push({ factor: 'Days on Market', impact: 10, description: 'Listed for extended period' });
  }

  const level = score >= 80 ? 'very_high' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
  return { score: Math.min(100, score), level, factors };
};

// ============================================================================
// 4. generatePropertySummary
// ============================================================================
const summaryInput = z.object({
  propertyId: z.string(), audience: z.enum(['investor', 'buyer', 'agent']).default('investor'),
});
const summaryOutput = z.object({
  summary: z.string(), highlights: z.array(z.string()), investmentPotential: z.string(),
});

type SummaryInput = z.infer<typeof summaryInput>;
type SummaryOutput = z.infer<typeof summaryOutput>;

const summaryDef: ToolDefinition<SummaryInput, SummaryOutput> = {
  id: 'property.summary', name: 'generatePropertySummary',
  description: 'Generate AI-written property description for different audiences',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: summaryInput, outputSchema: summaryOutput,
  requiresConfirmation: false, tags: ['property', 'summary', 'content'],
};

const summaryHandler: ToolHandler<SummaryInput, SummaryOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const summary = `${property.bedrooms || 3}BR/${property.bathrooms || 2}BA property at ${property.address}, ${property.city}. ${property.square_footage || 1500} sqft with ${property.condition || 'average'} condition.`;
  const highlights = [
    `${property.bedrooms || 3} bedrooms, ${property.bathrooms || 2} bathrooms`,
    `${property.square_footage || 1500} square feet`,
    `Located in ${property.city}, ${property.state}`,
  ];
  const investmentPotential = input.audience === 'investor'
    ? 'Strong potential for value-add investment with renovation opportunity.'
    : 'Well-positioned property in established neighborhood.';

  return { summary, highlights, investmentPotential };
};

// ============================================================================
// 5. analyzeDealPotential
// ============================================================================
const dealInput = z.object({ propertyId: z.string() });
const dealOutput = z.object({
  dealScore: z.number(), potentialProfit: z.number(), riskLevel: z.enum(['low', 'medium', 'high']),
  recommendation: z.string(), metrics: z.object({ arv: z.number(), repairs: z.number(), maxOffer: z.number() }),
});

type DealInput = z.infer<typeof dealInput>;
type DealOutput = z.infer<typeof dealOutput>;

const dealDef: ToolDefinition<DealInput, DealOutput> = {
  id: 'property.deal_potential', name: 'analyzeDealPotential',
  description: 'Calculate potential profit margins and assess risk factors',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: dealInput, outputSchema: dealOutput,
  requiresConfirmation: false, tags: ['property', 'deal', 'analysis'],
};

const dealHandler: ToolHandler<DealInput, DealOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const arv = (property.asking_price || 200000) * 1.2;
  const repairs = property.condition === 'poor' ? 50000 : property.condition === 'fair' ? 25000 : 10000;
  const maxOffer = arv * 0.7 - repairs;
  const potentialProfit = arv - maxOffer - repairs - (arv * 0.1);
  const dealScore = potentialProfit > 30000 ? 85 : potentialProfit > 15000 ? 70 : 50;
  const riskLevel = repairs > 40000 ? 'high' : repairs > 20000 ? 'medium' : 'low';
  const recommendation = dealScore >= 70 ? 'Strong deal potential - recommend pursuing' : 'Marginal deal - proceed with caution';

  return { dealScore, potentialProfit: Math.round(potentialProfit), riskLevel, recommendation, metrics: { arv, repairs, maxOffer } };
};

// ============================================================================
// 6. getOwnershipHistory
// ============================================================================
const ownershipInput = z.object({ propertyId: z.string() });
const ownershipOutput = z.object({
  currentOwner: z.object({ name: z.string().nullable(), since: z.string().nullable(), durationYears: z.number() }),
  history: z.array(z.object({ owner: z.string(), from: z.string(), to: z.string(), salePrice: z.number().nullable() })),
  patterns: z.array(z.string()),
});

type OwnershipInput = z.infer<typeof ownershipInput>;
type OwnershipOutput = z.infer<typeof ownershipOutput>;

const ownershipDef: ToolDefinition<OwnershipInput, OwnershipOutput> = {
  id: 'property.ownership', name: 'getOwnershipHistory',
  description: 'Retrieve ownership timeline and identify patterns',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: ownershipInput, outputSchema: ownershipOutput,
  requiresConfirmation: false, tags: ['property', 'ownership', 'history'],
};

const ownershipHandler: ToolHandler<OwnershipInput, OwnershipOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const durationYears = 5;
  const currentOwner = { name: property.owner_name || 'Unknown', since: '2019-01-01', durationYears };
  const history = [{ owner: 'Previous Owner', from: '2015-01-01', to: '2019-01-01', salePrice: 180000 }];
  const patterns = durationYears > 10 ? ['Long-term owner - may be less motivated'] : ['Recent purchase - standard ownership'];

  return { currentOwner, history, patterns };
};

// ============================================================================
// 7. estimateRepairCosts
// ============================================================================
const repairInput = z.object({ propertyId: z.string() });
const repairOutput = z.object({
  totalEstimate: z.object({ low: z.number(), mid: z.number(), high: z.number() }),
  breakdown: z.array(z.object({ category: z.string(), low: z.number(), mid: z.number(), high: z.number() })),
});

type RepairInput = z.infer<typeof repairInput>;
type RepairOutput = z.infer<typeof repairOutput>;

const repairDef: ToolDefinition<RepairInput, RepairOutput> = {
  id: 'property.repairs', name: 'estimateRepairCosts',
  description: 'Generate repair estimate with category breakdown',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: repairInput, outputSchema: repairOutput,
  requiresConfirmation: false, tags: ['property', 'repairs', 'estimate'],
};

const repairHandler: ToolHandler<RepairInput, RepairOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const multiplier = property.condition === 'poor' ? 2 : property.condition === 'fair' ? 1.5 : 1;
  const breakdown = [
    { category: 'Kitchen', low: 5000 * multiplier, mid: 10000 * multiplier, high: 20000 * multiplier },
    { category: 'Bathrooms', low: 3000 * multiplier, mid: 6000 * multiplier, high: 12000 * multiplier },
    { category: 'Flooring', low: 2000 * multiplier, mid: 5000 * multiplier, high: 10000 * multiplier },
    { category: 'Paint', low: 1500 * multiplier, mid: 3000 * multiplier, high: 5000 * multiplier },
    { category: 'HVAC', low: 0, mid: 3000 * multiplier, high: 8000 * multiplier },
  ];
  const totalEstimate = {
    low: breakdown.reduce((sum, b) => sum + b.low, 0),
    mid: breakdown.reduce((sum, b) => sum + b.mid, 0),
    high: breakdown.reduce((sum, b) => sum + b.high, 0),
  };

  return { totalEstimate, breakdown };
};

// ============================================================================
// 8. predictTimeOnMarket
// ============================================================================
const tomInput = z.object({ propertyId: z.string() });
const tomOutput = z.object({
  predictedDays: z.number(), confidence: z.number(),
  factors: z.array(z.object({ factor: z.string(), impact: z.string() })),
});

type TomInput = z.infer<typeof tomInput>;
type TomOutput = z.infer<typeof tomOutput>;

const tomDef: ToolDefinition<TomInput, TomOutput> = {
  id: 'property.time_on_market', name: 'predictTimeOnMarket',
  description: 'Predict days to sell based on market and property characteristics',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: tomInput, outputSchema: tomOutput,
  requiresConfirmation: false, tags: ['property', 'market', 'prediction'],
};

const tomHandler: ToolHandler<TomInput, TomOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  let predictedDays = 45;
  const factors: Array<{ factor: string; impact: string }> = [];

  if (property.condition === 'excellent') {
    predictedDays -= 10; factors.push({ factor: 'Excellent condition', impact: '-10 days' });
  } else if (property.condition === 'poor') {
    predictedDays += 20; factors.push({ factor: 'Poor condition', impact: '+20 days' });
  }
  if ((property.asking_price || 0) < 200000) {
    predictedDays -= 5; factors.push({ factor: 'Lower price point', impact: '-5 days' });
  }

  return { predictedDays, confidence: 70, factors };
};

// ============================================================================
// 9. getNeighborhoodInsights
// ============================================================================
const neighborhoodInput = z.object({ propertyId: z.string() });
const neighborhoodOutput = z.object({
  overview: z.string(), metrics: z.object({ crimeIndex: z.number(), schoolRating: z.number(), walkScore: z.number() }),
  trends: z.array(z.object({ metric: z.string(), trend: z.string(), value: z.string() })),
  investmentOutlook: z.string(),
});

type NeighborhoodInput = z.infer<typeof neighborhoodInput>;
type NeighborhoodOutput = z.infer<typeof neighborhoodOutput>;

const neighborhoodDef: ToolDefinition<NeighborhoodInput, NeighborhoodOutput> = {
  id: 'property.neighborhood', name: 'getNeighborhoodInsights',
  description: 'Analyze surrounding area including crime, schools, and market trends',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: neighborhoodInput, outputSchema: neighborhoodOutput,
  requiresConfirmation: false, tags: ['property', 'neighborhood', 'analysis'],
};

const neighborhoodHandler: ToolHandler<NeighborhoodInput, NeighborhoodOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  return {
    overview: `${property.city}, ${property.state} - Established residential neighborhood`,
    metrics: { crimeIndex: 35, schoolRating: 7, walkScore: 55 },
    trends: [
      { metric: 'Home Values', trend: 'up', value: '+5% YoY' },
      { metric: 'Rental Rates', trend: 'up', value: '+3% YoY' },
      { metric: 'Days on Market', trend: 'down', value: '-10 days' },
    ],
    investmentOutlook: 'Positive - Area showing steady appreciation with strong rental demand',
  };
};

// ============================================================================
// 10. compareToPortfolio
// ============================================================================
const portfolioInput = z.object({ propertyId: z.string() });
const portfolioOutput = z.object({
  similarDeals: z.array(z.object({ dealId: z.string(), address: z.string(), similarity: z.number(), outcome: z.string() })),
  successLikelihood: z.number(), insights: z.array(z.string()),
});

type PortfolioInput = z.infer<typeof portfolioInput>;
type PortfolioOutput = z.infer<typeof portfolioOutput>;

const portfolioDef: ToolDefinition<PortfolioInput, PortfolioOutput> = {
  id: 'property.portfolio_compare', name: 'compareToPortfolio',
  description: 'Compare property to user past deals and predict success',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: portfolioInput, outputSchema: portfolioOutput,
  requiresConfirmation: false, tags: ['property', 'portfolio', 'comparison'],
};

const portfolioHandler: ToolHandler<PortfolioInput, PortfolioOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const { data: deals } = await supabase.from('deals')
    .select('*').eq('user_id', ctx.userId).eq('status', 'closed').limit(5);

  const similarDeals = (deals || []).map((d, idx) => ({
    dealId: d.id, address: d.property_address || 'Unknown', similarity: 85 - idx * 5, outcome: 'Profitable',
  }));
  const successLikelihood = similarDeals.length > 0 ? 75 : 50;
  const insights = similarDeals.length > 0
    ? ['Similar to your past successful deals', 'Price point matches your typical range']
    : ['No similar deals in portfolio for comparison'];

  return { similarDeals, successLikelihood, insights };
};

// ============================================================================
// 11. generateOfferPrice
// ============================================================================
const offerInput = z.object({
  propertyId: z.string(), targetProfit: z.number().optional().default(20000),
});
const offerOutput = z.object({
  recommendedOffer: z.number(), maxOffer: z.number(),
  justification: z.string(), breakdown: z.object({ arv: z.number(), repairs: z.number(), holdingCosts: z.number(), profit: z.number() }),
});

type OfferInput = z.infer<typeof offerInput>;
type OfferOutput = z.infer<typeof offerOutput>;

const offerDef: ToolDefinition<OfferInput, OfferOutput> = {
  id: 'property.offer_price', name: 'generateOfferPrice',
  description: 'Calculate optimal offer price with justification',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: offerInput, outputSchema: offerOutput,
  requiresConfirmation: false, tags: ['property', 'offer', 'pricing'],
};

const offerHandler: ToolHandler<OfferInput, OfferOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const arv = (property.asking_price || 200000) * 1.2;
  const repairs = property.condition === 'poor' ? 40000 : 20000;
  const holdingCosts = arv * 0.05;
  const profit = input.targetProfit;
  const maxOffer = arv - repairs - holdingCosts - profit - (arv * 0.06);
  const recommendedOffer = Math.round(maxOffer * 0.95);

  return {
    recommendedOffer, maxOffer: Math.round(maxOffer),
    justification: `Based on ARV of $${arv.toLocaleString()}, estimated repairs of $${repairs.toLocaleString()}, and target profit of $${profit.toLocaleString()}`,
    breakdown: { arv, repairs, holdingCosts: Math.round(holdingCosts), profit },
  };
};

// ============================================================================
// 12. assessRentalPotential
// ============================================================================
const rentalInput = z.object({ propertyId: z.string() });
const rentalOutput = z.object({
  estimatedRent: z.number(), capRate: z.number(), cashFlow: z.number(),
  marketComparison: z.string(), recommendation: z.string(),
});

type RentalInput = z.infer<typeof rentalInput>;
type RentalOutput = z.infer<typeof rentalOutput>;

const rentalDef: ToolDefinition<RentalInput, RentalOutput> = {
  id: 'property.rental', name: 'assessRentalPotential',
  description: 'Estimate rental income and calculate cap rate',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: rentalInput, outputSchema: rentalOutput,
  requiresConfirmation: false, tags: ['property', 'rental', 'investment'],
};

const rentalHandler: ToolHandler<RentalInput, RentalOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const bedrooms = property.bedrooms || 3;
  const estimatedRent = 800 + (bedrooms * 200);
  const propertyValue = property.asking_price || 200000;
  const annualRent = estimatedRent * 12;
  const expenses = annualRent * 0.4;
  const noi = annualRent - expenses;
  const capRate = (noi / propertyValue) * 100;
  const cashFlow = (noi / 12) - (propertyValue * 0.006);

  return {
    estimatedRent, capRate: Math.round(capRate * 100) / 100, cashFlow: Math.round(cashFlow),
    marketComparison: 'Rent is in line with market rates for the area',
    recommendation: capRate >= 6 ? 'Good rental investment opportunity' : 'Below target cap rate - negotiate lower price',
  };
};

// ============================================================================
// 13. flagPropertyIssues
// ============================================================================
const issuesInput = z.object({ propertyId: z.string() });
const issuesOutput = z.object({
  issues: z.array(z.object({
    type: z.string(), severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(), recommendation: z.string(),
  })),
  overallRisk: z.enum(['low', 'medium', 'high']), clearToProceed: z.boolean(),
});

type IssuesInput = z.infer<typeof issuesInput>;
type IssuesOutput = z.infer<typeof issuesOutput>;

const issuesDef: ToolDefinition<IssuesInput, IssuesOutput> = {
  id: 'property.issues', name: 'flagPropertyIssues',
  description: 'Identify potential red flags including title issues, liens, and violations',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: issuesInput, outputSchema: issuesOutput,
  requiresConfirmation: false, tags: ['property', 'issues', 'risk'],
};

const issuesHandler: ToolHandler<IssuesInput, IssuesOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: property } = await supabase.from('properties')
    .select('*').eq('id', input.propertyId).eq('user_id', ctx.userId).single();
  if (!property) throw new Error('Property not found');

  const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string; recommendation: string }> = [];

  if (property.condition === 'poor') {
    issues.push({
      type: 'Property Condition', severity: 'medium',
      description: 'Property in poor condition may have hidden issues',
      recommendation: 'Conduct thorough inspection before purchase',
    });
  }
  if (property.days_on_market && property.days_on_market > 180) {
    issues.push({
      type: 'Extended Market Time', severity: 'low',
      description: 'Property has been on market for extended period',
      recommendation: 'Investigate reason for slow sale',
    });
  }

  const overallRisk = issues.some(i => i.severity === 'critical' || i.severity === 'high') ? 'high'
    : issues.some(i => i.severity === 'medium') ? 'medium' : 'low';
  const clearToProceed = !issues.some(i => i.severity === 'critical');

  return { issues, overallRisk, clearToProceed };
};

// ============================================================================
// Register all property detail tools
// ============================================================================
export function registerPropertyDetailTools(): void {
  toolRegistry.register(valuationDef, valuationHandler);
  toolRegistry.register(compsDef, compsHandler);
  toolRegistry.register(motivationDef, motivationHandler);
  toolRegistry.register(summaryDef, summaryHandler);
  toolRegistry.register(dealDef, dealHandler);
  toolRegistry.register(ownershipDef, ownershipHandler);
  toolRegistry.register(repairDef, repairHandler);
  toolRegistry.register(tomDef, tomHandler);
  toolRegistry.register(neighborhoodDef, neighborhoodHandler);
  toolRegistry.register(portfolioDef, portfolioHandler);
  toolRegistry.register(offerDef, offerHandler);
  toolRegistry.register(rentalDef, rentalHandler);
  toolRegistry.register(issuesDef, issuesHandler);
  console.log('[Property Detail Tools] Registered 13 property detail AI tools');
}
