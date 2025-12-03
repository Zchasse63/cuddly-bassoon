import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRentCastClient,
  getRentCastCache,
  getRateLimiter,
  getQuotaManager,
  getUsageTracker,
  transformMarketData,
  RequestPriority,
  isRentCastApiError,
} from '@/lib/rentcast';

// ============================================
// Request Validation Schema
// ============================================

const MarketParamsSchema = z.object({
  zipCode: z.string().min(5).max(10),
});

// ============================================
// GET /api/rentcast/markets
// ============================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const tracker = getUsageTracker();

  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = MarketParamsSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { zipCode } = parsed.data;

    // Check quota
    const quotaManager = getQuotaManager();
    const quotaCheck = await quotaManager.canMakeRequest();
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: 'Quota exceeded', message: quotaCheck.reason },
        { status: 429 }
      );
    }

    // Check cache first
    const cache = getRentCastCache();
    const cached = await cache.get('MARKET_DATA', { zipCode });
    if (cached) {
      await tracker.logRequest({
        endpoint: '/markets',
        method: 'GET',
        durationMs: Date.now() - startTime,
        statusCode: 200,
        cached: true,
      });

      return NextResponse.json({
        data: cached,
        meta: { cached: true },
      });
    }

    // Fetch from API with rate limiting
    const rateLimiter = getRateLimiter();
    const client = getRentCastClient();

    const marketData = await rateLimiter.executeWithRateLimit(
      '/markets',
      () => client.getMarketData(zipCode),
      RequestPriority.NORMAL
    );

    // Transform to internal format
    const normalized = transformMarketData(marketData);

    // Cache the result
    await cache.set('MARKET_DATA', { zipCode }, normalized);

    // Record usage
    await quotaManager.recordUsage('/markets');
    await tracker.logRequest({
      endpoint: '/markets',
      method: 'GET',
      durationMs: Date.now() - startTime,
      statusCode: 200,
      cached: false,
    });

    return NextResponse.json({
      data: normalized,
      meta: { cached: false },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    await tracker.logRequest({
      endpoint: '/markets',
      method: 'GET',
      durationMs,
      statusCode: isRentCastApiError(error) ? error.statusCode : 500,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (isRentCastApiError(error)) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    console.error('Market data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

