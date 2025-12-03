import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Analytics Export API
 * GET /api/analytics/export?format=csv|json&type=all|activity|outreach|pipeline|financial&days=30
 */
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
    const format = searchParams.get('format') || 'json';
    const days = parseInt(searchParams.get('days') || '30', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = new Date().toISOString().split('T')[0];

    // Fetch daily analytics data
    const { data: dailyData, error: dailyError } = await (supabase as any)
      .from('analytics_daily')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (dailyError) {
      console.error('Error fetching analytics:', dailyError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    const data = dailyData || [];

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Date',
        'Searches',
        'Views',
        'Saves',
        'Analyses',
        'Calls Made',
        'Calls Connected',
        'Emails Sent',
        'Texts Sent',
        'Leads Created',
        'Offers Made',
        'Contracts Signed',
        'Deals Closed',
        'Revenue',
        'Expenses',
      ];

      const rows = data.map((row: any) => [
        row.date,
        row.searches || 0,
        row.property_views || 0,
        row.saves || 0,
        row.analyses || 0,
        row.calls_made || 0,
        row.calls_connected || 0,
        row.emails_sent || 0,
        row.texts_sent || 0,
        row.leads_created || 0,
        row.offers_made || 0,
        row.contracts_signed || 0,
        row.deals_closed || 0,
        row.revenue || 0,
        row.expenses || 0,
      ]);

      const csv = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${startDateStr}-to-${endDateStr}.csv"`,
        },
      });
    }

    // Return JSON
    return NextResponse.json({
      period: { start: startDateStr, end: endDateStr, days },
      data,
      summary: {
        totalSearches: data.reduce((sum: number, r: any) => sum + (r.searches || 0), 0),
        totalViews: data.reduce((sum: number, r: any) => sum + (r.property_views || 0), 0),
        totalSaves: data.reduce((sum: number, r: any) => sum + (r.saves || 0), 0),
        totalRevenue: data.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0),
        totalDeals: data.reduce((sum: number, r: any) => sum + (r.deals_closed || 0), 0),
      },
    });
  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
