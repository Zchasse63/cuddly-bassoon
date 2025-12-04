'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageContext } from '@/hooks/usePageContext';
import { MapProvider, MapContainer, useMap } from '@/components/map';
import { HeatMapControls, HeatMapLegendCompact } from '@/components/heatmap';
import { createClient } from '@/lib/supabase/client';

/**
 * Map Page Content - Separated for MapProvider context
 */
function MapPageContent() {
  const { state, toggleLayer, setOpacity, setRadius, setProperties } = useMap();
  const [showControls, setShowControls] = useState(true);

  // Fetch properties when bounds change
  useEffect(() => {
    if (!state.bounds) return;

    const fetchProperties = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('properties')
        .select('id, address, city, state, latitude, longitude, bedrooms, bathrooms, square_footage, estimated_value')
        .gte('latitude', state.bounds!.south)
        .lte('latitude', state.bounds!.north)
        .gte('longitude', state.bounds!.west)
        .lte('longitude', state.bounds!.east)
        .limit(1000);

      if (data) {
        // Map to MapProperty format, filtering out properties without coordinates
        const properties = data
          .filter(p => p.latitude != null && p.longitude != null)
          .map(p => ({
            id: p.id,
            address: p.address,
            city: p.city ?? undefined,
            state: p.state ?? undefined,
            latitude: p.latitude!,
            longitude: p.longitude!,
            bedrooms: p.bedrooms ?? undefined,
            bathrooms: p.bathrooms ?? undefined,
            sqft: p.square_footage ?? undefined,
            price: p.estimated_value ?? undefined,
          }));
        setProperties(properties);
      }
    };

    fetchProperties();
  }, [state.bounds, setProperties]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h1 className="text-xl font-semibold">Property Map</h1>
          <p className="text-sm text-muted-foreground">
            {state.properties.length} properties in view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search address..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Map + Controls */}
      <div className="flex-1 relative">
        {/* Map */}
        <MapContainer className="absolute inset-0" />

        {/* Controls Toggle */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 z-10 shadow-md"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute top-4 left-16 z-10">
            <HeatMapControls
              enabledLayers={state.enabledLayers}
              onLayerToggle={toggleLayer}
              opacity={state.layerOpacity}
              onOpacityChange={setOpacity}
              radius={state.layerRadius}
              onRadiusChange={setRadius}
            />
          </div>
        )}

        {/* Legend Overlay */}
        {state.enabledLayers.length > 0 && (
          <HeatMapLegendCompact
            enabledLayers={state.enabledLayers}
            className="absolute bottom-4 left-4 z-10"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Map Page - Interactive property map
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function MapPage() {
  usePageContext('properties'); // Map is property-related

  return (
    <MapProvider>
      <MapPageContent />
    </MapProvider>
  );
}
