/**
 * Buyer Validation Schemas
 * Zod schemas for buyer data validation
 */

import { z } from 'zod';

export const buyerTypeSchema = z.enum(['flipper', 'landlord', 'wholesaler', 'developer', 'other']);
export const buyerStatusSchema = z.enum(['active', 'inactive', 'qualified', 'unqualified']);
export const buyerTierSchema = z.enum(['A', 'B', 'C']);
export const conditionToleranceSchema = z.enum(['turnkey', 'light_rehab', 'moderate_rehab', 'heavy_rehab', 'gut']);
export const transactionTypeSchema = z.enum(['purchase', 'sale']);
export const qualificationStageSchema = z.enum(['new', 'contacted', 'pof_received', 'verified', 'qualified']);

// Buyer creation schema
export const createBuyerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  company_name: z.string().max(255).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  buyer_type: buyerTypeSchema.optional(),
  status: buyerStatusSchema.default('active'),
  notes: z.string().optional(),
});

// Buyer update schema
export const updateBuyerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  company_name: z.string().max(255).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().max(50).nullable().optional(),
  buyer_type: buyerTypeSchema.nullable().optional(),
  status: buyerStatusSchema.nullable().optional(),
  tier: buyerTierSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Market schema for preferences
export const marketSchema = z.object({
  zip: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Preferences schema
export const preferencesSchema = z.object({
  property_types: z.array(z.string()).optional(),
  price_range_min: z.number().min(0).optional(),
  price_range_max: z.number().min(0).optional(),
  bedroom_min: z.number().min(0).max(20).optional(),
  bedroom_max: z.number().min(0).max(20).optional(),
  markets: z.array(marketSchema).optional(),
  condition_tolerance: conditionToleranceSchema.optional(),
  max_rehab_budget: z.number().min(0).optional(),
  preferred_roi_percent: z.number().min(0).max(100).optional(),
}).refine(
  (data) => {
    if (data.price_range_min && data.price_range_max) {
      return data.price_range_min <= data.price_range_max;
    }
    return true;
  },
  { message: 'Min price must be less than or equal to max price' }
).refine(
  (data) => {
    if (data.bedroom_min && data.bedroom_max) {
      return data.bedroom_min <= data.bedroom_max;
    }
    return true;
  },
  { message: 'Min bedrooms must be less than or equal to max bedrooms' }
);

// Transaction schema
export const transactionSchema = z.object({
  property_address: z.string().max(500).optional(),
  purchase_price: z.number().min(0).optional(),
  sale_price: z.number().min(0).optional(),
  purchase_date: z.string().optional(),
  sale_date: z.string().optional(),
  transaction_type: transactionTypeSchema.optional(),
  data_source: z.string().max(100).optional(),
});

// Query filters schema
export const buyerListFiltersSchema = z.object({
  status: buyerStatusSchema.optional(),
  type: buyerTypeSchema.optional(),
  tier: buyerTierSchema.optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(25),
});

export type CreateBuyerInput = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type BuyerListFiltersInput = z.infer<typeof buyerListFiltersSchema>;

