'use client';

/**
 * Compare Map View Component
 * Side-by-side synchronized map comparison
 */

import { useCallback, useState, useRef } from 'react';
import Map, { NavigationControl, type MapRef, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMap } from './MapProvider';
import { getMapStyleUrl } from './MapStyleToggle';
import { MAPBOX_TOKEN } from '@/lib/map/config';
import { cn } from '@/lib/utils';

interface CompareMapViewProps {
  onClose?: () => void;
  className?: string;
}

interface CompareLocation {
  name: string;
  lng: number;
  lat: number;
  zoom: number;
}

export function CompareMapView({ onClose, className }: CompareMapViewProps) {
  const { state, setCompareMode } = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [syncMaps, setSyncMaps] = useState(true);
  
  const leftMapRef = useRef<MapRef>(null);
  const rightMapRef = useRef<MapRef>(null);
  const isUpdating = useRef(false);

  const [leftLocation, setLeftLocation] = useState<CompareLocation>({
    name: 'Location A',
    lng: state.viewport.longitude - 0.05,
    lat: state.viewport.latitude,
    zoom: state.viewport.zoom,
  });

  const [rightLocation, setRightLocation] = useState<CompareLocation>({
    name: 'Location B',
    lng: state.viewport.longitude + 0.05,
    lat: state.viewport.latitude,
    zoom: state.viewport.zoom,
  });

  const handleLeftMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      if (isUpdating.current || !syncMaps) return;
      isUpdating.current = true;
      
      setLeftLocation((prev) => ({
        ...prev,
        lng: evt.viewState.longitude,
        lat: evt.viewState.latitude,
        zoom: evt.viewState.zoom,
      }));

      // Sync right map zoom only (not position)
      setRightLocation((prev) => ({
        ...prev,
        zoom: evt.viewState.zoom,
      }));

      requestAnimationFrame(() => {
        isUpdating.current = false;
      });
    },
    [syncMaps]
  );

  const handleRightMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      if (isUpdating.current || !syncMaps) return;
      isUpdating.current = true;

      setRightLocation((prev) => ({
        ...prev,
        lng: evt.viewState.longitude,
        lat: evt.viewState.latitude,
        zoom: evt.viewState.zoom,
      }));

      // Sync left map zoom only
      setLeftLocation((prev) => ({
        ...prev,
        zoom: evt.viewState.zoom,
      }));

      requestAnimationFrame(() => {
        isUpdating.current = false;
      });
    },
    [syncMaps]
  );

  const handleClose = useCallback(() => {
    setCompareMode(false);
    onClose?.();
  }, [setCompareMode, onClose]);

  const mapStyle = getMapStyleUrl(state.mapStyle);

  return (
    <div
      className={cn(
        'relative bg-background rounded-lg overflow-hidden border shadow-lg',
        isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]',
        className
      )}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-2 bg-background/90 backdrop-blur border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold">Compare Neighborhoods</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={syncMaps}
              onChange={(e) => setSyncMaps(e.target.checked)}
              className="rounded"
            />
            Sync zoom
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Maps Container */}
      <div className="flex h-full pt-12">
        {/* Left Map */}
        <div className="flex-1 relative border-r">
          <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur rounded px-2 py-1">
            <Input
              value={leftLocation.name}
              onChange={(e) => setLeftLocation((p) => ({ ...p, name: e.target.value }))}
              className="h-7 text-sm font-medium bg-transparent border-none p-0"
            />
          </div>
          <Map
            ref={leftMapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            longitude={leftLocation.lng}
            latitude={leftLocation.lat}
            zoom={leftLocation.zoom}
            onMove={handleLeftMove}
            mapStyle={mapStyle}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="bottom-right" />
          </Map>
        </div>

        {/* Right Map */}
        <div className="flex-1 relative">
          <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur rounded px-2 py-1">
            <Input
              value={rightLocation.name}
              onChange={(e) => setRightLocation((p) => ({ ...p, name: e.target.value }))}
              className="h-7 text-sm font-medium bg-transparent border-none p-0"
            />
          </div>
          <Map
            ref={rightMapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            longitude={rightLocation.lng}
            latitude={rightLocation.lat}
            zoom={rightLocation.zoom}
            onMove={handleRightMove}
            mapStyle={mapStyle}
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="bottom-right" />
          </Map>
        </div>
      </div>
    </div>
  );
}

