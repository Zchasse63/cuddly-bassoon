'use client';

/**
 * HeatMapRenderer Component
 * Renders heat map layers on the Mapbox map
 */

import { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import { useMap } from './MapProvider';
import { getLayerConfig } from '@/components/heatmap';

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

const emptyGeoJSON: HeatMapData = {
  type: 'FeatureCollection',
  features: [],
};

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
          
          if (!response.ok) continue;
          
          const data = await response.json();

          // Convert to GeoJSON
          const geojson: HeatMapData = {
            type: 'FeatureCollection',
            features: (data.dataPoints || []).map((point: { lng?: number; lat?: number; value?: number; zip_code?: string }) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [point.lng || 0, point.lat || 0] as [number, number],
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
        const data = layerData[layerId] || emptyGeoJSON;

        if (!config) return null;

        return (
          <Source key={layerId} id={`source-${layerId}`} type="geojson" data={data}>
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
                  0,
                  'rgba(0,0,0,0)',
                  0.2,
                  config.colorScale[0],
                  0.5,
                  config.colorScale[1] || config.colorScale[0],
                  1,
                  config.colorScale[2] || config.colorScale[1] || config.colorScale[0],
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0,
                  2,
                  15,
                  state.layerRadius,
                ],
                'heatmap-opacity': state.layerOpacity,
              }}
            />
          </Source>
        );
      })}
    </>
  );
}

