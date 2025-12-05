'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * KPI Card Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 7
 * Based on Horizon UI's Mini Statistics Card
 */

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  change,
  subtitle,
  icon: Icon,
  className,
  onClick,
}: KPICardProps) {
  const isPositive = change ? change.value >= 0 : undefined;
  const isClickable = Boolean(onClick);

  return (
    <div
      className={cn('kpi-card', isClickable && 'cursor-pointer', className)}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="kpi-card__header">
        <span className="kpi-card__title">{title}</span>
        {Icon && (
          <div className="kpi-card__icon">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="kpi-card__value">{value}</div>
      {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
      {change && (
        <div
          className={cn(
            'kpi-card__change',
            isPositive ? 'kpi-card__change--positive' : 'kpi-card__change--negative'
          )}
        >
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>
            {isPositive ? '+' : ''}
            {change.value}%{change.label && ` ${change.label}`}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * KPI Card Grid - Container for multiple KPI cards
 */
interface KPICardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPICardGrid({ children, columns = 4, className }: KPICardGridProps) {
  const colClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid gap-4', colClasses[columns], className)}>{children}</div>;
}
