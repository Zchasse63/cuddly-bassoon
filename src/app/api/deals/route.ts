/**
 * Deals API Routes
 * GET /api/deals - List deals
 * POST /api/deals - Create deal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DealService, createDealSchema, dealListFiltersSchema } from '@/lib/deals';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filtersResult = dealListFiltersSchema.safeParse({
      stage: searchParams.get('stage') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      assigned_buyer_id: searchParams.get('assigned_buyer_id') || undefined,
      min_value: searchParams.get('min_value')
        ? parseFloat(searchParams.get('min_value')!)
        : undefined,
      max_value: searchParams.get('max_value')
        ? parseFloat(searchParams.get('max_value')!)
        : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 25,
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filtersResult.error.flatten() },
        { status: 400 }
      );
    }

    const { page, limit, ...filters } = filtersResult.data;
    const service = new DealService(supabase);
    const { deals, total } = await service.listDeals(user.id, filters, page, limit);

    return NextResponse.json({
      deals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[Deals API] Error listing deals:', error);
    return NextResponse.json({ error: 'Failed to list deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createDealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const service = new DealService(supabase);
    const deal = await service.createDeal(user.id, result.data);

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error('[Deals API] Error creating deal:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
