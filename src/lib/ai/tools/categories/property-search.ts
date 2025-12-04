/**
 * Property Search Tools
 * Tools for searching and filtering properties
 *
 * Uses REAL APIs:
 * - RentCast for property data (140M+ records)
 * - Supabase for cached/local property data
 */

import { z } from 'zod';

import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { getRentCastClient } from '@/lib/rentcast';
import { createClient } from '@/lib/supabase/server';

// Search Properties Tool
const searchPropertiesInput = z.object({
  location: z.string().optional(),
  propertyType: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  bedrooms: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  squareFootage: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  ownerType: z.array(z.string()).optional(),
  equityPercent: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  motivationScore: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  limit: z.number().optional().default(25),
  offset: z.number().optional().default(0),
});

const searchPropertiesOutput = z.object({
  properties: z.array(z.object({
    id: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    propertyType: z.string(),
    estimatedValue: z.number(),
    motivationScore: z.number().optional(),
  })),
  total: z.number(),
  hasMore: z.boolean(),
});

type SearchPropertiesInput = z.infer<typeof searchPropertiesInput>;
type SearchPropertiesOutput = z.infer<typeof searchPropertiesOutput>;

const searchPropertiesDefinition: ToolDefinition<SearchPropertiesInput, SearchPropertiesOutput> = {
  id: 'property_search.search',
  name: 'Search Properties',
  description: 'Search for properties matching specified criteria including location, price, property type, and motivation indicators',
  category: 'property_search',
  requiredPermission: 'read',
  inputSchema: searchPropertiesInput,
  outputSchema: searchPropertiesOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 30,
  tags: ['search', 'properties', 'filter'],
};

