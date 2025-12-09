'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';

interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

interface PieChartProps {
  data: PieDataPoint[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  formatValue?: (value: number) => string;
  colors?: string[];
}

const renderLabel = (props: PieLabelRenderProps): string => {
  const name = String(props.name ?? '');
  const percent = typeof props.percent === 'number' ? props.percent : 0;
  return `${name} ${(percent * 100).toFixed(0)}%`;
};

const DEFAULT_COLORS = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-info)',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
];

export function PieChart({
  data,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  formatValue = (v) => v.toLocaleString(),
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  return (
    <div className="pie-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsPieChart>
          {}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-md)',
            }}
            formatter={(value: number) => [formatValue(value), '']}
          />
          {showLegend && <Legend layout="horizontal" verticalAlign="bottom" align="center" />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Donut chart preset
export function DonutChart({
  data,
  height = 300,
  showLegend = true,
  formatValue,
}: {
  data: PieDataPoint[];
  height?: number;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
}) {
  return (
    <PieChart
      data={data}
      height={height}
      showLegend={showLegend}
      innerRadius={50}
      outerRadius={80}
      formatValue={formatValue}
    />
  );
}

// Deal status distribution preset
export function DealStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const statusColors: Record<string, string> = {
    Active: 'var(--color-primary)',
    Closed: 'var(--color-success)',
    Lost: 'var(--color-error)',
    Pending: 'var(--color-warning)',
  };

  const coloredData = data.map((item) => ({
    ...item,
    color: statusColors[item.name] || DEFAULT_COLORS[0],
  }));

  return <DonutChart data={coloredData} />;
}

// Buyer tier distribution preset
export function BuyerTierChart({ data }: { data: { tier: string; count: number }[] }) {
  const tierColors: Record<string, string> = {
    A: '#f59e0b',
    B: '#6b7280',
    C: '#ea580c',
  };

  const chartData = data.map((item) => ({
    name: `Tier ${item.tier}`,
    value: item.count,
    color: tierColors[item.tier] || DEFAULT_COLORS[0],
  }));

  return <DonutChart data={chartData} />;
}
