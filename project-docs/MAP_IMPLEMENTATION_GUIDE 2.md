# Map Implementation Guide

> **Comprehensive Technical Documentation for Interactive Map Integration**
> 
> Version: 1.0
> Last Updated: December 2024
> Platform: Scout - AI-First Real Estate Wholesaling Platform

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Technical Architecture](#2-technical-architecture)
3. [Step-by-Step Implementation Plan](#3-step-by-step-implementation-plan)
4. [Component Specifications](#4-component-specifications)
5. [Data Flow & API Integration](#5-data-flow--api-integration)
6. [AI Tool Integration](#6-ai-tool-integration)
7. [Performance Considerations](#7-performance-considerations)
8. [Testing & Validation](#8-testing--validation)

---

## 1. Current State Analysis

### 1.1 What's Already Built

The codebase has significant heat map infrastructure that is **ready for map integration** but currently lacks an actual map rendering component.

#### Existing Components

| Component | Location | Status | Description |
|-----------|----------|--------|-------------|
| `HeatMapLayer.tsx` | `src/components/heatmap/` | ✅ Complete | Defines 26 heat map layer types with full configuration |
| `HeatMapControls.tsx` | `src/components/heatmap/` | ✅ Complete | UI controls for layer toggling, opacity, radius |
| `HeatMapLegend.tsx` | `src/components/heatmap/` | ✅ Complete | Color scale legends for active layers |
| `heat-map-data.ts` | `src/lib/shovels/` | ✅ Complete | Shovels data provider for 7 permit-based layers |
| Heat Map API | `src/app/api/analytics/heatmap/route.ts` | ✅ Complete | REST API endpoint for heat map data |
| Map Page | `src/app/(dashboard)/map/page.tsx` | ⚠️ Placeholder | Shows "Coming soon" message |
| Heat Map Page | `src/app/(dashboard)/analytics/heatmap/page.tsx` | ⚠️ Placeholder | Has controls but no actual map |

#### Heat Map Layer Categories (26 Total)

```typescript
// From src/components/heatmap/HeatMapLayer.tsx
export type HeatMapLayerType =
  // Global Layers (7)
  | 'price_trends' | 'market_activity' | 'days_on_market' | 'inventory_levels'
  | 'price_per_sqft' | 'appreciation_rate' | 'rental_yield'
  // Differentiator Layers (7)
  | 'distressed_properties' | 'foreclosure_density' | 'vacant_properties'
  | 'absentee_owners' | 'equity_levels' | 'property_age' | 'renovation_potential'
  // User-Specific Layers (5)
  | 'my_searches' | 'my_saved_properties' | 'my_deals' | 'my_buyer_matches'
  | 'my_success_areas'
  // Shovels Layers (7)
  | 'vitality' | 'permit_activity' | 'property_values' | 'rent_growth'
  | 'renovation_wave' | 'electrification' | 'contractor_saturation';
```

#### Existing AI Tools Related to Maps (14 Heat Mapping Tools)

Located in `src/lib/ai/tools/categories/heat-mapping.ts`:

| Tool ID | Name | Description |
|---------|------|-------------|
| `heat_mapping.analyze_area` | Analyze Area | Analyzes geographic area for investment opportunities |
| `heat_mapping.competition_analysis` | Competition Analysis | Analyzes competition levels in area |
| `heat_mapping.detect_opportunities` | Detect Opportunities | Finds high-opportunity areas |
| `heat_mapping.price_trends` | Price Trend Analysis | Analyzes price trends |
| `heat_mapping.distress_indicator` | Distress Indicator | Identifies distressed property concentrations |
| `heat_mapping.equity_analysis` | Equity Analysis | Analyzes equity levels |
| `heat_mapping.absentee_owners` | Absentee Owner Analysis | Identifies absentee owner concentrations |
| `heat_mapping.rental_yield` | Rental Yield Analysis | Calculates rental yields |
| `heat_mapping.inventory` | Inventory Analysis | Analyzes current inventory levels |
| `heat_mapping.days_on_market` | Days on Market Analysis | Analyzes average DOM |
| `heat_mapping.flip_potential` | Flip Potential Analysis | Analyzes flip potential |
| `heat_mapping.school_impact` | School District Impact | Analyzes school impact on values |
| `heat_mapping.crime_impact` | Crime Impact Analysis | Analyzes crime impact |
| `heat_mapping.development` | Development Activity | Tracks development activity |

### 1.2 What's Missing

| Missing Item | Priority | Effort |
|--------------|----------|--------|
| Map library (react-map-gl) | Critical | Low |
| `MapContainer` component | Critical | Medium |
| `PropertyMarker` component | Critical | Medium |
| `HeatMapRenderer` component | Critical | High |
| Property clustering | High | Medium |
| Viewport-based data fetching | High | Medium |
| AI tools for map control | Medium | Medium |
| Mobile-responsive controls | Low | Low |

### 1.3 File Inventory

```
src/
├── components/
│   ├── heatmap/
│   │   ├── index.ts              # Re-exports all heat map components
│   │   ├── HeatMapLayer.tsx      # Layer type definitions & configs (387 lines)
│   │   ├── HeatMapControls.tsx   # UI control panel (180 lines)
│   │   └── HeatMapLegend.tsx     # Legend components (83 lines)
│   └── map/                      # TO BE CREATED
│       ├── index.ts              # Re-exports
│       ├── MapContainer.tsx      # Main map wrapper
│       ├── MapProvider.tsx       # Map context provider
│       ├── PropertyMarker.tsx    # Property pin component
│       ├── PropertyCluster.tsx   # Clustered markers
│       ├── PropertyPopup.tsx     # Info popup on click
│       └── HeatMapRenderer.tsx   # Renders heat layers on map
├── lib/
│   ├── shovels/
│   │   └── heat-map-data.ts      # Shovels heat map data provider (281 lines)
│   └── map/                      # TO BE CREATED
│       ├── config.ts             # Map configuration
│       ├── utils.ts              # Map utility functions
│       └── hooks.ts              # Map-related hooks
├── app/
│   ├── api/
│   │   └── analytics/
│   │       └── heatmap/
│   │           └── route.ts      # Heat map API endpoint (140 lines)
│   └── (dashboard)/
│       ├── map/
│       │   └── page.tsx          # Main map page (49 lines) - NEEDS UPDATE
│       └── analytics/
│           └── heatmap/
│               └── page.tsx      # Heat map analytics page (143 lines) - NEEDS UPDATE
```

---

## 2. Technical Architecture

### 2.1 Recommended Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| `react-map-gl` | ^7.1.7 | React wrapper for Mapbox GL JS |
| `mapbox-gl` | ^3.3.0 | Core map rendering engine |
| `@mapbox/mapbox-gl-geocoder` | ^5.0.2 | Address search/geocoding |
| `supercluster` | ^8.0.1 | Point clustering |

### 2.2 Component Hierarchy

```
MapPage (Route: /map)
├── MapProvider (Context)
│   ├── MapContainer
│   │   ├── ReactMapGL (from react-map-gl)
│   │   │   ├── NavigationControl
│   │   │   ├── GeolocateControl
│   │   │   ├── ScaleControl
│   │   │   ├── HeatMapRenderer
│   │   │   │   └── Source + Layer (for each enabled heat layer)
│   │   │   ├── PropertyMarkers
│   │   │   │   ├── PropertyCluster (when zoomed out)
│   │   │   │   └── PropertyMarker (when zoomed in)
│   │   │   └── PropertyPopup (on marker click)
│   │   └── MapControls (overlay)
│   │       ├── LayerToggle
│   │       ├── FilterPanel
│   │       └── SearchBox
│   ├── HeatMapControls (sidebar - reused)
│   └── HeatMapLegend (overlay - reused)
```

### 2.3 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User Interactions                          │
├─────────────────────────────────────────────────────────────────────┤
│  Natural Language Query  │  UI Controls  │  Map Pan/Zoom  │  Click  │
└────────────┬─────────────┴───────┬───────┴────────┬───────┴────┬────┘
             │                     │                │            │
             ▼                     ▼                ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         MapProvider (Context)                        │
│  State: viewport, enabledLayers[], properties[], selectedProperty   │
└─────────────────────────────────────────────────────────────────────┘
             │                     │                │            │
             ▼                     ▼                ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Layer                                   │
├─────────────────────────────────────────────────────────────────────┤
│  /api/analytics/heatmap  │  /api/properties  │  Shovels API         │
└─────────────────────────────────────────────────────────────────────┘
             │                     │                │
             ▼                     ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Sources                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase Tables:                                                    │
│  - properties (user properties)                                      │
│  - shovels_permits (permit data)                                     │
│  - geo_vitality_scores (area scores)                                 │
│  - shovels_contractors (contractor density)                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 State Management

The map uses React Context for state management:

```typescript
interface MapState {
  // Viewport
  viewport: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  
  // Layers
  enabledLayers: HeatMapLayerType[];
  layerOpacity: number;
  layerRadius: number;
  
  // Properties
  properties: Property[];
  selectedProperty: Property | null;
  clusteredProperties: ClusterFeature[];
  
  // UI State
  isLoading: boolean;
  showControls: boolean;
  showLegend: boolean;
  
  // Bounds for data fetching
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
```

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Package Installation (15 minutes)

#### Step 1.1: Install Dependencies

```bash
npm install react-map-gl mapbox-gl @mapbox/mapbox-gl-geocoder supercluster
npm install -D @types/mapbox-gl @types/supercluster
```

#### Step 1.2: Add CSS Import

In `src/app/layout.tsx` or `src/app/globals.css`:

```css
@import 'mapbox-gl/dist/mapbox-gl.css';
```

#### Step 1.3: Verify Environment Variable

Ensure `.env.local` contains:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

**Acceptance Criteria:**
- [ ] All packages installed without errors
- [ ] `npm run build` succeeds
- [ ] Mapbox CSS is imported

---

### Phase 2: Map Configuration & Utilities (1 hour)

#### Step 2.1: Create Map Configuration

Create `src/lib/map/config.ts`:

```typescript
export const MAP_CONFIG = {
  // Default map center (US)
  defaultCenter: {
    longitude: -98.5795,
    latitude: 39.8283,
  },
  
  // Default zoom levels
  zoom: {
    default: 4,
    state: 6,
    city: 10,
    neighborhood: 13,
    property: 16,
    max: 20,
    min: 2,
  },
  
  // Clustering
  clustering: {
    enabled: true,
    radius: 50,
    maxZoom: 14,
    minPoints: 2,
  },
  
  // Map style
  style: 'mapbox://styles/mapbox/light-v11',
  
  // Performance
  maxProperties: 5000,
  debounceMs: 300,
};

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
```

#### Step 2.2: Create Map Utilities

Create `src/lib/map/utils.ts`:

```typescript
import type { LngLatBounds } from 'mapbox-gl';

export function boundsToObject(bounds: LngLatBounds) {
  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

export function isPointInBounds(
  point: { lng: number; lat: number },
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

**Acceptance Criteria:**
- [ ] Map config exports all settings
- [ ] Utility functions work correctly
- [ ] TypeScript types are correct

---

### Phase 3: Map Provider & Context (2 hours)

#### Step 3.1: Create Map Context

Create `src/components/map/MapProvider.tsx`:

```typescript
'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { HeatMapLayerType } from '@/components/heatmap';

interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Property {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  // ... other property fields
}

interface MapState {
  viewport: MapViewport;
  bounds: MapBounds | null;
  enabledLayers: HeatMapLayerType[];
  layerOpacity: number;
  layerRadius: number;
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
}

type MapAction =
  | { type: 'SET_VIEWPORT'; payload: MapViewport }
  | { type: 'SET_BOUNDS'; payload: MapBounds }
  | { type: 'TOGGLE_LAYER'; payload: HeatMapLayerType }
  | { type: 'SET_LAYERS'; payload: HeatMapLayerType[] }
  | { type: 'SET_OPACITY'; payload: number }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'SELECT_PROPERTY'; payload: Property | null }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: MapState = {
  viewport: {
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
  },
  bounds: null,
  enabledLayers: [],
  layerOpacity: 0.7,
  layerRadius: 25,
  properties: [],
  selectedProperty: null,
  isLoading: false,
};

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.payload };
    case 'SET_BOUNDS':
      return { ...state, bounds: action.payload };
    case 'TOGGLE_LAYER':
      const layerId = action.payload;
      const enabledLayers = state.enabledLayers.includes(layerId)
        ? state.enabledLayers.filter((l) => l !== layerId)
        : [...state.enabledLayers, layerId];
      return { ...state, enabledLayers };
    case 'SET_LAYERS':
      return { ...state, enabledLayers: action.payload };
    case 'SET_OPACITY':
      return { ...state, layerOpacity: action.payload };
    case 'SET_RADIUS':
      return { ...state, layerRadius: action.payload };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'SELECT_PROPERTY':
      return { ...state, selectedProperty: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface MapContextValue {
  state: MapState;
  setViewport: (viewport: MapViewport) => void;
  setBounds: (bounds: MapBounds) => void;
  toggleLayer: (layerId: HeatMapLayerType) => void;
  setLayers: (layers: HeatMapLayerType[]) => void;
  setOpacity: (opacity: number) => void;
  setRadius: (radius: number) => void;
  setProperties: (properties: Property[]) => void;
  selectProperty: (property: Property | null) => void;
  flyTo: (coords: { lng: number; lat: number; zoom?: number }) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const setViewport = useCallback((viewport: MapViewport) => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  }, []);

  const setBounds = useCallback((bounds: MapBounds) => {
    dispatch({ type: 'SET_BOUNDS', payload: bounds });
  }, []);

  const toggleLayer = useCallback((layerId: HeatMapLayerType) => {
    dispatch({ type: 'TOGGLE_LAYER', payload: layerId });
  }, []);

  const setLayers = useCallback((layers: HeatMapLayerType[]) => {
    dispatch({ type: 'SET_LAYERS', payload: layers });
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    dispatch({ type: 'SET_OPACITY', payload: opacity });
  }, []);

  const setRadius = useCallback((radius: number) => {
    dispatch({ type: 'SET_RADIUS', payload: radius });
  }, []);

  const setProperties = useCallback((properties: Property[]) => {
    dispatch({ type: 'SET_PROPERTIES', payload: properties });
  }, []);

  const selectProperty = useCallback((property: Property | null) => {
    dispatch({ type: 'SELECT_PROPERTY', payload: property });
  }, []);

  const flyTo = useCallback((coords: { lng: number; lat: number; zoom?: number }) => {
    dispatch({
      type: 'SET_VIEWPORT',
      payload: {
        longitude: coords.lng,
        latitude: coords.lat,
        zoom: coords.zoom || 14,
      },
    });
  }, []);

  return (
    <MapContext.Provider
      value={{
        state,
        setViewport,
        setBounds,
        toggleLayer,
        setLayers,
        setOpacity,
        setRadius,
        setProperties,
        selectProperty,
        flyTo,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
```

**Acceptance Criteria:**
- [ ] MapProvider wraps map pages
- [ ] useMap hook provides all state and actions
- [ ] State updates correctly on user interactions

---

### Phase 4: Core Map Components (4-6 hours)

#### Step 4.1: Create MapContainer Component

Create `src/components/map/MapContainer.tsx`:

```typescript
'use client';

import { useRef, useCallback, useEffect } from 'react';
import Map, { 
  NavigationControl, 
  GeolocateControl, 
  ScaleControl,
  MapRef 
} from 'react-map-gl';
import { useMap } from './MapProvider';
import { PropertyMarkers } from './PropertyMarkers';
import { HeatMapRenderer } from './HeatMapRenderer';
import { PropertyPopup } from './PropertyPopup';
import { MAPBOX_TOKEN, MAP_CONFIG } from '@/lib/map/config';
import { boundsToObject } from '@/lib/map/utils';
import { useDebouncedCallback } from 'use-debounce';

interface MapContainerProps {
  className?: string;
}

export function MapContainer({ className }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const { state, setViewport, setBounds } = useMap();

  // Debounced bounds update for performance
  const handleMoveEnd = useDebouncedCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        setBounds(boundsToObject(bounds));
      }
    }
  }, MAP_CONFIG.debounceMs);

  const handleMove = useCallback(
    (evt: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
      setViewport({
        longitude: evt.viewState.longitude,
        latitude: evt.viewState.latitude,
        zoom: evt.viewState.zoom,
      });
    },
    [setViewport]
  );

  // Set initial bounds on load
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        setBounds(boundsToObject(bounds));
      }
    }
  }, [setBounds]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={state.viewport}
      onMove={handleMove}
      onMoveEnd={handleMoveEnd}
      mapStyle={MAP_CONFIG.style}
      minZoom={MAP_CONFIG.zoom.min}
      maxZoom={MAP_CONFIG.zoom.max}
      style={{ width: '100%', height: '100%' }}
      className={className}
    >
      {/* Map Controls */}
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />
      <ScaleControl position="bottom-left" />

      {/* Heat Map Layers */}
      <HeatMapRenderer />

      {/* Property Markers */}
      <PropertyMarkers />

      {/* Selected Property Popup */}
      {state.selectedProperty && <PropertyPopup />}
    </Map>
  );
}
```

#### Step 4.2: Create HeatMapRenderer Component

Create `src/components/map/HeatMapRenderer.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import { useMap } from './MapProvider';
import { getLayerConfig, type HeatMapLayerType } from '@/components/heatmap';

interface HeatMapData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      value: number;
      zipCode?: string;
    };
  }>;
}

