'use client';

/**
 * MapContainer Component
 * Main map wrapper using react-map-gl with enhanced features
 */

import { useRef, useCallback, useState } from 'react';
import Map, {
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  MapRef,
} from 'react-map-gl/mapbox';
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
  padding?: { top: number; bottom: number; left: number; right: number };
  children?: React.ReactNode;
}

export function MapContainer({
  className,
  showDrawControl = true,
  showStyleToggle = true,
  showIsochroneControl = true,
  padding,
  children,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const { state, setViewport, setBounds, addDrawnArea, clearDrawnAreas } = useMap();
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
      setIsMapLoaded(true);
      const bounds = map.getBounds();
      if (bounds) {
        setBounds(boundsToObject(bounds));
      }
    }
  }, [setBounds]);

  // ... (draw handlers kept same)

  // Handle draw create
  const handleDrawCreate = useCallback(
    (features: DrawFeature[]) => {
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
    },
    [addDrawnArea]
  );

  // Handle draw delete
  const handleDrawDelete = useCallback(() => {
    clearDrawnAreas();
  }, [clearDrawnAreas]);

  // Get current map style URL
  const mapStyleUrl = getMapStyleUrl(state.mapStyle);

  // NOTE: Removed automatic flyTo effect that was fighting with user drag interaction.
  // The previous implementation called map.flyTo on every viewport state change,
  // which interrupted user panning/zooming. FlyTo should only be triggered
  // explicitly via user action (e.g., clicking "fly to property" button).

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
        padding={padding}
        style={{ width: '100%', height: '100%' }}
        // Ensure all map interactions are enabled
        dragPan={true}
        dragRotate={true}
        scrollZoom={true}
        doubleClickZoom={true}
        touchZoomRotate={true}
        keyboard={true}
      >
        {/* Map Controls - Moving to top-left to avoid conflict with right-side List Panel */}
        <NavigationControl position="top-left" style={{ marginTop: 80 }} />
        <GeolocateControl position="top-left" style={{ marginTop: 170 }} />
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
        {isMapLoaded && <HeatMapRenderer />}

        {/* Custom layers passed as children (e.g., MarketVelocityLayer) */}
        {isMapLoaded && children}

        {/* Property Markers - Only render after map load to prevent 'appendChild' error */}
        {isMapLoaded && <PropertyMarkers />}

        {/* Selected Property Popup */}
        {state.selectedProperty && isMapLoaded && <PropertyPopup />}
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
