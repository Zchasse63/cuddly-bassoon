import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Type for property sales with joined property data
interface PropertySaleWithProperty {
  id: string;
  sale_date: string;
  sale_price: number | null;
  buyer_type: string | null;
  was_in_pipeline: boolean | null;
  pipeline_stage_when_sold: string | null;
  our_offer_amount: number | null;
  lost_reason: string | null;
  price_delta: number | null;
  competitor_who_won: string | null;
  property: {
    address: string;
    city: string;
    state: string;
  } | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Fetch all sales in the period
    const { data: sales, error: salesError } = await supabase
      .from('property_sales')
      .select(
        `
        id,
        sale_date,
        sale_price,
        buyer_type,
        was_in_pipeline,
        pipeline_stage_when_sold,
        our_offer_amount,
        lost_reason,
        price_delta,
        competitor_who_won,
        property:properties(address, city, state)
      `
      )
      .eq('user_id', user.id)
      .gte('sale_date', startDateStr)
      .order('sale_date', { ascending: false })
      .returns<PropertySaleWithProperty[]>();

    // Handle case where table doesn't exist yet
    if (salesError) {
      console.error('Error fetching sales:', salesError);
      // Return empty data if table doesn't exist
      return NextResponse.json({
        summary: {
          total_lost: 0,
          lost_from_pipeline: 0,
          missed_entirely: 0,
          total_value_lost: 0,
          avg_price_gap: 0,
          potential_fees_lost: 0,
          conversion_rate: 0,
        },
        by_reason: [],
        by_stage: [],
        by_buyer_type: [],
        trends: [],
        recent_losses: [],
        insights: [
          'Property sale tracking not yet configured. Run migrations to enable this feature.',
        ],
      });
    }

    const salesData = sales || [];

    // Calculate summary
    const totalLost = salesData.length;
    const lostFromPipeline = salesData.filter((s) => s.was_in_pipeline).length;
    const missedEntirely = totalLost - lostFromPipeline;
    const totalValueLost = salesData.reduce((sum, s) => sum + (s.sale_price || 0), 0);
    const priceGaps = salesData.filter((s) => s.price_delta !== null).map((s) => s.price_delta!);
    const avgPriceGap =
      priceGaps.length > 0
        ? Math.round(priceGaps.reduce((a, b) => a + b, 0) / priceGaps.length)
        : 0;
    const potentialFeesLost = Math.round(totalValueLost * 0.1);

