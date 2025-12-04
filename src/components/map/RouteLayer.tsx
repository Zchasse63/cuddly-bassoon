'use client';

/**
 * Route Layer Component
 * Renders routes with styled line borders
 */

import { Source, Layer } from 'react-map-gl/mapbox';
import { MAP_CONFIG } from '@/lib/map/config';

interface RouteLayerProps {
  id: string;
  coordinates: [number, number][];
  type?: 'default' | 'walking' | 'driving';
  visible?: boolean;
}

export function RouteLayer({ 
  id, 
  coordinates, 
  type = 'default',
  visible = true,
}: RouteLayerProps) {
  if (!visible || coordinates.length < 2) {
    return null;
  }

  const style = MAP_CONFIG.routeStyles[type] ?? MAP_CONFIG.routeStyles.default;
  const defaultStyle = MAP_CONFIG.routeStyles.default;

  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };

  return (
    <Source id={`route-${id}`} type="geojson" data={geojson}>
      {/* Border layer (rendered first, underneath) */}
      {'lineBorderColor' in style && (
        <Layer
          id={`route-${id}-border`}
          type="line"
          layout={{
            'line-join': 'round',
            'line-cap': 'round',
          }}
          paint={{
            'line-color': defaultStyle.lineBorderColor,
            'line-width': (style.lineWidth ?? 4) + (defaultStyle.lineBorderWidth ?? 1) * 2,
          }}
        />
      )}
      
      {/* Main route line */}
      <Layer
        id={`route-${id}-line`}
        type="line"
        layout={{
          'line-join': 'round',
          'line-cap': 'round',
        }}
        paint={{
          'line-color': style.lineColor,
          'line-width': style.lineWidth ?? 4,
          ...('lineDasharray' in style && { 'line-dasharray': [...style.lineDasharray] as number[] }),
        }}
      />
    </Source>
  );
}

/**
 * Multi-route layer for displaying multiple routes
 */
interface MultiRouteLayerProps {
  routes: Array<{
    id: string;
    coordinates: [number, number][];
    type?: 'default' | 'walking' | 'driving';
    label?: string;
  }>;
  visible?: boolean;
}

export function MultiRouteLayer({ routes, visible = true }: MultiRouteLayerProps) {
  if (!visible) {
    return null;
  }

  return (
    <>
      {routes.map((route) => (
        <RouteLayer
          key={route.id}
          id={route.id}
          coordinates={route.coordinates}
          type={route.type}
        />
      ))}
    </>
  );
}

