'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { aiEventBus } from '@/lib/ai/events';
import {
  SplitViewLayout,
  SplitViewLayoutTablet,
  SplitViewLayoutMobile,
} from '@/components/layout/SplitViewLayout';
import { HorizontalFilterBar } from '@/components/filters/HorizontalFilterBar';
import { PropertyListPanel } from '@/components/properties/PropertyListPanel';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load MapPanel - heavy component with Mapbox
const MapPanel = dynamic(
  () => import('@/components/properties/MapPanel').then((mod) => ({ default: mod.MapPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  }
);
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
    longitude: -80.13,
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
  const { activeFilters, setActiveFilters } = usePropertySearch();

  // Search location state - default to Miami, FL
  const [searchLocation, setSearchLocation] = useState({ city: 'Miami', state: 'FL', zipCode: '' });
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
    city: searchLocation.city || undefined,
    state: searchLocation.state || undefined,
    zipCode: searchLocation.zipCode || undefined,
    limit: 50,
    enabled: Boolean(searchLocation.city || searchLocation.state || searchLocation.zipCode),
  });

  // AI-provided properties from tool results
  const [aiProperties, setAiProperties] = useState<MapProperty[]>([]);

  // Subscribe to AI property search events
  useEffect(() => {
    const unsubscribe = aiEventBus.on('tool:result', (event) => {
      // Check if this is a property search result
      if (event.toolName.includes('property') && event.toolName.includes('search')) {
        const result = event.result as { properties?: unknown[]; data?: unknown[] };
        const properties = (result?.properties || result?.data || []) as Array<{
          id?: string;
          address?: string;
          formattedAddress?: string;
          city?: string;
          state?: string;
          zip?: string;
          zipCode?: string;
          latitude?: number;
          longitude?: number;
          bedrooms?: number;
          bathrooms?: number;
          squareFootage?: number;
          sqft?: number;
          estimatedValue?: number;
          propertyType?: string;
        }>;

        if (properties.length > 0) {
          // Convert to MapProperty format
          const mapProperties: MapProperty[] = properties.map((p, idx) => ({
            id: p.id || `ai-${idx}`,
            address: p.address || p.formattedAddress || 'Unknown',
            city: p.city || '',
            state: p.state || '',
            latitude: p.latitude || 0,
            longitude: p.longitude || 0,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            sqft: p.squareFootage || p.sqft,
            estimatedValue: p.estimatedValue,
            propertyType: p.propertyType,
          }));

          setAiProperties(mapProperties);

          // Update search location if we can infer it
          const firstWithLocation = properties.find((p) => p.city && p.state);
          if (firstWithLocation) {
            setSearchLocation({
              city: firstWithLocation.city || '',
              state: firstWithLocation.state || '',
              zipCode: firstWithLocation.zip || firstWithLocation.zipCode || '',
            });
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  // Use AI properties if available, otherwise API data or fallback
  const allProperties =
    aiProperties.length > 0
      ? aiProperties
      : apiProperties && apiProperties.length > 0
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
        equityPercent:
          property.estimatedValue && property.lastSalePrice
            ? (((property.estimatedValue as number) - (property.lastSalePrice as number)) /
                (property.estimatedValue as number)) *
              100
            : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      filterResults: {
        matches: [],
        matchedFilters: [],
        combinedScore: 75 - index * 5, // Mock score that decreases for each property
        passesFilter: true,
      },
      rank: index + 1,
    }));
  }, [visibleProperties]);

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (filters: ActiveFilter[]) => {
      setActiveFilters(filters);
    },
    [setActiveFilters]
  );

  // Parse search query to extract location (city, state, or zip)
  const parseSearchQuery = useCallback(
    (query: string): { city: string; state: string; zipCode: string } => {
      const trimmed = query.trim();

      // Check if it's a zip code (5 digits)
      if (/^\d{5}$/.test(trimmed)) {
        return { city: '', state: '', zipCode: trimmed };
      }

      // Check for "City, State" format (e.g., "Miami, FL" or "Los Angeles, California")
      const cityStateMatch = trimmed.match(/^([^,]+),\s*([A-Za-z]{2,})$/);
      if (cityStateMatch && cityStateMatch[1] && cityStateMatch[2]) {
        return { city: cityStateMatch[1].trim(), state: cityStateMatch[2].trim(), zipCode: '' };
      }

      // Check for state abbreviation only (e.g., "FL", "CA")
      if (/^[A-Za-z]{2}$/.test(trimmed)) {
        return { city: '', state: trimmed.toUpperCase(), zipCode: '' };
      }

      // Default: treat as city name
      return { city: trimmed, state: '', zipCode: '' };
    },
    []
  );

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (query.trim()) {
        const parsed = parseSearchQuery(query);
        setSearchLocation(parsed);
      }
    },
    [parseSearchQuery]
  );

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
  return <SplitViewLayout filterBar={filterBar} mapPanel={mapPanel} listPanel={listPanel} />;
}
