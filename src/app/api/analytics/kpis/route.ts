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
    const type = searchParams.get('type') || 'all';
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = new Date().toISOString().split('T')[0];

    const results: Record<string, unknown> = {};

    // Fetch requested KPI types
    // Note: Using type assertion as database types need regeneration after migration
    if (type === 'all' || type === 'activity') {
      const { data: activityKpis, error } = await (supabase as any).rpc('get_activity_kpis', {
        p_user_id: user.id,
        p_start_date: startDateStr,
        p_end_date: endDateStr,
      });
      if (!error && activityKpis?.[0]) {
        results.activity = activityKpis[0];
      }
    }

    if (type === 'all' || type === 'outreach') {
      const { data: outreachKpis, error } = await (supabase as any).rpc('get_outreach_kpis', {
        p_user_id: user.id,
        p_start_date: startDateStr,
        p_end_date: endDateStr,
      });
      if (!error && outreachKpis?.[0]) {
        results.outreach = outreachKpis[0];
      }
    }

    if (type === 'all' || type === 'pipeline') {
      const { data: pipelineKpis, error } = await (supabase as any).rpc('get_pipeline_kpis', {
        p_user_id: user.id,
        p_start_date: startDateStr,
        p_end_date: endDateStr,
      });
      if (!error && pipelineKpis?.[0]) {
        results.pipeline = pipelineKpis[0];
      }
    }

    if (type === 'all' || type === 'financial') {
      const { data: financialKpis, error } = await (supabase as any).rpc('get_financial_kpis', {
        p_user_id: user.id,
        p_start_date: startDateStr,
        p_end_date: endDateStr,
      });
      if (!error && financialKpis?.[0]) {
        results.financial = financialKpis[0];
      }
    }

    return NextResponse.json({
      period: { start: startDateStr, end: endDateStr, days },
      kpis: results,
    });
  } catch (error) {
    console.error('KPIs fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
