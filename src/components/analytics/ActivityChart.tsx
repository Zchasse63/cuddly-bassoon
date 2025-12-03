'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ActivityDataPoint {
  date: string;
  searches: number;
  views: number;
  saves: number;
  analyses: number;
}

interface ActivityChartProps {
  data: ActivityDataPoint[];
  height?: number;
  showLegend?: boolean;
}

export function ActivityChart({ data, height = 300, showLegend = true }: ActivityChartProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="activity-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSaves" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="displayDate" stroke="var(--color-text-muted)" fontSize={12} />
          <YAxis stroke="var(--color-text-muted)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
            labelStyle={{ color: 'var(--color-text)' }}
          />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="searches"
            name="Searches"
            stroke="var(--color-primary)"
            fillOpacity={1}
            fill="url(#colorSearches)"
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Views"
            stroke="var(--color-success)"
            fillOpacity={1}
            fill="url(#colorViews)"
          />
          <Area
            type="monotone"
            dataKey="saves"
            name="Saves"
            stroke="var(--color-warning)"
            fillOpacity={1}
            fill="url(#colorSaves)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
