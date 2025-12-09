'use client';

import { useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/analytics';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  ArrowLeft,
  Target,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

type DateRange = 7 | 30 | 90 | 365;

interface MarketAnalytics {
  summary: {
    total_markets: number;
    active_markets: number;
    avg_price: number;
    price_trend: number;
    total_properties: number;
    avg_days_on_market: number;
  };
  markets: Array<{
    id: string;
    name: string;
    zip_code: string;
    properties: number;
    avg_price: number;
    price_trend: number;
    opportunity_score: number;
  }>;
  trends: Array<{
    date: string;
    avg_price: number;
    listings: number;
    sales: number;
  }>;
  opportunities: Array<{
    zip_code: string;
    area: string;
    score: number;
    reason: string;
    properties: number;
  }>;
  price_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

async function fetchMarketAnalytics(days: number): Promise<MarketAnalytics> {
  const response = await fetch(`/api/analytics/markets?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch market analytics');
  return response.json();
}

export default function MarketAnalyticsPage() {
  usePageContext('analytics-markets');
  const [dateRange, setDateRange] = useState<DateRange>(30);

  const { data, isLoading } = useQuery({
    queryKey: ['market-analytics', dateRange],
    queryFn: () => fetchMarketAnalytics(dateRange),
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
            <h1 className="page-title">Market Analytics</h1>
            <p className="page-description">Market trends and opportunity analysis</p>
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
          title="Active Markets"
          value={isLoading ? '...' : (data?.summary.active_markets || 0).toString()}
          icon={MapPin}
          subtitle={`${data?.summary.total_markets || 0} total`}
        />
        <KPICard
          title="Avg Price"
          value={isLoading ? '...' : `$${(data?.summary.avg_price || 0).toLocaleString()}`}
          icon={DollarSign}
          change={
            data?.summary.price_trend
              ? { value: data.summary.price_trend, label: 'vs last period' }
              : undefined
          }
        />
        <KPICard
          title="Total Properties"
          value={isLoading ? '...' : (data?.summary.total_properties || 0).toString()}
          icon={Home}
        />
        <KPICard
          title="Avg Days on Market"
          value={isLoading ? '...' : (data?.summary.avg_days_on_market || 0).toString()}
          icon={Target}
          subtitle="days average"
        />
      </KPICardGrid>

      {/* Market Performance and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Markets */}
        <Card>
          <CardHeader>
            <CardTitle>Top Markets</CardTitle>
            <CardDescription>Markets by opportunity score</CardDescription>
          </CardHeader>
          <CardContent>
            <MarketsList markets={data?.markets || []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Price Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Price Trends</CardTitle>
            <CardDescription>Average prices over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.trends || []}
              lines={[{ dataKey: 'avg_price', name: 'Avg Price', color: 'var(--color-primary)' }]}
              formatValue={(v) => `$${(v / 1000).toFixed(0)}k`}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Opportunities and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Hot Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Hot Opportunities</CardTitle>
            <CardDescription>High-potential areas</CardDescription>
          </CardHeader>
          <CardContent>
            <OpportunitiesList opportunities={data?.opportunities || []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
            <CardDescription>Properties by price range</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceDistribution
              distribution={data?.price_distribution || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Markets List Component
function MarketsList({
  markets,
  isLoading,
}: {
  markets: MarketAnalytics['markets'];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No market data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {markets.slice(0, 5).map((market) => (
        <div
          key={market.id}
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">{market.name}</p>
              <p className="text-xs text-muted-foreground">
                {market.zip_code} · {market.properties} properties
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${(market.avg_price / 1000).toFixed(0)}k</p>
            <div className="flex items-center gap-1 text-xs">
              {market.price_trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={market.price_trend >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {market.price_trend >= 0 ? '+' : ''}
                {market.price_trend}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Opportunities List Component
function OpportunitiesList({
  opportunities,
  isLoading,
}: {
  opportunities: MarketAnalytics['opportunities'];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Target className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No opportunities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {opportunities.slice(0, 5).map((opp) => (
        <div key={opp.zip_code} className="p-3 rounded-lg border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{opp.area}</span>
              <span className="text-xs text-muted-foreground">({opp.zip_code})</span>
            </div>
            <div
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                opp.score >= 80
                  ? 'bg-[var(--fluid-success-light)] text-[var(--fluid-success)]'
                  : opp.score >= 60
                    ? 'bg-[var(--fluid-warning-light)] text-[var(--fluid-warning)]'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {opp.score}/100
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{opp.reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {opp.properties} properties available
          </p>
        </div>
      ))}
    </div>
  );
}

// Price Distribution Component
function PriceDistribution({
  distribution,
  isLoading,
}: {
  distribution: MarketAnalytics['price_distribution'];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-6 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (distribution.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No price data available</p>
      </div>
    );
  }

  const maxPercentage = Math.max(...distribution.map((d) => d.percentage));

  return (
    <div className="space-y-3">
      {distribution.map((item) => (
        <div key={item.range} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.range}</span>
            <span className="font-medium">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
