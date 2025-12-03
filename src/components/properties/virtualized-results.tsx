'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { PropertyCard } from './property-card';
import type { PropertySearchResultItem } from '@/lib/filters/types';

interface VirtualizedResultsProps {
  results: PropertySearchResultItem[];
  itemHeight?: number;
  overscan?: number;
  onPropertyClick?: (propertyId: string) => void;
}

/**
 * Virtualized list for rendering large result sets efficiently
 * Only renders items that are visible in the viewport
 */
export function VirtualizedResults({
  results,
  itemHeight = 200,
  overscan = 3,
  onPropertyClick,
}: VirtualizedResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate visible range
  const totalHeight = results.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    results.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = results.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Set up resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // If few results, render normally without virtualization
  if (results.length <= 20) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {results.map((result) => (
          <PropertyCard
            key={result.property.id}
            result={result}
            onClick={() => onPropertyClick?.(result.property.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[600px] overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {visibleItems.map((result) => (
              <div key={result.property.id} style={{ height: itemHeight }}>
                <PropertyCard
                  result={result}
                  onClick={() => onPropertyClick?.(result.property.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

