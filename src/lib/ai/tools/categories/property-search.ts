/**
 * Property Search Tools
 * Tools for searching and filtering properties
 */

import { z } from 'zod';

import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';

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
  // TODO: Implement actual property search
  console.log('[Property Search] Searching with filters:', input);
  
  return {
    properties: [],
    total: 0,
    hasMore: false,
  };
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
  // TODO: Implement actual property details fetch
  console.log('[Property Search] Getting details for:', input.propertyId);
  
  return {
    property: {
      id: input.propertyId,
      address: '',
      city: '',
      state: '',
      zip: '',
      propertyType: '',
    },
  };
};

/**
 * Register all property search tools
 */
export function registerPropertySearchTools(): void {
  toolRegistry.register(searchPropertiesDefinition, searchPropertiesHandler);
  toolRegistry.register(getPropertyDetailsDefinition, getPropertyDetailsHandler);
  console.log('[Property Search Tools] Registered 2 tools');
}

