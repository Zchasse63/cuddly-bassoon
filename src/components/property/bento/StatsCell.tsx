'use client';

/**
 * StatsCell - Property Vitals in Pill Format
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Beds/Baths/SqFt/Year in compact capsule badges
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bed, Bath, Ruler, Calendar, Home, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatsCellProps } from './types';

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}

function StatPill({ icon, label, value }: StatPillProps) {
  if (value === null || value === undefined) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="stat-pill"
    >
      <span className="stat-pill-icon">{icon}</span>
      <span className="text-[var(--fluid-text-secondary)] text-sm">{label}</span>
      <span className="stat-pill-value">{value}</span>
    </motion.div>
  );
}

export const StatsCell = memo(function StatsCell({ property, className }: StatsCellProps) {
  const formatNumber = (num: number | null | undefined) => {
    if (!num) return null;
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <motion.div
      layout
      className={cn('bento-cell bento-stats', className)}
    >
      <StatPill
        icon={<Bed className="h-4 w-4" />}
        label="Beds"
        value={property.bedrooms}
      />
      <StatPill
        icon={<Bath className="h-4 w-4" />}
        label="Baths"
        value={property.bathrooms}
      />
      <StatPill
        icon={<Ruler className="h-4 w-4" />}
        label="Sq Ft"
        value={formatNumber(property.squareFootage)}
      />
      <StatPill
        icon={<Calendar className="h-4 w-4" />}
        label="Built"
        value={property.yearBuilt}
      />
      {property.lotSize && (
        <StatPill
          icon={<Home className="h-4 w-4" />}
          label="Lot"
          value={`${formatNumber(property.lotSize)} sqft`}
        />
      )}
      {property.daysOnMarket !== null && property.daysOnMarket !== undefined && (
        <StatPill
          icon={<Clock className="h-4 w-4" />}
          label="DOM"
          value={`${property.daysOnMarket} days`}
        />
      )}
    </motion.div>
  );
});

