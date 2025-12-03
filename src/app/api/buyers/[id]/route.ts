/**
 * Single Buyer API Routes
 * GET /api/buyers/[id] - Get buyer details
 * PATCH /api/buyers/[id] - Update buyer
 * DELETE /api/buyers/[id] - Soft delete buyer
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BuyerService, updateBuyerSchema } from '@/lib/buyers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new BuyerService(supabase);
    const buyer = await service.getBuyer(id, user.id);

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json({ buyer });
  } catch (error) {
    console.error('[Buyers API] Error getting buyer:', error);
    return NextResponse.json(
      { error: 'Failed to get buyer' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = updateBuyerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const service = new BuyerService(supabase);
    const buyer = await service.updateBuyer(id, user.id, result.data);

    return NextResponse.json({ buyer });
  } catch (error) {
    console.error('[Buyers API] Error updating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to update buyer' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new BuyerService(supabase);
    await service.deleteBuyer(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Buyers API] Error deleting buyer:', error);
    return NextResponse.json(
      { error: 'Failed to delete buyer' },
      { status: 500 }
    );
  }
}

