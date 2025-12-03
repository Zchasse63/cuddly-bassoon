/**
 * Deals Module
 * Exports for deal pipeline functionality
 */

import { z } from 'zod';

// Re-export types
export * from './types';
export * from './stages';
export * from './activities';
export { DealService } from './deal-service';

// Validation schemas
export const dealStageSchema = z.enum([
  'lead',
  'contacted',
  'appointment',
  'offer',
  'contract',
  'assigned',
  'closing',
  'closed',
  'lost',
]);

export const dealStatusSchema = z.enum(['active', 'on_hold', 'cancelled', 'completed']);

export const activityTypeSchema = z.enum([
  'call',
  'email',
  'sms',
  'note',
  'stage_change',
  'meeting',
  'other',
]);

export const createDealSchema = z.object({
  property_address: z.string().min(1, 'Property address is required').max(500),
  property_id: z.string().uuid().optional(),
  stage: dealStageSchema.optional(),
  seller_name: z.string().max(255).optional(),
  seller_phone: z.string().max(50).optional(),
  seller_email: z.string().email().optional().or(z.literal('')),
  asking_price: z.number().positive().optional(),
  offer_price: z.number().positive().optional(),
  estimated_arv: z.number().positive().optional(),
  estimated_repairs: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const updateDealSchema = z.object({
  property_address: z.string().min(1).max(500).optional(),
  property_id: z.string().uuid().nullable().optional(),
  stage: dealStageSchema.optional(),
  status: dealStatusSchema.optional(),
  seller_name: z.string().max(255).nullable().optional(),
  seller_phone: z.string().max(50).nullable().optional(),
  seller_email: z.string().email().nullable().optional().or(z.literal('')),
  asking_price: z.number().positive().nullable().optional(),
  offer_price: z.number().positive().nullable().optional(),
  contract_price: z.number().positive().nullable().optional(),
  assignment_fee: z.number().positive().nullable().optional(),
  estimated_arv: z.number().positive().nullable().optional(),
  estimated_repairs: z.number().positive().nullable().optional(),
  assigned_buyer_id: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const dealListFiltersSchema = z.object({
  stage: dealStageSchema.optional(),
  status: dealStatusSchema.optional(),
  search: z.string().optional(),
  assigned_buyer_id: z.string().uuid().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(25),
});

export const createActivitySchema = z.object({
  activity_type: activityTypeSchema,
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createOfferSchema = z.object({
  offer_amount: z.number().positive('Offer amount must be positive'),
  offer_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expiration_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().optional(),
});

// Offer status schema
export const offerStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'countered',
  'expired',
  'withdrawn',
]);

export const updateOfferSchema = z.object({
  status: offerStatusSchema.optional(),
  counter_amount: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});
