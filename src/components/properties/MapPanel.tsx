'use client';

import { useEffect } from 'react';
import { MapProvider, MapContainer, useMap, type MapProperty } from '@/components/map';
import { MarketVelocityLayer } from '@/components/map/MarketVelocityLayer';
import { VelocityPolygonLayer } from '@/components/map/VelocityPolygonLayer';
import { cn } from '@/lib/utils';

/**
 * MapPanel Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 *
 * Wrapper component for the property map in split-view layout.
 * Handles map interactions and property marker display.
 */

interface MapPanelProps {
  /** Properties to display on the map */
  properties: MapProperty[];
  /** Currently highlighted property ID (from list hover) */
  highlightedPropertyId: string | null;
  /** Currently selected property ID */
  selectedPropertyId: string | null;
  /** Callback when a property marker is clicked */
  onPropertyClick: (id: string) => void;
  /** Callback when map bounds change */
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
  /** Optional class name */
  className?: string;
  /** Whether to show market velocity heatmap overlay */
  velocityEnabled?: boolean;
}

/**
 * Inner component that has access to map context
 */
function MapPanelInner({
  properties,
  onBoundsChange,
  velocityEnabled,
}: {
  properties: MapProperty[];
  onBoundsChange: MapPanelProps['onBoundsChange'];
  velocityEnabled?: boolean;
}) {
  const { state, setProperties } = useMap();

  // Sync properties to map context
  useEffect(() => {
    setProperties(properties);
  }, [properties, setProperties]);

  // Notify parent of bounds changes
  useEffect(() => {
    if (state.bounds) {
      onBoundsChange(state.bounds);
    }
  }, [state.bounds, onBoundsChange]);

  return (
    <MapContainer
      className="h-full w-full rounded-lg overflow-hidden glass-card"
      showDrawControl={false}
      showStyleToggle={true}
      showIsochroneControl={false}
      // Add padding to ensure map center and controls respect the UI layout
      // Top: 100px (Filter Bar), Right: 420px (List Panel), Bottom: 20px, Left: 20px
      padding={{ top: 100, right: 420, bottom: 20, left: 20 }}
    >
      {/* Market Velocity Layers - Hybrid visualization */}
      {velocityEnabled && (
        <>
          {/* Heatmap layer: visible at zoom 0-10, fades out at higher zoom */}
          <MarketVelocityLayer visible={velocityEnabled} opacity={0.7} />
          {/* Polygon layer: visible at zoom 8+, fades in from heatmap */}
          <VelocityPolygonLayer visible={velocityEnabled} opacity={0.7} />
        </>
      )}
    </MapContainer>
  );
}

export function MapPanel({
  properties,
  highlightedPropertyId: _highlightedPropertyId,
  selectedPropertyId: _selectedPropertyId,
  onPropertyClick: _onPropertyClick,
  onBoundsChange,
  className,
  velocityEnabled,
}: MapPanelProps) {
  // Note: highlightedPropertyId, selectedPropertyId, and onPropertyClick are passed
  // but not used directly here because MapContainer handles markers internally.
  // These props are kept for API compatibility and future enhancements.
  void _highlightedPropertyId;
  void _selectedPropertyId;
  void _onPropertyClick;
  return (
    <div className={cn('h-full w-full', className)}>
      <MapProvider>
        <MapPanelInner
          properties={properties}
          onBoundsChange={onBoundsChange}
          velocityEnabled={velocityEnabled}
        />
      </MapProvider>
    </div>
  );
}
