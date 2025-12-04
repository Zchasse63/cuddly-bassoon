'use client';

/**
 * Map Style Toggle Component
 * Allows switching between different map styles (streets, satellite, etc.)
 */

import { useCallback } from 'react';
import { Map, Satellite, Moon, Sun, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMap, type MapStyle } from './MapProvider';
import { cn } from '@/lib/utils';

interface StyleOption {
  id: MapStyle;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'streets',
    label: 'Streets',
    icon: Map,
    url: 'mapbox://styles/mapbox/streets-v12',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    icon: Satellite,
    url: 'mapbox://styles/mapbox/satellite-v9',
  },
  {
    id: 'satellite-streets',
    label: 'Satellite Streets',
    icon: Layers,
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
    url: 'mapbox://styles/mapbox/light-v11',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: Moon,
    url: 'mapbox://styles/mapbox/dark-v11',
  },
];

export function getMapStyleUrl(style: MapStyle): string {
  const option = STYLE_OPTIONS.find((o) => o.id === style);
  return option?.url ?? STYLE_OPTIONS[0]!.url;
}

interface MapStyleToggleProps {
  className?: string;
  variant?: 'dropdown' | 'buttons';
}

export function MapStyleToggle({ className, variant = 'dropdown' }: MapStyleToggleProps) {
  const { state, setMapStyle } = useMap();
  const currentStyle = STYLE_OPTIONS.find((o) => o.id === state.mapStyle) ?? STYLE_OPTIONS[0]!;

  const handleStyleChange = useCallback(
    (style: MapStyle) => {
      setMapStyle(style);
    },
    [setMapStyle]
  );

  if (variant === 'buttons') {
    return (
      <div className={cn('flex gap-1 bg-background/95 backdrop-blur rounded-lg p-1 shadow-lg', className)}>
        {STYLE_OPTIONS.slice(0, 3).map((option) => {
          const Icon = option.icon;
          const isActive = state.mapStyle === option.id;
          return (
            <Button
              key={option.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStyleChange(option.id)}
              className="h-8 w-8 p-0"
              title={option.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('bg-background/95 backdrop-blur shadow-lg', className)}
        >
          <currentStyle.icon className="h-4 w-4 mr-2" />
          {currentStyle.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {STYLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => handleStyleChange(option.id)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                state.mapStyle === option.id && 'bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

