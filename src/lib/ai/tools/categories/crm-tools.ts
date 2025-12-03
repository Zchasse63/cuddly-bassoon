/**
 * CRM AI Tools
 * 12 tools for lead management, lists, and sales intelligence
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import { LeadService, LEAD_STATUSES, LeadStatus, getMotivationLevel } from '@/lib/crm';
import { Json } from '@/types/database';

// ============================================================================
// 1. createLeadList - Create a new lead list
// ============================================================================
const createListInput = z.object({
  name: z.string().describe('List name'),
  description: z.string().optional(),
  listType: z.enum(['static', 'dynamic']).default('static'),
  filterCriteria: z.record(z.string(), z.unknown()).optional(),
});

const createListOutput = z.object({
  listId: z.string(),
  name: z.string(),
  message: z.string(),
});

type CreateListInput = z.infer<typeof createListInput>;
type CreateListOutput = z.infer<typeof createListOutput>;

const createListDef: ToolDefinition<CreateListInput, CreateListOutput> = {
  id: 'crm.createLeadList',
  name: 'createLeadList',
  description: 'Create a new lead list for organizing leads',
  category: 'crm',
  requiredPermission: 'write',
  inputSchema: createListInput,
  outputSchema: createListOutput,
  requiresConfirmation: true,
  tags: ['crm', 'leads', 'list'],
};

const createListHandler: ToolHandler<CreateListInput, CreateListOutput> = async (input, ctx) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lead_lists')
    .insert({
      user_id: ctx.userId,
      name: input.name,
      description: input.description,
      list_type: input.listType,
      filter_criteria: input.filterCriteria as Json,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create list: ${error.message}`);

  return {
    listId: data.id,
    name: data.name,
    message: `Lead list "${data.name}" created successfully`,
  };
};

// ============================================================================
// 2. rankListByMotivation - Rank leads by motivation score
// ============================================================================
const rankByMotivationInput = z.object({
  listId: z.string().optional(),
  limit: z.number().default(20),
});

const rankByMotivationOutput = z.object({
  leads: z.array(
    z.object({
      leadId: z.string(),
      propertyAddress: z.string(),
      motivationScore: z.number(),
      motivationLevel: z.string(),
      status: z.string(),
    })
  ),
  totalLeads: z.number(),
});

type RankByMotivationInput = z.infer<typeof rankByMotivationInput>;
type RankByMotivationOutput = z.infer<typeof rankByMotivationOutput>;

const rankByMotivationDef: ToolDefinition<RankByMotivationInput, RankByMotivationOutput> = {
  id: 'crm.rankByMotivation',
  name: 'rankListByMotivation',
  description: 'Rank leads by motivation score, highest first',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: rankByMotivationInput,
  outputSchema: rankByMotivationOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'motivation', 'ranking'],
};

const rankByMotivationHandler: ToolHandler<RankByMotivationInput, RankByMotivationOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', ctx.userId)
    .order('motivation_score', { ascending: false, nullsFirst: false })
    .limit(input.limit);

  return {
    leads: (leads || []).map((l) => ({
      leadId: l.id,
      propertyAddress: l.property_address || '',
      motivationScore: l.motivation_score || 0,
      motivationLevel: getMotivationLevel(l.motivation_score || 0),
      status: l.status || 'new',
    })),
    totalLeads: leads?.length || 0,
  };
};

// ============================================================================
// 3. suggestLeadOutreach - Suggest leads to contact
// ============================================================================
const suggestOutreachInput = z.object({ limit: z.number().default(10) });
const suggestOutreachOutput = z.object({
  suggestions: z.array(
    z.object({
      leadId: z.string(),
      propertyAddress: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      reason: z.string(),
      suggestedAction: z.string(),
    })
  ),
});

type SuggestOutreachInput = z.infer<typeof suggestOutreachInput>;
type SuggestOutreachOutput = z.infer<typeof suggestOutreachOutput>;

const suggestOutreachDef: ToolDefinition<SuggestOutreachInput, SuggestOutreachOutput> = {
  id: 'crm.suggestOutreach',
  name: 'suggestLeadOutreach',
  description: 'Suggest leads to contact based on motivation and status',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: suggestOutreachInput,
  outputSchema: suggestOutreachOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'outreach'],
};

const suggestOutreachHandler: ToolHandler<SuggestOutreachInput, SuggestOutreachOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', ctx.userId)
    .in('status', ['new', 'contacted', 'engaged'])
    .order('motivation_score', { ascending: false, nullsFirst: false })
    .limit(input.limit);

  return {
    suggestions: (leads || []).map((l) => ({
      leadId: l.id,
      propertyAddress: l.property_address || '',
      priority: (l.motivation_score && l.motivation_score >= 70
        ? 'high'
        : l.motivation_score && l.motivation_score >= 40
          ? 'medium'
          : 'low') as 'high' | 'medium' | 'low',
      reason: `Motivation score: ${l.motivation_score || 0}, Status: ${l.status || 'new'}`,
      suggestedAction:
        l.status === 'new' ? 'Make initial contact' : 'Follow up on previous conversation',
    })),
  };
};

// ============================================================================
// 4. analyzeLeadSource - Analyze lead sources performance
// ============================================================================
const analyzeSourceInput = z.object({});
const analyzeSourceOutput = z.object({
  sources: z.array(
    z.object({
      source: z.string(),
      leadCount: z.number(),
      avgMotivation: z.number(),
      conversionRate: z.number(),
    })
  ),
  bestSource: z.string(),
  recommendation: z.string(),
});

type AnalyzeSourceInput = z.infer<typeof analyzeSourceInput>;
type AnalyzeSourceOutput = z.infer<typeof analyzeSourceOutput>;

const analyzeSourceDef: ToolDefinition<AnalyzeSourceInput, AnalyzeSourceOutput> = {
  id: 'crm.analyzeSource',
  name: 'analyzeLeadSource',
  description: 'Analyze performance of different lead sources',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: analyzeSourceInput,
  outputSchema: analyzeSourceOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'analytics', 'source'],
};

const analyzeSourceHandler: ToolHandler<AnalyzeSourceInput, AnalyzeSourceOutput> = async (
  _input,
  ctx
) => {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('source, motivation_score, status')
    .eq('user_id', ctx.userId);

  const sourceMap = new Map<string, { count: number; totalMotivation: number; closed: number }>();

  for (const lead of leads || []) {
    const source = lead.source || 'unknown';
    const current = sourceMap.get(source) || { count: 0, totalMotivation: 0, closed: 0 };
    current.count++;
    current.totalMotivation += lead.motivation_score || 0;
    if (lead.status === 'closed') current.closed++;
    sourceMap.set(source, current);
  }

  const sources = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    leadCount: data.count,
    avgMotivation: Math.round(data.totalMotivation / data.count),
    conversionRate: Math.round((data.closed / data.count) * 100),
  }));

  const best =
    sources.length > 0
      ? sources.reduce((a, b) => (a.conversionRate > b.conversionRate ? a : b))
      : null;

  return {
    sources,
    bestSource: best?.source || 'N/A',
    recommendation: best
      ? `Focus on ${best.source} - highest conversion rate at ${best.conversionRate}%`
      : 'Need more data',
  };
};

// ============================================================================
// 5. segmentLeads - Segment leads by criteria
// ============================================================================
const segmentLeadsInput = z.object({
  criteria: z.enum(['motivation', 'status', 'source', 'recency']),
});

const segmentLeadsOutput = z.object({
  segments: z.array(
    z.object({
      name: z.string(),
      leadCount: z.number(),
      description: z.string(),
    })
  ),
});

type SegmentLeadsInput = z.infer<typeof segmentLeadsInput>;
type SegmentLeadsOutput = z.infer<typeof segmentLeadsOutput>;

const segmentLeadsDef: ToolDefinition<SegmentLeadsInput, SegmentLeadsOutput> = {
  id: 'crm.segmentLeads',
  name: 'segmentLeads',
  description: 'Segment leads by motivation, status, source, or recency',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: segmentLeadsInput,
  outputSchema: segmentLeadsOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'segmentation'],
};

const segmentLeadsHandler: ToolHandler<SegmentLeadsInput, SegmentLeadsOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  const { data: leads } = await supabase.from('leads').select('*').eq('user_id', ctx.userId);

  const allLeads = leads || [];
  const segments: Array<{ name: string; leadCount: number; description: string }> = [];

  if (input.criteria === 'motivation') {
    const hot = allLeads.filter((l) => (l.motivation_score || 0) >= 70);
    const warm = allLeads.filter(
      (l) => (l.motivation_score || 0) >= 40 && (l.motivation_score || 0) < 70
    );
    const cold = allLeads.filter((l) => (l.motivation_score || 0) < 40);
    segments.push({ name: 'Hot Leads', leadCount: hot.length, description: 'Motivation 70+' });
    segments.push({ name: 'Warm Leads', leadCount: warm.length, description: 'Motivation 40-69' });
    segments.push({
      name: 'Cold Leads',
      leadCount: cold.length,
      description: 'Motivation below 40',
    });
  } else if (input.criteria === 'status') {
    const statusGroups = new Map<string, number>();
    for (const lead of allLeads) {
      const status = lead.status || 'new';
      statusGroups.set(status, (statusGroups.get(status) || 0) + 1);
    }
    for (const [status, count] of statusGroups) {
      segments.push({
        name: LEAD_STATUSES[status as LeadStatus]?.label || status,
        leadCount: count,
        description: `Status: ${status}`,
      });
    }
  }

  return { segments };
};

// ============================================================================
// 6. predictLeadConversion - Predict lead conversion likelihood
// ============================================================================
const predictConversionInput = z.object({ leadId: z.string() });
const predictConversionOutput = z.object({
  leadId: z.string(),
  conversionProbability: z.number(),
  factors: z.array(z.object({ factor: z.string(), impact: z.string() })),
  recommendation: z.string(),
});

type PredictConversionInput = z.infer<typeof predictConversionInput>;
type PredictConversionOutput = z.infer<typeof predictConversionOutput>;

const predictConversionDef: ToolDefinition<PredictConversionInput, PredictConversionOutput> = {
  id: 'crm.predictConversion',
  name: 'predictLeadConversion',
  description: 'Predict likelihood of lead converting to deal',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: predictConversionInput,
  outputSchema: predictConversionOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'prediction', 'ai'],
};

const predictConversionHandler: ToolHandler<
  PredictConversionInput,
  PredictConversionOutput
> = async (input, ctx) => {
  const supabase = await createClient();
  const service = new LeadService(supabase);

  const lead = await service.getLead(input.leadId, ctx.userId);
  if (!lead) throw new Error('Lead not found');

  const factors: Array<{ factor: string; impact: string }> = [];
  let probability = 20;

  if (lead.motivation_score && lead.motivation_score >= 70) {
    probability += 30;
    factors.push({ factor: 'High motivation', impact: '+30%' });
  } else if (lead.motivation_score && lead.motivation_score >= 40) {
    probability += 15;
    factors.push({ factor: 'Moderate motivation', impact: '+15%' });
  }

  if (lead.owner_phone) {
    probability += 10;
    factors.push({ factor: 'Has phone number', impact: '+10%' });
  }

  if (lead.total_contacts && lead.total_contacts > 0) {
    probability += Math.min(lead.total_contacts * 5, 20);
    factors.push({
      factor: `${lead.total_contacts} previous contacts`,
      impact: `+${Math.min(lead.total_contacts * 5, 20)}%`,
    });
  }

  return {
    leadId: lead.id,
    conversionProbability: Math.min(probability, 95),
    factors,
    recommendation:
      probability >= 60
        ? 'High priority - pursue aggressively'
        : probability >= 40
          ? 'Worth pursuing with consistent follow-up'
          : 'Nurture with periodic contact',
  };
};

// ============================================================================
// 7. generateLeadReport - Generate lead summary report
// ============================================================================
const genLeadReportInput = z.object({ leadId: z.string().optional() });
const genLeadReportOutput = z.object({
  report: z.object({
    title: z.string(),
    generatedAt: z.string(),
    summary: z.string(),
    metrics: z.record(z.string(), z.union([z.string(), z.number()])),
  }),
});

type GenLeadReportInput = z.infer<typeof genLeadReportInput>;
type GenLeadReportOutput = z.infer<typeof genLeadReportOutput>;

const genLeadReportDef: ToolDefinition<GenLeadReportInput, GenLeadReportOutput> = {
  id: 'crm.generateReport',
  name: 'generateLeadReport',
  description: 'Generate a summary report for leads',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: genLeadReportInput,
  outputSchema: genLeadReportOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'report'],
};

const genLeadReportHandler: ToolHandler<GenLeadReportInput, GenLeadReportOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  if (input.leadId) {
    const service = new LeadService(supabase);
    const lead = await service.getLead(input.leadId, ctx.userId);
    if (!lead) throw new Error('Lead not found');

    return {
      report: {
        title: `Lead Report: ${lead.property_address}`,
        generatedAt: new Date().toISOString(),
        summary: `${lead.property_address} - ${lead.owner_name || 'Unknown owner'}. Status: ${lead.status}. Motivation: ${lead.motivation_score || 'N/A'}/100.`,
        metrics: {
          status: lead.status as string,
          motivation: lead.motivation_score || 0,
          contacts: lead.total_contacts || 0,
          source: (lead.source || 'Unknown') as string,
        } as Record<string, string | number>,
      },
    };
  }

  const { data: leads } = await supabase.from('leads').select('*').eq('user_id', ctx.userId);
  const total = leads?.length || 0;
  const avgMotivation =
    total > 0
      ? Math.round((leads || []).reduce((sum, l) => sum + (l.motivation_score || 0), 0) / total)
      : 0;

  return {
    report: {
      title: 'Lead Pipeline Summary',
      generatedAt: new Date().toISOString(),
      summary: `You have ${total} leads in your pipeline with an average motivation score of ${avgMotivation}.`,
      metrics: { totalLeads: total, avgMotivation } as Record<string, string | number>,
    },
  };
};

// ============================================================================
// 8. identifyHotLeads - Find high-motivation leads
// ============================================================================
const identifyHotInput = z.object({
  minMotivation: z.number().default(70),
  limit: z.number().default(10),
});
const identifyHotOutput = z.object({
  hotLeads: z.array(
    z.object({
      leadId: z.string(),
      propertyAddress: z.string(),
      motivationScore: z.number(),
      status: z.string(),
      suggestedAction: z.string(),
    })
  ),
  totalHot: z.number(),
});

type IdentifyHotInput = z.infer<typeof identifyHotInput>;
type IdentifyHotOutput = z.infer<typeof identifyHotOutput>;

const identifyHotDef: ToolDefinition<IdentifyHotInput, IdentifyHotOutput> = {
  id: 'crm.identifyHot',
  name: 'identifyHotLeads',
  description: 'Find leads with high motivation scores',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: identifyHotInput,
  outputSchema: identifyHotOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'hot', 'priority'],
};

const identifyHotHandler: ToolHandler<IdentifyHotInput, IdentifyHotOutput> = async (input, ctx) => {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', ctx.userId)
    .gte('motivation_score', input.minMotivation)
    .order('motivation_score', { ascending: false })
    .limit(input.limit);

  return {
    hotLeads: (leads || []).map((l) => ({
      leadId: l.id,
      propertyAddress: l.property_address || '',
      motivationScore: l.motivation_score || 0,
      status: l.status || 'new',
      suggestedAction: l.status === 'new' ? 'Call immediately' : 'Schedule appointment',
    })),
    totalHot: leads?.length || 0,
  };
};

// ============================================================================
// 9-12: Additional tools
// ============================================================================
const trackEngagementInput = z.object({ leadId: z.string() });
const trackEngagementOutput = z.object({
  leadId: z.string(),
  engagementScore: z.number(),
  recentContacts: z.array(z.object({ type: z.string(), date: z.string(), outcome: z.string() })),
  trend: z.string(),
});

type TrackEngagementInput = z.infer<typeof trackEngagementInput>;
type TrackEngagementOutput = z.infer<typeof trackEngagementOutput>;

const trackEngagementDef: ToolDefinition<TrackEngagementInput, TrackEngagementOutput> = {
  id: 'crm.trackEngagement',
  name: 'trackLeadEngagement',
  description: 'Track engagement history for a lead',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: trackEngagementInput,
  outputSchema: trackEngagementOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'engagement'],
};

const trackEngagementHandler: ToolHandler<TrackEngagementInput, TrackEngagementOutput> = async (
  input
) => {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from('lead_contact_history')
    .select('*')
    .eq('lead_id', input.leadId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    leadId: input.leadId,
    engagementScore: Math.min((contacts?.length || 0) * 10, 100),
    recentContacts: (contacts || []).map((c) => ({
      type: c.contact_type || 'unknown',
      date: c.created_at || new Date().toISOString(),
      outcome: c.outcome || 'unknown',
    })),
    trend: (contacts?.length || 0) > 3 ? 'Increasing' : 'Stable',
  };
};

const suggestNurturingInput = z.object({ leadId: z.string() });
const suggestNurturingOutput = z.object({
  leadId: z.string(),
  nurturingPlan: z.array(
    z.object({
      action: z.string(),
      timing: z.string(),
      channel: z.string(),
    })
  ),
});

type SuggestNurturingInput = z.infer<typeof suggestNurturingInput>;
type SuggestNurturingOutput = z.infer<typeof suggestNurturingOutput>;

const suggestNurturingDef: ToolDefinition<SuggestNurturingInput, SuggestNurturingOutput> = {
  id: 'crm.suggestNurturing',
  name: 'suggestLeadNurturing',
  description: 'Suggest nurturing plan for a lead',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: suggestNurturingInput,
  outputSchema: suggestNurturingOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'nurturing'],
};

const suggestNurturingHandler: ToolHandler<SuggestNurturingInput, SuggestNurturingOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();
  const service = new LeadService(supabase);

  const lead = await service.getLead(input.leadId, ctx.userId);
  if (!lead) throw new Error('Lead not found');

  const plan = [
    { action: 'Send market update email', timing: 'This week', channel: 'email' },
    { action: 'Follow-up call', timing: 'In 3 days', channel: 'phone' },
    { action: 'Send comparable sales report', timing: 'In 1 week', channel: 'email' },
  ];

  if (lead.motivation_score && lead.motivation_score >= 70) {
    plan.unshift({ action: 'Schedule in-person meeting', timing: 'Today', channel: 'phone' });
  }

  return { leadId: input.leadId, nurturingPlan: plan };
};

const mergeLeadsInput = z.object({
  primaryLeadId: z.string(),
  duplicateLeadIds: z.array(z.string()),
});
const mergeLeadsOutput = z.object({
  mergedLeadId: z.string(),
  mergedCount: z.number(),
  message: z.string(),
});

type MergeLeadsInput = z.infer<typeof mergeLeadsInput>;
type MergeLeadsOutput = z.infer<typeof mergeLeadsOutput>;

const mergeLeadsDef: ToolDefinition<MergeLeadsInput, MergeLeadsOutput> = {
  id: 'crm.mergeLeads',
  name: 'mergeLeadRecords',
  description: 'Merge duplicate lead records',
  category: 'crm',
  requiredPermission: 'write',
  inputSchema: mergeLeadsInput,
  outputSchema: mergeLeadsOutput,
  requiresConfirmation: true,
  tags: ['crm', 'leads', 'merge', 'cleanup'],
};

const mergeLeadsHandler: ToolHandler<MergeLeadsInput, MergeLeadsOutput> = async (input, ctx) => {
  const supabase = await createClient();

  // Move contact history to primary lead
  await supabase
    .from('lead_contact_history')
    .update({ lead_id: input.primaryLeadId })
    .in('lead_id', input.duplicateLeadIds);

  // Delete duplicates
  await supabase.from('leads').delete().eq('user_id', ctx.userId).in('id', input.duplicateLeadIds);

  return {
    mergedLeadId: input.primaryLeadId,
    mergedCount: input.duplicateLeadIds.length,
    message: `Merged ${input.duplicateLeadIds.length} duplicate leads into primary record`,
  };
};

const exportLeadsInput = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  filters: z.record(z.string(), z.unknown()).optional(),
});
const exportLeadsOutput = z.object({
  exportUrl: z.string().optional(),
  leadCount: z.number(),
  format: z.string(),
  data: z.array(z.record(z.string(), z.unknown())).optional(),
});

type ExportLeadsInput = z.infer<typeof exportLeadsInput>;
type ExportLeadsOutput = z.infer<typeof exportLeadsOutput>;

const exportLeadsDef: ToolDefinition<ExportLeadsInput, ExportLeadsOutput> = {
  id: 'crm.exportLeads',
  name: 'exportLeadData',
  description: 'Export lead data in JSON or CSV format',
  category: 'crm',
  requiredPermission: 'read',
  inputSchema: exportLeadsInput,
  outputSchema: exportLeadsOutput,
  requiresConfirmation: false,
  tags: ['crm', 'leads', 'export'],
};

const exportLeadsHandler: ToolHandler<ExportLeadsInput, ExportLeadsOutput> = async (
  _input,
  ctx
) => {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from('leads')
    .select(
      'id, property_address, owner_name, owner_phone, owner_email, status, source, motivation_score, created_at'
    )
    .eq('user_id', ctx.userId);

  return {
    leadCount: leads?.length || 0,
    format: _input.format,
    data: leads as unknown as Record<string, unknown>[],
  };
};

/**
 * Register all CRM tools
 */
export function registerCrmTools(): void {
  toolRegistry.register(createListDef, createListHandler);
  toolRegistry.register(rankByMotivationDef, rankByMotivationHandler);
  toolRegistry.register(suggestOutreachDef, suggestOutreachHandler);
  toolRegistry.register(analyzeSourceDef, analyzeSourceHandler);
  toolRegistry.register(segmentLeadsDef, segmentLeadsHandler);
  toolRegistry.register(predictConversionDef, predictConversionHandler);
  toolRegistry.register(genLeadReportDef, genLeadReportHandler);
  toolRegistry.register(identifyHotDef, identifyHotHandler);
  toolRegistry.register(trackEngagementDef, trackEngagementHandler);
  toolRegistry.register(suggestNurturingDef, suggestNurturingHandler);
  toolRegistry.register(mergeLeadsDef, mergeLeadsHandler);
  toolRegistry.register(exportLeadsDef, exportLeadsHandler);
  console.log('[CRM Tools] Registered 12 CRM AI tools');
}
