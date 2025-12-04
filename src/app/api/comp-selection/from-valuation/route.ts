/**
 * Comp Selection from RentCast Valuation API Route
 * POST /api/comp-selection/from-valuation - Analyze comps from RentCast valuation
 *
 * This endpoint fetches a RentCast valuation for a property and enriches
 * the comparables with Census geocoding for micro-territory analysis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRentCastClient,
  getRentCastCache,
  getRateLimiter,
  getQuotaManager,
  RequestPriority,
  isRentCastApiError,
  type RentCastValuation,
} from '@/lib/rentcast';
import { analyzeComps } from '@/lib/comp-selection/service';
import { DEFAULT_COMP_CONFIG, RawComparable } from '@/types/comp-selection';

// ============================================
// Request Validation
// ============================================

const ScoringConfigSchema = z
  .object({
    weights: z
      .object({
        sameBlockGroup: z.number().min(0).max(1).optional(),
        sameTract: z.number().min(0).max(1).optional(),
        sameSubdivision: z.number().min(0).max(1).optional(),
        rentCastCorrelation: z.number().min(0).max(1).optional(),
        distance: z.number().min(0).max(1).optional(),
      })
      .optional(),
    thresholds: z
      .object({
        maxDistanceMiles: z.number().positive().optional(),
        minCorrelation: z.number().min(0).max(1).optional(),
        maxCompCount: z.number().int().positive().optional(),
      })
      .optional(),
  })
  .optional();

const FromValuationSchema = z.object({
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  subdivision: z.string().optional(),
  squareFootage: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  yearBuilt: z.number().int().min(1800).max(2100).optional(),
  config: ScoringConfigSchema,
  includePolygons: z.boolean().optional().default(true),
});

// ============================================
// POST - Analyze comps from RentCast valuation
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate request body
    const parsed = FromValuationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      address,
      latitude,
      longitude,
      subdivision,
      squareFootage,
      bedrooms,
      bathrooms,
      yearBuilt,
      config,
      includePolygons,
    } = parsed.data;

    // Check quota
    const quotaManager = getQuotaManager();
    const quotaCheck = await quotaManager.canMakeRequest();
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'Quota exceeded', message: quotaCheck.reason },
        { status: 429 }
      );
    }

    // Check cache for valuation
    const cache = getRentCastCache();
    const cacheKey = { address };
    const cachedValuation = (await cache.get('VALUATION', cacheKey)) as RentCastValuation | null;

    let valuation: RentCastValuation;
    let fromCache = false;

    if (cachedValuation) {
      valuation = cachedValuation;
      fromCache = true;
    } else {
      // Fetch valuation from RentCast with rate limiting
      const rateLimiter = getRateLimiter();
      const client = getRentCastClient();

      valuation = await rateLimiter.executeWithRateLimit(
        '/avm',
        () => client.getValuation(address),
        RequestPriority.NORMAL
      );

      // Cache the result
      await cache.set('VALUATION', cacheKey, valuation);
      await quotaManager.recordUsage('/avm/value');
    }

    // Extract comparables from valuation
    const rentCastComps = valuation.comparables || [];

    if (rentCastComps.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No comparables found in valuation',
          valuation: {
            price: valuation.price,
            priceRangeLow: valuation.priceRangeLow,
            priceRangeHigh: valuation.priceRangeHigh,
            confidence: valuation.confidence,
          },
          comps: [],
          summary: {
            totalCompsAnalyzed: 0,
            excellentCount: 0,
            goodCount: 0,
            acceptableCount: 0,
            marginalCount: 0,
          },
        },
        meta: {
          valuationCached: fromCache,
          durationMs: Date.now() - startTime,
        },
      });
    }

    // Transform RentCast comps to our format
    const rawComps: RawComparable[] = rentCastComps.map((comp, index) => ({
      id: comp.id || `comp-${index}`,
      formattedAddress: comp.formattedAddress,
      latitude: comp.latitude ?? 0,
      longitude: comp.longitude ?? 0,
      price: comp.price ?? 0,
      squareFootage: comp.squareFootage ?? undefined,
      bedrooms: comp.bedrooms ?? undefined,
      bathrooms: comp.bathrooms ?? undefined,
      distance: comp.distance ?? undefined,
      correlation: comp.correlation ?? undefined,
      saleDate: comp.saleDate ?? undefined,
    }));

    // Filter out comps without coordinates
    const compsWithCoords = rawComps.filter((comp) => comp.latitude !== 0 && comp.longitude !== 0);

    // Merge config with defaults
    const scoringConfig = {
      weights: {
        ...DEFAULT_COMP_CONFIG.weights,
        ...config?.weights,
      },
      thresholds: {
        ...DEFAULT_COMP_CONFIG.thresholds,
        ...config?.thresholds,
      },
    };

    // Build subject property
    // If lat/lng not provided, we need to geocode the address
    let subjectLat = latitude;
    let subjectLng = longitude;

    // If no coordinates provided, try to get from first comp's relative position
    // or use a default (this should be improved with address geocoding)
    if (!subjectLat || !subjectLng) {
      // For now, estimate from comps (center of all comps)
      if (compsWithCoords.length > 0) {
        subjectLat =
          compsWithCoords.reduce((sum, c) => sum + c.latitude, 0) / compsWithCoords.length;
        subjectLng =
          compsWithCoords.reduce((sum, c) => sum + c.longitude, 0) / compsWithCoords.length;
      } else {
        return NextResponse.json(
          {
            error: 'Cannot determine subject property location',
            details:
              'Provide latitude and longitude, or ensure valuation has comps with coordinates',
          },
          { status: 400 }
        );
      }
    }

    const subject = {
      id: crypto.randomUUID(),
      latitude: subjectLat,
      longitude: subjectLng,
      address,
      subdivision,
      squareFootage,
      bedrooms,
      bathrooms,
      yearBuilt,
    };

    // Run comp analysis with Census geocoding
    const analysis = await analyzeComps(subject, compsWithCoords, {
      config: scoringConfig,
      includePolygons,
    });

    return NextResponse.json({
      success: true,
      data: {
        analysisId: analysis.id,
        subject: analysis.subjectProperty,
        valuation: {
          price: valuation.price,
          priceRangeLow: valuation.priceRangeLow,
          priceRangeHigh: valuation.priceRangeHigh,
          pricePerSquareFoot: valuation.pricePerSquareFoot,
          confidence: valuation.confidence,
        },
        comps: analysis.scoredComps,
        summary: {
          ...analysis.summary,
          rentCastARV: valuation.price,
          weightedARV: analysis.summary.estimatedARV,
        },
        config: analysis.scoringConfig,
        analysisDate: analysis.analysisDate.toISOString(),
        ...(includePolygons && {
          boundaries: {
            blockGroup: analysis.subjectBlockGroupPolygon || null,
            tract: analysis.subjectTractPolygon || null,
          },
        }),
      },
      meta: {
        valuationCached: fromCache,
        totalCompsFromRentCast: rentCastComps.length,
        compsWithCoordinates: compsWithCoords.length,
        durationMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    console.error('Comp analysis from valuation error:', error);

    if (isRentCastApiError(error)) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to analyze comparables from valuation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Get endpoint info
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'comp-selection/from-valuation',
    version: '1.0',
    description: 'Analyze RentCast valuation comparables with Census micro-territory matching',
    endpoints: {
      'POST /api/comp-selection/from-valuation': {
        description: 'Fetch RentCast valuation and analyze comps with Census geocoding',
        body: {
          address: 'string (required) - Full property address for RentCast AVM',
          latitude: 'number (optional) - Subject property latitude',
          longitude: 'number (optional) - Subject property longitude',
          subdivision: 'string (optional) - Subdivision name for matching',
          squareFootage: 'number (optional) - Subject property square footage',
          bedrooms: 'number (optional) - Subject property bedrooms',
          bathrooms: 'number (optional) - Subject property bathrooms',
          yearBuilt: 'number (optional) - Subject property year built',
          config: {
            weights: 'scoring weights (see /api/comp-selection/analyze)',
            thresholds: 'scoring thresholds (see /api/comp-selection/analyze)',
          },
          includePolygons: 'boolean (default: true) - Include Census boundary polygons',
        },
        response: {
          subject: 'Subject property with Census geography',
          valuation: 'RentCast AVM result',
          comps: 'Array of scored comparables with Census geography',
          summary: 'Analysis summary with tier counts and ARV estimates',
          boundaries: 'GeoJSON polygons for block group and tract (if includePolygons)',
        },
      },
    },
    defaultConfig: DEFAULT_COMP_CONFIG,
  });
}
