import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCityMetrics, getCountyMetrics, getAddressMetrics } from '@/lib/shovels/client';
import { isShovelsApiError } from '@/lib/shovels/errors';

// ============================================
// Request Validation Schema
// ============================================

const SearchParamsSchema = z.object({
  geoId: z.string().min(1, 'geoId is required'),
  geoType: z.enum(['city', 'county', 'address']),
});

// ============================================
// GET /api/shovels/metrics
// ============================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      geoId: searchParams.get('geoId') || '',
      geoType: searchParams.get('geoType') || '',
    };

    const parsed = SearchParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { geoId, geoType } = parsed.data;

    let metrics;

    switch (geoType) {
      case 'city':
        metrics = await getCityMetrics(geoId);
        break;
      case 'county':
        metrics = await getCountyMetrics(geoId);
        break;
      case 'address':
        metrics = await getAddressMetrics(geoId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid geoType' }, { status: 400 });
    }

    return NextResponse.json({
      data: metrics,
      meta: { geoId, geoType, executionTimeMs: Date.now() - startTime },
    });
  } catch (error) {
    console.error('Shovels metrics error:', error);

    if (isShovelsApiError(error)) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

