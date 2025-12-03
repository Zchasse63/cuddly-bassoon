/**
 * CRM Module
 * Exports for CRM and lead management
 */

import { z } from 'zod';

// Re-export types
export * from './types';
export * from './lead-workflow';
export { LeadService } from './lead-service';
export { calculateOfferStrategy, OfferStrategyService } from './offer-strategy';
export {
  generateCallerBriefing,
  generatePropertyAnalysis,
  generateNegotiationGuide,
  SalesReportService,
} from './sales-reports';

// Validation schemas
export const leadStatusSchema = z.enum([
  'new',
  'contacted',
  'engaged',
  'qualified',
  'offer_made',
  'negotiating',
  'under_contract',
  'closed',
  'lost',
]);

export const leadSourceSchema = z.enum([
  'cold_call',
  'direct_mail',
  'online_ad',
  'referral',
  'driving_for_dollars',
  'probate',
  'tax_lien',
  'other',
]);

export const contactTypeSchema = z.enum(['call', 'email', 'sms', 'visit', 'other']);
export const contactOutcomeSchema = z.enum([
  'connected',
  'no_answer',
  'left_voicemail',
  'wrong_number',
  'callback_scheduled',
  'not_interested',
  'interested',
]);

export const createLeadSchema = z.object({
  property_address: z.string().min(1, 'Property address is required').max(500),
  owner_name: z.string().max(255).optional(),
  owner_phone: z.string().max(50).optional(),
  owner_email: z.string().email().optional().or(z.literal('')),
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional(),
  motivation_score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = z.object({
  property_address: z.string().min(1).max(500).optional(),
  owner_name: z.string().max(255).nullable().optional(),
  owner_phone: z.string().max(50).nullable().optional(),
  owner_email: z.string().email().nullable().optional().or(z.literal('')),
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.nullable().optional(),
  motivation_score: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const leadListFiltersSchema = z.object({
  status: leadStatusSchema.optional(),
  source: leadSourceSchema.optional(),
  min_motivation: z.number().min(0).max(100).optional(),
  max_motivation: z.number().min(0).max(100).optional(),
  search: z.string().optional(),
  list_id: z.string().uuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(25),
});

export const createContactHistorySchema = z.object({
  contact_type: contactTypeSchema,
  outcome: contactOutcomeSchema.optional(),
  notes: z.string().optional(),
  follow_up_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const createLeadListSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  list_type: z.enum(['static', 'dynamic']),
  filter_criteria: z.record(z.string(), z.unknown()).optional(),
});

export const offerStrategySchema = z.object({
  optimal_price: z.number().positive(),
  target_price: z.number().positive(),
  maximum_price: z.number().positive(),
  walk_away_price: z.number().positive(),
  arv: z.number().positive().optional(),
  repair_estimate: z.number().positive().optional(),
  profit_margin: z.number().optional(),
  market_factor: z.number().optional(),
  strategy_reasoning: z.string().optional(),
  negotiation_tips: z.array(z.string()).optional(),
});

export const reportTypeSchema = z.enum([
  'caller_briefing',
  'property_analysis',
  'negotiation_guide',
]);
