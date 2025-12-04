'use client';

/**
 * Draw Control Component
 * Provides polygon/rectangle/circle drawing capabilities on the map
 * Uses @mapbox/mapbox-gl-draw for drawing functionality
 */

import { useCallback, useEffect, useRef } from 'react';
import { useControl } from 'react-map-gl/mapbox';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { ControlPosition } from 'react-map-gl/mapbox';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export interface DrawFeature {
  id: string;
  type: 'Polygon' | 'Point' | 'LineString';
  coordinates: number[][][] | number[] | number[][];
  properties?: Record<string, unknown>;
}

interface DrawControlProps {
  position?: ControlPosition;
  displayControlsDefault?: boolean;
  controls?: {
    point?: boolean;
    line_string?: boolean;
    polygon?: boolean;
    trash?: boolean;
    combine_features?: boolean;
    uncombine_features?: boolean;
  };
  defaultMode?: string;
  onCreate?: (features: DrawFeature[]) => void;
  onUpdate?: (features: DrawFeature[]) => void;
  onDelete?: (features: DrawFeature[]) => void;
  onSelectionChange?: (features: DrawFeature[]) => void;
}

// Custom draw styles for better visibility
const drawStyles = [
  // Polygon fill
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': '#3b82f6',
      'fill-outline-color': '#3b82f6',
      'fill-opacity': 0.15,
    },
  },
  // Polygon outline - active
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#3b82f6',
      'line-dasharray': [0.2, 2],
      'line-width': 2,
    },
  },
  // Vertex points
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#ffffff',
      'circle-stroke-color': '#3b82f6',
      'circle-stroke-width': 2,
    },
  },
  // Midpoint
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 4,
      'circle-color': '#3b82f6',
    },
  },
  // Static polygon fill
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
    paint: {
      'fill-color': '#22c55e',
      'fill-outline-color': '#22c55e',
      'fill-opacity': 0.2,
    },
  },
  // Static polygon outline
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#22c55e',
      'line-width': 2,
    },
  },
];

function extractFeatures(e: { features: GeoJSON.Feature[] }): DrawFeature[] {
  return e.features.map((f) => ({
    id: f.id as string,
    type: f.geometry.type as DrawFeature['type'],
    coordinates: (f.geometry as GeoJSON.Polygon | GeoJSON.Point | GeoJSON.LineString).coordinates as DrawFeature['coordinates'],
    properties: f.properties as Record<string, unknown>,
  }));
}

export function DrawControl({
  position = 'top-left',
  displayControlsDefault = false,
  controls = {
    polygon: true,
    trash: true,
  },
  defaultMode = 'simple_select',
  onCreate,
  onUpdate,
  onDelete,
  onSelectionChange,
}: DrawControlProps) {
  const drawRef = useRef<MapboxDraw | null>(null);

  const onCreateCallback = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      onCreate?.(extractFeatures(e));
    },
    [onCreate]
  );

  const onUpdateCallback = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      onUpdate?.(extractFeatures(e));
    },
    [onUpdate]
  );

  const onDeleteCallback = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      onDelete?.(extractFeatures(e));
    },
    [onDelete]
  );

  const onSelectionCallback = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      onSelectionChange?.(extractFeatures(e));
    },
    [onSelectionChange]
  );

  useControl<MapboxDraw>(
    () => {
      const draw = new MapboxDraw({
        displayControlsDefault,
        controls,
        defaultMode,
        styles: drawStyles,
      });
      drawRef.current = draw;
      return draw;
    },
    ({ map }) => {
      map.on('draw.create', onCreateCallback);
      map.on('draw.update', onUpdateCallback);
      map.on('draw.delete', onDeleteCallback);
      map.on('draw.selectionchange', onSelectionCallback);
    },
    ({ map }) => {
      map.off('draw.create', onCreateCallback);
      map.off('draw.update', onUpdateCallback);
      map.off('draw.delete', onDeleteCallback);
      map.off('draw.selectionchange', onSelectionCallback);
    },
    { position }
  );

  // Expose draw instance methods
  useEffect(() => {
    // Clean up on unmount
    return () => {
      drawRef.current = null;
    };
  }, []);

  return null;
}

// Hook to access draw control programmatically
export function useDrawControl() {
  const drawRef = useRef<MapboxDraw | null>(null);

  const setPolygon = useCallback((coordinates: number[][][]) => {
    if (!drawRef.current) return null;
    const featureId = drawRef.current.add({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates,
      },
      properties: {},
    });
    return featureId;
  }, []);

  const clearAll = useCallback(() => {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
  }, []);

  const getAll = useCallback(() => {
    if (!drawRef.current) return null;
    return drawRef.current.getAll();
  }, []);

  return { setPolygon, clearAll, getAll, drawRef };
}

