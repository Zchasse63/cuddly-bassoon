/**
 * Market Velocity API - Get velocity for a geographic area
 * GET /api/market-velocity/area?type=city&name=Tampa&state=FL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getVelocityForLocation } from '@/lib/velocity';

// Validate query parameters
const AreaParamsSchema = z.object({
  type: z.enum(['city', 'county', 'metro', 'state']),
  name: z.string().min(1),
  state: z.string().length(2),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate parameters
    const rawParams = {
      type: searchParams.get('type'),
      name: searchParams.get('name'),
      state: searchParams.get('state'),
    };

    const validation = AreaParamsSchema.safeParse(rawParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters. Required: type, name, state',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { type, name, state } = validation.data;

    console.log(`[Market Velocity API] Getting velocity for ${type}: ${name}, ${state}`);

    // Get velocity based on type
    const params: Record<string, string> = { state };
    if (type === 'city') {
      params.city = name;
    } else if (type === 'county') {
      params.county = name;
    }

    const velocity = await getVelocityForLocation(params);

    return NextResponse.json({
      success: true,
      data: {
        geoType: type,
        geoName: name,
        state,
        velocity,
      },
      meta: {
        cachedAt: velocity.calculatedAt,
      },
    });
  } catch (error) {
    console.error('[Market Velocity API] Area error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Could not find')) {
        return NextResponse.json(
          {
            error: 'Could not find velocity data for the specified area',
            message: error.message,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to get area velocity data' },
      { status: 500 }
    );
  }
}
