'use client';

import { useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/analytics';
import { Users, UserPlus, Star, TrendingUp, DollarSign, ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';

type DateRange = 7 | 30 | 90 | 365;

interface BuyerAnalytics {
  summary: {
    total_buyers: number;
    active_buyers: number;
    new_buyers: number;
    tier_a_count: number;
    tier_b_count: number;
    tier_c_count: number;
    avg_response_time: number;
    total_purchases: number;
    total_revenue: number;
  };
  engagement: {
    contacted: number;
    responded: number;
    interested: number;
    purchased: number;
    response_rate: number;
  };
  trends: Array<{
    date: string;
    new_buyers: number;
    purchases: number;
    revenue: number;
  }>;
  top_buyers: Array<{
    id: string;
    name: string;
    tier: string;
    purchases: number;
    total_spent: number;
  }>;
  acquisition: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

async function fetchBuyerAnalytics(days: number): Promise<BuyerAnalytics> {
  const response = await fetch(`/api/analytics/buyers?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch buyer analytics');
  return response.json();
}

export default function BuyerAnalyticsPage() {
  usePageContext('analytics-buyers');
  const [dateRange, setDateRange] = useState<DateRange>(30);

  const { data, isLoading } = useQuery({
    queryKey: ['buyer-analytics', dateRange],
    queryFn: () => fetchBuyerAnalytics(dateRange),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="page-title">Buyer Analytics</h1>
            <p className="page-description">Network performance and engagement metrics</p>
          </div>
        </div>
        <div className="page-header__actions">
          {([7, 30, 90, 365] as DateRange[]).map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days === 7 ? '7D' : days === 30 ? '30D' : days === 90 ? '90D' : '1Y'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <KPICardGrid columns={4}>
        <KPICard
          title="Total Buyers"
          value={isLoading ? '...' : (data?.summary.total_buyers || 0).toString()}
          icon={Users}
          subtitle={`${data?.summary.active_buyers || 0} active`}
        />
        <KPICard
          title="New Buyers"
          value={isLoading ? '...' : (data?.summary.new_buyers || 0).toString()}
          icon={UserPlus}
          subtitle={`Last ${dateRange} days`}
        />
        <KPICard
          title="Tier A Buyers"
          value={isLoading ? '...' : (data?.summary.tier_a_count || 0).toString()}
          icon={Star}
          subtitle="Top performers"
        />
        <KPICard
          title="Total Revenue"
          value={isLoading ? '...' : `$${(data?.summary.total_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          subtitle={`${data?.summary.total_purchases || 0} purchases`}
        />
      </KPICardGrid>

      {/* Engagement and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Engagement Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Funnel</CardTitle>
            <CardDescription>Buyer journey from contact to purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementFunnel engagement={data?.engagement} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Buyer Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Trends</CardTitle>
            <CardDescription>New buyers and purchases over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.trends || []}
              lines={[
                { dataKey: 'new_buyers', name: 'New Buyers', color: 'var(--color-primary)' },
                { dataKey: 'purchases', name: 'Purchases', color: 'var(--color-success)' },
              ]}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Buyers and Acquisition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Buyers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Buyers</CardTitle>
            <CardDescription>Highest performing buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <TopBuyersList buyers={data?.top_buyers || []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Acquisition Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Sources</CardTitle>
            <CardDescription>Where buyers come from</CardDescription>
          </CardHeader>
          <CardContent>
            <AcquisitionChart sources={data?.acquisition || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Engagement Funnel Component
function EngagementFunnel({
  engagement,
  isLoading,
}: {
  engagement?: BuyerAnalytics['engagement'];
  isLoading: boolean;
}) {
  const stages = [
    { label: 'Contacted', value: engagement?.contacted || 0, color: 'bg-blue-500' },
    { label: 'Responded', value: engagement?.responded || 0, color: 'bg-cyan-500' },
    { label: 'Interested', value: engagement?.interested || 0, color: 'bg-amber-500' },
    { label: 'Purchased', value: engagement?.purchased || 0, color: 'bg-emerald-500' },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <div key={stage.label} className="relative">
          <div
            className={`h-10 ${stage.color} rounded-lg flex items-center justify-between px-4 text-white transition-all`}
            style={{ width: `${Math.max((stage.value / maxValue) * 100, 20)}%` }}
          >
            <span className="font-medium text-sm">{stage.label}</span>
            <span className="font-bold">{stage.value}</span>
          </div>
          {index < stages.length - 1 && (
            <div className="absolute -bottom-1.5 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current opacity-30" />
          )}
        </div>
      ))}
      <div className="pt-2 border-t flex justify-between text-sm">
        <span className="text-muted-foreground">Response Rate</span>
        <span className="font-bold text-primary">{engagement?.response_rate || 0}%</span>
      </div>
    </div>
  );
}

// Top Buyers List Component
function TopBuyersList({
  buyers,
  isLoading,
}: {
  buyers: BuyerAnalytics['top_buyers'];
  isLoading: boolean;
}) {
  const tierColors: Record<string, string> = {
    A: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    B: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    C: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Award className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No buyer data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {buyers.slice(0, 5).map((buyer, index) => (
        <Link
          key={buyer.id}
          href={`/buyers/${buyer.id}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{buyer.name}</p>
            <p className="text-xs text-muted-foreground">
              {buyer.purchases} purchases · ${buyer.total_spent.toLocaleString()}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors[buyer.tier] || tierColors.C}`}
          >
            Tier {buyer.tier}
          </span>
        </Link>
      ))}
    </div>
  );
}

// Acquisition Chart Component
function AcquisitionChart({
  sources,
  isLoading,
}: {
  sources: BuyerAnalytics['acquisition'];
  isLoading: boolean;
}) {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No acquisition data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source, index) => (
        <div key={source.source} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{source.source}</span>
            <span className="font-medium">
              {source.count} ({source.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
              style={{ width: `${source.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
