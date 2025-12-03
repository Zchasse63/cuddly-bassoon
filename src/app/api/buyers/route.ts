/**
 * Buyers API Routes
 * GET /api/buyers - List buyers
 * POST /api/buyers - Create buyer
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BuyerService, createBuyerSchema, buyerListFiltersSchema } from '@/lib/buyers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filtersResult = buyerListFiltersSchema.safeParse({
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      tier: searchParams.get('tier') || undefined,
      search: searchParams.get('search') || undefined,
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
    const service = new BuyerService(supabase);
    const { buyers, total } = await service.listBuyers(user.id, filters, page, limit);

    return NextResponse.json({
      buyers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[Buyers API] Error listing buyers:', error);
    return NextResponse.json(
      { error: 'Failed to list buyers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = createBuyerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const service = new BuyerService(supabase);
    const buyer = await service.createBuyer(user.id, result.data);

    return NextResponse.json({ buyer }, { status: 201 });
  } catch (error) {
    console.error('[Buyers API] Error creating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to create buyer' },
      { status: 500 }
    );
  }
}

