import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    let data: any[] = [];

    switch (layer) {
      case 'price_trends':
        const { data: priceData } = await (supabase as any)
          .from('heat_map_data')
          .select('zip_code, lat, lng, value, metadata')
          .eq('user_id', user.id)
          .eq('layer_type', 'price_trends')
          .order('value', { ascending: false })
          .limit(500);
        data = priceData || [];
        break;

      case 'my_searches':
        const { data: searchData } = await (supabase as any)
          .from('analytics_daily')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30);
        // Aggregate by zip code from search history
        data = aggregateByZipCode(searchData || [], 'searches');
        break;

      case 'my_deals':
        const { data: dealData } = await (supabase as any)
          .from('deals')
          .select('zip_code, status, profit')
          .eq('user_id', user.id);
        data = aggregateDealsByZipCode(dealData || []);
        break;

      case 'distressed_properties':
        const { data: distressData } = await (supabase as any)
          .from('heat_map_data')
          .select('zip_code, lat, lng, value, metadata')
          .eq('layer_type', 'distressed')
          .order('value', { ascending: false })
          .limit(500);
        data = distressData || [];
        break;

      default:
        // Generic layer fetch
        const { data: genericData } = await (supabase as any)
          .from('heat_map_data')
          .select('zip_code, lat, lng, value, metadata')
          .eq('layer_type', layer)
          .limit(500);
        data = genericData || [];
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

function aggregateByZipCode(data: any[], field: string): any[] {
  const zipMap = new Map<string, { count: number; lat: number; lng: number }>();

  data.forEach((item: any) => {
    if (item.zip_code) {
      const existing = zipMap.get(item.zip_code) || { count: 0, lat: 0, lng: 0 };
      existing.count += item[field] || 1;
      zipMap.set(item.zip_code, existing);
    }
  });

  return Array.from(zipMap.entries()).map(([zipCode, stats]) => ({
    zip_code: zipCode,
    lat: stats.lat,
    lng: stats.lng,
    value: stats.count,
  }));
}

function aggregateDealsByZipCode(deals: any[]): any[] {
  const zipMap = new Map<string, { count: number; profit: number }>();

  deals.forEach((deal: any) => {
    if (deal.zip_code) {
      const existing = zipMap.get(deal.zip_code) || { count: 0, profit: 0 };
      existing.count++;
      existing.profit += deal.profit || 0;
      zipMap.set(deal.zip_code, existing);
    }
  });

  return Array.from(zipMap.entries()).map(([zipCode, stats]) => ({
    zip_code: zipCode,
    value: stats.count,
    metadata: { totalProfit: stats.profit, avgProfit: stats.profit / stats.count },
  }));
}
