'use client';

import { useQuery } from '@tanstack/react-query';

interface DashboardSummary {
  properties_searched: number;
  properties_saved: number;
  properties_analyzed: number;
  active_leads: number;
  active_deals: number;
  deals_closed_period: number;
  revenue_period: number;
  avg_assignment_fee: number;
  searches_trend: number;
  deals_trend: number;
  revenue_trend: number;
}

interface DealStats {
  total_deals: number;
  active_deals: number;
  closed_deals: number;
  lost_deals: number;
  total_assignment_fees: number;
  avg_assignment_fee: number;
  deals_by_stage: Record<string, number>;
}

interface BuyerStats {
  total_buyers: number;
  active_buyers: number;
  qualified_buyers: number;
  tier_a_count: number;
  tier_b_count: number;
  tier_c_count: number;
}

interface DailyTrend {
  date: string;
  searches: number;
  property_views: number;
  property_saves: number;
  leads_created: number;
  deals_closed: number;
  revenue: number;
}

interface DashboardData {
  summary: DashboardSummary;
  deals: DealStats;
  buyers: BuyerStats;
  dailyTrends: DailyTrend[];
  period: { days: number };
}

async function fetchDashboardData(days: number): Promise<DashboardData> {
  const response = await fetch(`/api/analytics/dashboard?days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
}

export function useDashboardData(days: number = 7) {
  return useQuery({
    queryKey: ['dashboard', days],
    queryFn: () => fetchDashboardData(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// Hook for fetching specific KPI categories
interface KPIData {
  period: { start: string; end: string; days: number };
  kpis: {
    activity?: {
      total_searches: number;
      total_views: number;
      total_saves: number;
      total_analyses: number;
      avg_daily_searches: number;
      search_to_save_rate: number;
    };
    outreach?: {
      total_calls: number;
      connected_calls: number;
      total_texts_sent: number;
      total_emails_sent: number;
      call_connect_rate: number;
      email_open_rate: number;
    };
    pipeline?: {
      total_leads: number;
      leads_contacted: number;
      appointments_set: number;
      offers_made: number;
      contracts_signed: number;
      deals_closed: number;
      overall_conversion_rate: number;
    };
    financial?: {
      total_revenue: number;
      total_expenses: number;
      net_profit: number;
      avg_deal_revenue: number;
      roi_percentage: number;
    };
  };
}

async function fetchKPIs(type: string, days: number): Promise<KPIData> {
  const response = await fetch(`/api/analytics/kpis?type=${type}&days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch KPIs');
  }
  return response.json();
}

export function useKPIs(
  type: 'all' | 'activity' | 'outreach' | 'pipeline' | 'financial' = 'all',
  days: number = 7
) {
  return useQuery({
    queryKey: ['kpis', type, days],
    queryFn: () => fetchKPIs(type, days),
    staleTime: 1000 * 60 * 5,
  });
}
