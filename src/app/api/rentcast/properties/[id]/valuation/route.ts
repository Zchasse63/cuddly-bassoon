import { NextRequest, NextResponse } from 'next/server';
import {
  getRentCastClient,
  getRentCastCache,
  getRateLimiter,
  getQuotaManager,
  getUsageTracker,
  transformValuation,
  RequestPriority,
  isRentCastApiError,
} from '@/lib/rentcast';

// ============================================
// GET /api/rentcast/properties/[id]/valuation
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const tracker = getUsageTracker();
  const { id } = await params;

  try {
    // Get address from query params (required for AVM)
    const address = request.nextUrl.searchParams.get('address');
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required for valuation' },
        { status: 400 }
      );
    }

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
    const cacheKey = { propertyId: id, address };
    const cached = await cache.get('VALUATION', cacheKey);
    if (cached) {
      await tracker.logRequest({
        endpoint: `/properties/${id}/valuation`,
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

    const valuation = await rateLimiter.executeWithRateLimit(
      '/avm',
      () => client.getValuation(address),
      RequestPriority.NORMAL
    );

    // Transform to internal format
    const normalized = transformValuation(valuation, id);

    // Cache the result
    await cache.set('VALUATION', cacheKey, normalized);

    // Record usage
    await quotaManager.recordUsage('/avm/value');
    await tracker.logRequest({
      endpoint: `/properties/${id}/valuation`,
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
      endpoint: `/properties/${id}/valuation`,
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

    console.error('Valuation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

