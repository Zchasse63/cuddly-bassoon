'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageContext } from '@/hooks/usePageContext';
import {
  HeatMapControls,
  HeatMapLegend,
  HeatMapLegendCompact,
  HeatMapLayerType,
  HEAT_MAP_LAYERS,
} from '@/components/heatmap';

export default function HeatMapPage() {
  usePageContext('analytics-heatmap');
  const [enabledLayers, setEnabledLayers] = useState<HeatMapLayerType[]>(['price_trends']);
  const [opacity, setOpacity] = useState(0.7);
  const [radius, setRadius] = useState(25);

  const handleLayerToggle = useCallback((layerId: HeatMapLayerType) => {
    setEnabledLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="page-title">Heat Map Analytics</h1>
            <p className="page-description">Visualize market data with 21 customizable layers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] relative overflow-hidden">
            <CardContent className="p-0 h-full">
              {/* Placeholder for map integration */}
              <div className="w-full h-full bg-muted/30 flex items-center justify-center relative">
                <div className="text-center space-y-4">
                  <Map className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Map Integration</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Heat map visualization will be rendered here using Mapbox or Google Maps.
                      Configure layers using the controls panel.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {enabledLayers.map((layerId) => {
                      const layer = HEAT_MAP_LAYERS.find((l) => l.id === layerId);
                      return layer ? (
                        <span
                          key={layerId}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${layer.colorScale[1]}20`,
                            color: layer.colorScale[1],
                          }}
                        >
                          {layer.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Legend Overlay */}
                <HeatMapLegendCompact
                  enabledLayers={enabledLayers}
                  className="absolute bottom-4 left-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Layer Info */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                About Heat Map Layers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Global Layers (7)</h4>
                  <p className="text-muted-foreground">
                    Market-wide data including price trends, activity levels, and inventory metrics.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Differentiator Layers (7)</h4>
                  <p className="text-muted-foreground">
                    Investment opportunities like distressed properties, foreclosures, and
                    renovation potential.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">User Layers (5)</h4>
                  <p className="text-muted-foreground">
                    Your personal activity data including searches, saved properties, and success
                    areas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="lg:col-span-1">
          <HeatMapControls
            enabledLayers={enabledLayers}
            onLayerToggle={handleLayerToggle}
            opacity={opacity}
            onOpacityChange={setOpacity}
            radius={radius}
            onRadiusChange={setRadius}
          />

          {/* Full Legend */}
          {enabledLayers.length > 0 && (
            <div className="mt-4">
              <HeatMapLegend enabledLayers={enabledLayers} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
