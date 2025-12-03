import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const type = searchParams.get('type');

    // Build query for activities
    let query = supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('activity_type', type);
    }

    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    // Transform activities to match the Activity interface
    const transformedActivities = (activities || []).map((activity) => ({
      id: activity.id,
      type: mapActivityType(activity.activity_type),
      title:
        activity.description || formatActivityTitle(activity.activity_type, activity.entity_type),
      description: formatActivityDescription(activity),
      timestamp: activity.created_at,
      entityId: activity.entity_id,
      entityType: activity.entity_type,
      metadata: activity.metadata,
    }));

    return NextResponse.json({
      activities: transformedActivities,
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error('Error in activities API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function mapActivityType(activityType: string): string {
  const typeMap: Record<string, string> = {
    property_view: 'property',
    property_save: 'property',
    property_analyze: 'property',
    deal_create: 'deal',
    deal_update: 'deal',
    deal_stage_change: 'deal',
    buyer_add: 'buyer',
    buyer_update: 'buyer',
    call_made: 'call',
    call_received: 'call',
    email_sent: 'email',
    email_received: 'email',
    sms_sent: 'sms',
    sms_received: 'sms',
    search: 'search',
    offer_made: 'offer',
    contract_signed: 'contract',
    deal_closed: 'closed',
    deal_lost: 'lost',
  };
  return typeMap[activityType] || 'deal';
}

function formatActivityTitle(activityType: string, entityType: string): string {
  const titles: Record<string, string> = {
    property_view: 'Viewed property',
    property_save: 'Saved property',
    property_analyze: 'Analyzed property',
    deal_create: 'Created new deal',
    deal_update: 'Updated deal',
    deal_stage_change: 'Deal stage changed',
    buyer_add: 'Added new buyer',
    buyer_update: 'Updated buyer',
    call_made: 'Made a call',
    call_received: 'Received a call',
    email_sent: 'Sent email',
    email_received: 'Received email',
    sms_sent: 'Sent SMS',
    sms_received: 'Received SMS',
    search: 'Searched properties',
    offer_made: 'Made an offer',
    contract_signed: 'Contract signed',
    deal_closed: 'Deal closed',
    deal_lost: 'Deal lost',
  };
  return titles[activityType] || `${activityType} on ${entityType}`;
}

function formatActivityDescription(activity: {
  activity_type: string;
  metadata?: unknown;
  new_value?: unknown;
}): string | undefined {
  const metadata = activity.metadata as Record<string, unknown> | null;
  if (metadata?.address) {
    return metadata.address as string;
  }
  if (metadata?.name) {
    return metadata.name as string;
  }
  if (activity.new_value && typeof activity.new_value === 'object') {
    const newVal = activity.new_value as Record<string, unknown>;
    if (newVal.stage) {
      return `Moved to ${newVal.stage}`;
    }
  }
  return undefined;
}