export function HeatMapRenderer() {
  const { state } = useMap();
  const [layerData, setLayerData] = useState<Record<string, HeatMapData>>({});

  // Fetch data for enabled layers
  useEffect(() => {
    if (!state.bounds || state.enabledLayers.length === 0) return;

    const fetchLayerData = async () => {
      const boundsParam = `${state.bounds!.south},${state.bounds!.west},${state.bounds!.north},${state.bounds!.east}`;

      for (const layerId of state.enabledLayers) {
        try {
          const response = await fetch(
            `/api/analytics/heatmap?layer=${layerId}&bounds=${boundsParam}`
          );
          const data = await response.json();

          // Convert to GeoJSON
          const geojson: HeatMapData = {
            type: 'FeatureCollection',
            features: (data.dataPoints || []).map((point: any) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [point.lng || 0, point.lat || 0],
              },
              properties: {
                value: point.value || 0,
                zipCode: point.zip_code,
              },
            })),
          };

          setLayerData((prev) => ({ ...prev, [layerId]: geojson }));
        } catch (error) {
          console.error(`Failed to fetch ${layerId} data:`, error);
        }
      }
    };

    fetchLayerData();
  }, [state.bounds, state.enabledLayers]);

  return (
    <>
      {state.enabledLayers.map((layerId) => {
        const config = getLayerConfig(layerId);
        const data = layerData[layerId];

        if (!config || !data || data.features.length === 0) return null;

        return (
          <Source
            key={layerId}
            id={`source-${layerId}`}
            type="geojson"
            data={data}
          >
            <Layer
              id={`heatmap-${layerId}`}
              type="heatmap"
              paint={{
                'heatmap-weight': ['interpolate', ['linear'], ['get', 'value'], 0, 0, 100, 1],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0,0,0,0)',
                  0.2, config.colorScale[0],
                  0.5, config.colorScale[1] || config.colorScale[0],
                  1, config.colorScale[2] || config.colorScale[1] || config.colorScale[0],
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, state.layerRadius],
                'heatmap-opacity': state.layerOpacity,
              }}
            />
          </Source>
        );
      })}
    </>
  );
}
```

#### Step 4.3: Create PropertyMarkers Component

Create `src/components/map/PropertyMarkers.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { Marker } from 'react-map-gl';
import Supercluster from 'supercluster';
import { useMap } from './MapProvider';
import { MAP_CONFIG } from '@/lib/map/config';
import { Home, MapPin } from 'lucide-react';

