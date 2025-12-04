/**
 * Comp Selection Analysis API Route
 * POST /api/comp-selection/analyze - Analyze comparables for a subject property
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeComps } from '@/lib/comp-selection/service';
import { DEFAULT_COMP_CONFIG } from '@/types/comp-selection';

// ============================================
// Request Validation
// ============================================

const CompSchema = z.object({
  id: z.string(),
  formattedAddress: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  price: z.number().positive(),
  squareFootage: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  correlation: z.number().min(0).max(1).optional(),
  saleDate: z.string().optional(),
  subdivision: z.string().optional(),
});

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

const AnalyzeCompsSchema = z.object({
  subject: z.object({
    id: z.string().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string(),
    subdivision: z.string().optional(),
    squareFootage: z.number().positive().optional(),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    yearBuilt: z.number().int().min(1800).max(2100).optional(),
    blockGroupGeoid: z.string().optional(),
    tractGeoid: z.string().optional(),
  }),
  comps: z.array(CompSchema).min(1).max(50),
  config: ScoringConfigSchema,
  includePolygons: z.boolean().optional().default(false),
  skipGeocoding: z.boolean().optional().default(false),
});

// ============================================
// POST - Analyze comparables
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = AnalyzeCompsSchema.safeParse(body);
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

    const { subject, comps, config, includePolygons, skipGeocoding } = parsed.data;

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

    // Run analysis
    const analysis = await analyzeComps(subject, comps, {
      config: scoringConfig,
      includePolygons,
      skipGeocoding,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: analysis.id,
        subject: analysis.subjectProperty,
        comps: analysis.scoredComps,
        summary: analysis.summary,
        config: analysis.scoringConfig,
        analysisDate: analysis.analysisDate.toISOString(),
        ...(includePolygons && {
          boundaries: {
            blockGroup: analysis.subjectBlockGroupPolygon || null,
            tract: analysis.subjectTractPolygon || null,
          },
        }),
      },
    });
  } catch (error) {
    console.error('Comp analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze comparables',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Get analysis status/info
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'comp-selection/analyze',
    version: '1.0',
    description: 'Micro-territory comparable property analysis using Census Block Groups',
    endpoints: {
      'POST /api/comp-selection/analyze': {
        description: 'Analyze comparables for a subject property',
        body: {
          subject: {
            latitude: 'number (required)',
            longitude: 'number (required)',
            address: 'string (required)',
            subdivision: 'string (optional)',
            blockGroupGeoid: 'string (optional, skips geocoding if provided)',
            tractGeoid: 'string (optional)',
          },
          comps: 'array of comparable properties (required)',
          config: {
            weights: {
              sameBlockGroup: 'number 0-1 (default: 0.30)',
              sameTract: 'number 0-1 (default: 0.15)',
              sameSubdivision: 'number 0-1 (default: 0.25)',
              rentCastCorrelation: 'number 0-1 (default: 0.20)',
              distance: 'number 0-1 (default: 0.10)',
            },
            thresholds: {
              maxDistanceMiles: 'number (default: 3)',
              minCorrelation: 'number 0-1 (default: 0.6)',
              maxCompCount: 'number (default: 10)',
            },
          },
          includePolygons: 'boolean (default: false)',
          skipGeocoding: 'boolean (default: false)',
        },
      },
    },
    defaultConfig: DEFAULT_COMP_CONFIG,
  });
}
