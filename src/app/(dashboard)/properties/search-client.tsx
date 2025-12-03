'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from '@/components/properties/filter-sidebar';
import { SearchResults } from '@/components/properties/search-results';
import { SavedSearchesDialog } from '@/components/properties/saved-searches-dialog';
import { usePropertySearch } from '@/hooks/use-property-search';
import { useSavedSearches } from '@/hooks/use-saved-searches';
import type { PropertyData } from '@/lib/filters/types';
import type { SavedSearch } from '@/lib/filters/saved-searches';

// Mock data for demonstration - in production this would come from API/database
const MOCK_PROPERTIES: PropertyData[] = [
  {
    id: '1',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    propertyType: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    yearBuilt: 1985,
    estimatedValue: 450000,
    mortgageBalance: 180000,
    equityPercent: 60,
    ownerName: 'John Smith',
    ownerType: 'Individual',
    mailingAddress: '456 Oak Ave',
    mailingCity: 'Dallas',
    mailingState: 'TX',
    ownershipMonths: 156,
    isOwnerOccupied: false,
    taxAmount: 8500,
  },
  {
    id: '2',
    address: '789 Elm Street',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    propertyType: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2400,
    yearBuilt: 1992,
    estimatedValue: 380000,
    mortgageBalance: 0,
    equityPercent: 100,
    ownerName: 'ABC Properties LLC',
    ownerType: 'Company',
    mailingAddress: '100 Corporate Blvd',
    mailingCity: 'Phoenix',
    mailingState: 'AZ',
    ownershipMonths: 240,
    isOwnerOccupied: false,
    taxAmount: 7200,
  },
  {
    id: '3',
    address: '555 Pine Road',
    city: 'San Antonio',
    state: 'TX',
    zip: '78201',
    propertyType: 'Single Family',
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 1200,
    yearBuilt: 1978,
    estimatedValue: 220000,
    mortgageBalance: 88000,
    equityPercent: 60,
    ownerName: 'Mary Johnson',
    ownerType: 'Individual',
    mailingAddress: '555 Pine Road',
    mailingCity: 'San Antonio',
    mailingState: 'TX',
    ownershipMonths: 180,
    isOwnerOccupied: true,
    taxAmount: 4200,
    listingStatus: 'Expired',
    listingDate: '2024-06-15',
    daysOnMarket: 120,
  },
];

export function PropertySearchClient() {
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);

  const {
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
  } = usePropertySearch();

  const {
    savedSearches,
    isLoading: savedSearchesLoading,
    save: saveSearch,
    remove: removeSearch,
  } = useSavedSearches();

  const handleSearch = useCallback(() => {
    search(MOCK_PROPERTIES);
  }, [search]);

  const handlePropertyClick = useCallback((propertyId: string) => {
    console.log('Property clicked:', propertyId);
    // TODO: Navigate to property detail page
  }, []);

  const handleLoadSearch = useCallback((savedSearch: SavedSearch) => {
    setActiveFilters(savedSearch.filters.activeFilters);
    setFilterMode(savedSearch.filters.filterMode);
    setSavedSearchesOpen(false);
  }, [setActiveFilters, setFilterMode]);

  const handleSaveSearch = useCallback(async (name: string, description?: string) => {
    await saveSearch(name, activeFilters, filterMode, description);
  }, [saveSearch, activeFilters, filterMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Property Search</h1>
          <p className="text-muted-foreground">
            Find motivated sellers using 21 intelligent filters
          </p>
        </div>
        <Button variant="outline" onClick={() => setSavedSearchesOpen(true)}>
          Saved Searches ({savedSearches.length})
        </Button>
      </div>

      <SavedSearchesDialog
        open={savedSearchesOpen}
        onOpenChange={setSavedSearchesOpen}
        savedSearches={savedSearches}
        onLoad={handleLoadSearch}
        onDelete={removeSearch}
        onSave={handleSaveSearch}
        currentFilters={activeFilters}
        currentMode={filterMode}
        isLoading={savedSearchesLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Filter Sidebar */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <FilterSidebar
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* Results */}
        <div>
          <SearchResults
            results={results}
            isLoading={isLoading}
            error={error}
            page={page}
            onPageChange={setPage}
            onPropertyClick={handlePropertyClick}
          />
        </div>
      </div>
    </div>
  );
}

