'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  SplitViewLayout,
  SplitViewLayoutTablet,
  SplitViewLayoutMobile,
} from '@/components/layout/SplitViewLayout';
import { HorizontalFilterBar } from '@/components/filters/HorizontalFilterBar';
import { MapPanel } from '@/components/properties/MapPanel';
import { PropertyListPanel } from '@/components/properties/PropertyListPanel';
import { useMapListSync } from '@/hooks/useMapListSync';
import { usePropertySearch } from '@/hooks/use-property-search';
import { usePageContext } from '@/hooks/usePageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRentcastProperties } from '@/hooks/use-rentcast-properties';
import type { ActiveFilter } from '@/lib/filters/types';
import type { MapProperty } from '@/components/map';

/**
 * PropertySearchSplitView Component
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 * 
 * Unified property search page with split-view layout:
 * - Left: Interactive map with property markers
 * - Right: Scrollable property list
 * - Top: Horizontal filter bar
 * - Bottom: Floating AI chat dialog
 * 
 * Features:
 * - Map-list synchronization (hover/click)
 * - Bounds-based filtering
 * - Real-time filter updates
 * - Floating AI chat for property questions
 */

// Fallback mock properties when API is unavailable
const FALLBACK_PROPERTIES: MapProperty[] = [
  {
    id: '1',
    address: '123 Main St',
    city: 'Miami',
    state: 'FL',
    latitude: 25.7617,
    longitude: -80.1918,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    estimatedValue: 450000,
    lastSalePrice: 380000,
  },
  {
    id: '2',
    address: '456 Ocean Dr',
    city: 'Miami Beach',
    state: 'FL',
    latitude: 25.7907,
    longitude: -80.1300,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2200,
    estimatedValue: 850000,
    lastSalePrice: 720000,
  },
  {
    id: '3',
    address: '789 Brickell Ave',
    city: 'Miami',
    state: 'FL',
    latitude: 25.7617,
    longitude: -80.1918,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    estimatedValue: 380000,
    lastSalePrice: 320000,
  },
];

export function PropertySearchSplitView() {
  // Set page context for AI awareness
  usePageContext('properties');

  // Responsive breakpoints
  const isMobile = useIsMobile(); // <768px
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  // Tablet/Mobile state
  const [isListOpen, setIsListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  // Map-list synchronization
  const {
    highlightedPropertyId,
    selectedPropertyId,
    handleCardHover,
    handleCardClick,
    handleMarkerClick,
  } = useMapListSync();

  // Property search state
  const {
    activeFilters,
    setActiveFilters,
  } = usePropertySearch();

  // Search location state - default to Miami, FL
  const [searchLocation] = useState({ city: 'Miami', state: 'FL' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [mapBounds, setMapBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  // Fetch properties from Rentcast API
  const {
    data: apiProperties,
    isLoading: isLoadingProperties,
    error: apiError,
  } = useRentcastProperties({
    city: searchLocation.city,
    state: searchLocation.state,
    limit: 50,
    enabled: true,
  });

  // Use API data or fallback to mock
  const allProperties = apiProperties && apiProperties.length > 0
    ? apiProperties
    : FALLBACK_PROPERTIES;

  // Filter properties by map bounds
  const visibleProperties = useMemo(() => {
    if (!mapBounds) return allProperties;

    return allProperties.filter((property) => {
      return (
        property.latitude >= mapBounds.south &&
        property.latitude <= mapBounds.north &&
        property.longitude >= mapBounds.west &&
        property.longitude <= mapBounds.east
      );
    });
  }, [mapBounds, allProperties]);

  // Convert MapProperty to PropertySearchResultItem for list display
  const searchResults = useMemo(() => {
    return visibleProperties.map((property, index) => ({
      property: {
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        zip: '',
        latitude: property.latitude,
        longitude: property.longitude,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.sqft,
        estimatedValue: property.estimatedValue as number | null | undefined,
        lastSalePrice: property.lastSalePrice as number | null | undefined,
        lastSaleDate: null,
        ownerName: null,
        ownerOccupied: null,
        yearBuilt: null,
        lotSize: null,
        propertyType: null,
        zoning: null,
        taxAssessedValue: null,
        annualTaxAmount: null,
        mlsStatus: null,
        daysOnMarket: null,
        pricePerSqft: null,
        hoaFees: null,
        parkingSpaces: null,
        garage: null,
        pool: null,
        view: null,
        waterfront: null,
        gatedCommunity: null,
        seniorCommunity: null,
        equityPercent: property.estimatedValue && property.lastSalePrice
          ? (((property.estimatedValue as number) - (property.lastSalePrice as number)) / (property.estimatedValue as number)) * 100
          : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      filterResults: {
        matches: [],
        matchedFilters: [],
        combinedScore: 75 - (index * 5), // Mock score that decreases for each property
        passesFilter: true,
      },
      rank: index + 1,
    }));
  }, [visibleProperties]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters: ActiveFilter[]) => {
    setActiveFilters(filters);
  }, [setActiveFilters]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement search logic
  }, []);

  // Shared components
  const filterBar = (
    <HorizontalFilterBar
      searchQuery={searchQuery}
      onSearchChange={handleSearch}
      activeFilters={activeFilters}
      onFiltersChange={handleFiltersChange}
      sortBy={sortBy}
      onSortChange={setSortBy}
      resultsCount={searchResults.length}
    />
  );

  const mapPanel = (
    <MapPanel
      properties={visibleProperties}
      highlightedPropertyId={highlightedPropertyId}
      selectedPropertyId={selectedPropertyId}
      onPropertyClick={handleMarkerClick}
      onBoundsChange={setMapBounds}
    />
  );

  const listPanel = (
    <PropertyListPanel
      results={searchResults}
      highlightedPropertyId={highlightedPropertyId}
      selectedPropertyId={selectedPropertyId}
      onPropertyHover={handleCardHover}
      onPropertyClick={handleCardClick}
      isLoading={isLoadingProperties}
      error={apiError ? (apiError as Error).message : undefined}
    />
  );

  // Mobile layout (<768px)
  if (isMobile) {
    return (
      <SplitViewLayoutMobile
        filterBar={filterBar}
        mapPanel={mapPanel}
        listPanel={listPanel}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    );
  }

  // Tablet layout (768-1023px)
  if (isTablet) {
    return (
      <SplitViewLayoutTablet
        filterBar={filterBar}
        mapPanel={mapPanel}
        listPanel={listPanel}
        isListOpen={isListOpen}
        onToggleList={() => setIsListOpen(!isListOpen)}
      />
    );
  }

  // Desktop layout (1024px+)
  // AI Chat is handled by AppShell right sidebar
  return (
    <SplitViewLayout
      filterBar={filterBar}
      mapPanel={mapPanel}
      listPanel={listPanel}
    />
  );
}

