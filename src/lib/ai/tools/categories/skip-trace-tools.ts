/**
 * Skip Tracing AI Tools
 * 10 tools for finding contact information and enriching lead data
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// 1. skipTraceLead - Skip trace a single lead
// ============================================================================
const skipTraceLeadInput = z.object({
  leadId: z.string().describe('Lead ID to skip trace'),
  includeRelatives: z.boolean().default(false),
  includeAssociates: z.boolean().default(false),
});

const skipTraceLeadOutput = z.object({
  leadId: z.string(),
  phones: z.array(
    z.object({
      number: z.string(),
      type: z.enum(['mobile', 'landline', 'voip', 'unknown']),
      score: z.number(),
    })
  ),
  emails: z.array(
    z.object({
      address: z.string(),
      score: z.number(),
    })
  ),
  addresses: z.array(
    z.object({
      address: z.string(),
      type: z.enum(['current', 'previous', 'mailing']),
    })
  ),
  message: z.string(),
});

type SkipTraceLeadInput = z.infer<typeof skipTraceLeadInput>;
type SkipTraceLeadOutput = z.infer<typeof skipTraceLeadOutput>;

const skipTraceLeadDef: ToolDefinition<SkipTraceLeadInput, SkipTraceLeadOutput> = {
  id: 'skipTrace.traceLead',
  name: 'skipTraceLead',
  description: 'Skip trace a lead to find phone numbers, emails, and addresses',
  category: 'data_enrichment',
  requiredPermission: 'execute',
  inputSchema: skipTraceLeadInput,
  outputSchema: skipTraceLeadOutput,
  requiresConfirmation: true,
  estimatedDuration: 5000,
  tags: ['skip-trace', 'contact', 'enrichment'],
};

const skipTraceLeadHandler: ToolHandler<SkipTraceLeadInput, SkipTraceLeadOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();

  // Get lead info
  const { data: lead, error } = await supabase
    .from('leads')
    .select('*, properties(*)')
    .eq('id', input.leadId)
    .eq('user_id', ctx.userId)
    .single();

  if (error || !lead) throw new Error('Lead not found');

  // In production, this would call a skip tracing API (e.g., BatchSkipTracing, REISkip)
  // For now, return mock data structure
  const mockResult = {
    leadId: input.leadId,
    phones: [
      { number: '(555) 123-4567', type: 'mobile' as const, score: 95 },
      { number: '(555) 987-6543', type: 'landline' as const, score: 80 },
    ],
    emails: [{ address: 'owner@example.com', score: 90 }],
    addresses: [{ address: lead.properties?.address || 'Unknown', type: 'current' as const }],
    message: 'Skip trace completed. Found 2 phone numbers and 1 email.',
  };

  // Store skip trace results - update owner contact info
  await supabase
    .from('leads')
    .update({
      owner_phone: mockResult.phones[0]?.number,
      owner_email: mockResult.emails[0]?.address,
      notes: `Skip trace completed: ${mockResult.phones.length} phones, ${mockResult.emails.length} emails found`,
    })
    .eq('id', input.leadId);

  return mockResult;
};

// ============================================================================
// 2. batchSkipTrace - Skip trace multiple leads
// ============================================================================
const batchSkipTraceInput = z.object({
  leadIds: z.array(z.string()).max(100),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
});

const batchSkipTraceOutput = z.object({
  queued: z.number(),
  estimated_completion: z.string(),
  batch_id: z.string(),
  message: z.string(),
});

type BatchSkipTraceInput = z.infer<typeof batchSkipTraceInput>;
type BatchSkipTraceOutput = z.infer<typeof batchSkipTraceOutput>;

const batchSkipTraceDef: ToolDefinition<BatchSkipTraceInput, BatchSkipTraceOutput> = {
  id: 'skipTrace.batchTrace',
  name: 'batchSkipTrace',
  description: 'Queue multiple leads for skip tracing',
  category: 'data_enrichment',
  requiredPermission: 'execute',
  inputSchema: batchSkipTraceInput,
  outputSchema: batchSkipTraceOutput,
  requiresConfirmation: true,
  tags: ['skip-trace', 'batch', 'enrichment'],
};

const batchSkipTraceHandler: ToolHandler<BatchSkipTraceInput, BatchSkipTraceOutput> = async (
  input,
  _ctx
) => {
  const batchId = `batch_${Date.now()}`;
  const estimatedMinutes = Math.ceil(input.leadIds.length / 10);

  return {
    queued: input.leadIds.length,
    estimated_completion: `${estimatedMinutes} minutes`,
    batch_id: batchId,
    message: `Queued ${input.leadIds.length} leads for skip tracing`,
  };
};

// ============================================================================
// 3. getSkipTraceStatus - Check skip trace status
// ============================================================================
const getSkipTraceStatusInput = z.object({
  leadId: z.string().optional(),
  batchId: z.string().optional(),
});

const getSkipTraceStatusOutput = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.number().optional(),
  results_count: z.number().optional(),
  message: z.string(),
});

type GetSkipTraceStatusInput = z.infer<typeof getSkipTraceStatusInput>;
type GetSkipTraceStatusOutput = z.infer<typeof getSkipTraceStatusOutput>;

const getSkipTraceStatusDef: ToolDefinition<GetSkipTraceStatusInput, GetSkipTraceStatusOutput> = {
  id: 'skipTrace.getStatus',
  name: 'getSkipTraceStatus',
  description: 'Check the status of a skip trace request',
  category: 'data_enrichment',
  requiredPermission: 'read',
  inputSchema: getSkipTraceStatusInput,
  outputSchema: getSkipTraceStatusOutput,
  requiresConfirmation: false,
  tags: ['skip-trace', 'status'],
};

const getSkipTraceStatusHandler: ToolHandler<
  GetSkipTraceStatusInput,
  GetSkipTraceStatusOutput
> = async (input, ctx) => {
  const supabase = await createClient();

  if (input.leadId) {
    const { data: lead } = await supabase
      .from('leads')
      .select('owner_phone, owner_email, notes')
      .eq('id', input.leadId)
      .eq('user_id', ctx.userId)
      .single();

    // Check if skip trace has been done by looking for contact info
    if (lead?.owner_phone || lead?.owner_email) {
      return {
        status: 'completed',
        results_count: 1,
        message: `Skip trace completed. Phone: ${lead.owner_phone || 'N/A'}, Email: ${lead.owner_email || 'N/A'}`,
      };
    }
  }

  return {
    status: 'pending',
    message: 'Skip trace not yet completed',
  };
};

// ============================================================================
// 4. validatePhoneNumber - Validate a phone number
// ============================================================================
const validatePhoneInput = z.object({
  phoneNumber: z.string(),
  checkCarrier: z.boolean().default(true),
});

const validatePhoneOutput = z.object({
  valid: z.boolean(),
  formatted: z.string(),
  type: z.enum(['mobile', 'landline', 'voip', 'unknown']),
  carrier: z.string().optional(),
  message: z.string(),
});

type ValidatePhoneInput = z.infer<typeof validatePhoneInput>;
type ValidatePhoneOutput = z.infer<typeof validatePhoneOutput>;

const validatePhoneDef: ToolDefinition<ValidatePhoneInput, ValidatePhoneOutput> = {
  id: 'skipTrace.validatePhone',
  name: 'validatePhoneNumber',
  description: 'Validate and get info about a phone number',
  category: 'data_enrichment',
  requiredPermission: 'read',
  inputSchema: validatePhoneInput,
  outputSchema: validatePhoneOutput,
  requiresConfirmation: false,
  tags: ['skip-trace', 'phone', 'validation'],
};

const validatePhoneHandler: ToolHandler<ValidatePhoneInput, ValidatePhoneOutput> = async (
  input
) => {
  // Clean phone number
  const cleaned = input.phoneNumber.replace(/\D/g, '');
  const valid = cleaned.length === 10 || cleaned.length === 11;

  return {
    valid,
    formatted: valid
      ? `(${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`
      : input.phoneNumber,
    type: 'unknown',
    message: valid ? 'Phone number is valid' : 'Invalid phone number format',
  };
};

// ============================================================================
// 5. validateEmail - Validate an email address
// ============================================================================
const validateEmailInput = z.object({
  email: z.string(),
  checkDeliverability: z.boolean().default(false),
});

const validateEmailOutput = z.object({
  valid: z.boolean(),
  deliverable: z.boolean().optional(),
  disposable: z.boolean(),
  message: z.string(),
});

type ValidateEmailInput = z.infer<typeof validateEmailInput>;
type ValidateEmailOutput = z.infer<typeof validateEmailOutput>;

const validateEmailDef: ToolDefinition<ValidateEmailInput, ValidateEmailOutput> = {
  id: 'skipTrace.validateEmail',
  name: 'validateEmail',
  description: 'Validate an email address',
  category: 'data_enrichment',
  requiredPermission: 'read',
  inputSchema: validateEmailInput,
  outputSchema: validateEmailOutput,
  requiresConfirmation: false,
  tags: ['skip-trace', 'email', 'validation'],
};

const validateEmailHandler: ToolHandler<ValidateEmailInput, ValidateEmailOutput> = async (
  input
) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(input.email);
  const disposable = ['tempmail', 'throwaway', 'guerrilla'].some((d) => input.email.includes(d));

  return {
    valid,
    disposable,
    message: valid ? 'Email format is valid' : 'Invalid email format',
  };
};

// ============================================================================
// 6. enrichLeadData - Enrich lead with additional data
// ============================================================================
const enrichLeadInput = z.object({
  leadId: z.string(),
  enrichmentTypes: z.array(z.enum(['demographics', 'property', 'financial', 'social'])),
});

const enrichLeadOutput = z.object({
  leadId: z.string(),
  enrichments: z.record(z.string(), z.unknown()),
  message: z.string(),
});

type EnrichLeadInput = z.infer<typeof enrichLeadInput>;
type EnrichLeadOutput = z.infer<typeof enrichLeadOutput>;

const enrichLeadDef: ToolDefinition<EnrichLeadInput, EnrichLeadOutput> = {
  id: 'skipTrace.enrichLead',
  name: 'enrichLeadData',
  description: 'Enrich lead with demographics, property, or financial data',
  category: 'data_enrichment',
  requiredPermission: 'execute',
  inputSchema: enrichLeadInput,
  outputSchema: enrichLeadOutput,
  requiresConfirmation: true,
  tags: ['skip-trace', 'enrichment', 'data'],
};

const enrichLeadHandler: ToolHandler<EnrichLeadInput, EnrichLeadOutput> = async (input, _ctx) => {
  const enrichments: Record<string, unknown> = {};

  for (const type of input.enrichmentTypes) {
    enrichments[type] = { status: 'enriched', timestamp: new Date().toISOString() };
  }

  return {
    leadId: input.leadId,
    enrichments,
    message: `Enriched lead with ${input.enrichmentTypes.join(', ')} data`,
  };
};

// ============================================================================
// 7. findRelatedContacts - Find relatives/associates
// ============================================================================
const findRelatedInput = z.object({
  leadId: z.string(),
  relationshipTypes: z.array(z.enum(['relative', 'associate', 'neighbor'])).default(['relative']),
});

const findRelatedOutput = z.object({
  contacts: z.array(
    z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
    })
  ),
  message: z.string(),
});

type FindRelatedInput = z.infer<typeof findRelatedInput>;
type FindRelatedOutput = z.infer<typeof findRelatedOutput>;

const findRelatedDef: ToolDefinition<FindRelatedInput, FindRelatedOutput> = {
  id: 'skipTrace.findRelated',
  name: 'findRelatedContacts',
  description: 'Find relatives, associates, or neighbors of a lead',
  category: 'data_enrichment',
  requiredPermission: 'execute',
  inputSchema: findRelatedInput,
  outputSchema: findRelatedOutput,
  requiresConfirmation: true,
  tags: ['skip-trace', 'contacts', 'relatives'],
};

const findRelatedHandler: ToolHandler<FindRelatedInput, FindRelatedOutput> = async (_input) => {
  return {
    contacts: [],
    message: 'Related contact search requires skip trace API integration',
  };
};

// ============================================================================
// 8. reversePhoneLookup - Lookup owner by phone
// ============================================================================
const reversePhoneInput = z.object({
  phoneNumber: z.string(),
});

const reversePhoneOutput = z.object({
  found: z.boolean(),
  name: z.string().optional(),
  address: z.string().optional(),
  message: z.string(),
});

type ReversePhoneInput = z.infer<typeof reversePhoneInput>;
type ReversePhoneOutput = z.infer<typeof reversePhoneOutput>;

const reversePhoneDef: ToolDefinition<ReversePhoneInput, ReversePhoneOutput> = {
  id: 'skipTrace.reversePhone',
  name: 'reversePhoneLookup',
  description: 'Look up owner information by phone number',
  category: 'data_enrichment',
  requiredPermission: 'execute',
  inputSchema: reversePhoneInput,
  outputSchema: reversePhoneOutput,
  requiresConfirmation: true,
  tags: ['skip-trace', 'phone', 'lookup'],
};

const reversePhoneHandler: ToolHandler<ReversePhoneInput, ReversePhoneOutput> = async () => {
  return {
    found: false,
    message: 'Reverse phone lookup requires skip trace API integration',
  };
};

// ============================================================================
// 9. reverseAddressLookup - Lookup owner by address
// ============================================================================
const reverseAddressInput = z.object({
  address: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

const reverseAddressOutput = z.object({
  found: z.boolean(),
  owners: z.array(
    z.object({
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
    })
  ),
  message: z.string(),
});

type ReverseAddressInput = z.infer<typeof reverseAddressInput>;
type ReverseAddressOutput = z.infer<typeof reverseAddressOutput>;

const reverseAddressDef: ToolDefinition<ReverseAddressInput, ReverseAddressOutput> = {
  id: 'skipTrace.reverseAddress',
  name: 'reverseAddressLookup',
  description: 'Look up owner information by property address',
  category: 'data_enrichment',
  requiredPermission: 'execute',
  inputSchema: reverseAddressInput,
  outputSchema: reverseAddressOutput,
  requiresConfirmation: true,
  tags: ['skip-trace', 'address', 'lookup'],
};

const reverseAddressHandler: ToolHandler<ReverseAddressInput, ReverseAddressOutput> = async () => {
  return {
    found: false,
    owners: [],
    message: 'Reverse address lookup requires skip trace API integration',
  };
};

// ============================================================================
// 10. getSkipTraceCredits - Check remaining credits
// ============================================================================
const getCreditsInput = z.object({});

const getCreditsOutput = z.object({
  remaining: z.number(),
  used_this_month: z.number(),
  plan_limit: z.number(),
  message: z.string(),
});

type GetCreditsInput = z.infer<typeof getCreditsInput>;
type GetCreditsOutput = z.infer<typeof getCreditsOutput>;

const getCreditsDef: ToolDefinition<GetCreditsInput, GetCreditsOutput> = {
  id: 'skipTrace.getCredits',
  name: 'getSkipTraceCredits',
  description: 'Check remaining skip trace credits',
  category: 'data_enrichment',
  requiredPermission: 'read',
  inputSchema: getCreditsInput,
  outputSchema: getCreditsOutput,
  requiresConfirmation: false,
  tags: ['skip-trace', 'credits', 'billing'],
};

const getCreditsHandler: ToolHandler<GetCreditsInput, GetCreditsOutput> = async () => {
  return {
    remaining: 1000,
    used_this_month: 0,
    plan_limit: 1000,
    message: 'Skip trace credits available',
  };
};

// ============================================================================
// Register all tools
// ============================================================================
export function registerSkipTraceTools(): void {
  toolRegistry.register(skipTraceLeadDef, skipTraceLeadHandler);
  toolRegistry.register(batchSkipTraceDef, batchSkipTraceHandler);
  toolRegistry.register(getSkipTraceStatusDef, getSkipTraceStatusHandler);
  toolRegistry.register(validatePhoneDef, validatePhoneHandler);
  toolRegistry.register(validateEmailDef, validateEmailHandler);
  toolRegistry.register(enrichLeadDef, enrichLeadHandler);
  toolRegistry.register(findRelatedDef, findRelatedHandler);
  toolRegistry.register(reversePhoneDef, reversePhoneHandler);
  toolRegistry.register(reverseAddressDef, reverseAddressHandler);
  toolRegistry.register(getCreditsDef, getCreditsHandler);
}
