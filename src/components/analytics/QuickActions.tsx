'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Plus, Search, Users, BarChart3, LucideIcon } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'ai';
}

interface QuickActionsProps {
  actions?: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const defaultActions: QuickAction[] = [
  {
    id: 'new-deal',
    label: 'New Deal',
    description: 'Create a new deal',
    icon: Plus,
    href: '/deals/new',
    variant: 'primary',
  },
  {
    id: 'search-properties',
    label: 'Search Properties',
    description: 'Find investment properties',
    icon: Search,
    href: '/properties',
  },
  {
    id: 'view-buyers',
    label: 'View Buyers',
    description: 'Manage your buyer network',
    icon: Users,
    href: '/buyers',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'View performance metrics',
    icon: BarChart3,
    href: '/analytics',
  },
];

export function QuickActions({
  actions = defaultActions,
  columns = 4,
  className,
}: QuickActionsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns], className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const content = (
          <div
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-lg border transition-all text-center',
              'hover:shadow-md hover:-translate-y-0.5',
              action.variant === 'primary' &&
                'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10',
              action.variant === 'ai' &&
                'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 hover:border-purple-400',
              action.variant === 'default' || !action.variant
                ? 'border-border hover:border-primary/30'
                : ''
            )}
          >
            <div
              className={cn(
                'p-2 rounded-lg mb-2',
                action.variant === 'primary' && 'bg-primary/10 text-primary',
                action.variant === 'ai' &&
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                (!action.variant || action.variant === 'default') &&
                  'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
            {action.description && (
              <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {action.description}
              </span>
            )}
          </div>
        );

        if (action.href) {
          return (
            <Link key={action.id} href={action.href} className="block">
              {content}
            </Link>
          );
        }

        return (
          <button key={action.id} onClick={action.onClick} className="block w-full text-left">
            {content}
          </button>
        );
      })}
    </div>
  );
}

export function QuickActionsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 rounded-lg border border-border"
        >
          <div className="w-9 h-9 rounded-lg bg-muted animate-pulse mb-2" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse mt-1" />
        </div>
      ))}
    </div>
  );
}
