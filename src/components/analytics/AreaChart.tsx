'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CustomGlassTooltip } from './CustomGlassTooltip';

interface AreaDataPoint {
  date: string;
  [key: string]: string | number;
}

interface AreaConfig {
  dataKey: string;
  name: string;
  color: string;
  fillOpacity?: number;
  stackId?: string;
}

interface AreaChartProps {
  data: AreaDataPoint[];
  areas: AreaConfig[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  gradient?: boolean;
}

export function AreaChart({
  data,
  areas,
  height = 300,
  showLegend = true,
  showGrid = true,
  formatValue = (v) => v.toLocaleString(),
  gradient = true,
}: AreaChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="area-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsAreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {gradient && (
            <defs>
              {areas.map((area) => (
                <linearGradient
                  key={`gradient-${area.dataKey}`}
                  id={`gradient-${area.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
          )}
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          <XAxis dataKey="displayDate" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={formatValue} />
          <Tooltip
            content={<CustomGlassTooltip />}
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          {showLegend && <Legend />}
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              fill={gradient ? `url(#gradient-${area.dataKey})` : area.color}
              fillOpacity={area.fillOpacity ?? 0.3}
              strokeWidth={2}
              stackId={area.stackId}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset for cumulative revenue
export function CumulativeRevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <AreaChart
      data={data}
      areas={[{ dataKey: 'revenue', name: 'Revenue', color: 'var(--color-success)' }]}
      formatValue={(v) => `$${v.toLocaleString()}`}
    />
  );
}

// Preset for stacked area chart
export function StackedAreaChart({
  data,
  categories,
}: {
  data: AreaDataPoint[];
  categories: { key: string; name: string; color: string }[];
}) {
  return (
    <AreaChart
      data={data}
      areas={categories.map((cat) => ({
        dataKey: cat.key,
        name: cat.name,
        color: cat.color,
        stackId: 'stack',
      }))}
    />
  );
}

// Preset for activity over time
export function ActivityAreaChart({
  data,
}: {
  data: { date: string; searches: number; views: number; saves: number }[];
}) {
  return (
    <AreaChart
      data={data}
      areas={[
        { dataKey: 'searches', name: 'Searches', color: 'var(--color-primary)', stackId: 'stack' },
        { dataKey: 'views', name: 'Views', color: 'var(--color-info)', stackId: 'stack' },
        { dataKey: 'saves', name: 'Saves', color: 'var(--color-success)', stackId: 'stack' },
      ]}
    />
  );
}
