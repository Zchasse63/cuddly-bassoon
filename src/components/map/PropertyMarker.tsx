'use client';

import { Marker } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MapProperty } from './MapProvider';

/**
 * PropertyMarker Component
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.1
 *
 * Custom map marker for properties with:
 * - Capsule/pill shape with price
 * - Spring-based hover animations
 * - Ripple effect for list highlight sync
 * - Equity-based color coding
 *
 * Note: Clustering is handled by PropertyMarkers component using Supercluster.
 */

interface PropertyMarkerProps {
  property: MapProperty;
  isHighlighted?: boolean;
  isHighlightedFromList?: boolean;
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

// Spring animation config from design system
const springConfig = { stiffness: 300, damping: 20 };

export function PropertyMarker({
  property,
  isHighlighted = false,
  isHighlightedFromList = false,
  isSelected = false,
  onClick,
  onHover,
}: PropertyMarkerProps) {
  const price = (property.estimatedValue as number | undefined) || (property.lastSalePrice as number | undefined);
  const equity = (property.equityPercent as number) || 0;

  // Determine color based on equity (per design system)
  const getEquityColors = () => {
    if (equity >= 50) return {
      bg: 'bg-[var(--fluid-success)]',
      border: 'border-[var(--fluid-success)]',
      glow: 'shadow-[0_0_20px_rgba(52,199,89,0.4)]',
      text: 'text-white'
    };
    if (equity >= 20) return {
      bg: 'bg-[var(--fluid-warning)]',
      border: 'border-[var(--fluid-warning)]',
      glow: 'shadow-[0_0_20px_rgba(255,159,10,0.4)]',
      text: 'text-white'
    };
    return {
      bg: 'bg-slate-500',
      border: 'border-slate-500',
      glow: '',
      text: 'text-white'
    };
  };

  const colors = getEquityColors();
  const showRipple = isHighlightedFromList || isHighlighted;

  return (
    <Marker
      longitude={property.longitude}
      latitude={property.latitude}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick?.(property);
      }}
    >
      <motion.div
        className="relative cursor-pointer"
        onMouseEnter={() => onHover?.(property)}
        onMouseLeave={() => onHover?.(null)}
        initial={false}
        animate={{
          scale: isSelected ? 1.25 : isHighlighted || isHighlightedFromList ? 1.15 : 1,
          y: isSelected || isHighlighted || isHighlightedFromList ? -4 : 0,
        }}
        transition={{ type: 'spring', ...springConfig }}
        style={{ zIndex: isSelected ? 30 : isHighlighted || isHighlightedFromList ? 20 : 1 }}
      >
        {/* Ripple Effect for List Highlight */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute inset-0 -m-4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <div className={cn(
                'absolute inset-0 rounded-full',
                isHighlightedFromList ? 'bg-[var(--fluid-brand)]/20' : 'bg-[var(--fluid-success)]/20',
                'animate-ping'
              )} />
              <div className={cn(
                'absolute inset-0 rounded-full',
                isHighlightedFromList ? 'bg-[var(--fluid-brand)]/30' : 'bg-[var(--fluid-success)]/30'
              )} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Marker Container */}
        <div className="relative flex flex-col items-center">
          {/* Price Label (Glass Capsule) */}
          <motion.div
            className={cn(
              'mb-1 px-3 py-1.5 rounded-full text-[11px] font-bold',
              'glass-high shadow-lg',
              'border',
              isSelected ? 'border-[var(--fluid-brand)] text-[var(--fluid-brand)]' :
              equity >= 50 ? 'border-[var(--fluid-success)]/50 text-[var(--fluid-success)]' :
              'border-[var(--border-highlight)] text-[var(--fluid-text-primary)]'
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: isSelected || isHighlighted || isHighlightedFromList ? 1 : 0,
              y: isSelected || isHighlighted || isHighlightedFromList ? 0 : 8
            }}
            transition={{ type: 'spring', ...springConfig }}
          >
            {formatPrice(price)}
          </motion.div>

          {/* Marker Icon (Squircle) */}
          <div
            className={cn(
              'flex items-center justify-center',
              'size-9 rounded-xl shadow-lg',
              'transition-all duration-200',
              colors.bg,
              colors.text,
              isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent',
              (isHighlighted || isHighlightedFromList) && colors.glow
            )}
          >
            <Home className="size-4" />
          </div>

          {/* Equity Badge (Small dot) if high equity */}
          {equity >= 40 && (
            <motion.div
              className="absolute -top-0.5 -right-0.5 size-3.5 bg-white rounded-full flex items-center justify-center shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1, ...springConfig }}
            >
              <div className="size-2 rounded-full bg-[var(--fluid-success)]" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </Marker>
  );
}

/**
 * ClusterMarker Component
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.1
 * Renders a cluster of properties with glass styling and expansion animation.
 */

interface ClusterMarkerProps {
  longitude: number;
  latitude: number;
  pointCount: number;
  onClick?: () => void;
}

export function ClusterMarker({ longitude, latitude, pointCount, onClick }: ClusterMarkerProps) {
  // Size based on count (min 36, max 64)
  const size = Math.min(64, 36 + Math.log(pointCount) * 8);

  return (
    <Marker longitude={longitude} latitude={latitude}>
      <motion.div
        className={cn(
          'flex items-center justify-center rounded-full',
          'glass-high font-bold text-[var(--fluid-text-primary)]',
          'cursor-pointer shadow-xl',
          'border-2 border-[var(--border-highlight)]'
        )}
        style={{ width: size, height: size }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...springConfig }}
      >
        <span className="text-sm">{pointCount}</span>
      </motion.div>
    </Marker>
  );
}
