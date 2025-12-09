'use client';

/**
 * VelocityDetailPanel Component
 * Displays detailed velocity information for a selected zip code
 */

import { X, Clock, Home, TrendingUp, Hammer, DollarSign } from 'lucide-react';
import type { MarketVelocityIndex } from '@/types/velocity';
import { VELOCITY_COLOR_SCALE } from '@/types/velocity';
import { cn } from '@/lib/utils';

interface VelocityDetailPanelProps {
  data: MarketVelocityIndex;
  onClose: () => void;
}

/**
 * Get the background color class for a classification
 */
function getClassificationBgColor(classification: string): string {
  const colors: Record<string, string> = {
    'On Fire': 'bg-[var(--fluid-danger)]',
    Hot: 'bg-orange-500',
    Warm: 'bg-amber-500',
    Balanced: 'bg-[var(--fluid-warning)]',
    Cool: 'bg-[var(--fluid-success)]',
    Cold: 'bg-[var(--fluid-primary)]',
  };
  return colors[classification] || 'bg-muted';
}

/**
 * Get the implication text and emoji based on classification
 */
function getImplication(classification: string): { emoji: string; text: string } {
  switch (classification) {
    case 'On Fire':
    case 'Hot':
      return {
        emoji: '\u2705', // checkmark
        text: 'Good for wholesaling - confident assignment potential',
      };
    case 'Warm':
      return {
        emoji: '\uD83D\uDCCA', // chart
        text: 'Decent market - normal assignment timeline expected',
      };
    case 'Balanced':
      return {
        emoji: '\uD83D\uDCCA', // chart
        text: 'Moderate market - standard due diligence recommended',
      };
    case 'Cool':
    case 'Cold':
      return {
        emoji: '\u26A0\uFE0F', // warning
        text: 'Higher risk - longer assignment timeline expected',
      };
    default:
      return {
        emoji: '\uD83D\uDCCA', // chart
        text: 'Standard due diligence recommended',
      };
  }
}

export function VelocityDetailPanel({ data, onClose }: VelocityDetailPanelProps) {
  const implication = getImplication(data.classification);

  return (
    <div className="absolute right-4 top-4 w-80 glass-high rounded-xl shadow-xl border border-white/20 overflow-hidden z-10">
      {/* Header */}
      <div className={cn('p-4 text-white', getClassificationBgColor(data.classification))}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{data.zipCode}</h3>
            <p className="text-sm opacity-90">
              {data.city ? `${data.city}, ${data.state}` : data.classification}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.velocityIndex}</div>
            <div className="text-xs opacity-75">Velocity Index</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-4">
        {/* Days on Market */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Days on Market</span>
          </div>
          <span className="font-semibold">{data.avgDaysOnMarket} days</span>
        </div>

        {/* Months of Inventory */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Months of Inventory</span>
          </div>
          <span className="font-semibold">{data.monthsOfInventory.toFixed(1)}</span>
        </div>

        {/* Absorption Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Absorption Rate</span>
          </div>
          <span className="font-semibold">{Math.round(data.absorptionRate * 100)}%</span>
        </div>

        {/* Permit Activity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Recent Permits</span>
          </div>
          <span className="font-semibold">{data.permitVolume}</span>
        </div>

        {/* Permit Value */}
        {data.permitValueTotal > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Permit Value</span>
            </div>
            <span className="font-semibold">${(data.permitValueTotal / 1000000).toFixed(1)}M</span>
          </div>
        )}

        {/* Component Scores */}
        <div className="border-t border-white/10 pt-3 mt-3">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Score Breakdown
          </p>
          <div className="space-y-2">
            {[
              { label: 'DOM Score', score: data.daysOnMarketScore, weight: 40 },
              { label: 'Absorption', score: data.absorptionScore, weight: 25 },
              { label: 'Inventory', score: data.inventoryScore, weight: 10 },
              { label: 'Permit Activity', score: data.permitActivityScore, weight: 15 },
              { label: 'Investment', score: data.investmentConvictionScore, weight: 10 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-24 text-xs text-muted-foreground">{item.label}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--fluid-primary)] rounded-full"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <div className="w-8 text-xs text-right text-muted-foreground">
                  {Math.round(item.score)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend indicator */}
        {data.velocityTrend && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Trend</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  data.velocityTrend === 'Rising' && 'text-[var(--fluid-success)]',
                  data.velocityTrend === 'Falling' && 'text-[var(--fluid-danger)]',
                  data.velocityTrend === 'Stable' && 'text-muted-foreground'
                )}
              >
                {data.velocityTrend}
                {data.velocityChange !== undefined && data.velocityChange !== 0 && (
                  <span className="ml-1">
                    ({data.velocityChange > 0 ? '+' : ''}
                    {data.velocityChange})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          {implication.emoji} {implication.text}
        </p>
      </div>
    </div>
  );
}

// Also export the color scale for use elsewhere
export { VELOCITY_COLOR_SCALE };
