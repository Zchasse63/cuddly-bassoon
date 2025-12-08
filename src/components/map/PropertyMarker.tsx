'use client';

import { Marker } from 'react-map-gl/mapbox';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MapProperty } from './MapProvider';

/**
 * PropertyMarker Component
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 * 
 * Custom map marker for properties with:
 * - Price label
 * - Hover scale animation
 * - Pulse effect for highlighted state
 * - Click handler
 * 
 * Note: Clustering is handled by PropertyMarkers component using Supercluster.
 * This component renders individual property markers.
 */

interface PropertyMarkerProps {
  property: MapProperty;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: (property: MapProperty) => void;
  onHover?: (property: MapProperty | null) => void;
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function PropertyMarker({
  property,
  isHighlighted = false,
  isSelected = false,
  onClick,
  onHover,
}: PropertyMarkerProps) {
  const price = property.estimatedValue || property.lastSalePrice;

  return (
    <Marker
      longitude={property.longitude}
      latitude={property.latitude}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(property);
      }}
    >
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => onHover?.(property)}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* Pulse effect for highlighted state */}
        {isHighlighted && (
          <div className="absolute inset-0 -m-2">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </div>
        )}

        {/* Marker Container */}
        <div
          className={cn(
            'relative flex flex-col items-center transition-all duration-200',
            'hover:scale-110',
            isHighlighted && 'scale-110 z-10'
          )}
        >
          {/* Price Label */}
          {price && (
            <div
              className={cn(
                'px-2 py-1 rounded-md text-xs font-semibold shadow-md',
                'transition-all duration-200',
                'bg-white text-gray-900 border border-gray-300',
                isSelected && 'bg-primary text-primary-foreground border-primary',
                isHighlighted && !isSelected && 'bg-primary/10 border-primary'
              )}
            >
              {formatPrice(price)}
            </div>
          )}

          {/* Marker Icon */}
          <div
            className={cn(
              'mt-1 flex items-center justify-center',
              'size-8 rounded-full shadow-lg',
              'transition-all duration-200',
              'bg-primary text-primary-foreground',
              isSelected && 'bg-primary ring-2 ring-primary ring-offset-2',
              isHighlighted && !isSelected && 'bg-primary/80'
            )}
          >
            <Home className="size-4" />
          </div>

          {/* Pointer Triangle */}
          <div
            className={cn(
              'w-0 h-0 -mt-1',
              'border-l-4 border-l-transparent',
              'border-r-4 border-r-transparent',
              'border-t-8',
              'transition-all duration-200',
              'border-t-primary',
              isSelected && 'border-t-primary',
              isHighlighted && !isSelected && 'border-t-primary/80'
            )}
          />
        </div>
      </div>
    </Marker>
  );
}

/**
 * ClusterMarker Component
 * 
 * Renders a cluster of properties with count badge.
 */

interface ClusterMarkerProps {
  longitude: number;
  latitude: number;
  pointCount: number;
  onClick?: () => void;
}

export function ClusterMarker({ longitude, latitude, pointCount, onClick }: ClusterMarkerProps) {
  // Size based on count
  const size = Math.min(60, 30 + pointCount * 0.5);

  return (
    <Marker longitude={longitude} latitude={latitude}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-primary text-primary-foreground font-semibold',
          'cursor-pointer hover:scale-110 transition-transform shadow-lg',
          'border-4 border-white'
        )}
        style={{ width: size, height: size }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        {pointCount}
      </div>
    </Marker>
  );
}

