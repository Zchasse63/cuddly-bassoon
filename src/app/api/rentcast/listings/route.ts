import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRentCastClient,
  getRentCastCache,
  getRateLimiter,
  getQuotaManager,
  getUsageTracker,
  RequestPriority,
  isRentCastApiError,
} from '@/lib/rentcast';

// ============================================
// Request Validation Schema
// ============================================

const ListingsParamsSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: z.enum(['active', 'pending', 'sold']).optional(),
  propertyType: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  bedroomsMin: z.coerce.number().optional(),
  bedroomsMax: z.coerce.number().optional(),
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// ============================================
// GET /api/rentcast/listings
// ============================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const tracker = getUsageTracker();

  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = ListingsParamsSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = parsed.data;

    // Require at least one location filter
    if (!params.city && !params.state && !params.zipCode) {
      return NextResponse.json(
        { error: 'At least one location filter (city, state, or zipCode) is required' },
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

    // Determine cache type based on status
    const cacheType = params.status === 'sold' ? 'LISTINGS_SOLD' : 'LISTINGS_ACTIVE';

    // Check cache first
    const cache = getRentCastCache();
    const cached = await cache.get(cacheType, params);
    if (cached) {
      await tracker.logRequest({
        endpoint: '/listings',
        method: 'GET',
        durationMs: Date.now() - startTime,
        statusCode: 200,
        cached: true,
      });

      return NextResponse.json({
        data: cached,
        meta: { cached: true, count: Array.isArray(cached) ? cached.length : 0 },
      });
    }

    // Fetch from API with rate limiting
    const rateLimiter = getRateLimiter();
    const client = getRentCastClient();

    const listings = await rateLimiter.executeWithRateLimit(
      '/listings',
      () => client.getListings(params),
      RequestPriority.NORMAL
    );

    // Cache the results
    await cache.set(cacheType, params, listings);

    // Record usage
    await quotaManager.recordUsage('/listings');
    await tracker.logRequest({
      endpoint: '/listings',
      method: 'GET',
      durationMs: Date.now() - startTime,
      statusCode: 200,
      cached: false,
    });

    return NextResponse.json({
      data: listings,
      meta: { cached: false, count: listings.length },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    await tracker.logRequest({
      endpoint: '/listings',
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

    console.error('Listings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

