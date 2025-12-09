'use client';

import { useRef, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { PropertyCardCompact } from './PropertyCardCompact';
import { cn } from '@/lib/utils';
import type { PropertySearchResultItem } from '@/lib/filters/types';

/**
 * PropertyListPanel Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 *
 * Right panel of split-view layout containing scrollable property list.
 *
 * Features:
 * - Header with results count and sort control
 * - Scrollable list of PropertyCardCompact components
 * - Scroll-to behavior for selected properties
 * - Hover/click handlers for map synchronization
 * - Loading and error states
 */

interface PropertyListPanelProps {
  results: PropertySearchResultItem[];
  highlightedPropertyId?: string | null;
  selectedPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertyClick?: (propertyId: string) => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function PropertyListPanel({
  results,
  highlightedPropertyId,
  selectedPropertyId,
  onPropertyHover,
  onPropertyClick,
  isLoading,
  error,
  className,
}: PropertyListPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to selected property when it changes
  useEffect(() => {
    if (!selectedPropertyId || !listRef.current) return;

    const cardElement = listRef.current.querySelector(`[data-property-id="${selectedPropertyId}"]`);

    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedPropertyId]);

  return (
    <div
      ref={listRef}
      className={cn(
        'property-list-panel',
        'h-full flex flex-col',
        'bg-transparent', // Transparent for glass container effect
        className
      )}
    >
      {/* Header - Glass styling */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 glass-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {isLoading
              ? 'Loading...'
              : `${results.length} ${results.length === 1 ? 'Property' : 'Properties'}`}
          </h2>
        </div>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Fetching properties...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="flex items-center justify-center size-12 rounded-full bg-destructive/10 mb-3">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <p className="text-destructive font-medium">Failed to load properties</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && results.length === 0 && (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <p className="text-muted-foreground">No properties found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search area
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && results.length > 0 && (
          <div className="p-4 space-y-3">
            {results.map((result) => (
              <div
                key={result.property.id}
                data-property-id={result.property.id}
                onMouseEnter={() => onPropertyHover?.(result.property.id)}
                onMouseLeave={() => onPropertyHover?.(null)}
              >
                <PropertyCardCompact
                  result={result}
                  onClick={() => onPropertyClick?.(result.property.id)}
                  isHighlighted={result.property.id === highlightedPropertyId}
                  isSelected={result.property.id === selectedPropertyId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PropertyListPanelHeader Component
 *
 * Separate header component with sort and view controls.
 * Can be used for more advanced filtering/sorting UI.
 */

interface PropertyListPanelHeaderProps {
  count: number;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export function PropertyListPanelHeader({
  count,
  sortBy,
  onSortChange,
}: PropertyListPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 glass-subtle">
      <h2 className="text-sm font-semibold">
        {count} {count === 1 ? 'Property' : 'Properties'}
      </h2>

      {onSortChange && (
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="score">Best Match</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="equity_desc">Equity: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      )}
    </div>
  );
}
