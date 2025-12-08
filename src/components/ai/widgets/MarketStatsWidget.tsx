'use client';

/**
 * Market Stats Widget
 *
 * Source: Fluid_OS_Master_Plan.md Phase 3.4
 *
 * Displays market metrics and statistics in AI chat responses.
 * Used when Scout provides market analysis or comparisons.
 */

import { TrendingUp, TrendingDown, Minus, BarChart3, Home, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GenUIWidget } from './GenUIWidget';

export interface MarketStat {
  label: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}

export interface MarketStatsWidgetData {
  title?: string;
  location?: string;
  stats: MarketStat[];
  period?: string; // e.g., "Last 30 days"
}

interface MarketStatsWidgetProps {
  data: MarketStatsWidgetData;
  onClose?: () => void;
  className?: string;
}

export function MarketStatsWidget({
  data,
  onClose,
  className,
}: MarketStatsWidgetProps) {
  return (
    <GenUIWidget
      title={data.title || 'Market Statistics'}
      icon={<BarChart3 className="h-4 w-4" />}
      onClose={onClose}
      variant="default"
      className={className}
    >
      {/* Location & Period Header */}
      {(data.location || data.period) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 pb-2 border-b border-border/50">
          {data.location && (
            <span className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              {data.location}
            </span>
          )}
          {data.period && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {data.period}
            </span>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {data.stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
    </GenUIWidget>
  );
}

function StatCard({ stat }: { stat: MarketStat }) {
  const getTrendIcon = () => {
    if (stat.trend === 'up') return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (stat.trend === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (stat.trend === 'up') return 'text-emerald-500';
    if (stat.trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const formatValue = () => {
    const val = typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value;
    return `${stat.prefix || ''}${val}${stat.suffix || ''}`;
  };

  return (
    <div className="p-2.5 rounded-lg bg-muted/50 space-y-1">
      <div className="text-xs text-muted-foreground truncate">{stat.label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold">{formatValue()}</span>
        {stat.change !== undefined && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', getTrendColor())}>
            {getTrendIcon()}
            {Math.abs(stat.change)}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Compact inline stat display
 */
export function InlineStat({
  label,
  value,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn('font-semibold', trend && trendColors[trend])}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
      {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
    </span>
  );
}

/**
 * Quick comparison between two values
 */
export function ComparisonStat({
  label,
  value1,
  label1,
  value2,
  label2,
  className,
}: {
  label: string;
  value1: string | number;
  label1: string;
  value2: string | number;
  label2: string;
  className?: string;
}) {
  return (
    <div className={cn('glass-subtle rounded-lg p-3', className)}>
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center justify-between gap-4">
        <div className="text-center flex-1">
          <div className="text-lg font-bold">
            {typeof value1 === 'number' ? value1.toLocaleString() : value1}
          </div>
          <div className="text-xs text-muted-foreground">{label1}</div>
        </div>
        <div className="text-muted-foreground text-xs">vs</div>
        <div className="text-center flex-1">
          <div className="text-lg font-bold">
            {typeof value2 === 'number' ? value2.toLocaleString() : value2}
          </div>
          <div className="text-xs text-muted-foreground">{label2}</div>
        </div>
      </div>
    </div>
  );
}
