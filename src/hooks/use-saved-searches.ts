'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SavedSearch, CreateSavedSearchInput } from '@/lib/filters/saved-searches';
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
} from '@/lib/filters/saved-searches';
import type { ActiveFilter, FilterCombinationMode } from '@/lib/filters/types';

export interface UseSavedSearchesReturn {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (
    name: string,
    filters: ActiveFilter[],
    filterMode: FilterCombinationMode,
    description?: string
  ) => Promise<SavedSearch | null>;
  remove: (id: string) => Promise<void>;
}

export function useSavedSearches(): UseSavedSearchesReturn {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searches = await getSavedSearches();
      setSavedSearches(searches);
    } catch (err) {
      // If not authenticated, just set empty array
      if (err instanceof Error && err.message === 'Not authenticated') {
        setSavedSearches([]);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load saved searches');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = useCallback(async (
    name: string,
    filters: ActiveFilter[],
    filterMode: FilterCombinationMode,
    description?: string
  ): Promise<SavedSearch | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const input: CreateSavedSearchInput = {
        name,
        description,
        filters: {
          activeFilters: filters,
          filterMode,
        },
      };

      const newSearch = await createSavedSearch(input);
      setSavedSearches((prev) => [newSearch, ...prev]);
      return newSearch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save search');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete search');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load saved searches on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    savedSearches,
    isLoading,
    error,
    refresh,
    save,
    remove,
  };
}

