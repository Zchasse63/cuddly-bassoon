/**
 * Market Velocity API - Rankings
 * GET /api/market-velocity/rankings?type=top&limit=20&state=FL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findHotMarkets, findColdMarkets } from '@/lib/velocity';
import type { VelocityRankingsResponse } from '@/types/velocity';

// Validate query parameters
const RankingsParamsSchema = z.object({
  type: z.enum(['top', 'bottom']).default('top'),
  limit: z.coerce.number().min(1).max(100).default(20),
  state: z.string().length(2).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate parameters
    const rawParams = {
      type: searchParams.get('type') || 'top',
      limit: searchParams.get('limit') || '20',
      state: searchParams.get('state') || undefined,
    };

    const validation = RankingsParamsSchema.safeParse(rawParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { type, limit, state } = validation.data;

    console.log(
      `[Market Velocity API] Getting ${type} ${limit} markets${state ? ` in ${state}` : ''}`
    );

    // Get rankings based on type
    const markets =
      type === 'top'
        ? await findHotMarkets({ state, limit })
        : await findColdMarkets({ state, limit });

    // Transform to rankings response
    const rankings = markets.map((market, index) => ({
      rank: index + 1,
      zipCode: market.zipCode,
      city: market.city,
      state: market.state,
      velocityIndex: market.velocityIndex,
      classification: market.classification,
      avgDaysOnMarket: market.avgDaysOnMarket,
      monthsOfInventory: market.monthsOfInventory,
    }));

    const response: VelocityRankingsResponse = {
      rankings,
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        type,
        count: rankings.length,
        state: state || 'all',
      },
    });
  } catch (error) {
    console.error('[Market Velocity API] Rankings error:', error);

    return NextResponse.json({ error: 'Failed to get market rankings' }, { status: 500 });
  }
}
