'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
}

interface PipelineSummaryProps {
  stages: PipelineStage[];
  totalValue?: number;
  showValue?: boolean;
  className?: string;
}

const defaultStages: PipelineStage[] = [
  { name: 'Lead', count: 0, value: 0, color: 'bg-blue-500' },
  { name: 'Contacted', count: 0, value: 0, color: 'bg-cyan-500' },
  { name: 'Offer', count: 0, value: 0, color: 'bg-amber-500' },
  { name: 'Contract', count: 0, value: 0, color: 'bg-purple-500' },
  { name: 'Closed', count: 0, value: 0, color: 'bg-emerald-500' },
];

export function PipelineSummary({
  stages = defaultStages,
  totalValue,
  showValue = true,
  className,
}: PipelineSummaryProps) {
  const totalDeals = useMemo(() => stages.reduce((sum, stage) => sum + stage.count, 0), [stages]);

  const calculatedTotalValue = useMemo(
    () => totalValue ?? stages.reduce((sum, stage) => sum + stage.value, 0),
    [stages, totalValue]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold">{totalDeals}</p>
            <p className="text-xs text-muted-foreground">Total Deals</p>
          </div>
          {showValue && (
            <div className="pl-4 border-l border-border">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${calculatedTotalValue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Pipeline Value</p>
            </div>
          )}
        </div>
        <Link
          href="/deals"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Pipeline Bar */}
      <div className="h-3 rounded-full bg-muted overflow-hidden flex">
        {stages.map((stage) => {
          const widthPercent = totalDeals > 0 ? (stage.count / totalDeals) * 100 : 0;
          if (widthPercent === 0) return null;
          return (
            <div
              key={stage.name}
              className={cn('h-full transition-all', stage.color)}
              style={{ width: `${widthPercent}%` }}
              title={`${stage.name}: ${stage.count} deals`}
            />
          );
        })}
      </div>

      {/* Stage Legend */}
      <div className="grid grid-cols-5 gap-2">
        {stages.map((stage) => (
          <div key={stage.name} className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className={cn('w-2 h-2 rounded-full', stage.color)} />
              <span className="text-xs text-muted-foreground">{stage.name}</span>
            </div>
            <p className="text-sm font-semibold">{stage.count}</p>
            {showValue && stage.value > 0 && (
              <p className="text-xs text-muted-foreground">${(stage.value / 1000).toFixed(0)}k</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PipelineSummarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="pl-4 border-l border-border space-y-1">
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="h-3 rounded-full bg-muted animate-pulse" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <div className="h-3 w-12 mx-auto bg-muted rounded animate-pulse" />
            <div className="h-5 w-8 mx-auto bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
