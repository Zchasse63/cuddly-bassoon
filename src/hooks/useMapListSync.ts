'use client';

import { useState, useCallback } from 'react';

/**
 * useMapListSync Hook
 *
 * Source: Fluid_OS_Master_Plan.md Phase 5.2
 *
 * Provides bidirectional synchronization between map markers and property list.
 * When hovering over a list item, the corresponding map marker highlights.
 * When hovering over a map marker, the corresponding list item highlights.
 */

export interface UseMapListSyncReturn {
  /** Currently highlighted property ID (from hover) */
  highlightedPropertyId: string | null;
  /** Currently selected property ID */
  selectedPropertyId: string | null;
  /** Handle card hover in list */
  handleCardHover: (id: string | null) => void;
  /** Handle card click in list */
  handleCardClick: (id: string) => void;
  /** Handle marker click on map */
  handleMarkerClick: (id: string) => void;
  /** Check if a property is highlighted from list */
  isHighlightedFromList: (id: string) => boolean;
  /** Check if a property is highlighted from map */
  isHighlightedFromMap: (id: string) => boolean;
}

export function useMapListSync(): UseMapListSyncReturn {
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [hoverSource, setHoverSource] = useState<'list' | 'map' | null>(null);

  const handleCardHover = useCallback((id: string | null) => {
    setHighlightedPropertyId(id);
    setHoverSource(id ? 'list' : null);
  }, []);

  const handleCardClick = useCallback((id: string) => {
    setSelectedPropertyId(id);
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedPropertyId(id);
    setHighlightedPropertyId(id);
    setHoverSource('map');
  }, []);

  const isHighlightedFromList = useCallback(
    (id: string) => highlightedPropertyId === id && hoverSource === 'list',
    [highlightedPropertyId, hoverSource]
  );

  const isHighlightedFromMap = useCallback(
    (id: string) => highlightedPropertyId === id && hoverSource === 'map',
    [highlightedPropertyId, hoverSource]
  );

  return {
    highlightedPropertyId,
    selectedPropertyId,
    handleCardHover,
    handleCardClick,
    handleMarkerClick,
    isHighlightedFromList,
    isHighlightedFromMap,
  };
}

