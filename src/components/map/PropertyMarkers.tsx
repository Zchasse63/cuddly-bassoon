'use client';

/**
 * PropertyMarkers Component
 * Renders property markers with clustering support
 */

import { useMemo } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import Supercluster from 'supercluster';
import { useMap, type MapProperty } from './MapProvider';
import { MAP_CONFIG } from '@/lib/map/config';
import { PropertyMarker } from './PropertyMarker';

interface ClusterProperties {
  cluster: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string;
}

type PropertyFeature = {
  type: 'Feature';
  properties: MapProperty & { cluster: boolean };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
};

export function PropertyMarkers() {
  const { state, selectProperty, flyTo } = useMap();

  // Create supercluster instance
  const { clusters, supercluster } = useMemo(() => {
    if (!state.bounds || state.properties.length === 0) {
      return { clusters: [], supercluster: null };
    }

    const points: PropertyFeature[] = state.properties.map((property) => ({
      type: 'Feature' as const,
      properties: { ...property, cluster: false },
      geometry: {
        type: 'Point' as const,
        coordinates: [property.longitude, property.latitude] as [number, number],
      },
    }));

    const index = new Supercluster<MapProperty & { cluster: boolean }>({
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

  const handleClusterClick = (clusterId: number, longitude: number, latitude: number) => {
    if (supercluster) {
      const zoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), MAP_CONFIG.zoom.max);
      flyTo({ lng: longitude, lat: latitude, zoom });
    }
  };

  return (
    <>
      {clusters.map((cluster) => {
        const coords = cluster.geometry.coordinates;
        const longitude = coords[0] ?? 0;
        const latitude = coords[1] ?? 0;
        const properties = cluster.properties as ClusterProperties;

        if (properties.cluster) {
          // Render cluster
          const count = properties.point_count || 0;
          const size = Math.min(60, 20 + count * 0.5);

          return (
            <Marker
              key={`cluster-${properties.cluster_id}`}
              longitude={longitude}
              latitude={latitude}
            >
              <div
                className="flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold cursor-pointer hover:scale-110 transition-transform shadow-lg"
                style={{ width: size, height: size }}
                onClick={() =>
                  properties.cluster_id !== undefined &&
                  handleClusterClick(properties.cluster_id, longitude, latitude)
                }
              >
                {properties.point_count_abbreviated || count}
              </div>
            </Marker>
          );
        }

        // Render individual marker
        const property = cluster.properties as MapProperty;
        return (
          <PropertyMarker
            key={`property-${property.id}`}
            property={property}
            onClick={() => selectProperty(property)}
          />
        );
      })}
    </>
  );
}
