import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
  staleDealCount: number; // Deals stale for 7+ days
}

const stageConfig: Record<string, { name: string; color: string; order: number }> = {
  lead: { name: 'Lead', color: 'bg-blue-500', order: 0 },
  contacted: { name: 'Contacted', color: 'bg-cyan-500', order: 1 },
  offer: { name: 'Offer', color: 'bg-amber-500', order: 2 },
  contract: { name: 'Contract', color: 'bg-purple-500', order: 3 },
  closed: { name: 'Closed', color: 'bg-emerald-500', order: 4 },
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch deals grouped by stage with updated_at for stale detection
    const { data: deals, error } = await supabase
      .from('deals')
      .select('stage, assignment_fee, contract_price, updated_at')
      .eq('user_id', user.id)
      .neq('status', 'lost');

    if (error) {
      console.error('Error fetching deals:', error);
      return NextResponse.json({ error: 'Failed to fetch pipeline data' }, { status: 500 });
    }

    // Calculate stale threshold (7 days ago)
    const now = new Date();
    const staleThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate by stage
    const stageAggregates: Record<string, { count: number; value: number; staleCount: number }> =
      {};

    for (const deal of deals || []) {
      const stage = (deal.stage || 'lead').toLowerCase();
      if (!stageAggregates[stage]) {
        stageAggregates[stage] = { count: 0, value: 0, staleCount: 0 };
      }
      stageAggregates[stage].count += 1;
      stageAggregates[stage].value += deal.assignment_fee || deal.contract_price || 0;

      // Check if deal is stale (not updated in 7+ days) and not closed
      if (deal.updated_at && stage !== 'closed') {
        const updatedAt = new Date(deal.updated_at);
        if (updatedAt < staleThreshold) {
          stageAggregates[stage].staleCount += 1;
        }
      }
    }

    // Build stages array
    const stages: PipelineStage[] = Object.entries(stageConfig)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, config]) => ({
        name: config.name,
        count: stageAggregates[key]?.count || 0,
        value: stageAggregates[key]?.value || 0,
        color: config.color,
        staleDealCount: stageAggregates[key]?.staleCount || 0,
      }));

    const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);
    const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);

    return NextResponse.json({
      stages,
      totalValue,
      totalDeals,
    });
  } catch (error) {
    console.error('Error in pipeline summary API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
