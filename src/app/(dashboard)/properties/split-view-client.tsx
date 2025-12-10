'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { useAIResultStore } from '@/stores/aiResultStore';
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

  // Market Velocity overlay state
  const [velocityEnabled, setVelocityEnabled] = useState(false);

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

  // Subscribe to AI tool results via Zustand store (replaces event bus)
  const latestByTool = useAIResultStore((state) => state.latestByTool);
  const acknowledgeResult = useAIResultStore((state) => state.acknowledgeResult);

  // Process AI tool results when they arrive
  useEffect(() => {
    // Check all tool results for property-related data
    latestByTool.forEach((aiResult, toolName) => {
      // Skip already acknowledged results
      if (aiResult.acknowledged) return;

      const toolNameLower = toolName.toLowerCase();
      const result = aiResult.result as any;

      // Check if the result has property array structure
      const hasProperties =
        Array.isArray(result?.properties) ||
        Array.isArray(result?.data) ||
        Array.isArray(result?.results);

      // Match: property search, geocode, or any tool returning property structure
      const isPropertySearch =
        toolNameLower.includes('property') ||
        toolNameLower.includes('search') ||
        toolNameLower.includes('geocode') ||
        hasProperties;

      if (isPropertySearch) {
        console.log('[SplitView] Processing property/geo search result from Zustand:', toolName);

        // Handle various result shapes (properties array, data array, or single object)
        let rawProperties = result?.properties || result?.data || result?.results || [];

        // If result is a single object with coordinates, wrap it
        if (!Array.isArray(rawProperties) && (result?.latitude || result?.address)) {
          rawProperties = [result];
        }

        const properties = (Array.isArray(rawProperties) ? rawProperties : []) as Array<{
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
          // Convert to MapProperty format, but filter out pure geocode results that aren't properties
          const mapProperties: MapProperty[] = properties
            .map((p: any, idx): MapProperty | null => {
              // Extract coordinates from various possible shapes
              let lat = p.latitude || p.lat;
              let lng = p.longitude || p.lng || p.long;

              // Handle nested coordinates (e.g. from geocode tool)
              if (!lat && p.coordinates) {
                lat = p.coordinates.lat;
                lng = p.coordinates.lng;
              }
              // Handle center point (e.g. from map tools)
              if (!lat && p.center) {
                lat = p.center.lat;
                lng = p.center.lng;
              }

              // Check if this is a "real" property or just a location result
              const isRealProperty =
                p.estimatedValue ||
                p.askingPrice ||
                p.bedrooms ||
                p.bathrooms ||
                p.propertyType ||
                p.id?.startsWith('prop_');

              if (!isRealProperty && toolNameLower.includes('geocode')) {
                return null;
              }

              return {
                id: p.id || `ai-${idx}`,
                address: p.address || p.formattedAddress || 'Unknown',
                city: p.city || '',
                state: p.state || '',
                latitude: Number(lat) || 0,
                longitude: Number(lng) || 0,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                sqft: p.squareFootage || p.sqft,
                price: p.price || p.estimatedValue || p.askingPrice,
                estimatedValue: p.estimatedValue,
                propertyType: p.propertyType,
              } as MapProperty;
            })
            .filter((p): p is MapProperty => p !== null);

          setAiProperties(mapProperties);

          // Verify we have valid coordinates to show on map AND give feedback
          const validProperties = mapProperties.filter(
            (p) => p.latitude !== 0 && p.longitude !== 0
          );

          if (validProperties.length > 0) {
            toast.success(`Scout found ${validProperties.length} properties`, {
              description: 'Map view updated',
            });
          } else if (mapProperties.length > 0) {
            toast.warning(
              `Scout found ${mapProperties.length} properties but they lack location data.`,
              {
                description: 'Check the list view.',
              }
            );
          }

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

        // Mark result as acknowledged so we don't process it again
        acknowledgeResult(aiResult.id);
      }
    });
  }, [latestByTool, acknowledgeResult]);

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
    return visibleProperties.map((property, index) => {
      // Extract price from various possible fields
      const estimatedValue = (property.estimatedValue || property.price || property.marketValue) as
        | number
        | null
        | undefined;
      const lastSalePrice = (property.lastSalePrice || property.soldPrice) as
        | number
        | null
        | undefined;
      const taxAssessedValue = (property.taxAssessedValue || property.assessedValue) as
        | number
        | null
        | undefined;

      // Calculate equity if we have the data
      const primaryValue = estimatedValue || taxAssessedValue;
      const equityPercent =
        primaryValue && lastSalePrice && lastSalePrice > 0
          ? ((primaryValue - lastSalePrice) / primaryValue) * 100
          : null;

      return {
        property: {
          id: property.id,
          address: property.address,
          city: property.city,
          state: property.state,
          zip: (property.zip || property.zipCode || '') as string,
          latitude: property.latitude,
          longitude: property.longitude,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFootage: property.sqft || (property.squareFootage as number | undefined),
          estimatedValue,
          lastSalePrice,
          lastSaleDate: null,
          ownerName: null,
          ownerOccupied: null,
          yearBuilt: property.yearBuilt as number | null | undefined,
          lotSize: null,
          propertyType: (property.propertyType as string | null | undefined) || null,
          zoning: null,
          taxAssessedValue,
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
          equityPercent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        filterResults: {
          matches: [],
          matchedFilters: [],
          combinedScore: Math.max(50, 85 - index * 3), // Score from 85 down to minimum 50
          passesFilter: true,
        },
        rank: index + 1,
      };
    });
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

  // Handle marking a property as sold
  const handleMarkSold = useCallback(
    async (propertyId: string) => {
      // Find the property to get details for the toast
      const property = visibleProperties.find((p) => p.id === propertyId);
      const address = property?.address || 'Property';

      try {
        // Call the API to mark property as sold
        const response = await fetch('/api/ai/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolName: 'markPropertySold',
            input: { propertyId },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to mark property as sold');
        }

        const result = await response.json();

        if (result.success) {
          toast.success(`Marked as sold: ${address}`, {
            description: result.wasInPipeline
              ? 'Deal moved to lost. Check Loss Pipeline for analytics.'
              : 'Recorded for loss analysis.',
          });

          // Remove from visible properties
          setAiProperties((prev) => prev.filter((p) => p.id !== propertyId));
        } else {
          toast.error('Failed to mark property as sold', {
            description: result.message || 'Please try again',
          });
        }
      } catch (error) {
        console.error('Error marking property as sold:', error);
        // Fallback: Show dialog to manually enter sale info
        toast.info(`Mark "${address}" as sold`, {
          description: 'Use Scout to record sale details: "Mark [address] as sold for $X"',
          duration: 5000,
        });
      }
    },
    [visibleProperties]
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
      velocityEnabled={velocityEnabled}
      onVelocityToggle={setVelocityEnabled}
    />
  );

  const mapPanel = (
    <MapPanel
      properties={visibleProperties}
      highlightedPropertyId={highlightedPropertyId}
      selectedPropertyId={selectedPropertyId}
      onPropertyClick={handleMarkerClick}
      onBoundsChange={setMapBounds}
      velocityEnabled={velocityEnabled}
    />
  );

  const listPanel = (
    <PropertyListPanel
      results={searchResults}
      highlightedPropertyId={highlightedPropertyId}
      selectedPropertyId={selectedPropertyId}
      onPropertyHover={handleCardHover}
      onPropertyClick={handleCardClick}
      onPropertyMarkSold={handleMarkSold}
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
