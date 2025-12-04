/**
 * Market Velocity API - Get velocity for a specific zip code
 * GET /api/market-velocity/:zipCode
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getVelocityForZipCode } from '@/lib/velocity';

// Validate zip code parameter
const ZipCodeSchema = z.string().regex(/^\d{5}$/, 'Invalid zip code format');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ zipCode: string }> }
) {
  try {
    const { zipCode } = await params;

    // Validate zip code
    const validation = ZipCodeSchema.safeParse(zipCode);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid zip code format. Must be 5 digits.' },
        { status: 400 }
      );
    }

    console.log(`[Market Velocity API] Getting velocity for zip code: ${zipCode}`);

    // Get velocity (from cache or calculate fresh)
    const velocity = await getVelocityForZipCode(zipCode);

    return NextResponse.json({
      success: true,
      data: velocity,
      meta: {
        cachedAt: velocity.calculatedAt,
        freshness: velocity.dataFreshness,
      },
    });
  } catch (error) {
    console.error('[Market Velocity API] Error:', error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json(
          { error: 'Market data not found for this zip code' },
          { status: 404 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to get market velocity data' },
      { status: 500 }
    );
  }
}
