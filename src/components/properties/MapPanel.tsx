'use client';

import { useEffect } from 'react';
import { MapProvider, MapContainer, useMap, type MapProperty } from '@/components/map';
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
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  /** Optional class name */
  className?: string;
}

/**
 * Inner component that has access to map context
 */
function MapPanelInner({
  properties,
  onBoundsChange,
}: {
  properties: MapProperty[];
  onBoundsChange: MapPanelProps['onBoundsChange'];
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
    />
  );
}

export function MapPanel({
  properties,
  highlightedPropertyId: _highlightedPropertyId,
  selectedPropertyId: _selectedPropertyId,
  onPropertyClick: _onPropertyClick,
  onBoundsChange,
  className,
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
        />
      </MapProvider>
    </div>
  );
}

