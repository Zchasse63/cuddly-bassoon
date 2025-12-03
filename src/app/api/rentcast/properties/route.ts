import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getRentCastClient,
  getRentCastCache,
  getRateLimiter,
  getQuotaManager,
  getUsageTracker,
  transformProperties,
  RequestPriority,
  isRentCastApiError,
} from '@/lib/rentcast';

// ============================================
// Request Validation Schema
// ============================================

const SearchParamsSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  bedroomsMin: z.coerce.number().optional(),
  bedroomsMax: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  bathroomsMin: z.coerce.number().optional(),
  bathroomsMax: z.coerce.number().optional(),
  squareFootageMin: z.coerce.number().optional(),
  squareFootageMax: z.coerce.number().optional(),
  yearBuiltMin: z.coerce.number().optional(),
  yearBuiltMax: z.coerce.number().optional(),
  ownerOccupied: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().min(1).max(100).default(50),
});

// ============================================
// GET /api/rentcast/properties
// ============================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const tracker = getUsageTracker();

  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = SearchParamsSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = parsed.data;

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
    const cached = await cache.get('PROPERTY_SEARCH', params);
    if (cached) {
      await tracker.logRequest({
        endpoint: '/properties',
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

    // Execute search with rate limiting
    const rateLimiter = getRateLimiter();
    const client = getRentCastClient();

    const properties = await rateLimiter.executeWithRateLimit(
      '/properties',
      () => client.searchProperties(params),
      RequestPriority.HIGH
    );

    // Transform to internal format
    const normalized = transformProperties(properties);

    // Cache the results
    await cache.set('PROPERTY_SEARCH', params, normalized);

    // Record usage
    await quotaManager.recordUsage('/properties');
    await tracker.logRequest({
      endpoint: '/properties',
      method: 'GET',
      durationMs: Date.now() - startTime,
      statusCode: 200,
      cached: false,
    });

    return NextResponse.json({
      data: normalized,
      meta: { cached: false, count: normalized.length },
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    await tracker.logRequest({
      endpoint: '/properties',
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

    console.error('Property search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

