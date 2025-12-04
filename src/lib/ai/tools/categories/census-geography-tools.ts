/**
 * Census Geography Tools
 * AI tools for Census geographic data retrieval and comp classification
 * Uses Census Bureau Geocoder API and TIGERweb REST API
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { getCensusGeography, batchCensusGeocode } from '@/lib/census/geocoder';
import { getCensusBoundary, getCensusBoundaryByPoint } from '@/lib/census/tigerweb';
import { classifyComp, normalizeSubdivision } from '@/lib/comp-selection/scoring';
import type { GeographyType, CensusBoundaryFeature } from '@/types/comp-selection';

// ============================================================================
// Tool 1: Get Census Geography
// ============================================================================

const getCensusGeographyInput = z.object({
  latitude: z.number().min(-90).max(90).describe('Property latitude in decimal degrees'),
  longitude: z.number().min(-180).max(180).describe('Property longitude in decimal degrees'),
});

const getCensusGeographyOutput = z.object({
  block_group_geoid: z.string().describe('12-digit Census Block Group identifier'),
  tract_geoid: z.string().describe('11-digit Census Tract identifier'),
  county_fips: z.string().describe('5-digit State+County FIPS code'),
  state_fips: z.string().describe('2-digit State FIPS code'),
  block_group_name: z.string().describe('Human-readable block group name'),
  tract_name: z.string().describe('Human-readable tract name'),
});

type GetCensusGeographyInput = z.infer<typeof getCensusGeographyInput>;
type GetCensusGeographyOutput = z.infer<typeof getCensusGeographyOutput>;

const getCensusGeographyDefinition: ToolDefinition<
  GetCensusGeographyInput,
  GetCensusGeographyOutput
> = {
  id: 'census.get_geography',
  name: 'Get Census Geography',
  description:
    "Retrieve Census geographic identifiers (Block Group, Tract, County, State) for a property based on coordinates. Use this when you need to identify a property's micro-territory, understand neighborhood boundaries, or before fetching boundary polygons for map display. Block Groups are the smallest Census unit - they contain 600-3,000 people and are bounded by major features like highways, rivers, and railroads.",
  category: 'map',
  requiredPermission: 'read',
  inputSchema: getCensusGeographyInput,
  outputSchema: getCensusGeographyOutput,
  requiresConfirmation: false,
  estimatedDuration: 400,
  rateLimit: 30,
  tags: ['census', 'geography', 'geocode', 'block_group', 'tract', 'micro-territory'],
};

const getCensusGeographyHandler: ToolHandler<
  GetCensusGeographyInput,
  GetCensusGeographyOutput
> = async (input) => {
  const { latitude, longitude } = input;

  const geography = await getCensusGeography(latitude, longitude);

  if (!geography) {
    throw new Error(
      'No Census geography found for coordinates. The location may be outside the US, in water, or in an area without Census data.'
    );
  }

  return {
    block_group_geoid: geography.blockGroupGeoid,
    tract_geoid: geography.tractGeoid,
    county_fips: geography.countyFips,
    state_fips: geography.stateFips,
    block_group_name: geography.blockGroupName,
    tract_name: geography.tractName,
  };
};

// ============================================================================
// Tool 2: Get Census Boundary Polygon
// ============================================================================

const getCensusBoundaryPolygonInput = z.object({
  geoid: z.string().describe('Census GEOID (12 digits for block group, 11 for tract)'),
  geography_type: z
    .enum(['block_group', 'tract'])
    .default('block_group')
    .describe('Type of Census geography'),
});

const getCensusBoundaryPolygonOutput = z.object({
  geoid: z.string().describe('The GEOID that was queried'),
  name: z.string().describe('Human-readable name'),
  geometry: z
    .object({
      type: z.enum(['Polygon', 'MultiPolygon']),
      coordinates: z.array(z.any()).describe('GeoJSON coordinate rings'),
    })
    .describe('GeoJSON Polygon or MultiPolygon geometry'),
  bbox: z
    .array(z.number())
    .length(4)
    .describe('Bounding box [minLng, minLat, maxLng, maxLat]')
    .optional(),
  area_sq_miles: z.number().describe('Area in square miles').optional(),
});

type GetCensusBoundaryPolygonInput = z.infer<typeof getCensusBoundaryPolygonInput>;
type GetCensusBoundaryPolygonOutput = z.infer<typeof getCensusBoundaryPolygonOutput>;

const getCensusBoundaryPolygonDefinition: ToolDefinition<
  GetCensusBoundaryPolygonInput,
  GetCensusBoundaryPolygonOutput
> = {
  id: 'census.get_boundary_polygon',
  name: 'Get Census Boundary Polygon',
  description:
    'Retrieve the GeoJSON polygon boundary for a Census geography to display on a map. Requires a GEOID from get_census_geography. Use this when the user asks to "show the area on a map", "highlight the neighborhood boundary", or wants to visualize where comps are relative to the subject property.',
  category: 'map',
  requiredPermission: 'read',
  inputSchema: getCensusBoundaryPolygonInput,
  outputSchema: getCensusBoundaryPolygonOutput,
  requiresConfirmation: false,
  estimatedDuration: 500,
  rateLimit: 20,
  tags: ['census', 'boundary', 'polygon', 'geojson', 'map', 'visualization'],
};

const getCensusBoundaryPolygonHandler: ToolHandler<
  GetCensusBoundaryPolygonInput,
  GetCensusBoundaryPolygonOutput
> = async (input) => {
  const { geoid, geography_type } = input;

  const type: GeographyType = geography_type === 'tract' ? 'tract' : 'blockGroup';
  const boundary = await getCensusBoundary(geoid, type);

  if (!boundary) {
    throw new Error(`No boundary found for GEOID: ${geoid}`);
  }

  // Calculate bounding box
  const bbox = calculateBbox(boundary);

  // Calculate area in square miles (AREALAND is in square meters)
  const areaSqMiles = boundary.properties.AREALAND
    ? boundary.properties.AREALAND / 2589988.11
    : undefined;

  return {
    geoid: boundary.properties.GEOID,
    name: boundary.properties.NAME,
    geometry: {
      type: boundary.geometry.type,
      coordinates: boundary.geometry.coordinates,
    },
    bbox,
    area_sq_miles: areaSqMiles ? parseFloat(areaSqMiles.toFixed(3)) : undefined,
  };
};

// ============================================================================
// Tool 3: Classify Comp Geography
// ============================================================================

const classifyCompGeographyInput = z.object({
  subject_block_group_geoid: z.string().describe("Subject property's block group GEOID"),
  subject_tract_geoid: z.string().describe("Subject property's tract GEOID"),
  subject_subdivision: z
    .string()
    .optional()
    .describe("Subject property's subdivision name (if available)"),
  comp_block_group_geoid: z.string().describe("Comp property's block group GEOID"),
  comp_tract_geoid: z.string().describe("Comp property's tract GEOID"),
  comp_subdivision: z
    .string()
    .optional()
    .describe("Comp property's subdivision name (if available)"),
});

const classifyCompGeographyOutput = z.object({
  tier: z.enum(['excellent', 'good', 'acceptable', 'marginal']).describe('Geographic quality tier'),
  same_block_group: z.boolean().describe('Whether comp is in same block group as subject'),
  same_tract: z.boolean().describe('Whether comp is in same tract as subject'),
  same_subdivision: z.boolean().describe('Whether comp is in same subdivision as subject'),
  explanation: z.string().describe('Human-readable explanation of the classification'),
});

type ClassifyCompGeographyInput = z.infer<typeof classifyCompGeographyInput>;
type ClassifyCompGeographyOutput = z.infer<typeof classifyCompGeographyOutput>;

const classifyCompGeographyDefinition: ToolDefinition<
  ClassifyCompGeographyInput,
  ClassifyCompGeographyOutput
> = {
  id: 'census.classify_comp_geography',
  name: 'Classify Comp Geography',
  description:
    'Determine the geographic relationship between a subject property and a comparable property. Returns a tier (excellent/good/acceptable/marginal) and explanation. Use this when the user asks "is this comp in the same neighborhood?", "how close is this comp geographically?", or "why is this comp rated good/excellent/marginal?"',
  category: 'map',
  requiredPermission: 'read',
  inputSchema: classifyCompGeographyInput,
  outputSchema: classifyCompGeographyOutput,
  requiresConfirmation: false,
  estimatedDuration: 10,
  rateLimit: 100,
  tags: ['census', 'comp', 'classification', 'geography', 'tier'],
};

const classifyCompGeographyHandler: ToolHandler<
  ClassifyCompGeographyInput,
  ClassifyCompGeographyOutput
> = async (input) => {
  const {
    subject_block_group_geoid,
    subject_tract_geoid,
    subject_subdivision,
    comp_block_group_geoid,
    comp_tract_geoid,
    comp_subdivision,
  } = input;

  const sameBlockGroup = subject_block_group_geoid === comp_block_group_geoid;
  const sameTract = subject_tract_geoid === comp_tract_geoid;

  // Normalize subdivision names for comparison
  const sameSubdivision =
    subject_subdivision &&
    comp_subdivision &&
    normalizeSubdivision(subject_subdivision) === normalizeSubdivision(comp_subdivision);

  // Use the scoring module's classification logic
  const subject = {
    id: 'subject',
    latitude: 0,
    longitude: 0,
    address: '',
    blockGroupGeoid: subject_block_group_geoid,
    tractGeoid: subject_tract_geoid,
    subdivision: subject_subdivision,
  };

  const comp = {
    id: 'comp',
    formattedAddress: '',
    latitude: 0,
    longitude: 0,
    price: 0,
    blockGroupGeoid: comp_block_group_geoid,
    tractGeoid: comp_tract_geoid,
    subdivision: comp_subdivision,
  };

  const tier = classifyComp(subject, comp);

  // Generate human-readable explanation
  let explanation: string;
  if (sameBlockGroup && sameSubdivision) {
    explanation =
      'Comp is in the same Census block group AND same subdivision - highest geographic confidence. These properties share the same micro-territory and neighborhood characteristics.';
  } else if (sameBlockGroup) {
    explanation =
      'Comp is in the same Census block group - same micro-territory with shared boundaries. Block groups are drawn along natural barriers like highways and rivers, so properties within the same block group typically have similar market characteristics.';
  } else if (sameTract && sameSubdivision) {
    explanation =
      'Comp is in the same Census tract and subdivision - nearby with similar neighborhood characteristics. While not in the exact same micro-territory, the shared subdivision name indicates a cohesive neighborhood.';
  } else if (sameTract) {
    explanation =
      'Comp is in the same Census tract but different block group - reasonably comparable area. The properties may be separated by a physical barrier like a major road, but are in the broader neighborhood.';
  } else {
    explanation =
      'Comp is in a different Census tract - may have different neighborhood characteristics. Consider carefully whether market conditions, school districts, and amenities are comparable.';
  }

  return {
    tier,
    same_block_group: sameBlockGroup,
    same_tract: sameTract,
    same_subdivision: sameSubdivision || false,
    explanation,
  };
};

// ============================================================================
// Tool 4: Batch Geocode Comps
// ============================================================================

const batchGeocodeCompsInput = z.object({
  properties: z
    .array(
      z.object({
        id: z.string().describe('Unique identifier for the property'),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
    )
    .max(25)
    .describe('Array of properties to geocode (max 25)'),
});

const batchGeocodeCompsOutput = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      block_group_geoid: z.string().optional(),
      tract_geoid: z.string().optional(),
      success: z.boolean(),
      error: z.string().optional(),
    })
  ),
  success_count: z.number(),
  failure_count: z.number(),
});

type BatchGeocodeCompsInput = z.infer<typeof batchGeocodeCompsInput>;
type BatchGeocodeCompsOutput = z.infer<typeof batchGeocodeCompsOutput>;

const batchGeocodeCompsDefinition: ToolDefinition<BatchGeocodeCompsInput, BatchGeocodeCompsOutput> =
  {
    id: 'census.batch_geocode_comps',
    name: 'Batch Geocode Comps',
    description:
      'Geocode multiple comparable properties to their Census geographies in a single operation. Use this when analyzing multiple comps, after receiving comps from RentCast valuation API, or when the user asks to "analyze all the comps for this property". Processes up to 25 properties in parallel.',
    category: 'map',
    requiredPermission: 'read',
    inputSchema: batchGeocodeCompsInput,
    outputSchema: batchGeocodeCompsOutput,
    requiresConfirmation: false,
    estimatedDuration: 2000,
    rateLimit: 10,
    tags: ['census', 'batch', 'geocode', 'comps', 'bulk'],
  };

const batchGeocodeCompsHandler: ToolHandler<
  BatchGeocodeCompsInput,
  BatchGeocodeCompsOutput
> = async (input) => {
  const { properties } = input;

  if (properties.length === 0) {
    return {
      results: [],
      success_count: 0,
      failure_count: 0,
    };
  }

  // Transform to batch geocode format
  const coordinates = properties.map((p) => ({
    id: p.id,
    lat: p.latitude,
    lng: p.longitude,
  }));

  const { results: geoResults, errors } = await batchCensusGeocode(coordinates);

  // Build results array
  const results = properties.map((p) => {
    const geo = geoResults.get(p.id);
    const error = errors.find((e) => e.id === p.id);

    if (geo) {
      return {
        id: p.id,
        block_group_geoid: geo.blockGroupGeoid,
        tract_geoid: geo.tractGeoid,
        success: true,
      };
    }

    return {
      id: p.id,
      success: false,
      error: error?.error || 'Unknown error',
    };
  });

  const successCount = results.filter((r) => r.success).length;

  return {
    results,
    success_count: successCount,
    failure_count: results.length - successCount,
  };
};

// ============================================================================
// Tool 5: Get Census Boundary by Point
// ============================================================================

const getCensusBoundaryByPointInput = z.object({
  latitude: z.number().min(-90).max(90).describe('Property latitude'),
  longitude: z.number().min(-180).max(180).describe('Property longitude'),
  geography_type: z
    .enum(['block_group', 'tract', 'both'])
    .default('both')
    .describe('Type of boundary to fetch'),
});

const getCensusBoundaryByPointOutput = z.object({
  block_group: z
    .object({
      geoid: z.string(),
      name: z.string(),
      geometry: z.object({
        type: z.enum(['Polygon', 'MultiPolygon']),
        coordinates: z.array(z.any()),
      }),
    })
    .optional(),
  tract: z
    .object({
      geoid: z.string(),
      name: z.string(),
      geometry: z.object({
        type: z.enum(['Polygon', 'MultiPolygon']),
        coordinates: z.array(z.any()),
      }),
    })
    .optional(),
});

type GetCensusBoundaryByPointInput = z.infer<typeof getCensusBoundaryByPointInput>;
type GetCensusBoundaryByPointOutput = z.infer<typeof getCensusBoundaryByPointOutput>;

const getCensusBoundaryByPointDefinition: ToolDefinition<
  GetCensusBoundaryByPointInput,
  GetCensusBoundaryByPointOutput
> = {
  id: 'census.get_boundary_by_point',
  name: 'Get Census Boundary by Point',
  description:
    'Retrieve Census boundary polygon(s) that contain a specific point. This is a convenience tool that combines geocoding and boundary retrieval in one step. Use when you have coordinates and want to immediately visualize the surrounding Census geography.',
  category: 'map',
  requiredPermission: 'read',
  inputSchema: getCensusBoundaryByPointInput,
  outputSchema: getCensusBoundaryByPointOutput,
  requiresConfirmation: false,
  estimatedDuration: 800,
  rateLimit: 15,
  tags: ['census', 'boundary', 'point', 'map', 'visualization'],
};

const getCensusBoundaryByPointHandler: ToolHandler<
  GetCensusBoundaryByPointInput,
  GetCensusBoundaryByPointOutput
> = async (input) => {
  const { latitude, longitude, geography_type } = input;

  const result: GetCensusBoundaryByPointOutput = {};

  if (geography_type === 'block_group' || geography_type === 'both') {
    const blockGroup = await getCensusBoundaryByPoint(latitude, longitude, 'blockGroup');
    if (blockGroup) {
      result.block_group = {
        geoid: blockGroup.properties.GEOID,
        name: blockGroup.properties.NAME,
        geometry: {
          type: blockGroup.geometry.type,
          coordinates: blockGroup.geometry.coordinates,
        },
      };
    }
  }

  if (geography_type === 'tract' || geography_type === 'both') {
    const tract = await getCensusBoundaryByPoint(latitude, longitude, 'tract');
    if (tract) {
      result.tract = {
        geoid: tract.properties.GEOID,
        name: tract.properties.NAME,
        geometry: {
          type: tract.geometry.type,
          coordinates: tract.geometry.coordinates,
        },
      };
    }
  }

  return result;
};

// ============================================================================
// Helper Functions
// ============================================================================

function calculateBbox(
  feature: CensusBoundaryFeature
): [number, number, number, number] | undefined {
  const geometry = feature.geometry;
  if (!geometry || !geometry.coordinates) return undefined;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  function processRing(ring: number[][]) {
    for (const coord of ring) {
      const lng = coord[0];
      const lat = coord[1];
      if (lng !== undefined && lat !== undefined) {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      }
    }
  }

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates as number[][][]) {
      processRing(ring);
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates as number[][][][]) {
      for (const ring of polygon) {
        processRing(ring);
      }
    }
  }

  if (minLng === Infinity) return undefined;

  return [minLng, minLat, maxLng, maxLat];
}

// ============================================================================
// Register All Census Geography Tools
// ============================================================================

export function registerCensusGeographyTools() {
  toolRegistry.register(getCensusGeographyDefinition, getCensusGeographyHandler);
  toolRegistry.register(getCensusBoundaryPolygonDefinition, getCensusBoundaryPolygonHandler);
  toolRegistry.register(classifyCompGeographyDefinition, classifyCompGeographyHandler);
  toolRegistry.register(batchGeocodeCompsDefinition, batchGeocodeCompsHandler);
  toolRegistry.register(getCensusBoundaryByPointDefinition, getCensusBoundaryByPointHandler);
}

export const censusGeographyTools = {
  getCensusGeography: getCensusGeographyDefinition,
  getCensusBoundaryPolygon: getCensusBoundaryPolygonDefinition,
  classifyCompGeography: classifyCompGeographyDefinition,
  batchGeocodeComps: batchGeocodeCompsDefinition,
  getCensusBoundaryByPoint: getCensusBoundaryByPointDefinition,
};
