'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LucideIcon,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Handshake,
  FileText,
  Search,
  Plus,
  Upload,
} from 'lucide-react';

/**
 * Empty State Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 7.3
 * "Empty states: Clear guidance and relevant action suggestions"
 */

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  action: () => void;
  priority?: 'high' | 'medium' | 'low';
}

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
  /** Smart suggestions based on context */
  suggestions?: SmartSuggestion[];
  /** Show AI tip */
  aiTip?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  suggestions,
  aiTip,
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

      {/* Smart Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-6 w-full max-w-md space-y-2">
          <p className="text-sm text-muted-foreground mb-3">Suggested next steps:</p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={suggestion.action}
              className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left group"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  suggestion.priority === 'high'
                    ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <suggestion.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2">
                  {suggestion.title}
                  {suggestion.priority === 'high' && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{suggestion.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* AI Tip */}
      {aiTip && (
        <div className="mt-6 w-full max-w-md">
          <div className="flex items-start gap-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 p-3 text-sm">
            <Sparkles className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{aiTip}</p>
          </div>
        </div>
      )}

      {(action || secondaryAction) && (
        <div className="empty-state__actions mt-6">
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

/**
 * Smart Empty State for Properties
 */
interface PropertiesEmptyStateProps {
  hasFilters?: boolean;
  hasBuyers?: boolean;
  onSearch?: () => void;
  onImport?: () => void;
  onClearFilters?: () => void;
  className?: string;
}

export function PropertiesEmptyState({
  hasFilters,
  hasBuyers,
  onSearch,
  onImport,
  onClearFilters,
  className,
}: PropertiesEmptyStateProps) {
  const suggestions: SmartSuggestion[] = [];

  if (hasFilters && onClearFilters) {
    suggestions.push({
      id: 'clear-filters',
      title: 'Clear Filters',
      description: 'Remove current filters to see all properties',
      icon: Search,
      action: onClearFilters,
      priority: 'high',
    });
  }

  if (onSearch) {
    suggestions.push({
      id: 'search',
      title: 'Search Properties',
      description: 'Find properties by address, city, or ZIP code',
      icon: Search,
      action: onSearch,
      priority: hasFilters ? 'medium' : 'high',
    });
  }

  if (onImport) {
    suggestions.push({
      id: 'import',
      title: 'Import Properties',
      description: 'Upload a CSV or connect to your lead sources',
      icon: Upload,
      action: onImport,
    });
  }

  return (
    <EmptyState
      icon={Building2}
      title={hasFilters ? 'No properties match your filters' : 'No properties yet'}
      description={
        hasFilters
          ? 'Try adjusting your filters or search for new properties.'
          : 'Start building your pipeline by adding properties to analyze.'
      }
      suggestions={suggestions}
      aiTip={
        hasBuyers
          ? 'You have buyers waiting! Add properties that match their criteria to start making deals.'
          : 'Tip: Use the AI assistant to analyze properties and find the best investment opportunities.'
      }
      className={className}
    />
  );
}

/**
 * Smart Empty State for Deals
 */
interface DealsEmptyStateProps {
  hasProperties?: boolean;
  hasBuyers?: boolean;
  onCreateDeal?: () => void;
  onViewProperties?: () => void;
  className?: string;
}

export function DealsEmptyState({
  hasProperties,
  hasBuyers,
  onCreateDeal,
  onViewProperties,
  className,
}: DealsEmptyStateProps) {
  const suggestions: SmartSuggestion[] = [];

  if (hasProperties && onCreateDeal) {
    suggestions.push({
      id: 'create-deal',
      title: 'Create Your First Deal',
      description: 'Convert a property into a deal to track your progress',
      icon: Plus,
      action: onCreateDeal,
      priority: 'high',
    });
  }

  if (!hasProperties && onViewProperties) {
    suggestions.push({
      id: 'find-properties',
      title: 'Find Properties First',
      description: 'Search for investment properties to create deals from',
      icon: Search,
      action: onViewProperties,
      priority: 'high',
    });
  }

  if (hasBuyers) {
    suggestions.push({
      id: 'match-buyers',
      title: 'You Have Active Buyers',
      description: 'Find deals that match your buyer criteria',
      icon: Users,
      action: onViewProperties || (() => {}),
    });
  }

  return (
    <EmptyState
      icon={Handshake}
      title="No deals yet"
      description="Start tracking your wholesale deals from lead to close."
      suggestions={suggestions}
      aiTip={
        hasProperties
          ? 'Select a property and use AI to analyze its deal potential and calculate your MAO.'
          : 'Use the command palette (Cmd+K) to quickly search for properties and create deals.'
      }
      className={className}
    />
  );
}

/**
 * Smart Empty State for Buyers
 */
interface BuyersEmptyStateProps {
  hasDeals?: boolean;
  onAddBuyer?: () => void;
  onImportBuyers?: () => void;
  className?: string;
}

export function BuyersEmptyState({
  hasDeals,
  onAddBuyer,
  onImportBuyers,
  className,
}: BuyersEmptyStateProps) {
  const suggestions: SmartSuggestion[] = [];

  if (onAddBuyer) {
    suggestions.push({
      id: 'add-buyer',
      title: 'Add Your First Buyer',
      description: 'Start building your buyer network',
      icon: Plus,
      action: onAddBuyer,
      priority: 'high',
    });
  }

  if (onImportBuyers) {
    suggestions.push({
      id: 'import-buyers',
      title: 'Import Buyer List',
      description: 'Upload a CSV with your existing buyer contacts',
      icon: Upload,
      action: onImportBuyers,
    });
  }

  return (
    <EmptyState
      icon={Users}
      title="No buyers yet"
      description="Build your cash buyer network to assign deals quickly."
      suggestions={suggestions}
      aiTip={
        hasDeals
          ? 'You have active deals! Add buyers now so AI can match them to your properties.'
          : 'A strong buyer list is key to fast assignments. Add buyer preferences and AI will auto-match properties.'
      }
      className={className}
    />
  );
}

/**
 * Smart Empty State for Documents
 */
interface DocumentsEmptyStateProps {
  onUpload?: () => void;
  onCreateTemplate?: () => void;
  className?: string;
}

export function DocumentsEmptyState({
  onUpload,
  onCreateTemplate,
  className,
}: DocumentsEmptyStateProps) {
  const suggestions: SmartSuggestion[] = [];

  if (onUpload) {
    suggestions.push({
      id: 'upload',
      title: 'Upload Documents',
      description: 'Add contracts, agreements, and other files',
      icon: Upload,
      action: onUpload,
      priority: 'high',
    });
  }

  if (onCreateTemplate) {
    suggestions.push({
      id: 'template',
      title: 'Create Template',
      description: 'Set up reusable document templates',
      icon: FileText,
      action: onCreateTemplate,
    });
  }

  return (
    <EmptyState
      icon={FileText}
      title="No documents yet"
      description="Store and organize your contracts, agreements, and deal documents."
      suggestions={suggestions}
      aiTip="Upload contracts and AI can extract key terms, dates, and amounts automatically."
      className={className}
    />
  );
}

// Export suggestion type for external use
export type { SmartSuggestion };
