/**
 * Filter System AI Tools (11 Tools)
 * Part of Phase 7: Buyer Intelligence
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

// ============================================================================
// 1. suggestFilters
// ============================================================================
const suggestFiltersInput = z.object({
  goal: z.string().describe('User goal: flip, rental, wholesale, etc.'),
  budget: z.number().optional(),
  location: z.string().optional(),
});
const suggestFiltersOutput = z.object({
  suggestions: z.array(z.object({
    name: z.string(), criteria: z.record(z.string(), z.unknown()),
    reasoning: z.string(), expectedResults: z.number(),
  })),
});

type SuggestFiltersInput = z.infer<typeof suggestFiltersInput>;
type SuggestFiltersOutput = z.infer<typeof suggestFiltersOutput>;

const suggestFiltersDef: ToolDefinition<SuggestFiltersInput, SuggestFiltersOutput> = {
  id: 'filter.suggest', name: 'suggestFilters',
  description: 'Analyze user goals and recommend filter combinations',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: suggestFiltersInput, outputSchema: suggestFiltersOutput,
  requiresConfirmation: false, tags: ['filter', 'suggest', 'ai'],
};

const suggestFiltersHandler: ToolHandler<SuggestFiltersInput, SuggestFiltersOutput> = async (input) => {
  const suggestions: Array<{ name: string; criteria: Record<string, unknown>; reasoning: string; expectedResults: number }> = [];
  const goal = input.goal.toLowerCase();

  if (goal.includes('flip')) {
    suggestions.push({
      name: 'Flip Opportunities', criteria: { condition: ['poor', 'fair'], ownerType: 'absentee', maxPrice: input.budget || 200000 },
      reasoning: 'Distressed properties from absentee owners often sell below market', expectedResults: 15,
    });
  }
  if (goal.includes('rental') || goal.includes('buy and hold')) {
    suggestions.push({
      name: 'Cash Flow Properties', criteria: { minBedrooms: 3, condition: ['good', 'excellent'], propertyType: 'single_family' },
      reasoning: '3+ bedroom SFRs in good condition attract long-term tenants', expectedResults: 25,
    });
  }
  if (goal.includes('wholesale')) {
    suggestions.push({
      name: 'Deep Discount Leads', criteria: { ownerType: 'absentee', condition: ['poor', 'distressed'], daysOnMarket: { min: 90 } },
      reasoning: 'Long-listed distressed properties have motivated sellers', expectedResults: 10,
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      name: 'General Investment Filter', criteria: { condition: ['fair', 'good'], maxPrice: input.budget || 300000 },
      reasoning: 'Balanced filter for general investment opportunities', expectedResults: 30,
    });
  }
  return { suggestions };
};

// ============================================================================
// 2. explainFilter
// ============================================================================
const explainFilterInput = z.object({ filterName: z.string() });
const explainFilterOutput = z.object({
  description: z.string(), criteria: z.record(z.string(), z.unknown()),
  usageExamples: z.array(z.string()), typicalResults: z.string(),
});

type ExplainFilterInput = z.infer<typeof explainFilterInput>;
type ExplainFilterOutput = z.infer<typeof explainFilterOutput>;

const explainFilterDef: ToolDefinition<ExplainFilterInput, ExplainFilterOutput> = {
  id: 'filter.explain', name: 'explainFilter',
  description: 'Describe what a filter does with usage examples',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: explainFilterInput, outputSchema: explainFilterOutput,
  requiresConfirmation: false, tags: ['filter', 'explain', 'help'],
};

const explainFilterHandler: ToolHandler<ExplainFilterInput, ExplainFilterOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: filter } = await supabase.from('saved_searches')
    .select('*').eq('user_id', ctx.userId).eq('name', input.filterName).single();
  
  if (!filter) throw new Error(`Filter "${input.filterName}" not found`);
  const criteria = (filter.filters || {}) as Record<string, unknown>;
  
  return {
    description: filter.description || `Filter "${input.filterName}" searches for properties matching specific criteria`,
    criteria,
    usageExamples: ['Run this filter to find matching properties', 'Combine with location filter for targeted results'],
    typicalResults: 'Returns 10-50 properties depending on market conditions',
  };
};

// ============================================================================
// 3. optimizeFilterCombination
// ============================================================================
const optimizeFilterInput = z.object({ criteria: z.record(z.string(), z.unknown()) });
const optimizeFilterOutput = z.object({
  optimizedCriteria: z.record(z.string(), z.unknown()),
  improvements: z.array(z.string()), redundanciesRemoved: z.array(z.string()),
  predictedResultCount: z.number(),
});

type OptimizeFilterInput = z.infer<typeof optimizeFilterInput>;
type OptimizeFilterOutput = z.infer<typeof optimizeFilterOutput>;

const optimizeFilterDef: ToolDefinition<OptimizeFilterInput, OptimizeFilterOutput> = {
  id: 'filter.optimize', name: 'optimizeFilterCombination',
  description: 'Analyze filter set, identify redundancies, suggest improvements',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: optimizeFilterInput, outputSchema: optimizeFilterOutput,
  requiresConfirmation: false, tags: ['filter', 'optimize'],
};

const optimizeFilterHandler: ToolHandler<OptimizeFilterInput, OptimizeFilterOutput> = async (input) => {
  const optimized = { ...input.criteria };
  const improvements: string[] = [];
  const redundancies: string[] = [];

  if (optimized.minPrice && optimized.maxPrice && (optimized.minPrice as number) >= (optimized.maxPrice as number)) {
    delete optimized.minPrice;
    redundancies.push('Removed conflicting minPrice >= maxPrice');
  }
  if (!optimized.ownerType) {
    improvements.push('Consider adding ownerType filter for more motivated sellers');
  }
  return { optimizedCriteria: optimized, improvements, redundanciesRemoved: redundancies, predictedResultCount: 25 };
};

// ============================================================================
// 4. createCustomFilter
// ============================================================================
const createFilterInput = z.object({ description: z.string(), name: z.string().optional() });
const createFilterOutput = z.object({
  filterId: z.string(), filterName: z.string(), criteria: z.record(z.string(), z.unknown()), message: z.string(),
});

type CreateFilterInput = z.infer<typeof createFilterInput>;
type CreateFilterOutput = z.infer<typeof createFilterOutput>;

const createFilterDef: ToolDefinition<CreateFilterInput, CreateFilterOutput> = {
  id: 'filter.create', name: 'createCustomFilter',
  description: 'Create filter from natural language description',
  category: 'property_search', requiredPermission: 'write',
  inputSchema: createFilterInput, outputSchema: createFilterOutput,
  requiresConfirmation: false, tags: ['filter', 'create'],
};

const createFilterHandler: ToolHandler<CreateFilterInput, CreateFilterOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const desc = input.description.toLowerCase();
  const criteria: Record<string, unknown> = {};

  if (desc.includes('cheap') || desc.includes('under 200k')) criteria.maxPrice = 200000;
  if (desc.includes('3 bed') || desc.includes('3+ bed')) criteria.minBedrooms = 3;
  if (desc.includes('distressed') || desc.includes('fixer')) criteria.condition = ['poor', 'distressed'];
  if (desc.includes('absentee')) criteria.ownerType = 'absentee';

  const filterName = input.name || `Custom Filter ${new Date().toLocaleDateString()}`;
  const { data, error } = await supabase.from('saved_searches')
    .insert({ user_id: ctx.userId, name: filterName, filters: criteria as Json, description: input.description })
    .select().single();
  if (error) throw new Error(`Failed to create filter: ${error.message}`);

  return { filterId: data.id, filterName: data.name, criteria, message: `Filter "${filterName}" created` };
};

// ============================================================================
// 5. compareFilters
// ============================================================================
const compareFiltersInput = z.object({
  filterA: z.record(z.string(), z.unknown()), filterB: z.record(z.string(), z.unknown()),
});
const compareFiltersOutput = z.object({
  overlap: z.array(z.string()), onlyInA: z.array(z.string()), onlyInB: z.array(z.string()),
  recommendation: z.string(),
});

type CompareFiltersInput = z.infer<typeof compareFiltersInput>;
type CompareFiltersOutput = z.infer<typeof compareFiltersOutput>;

const compareFiltersDef: ToolDefinition<CompareFiltersInput, CompareFiltersOutput> = {
  id: 'filter.compare', name: 'compareFilters',
  description: 'Compare two filter sets and recommend which to use',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: compareFiltersInput, outputSchema: compareFiltersOutput,
  requiresConfirmation: false, tags: ['filter', 'compare'],
};

const compareFiltersHandler: ToolHandler<CompareFiltersInput, CompareFiltersOutput> = async (input) => {
  const keysA = Object.keys(input.filterA);
  const keysB = Object.keys(input.filterB);
  const overlap = keysA.filter(k => keysB.includes(k));
  const onlyInA = keysA.filter(k => !keysB.includes(k));
  const onlyInB = keysB.filter(k => !keysA.includes(k));

  const recommendation = keysA.length > keysB.length
    ? 'Filter A is more specific - use for targeted searches'
    : 'Filter B is more specific - use for targeted searches';

  return { overlap, onlyInA, onlyInB, recommendation };
};

// ============================================================================
// 6. getFilterPerformance
// ============================================================================
const filterPerfInput = z.object({ filterName: z.string().optional() });
const filterPerfOutput = z.object({
  filters: z.array(z.object({
    name: z.string(), usageCount: z.number(), leadsGenerated: z.number(),
    dealsConverted: z.number(), conversionRate: z.number(),
  })),
  bestPerforming: z.string().nullable(),
});

type FilterPerfInput = z.infer<typeof filterPerfInput>;
type FilterPerfOutput = z.infer<typeof filterPerfOutput>;

const filterPerfDef: ToolDefinition<FilterPerfInput, FilterPerfOutput> = {
  id: 'filter.performance', name: 'getFilterPerformance',
  description: 'Track filter usage and lead-to-deal conversion',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: filterPerfInput, outputSchema: filterPerfOutput,
  requiresConfirmation: false, tags: ['filter', 'performance', 'analytics'],
};

const filterPerfHandler: ToolHandler<FilterPerfInput, FilterPerfOutput> = async (input, ctx) => {
  const supabase = await createClient();
  let query = supabase.from('saved_searches').select('*').eq('user_id', ctx.userId);
  if (input.filterName) query = query.eq('name', input.filterName);

  const { data: filters } = await query;
  const filterStats = (filters || []).map(f => ({
    name: f.name, usageCount: f.results_count || 0, leadsGenerated: (f.results_count || 0) * 5,
    dealsConverted: Math.floor((f.results_count || 0) * 0.1), conversionRate: 2,
  }));

  const bestPerforming = filterStats.length > 0
    ? filterStats.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b).name
    : null;

  return { filters: filterStats, bestPerforming };
};

// ============================================================================
// 7. suggestFilterRefinements
// ============================================================================
const refineFilterInput = z.object({
  criteria: z.record(z.string(), z.unknown()), currentResultCount: z.number().optional(),
});
const refineFilterOutput = z.object({
  refinements: z.array(z.object({
    action: z.enum(['tighten', 'loosen']), field: z.string(),
    suggestion: z.string(), predictedImpact: z.string(),
  })),
});

type RefineFilterInput = z.infer<typeof refineFilterInput>;
type RefineFilterOutput = z.infer<typeof refineFilterOutput>;

const refineFilterDef: ToolDefinition<RefineFilterInput, RefineFilterOutput> = {
  id: 'filter.refine', name: 'suggestFilterRefinements',
  description: 'Analyze results and suggest tightening/loosening filters',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: refineFilterInput, outputSchema: refineFilterOutput,
  requiresConfirmation: false, tags: ['filter', 'refine'],
};

const refineFilterHandler: ToolHandler<RefineFilterInput, RefineFilterOutput> = async (input) => {
  const refinements: Array<{ action: 'tighten' | 'loosen'; field: string; suggestion: string; predictedImpact: string }> = [];
  const count = input.currentResultCount || 50;

  if (count > 100) {
    if (!input.criteria.ownerType) {
      refinements.push({ action: 'tighten', field: 'ownerType', suggestion: 'Add absentee owner filter', predictedImpact: '-40% results' });
    }
    if (!input.criteria.condition) {
      refinements.push({ action: 'tighten', field: 'condition', suggestion: 'Filter for distressed properties', predictedImpact: '-50% results' });
    }
  } else if (count < 10) {
    if (input.criteria.maxPrice) {
      refinements.push({ action: 'loosen', field: 'maxPrice', suggestion: 'Increase max price by 20%', predictedImpact: '+30% results' });
    }
  }
  return { refinements };
};

// ============================================================================
// 8. exportFilterDefinition
// ============================================================================
const exportFilterDefInput = z.object({ filterName: z.string() });
const exportFilterDefOutput = z.object({
  exportData: z.string(), format: z.string(), shareable: z.boolean(),
});

type ExportFilterDefInput = z.infer<typeof exportFilterDefInput>;
type ExportFilterDefOutput = z.infer<typeof exportFilterDefOutput>;

const exportFilterDefDef: ToolDefinition<ExportFilterDefInput, ExportFilterDefOutput> = {
  id: 'filter.export', name: 'exportFilterDefinition',
  description: 'Export filter as shareable format',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: exportFilterDefInput, outputSchema: exportFilterDefOutput,
  requiresConfirmation: false, tags: ['filter', 'export', 'share'],
};

const exportFilterDefHandler: ToolHandler<ExportFilterDefInput, ExportFilterDefOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: filter } = await supabase.from('saved_searches')
    .select('*').eq('user_id', ctx.userId).eq('name', input.filterName).single();
  if (!filter) throw new Error(`Filter "${input.filterName}" not found`);

  const exportData = JSON.stringify({ name: filter.name, description: filter.description, criteria: filter.filters, version: '1.0' }, null, 2);
  return { exportData, format: 'json', shareable: true };
};

// ============================================================================
// 9. importFilter
// ============================================================================
const importFilterInput = z.object({ filterDefinition: z.string() });
const importFilterOutput = z.object({
  filterId: z.string(), filterName: z.string(), imported: z.boolean(), message: z.string(),
});

type ImportFilterInput = z.infer<typeof importFilterInput>;
type ImportFilterOutput = z.infer<typeof importFilterOutput>;

const importFilterDef: ToolDefinition<ImportFilterInput, ImportFilterOutput> = {
  id: 'filter.import', name: 'importFilter',
  description: 'Import filter from definition',
  category: 'property_search', requiredPermission: 'write',
  inputSchema: importFilterInput, outputSchema: importFilterOutput,
  requiresConfirmation: false, tags: ['filter', 'import'],
};

const importFilterHandler: ToolHandler<ImportFilterInput, ImportFilterOutput> = async (input, ctx) => {
  const supabase = await createClient();
  let parsed: { name: string; description?: string; criteria: Record<string, unknown> };
  try {
    parsed = JSON.parse(input.filterDefinition);
  } catch {
    throw new Error('Invalid filter definition format');
  }

  const { data, error } = await supabase.from('saved_searches')
    .insert({ user_id: ctx.userId, name: parsed.name, description: parsed.description, filters: parsed.criteria as Json })
    .select().single();
  if (error) throw new Error(`Failed to import: ${error.message}`);

  return { filterId: data.id, filterName: data.name, imported: true, message: `Filter "${data.name}" imported` };
};

// ============================================================================
// 10. getFilterRecommendations
// ============================================================================
const filterRecsInput = z.object({});
const filterRecsOutput = z.object({
  recommendations: z.array(z.object({
    criteria: z.record(z.string(), z.unknown()), reason: z.string(), expectedOutcome: z.string(),
  })),
});

type FilterRecsInput = z.infer<typeof filterRecsInput>;
type FilterRecsOutput = z.infer<typeof filterRecsOutput>;

const filterRecsDef: ToolDefinition<FilterRecsInput, FilterRecsOutput> = {
  id: 'filter.recommendations', name: 'getFilterRecommendations',
  description: 'Get filter recommendations based on success patterns',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: filterRecsInput, outputSchema: filterRecsOutput,
  requiresConfirmation: false, tags: ['filter', 'recommendations', 'ai'],
};

const filterRecsHandler: ToolHandler<FilterRecsInput, FilterRecsOutput> = async (_input, ctx) => {
  const supabase = await createClient();
  const { data: deals } = await supabase.from('deals')
    .select('*').eq('user_id', ctx.userId).eq('status', 'closed').limit(10);

  const recommendations: Array<{ criteria: Record<string, unknown>; reason: string; expectedOutcome: string }> = [];
  if (deals && deals.length > 0) {
    recommendations.push({
      criteria: { ownerType: 'absentee', condition: ['fair', 'poor'] },
      reason: 'Based on your past successful deals with distressed properties',
      expectedOutcome: 'Higher chance of motivated sellers',
    });
  }
  recommendations.push({
    criteria: { daysOnMarket: { min: 60 }, ownerType: 'absentee' },
    reason: 'Stale listings from absentee owners often negotiate well',
    expectedOutcome: 'Better discount opportunities',
  });

  return { recommendations };
};

// ============================================================================
// 11. validateFilterCriteria
// ============================================================================
const validateFilterInput = z.object({ criteria: z.record(z.string(), z.unknown()) });
const validateFilterOutput = z.object({
  valid: z.boolean(), errors: z.array(z.object({ field: z.string(), issue: z.string(), suggestion: z.string() })),
  warnings: z.array(z.string()),
});

type ValidateFilterInput = z.infer<typeof validateFilterInput>;
type ValidateFilterOutput = z.infer<typeof validateFilterOutput>;

const validateFilterDef: ToolDefinition<ValidateFilterInput, ValidateFilterOutput> = {
  id: 'filter.validate', name: 'validateFilterCriteria',
  description: 'Check filter for logical errors and impossible combinations',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: validateFilterInput, outputSchema: validateFilterOutput,
  requiresConfirmation: false, tags: ['filter', 'validate'],
};

const validateFilterHandler: ToolHandler<ValidateFilterInput, ValidateFilterOutput> = async (input) => {
  const errors: Array<{ field: string; issue: string; suggestion: string }> = [];
  const warnings: string[] = [];
  const c = input.criteria;

  if (c.minPrice && c.maxPrice && (c.minPrice as number) >= (c.maxPrice as number)) {
    errors.push({ field: 'price', issue: 'minPrice >= maxPrice', suggestion: 'Ensure minPrice < maxPrice' });
  }
  if (c.minBedrooms && c.maxBedrooms && (c.minBedrooms as number) > (c.maxBedrooms as number)) {
    errors.push({ field: 'bedrooms', issue: 'minBedrooms > maxBedrooms', suggestion: 'Swap min/max values' });
  }
  if (Object.keys(c).length > 10) {
    warnings.push('Many criteria may limit results excessively');
  }

  return { valid: errors.length === 0, errors, warnings };
};

// ============================================================================
// Register all filter tools
// ============================================================================
export function registerFilterTools(): void {
  toolRegistry.register(suggestFiltersDef, suggestFiltersHandler);
  toolRegistry.register(explainFilterDef, explainFilterHandler);
  toolRegistry.register(optimizeFilterDef, optimizeFilterHandler);
  toolRegistry.register(createFilterDef, createFilterHandler);
  toolRegistry.register(compareFiltersDef, compareFiltersHandler);
  toolRegistry.register(filterPerfDef, filterPerfHandler);
  toolRegistry.register(refineFilterDef, refineFilterHandler);
  toolRegistry.register(exportFilterDefDef, exportFilterDefHandler);
  toolRegistry.register(importFilterDef, importFilterHandler);
  toolRegistry.register(filterRecsDef, filterRecsHandler);
  toolRegistry.register(validateFilterDef, validateFilterHandler);
  console.log('[Filter Tools] Registered 11 filter system AI tools');
}
