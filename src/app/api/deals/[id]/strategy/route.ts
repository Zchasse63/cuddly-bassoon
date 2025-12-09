/**
 * Deal Offer Strategy API Routes
 * GET /api/deals/[id]/strategy - Get offer strategy for a deal
 * POST /api/deals/[id]/strategy - Calculate and save offer strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DealService } from '@/lib/deals';
import { calculateOfferStrategy, OfferStrategyService } from '@/lib/crm';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const calculateStrategyInput = z.object({
  arv: z.number().positive().optional(),
  repairs: z.number().min(0).optional(),
  wholesaleFee: z.number().min(0).optional(),
  marketCondition: z.enum(['hot', 'normal', 'cold']).optional(),
  motivationLevel: z.enum(['hot', 'warm', 'cold']).optional(),
});

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

    const strategyService = new OfferStrategyService(supabase);
    const strategy = await strategyService.getStrategy(id);

    if (!strategy) {
      return NextResponse.json({ error: 'No strategy found for this deal' }, { status: 404 });
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Error getting strategy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get strategy' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deal to use its values as defaults
    const dealService = new DealService(supabase);
    const deal = await dealService.getDeal(id, user.id);

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = calculateStrategyInput.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const input = validation.data;

    // Use deal values as defaults
    const arv = input.arv || deal.estimated_arv;
    const repairs = input.repairs ?? deal.estimated_repairs ?? 0;

    if (!arv) {
      return NextResponse.json(
        { error: 'ARV is required. Provide it in the request or set estimated_arv on the deal.' },
        { status: 400 }
      );
    }

    // Calculate strategy
    const calculated = calculateOfferStrategy({
      arv,
      estimatedRepairs: repairs,
      wholesaleFee: input.wholesaleFee,
      marketCondition: input.marketCondition,
      motivationLevel: input.motivationLevel,
    });

    // Save strategy
    const strategyService = new OfferStrategyService(supabase);
    const strategy = await strategyService.saveStrategy(id, user.id, {
      optimal_price: calculated.optimal_price,
      target_price: calculated.target_price,
      maximum_price: calculated.maximum_price,
      walk_away_price: calculated.walk_away_price,
      arv,
      repair_estimate: repairs,
      profit_margin: calculated.breakdown.profitMargin,
      market_factor: calculated.breakdown.marketAdjustment,
      strategy_reasoning: `Market: ${input.marketCondition || 'normal'}, Motivation: ${input.motivationLevel || 'warm'}`,
      negotiation_tips: calculated.negotiation_tips,
    });

    return NextResponse.json(
      {
        strategy,
        calculated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error calculating strategy:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate strategy' },
      { status: 500 }
    );
  }
}
