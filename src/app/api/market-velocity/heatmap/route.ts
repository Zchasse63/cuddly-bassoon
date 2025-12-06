/**
 * Market Velocity API - Heat Map Data
 * GET /api/market-velocity/heatmap?north=...&south=...&east=...&west=...&zoom=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getVelocityForBounds } from '@/lib/velocity';
import type { VelocityHeatMapResponse } from '@/types/velocity';

// Validate query parameters
const HeatMapParamsSchema = z.object({
  north: z.coerce.number().min(-90).max(90),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  west: z.coerce.number().min(-180).max(180),
  zoom: z.coerce.number().min(1).max(20).default(10),
});

/**
 * Get the appropriate granularity based on zoom level
 */
function getGranularityForZoom(zoom: number): 'state' | 'metro' | 'county' | 'city' | 'zip' {
  if (zoom < 6) return 'state';
  if (zoom < 8) return 'metro';
  if (zoom < 10) return 'county';
  if (zoom < 12) return 'city';
  return 'zip';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate parameters
    const rawParams = {
      north: searchParams.get('north'),
      south: searchParams.get('south'),
      east: searchParams.get('east'),
      west: searchParams.get('west'),
      zoom: searchParams.get('zoom') || '10',
    };

    const validation = HeatMapParamsSchema.safeParse(rawParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { north, south, east, west, zoom } = validation.data;

    console.log(
      `[Market Velocity API] Fetching heatmap data for bounds: N${north}, S${south}, E${east}, W${west}, zoom=${zoom}`
    );

    // Determine granularity based on zoom
    const granularity = getGranularityForZoom(zoom);

    // Get velocity data for bounds
    const velocities = await getVelocityForBounds({ north, south, east, west });

    // Transform to heat map response format
    const dataPoints = velocities.map((v) => ({
      zipCode: v.zipCode,
      velocityIndex: v.velocityIndex,
      classification: v.classification,
      centerLat: v.centerLat!,
      centerLng: v.centerLng!,
    }));

    const response: VelocityHeatMapResponse = {
      granularity,
      bounds: { north, south, east, west },
      dataPoints,
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        count: dataPoints.length,
        granularity,
      },
    });
  } catch (error) {
    console.error('[Market Velocity API] Heatmap error:', error);

    return NextResponse.json({ error: 'Failed to get heat map data' }, { status: 500 });
  }
}
