'use client';

import { useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendChart } from '@/components/analytics';
import {
  XCircle,
  DollarSign,
  TrendingDown,
  Users,
  AlertTriangle,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

type DateRange = 30 | 90 | 180 | 365;
type GroupBy = 'reason' | 'stage' | 'month' | 'buyer_type';

interface LossPipelineAnalytics {
  summary: {
    total_lost: number;
    lost_from_pipeline: number;
    missed_entirely: number;
    total_value_lost: number;
    avg_price_gap: number;
    potential_fees_lost: number;
    conversion_rate: number;
  };
  by_reason: Array<{
    reason: string;
    count: number;
    percentage: number;
    total_value: number;
  }>;
  by_stage: Array<{
    stage: string;
    count: number;
    percentage: number;
    total_value: number;
  }>;
  by_buyer_type: Array<{
    buyer_type: string;
    count: number;
    percentage: number;
    total_value: number;
  }>;
  trends: Array<{
    date: string;
    lost_count: number;
    value_lost: number;
    from_pipeline: number;
    missed: number;
  }>;
  recent_losses: Array<{
    id: string;
    address: string;
    sale_date: string;
    sale_price: number | null;
    our_offer: number | null;
    price_gap: number | null;
    lost_reason: string | null;
    was_in_pipeline: boolean;
    buyer_type: string | null;
  }>;
  insights: string[];
}

async function fetchLossPipelineAnalytics(days: number): Promise<LossPipelineAnalytics> {
  const response = await fetch(`/api/analytics/loss-pipeline?days=${days}`);
  if (!response.ok) {
    // Return mock data if API not ready
    return {
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
      insights: ['Start tracking property sales to see loss analytics'],
    };
  }
  return response.json();
}

export default function LossPipelineAnalyticsPage() {
  // Note: Using 'analytics' as ViewType until 'analytics-loss-pipeline' is added
  usePageContext('analytics');
  const [dateRange, setDateRange] = useState<DateRange>(90);
  const [activeTab, setActiveTab] = useState<GroupBy>('reason');

  const { data, isLoading } = useQuery({
    queryKey: ['loss-pipeline-analytics', dateRange],
    queryFn: () => fetchLossPipelineAnalytics(dateRange),
    staleTime: 1000 * 60 * 5,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="page-title">Loss Pipeline Analytics</h1>
            <p className="page-description">
              Understand why deals were lost and how to improve conversion
            </p>
          </div>
        </div>
        <div className="page-header__actions">
          {([30, 90, 180, 365] as DateRange[]).map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days === 30 ? '30D' : days === 90 ? '90D' : days === 180 ? '6M' : '1Y'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <KPICardGrid columns={4}>
        <KPICard
          title="Total Properties Lost"
          value={isLoading ? '...' : (data?.summary.total_lost || 0).toString()}
          icon={XCircle}
          subtitle={`${data?.summary.lost_from_pipeline || 0} from pipeline`}
        />
        <KPICard
          title="Value Lost to Market"
          value={isLoading ? '...' : formatCurrency(data?.summary.total_value_lost || 0)}
          icon={DollarSign}
          subtitle="Total sale prices"
        />
        <KPICard
          title="Potential Fees Lost"
          value={isLoading ? '...' : formatCurrency(data?.summary.potential_fees_lost || 0)}
          icon={TrendingDown}
          subtitle="Est. 10% assignment"
        />
        <KPICard
          title="Avg Price Gap"
          value={
            isLoading
              ? '...'
              : data?.summary.avg_price_gap
                ? formatCurrency(Math.abs(data.summary.avg_price_gap))
                : 'N/A'
          }
          icon={AlertTriangle}
          subtitle={
            data?.summary.avg_price_gap && data.summary.avg_price_gap > 0
              ? 'Below winning offers'
              : 'Above winning offers'
          }
        />
      </KPICardGrid>

      {/* AI Insights */}
      {data?.insights && data.insights.length > 0 && (
        <Card className="mt-6 border-[var(--fluid-warning)]/30 bg-[var(--fluid-warning)]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-[var(--fluid-warning)]" />
              Scout Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--fluid-warning)] font-bold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Loss Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Breakdown by Category */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Loss Breakdown</CardTitle>
                <CardDescription>Analyze losses by different dimensions</CardDescription>
              </div>
              <div className="flex gap-1">
                {(['reason', 'stage', 'buyer_type'] as GroupBy[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'reason' ? 'Reason' : tab === 'stage' ? 'Stage' : 'Buyer'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BreakdownChart
              data={
                activeTab === 'reason'
                  ? data?.by_reason || []
                  : activeTab === 'stage'
                    ? data?.by_stage || []
                    : data?.by_buyer_type || []
              }
              isLoading={isLoading}
              valueFormatter={formatCurrency}
            />
          </CardContent>
        </Card>

        {/* Loss Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Loss Trend</CardTitle>
            <CardDescription>Properties lost over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.trends || []}
              lines={[
                { dataKey: 'lost_count', name: 'Total Lost', color: 'var(--color-danger)' },
                {
                  dataKey: 'from_pipeline',
                  name: 'From Pipeline',
                  color: 'var(--color-warning)',
                },
              ]}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pipeline vs Missed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Pipeline vs Missed</CardTitle>
            <CardDescription>Where losses are happening</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineVsMissedChart
              fromPipeline={data?.summary.lost_from_pipeline || 0}
              missed={data?.summary.missed_entirely || 0}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Recent Losses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Losses</CardTitle>
            <CardDescription>Properties that sold recently</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentLossesTable
              losses={data?.recent_losses || []}
              isLoading={isLoading}
              formatCurrency={formatCurrency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Breakdown Chart Component
function BreakdownChart({
  data,
  isLoading,
  valueFormatter,
}: {
  data: Array<{
    reason?: string;
    stage?: string;
    buyer_type?: string;
    count: number;
    percentage: number;
    total_value: number;
  }>;
  isLoading: boolean;
  valueFormatter: (v: number) => string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <XCircle className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No loss data available</p>
        <p className="text-xs text-muted-foreground mt-1">
          Mark properties as sold to track losses
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      {data.slice(0, 6).map((item) => {
        const label = item.reason || item.stage || item.buyer_type || 'Unknown';
        return (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium truncate max-w-[200px]">{label}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{valueFormatter(item.total_value)}</span>
                <Badge variant="secondary" className="font-mono">
                  {item.count}
                </Badge>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Pipeline vs Missed Chart
function PipelineVsMissedChart({
  fromPipeline,
  missed,
  isLoading,
}: {
  fromPipeline: number;
  missed: number;
  isLoading: boolean;
}) {
  const total = fromPipeline + missed;
  const pipelinePercent = total > 0 ? Math.round((fromPipeline / total) * 100) : 0;
  const missedPercent = total > 0 ? 100 - pipelinePercent : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No loss data yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Simple visual representation */}
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-muted"
          />
          {/* Pipeline segment */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth="20"
            strokeDasharray={`${pipelinePercent * 2.51} 251`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[var(--color-warning)]" />
          <div className="text-sm">
            <div className="font-medium">{fromPipeline} Pipeline</div>
            <div className="text-muted-foreground text-xs">{pipelinePercent}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-muted" />
          <div className="text-sm">
            <div className="font-medium">{missed} Missed</div>
            <div className="text-muted-foreground text-xs">{missedPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent Losses Table
function RecentLossesTable({
  losses,
  isLoading,
  formatCurrency,
}: {
  losses: LossPipelineAnalytics['recent_losses'];
  isLoading: boolean;
  formatCurrency: (v: number) => string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (losses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <XCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent losses recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {losses.map((loss) => (
        <div
          key={loss.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{loss.address}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{loss.sale_date}</span>
              {loss.was_in_pipeline && (
                <Badge variant="outline" className="text-xs">
                  Was in pipeline
                </Badge>
              )}
              {loss.lost_reason && (
                <Badge variant="secondary" className="text-xs">
                  {loss.lost_reason}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            {loss.sale_price && (
              <p className="font-semibold text-sm">{formatCurrency(loss.sale_price)}</p>
            )}
            {loss.price_gap !== null && (
              <p className={`text-xs ${loss.price_gap > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {loss.price_gap > 0 ? '+' : ''}
                {formatCurrency(loss.price_gap)} gap
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
