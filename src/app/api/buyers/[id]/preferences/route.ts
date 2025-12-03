/**
 * Buyer Preferences API Routes
 * GET /api/buyers/[id]/preferences - Get preferences
 * POST /api/buyers/[id]/preferences - Create/update preferences
 * PATCH /api/buyers/[id]/preferences - Update preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PreferencesService, BuyerService, preferencesSchema } from '@/lib/buyers';

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

    // Verify buyer belongs to user
    const buyerService = new BuyerService(supabase);
    const buyer = await buyerService.getBuyer(id, user.id);
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const prefsService = new PreferencesService(supabase);
    const preferences = await prefsService.getPreferences(id);

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('[Preferences API] Error getting preferences:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify buyer belongs to user
    const buyerService = new BuyerService(supabase);
    const buyer = await buyerService.getBuyer(id, user.id);
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const body = await request.json();
    const result = preferencesSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const prefsService = new PreferencesService(supabase);
    const preferences = await prefsService.upsertPreferences(id, result.data);

    return NextResponse.json({ preferences }, { status: 201 });
  } catch (error) {
    console.error('[Preferences API] Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // Same as POST - upsert behavior
  return POST(request, { params });
}

