/**
 * Batch Operations Tools
 * Tools for bulk operations on properties and deals
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// Skip Trace Bulk Tool
// NOTE: Skip trace remains mocked as per user requirements - needs external API
// ============================================================================
const skipTraceBulkInput = z.object({
  propertyIds: z.array(z.string()).min(1).max(500),
  priority: z.enum(['standard', 'rush']).default('standard'),
  includeRelatives: z.boolean().default(false),
});

const skipTraceBulkOutput = z.object({
  jobId: z.string(),
  totalQueued: z.number(),
  estimatedCompletionTime: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
});

type SkipTraceBulkInput = z.infer<typeof skipTraceBulkInput>;
type SkipTraceBulkOutput = z.infer<typeof skipTraceBulkOutput>;

const skipTraceBulkDefinition: ToolDefinition<SkipTraceBulkInput, SkipTraceBulkOutput> = {
  id: 'batch.skip_trace_bulk',
  name: 'Bulk Skip Trace',
  description: 'Queue multiple properties for skip tracing. Returns a job ID to track progress.',
  category: 'batch_operations',
  requiredPermission: 'execute',
  inputSchema: skipTraceBulkInput,
  outputSchema: skipTraceBulkOutput,
  requiresConfirmation: true,
  estimatedDuration: 5000,
  rateLimit: 10,
  tags: ['batch', 'skip-trace', 'bulk'],
};

// Skip trace bulk remains mocked - requires external skip trace API integration
const skipTraceBulkHandler: ToolHandler<SkipTraceBulkInput, SkipTraceBulkOutput> = async (input) => {
  console.log('[Batch] Skip trace bulk:', input.propertyIds.length, 'properties');

  // TODO: Integrate with external skip trace API (e.g., BatchSkipTracing, REISkip)
  // For now, return mock data as skip trace requires paid external service
  return {
    jobId: `job_${Date.now()}`,
    totalQueued: input.propertyIds.length,
    estimatedCompletionTime: new Date(Date.now() + input.propertyIds.length * 2000).toISOString(),
    status: 'queued',
  };
};

// ============================================================================
// Add to List Bulk Tool - Real Supabase Implementation
// ============================================================================
const addToListBulkInput = z.object({
  propertyIds: z.array(z.string()).min(1).max(1000),
  listId: z.string(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const addToListBulkOutput = z.object({
  added: z.number(),
  duplicates: z.number(),
  failed: z.number(),
  listId: z.string(),
});

type AddToListBulkInput = z.infer<typeof addToListBulkInput>;
type AddToListBulkOutput = z.infer<typeof addToListBulkOutput>;

const addToListBulkDefinition: ToolDefinition<AddToListBulkInput, AddToListBulkOutput> = {
  id: 'batch.add_to_list_bulk',
  name: 'Bulk Add to List',
  description: 'Add multiple properties to a list at once with optional tags.',
  category: 'batch_operations',
  requiredPermission: 'write',
  inputSchema: addToListBulkInput,
  outputSchema: addToListBulkOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 20,
  tags: ['batch', 'list', 'bulk'],
};

const addToListBulkHandler: ToolHandler<AddToListBulkInput, AddToListBulkOutput> = async (input, ctx) => {
  const supabase = await createClient();

  let added = 0;
  let duplicates = 0;
  let failed = 0;

  // First, get leads associated with these properties
  const { data: leads } = await supabase
    .from('leads')
    .select('id, property_id')
    .eq('user_id', ctx.userId)
    .in('property_id', input.propertyIds);

  const leadMap = new Map((leads || []).map((l) => [l.property_id, l.id]));

  // Add each lead to the list
  for (const propertyId of input.propertyIds) {
    const leadId = leadMap.get(propertyId);
    if (!leadId) {
      failed++;
      continue;
    }

    const { error } = await supabase.from('lead_list_members').insert({
      lead_id: leadId,
      lead_list_id: input.listId,
      added_by: ctx.userId,
      metadata: {
        tags: input.tags || [],
        notes: input.notes || null,
      },
    });

    if (error) {
      if (error.code === '23505') {
        // Unique violation - duplicate
        duplicates++;
      } else {
        failed++;
      }
    } else {
      added++;
    }
  }

  return {
    added,
    duplicates,
    failed,
    listId: input.listId,
  };
};

// ============================================================================
// Update Deal Status Bulk Tool - Real Supabase Implementation
// ============================================================================
const updateDealStatusBulkInput = z.object({
  dealIds: z.array(z.string()).min(1).max(100),
  newStatus: z.string(),
  reason: z.string().optional(),
  notifyAssignees: z.boolean().default(true),
});

const updateDealStatusBulkOutput = z.object({
  updated: z.number(),
  failed: z.number(),
  errors: z.array(z.object({ dealId: z.string(), error: z.string() })),
});

type UpdateDealStatusBulkInput = z.infer<typeof updateDealStatusBulkInput>;
type UpdateDealStatusBulkOutput = z.infer<typeof updateDealStatusBulkOutput>;

const updateDealStatusBulkDefinition: ToolDefinition<UpdateDealStatusBulkInput, UpdateDealStatusBulkOutput> = {
  id: 'batch.update_deal_status',
  name: 'Bulk Update Deal Status',
  description: 'Update the status of multiple deals at once.',
  category: 'batch_operations',
  requiredPermission: 'write',
  inputSchema: updateDealStatusBulkInput,
  outputSchema: updateDealStatusBulkOutput,
  requiresConfirmation: true,
  estimatedDuration: 2000,
  rateLimit: 15,
  tags: ['batch', 'deals', 'status'],
};

const updateDealStatusBulkHandler: ToolHandler<UpdateDealStatusBulkInput, UpdateDealStatusBulkOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  let updated = 0;
  const errors: Array<{ dealId: string; error: string }> = [];

  for (const dealId of input.dealIds) {
    // Update the deal status
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        status: input.newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId)
      .eq('user_id', ctx.userId);

    if (updateError) {
      errors.push({ dealId, error: updateError.message });
      continue;
    }

    // Log the activity
    await supabase.from('deal_activities').insert({
      deal_id: dealId,
      user_id: ctx.userId,
      activity_type: 'stage_change',
      description: `Bulk status update to ${input.newStatus}${input.reason ? `: ${input.reason}` : ''}`,
      metadata: { bulk_update: true, reason: input.reason },
    });

    updated++;
  }

  return {
    updated,
    failed: errors.length,
    errors,
  };
};

// ============================================================================
// Export Properties Tool - Real Supabase Implementation
// ============================================================================
const exportPropertiesInput = z.object({
  propertyIds: z.array(z.string()).min(1).max(5000),
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
  fields: z.array(z.string()).optional(),
  includeOwnerInfo: z.boolean().default(false),
});

const exportPropertiesOutput = z.object({
  downloadUrl: z.string(),
  expiresAt: z.string(),
  recordCount: z.number(),
  fileSize: z.number(),
});

type ExportPropertiesInput = z.infer<typeof exportPropertiesInput>;
type ExportPropertiesOutput = z.infer<typeof exportPropertiesOutput>;

const exportPropertiesDefinition: ToolDefinition<ExportPropertiesInput, ExportPropertiesOutput> = {
  id: 'batch.export_properties',
  name: 'Export Properties',
  description: 'Export properties to CSV, Excel, or JSON format.',
  category: 'batch_operations',
  requiredPermission: 'read',
  inputSchema: exportPropertiesInput,
  outputSchema: exportPropertiesOutput,
  requiresConfirmation: false,
  estimatedDuration: 10000,
  rateLimit: 5,
  tags: ['batch', 'export', 'download'],
};

const exportPropertiesHandler: ToolHandler<ExportPropertiesInput, ExportPropertiesOutput> = async (input, ctx) => {
  const supabase = await createClient();

  // Define fields to select based on input
  const defaultFields = [
    'id',
    'address',
    'city',
    'state',
    'zip',
    'property_type',
    'bedrooms',
    'bathrooms',
    'square_footage',
    'year_built',
    'latitude',
    'longitude',
  ];
  const ownerFields = input.includeOwnerInfo ? ['owner_name', 'owner_type'] : [];
  const selectFields = input.fields?.length ? input.fields : [...defaultFields, ...ownerFields];

  // Query properties
  const { data: properties, error } = await supabase
    .from('properties')
    .select(selectFields.join(', '))
    .in('id', input.propertyIds);

  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }

  // Generate export content
  let content: string;
  let contentType: string;

  if (input.format === 'json') {
    content = JSON.stringify(properties, null, 2);
    contentType = 'application/json';
  } else {
    // CSV format (also used for xlsx fallback)
    const headers = selectFields.join(',');
    const rows = (properties || []).map((p) =>
      selectFields
        .map((f) => {
          const val = (p as Record<string, unknown>)[f];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return String(val);
        })
        .join(',')
    );
    content = [headers, ...rows].join('\n');
    contentType = 'text/csv';
  }

  // Try to upload to Supabase storage
  const fileName = `exports/properties_${ctx.userId}_${Date.now()}.${input.format === 'xlsx' ? 'csv' : input.format}`;
  const { error: uploadError } = await supabase.storage.from('exports').upload(fileName, content, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    // If storage bucket doesn't exist or upload fails, return data URL
    const base64Content = Buffer.from(content).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Content}`;

    return {
      downloadUrl: dataUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      recordCount: properties?.length || 0,
      fileSize: content.length,
    };
  }

  // Get signed URL for download
  const { data: urlData } = await supabase.storage.from('exports').createSignedUrl(fileName, 3600); // 1 hour expiry

  return {
    downloadUrl: urlData?.signedUrl || '',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    recordCount: properties?.length || 0,
    fileSize: content.length,
  };
};

// ============================================================================
// Register All Batch Tools
// ============================================================================
export function registerBatchTools() {
  toolRegistry.register(skipTraceBulkDefinition, skipTraceBulkHandler);
  toolRegistry.register(addToListBulkDefinition, addToListBulkHandler);
  toolRegistry.register(updateDealStatusBulkDefinition, updateDealStatusBulkHandler);
  toolRegistry.register(exportPropertiesDefinition, exportPropertiesHandler);
}

export const batchTools = {
  skipTraceBulk: skipTraceBulkDefinition,
  addToListBulk: addToListBulkDefinition,
  updateDealStatusBulk: updateDealStatusBulkDefinition,
  exportProperties: exportPropertiesDefinition,
};
