'use client';

import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';

interface WeeklyMetric {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
}

interface WeeklySnapshotProps {
  weekStart: Date;
  weekEnd: Date;
  metrics: WeeklyMetric[];
  highlights?: string[];
}

export function WeeklySnapshot({
  weekStart,
  weekEnd,
  metrics,
  highlights = [],
}: WeeklySnapshotProps) {
  const formatValue = (value: number, format: WeeklyMetric['format'] = 'number') => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const getChange = (current: number, previous?: number) => {
    if (previous === undefined || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
    };
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="weekly-snapshot">
      <div className="weekly-snapshot__header">
        <div className="weekly-snapshot__title">
          <Calendar className="w-5 h-5" />
          <span>Weekly Snapshot</span>
        </div>
        <span className="weekly-snapshot__date-range">{formatDateRange()}</span>
      </div>

      <div className="weekly-snapshot__metrics">
        {metrics.map((metric, index) => {
          const change = getChange(metric.value, metric.previousValue);
          return (
            <div key={index} className="weekly-snapshot__metric">
              <span className="weekly-snapshot__metric-label">{metric.label}</span>
              <div className="weekly-snapshot__metric-value">
                <span>{formatValue(metric.value, metric.format)}</span>
                {change && (
                  <span
                    className={`weekly-snapshot__change weekly-snapshot__change--${change.direction}`}
                  >
                    {change.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                    {change.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                    {change.direction === 'same' && <Minus className="w-4 h-4" />}
                    {change.value}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {highlights.length > 0 && (
        <div className="weekly-snapshot__highlights">
          <h4 className="weekly-snapshot__highlights-title">Highlights</h4>
          <ul className="weekly-snapshot__highlights-list">
            {highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .weekly-snapshot {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-5);
          border: 1px solid var(--color-border);
        }
        .weekly-snapshot__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-4);
        }
        .weekly-snapshot__title {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          font-size: var(--font-size-lg);
          font-weight: 600;
        }
        .weekly-snapshot__date-range {
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
        }
        .weekly-snapshot__metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-4);
        }
        .weekly-snapshot__metric {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-1);
        }
        .weekly-snapshot__metric-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
        }
        .weekly-snapshot__metric-value {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          font-size: var(--font-size-xl);
          font-weight: 600;
        }
        .weekly-snapshot__change {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: var(--font-size-sm);
          font-weight: 500;
        }
        .weekly-snapshot__change--up {
          color: var(--color-success);
        }
        .weekly-snapshot__change--down {
          color: var(--color-error);
        }
        .weekly-snapshot__change--same {
          color: var(--color-text-muted);
        }
        .weekly-snapshot__highlights {
          margin-top: var(--spacing-4);
          padding-top: var(--spacing-4);
          border-top: 1px solid var(--color-border);
        }
        .weekly-snapshot__highlights-title {
          font-size: var(--font-size-sm);
          font-weight: 600;
          margin-bottom: var(--spacing-2);
        }
        .weekly-snapshot__highlights-list {
          list-style: disc;
          padding-left: var(--spacing-4);
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
        }
        .weekly-snapshot__highlights-list li {
          margin-bottom: var(--spacing-1);
        }
      `}</style>
    </div>
  );
}
