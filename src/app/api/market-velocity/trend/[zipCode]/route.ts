/**
 * Market Velocity API - Get velocity trend for a specific zip code
 * GET /api/market-velocity/trend/:zipCode?timeframe=90d
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getVelocityTrend } from '@/lib/velocity';

// Validate zip code parameter
const ZipCodeSchema = z.string().regex(/^\d{5}$/, 'Invalid zip code format');

// Validate query parameters
const TrendParamsSchema = z.object({
  timeframe: z.enum(['30d', '90d', '6m', '1y']).default('90d'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zipCode: string }> }
) {
  try {
    const { zipCode } = await params;
    const { searchParams } = new URL(request.url);

    // Validate zip code
    const zipValidation = ZipCodeSchema.safeParse(zipCode);
    if (!zipValidation.success) {
      return NextResponse.json(
        { error: 'Invalid zip code format. Must be 5 digits.' },
        { status: 400 }
      );
    }

    // Validate timeframe
    const timeframeValidation = TrendParamsSchema.safeParse({
      timeframe: searchParams.get('timeframe') || '90d',
    });

    if (!timeframeValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid timeframe. Must be 30d, 90d, 6m, or 1y.',
          details: timeframeValidation.error.issues,
        },
        { status: 400 }
      );
    }

    const { timeframe } = timeframeValidation.data;

    console.log(`[Market Velocity API] Getting ${timeframe} trend for zip code: ${zipCode}`);

    // Get velocity trend
    const trend = await getVelocityTrend(zipCode, timeframe);

    return NextResponse.json({
      success: true,
      data: trend,
      meta: {
        timeframe,
        dataPoints: trend.history.length,
      },
    });
  } catch (error) {
    console.error('[Market Velocity API] Trend error:', error);

    if (
      error instanceof Error &&
      (error.message.includes('not found') || error.message.includes('404'))
    ) {
      return NextResponse.json(
        { error: 'Market data not found for this zip code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: 'Failed to get velocity trend data' }, { status: 500 });
  }
}
