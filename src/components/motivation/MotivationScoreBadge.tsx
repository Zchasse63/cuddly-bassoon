'use client';

/**
 * Motivation Score Badge Component
 *
 * Displays the seller motivation score as a compact badge with visual indicators.
 * Used on property cards and list views.
 */

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

interface MotivationScoreBadgeProps {
  score: number;
  confidence?: number;
  ownerType?: 'individual' | 'investor_entity' | 'institutional_distressed';
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'standard' | 'dealflow_iq';
  className?: string;
}

function getScoreLevel(score: number): {
  level: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80) {
    return {
      level: 'very-high',
      label: 'Very High',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    };
  }
  if (score >= 65) {
    return {
      level: 'high',
      label: 'High',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    };
  }
  if (score >= 50) {
    return {
      level: 'moderate',
      label: 'Moderate',
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    };
  }
  if (score >= 35) {
    return {
      level: 'low',
      label: 'Low',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800',
    };
  }
  return {
    level: 'very-low',
    label: 'Very Low',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
  };
}

function getOwnerTypeLabel(ownerType?: string): string {
  switch (ownerType) {
    case 'individual':
      return 'Individual Owner';
    case 'investor_entity':
      return 'Investor/Entity';
    case 'institutional_distressed':
      return 'Institutional';
    default:
      return 'Unknown';
  }
}

export function MotivationScoreBadge({
  score,
  confidence,
  ownerType,
  showTooltip = true,
  size = 'md',
  variant = 'standard',
  className,
}: MotivationScoreBadgeProps) {
  const { level, label, color, bgColor } = getScoreLevel(score);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const TrendIcon = score >= 65 ? TrendingUp : score <= 35 ? TrendingDown : Minus;

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        bgColor,
        color,
        sizeClasses[size],
        className
      )}
    >
      {variant === 'dealflow_iq' && (
        <Zap className={cn(iconSizes[size], 'text-brand-500')} />
      )}
      <span className="font-bold">{Math.round(score)}</span>
      <TrendIcon className={iconSizes[size]} />
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium">
              {variant === 'dealflow_iq' ? 'DealFlow IQ™' : 'Motivation Score'}: {label}
            </div>
            {ownerType && (
              <div className="text-xs text-muted-foreground">
                Owner Type: {getOwnerTypeLabel(ownerType)}
              </div>
            )}
            {confidence !== undefined && (
              <div className="text-xs text-muted-foreground">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {score >= 65
                ? 'Good candidate for outreach'
                : score >= 50
                  ? 'May require more investigation'
                  : 'Lower priority, monitor for changes'}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
