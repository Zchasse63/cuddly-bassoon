'use client';

import { PropertyCard } from './property-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { PropertySearchResponse } from '@/lib/filters/types';

interface SearchResultsProps {
  results: PropertySearchResponse | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  onPageChange: (page: number) => void;
  onPropertyClick?: (propertyId: string) => void;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResults({
  results,
  isLoading,
  error,
  page,
  onPageChange,
  onPropertyClick,
}: SearchResultsProps) {
  if (isLoading) {
    return <ResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Select filters and search to find properties</p>
        <p className="text-sm mt-2">
          Use the filter panel to select criteria and click Search
        </p>
      </div>
    );
  }

  if (results.results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No properties match your filters</p>
        <p className="text-sm mt-2">
          Try adjusting your filter criteria or using fewer filters
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(results.total / results.limit);

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {results.offset + 1}-{Math.min(results.offset + results.limit, results.total)} of{' '}
          {results.total} properties
          <span className="ml-2">({results.executionTimeMs}ms)</span>
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {results.results.map((result) => (
          <PropertyCard
            key={result.property.id}
            result={result}
            onClick={() => onPropertyClick?.(result.property.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

