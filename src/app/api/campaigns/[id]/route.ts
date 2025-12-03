/**
 * Campaign Detail API Routes
 * GET /api/campaigns/[id] - Get campaign with stats
 * PATCH /api/campaigns/[id] - Update campaign
 * DELETE /api/campaigns/[id] - Delete campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CampaignService } from '@/lib/communication/campaign';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
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
    const campaign = await campaignService.getCampaign(user.id, id);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const stats = await campaignService.getCampaignStats(user.id, id);

    return NextResponse.json({ campaign, stats });
  } catch (error) {
    console.error('[API] Campaign get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const campaignService = new CampaignService(supabase);

    const result = await campaignService.updateCampaign(user.id, id, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ campaign: result.data });
  } catch (error) {
    console.error('[API] Campaign update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
    const success = await campaignService.deleteCampaign(user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Campaign delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
