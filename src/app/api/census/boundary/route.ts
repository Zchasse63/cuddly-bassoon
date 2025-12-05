/**
 * Census Boundary API Route
 * GET /api/census/boundary - Get Census boundary polygon by GEOID or coordinates
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getCensusBoundary,
  getCensusBoundaryByPoint,
  getSubjectBoundaries,
  getBoundariesByPoint,
} from '@/lib/census/tigerweb';
import type { GeographyType } from '@/types/comp-selection';

// ============================================
// Request Validation
// ============================================

const GeoidQuerySchema = z.object({
  geoid: z.string().min(1),
  type: z.enum(['blockGroup', 'tract']),
});

const PointQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  type: z.enum(['blockGroup', 'tract', 'both']).default('both'),
});

const SubjectBoundariesSchema = z.object({
  blockGroupGeoid: z.string().min(11).max(12),
  tractGeoid: z.string().min(10).max(11),
});

// ============================================
// GET - Get boundary polygon(s)
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if fetching by GEOID
    const geoid = searchParams.get('geoid');
    if (geoid) {
      const typeParam = searchParams.get('type') || 'blockGroup';

      const parsed = GeoidQuerySchema.safeParse({ geoid, type: typeParam });
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Invalid parameters',
            details: parsed.error.issues,
          },
          { status: 400 }
        );
      }

      const boundary = await getCensusBoundary(
        parsed.data.geoid,
        parsed.data.type as GeographyType
      );

      if (!boundary) {
        return NextResponse.json(
          {
            error: 'Boundary not found',
            details: `No ${parsed.data.type} boundary found for GEOID: ${parsed.data.geoid}`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: boundary,
      });
    }

    // Check if fetching by coordinates
    const latParam = searchParams.get('latitude') || searchParams.get('lat');
    const lngParam = searchParams.get('longitude') || searchParams.get('lng');

    if (latParam && lngParam) {
      const typeParam = searchParams.get('type') || 'both';

      const parsed = PointQuerySchema.safeParse({
        latitude: latParam,
        longitude: lngParam,
        type: typeParam,
      });

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Invalid parameters',
            details: parsed.error.issues,
          },
          { status: 400 }
        );
      }

      const { latitude, longitude, type } = parsed.data;

      // Fetch boundaries based on type
      if (type === 'both') {
        const boundaries = await getBoundariesByPoint(latitude, longitude);
        return NextResponse.json({
          success: true,
          data: {
            blockGroup: boundaries.blockGroup,
            tract: boundaries.tract,
          },
        });
      }

      const boundary = await getCensusBoundaryByPoint(latitude, longitude, type as GeographyType);

      if (!boundary) {
        return NextResponse.json(
          {
            error: 'Boundary not found',
            details: `No ${type} boundary found for coordinates: ${latitude}, ${longitude}`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: boundary,
      });
    }

    // Check if fetching subject boundaries by GEOIDs
    const blockGroupGeoid = searchParams.get('blockGroupGeoid');
    const tractGeoid = searchParams.get('tractGeoid');

    if (blockGroupGeoid && tractGeoid) {
      const parsed = SubjectBoundariesSchema.safeParse({
        blockGroupGeoid,
        tractGeoid,
      });

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Invalid parameters',
            details: parsed.error.issues,
          },
          { status: 400 }
        );
      }

      const boundaries = await getSubjectBoundaries(
        parsed.data.blockGroupGeoid,
        parsed.data.tractGeoid
      );

      return NextResponse.json({
        success: true,
        data: {
          blockGroup: boundaries.blockGroup,
          tract: boundaries.tract,
        },
      });
    }

    // No valid query parameters
    return NextResponse.json(
      {
        error: 'Missing required parameters',
        details:
          'Provide either: (1) geoid + type, (2) latitude + longitude [+ type], or (3) blockGroupGeoid + tractGeoid',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Census boundary error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch boundary',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
