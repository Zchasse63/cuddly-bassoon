'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrendDataPoint {
  date: string;
  [key: string]: string | number;
}

interface TrendLine {
  dataKey: string;
  name: string;
  color: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  lines: TrendLine[];
  height?: number;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}

export function TrendChart({
  data,
  lines,
  height = 300,
  showLegend = true,
  formatValue = (v) => v.toLocaleString(),
}: TrendChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="trend-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="displayDate" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={formatValue} />
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
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Preset for revenue trend
export function RevenueTrendChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <TrendChart
      data={data}
      lines={[{ dataKey: 'revenue', name: 'Revenue', color: 'var(--color-success)' }]}
      formatValue={(v) => `$${v.toLocaleString()}`}
    />
  );
}

// Preset for deals trend
export function DealsTrendChart({
  data,
}: {
  data: { date: string; closed: number; lost: number }[];
}) {
  return (
    <TrendChart
      data={data}
      lines={[
        { dataKey: 'closed', name: 'Closed', color: 'var(--color-success)' },
        { dataKey: 'lost', name: 'Lost', color: 'var(--color-error)' },
      ]}
    />
  );
}
