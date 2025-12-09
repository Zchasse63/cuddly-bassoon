import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type AnalyticsDaily = Database['public']['Tables']['analytics_daily']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

// Heat map data point interface (table not yet in generated types)
interface HeatMapDataPoint {
  zip_code: string;
  lat?: number;
  lng?: number;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Heat Map Data API
 * GET /api/analytics/heatmap?layer=price_trends&bounds=lat1,lng1,lat2,lng2
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
    const layer = searchParams.get('layer') || 'price_trends';
    const bounds = searchParams.get('bounds')?.split(',').map(Number);

    // Fetch heat map data based on layer type
    let data: HeatMapDataPoint[] = [];

    switch (layer) {
      case 'price_trends': {
        // Note: heat_map_data table not in generated types yet
        const { data: priceData } = (await supabase
          .from('user_heat_map_data' as const)
          .select('*')
          .eq('user_id', user.id)
          .eq('layer_type', 'price_trends')
          .limit(500)) as { data: HeatMapDataPoint[] | null };
        data = priceData || [];
        break;
      }

      case 'my_searches': {
        const { data: searchData } = await supabase
          .from('analytics_daily')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);
        // Aggregate by zip code from search history
        data = aggregateByZipCode(searchData || [], 'searches');
        break;
      }

      case 'my_deals': {
        const { data: dealData } = await supabase.from('deals').select('*').eq('user_id', user.id);
        data = aggregateDealsByZipCode(dealData || []);
        break;
      }

      case 'distressed_properties': {
        // Note: heat_map_data table not in generated types yet
        const { data: distressData } = (await supabase
          .from('user_heat_map_data' as const)
          .select('*')
          .eq('layer_type', 'distressed')
          .limit(500)) as { data: HeatMapDataPoint[] | null };
        data = distressData || [];
        break;
      }

      default: {
        // Generic layer fetch
        const { data: genericData } = (await supabase
          .from('user_heat_map_data' as const)
          .select('*')
          .eq('layer_type', layer)
          .limit(500)) as { data: HeatMapDataPoint[] | null };
        data = genericData || [];
      }
    }

    // Filter by bounds if provided
    if (bounds && bounds.length === 4) {
      const [lat1 = 0, lng1 = 0, lat2 = 0, lng2 = 0] = bounds;
      data = data.filter(
        (point: { lat?: number; lng?: number }) =>
          (point.lat ?? 0) >= Math.min(lat1, lat2) &&
          (point.lat ?? 0) <= Math.max(lat1, lat2) &&
          (point.lng ?? 0) >= Math.min(lng1, lng2) &&
          (point.lng ?? 0) <= Math.max(lng1, lng2)
      );
    }

    return NextResponse.json({
      layer,
      dataPoints: data,
      count: data.length,
      bounds: bounds || null,
    });
  } catch (error) {
    console.error('Heat map data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function aggregateByZipCode(
  data: AnalyticsDaily[],
  field: keyof AnalyticsDaily
): HeatMapDataPoint[] {
  const zipMap = new Map<string, { count: number; lat: number; lng: number }>();

  // Note: analytics_daily doesn't have zip_code, this is a placeholder aggregation
  // In a real implementation, you'd join with properties or use a different data source
  data.forEach((item) => {
    const zipCode = 'unknown'; // analytics_daily doesn't have zip_code
    const existing = zipMap.get(zipCode) || { count: 0, lat: 0, lng: 0 };
    const fieldValue = item[field];
    existing.count += typeof fieldValue === 'number' ? fieldValue : 1;
    zipMap.set(zipCode, existing);
  });

  return Array.from(zipMap.entries()).map(([zipCode, stats]) => ({
    zip_code: zipCode,
    lat: stats.lat,
    lng: stats.lng,
    value: stats.count,
  }));
}

function aggregateDealsByZipCode(deals: Deal[]): HeatMapDataPoint[] {
  const zipMap = new Map<string, { count: number; profit: number }>();

  deals.forEach((deal) => {
    // Deals table uses property_address, extract zip from there or use a default
    const zipCode = 'unknown'; // deals table doesn't have zip_code column
    const existing = zipMap.get(zipCode) || { count: 0, profit: 0 };
    existing.count++;
    existing.profit += Number(deal.assignment_fee) || 0;
    zipMap.set(zipCode, existing);
  });

  return Array.from(zipMap.entries()).map(([zipCode, stats]) => ({
    zip_code: zipCode,
    value: stats.count,
    metadata: { totalProfit: stats.profit, avgProfit: stats.profit / stats.count },
  }));
}
