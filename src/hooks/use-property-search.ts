'use client';

import { useState, useCallback } from 'react';
import type { 
  ActiveFilter, 
  FilterCombinationMode, 
  PropertySearchRequest,
  PropertySearchResponse,
  PropertyData,
} from '@/lib/filters/types';
import { executePropertySearch } from '@/lib/filters/query-builder';

export interface UsePropertySearchOptions {
  initialFilters?: ActiveFilter[];
  initialMode?: FilterCombinationMode;
  pageSize?: number;
}

export interface UsePropertySearchReturn {
  // State
  activeFilters: ActiveFilter[];
  filterMode: FilterCombinationMode;
  results: PropertySearchResponse | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  
  // Actions
  setActiveFilters: (filters: ActiveFilter[]) => void;
  setFilterMode: (mode: FilterCombinationMode) => void;
  search: (properties: PropertyData[]) => Promise<void>;
  setPage: (page: number) => void;
  clearResults: () => void;
}

export function usePropertySearch(
  options: UsePropertySearchOptions = {}
): UsePropertySearchReturn {
  const {
    initialFilters = [],
    initialMode = 'AND',
    pageSize = 20,
  } = options;

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialFilters);
  const [filterMode, setFilterMode] = useState<FilterCombinationMode>(initialMode);
  const [results, setResults] = useState<PropertySearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const search = useCallback(async (properties: PropertyData[]) => {
    if (activeFilters.length === 0) {
      setError('Please select at least one filter');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: PropertySearchRequest = {
        filters: activeFilters,
        filterMode,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      };

      const response = await executePropertySearch(properties, request);
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, filterMode, page, pageSize]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
    setPage(1);
  }, []);

  return {
    activeFilters,
    filterMode,
    results,
    isLoading,
    error,
    page,
    setActiveFilters,
    setFilterMode,
    search,
    setPage,
    clearResults,
  };
}

