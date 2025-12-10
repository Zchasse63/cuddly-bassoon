'use client';

/**
 * MarketVelocityLayer Component (Heatmap Mode)
 *
 * Renders velocity data as a Mapbox heatmap layer for low zoom levels (0-10).
 * At higher zoom levels (8+), VelocityPolygonLayer takes over with zip code polygons.
 *
 * The heatmap provides a smooth, blended view of market velocity patterns
 * for regional overview before the user zooms in to see specific zip codes.
 */

import { useEffect } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import { useQuery } from '@tanstack/react-query';
import { useMap } from './MapProvider';
import type { VelocityHeatMapResponse, VelocityClassification } from '@/types/velocity';

/**
 * Partial velocity data available from map click events
 */
export interface VelocityClickData {
  zipCode: string;
  velocityIndex: number;
  classification: VelocityClassification;
}

interface VelocityGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      zipCode: string;
      velocityIndex: number;
      classification: string;
    };
  }>;
}

const emptyGeoJSON: VelocityGeoJSON = {
  type: 'FeatureCollection',
  features: [],
};

interface MarketVelocityLayerProps {
  visible: boolean;
  opacity?: number;
  /** Callback when a velocity point is clicked. Not available for heatmap layer. */
  onAreaClick?: (zipCode: string, data: VelocityClickData) => void;
}

async function fetchVelocityHeatMapData(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number
): Promise<VelocityGeoJSON> {
  const params = new URLSearchParams({
    north: bounds.north.toString(),
    south: bounds.south.toString(),
    east: bounds.east.toString(),
    west: bounds.west.toString(),
    zoom: zoom.toString(),
  });

  const response = await fetch(`/api/market-velocity/heatmap?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch velocity heatmap data');
  }

  const json = await response.json();
  const data: VelocityHeatMapResponse = json.data;

  // Convert to GeoJSON
  const geojson: VelocityGeoJSON = {
    type: 'FeatureCollection',
    features: data.dataPoints
      .filter((point) => point.centerLat && point.centerLng)
      .map((point) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [point.centerLng, point.centerLat] as [number, number],
        },
        properties: {
          zipCode: point.zipCode || '',
          velocityIndex: point.velocityIndex,
          classification: point.classification,
        },
      })),
  };

  return geojson;
}

export function MarketVelocityLayer({
  visible,
  opacity = 0.7,
  onAreaClick,
}: MarketVelocityLayerProps) {
  const { state, setLoading } = useMap();

  // Round zoom to avoid refetching on tiny zoom changes during animation
  const roundedZoom = Math.round(state.viewport.zoom * 2) / 2;

  // Round bounds to avoid refetching on tiny pan changes
  const roundedBounds = state.bounds
    ? {
        north: Math.round(state.bounds.north * 100) / 100,
        south: Math.round(state.bounds.south * 100) / 100,
        east: Math.round(state.bounds.east * 100) / 100,
        west: Math.round(state.bounds.west * 100) / 100,
      }
    : null;

  // Query for velocity data
  const { data: velocityData, isLoading } = useQuery({
    queryKey: ['marketVelocityHeatmap', roundedBounds, roundedZoom],
    queryFn: () =>
      state.bounds
        ? fetchVelocityHeatMapData(state.bounds, state.viewport.zoom)
        : Promise.resolve(emptyGeoJSON),
    enabled: visible && !!state.bounds,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Acknowledge callback (heatmap layers don't support click events)
  void onAreaClick;

  // Don't render if not visible
  if (!visible) return null;

  const data = velocityData || emptyGeoJSON;

  return (
    <Source id="market-velocity-heatmap-source" type="geojson" data={data}>
      {/* Heatmap layer for low zoom overview */}
      <Layer
        id="market-velocity-heatmap"
        type="heatmap"
        maxzoom={12} // Fade out at higher zoom where polygons take over
        paint={{
          // Weight based on velocity index (normalized to 0-1)
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'velocityIndex'], 0, 0, 100, 1],
          // Intensity increases with zoom
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 10, 2],
          // Color ramp from cold (blue) to hot (red)
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0, 0, 255, 0)', // Transparent
            0.1,
            'rgba(59, 130, 246, 0.4)', // Cold - Blue
            0.3,
            'rgba(34, 197, 94, 0.5)', // Cool - Green
            0.5,
            'rgba(234, 179, 8, 0.6)', // Balanced - Yellow
            0.7,
            'rgba(245, 158, 11, 0.7)', // Warm - Amber
            0.85,
            'rgba(234, 88, 12, 0.8)', // Hot - Orange
            1,
            'rgba(220, 38, 38, 0.9)', // On Fire - Red
          ],
          // Radius increases with zoom
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 20, 8, 40, 12, 60],
          // Opacity fades out as zoom increases (polygon layer takes over at zoom 10)
          // Heatmap fully visible up to zoom 8, then fades out completely by zoom 10
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7,
            opacity,
            8.5,
            opacity * 0.5,
            10,
            0, // Fully transparent at zoom 10 - polygons take over
            12,
            0,
          ],
        }}
      />
    </Source>
  );
}
