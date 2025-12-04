import { z } from 'zod';

// ============================================
// RentCast API Response Types
// ============================================

/**
 * Property type enumeration matching RentCast API
 */
export const PropertyTypeSchema = z.enum([
  'Single Family',
  'Multi-Family',
  'Condo',
  'Townhouse',
  'Mobile',
  'Land',
  'Other',
]);
export type PropertyType = z.infer<typeof PropertyTypeSchema>;

/**
 * Owner type enumeration
 */
export const OwnerTypeSchema = z.enum([
  'Individual',
  'Company',
  'Trust',
  'Government',
  'Bank',
  'Unknown',
]);
export type OwnerType = z.infer<typeof OwnerTypeSchema>;

/**
 * Listing status enumeration
 */
export const ListingStatusSchema = z.enum([
  'Active',
  'Pending',
  'Sold',
  'Expired',
  'Withdrawn',
  'Off Market',
]);
export type ListingStatus = z.infer<typeof ListingStatusSchema>;

// ============================================
// RentCast Property Schema
// ============================================

export const RentCastPropertySchema = z.object({
  id: z.string(),
  formattedAddress: z.string(),
  addressLine1: z.string().nullable().optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  propertyType: z.string().nullable().optional(),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  squareFootage: z.number().nullable().optional(),
  lotSize: z.number().nullable().optional(),
  yearBuilt: z.number().nullable().optional(),
  assessorID: z.string().nullable().optional(),
  legalDescription: z.string().nullable().optional(),
  subdivision: z.string().nullable().optional(),
  zoning: z.string().nullable().optional(),
  lastSaleDate: z.string().nullable().optional(),
  lastSalePrice: z.number().nullable().optional(),
  ownerOccupied: z.boolean().nullable().optional(),
  owner: z
    .object({
      names: z.array(z.string()).nullable().optional(),
      mailingAddress: z
        .object({
          addressLine1: z.string().nullable().optional(),
          addressLine2: z.string().nullable().optional(),
          city: z.string().nullable().optional(),
          state: z.string().nullable().optional(),
          zipCode: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
      ownerType: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  taxAssessment: z
    .object({
      assessedValue: z.number().nullable().optional(),
      marketValue: z.number().nullable().optional(),
      taxYear: z.number().nullable().optional(),
      taxAmount: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  features: z
    .object({
      cooling: z.boolean().nullable().optional(),
      heating: z.boolean().nullable().optional(),
      fireplace: z.boolean().nullable().optional(),
      pool: z.boolean().nullable().optional(),
      garage: z.boolean().nullable().optional(),
      garageSpaces: z.number().nullable().optional(),
      stories: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type RentCastProperty = z.infer<typeof RentCastPropertySchema>;

// ============================================
// RentCast Valuation Schema
// ============================================

export const RentCastValuationSchema = z.object({
  price: z.number(),
  priceRangeLow: z.number(),
  priceRangeHigh: z.number(),
  pricePerSquareFoot: z.number().nullable().optional(),
  confidence: z.number().nullable().optional(),
  comparables: z
    .array(
      z.object({
        id: z.string(),
        formattedAddress: z.string(),
        price: z.number().nullable().optional(),
        squareFootage: z.number().nullable().optional(),
        bedrooms: z.number().nullable().optional(),
        bathrooms: z.number().nullable().optional(),
        distance: z.number().nullable().optional(),
        saleDate: z.string().nullable().optional(),
        // Additional fields for comp analysis
        latitude: z.number().nullable().optional(),
        longitude: z.number().nullable().optional(),
        correlation: z.number().nullable().optional(),
        yearBuilt: z.number().nullable().optional(),
        propertyType: z.string().nullable().optional(),
        subdivision: z.string().nullable().optional(),
      })
    )
    .nullable()
    .optional(),
});

export type RentCastValuation = z.infer<typeof RentCastValuationSchema>;

// ============================================
// RentCast Rent Estimate Schema
// ============================================

export const RentCastRentEstimateSchema = z.object({
  rent: z.number(),
  rentRangeLow: z.number(),
  rentRangeHigh: z.number(),
  rentPerSquareFoot: z.number().nullable().optional(),
  comparables: z
    .array(
      z.object({
        id: z.string(),
        formattedAddress: z.string(),
        rent: z.number().nullable().optional(),
        squareFootage: z.number().nullable().optional(),
        bedrooms: z.number().nullable().optional(),
        bathrooms: z.number().nullable().optional(),
        distance: z.number().nullable().optional(),
        listedDate: z.string().nullable().optional(),
      })
    )
    .nullable()
    .optional(),
});

export type RentCastRentEstimate = z.infer<typeof RentCastRentEstimateSchema>;

// ============================================
// RentCast Market Data Schema
// ============================================

export const RentCastMarketDataSchema = z.object({
  zipCode: z.string(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  medianSalePrice: z.number().nullable().optional(),
  medianListPrice: z.number().nullable().optional(),
  medianRent: z.number().nullable().optional(),
  pricePerSquareFoot: z.number().nullable().optional(),
  rentPerSquareFoot: z.number().nullable().optional(),
  daysOnMarket: z.number().nullable().optional(),
  inventory: z.number().nullable().optional(),
  yearOverYearChange: z.number().nullable().optional(),
  saleToListRatio: z.number().nullable().optional(),
  monthlyData: z
    .array(
      z.object({
        month: z.string(),
        medianSalePrice: z.number().nullable().optional(),
        medianRent: z.number().nullable().optional(),
        inventory: z.number().nullable().optional(),
      })
    )
    .nullable()
    .optional(),
});

export type RentCastMarketData = z.infer<typeof RentCastMarketDataSchema>;

// ============================================
// RentCast Listing Schema
// ============================================

export const RentCastListingSchema = z.object({
  id: z.string(),
  formattedAddress: z.string(),
  addressLine1: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  listDate: z.string().nullable().optional(),
  daysOnMarket: z.number().nullable().optional(),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  squareFootage: z.number().nullable().optional(),
  propertyType: z.string().nullable().optional(),
  photos: z.array(z.string()).nullable().optional(),
  description: z.string().nullable().optional(),
  listingAgent: z
    .object({
      name: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      office: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  mlsNumber: z.string().nullable().optional(),
  priceHistory: z
    .array(
      z.object({
        date: z.string(),
        price: z.number(),
        event: z.string().nullable().optional(),
      })
    )
    .nullable()
    .optional(),
});

export type RentCastListing = z.infer<typeof RentCastListingSchema>;

// ============================================
// API Response Wrappers
// ============================================

export const PropertySearchResponseSchema = z.array(RentCastPropertySchema);
export type PropertySearchResponse = z.infer<typeof PropertySearchResponseSchema>;

export const ListingsSearchResponseSchema = z.array(RentCastListingSchema);
export type ListingsSearchResponse = z.infer<typeof ListingsSearchResponseSchema>;

// ============================================
// Search Parameters
// ============================================

export interface PropertySearchParams {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: PropertyType | string;
  bedrooms?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathrooms?: number;
  bathroomsMin?: number;
  bathroomsMax?: number;
  squareFootageMin?: number;
  squareFootageMax?: number;
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  ownerOccupied?: boolean;
  offset?: number;
  limit?: number;
}

export interface ListingsSearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  status?: 'active' | 'pending' | 'sold';
  propertyType?: PropertyType | string;
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  offset?: number;
  limit?: number;
}

// ============================================
// Internal Normalized Types
// ============================================

/**
 * Normalized property result for internal use
 */
export interface NormalizedProperty {
  id: string;
  rentcastId: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  ownerName?: string;
  ownerType?: string;
  ownerOccupied?: boolean;
  mailingAddress?: string;
  lastSaleDate?: Date;
  lastSalePrice?: number;
  assessedValue?: number;
  marketValue?: number;
  taxAmount?: number;
  equityPercent?: number;
  ownershipDurationMonths?: number;
  isAbsentee?: boolean;
  features?: {
    cooling?: boolean;
    heating?: boolean;
    fireplace?: boolean;
    pool?: boolean;
    garage?: boolean;
    garageSpaces?: number;
    stories?: number;
  };
  enrichmentStatus?: 'none' | 'partial' | 'complete';
  lastEnrichedAt?: Date;
}

/**
 * Normalized valuation for internal use
 */
export interface NormalizedValuation {
  propertyId: string;
  estimatedValue: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  pricePerSqft?: number;
  confidence?: number;
  comparableCount?: number;
  dataSource: 'rentcast';
  valuationDate: Date;
}

/**
 * Normalized rent estimate for internal use
 */
export interface NormalizedRentEstimate {
  propertyId: string;
  rentEstimate: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  rentPerSqft?: number;
  comparableCount?: number;
  dataSource: 'rentcast';
  estimateDate: Date;
}

/**
 * Normalized market data for internal use
 */
export interface NormalizedMarketData {
  zipCode: string;
  city?: string;
  state?: string;
  county?: string;
  medianHomeValue?: number;
  medianRent?: number;
  pricePerSqft?: number;
  rentPerSqft?: number;
  daysOnMarketAvg?: number;
  inventoryCount?: number;
  yearOverYearChange?: number;
  absorptionRate?: number;
  dataSource: 'rentcast';
  dataDate: Date;
}
