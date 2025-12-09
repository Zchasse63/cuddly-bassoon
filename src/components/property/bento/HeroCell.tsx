'use client';

/**
 * HeroCell - Property Image Carousel
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Spans full width, shows property images with Street View toggle
 */

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HeroCellProps } from './types';

export const HeroCell = memo(function HeroCell({
  property,
  className,
  images = [],
  showStreetView = false,
  onStreetViewToggle,
}: HeroCellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use property image or placeholder
  const allImages = images.length > 0 ? images : ['/images/property-placeholder.jpg'];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <motion.div layout className={cn('bento-cell bento-hero relative group', className)}>
      {/* Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center rounded-[var(--radius-fluid-standard)]"
            style={{
              backgroundImage: `url(${allImages[currentIndex]})`,
              backgroundColor: 'var(--surface-glass-subtle)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-[var(--radius-fluid-standard)]" />

      {/* Navigation Arrows */}
      {allImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={prevImage}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm hover:bg-white/30"
            onClick={nextImage}
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </>
      )}

      {/* Property Address Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">{property.address}</h1>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span>
                {property.city}, {property.state} {property.zip}
              </span>
            </div>
          </div>

          {/* Street View Toggle */}
          {onStreetViewToggle && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white',
                showStreetView && 'bg-white/40'
              )}
              onClick={onStreetViewToggle}
            >
              <Eye className="h-4 w-4 mr-2" />
              Street View
            </Button>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {property.propertyType && (
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {property.propertyType}
            </Badge>
          )}
          {property.isOwnerOccupied === false && (
            <Badge variant="secondary" className="bg-amber-500/80 text-white border-0">
              Absentee
            </Badge>
          )}
          {property.isListed && (
            <Badge variant="secondary" className="bg-[var(--fluid-primary)]/80 text-white border-0">
              Listed
            </Badge>
          )}
          {property.isPreForeclosure && (
            <Badge variant="secondary" className="bg-[var(--fluid-danger)]/80 text-white border-0">
              Pre-Foreclosure
            </Badge>
          )}
          {property.isTaxDelinquent && (
            <Badge variant="secondary" className="bg-[var(--fluid-warning)]/80 text-white border-0">
              Tax Delinquent
              {property.taxDelinquentYears ? ` (${property.taxDelinquentYears}yr)` : ''}
            </Badge>
          )}
          {property.isVacant && (
            <Badge variant="secondary" className="bg-purple-500/80 text-white border-0">
              Vacant{property.vacancyDurationMonths ? ` (${property.vacancyDurationMonths}mo)` : ''}
            </Badge>
          )}
          {property.hasCodeLiens && (
            <Badge variant="secondary" className="bg-[var(--fluid-danger)]/80 text-white border-0">
              Code Liens{property.codeLiensCount ? ` (${property.codeLiensCount})` : ''}
            </Badge>
          )}
          {property.condition && (
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {property.condition}
            </Badge>
          )}
        </div>

        {/* Listing Description */}
        {property.listingDescription && (
          <div className="mt-3 p-2 rounded-lg bg-black/30 backdrop-blur-sm">
            <p className="text-xs text-white/90 line-clamp-2">{property.listingDescription}</p>
          </div>
        )}
      </div>

      {/* Image Dots */}
      {allImages.length > 1 && (
        <div
          className="absolute bottom-5 right-5 flex gap-1.5"
          role="tablist"
          aria-label="Property images"
        >
          {allImages.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`View image ${idx + 1} of ${allImages.length}`}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              )}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
});
