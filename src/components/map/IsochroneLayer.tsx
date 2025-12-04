'use client';

/**
 * Isochrone Layer Component
 * Renders travel time polygons on the map
 */

import { useState, useCallback } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import { Clock, Car, Footprints, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useMap } from './MapProvider';
import { fetchIsochrone, type TravelProfile, type IsochroneResult } from '@/lib/map/isochrone';
import { cn } from '@/lib/utils';

interface IsochroneLayerProps {
  center?: { lng: number; lat: number };
  className?: string;
}

const PROFILE_OPTIONS: { id: TravelProfile; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'driving', label: 'Drive', icon: Car },
  { id: 'walking', label: 'Walk', icon: Footprints },
  { id: 'cycling', label: 'Bike', icon: Bike },
];

export function IsochroneLayer({ center, className }: IsochroneLayerProps) {
  const { state, addIsochrone, clearIsochrones } = useMap();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geojson, setGeojson] = useState<IsochroneResult | null>(null);
  const [profile, setProfile] = useState<TravelProfile>('driving');
  const [minutes, setMinutes] = useState(15);
  const [isOpen, setIsOpen] = useState(false);

  const queryCenter = center ?? {
    lng: state.viewport.longitude,
    lat: state.viewport.latitude,
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchIsochrone({
        center: queryCenter,
        minutes: [5, 10, 15, 20, 30].filter((m) => m <= minutes),
        profile,
      });
      setGeojson(result);
      
      // Add to map state
      if (result.features.length > 0) {
        const feature = result.features[0];
        if (feature) {
          addIsochrone({
            id: `isochrone_${Date.now()}`,
            center: queryCenter,
            minutes,
            profile,
            geometry: feature.geometry,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch isochrone');
    } finally {
      setIsLoading(false);
    }
  }, [queryCenter, minutes, profile, addIsochrone]);

  const handleClear = useCallback(() => {
    setGeojson(null);
    clearIsochrones();
  }, [clearIsochrones]);

  return (
    <>
      {/* Control Panel */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('bg-background/95 backdrop-blur shadow-lg', className)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Commute Time
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Travel Mode</Label>
              <div className="flex gap-1">
                {PROFILE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <Button
                      key={opt.id}
                      variant={profile === opt.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProfile(opt.id)}
                      className="flex-1"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Travel Time: {minutes} min</Label>
              <Slider
                value={[minutes]}
                onValueChange={([v]) => v && setMinutes(v)}
                min={5}
                max={60}
                step={5}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchData} disabled={isLoading} className="flex-1">
                {isLoading ? 'Loading...' : 'Show Area'}
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </PopoverContent>
      </Popover>

      {/* Render isochrone layers */}
      {geojson && (
        <Source id="isochrone-source" type="geojson" data={geojson}>
          <Layer
            id="isochrone-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'fillColor'],
              'fill-opacity': 0.2,
            }}
          />
          <Layer
            id="isochrone-outline"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 2,
              'line-opacity': 0.8,
            }}
          />
        </Source>
      )}
    </>
  );
}

