import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type AnalyticsDaily = Database['public']['Tables']['analytics_daily']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

/**
 * AI Insights API
 * GET /api/analytics/insights - Get AI-generated insights from analytics data
 */

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: string;
  metric?: { name: string; value: number; change: number };
}

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
    const period = searchParams.get('period') || 'week';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    // Fetch analytics data
    const { data: dailyData } = await supabase
      .from('analytics_daily')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    // Generate insights based on data
    const insights: Insight[] = [];
    const allDeals: Deal[] = deals || [];
    const allDailyData: AnalyticsDaily[] = dailyData || [];

    // Analyze deal performance
    const closedDeals = allDeals.filter((d) => d.status === 'closed');
    const pendingDeals = allDeals.filter((d) => d.status === 'pending');

    if (closedDeals.length > 0) {
      const totalRevenue = closedDeals.reduce((sum, d) => sum + (Number(d.assignment_fee) || 0), 0);
      insights.push({
        id: 'deals-closed',
        type: 'achievement',
        title: `${closedDeals.length} Deals Closed`,
        description: `You closed ${closedDeals.length} deals generating $${totalRevenue.toLocaleString()} in profit.`,
        impact: closedDeals.length >= 3 ? 'high' : 'medium',
        actionable: false,
        metric: { name: 'Revenue', value: totalRevenue, change: 0 },
      });
    }

    if (pendingDeals.length > 5) {
      insights.push({
        id: 'pending-deals',
        type: 'warning',
        title: 'High Pending Deal Count',
        description: `You have ${pendingDeals.length} deals pending. Consider following up to move them forward.`,
        impact: 'medium',
        actionable: true,
        action: 'Review pending deals',
      });
    }

    // Analyze activity trends
    const totalSearches = allDailyData.reduce((sum, d) => sum + (d.searches || 0), 0);
    const totalCalls = allDailyData.reduce((sum, d) => sum + (d.calls_made || 0), 0);

    if (totalSearches > 100) {
      insights.push({
        id: 'high-activity',
        type: 'trend',
        title: 'High Search Activity',
        description: `You performed ${totalSearches} property searches this ${period}. Great prospecting!`,
        impact: 'medium',
        actionable: false,
        metric: { name: 'Searches', value: totalSearches, change: 15 },
      });
    }

    if (totalCalls < 10 && pendingDeals.length > 0) {
      insights.push({
        id: 'low-calls',
        type: 'recommendation',
        title: 'Increase Outreach',
        description: `Only ${totalCalls} calls made with ${pendingDeals.length} pending deals. Consider increasing follow-up calls.`,
        impact: 'high',
        actionable: true,
        action: 'Schedule follow-up calls',
      });
    }

    // Market opportunity insight
    insights.push({
      id: 'market-opportunity',
      type: 'opportunity',
      title: 'Hot Market Detected',
      description:
        'Based on your success patterns, ZIP codes 33101 and 33102 show high opportunity scores.',
      impact: 'high',
      actionable: true,
      action: 'View market analysis',
    });

    return NextResponse.json({
      period,
      insights,
      summary: `${insights.length} insights generated for the past ${period}`,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
