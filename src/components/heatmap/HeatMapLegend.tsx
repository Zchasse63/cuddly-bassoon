'use client';

import { HeatMapLayerConfig, getLayerConfig, HeatMapLayerType } from './HeatMapLayer';

interface HeatMapLegendProps {
  enabledLayers: HeatMapLayerType[];
  className?: string;
}

export function HeatMapLegend({ enabledLayers, className }: HeatMapLegendProps) {
  if (enabledLayers.length === 0) return null;

  return (
    <div
      className={`bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg p-3 space-y-3 ${className}`}
    >
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Legend</h4>
      {enabledLayers.map((layerId) => {
        const layer = getLayerConfig(layerId);
        if (!layer) return null;
        return <LegendItem key={layerId} layer={layer} />;
      })}
    </div>
  );
}

function LegendItem({ layer }: { layer: HeatMapLayerConfig }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{layer.name}</span>
        <span className="text-xs text-muted-foreground">{layer.unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{layer.minValue}</span>
        <div
          className="flex-1 h-2 rounded-full"
          style={{
            background: `linear-gradient(to right, ${layer.colorScale.join(', ')})`,
          }}
        />
        <span className="text-xs text-muted-foreground">{layer.maxValue}</span>
      </div>
    </div>
  );
}

// Compact legend for map overlay
export function HeatMapLegendCompact({ enabledLayers, className }: HeatMapLegendProps) {
  if (enabledLayers.length === 0) return null;

  const firstLayer = enabledLayers[0];
  if (!firstLayer) return null;
  const primaryLayer = getLayerConfig(firstLayer);
  if (!primaryLayer) return null;

  return (
    <div
      className={`bg-background/90 backdrop-blur-sm rounded-lg border shadow-md px-3 py-2 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium">{primaryLayer.name}</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{primaryLayer.minValue}</span>
          <div
            className="w-20 h-1.5 rounded-full"
            style={{
              background: `linear-gradient(to right, ${primaryLayer.colorScale.join(', ')})`,
            }}
          />
          <span className="text-xs text-muted-foreground">{primaryLayer.maxValue}</span>
        </div>
        <span className="text-xs text-muted-foreground">{primaryLayer.unit}</span>
        {enabledLayers.length > 1 && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
            +{enabledLayers.length - 1}
          </span>
        )}
      </div>
    </div>
  );
}