    // Get total deals for conversion rate
    const { count: totalDeals } = await supabase
      .from('deals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    const conversionRate =
      totalDeals && totalDeals > 0
        ? Math.round(((totalDeals - lostFromPipeline) / totalDeals) * 100)
        : 0;

    // Group by reason
    const byReasonMap: Record<string, { count: number; totalValue: number }> = {};
    for (const sale of salesData) {
      const reason = sale.lost_reason || 'Unknown';
      if (!byReasonMap[reason]) {
        byReasonMap[reason] = { count: 0, totalValue: 0 };
      }
      byReasonMap[reason].count++;
      byReasonMap[reason].totalValue += sale.sale_price || 0;
    }
    const byReason = Object.entries(byReasonMap)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        percentage: totalLost > 0 ? Math.round((data.count / totalLost) * 100) : 0,
        total_value: data.totalValue,
      }))
      .sort((a, b) => b.count - a.count);

    // Group by stage
    const byStageMap: Record<string, { count: number; totalValue: number }> = {};
    for (const sale of salesData) {
      const stage = sale.pipeline_stage_when_sold || 'Not in pipeline';
      if (!byStageMap[stage]) {
        byStageMap[stage] = { count: 0, totalValue: 0 };
      }
      byStageMap[stage].count++;
      byStageMap[stage].totalValue += sale.sale_price || 0;
    }
    const byStage = Object.entries(byStageMap)
      .map(([stage, data]) => ({
        stage,
        count: data.count,
        percentage: totalLost > 0 ? Math.round((data.count / totalLost) * 100) : 0,
        total_value: data.totalValue,
      }))
      .sort((a, b) => b.count - a.count);

    // Group by buyer type
    const byBuyerTypeMap: Record<string, { count: number; totalValue: number }> = {};
    for (const sale of salesData) {
      const buyerType = sale.buyer_type || 'Unknown';
      if (!byBuyerTypeMap[buyerType]) {
        byBuyerTypeMap[buyerType] = { count: 0, totalValue: 0 };
      }
      byBuyerTypeMap[buyerType].count++;
      byBuyerTypeMap[buyerType].totalValue += sale.sale_price || 0;
    }
    const byBuyerType = Object.entries(byBuyerTypeMap)
      .map(([buyer_type, data]) => ({
        buyer_type,
        count: data.count,
        percentage: totalLost > 0 ? Math.round((data.count / totalLost) * 100) : 0,
        total_value: data.totalValue,
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate trends (group by week)
    const trendsMap: Record<
      string,
      { lostCount: number; valueLost: number; fromPipeline: number; missed: number }
    > = {};
    for (const sale of salesData) {
      if (!sale.sale_date) continue;
      const date = new Date(sale.sale_date);
      if (isNaN(date.getTime())) continue;
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0] as string;

      if (!trendsMap[weekKey]) {
        trendsMap[weekKey] = { lostCount: 0, valueLost: 0, fromPipeline: 0, missed: 0 };
      }
      const weekData = trendsMap[weekKey];
      weekData.lostCount++;
      weekData.valueLost += sale.sale_price || 0;
      if (sale.was_in_pipeline) {
        weekData.fromPipeline++;
      } else {
        weekData.missed++;
      }
    }
    const trends = Object.entries(trendsMap)
      .map(([date, data]) => ({
        date,
        lost_count: data.lostCount,
        value_lost: data.valueLost,
        from_pipeline: data.fromPipeline,
        missed: data.missed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Format recent losses
    const recentLosses = salesData.slice(0, 10).map((sale) => ({
      id: sale.id,
      address: sale.property
        ? `${sale.property.address}, ${sale.property.city}, ${sale.property.state}`
        : 'Unknown Address',
      sale_date: sale.sale_date,
      sale_price: sale.sale_price,
      our_offer: sale.our_offer_amount,
      price_gap: sale.price_delta,
      lost_reason: sale.lost_reason,
      was_in_pipeline: sale.was_in_pipeline,
      buyer_type: sale.buyer_type,
    }));

    // Generate insights
    const insights: string[] = [];

    if (totalLost > 0) {
      if (lostFromPipeline > missedEntirely) {
        insights.push(
          `${Math.round((lostFromPipeline / totalLost) * 100)}% of lost properties were in your pipeline. Focus on improving conversion tactics.`
        );
      } else if (missedEntirely > 0) {
        insights.push(
          `${Math.round((missedEntirely / totalLost) * 100)}% of sales were properties you never contacted. Consider expanding your outreach.`
        );
      }

      if (avgPriceGap > 0) {
        insights.push(
          `On average, winning offers were $${avgPriceGap.toLocaleString()} higher than yours. Consider adjusting your offer strategy.`
        );
      } else if (avgPriceGap < 0) {
        insights.push(
          `Your offers were competitive - $${Math.abs(avgPriceGap).toLocaleString()} above average. Focus on speed and relationship building.`
        );
      }

      const topReason = byReason[0];
      if (topReason && topReason.reason !== 'Unknown') {
        insights.push(
          `Most common loss reason: "${topReason.reason}" (${topReason.percentage}% of losses).`
        );
      }

      if (potentialFeesLost > 50000) {
        insights.push(
          `You've potentially missed $${potentialFeesLost.toLocaleString()} in assignment fees. Each lost deal matters!`
        );
      }
    } else {
      insights.push(
        'No property losses recorded yet. Use "Mark as Sold" to track properties that sell to others.'
      );
    }

    return NextResponse.json({
      summary: {
        total_lost: totalLost,
        lost_from_pipeline: lostFromPipeline,
        missed_entirely: missedEntirely,
        total_value_lost: totalValueLost,
        avg_price_gap: avgPriceGap,
        potential_fees_lost: potentialFeesLost,
        conversion_rate: conversionRate,
      },
      by_reason: byReason,
      by_stage: byStage,
      by_buyer_type: byBuyerType,
      trends,
      recent_losses: recentLosses,
      insights,
    });
  } catch (error) {
    console.error('Error fetching loss pipeline analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
