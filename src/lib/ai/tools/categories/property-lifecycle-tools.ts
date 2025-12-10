/**
 * Property Lifecycle AI Tools
 * Tools for managing property status changes, sale tracking, and loss analysis
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

// Use generated types from Supabase
type PropertySaleRecord = Database['public']['Tables']['property_sales']['Row'];

// ============================================================================
// 1. markPropertySold
// ============================================================================
const markSoldInput = z.object({
  propertyId: z.string().describe('The property ID to mark as sold'),
  salePrice: z.number().optional().describe('Sale price if known'),
  saleDate: z.string().optional().describe('Sale date in YYYY-MM-DD format'),
  buyerType: z
    .enum(['investor', 'owner_occupant', 'flipper', 'wholesaler', 'unknown'])
    .optional()
    .describe('Type of buyer who purchased'),
  lostReason: z.string().optional().describe('Why we lost this deal'),
  competitorWhoWon: z.string().optional().describe('Name of competitor who won the deal'),
});

const markSoldOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  wasInPipeline: z.boolean(),
  saleRecordId: z.string().optional(),
  potentialProfitLost: z.number().optional(),
});

type MarkSoldInput = z.infer<typeof markSoldInput>;
type MarkSoldOutput = z.infer<typeof markSoldOutput>;

const markSoldDef: ToolDefinition<MarkSoldInput, MarkSoldOutput> = {
  id: 'property.mark_sold',
  name: 'markPropertySold',
  description:
    'Mark a property as sold. Use when user mentions a property sold, was purchased by someone else, or is no longer available. Records sale for loss analysis.',
  category: 'property_search',
  requiredPermission: 'write',
  inputSchema: markSoldInput,
  outputSchema: markSoldOutput,
  requiresConfirmation: false,
  tags: ['property', 'lifecycle', 'sold', 'loss'],
};

const markSoldHandler: ToolHandler<MarkSoldInput, MarkSoldOutput> = async (input, ctx) => {
  const supabase = await createClient();

  // Get the property
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', input.propertyId)
    .single();

  if (propError || !property) {
    return {
      success: false,
      message: 'Property not found',
      wasInPipeline: false,
    };
  }

  // Check if property was in pipeline (has a deal)
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('property_id', input.propertyId)
    .eq('user_id', ctx.userId)
    .neq('stage', 'closed')
    .neq('stage', 'lost')
    .single();

  const wasInPipeline = !!deal;

  // Calculate days from first contact if we had a deal
  let daysFromFirstContact: number | null = null;
  if (deal && deal.created_at) {
    const dealCreated = new Date(deal.created_at);
    const saleDate = input.saleDate ? new Date(input.saleDate) : new Date();
    daysFromFirstContact = Math.floor(
      (saleDate.getTime() - dealCreated.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Calculate price delta if we had an offer
  let priceDelta: number | null = null;
  if (deal?.offer_price && input.salePrice) {
    priceDelta = input.salePrice - deal.offer_price;
  }

  // Calculate potential profit lost (estimated 10% assignment fee)
  let potentialProfitLost: number | undefined;
  if (input.salePrice) {
    potentialProfitLost = Math.round(input.salePrice * 0.1);
  }

  // Record the sale (using type assertion until migration is run)
  let saleRecordId: string | undefined;
  try {
    const { data: saleRecord, error: saleError } = (await (supabase as any)
      .from('property_sales')
      .insert({
        property_id: input.propertyId,
        user_id: ctx.userId,
        sale_date: input.saleDate || new Date().toISOString().split('T')[0],
        sale_price: input.salePrice,
        buyer_type: input.buyerType || 'unknown',
        source: 'manual',
        was_in_pipeline: wasInPipeline,
        pipeline_stage_when_sold: deal?.stage,
        our_offer_amount: deal?.offer_price,
        days_from_first_contact: daysFromFirstContact,
        lost_reason: input.lostReason,
        competitor_who_won: input.competitorWhoWon,
        price_delta: priceDelta,
      })
      .select()
      .single()) as { data: PropertySaleRecord | null; error: any };

    if (saleError) {
      console.error('Error recording sale:', saleError);
    } else if (saleRecord) {
      saleRecordId = saleRecord.id;
    }
  } catch (e) {
    console.error('Error recording sale (table may not exist):', e);
  }

  // Update property status (using type assertion until migration is run)
  try {
    const { error: updateError } = await (supabase as any)
      .from('properties')
      .update({
        status: 'sold',
        status_changed_at: new Date().toISOString(),
        status_changed_by: ctx.userId,
        status_reason: input.salePrice
          ? `Sold for $${input.salePrice.toLocaleString()}`
          : 'Marked as sold',
      })
      .eq('id', input.propertyId);

    if (updateError) {
      console.error('Error updating property status:', updateError);
    }
  } catch (e) {
    console.error('Error updating property status (columns may not exist):', e);
  }

  // Update deal to lost if it exists
  if (deal) {
    await supabase
      .from('deals')
      .update({
        stage: 'lost',
        status: 'completed',
        notes: [
          deal.notes,
          `\n---\nProperty sold${input.buyerType ? ` to ${input.buyerType}` : ''}`,
          input.salePrice ? ` for $${input.salePrice.toLocaleString()}` : '',
          input.lostReason ? `\nReason: ${input.lostReason}` : '',
        ]
          .filter(Boolean)
          .join(''),
      })
      .eq('id', deal.id);
  }

  return {
    success: true,
    message: wasInPipeline
      ? `Marked property as sold and moved deal to lost. ${
          input.salePrice ? `Sale price: $${input.salePrice.toLocaleString()}` : ''
        }`
      : `Marked property as sold. ${
          input.salePrice ? `Sale price: $${input.salePrice.toLocaleString()}` : ''
        }`,
    wasInPipeline,
    saleRecordId,
    potentialProfitLost,
  };
};

// ============================================================================
// 2. updatePropertyStatus
// ============================================================================
const updateStatusInput = z.object({
  propertyId: z.string().describe('The property ID to update'),
  status: z
    .enum(['active', 'in_pipeline', 'sold', 'off_market', 'excluded'])
    .describe('New status for the property'),
  reason: z.string().optional().describe('Reason for status change'),
});

const updateStatusOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  previousStatus: z.string().optional(),
  newStatus: z.string(),
});

type UpdateStatusInput = z.infer<typeof updateStatusInput>;
type UpdateStatusOutput = z.infer<typeof updateStatusOutput>;

const updateStatusDef: ToolDefinition<UpdateStatusInput, UpdateStatusOutput> = {
  id: 'property.update_status',
  name: 'updatePropertyStatus',
  description:
    'Update the status of a property. Use for marking properties as off-market, excluded from searches, or back to active.',
  category: 'property_search',
  requiredPermission: 'write',
  inputSchema: updateStatusInput,
  outputSchema: updateStatusOutput,
  requiresConfirmation: false,
  tags: ['property', 'lifecycle', 'status'],
};

const updateStatusHandler: ToolHandler<UpdateStatusInput, UpdateStatusOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  // Get current status (using type assertion until migration is run)
  let previousStatus: string | undefined;
  try {
    const { data: property } = (await (supabase as any)
      .from('properties')
      .select('status')
      .eq('id', input.propertyId)
      .single()) as { data: { status?: string } | null; error: any };

    previousStatus = property?.status;
  } catch (e) {
    // Status column may not exist yet
  }

  // Update status (using type assertion until migration is run)
  try {
    const { error: updateError } = await (supabase as any)
      .from('properties')
      .update({
        status: input.status,
        status_changed_at: new Date().toISOString(),
        status_changed_by: ctx.userId,
        status_reason: input.reason,
      })
      .eq('id', input.propertyId);

    if (updateError) {
      return {
        success: false,
        message: `Failed to update status: ${updateError.message}`,
        newStatus: input.status,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: 'Failed to update status: columns may not exist yet (run migration)',
      newStatus: input.status,
    };
  }

  return {
    success: true,
    message: `Property status updated from ${previousStatus || 'unknown'} to ${input.status}`,
    previousStatus,
    newStatus: input.status,
  };
};

// ============================================================================
// 3. getLossPipelineAnalytics
// ============================================================================
const lossAnalyticsInput = z.object({
  days: z.number().optional().default(90).describe('Number of days to analyze'),
  groupBy: z
    .enum(['reason', 'stage', 'month', 'buyer_type'])
    .optional()
    .default('reason')
    .describe('How to group the results'),
});

const lossAnalyticsOutput = z.object({
  summary: z.object({
    totalLost: z.number(),
    lostFromPipeline: z.number(),
    missedEntirely: z.number(),
    totalValueLost: z.number(),
    avgPriceGap: z.number(),
    potentialFeesLost: z.number(),
  }),
  breakdown: z.array(
    z.object({
      group: z.string(),
      count: z.number(),
      percentage: z.number(),
      totalValue: z.number(),
    })
  ),
  insights: z.array(z.string()),
});

type LossAnalyticsInput = z.infer<typeof lossAnalyticsInput>;
type LossAnalyticsOutput = z.infer<typeof lossAnalyticsOutput>;

const lossAnalyticsDef: ToolDefinition<LossAnalyticsInput, LossAnalyticsOutput> = {
  id: 'property.loss_analytics',
  name: 'getLossPipelineAnalytics',
  description:
    'Get analytics on lost deals and missed opportunities. Helps understand why deals were lost and how to improve.',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: lossAnalyticsInput,
  outputSchema: lossAnalyticsOutput,
  requiresConfirmation: false,
  tags: ['analytics', 'loss', 'pipeline'],
};

const lossAnalyticsHandler: ToolHandler<LossAnalyticsInput, LossAnalyticsOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - input.days);

  // Get all sales in period (using type assertion until migration is run)
  let sales: PropertySaleRecord[] = [];
  try {
    const { data, error } = (await (supabase as any)
      .from('property_sales')
      .select('*')
      .eq('user_id', ctx.userId)
      .gte('sale_date', startDate.toISOString().split('T')[0])) as {
      data: PropertySaleRecord[] | null;
      error: any;
    };

    if (error) {
      console.error('Error fetching sales:', error);
    } else if (data) {
      sales = data;
    }
  } catch (e) {
    console.error('Error fetching sales (table may not exist):', e);
  }

  if (sales.length === 0) {
    return {
      summary: {
        totalLost: 0,
        lostFromPipeline: 0,
        missedEntirely: 0,
        totalValueLost: 0,
        avgPriceGap: 0,
        potentialFeesLost: 0,
      },
      breakdown: [],
      insights: ['No sale data available for analysis'],
    };
  }

  // Calculate summary
  const totalLost = sales.length;
  const lostFromPipeline = sales.filter((s) => s.was_in_pipeline).length;
  const missedEntirely = totalLost - lostFromPipeline;
  const totalValueLost = sales.reduce((sum, s) => sum + (s.sale_price || 0), 0);
  const priceGaps = sales
    .filter((s) => s.price_delta !== null && s.price_delta !== undefined)
    .map((s) => s.price_delta as number);
  const avgPriceGap =
    priceGaps.length > 0 ? priceGaps.reduce((a, b) => a + b, 0) / priceGaps.length : 0;
  const potentialFeesLost = Math.round(totalValueLost * 0.1);

  // Group by selected field
  const groupedData: Record<string, { count: number; value: number }> = {};

  for (const sale of sales) {
    let groupKey: string;

    switch (input.groupBy) {
      case 'reason':
        groupKey = sale.lost_reason || 'Unknown';
        break;
      case 'stage':
        groupKey = sale.pipeline_stage_when_sold || 'Not in pipeline';
        break;
      case 'month':
        groupKey = new Date(sale.sale_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        break;
      case 'buyer_type':
        groupKey = sale.buyer_type || 'Unknown';
        break;
      default:
        groupKey = 'Other';
    }

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = { count: 0, value: 0 };
    }
    const groupEntry = groupedData[groupKey]!;
    groupEntry.count++;
    groupEntry.value += sale.sale_price || 0;
  }

  const breakdown = Object.entries(groupedData)
    .map(([group, data]) => ({
      group,
      count: data.count,
      percentage: Math.round((data.count / totalLost) * 100),
      totalValue: data.value,
    }))
    .sort((a, b) => b.count - a.count);

  // Generate insights
  const insights: string[] = [];

  if (totalLost > 0) {
    if (lostFromPipeline > missedEntirely) {
      insights.push(
        `${Math.round((lostFromPipeline / totalLost) * 100)}% of lost deals were in your pipeline - focus on conversion.`
      );
    } else {
      insights.push(
        `${Math.round((missedEntirely / totalLost) * 100)}% of sales were missed entirely - expand your lead generation.`
      );
    }
  }

  if (avgPriceGap > 0) {
    insights.push(
      `On average, winning offers were $${Math.abs(avgPriceGap).toLocaleString()} higher than your offers.`
    );
  } else if (avgPriceGap < 0) {
    insights.push(
      `Your offers were competitive - you were $${Math.abs(avgPriceGap).toLocaleString()} higher on average.`
    );
  }

  const topReason = breakdown[0];
  if (topReason && input.groupBy === 'reason') {
    insights.push(
      `Most common reason for loss: "${topReason.group}" (${topReason.percentage}% of losses).`
    );
  }

  return {
    summary: {
      totalLost,
      lostFromPipeline,
      missedEntirely,
      totalValueLost,
      avgPriceGap: Math.round(avgPriceGap),
      potentialFeesLost,
    },
    breakdown,
    insights,
  };
};

// ============================================================================
// 4. excludeProperty
// ============================================================================
const excludeInput = z.object({
  propertyId: z.string().describe('The property ID to exclude'),
  reason: z
    .enum([
      'not_interested',
      'bad_neighborhood',
      'too_expensive',
      'owner_not_motivated',
      'structural_issues',
      'title_issues',
      'already_contacted',
      'other',
    ])
    .describe('Reason for excluding'),
  notes: z.string().optional().describe('Additional notes'),
});

const excludeOutput = z.object({
  success: z.boolean(),
  message: z.string(),
});

type ExcludeInput = z.infer<typeof excludeInput>;
type ExcludeOutput = z.infer<typeof excludeOutput>;

const excludeDef: ToolDefinition<ExcludeInput, ExcludeOutput> = {
  id: 'property.exclude',
  name: 'excludeProperty',
  description:
    "Exclude a property from future searches and recommendations. Use when a property doesn't fit criteria or should be ignored.",
  category: 'property_search',
  requiredPermission: 'write',
  inputSchema: excludeInput,
  outputSchema: excludeOutput,
  requiresConfirmation: false,
  tags: ['property', 'lifecycle', 'exclude'],
};

const excludeHandler: ToolHandler<ExcludeInput, ExcludeOutput> = async (input, ctx) => {
  const supabase = await createClient();

  // Update status (using type assertion until migration is run)
  try {
    const { error } = await (supabase as any)
      .from('properties')
      .update({
        status: 'excluded',
        status_changed_at: new Date().toISOString(),
        status_changed_by: ctx.userId,
        status_reason: `${input.reason}${input.notes ? `: ${input.notes}` : ''}`,
      })
      .eq('id', input.propertyId);

    if (error) {
      return {
        success: false,
        message: `Failed to exclude property: ${error.message}`,
      };
    }
  } catch (e) {
    return {
      success: false,
      message: 'Failed to exclude property: columns may not exist yet (run migration)',
    };
  }

  return {
    success: true,
    message: `Property excluded: ${input.reason}`,
  };
};

// ============================================================================
// Register all property lifecycle tools
// ============================================================================
export function registerPropertyLifecycleTools(): void {
  toolRegistry.register(markSoldDef, markSoldHandler);
  toolRegistry.register(updateStatusDef, updateStatusHandler);
  toolRegistry.register(lossAnalyticsDef, lossAnalyticsHandler);
  toolRegistry.register(excludeDef, excludeHandler);
  console.log('[Property Lifecycle Tools] Registered 4 property lifecycle AI tools');
}
