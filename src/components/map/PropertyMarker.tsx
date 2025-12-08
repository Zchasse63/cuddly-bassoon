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
  const equity = (property.equityPercent as number) || 0;

  // Determine color based on equity
  let markerColorClass = 'bg-slate-500 text-white'; // Default/Low
  if (equity >= 50) markerColorClass = 'bg-emerald-500 text-white shadow-emerald-500/30';
  else if (equity >= 20) markerColorClass = 'bg-amber-500 text-white shadow-amber-500/30';

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
        className="relative cursor-pointer group"
        onMouseEnter={() => onHover?.(property)}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* Pulse effect for highlighted state */}
        {isHighlighted && (
          <div className="absolute inset-0 -m-3">
            <div className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" />
          </div>
        )}

        {/* Marker Container */}
        <div
          className={cn(
            'relative flex flex-col items-center transition-all duration-300 ease-spring-snappy',
            'group-hover:scale-110 group-hover:-translate-y-1',
            isHighlighted && 'scale-125 z-20',
            isSelected && 'scale-125 z-30'
          )}
        >
          {/* Price Label (Glass) */}
          {price && (
            <div
              className={cn(
                'mb-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-md',
                'transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0',
                isHighlighted || isSelected ? 'opacity-100 translate-y-0' : '',
                isSelected
                  ? 'glass-high text-brand-600 ring-1 ring-brand-500'
                  : 'glass-base text-foreground/80'
              )}
            >
              {formatPrice(price)}
            </div>
          )}

          {/* Marker Icon (Squircle) */}
          <div
            className={cn(
              'flex items-center justify-center',
              'size-8 rounded-xl shadow-lg', // Squircle-ish
              'transition-all duration-300',
              markerColorClass,
              isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent'
            )}
          >
            <Home className="size-4" />
          </div>

          {/* Equity Badge (Small dot) if high equity */}
          {equity >= 40 && (
            <div className="absolute -top-1 -right-1 size-3 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="size-2 rounded-full bg-emerald-500" />
            </div>
          )}
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
