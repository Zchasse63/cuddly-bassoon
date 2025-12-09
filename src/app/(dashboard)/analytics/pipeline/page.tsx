'use client';

import { useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { DealPipelineFunnel, TrendChart } from '@/components/analytics';
import { Briefcase, DollarSign, Clock, Target, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type DateRange = 7 | 30 | 90 | 365;

interface DealAnalytics {
  summary: {
    total_deals: number;
    active_deals: number;
    closed_deals: number;
    lost_deals: number;
    total_revenue: number;
    avg_assignment_fee: number;
    avg_days_to_close: number;
    conversion_rate: number;
  };
  pipeline: {
    leads: number;
    contacted: number;
    appointments: number;
    offers: number;
    contracts: number;
    closed: number;
  };
  velocity: {
    avg_lead_to_contact: number;
    avg_contact_to_offer: number;
    avg_offer_to_contract: number;
    avg_contract_to_close: number;
  };
  trends: Array<{
    date: string;
    deals_created: number;
    deals_closed: number;
    revenue: number;
  }>;
  lost_reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

async function fetchDealAnalytics(days: number): Promise<DealAnalytics> {
  const response = await fetch(`/api/analytics/deals?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch deal analytics');
  return response.json();
}

export default function PipelineAnalyticsPage() {
  usePageContext('analytics-pipeline');
  const [dateRange, setDateRange] = useState<DateRange>(30);

  const { data, isLoading } = useQuery({
    queryKey: ['deal-analytics', dateRange],
    queryFn: () => fetchDealAnalytics(dateRange),
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
            <h1 className="page-title">Pipeline Analytics</h1>
            <p className="page-description">Pipeline performance and revenue metrics</p>
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
          title="Total Deals"
          value={isLoading ? '...' : (data?.summary.total_deals || 0).toString()}
          icon={Briefcase}
          subtitle={`${data?.summary.active_deals || 0} active`}
        />
        <KPICard
          title="Deals Closed"
          value={isLoading ? '...' : (data?.summary.closed_deals || 0).toString()}
          icon={Target}
          change={
            data?.summary.conversion_rate
              ? { value: data.summary.conversion_rate, label: 'conversion' }
              : undefined
          }
        />
        <KPICard
          title="Total Revenue"
          value={isLoading ? '...' : `$${(data?.summary.total_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <KPICard
          title="Avg Days to Close"
          value={isLoading ? '...' : (data?.summary.avg_days_to_close || 0).toString()}
          icon={Clock}
          subtitle="days average"
        />
      </KPICardGrid>

      {/* Pipeline and Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Deal progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <DealPipelineFunnel
              data={
                data?.pipeline || {
                  leads: 0,
                  contacted: 0,
                  appointments: 0,
                  offers: 0,
                  contracts: 0,
                  closed: 0,
                }
              }
            />
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.trends || []}
              lines={[{ dataKey: 'revenue', name: 'Revenue', color: 'var(--color-success)' }]}
              formatValue={(v) => `$${v.toLocaleString()}`}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Velocity and Lost Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Deal Velocity */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Velocity</CardTitle>
            <CardDescription>Average days between stages</CardDescription>
          </CardHeader>
          <CardContent>
            <VelocityChart velocity={data?.velocity} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Lost Deal Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Lost Deal Analysis</CardTitle>
            <CardDescription>Reasons for lost deals</CardDescription>
          </CardHeader>
          <CardContent>
            <LostReasonsChart reasons={data?.lost_reasons || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Velocity Chart Component
function VelocityChart({
  velocity,
  isLoading,
}: {
  velocity?: DealAnalytics['velocity'];
  isLoading: boolean;
}) {
  const stages = [
    { label: 'Lead → Contact', value: velocity?.avg_lead_to_contact || 0 },
    { label: 'Contact → Offer', value: velocity?.avg_contact_to_offer || 0 },
    { label: 'Offer → Contract', value: velocity?.avg_offer_to_contract || 0 },
    { label: 'Contract → Close', value: velocity?.avg_contract_to_close || 0 },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((stage) => (
        <div key={stage.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{stage.label}</span>
            <span className="font-medium">{stage.value} days</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(stage.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Total Average</span>
          <span className="font-bold text-primary">
            {stages.reduce((sum, s) => sum + s.value, 0)} days
          </span>
        </div>
      </div>
    </div>
  );
}

// Lost Reasons Chart Component
function LostReasonsChart({
  reasons,
  isLoading,
}: {
  reasons: DealAnalytics['lost_reasons'];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-2 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reasons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <XCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No lost deals in this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reasons.map((reason) => (
        <div key={reason.reason} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-sm font-bold text-red-600 dark:text-red-400">{reason.count}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{reason.reason}</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${reason.percentage}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{reason.percentage}%</span>
        </div>
      ))}
    </div>
  );
}
