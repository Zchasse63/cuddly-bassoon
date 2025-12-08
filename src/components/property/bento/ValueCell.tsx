'use client';

/**
 * ValueCell - The Spread (Profit Calculation)
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Most Important Cell - Large green text showing Estimated Profit
 * Formula: ARV - (Ask + Repairs)
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Percent, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ValueCellProps } from './types';

export const ValueCell = memo(function ValueCell({ property, className, arv, repairCost = 0 }: ValueCellProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate estimated profit - use database ARV if available
  const estimatedValue = property.estimatedValue || 0;
  const arvValue = arv || property.arv || estimatedValue * 1.15; // Use prop, then DB field, then estimate
  const askingPrice = property.askingPrice || property.lastSalePrice || estimatedValue * 0.7;
  const estimatedProfit = arvValue - (askingPrice + repairCost);
  const profitMargin = arvValue > 0 ? (estimatedProfit / arvValue) * 100 : 0;
  
  const isProfitable = estimatedProfit > 0;
  const equityPercent = property.equityPercent || 0;

  return (
    <motion.div
      layout
      className={cn('bento-cell bento-value', className)}
    >
      {/* Main Profit Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[var(--fluid-text-secondary)]">
            Est. Profit
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-[var(--fluid-text-tertiary)]" />
              </TooltipTrigger>
              <TooltipContent className="glass-card">
                <p className="text-sm">ARV - (Ask + Repairs)</p>
                <p className="text-xs text-[var(--fluid-text-secondary)] mt-1">
                  {formatCurrency(arvValue)} - ({formatCurrency(askingPrice)} + {formatCurrency(repairCost)})
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-baseline gap-2">
          <span 
            className={cn(
              "profit-amount",
              isProfitable ? "text-[var(--fluid-success)]" : "text-[var(--fluid-danger)]"
            )}
          >
            {formatCurrency(Math.abs(estimatedProfit))}
          </span>
          {isProfitable ? (
            <TrendingUp className="h-5 w-5 text-[var(--fluid-success)]" />
          ) : (
            <TrendingDown className="h-5 w-5 text-[var(--fluid-danger)]" />
          )}
        </div>
        <span className="text-sm text-[var(--fluid-text-secondary)]">
          {profitMargin.toFixed(1)}% margin
        </span>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-highlight)]">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-[var(--fluid-text-secondary)] mb-0.5">
            <DollarSign className="h-3.5 w-3.5" />
            Est. Value
          </div>
          <span className="font-semibold">{formatCurrency(estimatedValue)}</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-sm text-[var(--fluid-text-secondary)] mb-0.5">
            <Percent className="h-3.5 w-3.5" />
            Equity
          </div>
          <span 
            className={cn(
              "font-semibold",
              equityPercent >= 50 && "text-[var(--fluid-success)]",
              equityPercent >= 20 && equityPercent < 50 && "text-[var(--fluid-warning)]",
              equityPercent < 20 && "text-[var(--fluid-danger)]"
            )}
          >
            {equityPercent.toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
});

