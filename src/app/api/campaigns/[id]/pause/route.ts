/**
 * Campaign Pause API Route
 * POST /api/campaigns/[id]/pause - Pause a running campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CampaignService } from '@/lib/communication/campaign';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaignService = new CampaignService(supabase);
    const success = await campaignService.pauseCampaign(user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to pause campaign' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Campaign pause error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
