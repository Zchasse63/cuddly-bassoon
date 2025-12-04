/**
 * Cron API - Velocity Index Calculation
 * POST /api/cron/velocity
 *
 * Triggered by Vercel Cron or similar scheduler to calculate velocity indexes
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateAllVelocityIndexes,
  calculateVelocityAggregates,
  seedTrackedZipCodes,
} from '@/lib/jobs/calculate-velocity-indexes';

// Vercel Cron secret for authorization
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body for options
    let options: {
      action?: 'calculate' | 'aggregate' | 'seed';
      batchSize?: number;
      state?: string;
      limit?: number;
    } = { action: 'calculate' };

    try {
      const body = await request.json();
      options = { ...options, ...body };
    } catch {
      // Use default options if no body
    }

    console.log(`[Cron Velocity] Starting job with action: ${options.action}`);

    let result: unknown;

    switch (options.action) {
      case 'seed':
        // Seed tracked zip codes from properties
        const seededCount = await seedTrackedZipCodes({
          state: options.state,
          limit: options.limit,
        });
        result = { action: 'seed', seededCount };
        break;

      case 'aggregate':
        // Calculate aggregates
        const aggregates = await calculateVelocityAggregates();
        result = { action: 'aggregate', ...aggregates };
        break;

      case 'calculate':
      default:
        // Calculate velocity indexes
        const jobResult = await calculateAllVelocityIndexes({
          batchSize: options.batchSize,
          state: options.state,
          limit: options.limit,
        });
        result = { action: 'calculate', ...jobResult };
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron Velocity] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual trigger (with auth)
export async function GET(request: NextRequest) {
  // Redirect GET to POST for convenience
  return POST(request);
}
