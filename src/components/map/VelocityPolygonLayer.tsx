'use client';

/**
 * VelocityPolygonLayer Component
 * Renders zip code polygons with velocity-based fill colors
 * Shows at zoom levels 8+ with click interaction for details
 */

import { useEffect, useState, useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import { useQuery } from '@tanstack/react-query';
import { useMap } from './MapProvider';
import type { VelocityHeatMapResponse, VelocityClassification } from '@/types/velocity';
import { VELOCITY_COLOR_SCALE } from '@/types/velocity';
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from 'geojson';

// GeoJSON types for zip code boundaries
interface ZCTAProperties {
  ZCTA5CE20: string; // Zip code
  NAME?: string;
}

type ZCTAGeoJSON = FeatureCollection<Polygon | MultiPolygon, ZCTAProperties>;

// Velocity data for a zip code (from API)
interface VelocityDataPoint {
  zipCode: string;
  velocityIndex: number;
  classification: VelocityClassification;
  centerLat: number;
  centerLng: number;
}

// Extended properties with velocity data merged in
interface VelocityPolygonProperties {
  zipCode: string;
  name?: string;
  velocityIndex: number;
  classification: string;
  hasData: boolean;
  [key: string]: unknown; // Allow additional properties for GeoJSON compatibility
}

type VelocityPolygonGeoJSON = FeatureCollection<Polygon | MultiPolygon, VelocityPolygonProperties>;

export interface VelocityPolygonClickData {
  zipCode: string;
  velocityIndex: number;
  classification: VelocityClassification;
  name?: string;
}

interface VelocityPolygonLayerProps {
  visible: boolean;
  opacity?: number;
  onPolygonClick?: (data: VelocityPolygonClickData) => void;
}

const emptyGeoJSON: VelocityPolygonGeoJSON = {
  type: 'FeatureCollection',
  features: [],
};

// Fetch ZCTA boundary data (static file)
async function fetchZCTABoundaries(): Promise<ZCTAGeoJSON> {
  const response = await fetch('/geo/florida-zcta.json');
  if (!response.ok) {
    throw new Error('Failed to load zip code boundaries');
  }
  return response.json();
}

// Fetch velocity data from API
async function fetchVelocityData(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number
): Promise<VelocityDataPoint[]> {
  const params = new URLSearchParams({
    north: bounds.north.toString(),
    south: bounds.south.toString(),
    east: bounds.east.toString(),
    west: bounds.west.toString(),
    zoom: zoom.toString(),
  });

  const response = await fetch(`/api/market-velocity/heatmap?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch velocity data');
  }

  const json = await response.json();
  const data: VelocityHeatMapResponse = json.data;
  return data.dataPoints.map((p) => ({
    zipCode: p.zipCode || '',
    velocityIndex: p.velocityIndex,
    classification: p.classification,
    centerLat: p.centerLat,
    centerLng: p.centerLng,
  }));
}

export function VelocityPolygonLayer({
  visible,
  opacity = 0.7,
  onPolygonClick,
}: VelocityPolygonLayerProps) {
  const { state, setLoading } = useMap();
  const [hoveredZip, setHoveredZip] = useState<string | null>(null);

  // Round bounds to avoid excessive refetching
  const roundedBounds = state.bounds
    ? {
        north: Math.round(state.bounds.north * 100) / 100,
        south: Math.round(state.bounds.south * 100) / 100,
        east: Math.round(state.bounds.east * 100) / 100,
        west: Math.round(state.bounds.west * 100) / 100,
      }
    : null;

  const roundedZoom = Math.round(state.viewport.zoom * 2) / 2;

  // Query for ZCTA boundaries (static, cached indefinitely)
  const { data: zctaData } = useQuery({
    queryKey: ['zcta-boundaries'],
    queryFn: fetchZCTABoundaries,
    staleTime: Infinity, // Never refetch - static data
    enabled: visible,
  });

  // Query for velocity data (dynamic, based on viewport)
  const { data: velocityData, isLoading } = useQuery({
    queryKey: ['velocity-polygon-data', roundedBounds, roundedZoom],
    queryFn: () =>
      state.bounds ? fetchVelocityData(state.bounds, state.viewport.zoom) : Promise.resolve([]),
    enabled: visible && !!state.bounds,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Merge ZCTA boundaries with velocity data
  const mergedGeoJSON = useMemo((): VelocityPolygonGeoJSON => {
    if (!zctaData || !velocityData) return emptyGeoJSON;

    // Create a lookup map for velocity data by zip code
    const velocityMap = new Map<string, VelocityDataPoint>();
    velocityData.forEach((v) => velocityMap.set(v.zipCode, v));

    // Merge velocity data into ZCTA features
    const features: Feature<Polygon | MultiPolygon, VelocityPolygonProperties>[] =
      zctaData.features.map((feature) => {
        const zipCode = feature.properties?.ZCTA5CE20 || '';
        const velocity = velocityMap.get(zipCode);

        return {
          type: 'Feature' as const,
          properties: {
            zipCode,
            name: feature.properties?.NAME,
            velocityIndex: velocity?.velocityIndex ?? 0,
            classification: velocity?.classification ?? 'Unknown',
            hasData: !!velocity,
          },
          geometry: feature.geometry,
        };
      });

    // Only include features that have velocity data
    return {
      type: 'FeatureCollection' as const,
      features: features.filter((f) => f.properties?.hasData),
    };
  }, [zctaData, velocityData]);

  // Handle polygon click - acknowledge callback for future Map-level implementation
  void onPolygonClick;
  void hoveredZip;
  void setHoveredZip;

  // Don't render if not visible or below minimum zoom
  if (!visible) return null;

  return (
    <Source id="velocity-polygon-source" type="geojson" data={mergedGeoJSON}>
      {/* Fill layer for zip code polygons */}
      <Layer
        id="velocity-polygon-fill"
        type="fill"
        minzoom={8}
        paint={{
          'fill-color': [
            'case',
            ['boolean', ['get', 'hasData'], false],
            [
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
            'rgba(128, 128, 128, 0.2)', // No data - gray
          ],
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8.5,
            0, // Start fade in at zoom 8.5 (as heatmap fades)
            10,
            opacity, // Full opacity at zoom 10 (heatmap is gone)
          ],
        }}
      />

      {/* Outline layer for polygon boundaries */}
      <Layer
        id="velocity-polygon-outline"
        type="line"
        minzoom={9}
        paint={{
          'line-color': '#1F2937',
          'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.5, 12, 1.5],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 11, 0.8],
        }}
      />

      {/* Label layer for zip codes at higher zoom */}
      <Layer
        id="velocity-polygon-labels"
        type="symbol"
        minzoom={11}
        layout={{
          'text-field': [
            'concat',
            ['get', 'zipCode'],
            '\n',
            ['to-string', ['get', 'velocityIndex']],
          ],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10, 14, 14],
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        }}
        paint={{
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5,
          'text-opacity': opacity,
        }}
      />
    </Source>
  );
}
