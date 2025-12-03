'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BarDataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  name: string;
  color: string;
  stackId?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  bars: BarConfig[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  layout?: 'horizontal' | 'vertical';
  formatValue?: (value: number) => string;
  barSize?: number;
}

export function BarChart({
  data,
  bars,
  height = 300,
  showLegend = true,
  showGrid = true,
  layout = 'horizontal',
  formatValue = (v) => v.toLocaleString(),
  barSize = 20,
}: BarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <div className="bar-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />}
          {isVertical ? (
            <>
              <XAxis
                type="number"
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickFormatter={formatValue}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--color-text-muted)"
                fontSize={12}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={formatValue} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
            labelStyle={{ color: 'var(--color-text)' }}
            formatter={(value: number) => [formatValue(value), '']}
          />
          {showLegend && <Legend />}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stackId}
              barSize={barSize}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset for revenue comparison
export function RevenueComparisonChart({
  data,
}: {
  data: { name: string; current: number; previous: number }[];
}) {
  return (
    <BarChart
      data={data}
      bars={[
        { dataKey: 'current', name: 'Current Period', color: 'var(--color-primary)' },
        { dataKey: 'previous', name: 'Previous Period', color: 'var(--color-muted)' },
      ]}
      formatValue={(v) => `$${v.toLocaleString()}`}
    />
  );
}

// Preset for stacked bar chart
export function StackedBarChart({
  data,
  categories,
}: {
  data: BarDataPoint[];
  categories: { key: string; name: string; color: string }[];
}) {
  return (
    <BarChart
      data={data}
      bars={categories.map((cat) => ({
        dataKey: cat.key,
        name: cat.name,
        color: cat.color,
        stackId: 'stack',
      }))}
    />
  );
}

// Preset for horizontal bar chart
export function HorizontalBarChart({
  data,
  dataKey = 'value',
  color = 'var(--color-primary)',
}: {
  data: { name: string; value: number }[];
  dataKey?: string;
  color?: string;
}) {
  return (
    <BarChart
      data={data}
      bars={[{ dataKey, name: 'Value', color }]}
      layout="vertical"
      showLegend={false}
    />
  );
}
