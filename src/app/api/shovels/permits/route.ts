import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { searchPermits, getPermitsForAddress } from '@/lib/shovels/client';
import { isShovelsApiError } from '@/lib/shovels/errors';
import type { ShovelsPermitTag, ShovelsPermitStatus } from '@/lib/shovels/types';

// ============================================
// Request Validation Schema
// ============================================

const SearchParamsSchema = z.object({
  addressId: z.string().optional(),
  geoId: z.string().optional(),
  permitFrom: z.string().optional(),
  permitTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'final', 'in_review', 'inactive']).optional(),
  size: z.coerce.number().min(1).max(100).default(50),
});

// ============================================
// GET /api/shovels/permits
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
      addressId: searchParams.get('addressId') || undefined,
      geoId: searchParams.get('geoId') || undefined,
      permitFrom: searchParams.get('permitFrom') || undefined,
      permitTo: searchParams.get('permitTo') || undefined,
      tags: searchParams.getAll('tags'),
      status: searchParams.get('status') || undefined,
      size: searchParams.get('size') || '50',
    };

    const parsed = SearchParamsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { addressId, geoId, permitFrom, permitTo, tags, status, size } = parsed.data;

    // Get permits for specific address
    if (addressId) {
      const permits = await getPermitsForAddress(addressId, {
        from: permitFrom,
        to: permitTo,
      });

      return NextResponse.json({
        data: permits,
        meta: { count: permits.length, executionTimeMs: Date.now() - startTime },
      });
    }

    // Search permits by geo
    if (geoId && permitFrom && permitTo) {
      const result = await searchPermits({
        geo_id: geoId,
        permit_from: permitFrom,
        permit_to: permitTo,
        permit_tags: tags && tags.length > 0 ? (tags as ShovelsPermitTag[]) : undefined,
        status: status as ShovelsPermitStatus | undefined,
        size,
      });

      return NextResponse.json({
        data: result.items,
        meta: {
          count: result.items.length,
          cursor: result.cursor,
          executionTimeMs: Date.now() - startTime,
        },
      });
    }

    return NextResponse.json(
      { error: 'Missing required parameters. Provide addressId or (geoId, permitFrom, permitTo)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Shovels permits error:', error);

    if (isShovelsApiError(error)) {
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 });
  }
}

