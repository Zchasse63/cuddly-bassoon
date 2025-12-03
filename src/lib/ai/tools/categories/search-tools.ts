/**
 * Search AI Tools (10 Tools)
 * Part of Phase 7: Buyer Intelligence
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

// ============================================================================
// 1. searchPropertiesByDescription
// ============================================================================
const searchByDescInput = z.object({
  description: z.string(),
  limit: z.number().optional().default(20),
});

const searchByDescOutput = z.object({
  properties: z.array(z.object({
    id: z.string(), address: z.string(), city: z.string().nullable(),
    state: z.string().nullable(), bedrooms: z.number().nullable(),
    bathrooms: z.number().nullable(), matchScore: z.number(),
  })),
  searchCriteria: z.record(z.string(), z.unknown()),
  totalFound: z.number(),
});

type SearchByDescInput = z.infer<typeof searchByDescInput>;
type SearchByDescOutput = z.infer<typeof searchByDescOutput>;

const searchByDescDef: ToolDefinition<SearchByDescInput, SearchByDescOutput> = {
  id: 'search.by_description', name: 'searchPropertiesByDescription',
  description: 'Search for properties using natural language description',
  category: 'property_search', requiredPermission: 'read',
  inputSchema: searchByDescInput, outputSchema: searchByDescOutput,
  requiresConfirmation: false, tags: ['search', 'natural-language'],
};

const searchByDescHandler: ToolHandler<SearchByDescInput, SearchByDescOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const criteria: Record<string, unknown> = {};
  const desc = input.description.toLowerCase();
  
  const bedMatch = desc.match(/(\d+)\s*(?:bed|bedroom|br)/i);
  if (bedMatch && bedMatch[1]) criteria.minBedrooms = parseInt(bedMatch[1]);

  let query = supabase.from('properties').select('*').eq('user_id', ctx.userId).limit(input.limit);
  if (criteria.minBedrooms) query = query.gte('bedrooms', criteria.minBedrooms as number);

  const { data, error } = await query;
  if (error) throw new Error(`Search failed: ${error.message}`);

  const properties = (data || []).map((p, idx) => ({
    id: p.id, address: p.address, city: p.city, state: p.state,
    bedrooms: p.bedrooms, bathrooms: p.bathrooms, matchScore: 100 - idx * 5,
  }));
  return { properties, searchCriteria: criteria, totalFound: properties.length };
};

// ============================================================================
// 2. executeFilter
// ============================================================================
const executeFilterInput = z.object({ filterName: z.string() });
const executeFilterOutput = z.object({
  properties: z.array(z.object({ id: z.string(), address: z.string(), city: z.string().nullable() })),
  filterApplied: z.string(), totalFound: z.number(),
});

type ExecuteFilterInput = z.infer<typeof executeFilterInput>;
type ExecuteFilterOutput = z.infer<typeof executeFilterOutput>;

const executeFilterDef: ToolDefinition<ExecuteFilterInput, ExecuteFilterOutput> = {
  id: 'search.execute_filter', name: 'executeFilter',
  description: 'Execute a saved search filter', category: 'property_search',
  requiredPermission: 'read', inputSchema: executeFilterInput,
  outputSchema: executeFilterOutput, requiresConfirmation: false, tags: ['search', 'filter'],
};

const executeFilterHandler: ToolHandler<ExecuteFilterInput, ExecuteFilterOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: saved, error: e1 } = await supabase.from('saved_searches')
    .select('*').eq('user_id', ctx.userId).eq('name', input.filterName).single();
  if (e1 || !saved) throw new Error(`Saved search not found: ${input.filterName}`);

  const filters = (saved.filters || {}) as Record<string, string>;
  let query = supabase.from('properties').select('id, address, city').eq('user_id', ctx.userId);
  if (filters.city) query = query.ilike('city', `%${filters.city}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Filter failed: ${error.message}`);
  return { properties: data || [], filterApplied: input.filterName, totalFound: data?.length || 0 };
};

// ============================================================================
// 3. saveSearchAsFilter
// ============================================================================
const saveSearchInput = z.object({
  criteria: z.record(z.string(), z.unknown()), name: z.string().optional(),
});
const saveSearchOutput = z.object({ filterId: z.string(), filterName: z.string(), message: z.string() });

type SaveSearchInput = z.infer<typeof saveSearchInput>;
type SaveSearchOutput = z.infer<typeof saveSearchOutput>;

const saveSearchDef: ToolDefinition<SaveSearchInput, SaveSearchOutput> = {
  id: 'search.save_filter', name: 'saveSearchAsFilter',
  description: 'Save search criteria as a reusable filter', category: 'property_search',
  requiredPermission: 'write', inputSchema: saveSearchInput,
  outputSchema: saveSearchOutput, requiresConfirmation: false, tags: ['search', 'save'],
};

const saveSearchHandler: ToolHandler<SaveSearchInput, SaveSearchOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const filterName = input.name || `Search ${new Date().toLocaleDateString()}`;
  const { data, error } = await supabase.from('saved_searches')
    .insert({ user_id: ctx.userId, name: filterName, filters: input.criteria as Json })
    .select().single();
  if (error) throw new Error(`Failed to save: ${error.message}`);
  return { filterId: data.id, filterName: data.name, message: `Filter "${filterName}" saved` };
};

// ============================================================================
// 4. getRecentSearches
// ============================================================================
const getRecentInput = z.object({ limit: z.number().optional().default(10) });
const getRecentOutput = z.object({
  searches: z.array(z.object({
    id: z.string(), queryType: z.string(), criteria: z.record(z.string(), z.unknown()),
    resultsCount: z.number(), createdAt: z.string(),
  })),
});

type GetRecentInput = z.infer<typeof getRecentInput>;
type GetRecentOutput = z.infer<typeof getRecentOutput>;

const getRecentDef: ToolDefinition<GetRecentInput, GetRecentOutput> = {
  id: 'search.recent', name: 'getRecentSearches',
  description: 'Get recent search history', category: 'property_search',
  requiredPermission: 'read', inputSchema: getRecentInput,
  outputSchema: getRecentOutput, requiresConfirmation: false, tags: ['search', 'history'],
};

const getRecentHandler: ToolHandler<GetRecentInput, GetRecentOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('search_history').select('*')
    .eq('user_id', ctx.userId).order('created_at', { ascending: false }).limit(input.limit);
  if (error) throw new Error(`Failed: ${error.message}`);
  const searches = (data || []).map(s => ({
    id: s.id, queryType: s.query_type, criteria: s.criteria as Record<string, unknown>,
    resultsCount: s.results_count || 0, createdAt: s.created_at || '',
  }));
  return { searches };
};

// ============================================================================
// 5. refineSearch
// ============================================================================
const refineInput = z.object({
  currentCriteria: z.record(z.string(), z.unknown()),
  refinementRequest: z.string(),
});
const refineOutput = z.object({
  refinedCriteria: z.record(z.string(), z.unknown()),
  appliedRefinements: z.array(z.string()),
});

type RefineInput = z.infer<typeof refineInput>;
type RefineOutput = z.infer<typeof refineOutput>;

const refineDef: ToolDefinition<RefineInput, RefineOutput> = {
  id: 'search.refine', name: 'refineSearch',
  description: 'Refine search based on natural language', category: 'property_search',
  requiredPermission: 'read', inputSchema: refineInput,
  outputSchema: refineOutput, requiresConfirmation: false, tags: ['search', 'refine'],
};

const refineHandler: ToolHandler<RefineInput, RefineOutput> = async (input) => {
  const refined = { ...input.currentCriteria };
  const applied: string[] = [];
  const req = input.refinementRequest.toLowerCase();

  if (req.includes('cheaper')) {
    const max = (refined.maxPrice as number) || 500000;
    refined.maxPrice = Math.round(max * 0.8);
    applied.push(`Reduced max price to $${refined.maxPrice}`);
  }
  if (req.includes('bigger') || req.includes('more bedrooms')) {
    const min = (refined.minBedrooms as number) || 2;
    refined.minBedrooms = min + 1;
    applied.push(`Increased min bedrooms to ${refined.minBedrooms}`);
  }
  return { refinedCriteria: refined, appliedRefinements: applied };
};

// ============================================================================
// 6. compareSearchResults
// ============================================================================
const compareInput = z.object({
  searchA: z.array(z.string()), searchB: z.array(z.string()),
});
const compareOutput = z.object({
  overlap: z.array(z.string()), onlyInA: z.array(z.string()), onlyInB: z.array(z.string()),
  overlapPct: z.number(), summary: z.string(),
});

type CompareInput = z.infer<typeof compareInput>;
type CompareOutput = z.infer<typeof compareOutput>;

const compareDef: ToolDefinition<CompareInput, CompareOutput> = {
  id: 'search.compare', name: 'compareSearchResults',
  description: 'Compare two search result sets', category: 'property_search',
  requiredPermission: 'read', inputSchema: compareInput,
  outputSchema: compareOutput, requiresConfirmation: false, tags: ['search', 'compare'],
};

const compareHandler: ToolHandler<CompareInput, CompareOutput> = async (input) => {
  const setA = new Set(input.searchA);
  const setB = new Set(input.searchB);
  const overlap = input.searchA.filter(id => setB.has(id));
  const onlyInA = input.searchA.filter(id => !setB.has(id));
  const onlyInB = input.searchB.filter(id => !setA.has(id));
  const total = new Set([...input.searchA, ...input.searchB]).size;
  const overlapPct = total > 0 ? (overlap.length / total) * 100 : 0;
  return { overlap, onlyInA, onlyInB, overlapPct, summary: `${overlap.length} in common (${overlapPct.toFixed(1)}%)` };
};

// ============================================================================
// 7. exportSearchResults
// ============================================================================
const exportInput = z.object({
  propertyIds: z.array(z.string()), format: z.enum(['csv', 'json']).default('csv'),
});
const exportOutput = z.object({ exportData: z.string(), format: z.string(), count: z.number() });

type ExportInput = z.infer<typeof exportInput>;
type ExportOutput = z.infer<typeof exportOutput>;

const exportDef: ToolDefinition<ExportInput, ExportOutput> = {
  id: 'search.export', name: 'exportSearchResults',
  description: 'Export search results to CSV/JSON', category: 'property_search',
  requiredPermission: 'read', inputSchema: exportInput,
  outputSchema: exportOutput, requiresConfirmation: false, tags: ['search', 'export'],
};

const exportHandler: ToolHandler<ExportInput, ExportOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('properties').select('*')
    .eq('user_id', ctx.userId).in('id', input.propertyIds);
  if (error) throw new Error(`Export failed: ${error.message}`);

  let exportData: string;
  if (input.format === 'json') {
    exportData = JSON.stringify(data, null, 2);
  } else {
    const headers = ['Address', 'City', 'State', 'Zip', 'Bedrooms', 'Bathrooms'];
    const rows = (data || []).map(p => [p.address, p.city, p.state, p.zip, p.bedrooms, p.bathrooms].join(','));
    exportData = [headers.join(','), ...rows].join('\n');
  }
  return { exportData, format: input.format, count: data?.length || 0 };
};

// ============================================================================
// 8. scheduleSearch
// ============================================================================
const scheduleInput = z.object({
  name: z.string(), criteria: z.record(z.string(), z.unknown()),
  frequency: z.enum(['daily', 'weekly', 'monthly']), notifyVia: z.enum(['email', 'sms', 'both', 'none']).default('email'),
});
const scheduleOutput = z.object({ scheduleId: z.string(), nextRun: z.string(), message: z.string() });

type ScheduleInput = z.infer<typeof scheduleInput>;
type ScheduleOutput = z.infer<typeof scheduleOutput>;

const scheduleDef: ToolDefinition<ScheduleInput, ScheduleOutput> = {
  id: 'search.schedule', name: 'scheduleSearch',
  description: 'Schedule a recurring search', category: 'property_search',
  requiredPermission: 'write', inputSchema: scheduleInput,
  outputSchema: scheduleOutput, requiresConfirmation: false, tags: ['search', 'schedule'],
};

const scheduleHandler: ToolHandler<ScheduleInput, ScheduleOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const nextRun = new Date();
  if (input.frequency === 'daily') nextRun.setDate(nextRun.getDate() + 1);
  else if (input.frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
  else nextRun.setMonth(nextRun.getMonth() + 1);

  const { data, error } = await supabase.from('scheduled_searches')
    .insert({
      user_id: ctx.userId, name: input.name, criteria: input.criteria as Json,
      frequency: input.frequency, notify_via: input.notifyVia, next_run_at: nextRun.toISOString(), is_active: true,
    }).select().single();
  if (error) throw new Error(`Failed to schedule: ${error.message}`);
  return { scheduleId: data.id, nextRun: nextRun.toISOString(), message: `Search scheduled ${input.frequency}` };
};

// ============================================================================
// 9. getSearchSuggestions
// ============================================================================
const suggestInput = z.object({ currentCriteria: z.record(z.string(), z.unknown()).optional() });
const suggestOutput = z.object({
  suggestions: z.array(z.object({ criteria: z.record(z.string(), z.unknown()), reason: z.string(), confidence: z.number() })),
});

type SuggestInput = z.infer<typeof suggestInput>;
type SuggestOutput = z.infer<typeof suggestOutput>;

const suggestDef: ToolDefinition<SuggestInput, SuggestOutput> = {
  id: 'search.suggestions', name: 'getSearchSuggestions',
  description: 'Get AI-based search suggestions', category: 'property_search',
  requiredPermission: 'read', inputSchema: suggestInput,
  outputSchema: suggestOutput, requiresConfirmation: false, tags: ['search', 'suggestions'],
};

const suggestHandler: ToolHandler<SuggestInput, SuggestOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const { data: deals } = await supabase.from('deals').select('*')
    .eq('user_id', ctx.userId).eq('status', 'closed').limit(20);

  const suggestions: Array<{ criteria: Record<string, unknown>; reason: string; confidence: number }> = [];
  if (deals && deals.length > 0) {
    suggestions.push({
      criteria: { status: 'distressed', ...(input.currentCriteria || {}) },
      reason: `Based on your ${deals.length} successful deals`, confidence: 80,
    });
  }
  suggestions.push({
    criteria: { ownerType: 'absentee', ...(input.currentCriteria || {}) },
    reason: 'Absentee owners are often more motivated', confidence: 75,
  });
  return { suggestions };
};

// ============================================================================
// 10. analyzeSearchPerformance
// ============================================================================
const analyzeInput = z.object({ timeRange: z.enum(['week', 'month', 'quarter', 'year']).default('month') });
const analyzeOutput = z.object({
  totalSearches: z.number(), searchesToDeals: z.number(), conversionRate: z.number(),
  recommendations: z.array(z.string()),
});

type AnalyzeInput = z.infer<typeof analyzeInput>;
type AnalyzeOutput = z.infer<typeof analyzeOutput>;

const analyzeDef: ToolDefinition<AnalyzeInput, AnalyzeOutput> = {
  id: 'search.analyze', name: 'analyzeSearchPerformance',
  description: 'Analyze search-to-deal conversion', category: 'property_search',
  requiredPermission: 'read', inputSchema: analyzeInput,
  outputSchema: analyzeOutput, requiresConfirmation: false, tags: ['search', 'analytics'],
};

const analyzeHandler: ToolHandler<AnalyzeInput, AnalyzeOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const now = new Date();
  const start = new Date();
  if (input.timeRange === 'week') start.setDate(now.getDate() - 7);
  else if (input.timeRange === 'month') start.setMonth(now.getMonth() - 1);
  else if (input.timeRange === 'quarter') start.setMonth(now.getMonth() - 3);
  else start.setFullYear(now.getFullYear() - 1);

  const { data: searches } = await supabase.from('search_history').select('*')
    .eq('user_id', ctx.userId).gte('created_at', start.toISOString());
  const { data: deals } = await supabase.from('deals').select('*')
    .eq('user_id', ctx.userId).gte('created_at', start.toISOString());

  const totalSearches = searches?.length || 0;
  const searchesToDeals = deals?.length || 0;
  const conversionRate = totalSearches > 0 ? (searchesToDeals / totalSearches) * 100 : 0;

  const recommendations: string[] = [];
  if (conversionRate < 5) recommendations.push('Consider narrowing your search criteria');
  if (totalSearches < 10) recommendations.push('Increase search frequency to find more opportunities');

  return { totalSearches, searchesToDeals, conversionRate: Math.round(conversionRate * 100) / 100, recommendations };
};

// ============================================================================
// Register all search tools
// ============================================================================
export function registerSearchTools(): void {
  toolRegistry.register(searchByDescDef, searchByDescHandler);
  toolRegistry.register(executeFilterDef, executeFilterHandler);
  toolRegistry.register(saveSearchDef, saveSearchHandler);
  toolRegistry.register(getRecentDef, getRecentHandler);
  toolRegistry.register(refineDef, refineHandler);
  toolRegistry.register(compareDef, compareHandler);
  toolRegistry.register(exportDef, exportHandler);
  toolRegistry.register(scheduleDef, scheduleHandler);
  toolRegistry.register(suggestDef, suggestHandler);
  toolRegistry.register(analyzeDef, analyzeHandler);
  console.log('[Search Tools] Registered 10 search AI tools');
}
