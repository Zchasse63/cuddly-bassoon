import { NextRequest, NextResponse } from 'next/server';
import {
  getRentCastClient,
  getRentCastCache,
  getRateLimiter,
  getQuotaManager,
  getUsageTracker,
  transformProperty,
  RequestPriority,
  isRentCastApiError,
  isNotFoundError,
} from '@/lib/rentcast';

// ============================================
// GET /api/rentcast/properties/[id]
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const tracker = getUsageTracker();
  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
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
    const cached = await cache.get('PROPERTY_DETAIL', { id });
    if (cached) {
      await tracker.logRequest({
        endpoint: `/properties/${id}`,
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

    const property = await rateLimiter.executeWithRateLimit(
      '/properties/',
      () => client.getProperty(id),
      RequestPriority.HIGH
    );

    // Transform to internal format
    const normalized = transformProperty(property);

    // Cache the result
    await cache.set('PROPERTY_DETAIL', { id }, normalized);

    // Record usage
    await quotaManager.recordUsage('/properties/');
    await tracker.logRequest({
      endpoint: `/properties/${id}`,
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
      endpoint: `/properties/${id}`,
      method: 'GET',
      durationMs,
      statusCode: isRentCastApiError(error) ? error.statusCode : 500,
      cached: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (isNotFoundError(error)) {
      return NextResponse.json(
        { error: 'Property not found', propertyId: id },
        { status: 404 }
      );
    }

    if (isRentCastApiError(error)) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    console.error('Property detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

