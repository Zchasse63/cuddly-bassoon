'use client';

import { cn } from '@/lib/utils';

// Recharts tooltip payload entry type
interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
}

interface CustomGlassTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

export function CustomGlassTooltip({ active, payload, label }: CustomGlassTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div
        className={cn(
          'glass-card p-3 min-w-[150px] shadow-xl border-border/20 backdrop-blur-xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <p className="text-sm font-semibold mb-2 border-b border-border/10 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono font-medium">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}
