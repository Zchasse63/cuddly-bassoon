'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealStage, DEAL_STAGES, getActiveStages } from '@/lib/deals';
import { TrendingUp, DollarSign, Clock, Target, BarChart3, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineStatsProps {
  stats: {
    totalDeals: number;
    activeDeals: number;
    dealsByStage: Record<DealStage, number>;
    totalPipelineValue: number;
    closedValue: number;
    avgDaysToClose: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export function PipelineStats({ stats }: PipelineStatsProps) {
  const conversionRate =
    stats.totalDeals > 0 ? ((stats.dealsByStage.closed / stats.totalDeals) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeals}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalDeals} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground">in active pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.closedValue)}</div>
            <p className="text-xs text-muted-foreground">total closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Close</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDaysToClose}</div>
            <p className="text-xs text-muted-foreground">days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Deals by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getActiveStages().map((stage) => {
              const count = stats.dealsByStage[stage] || 0;
              const percentage = stats.activeDeals > 0 ? (count / stats.activeDeals) * 100 : 0;
              const config = DEAL_STAGES[stage];

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', config.color)} />
                      <span>{config.label}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', config.color)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Conversion Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Close Rate</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.dealsByStage.closed}</div>
              <p className="text-xs text-muted-foreground">Closed Won</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.dealsByStage.lost}</div>
              <p className="text-xs text-muted-foreground">Lost</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Compact stats for headers
export function PipelineStatsCompact({ stats }: PipelineStatsProps) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <span className="text-muted-foreground">Active:</span>{' '}
        <span className="font-medium">{stats.activeDeals}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Pipeline:</span>{' '}
        <span className="font-medium">{formatCurrency(stats.totalPipelineValue)}</span>
      </div>
      <div>
        <span className="text-muted-foreground">Closed:</span>{' '}
        <span className="font-medium text-green-600">{formatCurrency(stats.closedValue)}</span>
      </div>
    </div>
  );
}
