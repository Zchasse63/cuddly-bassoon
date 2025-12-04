'use client';

/**
 * Map Provider Component
 * Provides map state management via React Context
 */

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { HeatMapLayerType } from '@/components/heatmap';
import { MAP_CONFIG } from '@/lib/map/config';

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

export interface MapProperty {
  id: string;
  address: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  price?: number;
  [key: string]: unknown;
}

export interface DrawnArea {
  id: string;
  type: 'Polygon' | 'Point' | 'LineString';
  coordinates: number[][][] | number[] | number[][];
  properties?: Record<string, unknown>;
}

export interface IsochroneArea {
  id: string;
  center: { lng: number; lat: number };
  minutes: number;
  profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
  geometry: GeoJSON.Polygon;
}

export type MapStyle = 'streets' | 'satellite' | 'satellite-streets' | 'light' | 'dark';

interface MapState {
  viewport: MapViewport;
  bounds: MapBounds | null;
  enabledLayers: HeatMapLayerType[];
  layerOpacity: number;
  layerRadius: number;
  properties: MapProperty[];
  selectedProperty: MapProperty | null;
  isLoading: boolean;
  // New features
  mapStyle: MapStyle;
  drawnAreas: DrawnArea[];
  isochroneAreas: IsochroneArea[];
  isDrawMode: boolean;
  compareMode: boolean;
}

type MapAction =
  | { type: 'SET_VIEWPORT'; payload: MapViewport }
  | { type: 'SET_BOUNDS'; payload: MapBounds }
  | { type: 'TOGGLE_LAYER'; payload: HeatMapLayerType }
  | { type: 'SET_LAYERS'; payload: HeatMapLayerType[] }
  | { type: 'SET_OPACITY'; payload: number }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_PROPERTIES'; payload: MapProperty[] }
  | { type: 'SELECT_PROPERTY'; payload: MapProperty | null }
  | { type: 'SET_LOADING'; payload: boolean }
  // New actions for enhanced features
  | { type: 'SET_MAP_STYLE'; payload: MapStyle }
  | { type: 'ADD_DRAWN_AREA'; payload: DrawnArea }
  | { type: 'REMOVE_DRAWN_AREA'; payload: string }
  | { type: 'CLEAR_DRAWN_AREAS' }
  | { type: 'ADD_ISOCHRONE'; payload: IsochroneArea }
  | { type: 'REMOVE_ISOCHRONE'; payload: string }
  | { type: 'CLEAR_ISOCHRONES' }
  | { type: 'SET_DRAW_MODE'; payload: boolean }
  | { type: 'SET_COMPARE_MODE'; payload: boolean };

const initialState: MapState = {
  viewport: {
    longitude: MAP_CONFIG.defaultCenter.longitude,
    latitude: MAP_CONFIG.defaultCenter.latitude,
    zoom: MAP_CONFIG.zoom.default,
  },
  bounds: null,
  enabledLayers: [],
  layerOpacity: 0.7,
  layerRadius: 25,
  properties: [],
  selectedProperty: null,
  isLoading: false,
  // New features
  mapStyle: 'streets',
  drawnAreas: [],
  isochroneAreas: [],
  isDrawMode: false,
  compareMode: false,
};

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.payload };
    case 'SET_BOUNDS':
      return { ...state, bounds: action.payload };
    case 'TOGGLE_LAYER': {
      const layerId = action.payload;
      const enabledLayers = state.enabledLayers.includes(layerId)
        ? state.enabledLayers.filter((l) => l !== layerId)
        : [...state.enabledLayers, layerId];
      return { ...state, enabledLayers };
    }
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
    // New feature reducers
    case 'SET_MAP_STYLE':
      return { ...state, mapStyle: action.payload };
    case 'ADD_DRAWN_AREA':
      return { ...state, drawnAreas: [...state.drawnAreas, action.payload] };
    case 'REMOVE_DRAWN_AREA':
      return { ...state, drawnAreas: state.drawnAreas.filter((a) => a.id !== action.payload) };
    case 'CLEAR_DRAWN_AREAS':
      return { ...state, drawnAreas: [] };
    case 'ADD_ISOCHRONE':
      return { ...state, isochroneAreas: [...state.isochroneAreas, action.payload] };
    case 'REMOVE_ISOCHRONE':
      return { ...state, isochroneAreas: state.isochroneAreas.filter((a) => a.id !== action.payload) };
    case 'CLEAR_ISOCHRONES':
      return { ...state, isochroneAreas: [] };
    case 'SET_DRAW_MODE':
      return { ...state, isDrawMode: action.payload };
    case 'SET_COMPARE_MODE':
      return { ...state, compareMode: action.payload };
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
  setProperties: (properties: MapProperty[]) => void;
  selectProperty: (property: MapProperty | null) => void;
  setLoading: (loading: boolean) => void;
  flyTo: (coords: { lng: number; lat: number; zoom?: number }) => void;
  // New feature methods
  setMapStyle: (style: MapStyle) => void;
  addDrawnArea: (area: DrawnArea) => void;
  removeDrawnArea: (id: string) => void;
  clearDrawnAreas: () => void;
  addIsochrone: (isochrone: IsochroneArea) => void;
  removeIsochrone: (id: string) => void;
  clearIsochrones: () => void;
  setDrawMode: (enabled: boolean) => void;
  setCompareMode: (enabled: boolean) => void;
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

  const setProperties = useCallback((properties: MapProperty[]) => {
    dispatch({ type: 'SET_PROPERTIES', payload: properties });
  }, []);

  const selectProperty = useCallback((property: MapProperty | null) => {
    dispatch({ type: 'SELECT_PROPERTY', payload: property });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const flyTo = useCallback((coords: { lng: number; lat: number; zoom?: number }) => {
    dispatch({
      type: 'SET_VIEWPORT',
      payload: {
        longitude: coords.lng,
        latitude: coords.lat,
        zoom: coords.zoom || MAP_CONFIG.zoom.neighborhood,
      },
    });
  }, []);

  // New feature callbacks
  const setMapStyle = useCallback((style: MapStyle) => {
    dispatch({ type: 'SET_MAP_STYLE', payload: style });
  }, []);

  const addDrawnArea = useCallback((area: DrawnArea) => {
    dispatch({ type: 'ADD_DRAWN_AREA', payload: area });
  }, []);

  const removeDrawnArea = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_DRAWN_AREA', payload: id });
  }, []);

  const clearDrawnAreas = useCallback(() => {
    dispatch({ type: 'CLEAR_DRAWN_AREAS' });
  }, []);

  const addIsochrone = useCallback((isochrone: IsochroneArea) => {
    dispatch({ type: 'ADD_ISOCHRONE', payload: isochrone });
  }, []);

  const removeIsochrone = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ISOCHRONE', payload: id });
  }, []);

  const clearIsochrones = useCallback(() => {
    dispatch({ type: 'CLEAR_ISOCHRONES' });
  }, []);

  const setDrawMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_DRAW_MODE', payload: enabled });
  }, []);

  const setCompareMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_COMPARE_MODE', payload: enabled });
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
        setLoading,
        flyTo,
        // New feature methods
        setMapStyle,
        addDrawnArea,
        removeDrawnArea,
        clearDrawnAreas,
        addIsochrone,
        removeIsochrone,
        clearIsochrones,
        setDrawMode,
        setCompareMode,
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

