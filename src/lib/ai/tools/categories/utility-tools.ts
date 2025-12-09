/**
 * Utility Tools
 * General-purpose utility functions for geocoding, calculations, and formatting
 * Integrates with Mapbox Geocoding API for location services
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { MAPBOX_TOKEN } from '@/lib/map/config';
import { calculateDistance as calcDistanceUtil, GeoPoint } from '@/lib/map/utils';

// ============================================================================
// Geocode Tool
// ============================================================================
const geocodeInput = z.object({
  address: z.string().min(1).max(500),
  country: z.string().length(2).optional(), // ISO 3166-1 alpha-2 code
  proximity: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  limit: z.number().min(1).max(10).default(1),
});

const geocodeOutput = z.object({
  results: z.array(
    z.object({
      address: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      placeType: z.string(),
      relevance: z.number(),
      context: z.object({
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        county: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
      }),
    })
  ),
  query: z.string(),
  attribution: z.string(),
});

type GeocodeInput = z.infer<typeof geocodeInput>;
type GeocodeOutput = z.infer<typeof geocodeOutput>;

const geocodeDefinition: ToolDefinition<GeocodeInput, GeocodeOutput> = {
  id: 'utility.geocode',
  name: 'Geocode Address',
  description:
    'Convert a street address or place name to geographic coordinates (latitude/longitude) using Mapbox Geocoding API.',
  category: 'utility',
  requiredPermission: 'read',
  inputSchema: geocodeInput,
  outputSchema: geocodeOutput,
  requiresConfirmation: false,
  estimatedDuration: 1000,
  rateLimit: 50,
  tags: ['utility', 'geocode', 'address', 'coordinates'],
};

const geocodeHandler: ToolHandler<GeocodeInput, GeocodeOutput> = async (input) => {
  const { address, country, proximity, limit } = input;

  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured. Unable to geocode address.');
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`
  );
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('types', 'address,place,locality,neighborhood,postcode');

  if (country) {
    url.searchParams.set('country', country.toLowerCase());
  }

  if (proximity) {
    url.searchParams.set('proximity', `${proximity.lng},${proximity.lat}`);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Geocoding API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    features: Array<{
      place_name: string;
      center: [number, number];
      place_type: string[];
      relevance: number;
      context?: Array<{
        id: string;
        text: string;
      }>;
    }>;
    query: string[];
    attribution: string;
  };

  const results = data.features.map((feature) => {
    // Extract context information
    const context: GeocodeOutput['results'][0]['context'] = {};
    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith('neighborhood')) context.neighborhood = ctx.text;
        else if (ctx.id.startsWith('place')) context.city = ctx.text;
        else if (ctx.id.startsWith('district')) context.county = ctx.text;
        else if (ctx.id.startsWith('region')) context.state = ctx.text;
        else if (ctx.id.startsWith('country')) context.country = ctx.text;
        else if (ctx.id.startsWith('postcode')) context.postalCode = ctx.text;
      }
    }

    return {
      address: feature.place_name,
      coordinates: {
        lat: feature.center[1]!,
        lng: feature.center[0]!,
      },
      placeType: feature.place_type[0] || 'unknown',
      relevance: feature.relevance,
      context,
    };
  });

  return {
    results,
    query: address,
    attribution: data.attribution || 'Mapbox',
  };
};

// ============================================================================
// Reverse Geocode Tool
// ============================================================================
const reverseGeocodeInput = z.object({
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  types: z
    .array(
      z.enum(['address', 'place', 'locality', 'neighborhood', 'postcode', 'region', 'country'])
    )
    .optional(),
});

const reverseGeocodeOutput = z.object({
  address: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  components: z.object({
    streetNumber: z.string().optional(),
    street: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    state: z.string().optional(),
    stateCode: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().optional(),
    postalCode: z.string().optional(),
  }),
  placeType: z.string(),
  attribution: z.string(),
});

type ReverseGeocodeInput = z.infer<typeof reverseGeocodeInput>;
type ReverseGeocodeOutput = z.infer<typeof reverseGeocodeOutput>;

const reverseGeocodeDefinition: ToolDefinition<ReverseGeocodeInput, ReverseGeocodeOutput> = {
  id: 'utility.reverse_geocode',
  name: 'Reverse Geocode',
  description:
    'Convert geographic coordinates (latitude/longitude) to a human-readable address using Mapbox Geocoding API.',
  category: 'utility',
  requiredPermission: 'read',
  inputSchema: reverseGeocodeInput,
  outputSchema: reverseGeocodeOutput,
  requiresConfirmation: false,
  estimatedDuration: 1000,
  rateLimit: 50,
  tags: ['utility', 'geocode', 'reverse', 'address'],
};

const reverseGeocodeHandler: ToolHandler<ReverseGeocodeInput, ReverseGeocodeOutput> = async (
  input
) => {
  const { coordinates, types } = input;

  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured. Unable to reverse geocode.');
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json`
  );
  url.searchParams.set('access_token', MAPBOX_TOKEN);

  if (types && types.length > 0) {
    url.searchParams.set('types', types.join(','));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Reverse geocoding API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as {
    features: Array<{
      place_name: string;
      center: [number, number];
      place_type: string[];
      text: string;
      address?: string;
      context?: Array<{
        id: string;
        text: string;
        short_code?: string;
      }>;
    }>;
    attribution: string;
  };

  if (!data.features || data.features.length === 0) {
    throw new Error('No address found for the given coordinates');
  }

  const feature = data.features[0]!;
  const components: ReverseGeocodeOutput['components'] = {};

  // Parse address components
  if (feature.address) {
    components.streetNumber = feature.address;
  }
  components.street = feature.text;

  if (feature.context) {
    for (const ctx of feature.context) {
      if (ctx.id.startsWith('neighborhood')) {
        components.neighborhood = ctx.text;
      } else if (ctx.id.startsWith('place')) {
        components.city = ctx.text;
      } else if (ctx.id.startsWith('district')) {
        components.county = ctx.text;
      } else if (ctx.id.startsWith('region')) {
        components.state = ctx.text;
        if (ctx.short_code) {
          components.stateCode = ctx.short_code.replace('US-', '');
        }
      } else if (ctx.id.startsWith('country')) {
        components.country = ctx.text;
        if (ctx.short_code) {
          components.countryCode = ctx.short_code.toUpperCase();
        }
      } else if (ctx.id.startsWith('postcode')) {
        components.postalCode = ctx.text;
      }
    }
  }

  return {
    address: feature.place_name,
    coordinates: {
      lat: feature.center[1]!,
      lng: feature.center[0]!,
    },
    components,
    placeType: feature.place_type[0] || 'unknown',
    attribution: data.attribution || 'Mapbox',
  };
};

// ============================================================================
// Format Currency Tool
// ============================================================================
const formatCurrencyInput = z.object({
  amount: z.number(),
  currency: z.string().length(3).default('USD'),
  locale: z.string().default('en-US'),
  minimumFractionDigits: z.number().min(0).max(4).optional(),
  maximumFractionDigits: z.number().min(0).max(4).optional(),
  notation: z.enum(['standard', 'compact', 'scientific', 'engineering']).default('standard'),
  showCurrencySymbol: z.boolean().default(true),
});

const formatCurrencyOutput = z.object({
  formatted: z.string(),
  amount: z.number(),
  currency: z.string(),
  locale: z.string(),
  parts: z.object({
    symbol: z.string().optional(),
    integer: z.string(),
    decimal: z.string().optional(),
    fraction: z.string().optional(),
  }),
});

type FormatCurrencyInput = z.infer<typeof formatCurrencyInput>;
type FormatCurrencyOutput = z.infer<typeof formatCurrencyOutput>;

const formatCurrencyDefinition: ToolDefinition<FormatCurrencyInput, FormatCurrencyOutput> = {
  id: 'utility.format_currency',
  name: 'Format Currency',
  description:
    'Format a numeric amount as a currency string with proper locale-specific formatting, symbols, and notation.',
  category: 'utility',
  requiredPermission: 'read',
  inputSchema: formatCurrencyInput,
  outputSchema: formatCurrencyOutput,
  requiresConfirmation: false,
  estimatedDuration: 50,
  rateLimit: 100,
  tags: ['utility', 'format', 'currency', 'money'],
};

// Handler disabled - tool not registered to stay under xAI 200 tool limit
const _formatCurrencyHandler: ToolHandler<FormatCurrencyInput, FormatCurrencyOutput> = async (
  input
) => {
  const {
    amount,
    currency,
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
    showCurrencySymbol,
  } = input;

  const options: Intl.NumberFormatOptions = {
    style: showCurrencySymbol ? 'currency' : 'decimal',
    currency: showCurrencySymbol ? currency : undefined,
    notation,
    minimumFractionDigits: minimumFractionDigits ?? (notation === 'compact' ? 0 : 2),
    maximumFractionDigits: maximumFractionDigits ?? (notation === 'compact' ? 1 : 2),
  };

  const formatter = new Intl.NumberFormat(locale, options);
  const formatted = formatter.format(amount);

  // Parse parts for detailed output
  const parts = formatter.formatToParts(amount);
  const partsObj: FormatCurrencyOutput['parts'] = {
    integer: '',
  };

  for (const part of parts) {
    switch (part.type) {
      case 'currency':
        partsObj.symbol = part.value;
        break;
      case 'integer':
        partsObj.integer += part.value;
        break;
      case 'group':
        partsObj.integer += part.value;
        break;
      case 'decimal':
        partsObj.decimal = part.value;
        break;
      case 'fraction':
        partsObj.fraction = part.value;
        break;
    }
  }

  return {
    formatted,
    amount,
    currency,
    locale,
    parts: partsObj,
  };
};
void _formatCurrencyHandler; // Suppress unused warning

// ============================================================================
// Calculate Distance Tool
// ============================================================================
const calculateDistanceInput = z.object({
  from: z.union([
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    z.string().min(1), // Address string
  ]),
  to: z.union([
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    z.string().min(1), // Address string
  ]),
  unit: z.enum(['miles', 'kilometers', 'meters', 'feet']).default('miles'),
});

const calculateDistanceOutput = z.object({
  distance: z.number(),
  unit: z.string(),
  from: z.object({
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
    address: z.string().optional(),
  }),
  to: z.object({
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
    address: z.string().optional(),
  }),
  formattedDistance: z.string(),
});

type CalculateDistanceInput = z.infer<typeof calculateDistanceInput>;
type CalculateDistanceOutput = z.infer<typeof calculateDistanceOutput>;

const calculateDistanceDefinition: ToolDefinition<CalculateDistanceInput, CalculateDistanceOutput> =
  {
    id: 'utility.calculate_distance',
    name: 'Calculate Distance',
    description:
      'Calculate the straight-line (Haversine) distance between two points. Accepts coordinates or addresses.',
    category: 'utility',
    requiredPermission: 'read',
    inputSchema: calculateDistanceInput,
    outputSchema: calculateDistanceOutput,
    requiresConfirmation: false,
    estimatedDuration: 2000,
    rateLimit: 30,
    tags: ['utility', 'distance', 'calculation', 'geo'],
  };

// Helper to geocode an address or return coordinates
async function resolveLocation(location: { lat: number; lng: number } | string): Promise<{
  coordinates: GeoPoint;
  address?: string;
}> {
  if (typeof location === 'object') {
    return { coordinates: location };
  }

  // Geocode the address
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured. Cannot geocode address.');
  }

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json`
  );
  url.searchParams.set('access_token', MAPBOX_TOKEN);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Geocoding failed for address: ${location}`);
  }

  const data = (await response.json()) as {
    features: Array<{
      place_name: string;
      center: [number, number];
    }>;
  };

  if (!data.features || data.features.length === 0) {
    throw new Error(`Address not found: ${location}`);
  }

  return {
    coordinates: {
      lat: data.features[0]!.center[1]!,
      lng: data.features[0]!.center[0]!,
    },
    address: data.features[0]!.place_name,
  };
}

// Handler disabled - tool not registered to stay under xAI 200 tool limit
const _calculateDistanceHandler: ToolHandler<
  CalculateDistanceInput,
  CalculateDistanceOutput
> = async (input) => {
  const { from, to, unit } = input;

  // Resolve both locations (geocode if needed)
  const [fromResolved, toResolved] = await Promise.all([
    resolveLocation(from),
    resolveLocation(to),
  ]);

  // Calculate distance in miles using Haversine formula
  const distanceMiles = calcDistanceUtil(fromResolved.coordinates, toResolved.coordinates);

  // Convert to requested unit
  const conversionFactors: Record<string, number> = {
    miles: 1,
    kilometers: 1.60934,
    meters: 1609.34,
    feet: 5280,
  };

  const distance = distanceMiles * (conversionFactors[unit] || 1);

  // Format distance string
  let formattedDistance: string;
  if (unit === 'meters' || unit === 'feet') {
    formattedDistance = `${Math.round(distance).toLocaleString()} ${unit}`;
  } else {
    formattedDistance = `${distance.toFixed(2)} ${unit}`;
  }

  return {
    distance: parseFloat(distance.toFixed(4)),
    unit,
    from: {
      coordinates: fromResolved.coordinates,
      address: typeof from === 'string' ? from : fromResolved.address,
    },
    to: {
      coordinates: toResolved.coordinates,
      address: typeof to === 'string' ? to : toResolved.address,
    },
    formattedDistance,
  };
};
void _calculateDistanceHandler; // Suppress unused warning

// ============================================================================
// Register All Utility Tools
// ============================================================================
export function registerUtilityTools() {
  toolRegistry.register(geocodeDefinition, geocodeHandler);
  toolRegistry.register(reverseGeocodeDefinition, reverseGeocodeHandler);
  // Disabled to stay under xAI 200 tool limit - these can be done in code
  // toolRegistry.register(formatCurrencyDefinition, formatCurrencyHandler);
  // toolRegistry.register(calculateDistanceDefinition, calculateDistanceHandler);
}

export const utilityTools = {
  geocode: geocodeDefinition,
  reverseGeocode: reverseGeocodeDefinition,
  formatCurrency: formatCurrencyDefinition,
  calculateDistance: calculateDistanceDefinition,
};
