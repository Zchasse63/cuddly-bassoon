/**
 * Analytics Data Aggregation Service
 * Efficient data aggregation for analytics dashboards
 */

import { createClient } from '@/lib/supabase/server';
import { analyticsCache, cacheTTL } from './cache';
import type { Database } from '@/types/database';

type AnalyticsDaily = Database['public']['Tables']['analytics_daily']['Row'];

export interface AggregatedMetrics {
  period: { start: string; end: string };
  totals: Record<string, number>;
  averages: Record<string, number>;
  trends: Record<string, { current: number; previous: number; change: number }>;
}

export interface TimeSeriesData {
  date: string;
  [key: string]: string | number;
}

/**
 * Aggregate daily analytics data
 */
export async function aggregateDailyAnalytics(
  userId: string,
  startDate: Date,
  endDate: Date,
  metrics: string[]
): Promise<AggregatedMetrics> {
  const cacheKey = `daily:${userId}:${startDate.toISOString()}:${endDate.toISOString()}`;

  return analyticsCache.getOrSet(
    cacheKey,
    async () => {
      const supabase = await createClient();

      const { data } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const rows: AnalyticsDaily[] = data || [];
      const totals: Record<string, number> = {};
      const sums: Record<string, number> = {};

      metrics.forEach((metric) => {
        totals[metric] = 0;
        sums[metric] = 0;
      });

      rows.forEach((row) => {
        metrics.forEach((metric) => {
          const value = (row as Record<string, unknown>)[metric];
          const numValue = typeof value === 'number' ? value : 0;
          totals[metric] = (totals[metric] ?? 0) + numValue;
          sums[metric] = (sums[metric] ?? 0) + numValue;
        });
      });

      const averages: Record<string, number> = {};
      metrics.forEach((metric) => {
        averages[metric] = rows.length > 0 ? (sums[metric] ?? 0) / rows.length : 0;
      });

      // Calculate trends (compare to previous period)
      const periodLength = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const prevStart = new Date(startDate);
      prevStart.setDate(prevStart.getDate() - periodLength);

      const { data: prevData } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('user_id', userId)
        .gte('date', prevStart.toISOString().split('T')[0])
        .lt('date', startDate.toISOString().split('T')[0]);

      const prevRows: AnalyticsDaily[] = prevData || [];
      const trends: Record<string, { current: number; previous: number; change: number }> = {};

      metrics.forEach((metric) => {
        const current = totals[metric] ?? 0;
        const previous = prevRows.reduce((sum, row) => {
          const value = (row as Record<string, unknown>)[metric];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        trends[metric] = { current, previous, change };
      });

      return {
        period: { start: startDate.toISOString(), end: endDate.toISOString() },
        totals,
        averages,
        trends,
      };
    },
    cacheTTL.medium
  );
}

/**
 * Get time series data for charts
 */
export async function getTimeSeriesData(
  userId: string,
  startDate: Date,
  endDate: Date,
  metrics: string[],
  granularity: 'day' | 'week' | 'month' = 'day'
): Promise<TimeSeriesData[]> {
  const cacheKey = `timeseries:${userId}:${granularity}:${startDate.toISOString()}`;

  return analyticsCache.getOrSet(
    cacheKey,
    async () => {
      const supabase = await createClient();

      const { data } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const rows: AnalyticsDaily[] = data || [];

      if (granularity === 'day') {
        return rows.map((row) => {
          const point: TimeSeriesData = { date: row.date };
          const rowRecord = row as Record<string, unknown>;
          metrics.forEach((m) => {
            const value = rowRecord[m];
            point[m] = typeof value === 'number' ? value : 0;
          });
          return point;
        });
      }

      // Aggregate by week or month
      const grouped = new Map<string, Record<string, number>>();

      rows.forEach((row) => {
        const date = new Date(row.date);
        const rowRecord = row as Record<string, unknown>;
        let key: string;

        if (granularity === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0] ?? '';
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        }

        if (!grouped.has(key)) {
          const newGroup: Record<string, number> = {};
          metrics.forEach((m) => {
            newGroup[m] = 0;
          });
          grouped.set(key, newGroup);
        }

        const group = grouped.get(key)!;
        metrics.forEach((m) => {
          const value = rowRecord[m];
          group[m] = (group[m] ?? 0) + (typeof value === 'number' ? value : 0);
        });
      });

      return Array.from(grouped.entries()).map(([date, values]) => ({
        date,
        ...values,
      }));
    },
    cacheTTL.medium
  );
}

/**
 * Invalidate user's analytics cache
 */
export function invalidateUserCache(userId: string): void {
  analyticsCache.invalidatePattern(`.*:${userId}:.*`);
}
