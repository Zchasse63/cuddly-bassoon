'use client';

/**
 * CompsCell - Comparable Properties
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Mini comp cards, expandable to full list
 */

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, MapPin, Ruler, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CompsCellProps } from './types';

interface CompCardProps {
  comp: {
    id: string;
    address: string;
    price: number;
    sqft: number;
    distance: number;
  };
  index: number;
}

function CompCard({ comp, index }: CompCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pricePerSqft = comp.sqft > 0 ? comp.price / comp.sqft : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex-shrink-0 w-64 p-3 rounded-lg bg-[var(--surface-glass-subtle)] hover:bg-[var(--surface-glass-base)] transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--fluid-primary)]/10 flex items-center justify-center">
            <Home className="h-4 w-4 text-[var(--fluid-primary)]" />
          </div>
          <div>
            <p className="font-semibold text-sm">{formatCurrency(comp.price)}</p>
            <p className="text-xs text-[var(--fluid-text-secondary)]">
              {formatCurrency(pricePerSqft)}/sqft
            </p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-[var(--fluid-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <p className="text-sm text-[var(--fluid-text-primary)] truncate mb-1">
        {comp.address}
      </p>
      
      <div className="flex items-center gap-3 text-xs text-[var(--fluid-text-secondary)]">
        <span className="flex items-center gap-1">
          <Ruler className="h-3 w-3" />
          {comp.sqft.toLocaleString()} sqft
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {comp.distance.toFixed(1)} mi
        </span>
      </div>
    </motion.div>
  );
}

export const CompsCell = memo(function CompsCell({ property: _property, className, comps = [] }: CompsCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mock comps if none provided
  const displayComps = comps.length > 0 ? comps : [
    { id: '1', address: '123 Oak St', price: 285000, sqft: 1800, distance: 0.3 },
    { id: '2', address: '456 Maple Ave', price: 310000, sqft: 2100, distance: 0.5 },
    { id: '3', address: '789 Pine Rd', price: 275000, sqft: 1650, distance: 0.7 },
    { id: '4', address: '321 Elm Dr', price: 295000, sqft: 1900, distance: 0.9 },
  ];

  const visibleComps = isExpanded ? displayComps : displayComps.slice(0, 3);

  // Calculate average price
  const avgPrice = displayComps.reduce((sum, c) => sum + c.price, 0) / displayComps.length;
  const avgPricePerSqft = displayComps.reduce((sum, c) => sum + (c.price / c.sqft), 0) / displayComps.length;

  return (
    <motion.div
      layout
      className={cn('bento-cell bento-comps', className)}
      data-expanded={isExpanded}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--fluid-text-primary)]">Comparable Sales</h3>
          <p className="text-sm text-[var(--fluid-text-secondary)]">
            {displayComps.length} comps • Avg ${Math.round(avgPricePerSqft)}/sqft
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--fluid-primary)]"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show All
            </>
          )}
        </Button>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-[var(--border-highlight)]">
        <AnimatePresence>
          {visibleComps.map((comp, idx) => (
            <CompCard key={comp.id} comp={comp} index={idx} />
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-highlight)] text-sm">
        <span className="text-[var(--fluid-text-secondary)]">Avg Sale Price</span>
        <span className="font-semibold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(avgPrice)}
        </span>
      </div>
    </motion.div>
  );
});

