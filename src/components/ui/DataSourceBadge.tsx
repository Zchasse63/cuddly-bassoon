'use client';

import { cn } from '@/lib/utils';

type DataSource = 'rentcast' | 'shovels' | 'combined';

interface DataSourceBadgeProps {
  source: DataSource;
  showLabel?: boolean;
  className?: string;
}

const SOURCE_CONFIG = {
  rentcast: {
    label: 'RentCast',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: '🏠',
  },
  shovels: {
    label: 'Shovels',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    icon: '🔨',
  },
  combined: {
    label: 'Combined',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    icon: '🔗',
  },
};

/**
 * DataSourceBadge - Shows the data source for a filter or property data
 * Only visible in development/testing when NEXT_PUBLIC_SHOW_DATA_SOURCE_LABELS is true
 */
export function DataSourceBadge({ source, showLabel = true, className }: DataSourceBadgeProps) {
  // Only show in development/testing
  if (process.env.NEXT_PUBLIC_SHOW_DATA_SOURCE_LABELS !== 'true') {
    return null;
  }

  const config = SOURCE_CONFIG[source];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
        config.color,
        className
      )}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

