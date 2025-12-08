'use client';

/**
 * VelocityLayerToggle Component
 * Control for enabling/disabling and adjusting the velocity heat map layer
 */

import { useState } from 'react';
import { Flame, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { VELOCITY_COLOR_SCALE } from '@/types/velocity';

interface VelocityLayerToggleProps {
  enabled: boolean;
  opacity: number;
  onToggle: (enabled: boolean) => void;
  onOpacityChange: (opacity: number) => void;
}

export function VelocityLayerToggle({
  enabled,
  opacity,
  onToggle,
  onOpacityChange,
}: VelocityLayerToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
            aria-label="Market Velocity settings"
          >
            <Flame
              className={cn(
                'h-5 w-5 transition-colors',
                enabled ? 'text-[var(--fluid-warning)]' : 'text-muted-foreground'
              )}
            />
            <span className="text-sm font-medium">Market Velocity</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show Layer</span>
              <Switch checked={enabled} onCheckedChange={onToggle} />
            </div>

            {/* Opacity Slider */}
            {enabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Opacity</span>
                  <span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span>
                </div>
                <Slider
                  value={[opacity * 100]}
                  min={10}
                  max={100}
                  step={10}
                  onValueChange={([v]) => onOpacityChange((v ?? 60) / 100)}
                  className="w-full"
                />
              </div>
            )}

            {/* Legend */}
            <div className="border-t pt-3">
              <span className="text-xs font-medium text-muted-foreground uppercase">Legend</span>
              <p className="text-xs text-muted-foreground/70 mt-0.5 mb-2">
                Higher = Faster Sales, Easier Assignments
              </p>
              <div className="space-y-1.5">
                {VELOCITY_COLOR_SCALE.slice()
                  .reverse()
                  .map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-foreground">
                        {item.label} ({item.threshold}
                        {item.threshold === 85 ? '+' : `-${getNextThreshold(item.threshold)}`})
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Info */}
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Market velocity measures buyer demand intensity. Hot markets (red/orange) mean
                faster contract assignments for wholesalers.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Helper to get the next threshold for range display
 */
function getNextThreshold(threshold: number): number {
  const thresholds = [0, 25, 40, 55, 70, 85, 100];
  const idx = thresholds.indexOf(threshold);
  return idx < thresholds.length - 1 ? thresholds[idx + 1]! - 1 : 100;
}

/**
 * Compact version for toolbar integration
 */
export function VelocityLayerButton({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        enabled
          ? 'bg-[var(--fluid-warning)]/10 text-[var(--fluid-warning)] hover:bg-[var(--fluid-warning)]/20'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
      title={enabled ? 'Hide Market Velocity layer' : 'Show Market Velocity layer'}
    >
      <Flame className={cn('h-4 w-4', enabled ? 'text-[var(--fluid-warning)]' : 'text-muted-foreground')} />
      Velocity
    </button>
  );
}
