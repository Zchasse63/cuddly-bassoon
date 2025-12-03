/**
 * Individual Deal API Routes
 * GET /api/deals/[id] - Get deal details
 * PATCH /api/deals/[id] - Update deal
 * DELETE /api/deals/[id] - Delete deal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DealService, updateDealSchema } from '@/lib/deals';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new DealService(supabase);
    const deal = await service.getDeal(id, user.id);

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('[Deals API] Error getting deal:', error);
    return NextResponse.json({ error: 'Failed to get deal' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = updateDealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const service = new DealService(supabase);
    const deal = await service.updateDeal(id, user.id, result.data);

    return NextResponse.json({ deal });
  } catch (error) {
    console.error('[Deals API] Error updating deal:', error);
    const message = error instanceof Error ? error.message : 'Failed to update deal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new DealService(supabase);
    await service.deleteDeal(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Deals API] Error deleting deal:', error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
