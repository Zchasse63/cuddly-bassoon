/**
 * Campaigns API Routes
 * GET /api/campaigns - List campaigns
 * POST /api/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CampaignService } from '@/lib/communication/campaign';
import { Campaign } from '@/lib/communication/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as Campaign['status'] | null;
    const channel = searchParams.get('channel') as Campaign['channel'] | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const campaignService = new CampaignService(supabase);
    const campaigns = await campaignService.listCampaigns(user.id, {
      status: status || undefined,
      channel: channel || undefined,
      limit,
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[API] Campaigns list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, deal_id, template_id, channel, recipient_criteria, scheduled_at } =
      body;

    // Validate required fields
    if (!name || !template_id || !channel || !recipient_criteria) {
      return NextResponse.json(
        { error: 'Missing required fields: name, template_id, channel, recipient_criteria' },
        { status: 400 }
      );
    }

    const campaignService = new CampaignService(supabase);
    const result = await campaignService.createCampaign(user.id, {
      name,
      description,
      deal_id,
      template_id,
      channel,
      recipient_criteria,
      scheduled_at,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ campaign: result.data }, { status: 201 });
  } catch (error) {
    console.error('[API] Campaign create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
