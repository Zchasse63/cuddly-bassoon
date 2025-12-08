import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveFilter } from '@/lib/filters/types';

/**
 * Property Filter Store
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 * 
 * Centralized state management for property search filters, sort order, and map bounds.
 * Persists to localStorage and syncs with URL params for shareable links.
 * 
 * Features:
 * - Active filters (bed/bath/price/equity/etc.)
 * - Search query
 * - Sort order
 * - Map bounds
 * - Filter mode (AND/OR)
 * - URL param synchronization
 */

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PropertyFilterState {
  // Search & Filters
  searchQuery: string;
  activeFilters: ActiveFilter[];
  filterMode: 'AND' | 'OR';
  
  // Sort
  sortBy: 'score' | 'price_asc' | 'price_desc' | 'equity_desc' | 'newest';
  
  // Map
  mapBounds: MapBounds | null;
  mapCenter: { latitude: number; longitude: number } | null;
  mapZoom: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: ActiveFilter[]) => void;
  addFilter: (filter: ActiveFilter) => void;
  removeFilter: (filterId: string) => void;
  setFilterMode: (mode: 'AND' | 'OR') => void;
  setSortBy: (sort: PropertyFilterState['sortBy']) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
  setMapCenter: (center: { latitude: number; longitude: number } | null) => void;
  setMapZoom: (zoom: number) => void;
  reset: () => void;
  
  // URL Sync
  toURLParams: () => URLSearchParams;
  fromURLParams: (params: URLSearchParams) => void;
}

const DEFAULT_STATE = {
  searchQuery: '',
  activeFilters: [],
  filterMode: 'AND' as const,
  sortBy: 'score' as const,
  mapBounds: null,
  mapCenter: null,
  mapZoom: 12,
};

export const usePropertyFilterStore = create<PropertyFilterState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveFilters: (filters) => set({ activeFilters: filters }),

      addFilter: (filter) =>
        set((state) => ({
          activeFilters: [...state.activeFilters, filter],
        })),

      removeFilter: (filterId) =>
        set((state) => ({
          activeFilters: state.activeFilters.filter((f) => f.filterId !== filterId),
        })),

      setFilterMode: (mode) => set({ filterMode: mode }),

      setSortBy: (sort) => set({ sortBy: sort }),

      setMapBounds: (bounds) => set({ mapBounds: bounds }),

      setMapCenter: (center) => set({ mapCenter: center }),

      setMapZoom: (zoom) => set({ mapZoom: zoom }),

      reset: () => set(DEFAULT_STATE),

      // URL Param Synchronization
      toURLParams: () => {
        const state = get();
        const params = new URLSearchParams();

        if (state.searchQuery) {
          params.set('q', state.searchQuery);
        }

        if (state.activeFilters.length > 0) {
          params.set('filters', JSON.stringify(state.activeFilters));
        }

        if (state.filterMode !== 'AND') {
          params.set('mode', state.filterMode);
        }

        if (state.sortBy !== 'score') {
          params.set('sort', state.sortBy);
        }

        if (state.mapCenter) {
          params.set('lat', state.mapCenter.latitude.toString());
          params.set('lng', state.mapCenter.longitude.toString());
        }

        if (state.mapZoom !== 12) {
          params.set('zoom', state.mapZoom.toString());
        }

        return params;
      },

      fromURLParams: (params) => {
        const updates: Partial<PropertyFilterState> = {};

        const query = params.get('q');
        if (query) updates.searchQuery = query;

        const filtersStr = params.get('filters');
        if (filtersStr) {
          try {
            updates.activeFilters = JSON.parse(filtersStr);
          } catch (e) {
            console.error('Failed to parse filters from URL', e);
          }
        }

        const mode = params.get('mode');
        if (mode === 'AND' || mode === 'OR') {
          updates.filterMode = mode;
        }

        const sort = params.get('sort');
        if (sort && ['score', 'price_asc', 'price_desc', 'equity_desc', 'newest'].includes(sort)) {
          updates.sortBy = sort as PropertyFilterState['sortBy'];
        }

        const lat = params.get('lat');
        const lng = params.get('lng');
        if (lat && lng) {
          updates.mapCenter = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          };
        }

        const zoom = params.get('zoom');
        if (zoom) {
          updates.mapZoom = parseInt(zoom, 10);
        }

        set(updates);
      },
    }),
    {
      name: 'property-filter-store',
      partialize: (state) => ({
        // Only persist these fields
        searchQuery: state.searchQuery,
        activeFilters: state.activeFilters,
        filterMode: state.filterMode,
        sortBy: state.sortBy,
        mapCenter: state.mapCenter,
        mapZoom: state.mapZoom,
      }),
    }
  )
);

