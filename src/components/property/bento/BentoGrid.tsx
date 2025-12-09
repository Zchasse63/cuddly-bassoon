'use client';

/**
 * BentoGrid - Main Container Component
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Non-linear scanning layout for property details
 */

import { memo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PropertyWithDetails } from '@/lib/properties/types';
import { HeroCell } from './HeroCell';
import { StatsCell } from './StatsCell';
import { ValueCell } from './ValueCell';
import { OwnerCell } from './OwnerCell';
import { ScoutCell } from './ScoutCell';
import { CompsCell } from './CompsCell';
import { ActionsCell } from './ActionsCell';

interface BentoGridProps {
  property: PropertyWithDetails;
  className?: string;
  onCall?: () => void;
  onSkipTrace?: () => void;
  onCreateDeal?: () => void;
  onGenerateOffer?: () => void;
  isSkipTracing?: boolean;
}

export const BentoGrid = memo(function BentoGrid({
  property,
  className,
  onCall,
  onSkipTrace,
  onCreateDeal,
  onGenerateOffer,
  isSkipTracing = false,
}: BentoGridProps) {
  return (
    <LayoutGroup>
      <motion.div
        className={cn('bento-grid', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        role="region"
        aria-label={`Property details for ${property.address}`}
      >
        {/* Hero - Large image carousel */}
        <HeroCell property={property} className="bento-hero" aria-label="Property images" />

        {/* Stats - Quick property facts */}
        <StatsCell property={property} className="bento-stats" />

        {/* Value - The Spread calculation */}
        <ValueCell property={property} className="bento-value" />

        {/* Owner - Contact info with progressive reveal */}
        <OwnerCell
          property={property}
          className="bento-owner"
          onSkipTrace={onSkipTrace}
          isSkipTracing={isSkipTracing}
        />

        {/* Scout - AI insights */}
        <ScoutCell property={property} className="bento-scout" autoFetch={true} />

        {/* Comps - Comparable sales */}
        <CompsCell
          property={property}
          className="bento-comps"
          comps={property.comps?.map((c) => ({
            id: c.id,
            address: c.address,
            price: c.salePrice || 0,
            sqft: c.squareFootage || 0,
            distance: c.distanceMiles || 0,
          }))}
        />

        {/* Actions - Primary CTAs */}
        <ActionsCell
          property={property}
          className="bento-actions"
          onCall={onCall}
          onSkipTrace={onSkipTrace}
          onCreateDeal={onCreateDeal}
          onGenerateOffer={onGenerateOffer}
          isLoading={isSkipTracing}
        />
      </motion.div>
    </LayoutGroup>
  );
});
