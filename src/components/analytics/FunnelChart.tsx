'use client';

import { useMemo } from 'react';

interface FunnelStage {
  name: string;
  value: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  height?: number;
  showPercentages?: boolean;
}

export function FunnelChart({ stages, height = 300, showPercentages = true }: FunnelChartProps) {
  const maxValue = useMemo(() => Math.max(...stages.map((s) => s.value), 1), [stages]);

  const defaultColors = [
    'var(--color-primary)',
    'var(--color-primary-light)',
    'var(--color-success)',
    'var(--color-success-light)',
    'var(--color-warning)',
    'var(--color-warning-light)',
  ];

  return (
    <div className="funnel-chart" style={{ height }}>
      <div className="funnel-chart__stages">
        {stages.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100;
          const prevStage = stages[index - 1];
          const conversionRate =
            index > 0 && prevStage && prevStage.value > 0
              ? ((stage.value / prevStage.value) * 100).toFixed(1)
              : null;

          return (
            <div key={stage.name} className="funnel-chart__stage">
              <div className="funnel-chart__stage-label">
                <span className="funnel-chart__stage-name">{stage.name}</span>
                <span className="funnel-chart__stage-value">{stage.value.toLocaleString()}</span>
              </div>
              <div className="funnel-chart__bar-container">
                <div
                  className="funnel-chart__bar"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: stage.color || defaultColors[index % defaultColors.length],
                  }}
                />
                {showPercentages && conversionRate && (
                  <span className="funnel-chart__conversion">{conversionRate}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        .funnel-chart {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .funnel-chart__stages {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }
        .funnel-chart__stage {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-1);
        }
        .funnel-chart__stage-label {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-sm);
        }
        .funnel-chart__stage-name {
          color: var(--color-text);
          font-weight: 500;
        }
        .funnel-chart__stage-value {
          color: var(--color-text-muted);
          font-variant-numeric: tabular-nums;
        }
        .funnel-chart__bar-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          height: 24px;
        }
        .funnel-chart__bar {
          height: 100%;
          border-radius: var(--radius-sm);
          transition: width 0.3s ease;
          min-width: 4px;
        }
        .funnel-chart__conversion {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

// Preset funnel for deal pipeline
export function DealPipelineFunnel({
  data,
}: {
  data: {
    leads: number;
    contacted: number;
    appointments: number;
    offers: number;
    contracts: number;
    closed: number;
  };
}) {
  const stages: FunnelStage[] = [
    { name: 'Leads', value: data.leads },
    { name: 'Contacted', value: data.contacted },
    { name: 'Appointments', value: data.appointments },
    { name: 'Offers Made', value: data.offers },
    { name: 'Under Contract', value: data.contracts },
    { name: 'Closed', value: data.closed },
  ];

  return <FunnelChart stages={stages} />;
}
