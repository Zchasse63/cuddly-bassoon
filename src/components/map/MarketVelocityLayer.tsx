'use client';

/**
 * MarketVelocityLayer Component
 * Renders the Market Velocity Index heat map layer on the Mapbox map
 */

import { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import { useQuery } from '@tanstack/react-query';
import { useMap } from './MapProvider';
import type { VelocityHeatMapResponse, VelocityClassification } from '@/types/velocity';
import { VELOCITY_COLOR_SCALE } from '@/types/velocity';

/**
 * Partial velocity data available from map click events
 * (only includes properties stored in GeoJSON features)
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
  /** Callback when a velocity point is clicked. Only partial data is available from the map feature. */
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
  opacity = 0.6,
  onAreaClick,
}: MarketVelocityLayerProps) {
  const { state, setLoading } = useMap();
  // Hovered feature state for styling - setter will be used when events are moved to Map level
  const [hoveredFeature] = useState<string | null>(null);

  // Query for velocity data
  const { data: velocityData, isLoading } = useQuery({
    queryKey: ['marketVelocity', state.bounds, state.viewport.zoom],
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

  // TODO: Move layer click handler to parent Map component with interactiveLayerIds
  // The onAreaClick callback is available but needs to be wired up at the Map level
  void onAreaClick; // Acknowledge prop exists for future implementation

  // Don't render if not visible
  if (!visible) return null;

  const data = velocityData || emptyGeoJSON;

  return (
    <Source id="market-velocity-source" type="geojson" data={data}>
      {/* Circle layer for zip code velocity */}
      <Layer
        id="market-velocity-circles"
        type="circle"
        paint={{
          // Color based on velocity index - hot colors for high velocity
          'circle-color': [
            'step',
            ['get', 'velocityIndex'],
            VELOCITY_COLOR_SCALE[0]!.color, // 0-24: Cold (Blue)
            25,
            VELOCITY_COLOR_SCALE[1]!.color, // 25-39: Cool (Green)
            40,
            VELOCITY_COLOR_SCALE[2]!.color, // 40-54: Balanced (Yellow)
            55,
            VELOCITY_COLOR_SCALE[3]!.color, // 55-69: Warm (Amber)
            70,
            VELOCITY_COLOR_SCALE[4]!.color, // 70-84: Hot (Orange)
            85,
            VELOCITY_COLOR_SCALE[5]!.color, // 85-100: On Fire (Red)
          ],
          // Size based on zoom level
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 8, 8, 12, 12, 16, 20],
          'circle-opacity': opacity,
          'circle-stroke-width': ['case', ['==', ['get', 'zipCode'], hoveredFeature || ''], 2, 0.5],
          'circle-stroke-color': '#1F2937',
          'circle-stroke-opacity': 0.8,
        }}
        // Note: Event handlers need to be registered at the Map level with interactiveLayerIds
        // TODO: Move onClick, onMouseEnter, onMouseLeave to parent Map component
      />

      {/* Label layer for zip codes at higher zoom */}
      <Layer
        id="market-velocity-labels"
        type="symbol"
        minzoom={11}
        layout={{
          'text-field': ['get', 'velocityIndex'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        }}
        paint={{
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
          'text-opacity': opacity,
        }}
      />
    </Source>
  );
}