interface ClusterProperties {
  cluster: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string;
}

export function PropertyMarkers() {
  const { state, selectProperty } = useMap();

  // Create supercluster instance
  const { clusters, supercluster } = useMemo(() => {
    if (!state.bounds || state.properties.length === 0) {
      return { clusters: [], supercluster: null };
    }

    const points = state.properties.map((property) => ({
      type: 'Feature' as const,
      properties: { ...property, cluster: false },
      geometry: {
        type: 'Point' as const,
        coordinates: [property.longitude, property.latitude],
      },
    }));

    const index = new Supercluster<typeof points[0]['properties']>({
      radius: MAP_CONFIG.clustering.radius,
      maxZoom: MAP_CONFIG.clustering.maxZoom,
      minPoints: MAP_CONFIG.clustering.minPoints,
    });

    index.load(points);

    const clusters = index.getClusters(
      [state.bounds.west, state.bounds.south, state.bounds.east, state.bounds.north],
      Math.floor(state.viewport.zoom)
    );

    return { clusters, supercluster: index };
  }, [state.bounds, state.properties, state.viewport.zoom]);

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const properties = cluster.properties as ClusterProperties;

        if (properties.cluster) {
          // Render cluster
          const size = Math.min(60, 20 + (properties.point_count || 0) * 2);

          return (
            <Marker
              key={`cluster-${properties.cluster_id}`}
              longitude={longitude}
              latitude={latitude}
            >
              <div
                className="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer hover:scale-110 transition-transform shadow-lg"
                style={{ width: size, height: size }}
                onClick={() => {
                  // Zoom in on cluster
                  if (supercluster && properties.cluster_id !== undefined) {
                    const zoom = supercluster.getClusterExpansionZoom(properties.cluster_id);
                    // Trigger flyTo via context
                  }
                }}
              >
                {properties.point_count_abbreviated || properties.point_count}
              </div>
            </Marker>
          );
        }

        // Render individual marker
        return (
          <Marker
            key={`property-${cluster.properties.id}`}
            longitude={longitude}
            latitude={latitude}
            onClick={() => selectProperty(cluster.properties)}
          >
            <div className="cursor-pointer hover:scale-110 transition-transform">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
}
```

#### Step 4.4: Create PropertyPopup Component

Create `src/components/map/PropertyPopup.tsx`:

```typescript
'use client';

import { Popup } from 'react-map-gl';
import { useMap } from './MapProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ExternalLink, DollarSign, Home, MapPin } from 'lucide-react';
import Link from 'next/link';

export function PropertyPopup() {
  const { state, selectProperty } = useMap();
  const property = state.selectedProperty;

  if (!property) return null;

  return (
    <Popup
      longitude={property.longitude}
      latitude={property.latitude}
      anchor="bottom"
      onClose={() => selectProperty(null)}
      closeOnClick={false}
      className="property-popup"
    >
      <Card className="w-72 shadow-lg border-0">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-semibold line-clamp-2">
              {property.address}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-2"
              onClick={() => selectProperty(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Property Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Home className="h-3 w-3" />
              <span>{property.bedrooms || '-'} bd / {property.bathrooms || '-'} ba</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{property.sqft ? `${property.sqft.toLocaleString()} sqft` : '-'}</span>
            </div>
          </div>

          {/* Price if available */}
          {property.price && (
            <div className="flex items-center gap-1 text-lg font-semibold">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>${property.price.toLocaleString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/properties/${property.id}`}>
                View Details
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Popup>
  );
}
```

#### Step 4.5: Create Index Export

Create `src/components/map/index.ts`:

```typescript
export { MapProvider, useMap } from './MapProvider';
export { MapContainer } from './MapContainer';
export { PropertyMarkers } from './PropertyMarkers';
export { PropertyPopup } from './PropertyPopup';
export { HeatMapRenderer } from './HeatMapRenderer';
```

**Acceptance Criteria:**
- [ ] MapContainer renders Mapbox map
- [ ] HeatMapRenderer displays heat layers when enabled
- [ ] PropertyMarkers shows clustered and individual markers
- [ ] PropertyPopup displays on marker click
- [ ] All components integrate with MapProvider context

---

### Phase 5: Page Integration (2 hours)

#### Step 5.1: Update Map Page

Update `src/app/(dashboard)/map/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { Layers, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageContext } from '@/hooks/usePageContext';
import { MapProvider, MapContainer, useMap } from '@/components/map';
import { HeatMapControls, HeatMapLegendCompact, HeatMapLayerType } from '@/components/heatmap';
import { createClient } from '@/lib/supabase/client';

function MapPageContent() {
  const { state, toggleLayer, setOpacity, setRadius, setProperties } = useMap();

  // Fetch properties when bounds change
  useEffect(() => {
    if (!state.bounds) return;

    const fetchProperties = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('properties')
        .select('id, address, city, state, latitude, longitude, bedrooms, bathrooms, sqft, price')
        .gte('latitude', state.bounds!.south)
        .lte('latitude', state.bounds!.north)
        .gte('longitude', state.bounds!.west)
        .lte('longitude', state.bounds!.east)
        .limit(1000);

      if (data) {
        setProperties(data);
      }
    };

    fetchProperties();
  }, [state.bounds, setProperties]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-xl font-semibold">Property Map</h1>
          <p className="text-sm text-muted-foreground">
            {state.properties.length} properties in view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search address..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Map + Controls */}
      <div className="flex-1 relative">
        {/* Map */}
        <MapContainer className="absolute inset-0" />

        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <HeatMapControls
            enabledLayers={state.enabledLayers}
            onLayerToggle={toggleLayer}
            opacity={state.layerOpacity}
            onOpacityChange={setOpacity}
            radius={state.layerRadius}
            onRadiusChange={setRadius}
          />
        </div>

        {/* Legend Overlay */}
        <HeatMapLegendCompact
          enabledLayers={state.enabledLayers}
          className="absolute bottom-4 left-4 z-10"
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  usePageContext('properties');

  return (
    <MapProvider>
      <MapPageContent />
    </MapProvider>
  );
}
```

#### Step 5.2: Update Heat Map Analytics Page

Update `src/app/(dashboard)/analytics/heatmap/page.tsx` similarly, integrating the actual map.

**Acceptance Criteria:**
- [ ] `/map` route displays interactive map
- [ ] `/analytics/heatmap` route displays map with heat layers
- [ ] Properties load based on viewport bounds
- [ ] Heat map controls affect map layers

---

## 4. Component Specifications

### 4.1 MapContainer

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `className` | `string` | No | Additional CSS classes |

**Behavior:**
- Renders full-width/height Mapbox GL map
- Handles viewport changes with debouncing
- Updates bounds on move end
- Integrates all child components

### 4.2 PropertyMarker

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `property` | `Property` | Yes | Property data to display |
| `onClick` | `() => void` | No | Click handler |

**Behavior:**
- Renders pin icon at property coordinates
- Scales on hover
- Triggers popup on click

### 4.3 PropertyCluster

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `count` | `number` | Yes | Number of properties in cluster |
| `coordinates` | `[number, number]` | Yes | Cluster center |
| `clusterId` | `number` | Yes | Supercluster ID |

**Behavior:**
- Displays count in circle
- Size scales with count
- Zooms to expand on click

### 4.4 HeatMapRenderer

**Props:** None (uses context)

**Behavior:**
- Watches `enabledLayers` from context
- Fetches data for each layer when bounds change
- Renders Mapbox heatmap layers
- Applies opacity and radius from context

### 4.5 PropertyPopup

**Props:** None (uses context)

**Behavior:**
- Renders when `selectedProperty` is set
- Displays property summary
- Links to property detail page
- Dismissible via X button or clicking away

---

## 5. Data Flow & API Integration

### 5.1 Property Data Flow

```
User pans/zooms map
        │
        ▼
MapContainer.onMoveEnd
        │
        ▼
useMap().setBounds(newBounds)
        │
        ▼
MapPageContent useEffect detects bounds change
        │
        ▼
Supabase query: properties within bounds
        │
        ▼
useMap().setProperties(data)
        │
        ▼
PropertyMarkers re-renders with new data
        │
        ▼
Supercluster groups into clusters/points
        │
        ▼
Markers displayed on map
```

### 5.2 Heat Map Data Flow

```
User toggles layer in HeatMapControls
        │
        ▼
useMap().toggleLayer('distressed_properties')
        │
        ▼
state.enabledLayers updated
        │
        ▼
HeatMapRenderer useEffect detects change
        │
        ▼
Fetch: /api/analytics/heatmap?layer=distressed_properties&bounds=...
        │
        ▼
Convert response to GeoJSON
        │
        ▼
Update layerData state
        │
        ▼
Mapbox Source + Layer rendered
```

### 5.3 API Endpoints

#### `GET /api/analytics/heatmap`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `layer` | `HeatMapLayerType` | Yes | Layer type to fetch |
| `bounds` | `string` | No | `lat1,lng1,lat2,lng2` format |

**Response:**
```json
{
  "layer": "distressed_properties",
  "dataPoints": [
    { "lat": 25.7617, "lng": -80.1918, "value": 45, "zip_code": "33101" }
  ],
  "count": 150,
  "bounds": [25.5, -80.5, 26.0, -79.5]
}
```

#### `GET /api/properties` (with bounds)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `north` | `number` | North bound |
| `south` | `number` | South bound |
| `east` | `number` | East bound |
| `west` | `number` | West bound |
| `limit` | `number` | Max results (default 1000) |

---

## 6. AI Tool Integration

### 6.1 Existing Tools That Should Trigger Map Updates

| Tool | Trigger | Map Action |
|------|---------|------------|
| `heat_mapping.analyze_area` | User asks "analyze Tampa" | Fly to Tampa, show analysis overlay |
| `heat_mapping.detect_opportunities` | User asks "find hot markets" | Enable opportunity layers, fly to first result |
| `search.by_description` | User asks "show 3-bed homes in Miami" | Set properties, fly to Miami |
| `permits.searchPermitsByArea` | User asks "permits in 33101" | Enable permit_activity layer, fly to zip |

### 6.2 New AI Tools Needed for Map Control

Create `src/lib/ai/tools/categories/map-tools.ts`:

```typescript
// 1. showPropertiesOnMap
// Displays specific properties on the map and flies to them
{
  id: 'map.show_properties',
  name: 'Show Properties on Map',
  description: 'Display properties on the map and center the view',
  inputSchema: z.object({
    propertyIds: z.array(z.string()).optional(),
    bounds: z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }).optional(),
    flyTo: z.object({
      lat: z.number(),
      lng: z.number(),
      zoom: z.number().optional(),
    }).optional(),
  }),
}

// 2. enableMapLayers
// Enables specific heat map layers
{
  id: 'map.enable_layers',
  name: 'Enable Map Layers',
  description: 'Enable or disable heat map layers',
  inputSchema: z.object({
    layers: z.array(z.enum([/* all HeatMapLayerType values */])),
    exclusive: z.boolean().optional().default(false), // If true, disable all other layers
  }),
}

// 3. filterMapByArea
// Filters the map to a specific geographic area
{
  id: 'map.filter_by_area',
  name: 'Filter Map by Area',
  description: 'Filter map to show only a specific area',
  inputSchema: z.object({
    areaType: z.enum(['zip', 'city', 'county', 'state']),
    areaValue: z.string(),
    fitBounds: z.boolean().optional().default(true),
  }),
}

// 4. highlightProperty
// Highlights a specific property on the map
{
  id: 'map.highlight_property',
  name: 'Highlight Property',
  description: 'Highlight and select a property on the map',
  inputSchema: z.object({
    propertyId: z.string(),
    showPopup: z.boolean().optional().default(true),
    flyTo: z.boolean().optional().default(true),
  }),
}

// 5. getMapView
// Returns current map state for context
{
  id: 'map.get_view',
  name: 'Get Map View',
  description: 'Get current map viewport and visible properties',
  inputSchema: z.object({}),
  outputSchema: z.object({
    viewport: z.object({
      center: z.object({ lat: z.number(), lng: z.number() }),
      zoom: z.number(),
      bounds: z.object({ north: z.number(), south: z.number(), east: z.number(), west: z.number() }),
    }),
    visibleProperties: z.number(),
    enabledLayers: z.array(z.string()),
  }),
}
```

### 6.3 Natural Language to Map Actions

| User Query | AI Tool Chain | Map Result |
|------------|---------------|------------|
| "Show me distressed properties in Tampa" | 1. `geocodeAddress('Tampa, FL')` → 2. `map.filter_by_area({city: 'Tampa'})` → 3. `map.enable_layers(['distressed_properties'])` | Map flies to Tampa, distressed layer enabled |
| "What areas have high permit activity?" | 1. `heat_mapping.detect_opportunities({minScore: 70})` → 2. `map.enable_layers(['permit_activity'])` → 3. `map.show_properties({flyTo: {lat, lng}})` | Permit activity layer shown, flies to hottest area |
| "Show me the property at 123 Main St" | 1. `search.by_description('123 Main St')` → 2. `map.highlight_property({propertyId})` | Map flies to property, popup opens |
| "Compare these 3 neighborhoods" | 1. `map.enable_layers(['price_trends', 'distressed_properties'])` → 2. Multiple `heat_mapping.analyze_area()` calls | Layers enabled, areas analyzed |

### 6.4 AI Tool → Map State Bridge

Create a hook that bridges AI tool outputs to map state:

```typescript
// src/hooks/useAIMapBridge.ts
export function useAIMapBridge() {
  const { flyTo, setLayers, selectProperty, setProperties } = useMap();

  const handleAIToolResult = useCallback((toolId: string, result: any) => {
    switch (toolId) {
      case 'map.show_properties':
        if (result.flyTo) {
          flyTo({ lng: result.flyTo.lng, lat: result.flyTo.lat, zoom: result.flyTo.zoom });
        }
        if (result.properties) {
          setProperties(result.properties);
        }
        break;

      case 'map.enable_layers':
        setLayers(result.layers);
        break;

      case 'map.highlight_property':
        if (result.property) {
          selectProperty(result.property);
          if (result.flyTo) {
            flyTo({ lng: result.property.longitude, lat: result.property.latitude, zoom: 16 });
          }
        }
        break;

      case 'heat_mapping.analyze_area':
        // Could highlight area or show overlay
        break;
    }
  }, [flyTo, setLayers, selectProperty, setProperties]);

  return { handleAIToolResult };
}
```

---

## 7. Performance Considerations

### 7.1 Property Clustering

**Implementation:** Use Supercluster for client-side clustering.

```typescript
const supercluster = new Supercluster({
  radius: 50,      // Cluster radius in pixels
  maxZoom: 14,     // Stop clustering at this zoom
  minPoints: 2,    // Minimum points to form cluster
});
```

**Benefits:**
- Prevents rendering thousands of individual markers
- Improves frame rate at low zoom levels
- Reduces DOM nodes

### 7.2 Viewport-Based Loading

**Implementation:** Only fetch properties within current bounds.

```sql
SELECT * FROM properties
WHERE latitude BETWEEN $south AND $north
  AND longitude BETWEEN $west AND $east
LIMIT 1000;
```

**Optimizations:**
- Add spatial index on (latitude, longitude)
- Use PostGIS for more complex queries
- Paginate if > 1000 results

### 7.3 Debouncing Map Events

```typescript
const handleMoveEnd = useDebouncedCallback(() => {
  // Fetch data
}, 300); // 300ms debounce
```

**Benefits:**
- Prevents rapid API calls during drag
- Reduces server load
- Smoother UX

### 7.4 Caching Strategies

| Data Type | Cache Strategy | TTL |
|-----------|---------------|-----|
| Heat map layer data | React Query | 5 minutes |
| Property list | React Query | 1 minute |
| Geocoding results | localStorage | 24 hours |
| Map tiles | Mapbox CDN | Managed by Mapbox |

---

## 8. Testing & Validation

### 8.1 Heat Map Layer Testing

For each of the 26 layers:

```typescript
// Test checklist
describe('Heat Map Layer: distressed_properties', () => {
  it('fetches data from API correctly', async () => {
    const response = await fetch('/api/analytics/heatmap?layer=distressed_properties');
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.layer).toBe('distressed_properties');
    expect(Array.isArray(data.dataPoints)).toBe(true);
  });

  it('renders on map when enabled', () => {
    // Enable layer
    toggleLayer('distressed_properties');
    // Verify Mapbox layer exists
    expect(map.getLayer('heatmap-distressed_properties')).toBeDefined();
  });

  it('respects opacity setting', () => {
    setOpacity(0.5);
    const layer = map.getLayer('heatmap-distressed_properties');
    expect(layer.paint['heatmap-opacity']).toBe(0.5);
  });
});
```

### 8.2 Property Marker Testing

```typescript
describe('PropertyMarkers', () => {
  it('clusters properties at low zoom', () => {
    setViewport({ zoom: 5 });
    setProperties(mockProperties); // 100 properties
    const markers = screen.getAllByTestId('property-marker');
    expect(markers.length).toBeLessThan(100); // Should be clustered
  });

  it('shows individual markers at high zoom', () => {
    setViewport({ zoom: 16 });
    setProperties([mockProperty]);
    expect(screen.getByTestId('property-marker')).toBeInTheDocument();
  });

  it('opens popup on marker click', () => {
    const marker = screen.getByTestId('property-marker');
    fireEvent.click(marker);
    expect(screen.getByText(mockProperty.address)).toBeInTheDocument();
  });
});
```

### 8.3 AI Tool → Map Integration Testing

```typescript
describe('AI Map Integration', () => {
  it('flies to location when AI tool returns coordinates', async () => {
    const { handleAIToolResult } = useAIMapBridge();
    
    await handleAIToolResult('map.show_properties', {
      flyTo: { lat: 25.7617, lng: -80.1918, zoom: 12 }
    });

    expect(state.viewport).toEqual({
      latitude: 25.7617,
      longitude: -80.1918,
      zoom: 12,
    });
  });

  it('enables layers from AI tool result', async () => {
    await handleAIToolResult('map.enable_layers', {
      layers: ['distressed_properties', 'foreclosure_density']
    });

    expect(state.enabledLayers).toContain('distressed_properties');
    expect(state.enabledLayers).toContain('foreclosure_density');
  });
});
```

### 8.4 End-to-End User Workflow Tests

**Workflow: "User asks AI to show distressed properties in Tampa"**

```typescript
describe('E2E: AI Map Query', () => {
  it('complete workflow from query to map display', async () => {
    // 1. User sends message in AI chat
    await userEvent.type(chatInput, 'Show me distressed properties in Tampa');
    await userEvent.click(sendButton);

    // 2. Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/found.*properties/i)).toBeInTheDocument();
    });

    // 3. Verify map state
    expect(state.viewport.zoom).toBeGreaterThan(10); // Zoomed in
    expect(state.enabledLayers).toContain('distressed_properties');
    
    // 4. Verify properties loaded
    expect(state.properties.length).toBeGreaterThan(0);
    expect(state.properties[0].city).toBe('Tampa');

    // 5. Verify visual elements
    expect(screen.getByTestId('heat-layer-distressed_properties')).toBeVisible();
  });
});
```

---

## Appendix A: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS access token | Yes |

## Appendix B: Package Dependencies

```json
{
  "dependencies": {
    "react-map-gl": "^7.1.7",
    "mapbox-gl": "^3.3.0",
    "@mapbox/mapbox-gl-geocoder": "^5.0.2",
    "supercluster": "^8.0.1"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^3.1.0",
    "@types/supercluster": "^7.1.3"
  }
}
```

## Appendix C: Mapbox Style Options

| Style | URL | Best For |
|-------|-----|----------|
| Light | `mapbox://styles/mapbox/light-v11` | General use, heat maps |
| Dark | `mapbox://styles/mapbox/dark-v11` | Night mode |
| Streets | `mapbox://styles/mapbox/streets-v12` | Navigation |
| Satellite | `mapbox://styles/mapbox/satellite-streets-v12` | Property inspection |

---

*Document generated for Scout AI-First Real Estate Platform*