const searchPropertiesHandler: ToolHandler<SearchPropertiesInput, SearchPropertiesOutput> = async (input, _context) => {
  console.log('[Property Search] Searching with filters:', input);

  try {
    // Parse location into city/state/zip
    const locationParts = input.location?.split(',').map(s => s.trim()) || [];
    let city: string | undefined;
    let state: string | undefined;
    let zipCode: string | undefined;

    if (locationParts.length >= 2) {
      city = locationParts[0];
      state = locationParts[1]?.replace(/\s+\d+$/, ''); // Remove zip if present
    }
    if (input.location?.match(/^\d{5}$/)) {
      zipCode = input.location;
    }

    // Use RentCast API for property search
    const client = getRentCastClient();
    const properties = await client.searchProperties({
      city,
      state,
      zipCode,
      bedroomsMin: input.bedrooms?.min,
      bedroomsMax: input.bedrooms?.max,
      squareFootageMin: input.squareFootage?.min,
      squareFootageMax: input.squareFootage?.max,
      limit: input.limit,
      offset: input.offset,
    });

    console.log(`[Property Search] RentCast returned ${properties.length} properties`);

    return {
      properties: properties.map(p => ({
        id: p.id,
        address: p.formattedAddress || `${p.addressLine1 || ''}, ${p.city || ''}, ${p.state || ''} ${p.zipCode || ''}`,
        city: p.city || '',
        state: p.state || '',
        zip: p.zipCode || '',
        propertyType: p.propertyType || 'unknown',
        estimatedValue: p.lastSalePrice || p.taxAssessment?.marketValue || 0,
        motivationScore: undefined, // Not available from RentCast
      })),
      total: properties.length,
      hasMore: properties.length === input.limit,
    };
  } catch (error) {
    console.error('[Property Search] RentCast error:', error);

    // Fallback to Supabase if RentCast fails
    try {
      const supabase = await createClient();
      const query = supabase.from('properties').select('*', { count: 'exact' });

      if (input.location) {
        query.or(`city.ilike.%${input.location}%,state.ilike.%${input.location}%,zip.eq.${input.location}`);
      }

      const { data, count, error: dbError } = await query.limit(input.limit).range(input.offset, input.offset + input.limit - 1);

      if (dbError) throw dbError;

      return {
        properties: (data || []).map(p => ({
          id: p.id,
          address: p.address,
          city: p.city || '',
          state: p.state || '',
          zip: p.zip || '',
          propertyType: p.property_type || 'unknown',
          estimatedValue: p.estimated_value || 0,
          motivationScore: undefined,
        })),
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      };
    } catch (fallbackError) {
      console.error('[Property Search] Fallback error:', fallbackError);
      throw new Error(`Property search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

// Get Property Details Tool
const getPropertyDetailsInput = z.object({
  propertyId: z.string(),
  includeComps: z.boolean().optional().default(true),
  includeOwnerInfo: z.boolean().optional().default(true),
});

const getPropertyDetailsOutput = z.object({
  property: z.object({
    id: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    propertyType: z.string(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    squareFootage: z.number().optional(),
    yearBuilt: z.number().optional(),
    estimatedValue: z.number().optional(),
  }),
  owner: z.object({
    name: z.string().optional(),
    ownerType: z.string().optional(),
    ownershipLength: z.number().optional(),
    equityPercent: z.number().optional(),
  }).optional(),
  comparables: z.array(z.object({
    address: z.string(),
    salePrice: z.number(),
    saleDate: z.string(),
  })).optional(),
});

type GetPropertyDetailsInput = z.infer<typeof getPropertyDetailsInput>;
type GetPropertyDetailsOutput = z.infer<typeof getPropertyDetailsOutput>;

const getPropertyDetailsDefinition: ToolDefinition<GetPropertyDetailsInput, GetPropertyDetailsOutput> = {
  id: 'property_search.get_details',
  name: 'Get Property Details',
  description: 'Get detailed information about a specific property including owner info and comparable sales',
  category: 'property_search',
  requiredPermission: 'read',
  inputSchema: getPropertyDetailsInput,
  outputSchema: getPropertyDetailsOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 60,
  tags: ['property', 'details', 'comps'],
};

const getPropertyDetailsHandler: ToolHandler<GetPropertyDetailsInput, GetPropertyDetailsOutput> = async (input, _context) => {
  console.log('[Property Search] Getting details for:', input.propertyId);

  try {
    // Try RentCast first
    const client = getRentCastClient();
    const property = await client.getProperty(input.propertyId);

    const result: GetPropertyDetailsOutput = {
      property: {
        id: property.id,
        address: property.formattedAddress || '',
        city: property.city || '',
        state: property.state || '',
        zip: property.zipCode || '',
        propertyType: property.propertyType || 'unknown',
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        squareFootage: property.squareFootage ?? undefined,
        yearBuilt: property.yearBuilt ?? undefined,
        estimatedValue: property.lastSalePrice ?? property.taxAssessment?.marketValue ?? undefined,
      },
    };

    // Add owner info if requested
    if (input.includeOwnerInfo && property.owner) {
      result.owner = {
        name: property.owner.names?.join(', ') ?? undefined,
        ownerType: property.owner.ownerType ?? undefined,
        ownershipLength: undefined, // Calculate from lastSaleDate if available
        equityPercent: undefined,
      };
    }

    // Add comps if requested - use getValuation which includes comparables
    if (input.includeComps) {
      try {
        const valuation = await client.getValuation(property.formattedAddress);
        result.comparables = valuation.comparables?.slice(0, 5).map(c => ({
          address: c.formattedAddress || '',
          salePrice: c.price || 0,
          saleDate: c.saleDate || '',
        }));
      } catch (compsError) {
        console.warn('[Property Search] Comps fetch failed:', compsError);
      }
    }

    return result;
  } catch (error) {
    console.error('[Property Search] RentCast detail error:', error);

    // Fallback to Supabase
    try {
      const supabase = await createClient();
      const { data: property, error: dbError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', input.propertyId)
        .single();

      if (dbError || !property) {
        throw new Error('Property not found');
      }

      return {
        property: {
          id: property.id,
          address: property.address,
          city: property.city || '',
          state: property.state || '',
          zip: property.zip || '',
          propertyType: property.property_type || 'unknown',
          bedrooms: property.bedrooms || undefined,
          bathrooms: property.bathrooms || undefined,
          squareFootage: property.square_footage || undefined,
          yearBuilt: property.year_built || undefined,
          estimatedValue: property.estimated_value || undefined,
        },
        owner: input.includeOwnerInfo ? {
          name: property.owner_name || undefined,
          ownerType: property.owner_type || undefined,
          ownershipLength: property.ownership_length_months || undefined,
        } : undefined,
      };
    } catch (fallbackError) {
      console.error('[Property Search] Fallback error:', fallbackError);
      throw new Error(`Property details failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};

/**
 * Register all property search tools
 */
export function registerPropertySearchTools(): void {
  toolRegistry.register(searchPropertiesDefinition, searchPropertiesHandler);
  toolRegistry.register(getPropertyDetailsDefinition, getPropertyDetailsHandler);
  console.log('[Property Search Tools] Registered 2 tools');
}

