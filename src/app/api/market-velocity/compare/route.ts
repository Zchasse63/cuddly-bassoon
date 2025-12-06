/**
 * Market Velocity API - Compare Markets
 * POST /api/market-velocity/compare
 * Body: { zipCodes: ['33601', '33602', '14201'] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { compareMarketVelocity } from '@/lib/velocity';
import type { VelocityCompareResponse } from '@/types/velocity';

// Validate request body
const CompareBodySchema = z.object({
  zipCodes: z
    .array(z.string().regex(/^\d{5}$/))
    .min(2)
    .max(10),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    const validation = CompareBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { zipCodes } = validation.data;

    console.log(
      `[Market Velocity API] Comparing ${zipCodes.length} markets: ${zipCodes.join(', ')}`
    );

    // Compare markets
    const comparison = await compareMarketVelocity(zipCodes.map((zipCode) => ({ zipCode })));

    // Transform to response format
    const rankings = comparison.rankings.map((market, index) => ({
      rank: index + 1,
      zipCode: market.zipCode,
      city: market.city,
      state: market.state,
      velocityIndex: market.velocityIndex,
      classification: market.classification,
    }));

    const response: VelocityCompareResponse = {
      rankings,
      winner: comparison.winner,
      analysis: comparison.analysis,
    };

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        comparedCount: zipCodes.length,
      },
    });
  } catch (error) {
    console.error('[Market Velocity API] Compare error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to compare markets' }, { status: 500 });
  }
}
