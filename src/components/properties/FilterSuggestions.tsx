'use client';

/**
 * Smart Filter Suggestions Component
 *
 * Displays context-aware filter suggestions based on currently active filters
 */

import { useState } from 'react';
import { Lightbulb, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFilterSuggestions, getFilterName } from '@/hooks/useFilterSuggestions';
import type { ActiveFilter, FilterId } from '@/lib/filters/types';

interface FilterSuggestionsProps {
  activeFilters: ActiveFilter[];
  onAddFilter: (filterId: FilterId) => void;
  className?: string;
}

export function FilterSuggestions({
  activeFilters,
  onAddFilter,
  className,
}: FilterSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const suggestions = useFilterSuggestions(activeFilters);

  // Don't show if there are no suggestions
  if (suggestions.length === 0) {
    return null;
  }

  // Color coding based on confidence
  const getConfidenceBadgeVariant = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'text-[var(--fluid-success)]';
      case 'medium':
        return 'text-[var(--fluid-warning)]';
      case 'low':
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="font-medium text-sm text-amber-900 dark:text-amber-100">
            Smart Suggestions
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {suggestions.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
        >
          {isExpanded ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </Button>
      </button>

      {/* Suggestions List */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Based on your current filters, consider adding:
          </p>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.filterId}
              className="glass-subtle rounded-lg p-2.5 border border-[var(--fluid-warning)]/30 hover:border-[var(--fluid-warning)]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-medium text-sm truncate">
                      {getFilterName(suggestion.filterId)}
                    </span>
                    <Lightbulb
                      className={cn(
                        'h-3 w-3 flex-shrink-0',
                        getConfidenceColor(suggestion.confidence)
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs flex-shrink-0"
                  onClick={() => onAddFilter(suggestion.filterId)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Confidence:</span>
                <Badge
                  variant={getConfidenceBadgeVariant(suggestion.confidence)}
                  className="text-[10px] px-1 py-0"
                >
                  {suggestion.confidence}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      {isExpanded && (
        <div className="px-3 pb-3">
          <p className="text-[10px] text-muted-foreground italic">
            💡 Suggestions are based on common real estate investment strategies
          </p>
        </div>
      )}
    </div>
  );
}
