'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

/**
 * Empty State Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 7.3
 * "Empty states: Clear guidance and relevant action suggestions"
 */

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && (
        <div className="empty-state__icon">
          <Icon className="h-10 w-10" />
        </div>
      )}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {action && (
            <Button onClick={action.onClick} className="btn-gradient">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Empty State for Lists - when a list/grid has no items
 */
interface ListEmptyStateProps {
  entityName: string;
  icon?: LucideIcon;
  onAdd?: () => void;
  addLabel?: string;
  className?: string;
}

export function ListEmptyState({
  entityName,
  icon: Icon,
  onAdd,
  addLabel,
  className,
}: ListEmptyStateProps) {
  return (
    <EmptyState
      icon={Icon}
      title={`No ${entityName} yet`}
      description={`Get started by adding your first ${entityName.toLowerCase().replace(/s$/, '')}.`}
      action={
        onAdd
          ? {
              label: addLabel || `Add ${entityName.replace(/s$/, '')}`,
              onClick: onAdd,
            }
          : undefined
      }
      className={className}
    />
  );
}

/**
 * Empty State for Search - when search returns no results
 */
interface SearchEmptyStateProps {
  query: string;
  onClear?: () => void;
  className?: string;
}

export function SearchEmptyState({ query, onClear, className }: SearchEmptyStateProps) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
      action={
        onClear
          ? {
              label: 'Clear search',
              onClick: onClear,
            }
          : undefined
      }
      className={className}
    />
  );
}
