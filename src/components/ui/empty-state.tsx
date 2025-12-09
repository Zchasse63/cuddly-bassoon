'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { springPresets, fadeUpVariants } from '@/lib/animations';
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      className={cn(
        'empty-state flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springPresets.gentle}
          className="empty-state__icon flex items-center justify-center w-20 h-20 rounded-full bg-brand-500/5 ring-1 ring-brand-500/20 text-brand-500 mb-6"
        >
          <Icon className="h-10 w-10 opacity-80" />
        </motion.div>
      )}
      <h3 className="empty-state__title text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
        {title}
      </h3>
      {description && (
        <p className="empty-state__description text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {/* Smart Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-8 w-full max-w-md space-y-3">
          <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest mb-4">
            Suggested next steps
          </p>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={suggestion.action}
              className="w-full flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-background/80 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all text-left group"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                  suggestion.priority === 'high'
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'bg-muted/50 text-muted-foreground group-hover:bg-brand-500/5 group-hover:text-brand-500'
                )}
              >
                <suggestion.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2 text-foreground/90">
                  {suggestion.title}
                  {suggestion.priority === 'high' && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 h-5 bg-brand-500/10 text-brand-600 border-none"
                    >
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate opacity-80 mt-0.5">
                  {suggestion.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      )}

      {/* AI Tip */}
      {aiTip && (
        <div className="mt-8 w-full max-w-md">
          <div className="flex items-start gap-3 rounded-xl glass-subtle border border-brand-500/20 p-4 text-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-500/50" />
            <Sparkles className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="text-left">
              <span className="font-bold text-brand-700 dark:text-brand-300 block text-xs mb-0.5 uppercase tracking-wide">
                Scout Insight
              </span>
              <p className="text-muted-foreground leading-relaxed">{aiTip}</p>
            </div>
          </div>
        </div>
      )}

      {(action || secondaryAction) && (
        <div className="empty-state__actions mt-8 flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className="btn-gradient shadow-lg shadow-brand-500/20 rounded-full px-6"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="rounded-full px-6 border-border/50 hover:bg-muted/50"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
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
