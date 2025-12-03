import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Get dashboard summary from RPC
    // Note: Using type assertion as database types need regeneration after migration
    const { data: summary, error: summaryError } = await (supabase as any).rpc(
      'get_dashboard_summary',
      {
        p_user_id: user.id,
        p_days: days,
      }
    );

    if (summaryError) {
      console.error('Dashboard summary error:', summaryError);
    }

    // Get existing deal statistics
    const { data: dealStats, error: dealError } = await supabase.rpc('get_deal_statistics', {
      p_user_id: user.id,
    });

    if (dealError) {
      console.error('Deal stats error:', dealError);
    }

    // Get existing buyer statistics
    const { data: buyerStats, error: buyerError } = await supabase.rpc('get_buyer_statistics', {
      p_user_id: user.id,
    });

    if (buyerError) {
      console.error('Buyer stats error:', buyerError);
    }

    // Get recent activity from analytics_daily
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Note: Using type assertion as database types need regeneration after migration
    const { data: dailyData, error: dailyError } = await (supabase as any)
      .from('analytics_daily')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dailyError) {
      console.error('Daily data error:', dailyError);
    }

    // Build response
    const dashboardData = {
      summary: summary?.[0] || {
        properties_searched: 0,
        properties_saved: 0,
        properties_analyzed: 0,
        active_leads: 0,
        active_deals: 0,
        deals_closed_period: 0,
        revenue_period: 0,
        avg_assignment_fee: 0,
        searches_trend: 0,
        deals_trend: 0,
        revenue_trend: 0,
      },
      deals: dealStats?.[0] || {
        total_deals: 0,
        active_deals: 0,
        closed_deals: 0,
        lost_deals: 0,
        total_assignment_fees: 0,
        avg_assignment_fee: 0,
        deals_by_stage: {},
      },
      buyers: buyerStats?.[0] || {
        total_buyers: 0,
        active_buyers: 0,
        qualified_buyers: 0,
        tier_a_count: 0,
        tier_b_count: 0,
        tier_c_count: 0,
      },
      dailyTrends: dailyData || [],
      period: { days },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
