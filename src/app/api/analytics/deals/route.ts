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
    const days = parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all deals for the period
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error fetching deals:', error);
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }

    // Calculate summary metrics
    const activeDealStatuses = ['lead', 'contacted', 'offer', 'contract'];
    const activeDeals =
      deals?.filter((d) => activeDealStatuses.includes(d.stage?.toLowerCase() || '')) || [];
    const closedDeals = deals?.filter((d) => d.stage?.toLowerCase() === 'closed') || [];
    const lostDeals = deals?.filter((d) => d.status === 'lost') || [];

    const totalRevenue = closedDeals.reduce(
      (sum, d) => sum + ((d.assignment_fee ?? 0) || (d.contract_price ?? 0)),
      0
    );
    const avgAssignmentFee = closedDeals.length > 0 ? totalRevenue / closedDeals.length : 0;

    // Calculate average days to close (use updated_at as proxy for closed date since closed_at column doesn't exist)
    const closedWithDates = closedDeals.filter((d) => d.created_at && d.updated_at);
    const avgDaysToClose =
      closedWithDates.length > 0
        ? closedWithDates.reduce((sum, d) => {
            const created = new Date(d.created_at!);
            const updated = new Date(d.updated_at!);
            return sum + Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / closedWithDates.length
        : 0;

    const conversionRate =
      deals && deals.length > 0 ? (closedDeals.length / deals.length) * 100 : 0;

    // Pipeline counts
    const pipeline = {
      leads: deals?.filter((d) => d.stage?.toLowerCase() === 'lead').length || 0,
      contacted: deals?.filter((d) => d.stage?.toLowerCase() === 'contacted').length || 0,
      appointments: deals?.filter((d) => d.stage?.toLowerCase() === 'appointment').length || 0,
      offers: deals?.filter((d) => d.stage?.toLowerCase() === 'offer').length || 0,
      contracts: deals?.filter((d) => d.stage?.toLowerCase() === 'contract').length || 0,
      closed: closedDeals.length,
    };

    // Calculate velocity (placeholder - would need stage transition tracking)
    const velocity = {
      avg_lead_to_contact: 2,
      avg_contact_to_offer: 5,
      avg_offer_to_contract: 3,
      avg_contract_to_close: 7,
    };

    // Generate trends data
    const trends = generateTrends(deals || [], days);

    // Lost reasons analysis
    const lostReasons = analyzeLostReasons(lostDeals);

    return NextResponse.json({
      summary: {
        total_deals: deals?.length || 0,
        active_deals: activeDeals.length,
        closed_deals: closedDeals.length,
        lost_deals: lostDeals.length,
        total_revenue: totalRevenue,
        avg_assignment_fee: Math.round(avgAssignmentFee),
        avg_days_to_close: Math.round(avgDaysToClose),
        conversion_rate: Math.round(conversionRate * 10) / 10,
      },
      pipeline,
      velocity,
      trends,
      lost_reasons: lostReasons,
    });
  } catch (error) {
    console.error('Error in deal analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateTrends(
  deals: Array<{
    created_at: string | null;
    stage: string | null;
    assignment_fee: number | null;
    contract_price: number | null;
  }>,
  days: number
) {
  const trends: Array<{
    date: string;
    deals_created: number;
    deals_closed: number;
    revenue: number;
  }> = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0] ?? '';

    const dayDeals = deals.filter((d) => d.created_at?.startsWith(dateStr));
    const closedDeals = dayDeals.filter((d) => d.stage?.toLowerCase() === 'closed');

    trends.push({
      date: dateStr,
      deals_created: dayDeals.length,
      deals_closed: closedDeals.length,
      revenue: closedDeals.reduce(
        (sum, d) => sum + ((d.assignment_fee ?? 0) || (d.contract_price ?? 0)),
        0
      ),
    });
  }

  return trends;
}

function analyzeLostReasons(lostDeals: Array<Record<string, unknown>>) {
  const reasonCounts: Record<string, number> = {};

  lostDeals.forEach((deal) => {
    const reason = (deal.lost_reason as string | null) ?? 'Unknown';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  const total = lostDeals.length || 1;
  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
