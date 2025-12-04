'use client';

/**
 * MapContainer Component
 * Main map wrapper using react-map-gl with enhanced features
 */

import { useRef, useCallback, useEffect } from 'react';
import Map, { NavigationControl, GeolocateControl, ScaleControl, MapRef } from 'react-map-gl/mapbox';
import { useDebouncedCallback } from 'use-debounce';
import { useMap } from './MapProvider';
import { PropertyMarkers } from './PropertyMarkers';
import { HeatMapRenderer } from './HeatMapRenderer';
import { PropertyPopup } from './PropertyPopup';
import { DrawControl, type DrawFeature } from './DrawControl';
import { MapStyleToggle, getMapStyleUrl } from './MapStyleToggle';
import { IsochroneLayer } from './IsochroneLayer';
import { MAPBOX_TOKEN, MAP_CONFIG } from '@/lib/map/config';
import { boundsToObject } from '@/lib/map/utils';

interface MapContainerProps {
  className?: string;
  showDrawControl?: boolean;
  showStyleToggle?: boolean;
  showIsochroneControl?: boolean;
}

export function MapContainer({
  className,
  showDrawControl = true,
  showStyleToggle = true,
  showIsochroneControl = true,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const { state, setViewport, setBounds, addDrawnArea, clearDrawnAreas } = useMap();

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
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        setBounds(boundsToObject(bounds));
      }
    }
  }, [setBounds]);

  // Handle draw create
  const handleDrawCreate = useCallback((features: DrawFeature[]) => {
    features.forEach((feature) => {
      if (feature.type === 'Polygon') {
        addDrawnArea({
          id: feature.id,
          type: feature.type,
          coordinates: feature.coordinates,
          properties: feature.properties,
        });
      }
    });
  }, [addDrawnArea]);

  // Handle draw delete
  const handleDrawDelete = useCallback(() => {
    clearDrawnAreas();
  }, [clearDrawnAreas]);

  // Get current map style URL
  const mapStyleUrl = getMapStyleUrl(state.mapStyle);

  // Update viewport when state changes (for flyTo)
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && state.viewport) {
      map.flyTo({
        center: [state.viewport.longitude, state.viewport.latitude],
        zoom: state.viewport.zoom,
        duration: 1000,
      });
    }
  }, [state.viewport.longitude, state.viewport.latitude, state.viewport.zoom]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted ${className}`}>
        <p className="text-muted-foreground">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={state.viewport}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        mapStyle={mapStyleUrl}
        minZoom={MAP_CONFIG.zoom.min}
        maxZoom={MAP_CONFIG.zoom.max}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Map Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Draw Control */}
        {showDrawControl && (
          <DrawControl
            position="top-left"
            controls={{ polygon: true, trash: true }}
            onCreate={handleDrawCreate}
            onDelete={handleDrawDelete}
          />
        )}

        {/* Isochrone Layer */}
        {showIsochroneControl && <IsochroneLayer className="absolute top-2 left-12" />}

        {/* Heat Map Layers */}
        <HeatMapRenderer />

        {/* Property Markers */}
        <PropertyMarkers />

        {/* Selected Property Popup */}
        {state.selectedProperty && <PropertyPopup />}
      </Map>

      {/* Style Toggle - positioned outside Map for better z-index control */}
      {showStyleToggle && (
        <div className="absolute bottom-8 right-2 z-10">
          <MapStyleToggle />
        </div>
      )}
    </div>
  );
}

