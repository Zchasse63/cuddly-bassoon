'use client';

/**
 * PropertyPopup Component
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.1
 * Displays property details in a glass-styled map popup
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Popup } from 'react-map-gl/mapbox';
import { useMap } from './MapProvider';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Home, Ruler, TrendingUp, Percent } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function PropertyPopup() {
  const { state, selectProperty } = useMap();
  const property = state.selectedProperty;

  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const equity = (property.equityPercent as number) || 0;
  const price = (property.estimatedValue as number | undefined) || (property.lastSalePrice as number | undefined) || property.price;

  return (
    <Popup
      longitude={property.longitude}
      latitude={property.latitude}
      anchor="bottom"
      onClose={() => selectProperty(null)}
      closeOnClick={false}
      closeButton={false}
      className="property-popup-glass"
      offset={20}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'w-80 glass-card p-4 rounded-[var(--radius-fluid-standard)]',
            'shadow-xl border border-[var(--border-highlight)]'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <h3 className="text-sm font-semibold text-[var(--fluid-text-primary)] line-clamp-2">
                {property.address}
              </h3>
              {(property.city || property.state) && (
                <p className="text-xs text-[var(--fluid-text-secondary)] mt-0.5">
                  {[property.city, property.state].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 -mt-1 flex-shrink-0 rounded-full hover:bg-[var(--surface-glass-subtle)]"
              onClick={() => selectProperty(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Stats Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(property.bedrooms || property.bathrooms) && (
              <span className="stat-pill">
                <Home className="h-3 w-3" />
                {property.bedrooms || '-'} bd / {property.bathrooms || '-'} ba
              </span>
            )}
            {property.sqft && (
              <span className="stat-pill">
                <Ruler className="h-3 w-3" />
                {property.sqft.toLocaleString()} sqft
              </span>
            )}
            {equity > 0 && (
              <span className={cn(
                'stat-pill',
                equity >= 50 ? 'bg-[var(--fluid-success)]/10 text-[var(--fluid-success)]' :
                equity >= 20 ? 'bg-[var(--fluid-warning)]/10 text-[var(--fluid-warning)]' :
                ''
              )}>
                <Percent className="h-3 w-3" />
                {equity.toFixed(0)}% equity
              </span>
            )}
          </div>

          {/* Price Display */}
          {price && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-[var(--surface-glass-subtle)]">
              <TrendingUp className="h-4 w-4 text-[var(--fluid-success)]" />
              <span className="text-lg font-bold text-[var(--fluid-text-primary)]">
                {formatPrice(price)}
              </span>
            </div>
          )}

          {/* Action Button */}
          <Button
            asChild
            size="sm"
            className="w-full bg-[var(--fluid-brand)] hover:bg-[var(--fluid-brand)]/90 text-white rounded-full"
          >
            <Link href={`/properties/${property.id}`}>
              View Details
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </motion.div>
      </AnimatePresence>
    </Popup>
  );
}

