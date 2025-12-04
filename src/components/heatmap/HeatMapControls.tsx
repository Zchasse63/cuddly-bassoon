'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Globe, Target, User, ChevronDown, ChevronUp, Layers, EyeOff } from 'lucide-react';
import { HeatMapLayerType, HeatMapLayerConfig, getLayersByCategory } from './HeatMapLayer';

interface HeatMapControlsProps {
  enabledLayers: HeatMapLayerType[];
  onLayerToggle: (layerId: HeatMapLayerType) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

export function HeatMapControls({
  enabledLayers,
  onLayerToggle,
  opacity,
  onOpacityChange,
  radius,
  onRadiusChange,
}: HeatMapControlsProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['global']);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const categories = [
    { id: 'global', name: 'Global Layers', icon: Globe, description: 'Market-wide data' },
    {
      id: 'differentiator',
      name: 'Differentiator Layers',
      icon: Target,
      description: 'Investment opportunities',
    },
    { id: 'user', name: 'My Layers', icon: User, description: 'Your activity data' },
    { id: 'shovels', name: 'Permit Data', icon: Layers, description: 'Construction & permits' },
  ];

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4" />
          Heat Map Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Settings */}
        <div className="space-y-3 pb-3 border-b">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Opacity</Label>
              <span className="text-muted-foreground">{Math.round(opacity * 100)}%</span>
            </div>
            <Slider
              value={[opacity * 100]}
              onValueChange={([value]) => onOpacityChange((value ?? 100) / 100)}
              min={10}
              max={100}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Radius</Label>
              <span className="text-muted-foreground">{radius}px</span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={([value]) => onRadiusChange(value ?? 20)}
              min={10}
              max={50}
              step={5}
            />
          </div>
        </div>

        {/* Layer Categories */}
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const layers = getLayersByCategory(category.id as 'global' | 'differentiator' | 'user' | 'shovels');
            const isExpanded = expandedCategories.includes(category.id);
            const enabledCount = layers.filter((l) => enabledLayers.includes(l.id)).length;

            return (
              <div key={category.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {enabledCount > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {enabledCount}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t bg-muted/20 p-2 space-y-1">
                    {layers.map((layer) => (
                      <LayerToggle
                        key={layer.id}
                        layer={layer}
                        enabled={enabledLayers.includes(layer.id)}
                        onToggle={() => onLayerToggle(layer.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Layers Summary */}
        {enabledLayers.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              {enabledLayers.length} layer{enabledLayers.length !== 1 ? 's' : ''} active
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => enabledLayers.forEach((id) => onLayerToggle(id))}
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Hide All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LayerToggle({
  layer,
  enabled,
  onToggle,
}: {
  layer: HeatMapLayerConfig;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layer.colorScale[1] }} />
        <span className="text-sm">{layer.name}</span>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
