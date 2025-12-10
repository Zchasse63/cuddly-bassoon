'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed,
  Bath,
  Maximize,
  Calendar,
  MapPin,
  Phone,
  Star,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  TrendingUp,
  DollarSign,
  Percent,
  User,
  Building,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { springPresets, fadeUpVariants } from '@/lib/animations';
import type { PropertySearchResultItem, FilterId } from '@/lib/filters/types';

/**
 * PropertyCardExpanded Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 7.2 (Bento Detail View)
 *
 * Expanded property detail card for the list panel. Shows comprehensive
 * property information without navigating to full property page.
 *
 * Features:
 * - Glass material styling (surface-glass-high)
 * - Image carousel section (if images available)
 * - Full owner information with contact details
 * - THE NUMBERS section with key financial metrics
 * - Property details and specifications
 * - Motivation signals with all matched filter badges
 * - Action buttons: Contact, Save, Add to Deal
 * - Scout insight section (placeholder for AI-generated insight)
 * - Shared element transition from PropertyCardCompact (layoutId)
 */

interface PropertyCardExpandedProps {
  result: PropertySearchResultItem;
  onClose: () => void;
  onContact: () => void;
  onSave: () => void;
  onAddToDeal: () => void;
  isOpen: boolean;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'N/A';
  }
}

function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
}

function getEquityColor(equity: number | null | undefined): string {
  if (equity === null || equity === undefined) return 'text-muted-foreground';
  if (equity >= 50) return 'text-[var(--fluid-success)]';
  if (equity >= 30) return 'text-[var(--fluid-warning)]';
  return 'text-muted-foreground';
}

function getFilterLabel(filterId: FilterId): string {
  // Convert filter ID to human-readable label
  return filterId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function PropertyCardExpanded({
  result,
  onClose,
  onContact,
  onSave,
  onAddToDeal,
  isOpen,
}: PropertyCardExpandedProps) {
  const { property, filterResults } = result;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Mock images for carousel (in production, these would come from property data)
  const images = [
    '/placeholder-property.jpg', // Replace with actual property images
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Calculate equity dollar amount
  const equityAmount =
    property.equityAmount ||
    (property.estimatedValue && property.mortgageBalance
      ? property.estimatedValue - property.mortgageBalance
      : null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          layoutId={`property-card-${property.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={springPresets.standard}
          className={cn(
            'relative rounded-2xl overflow-hidden',
            // Glass material - higher opacity for better readability
            'bg-white/85 dark:bg-black/80',
            'backdrop-blur-xl backdrop-saturate-[180%]',
            'border border-white/40 dark:border-white/15',
            'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
            'flex flex-col',
            'max-h-[85vh] w-full'
          )}
        >
          {/* Header with close button */}
          <div className="flex items-start justify-between p-4 border-b border-white/20">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">{property.address}</h2>
              <p className="text-sm text-muted-foreground">
                {property.city}, {property.state} {property.zip}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="flex-shrink-0 ml-2" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Image Carousel Section */}
              {images.length > 0 && (
                <motion.div
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative rounded-xl overflow-hidden bg-muted aspect-video"
                >
                  <img
                    src={images[currentImageIndex]}
                    alt={`${property.address} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Carousel controls */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      {/* Image counter */}
                      <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* THE NUMBERS Section */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="size-5 text-[var(--fluid-success)]" />
                  The Numbers
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Estimated Value */}
                  <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground mb-1">Estimated Value</div>
                    <div className="text-xl font-bold font-variant-numeric-tabular">
                      {formatCurrency(property.estimatedValue)}
                    </div>
                  </div>

                  {/* ARV */}
                  <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground mb-1">ARV</div>
                    <div className="text-xl font-bold font-variant-numeric-tabular">
                      {formatCurrency(property.arv)}
                    </div>
                  </div>

                  {/* Equity Percent */}
                  <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Percent className="size-3" />
                      Equity
                    </div>
                    <div
                      className={cn('text-xl font-bold', getEquityColor(property.equityPercent))}
                    >
                      {property.equityPercent !== null && property.equityPercent !== undefined
                        ? `${property.equityPercent.toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </div>

                  {/* Equity Amount */}
                  <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground mb-1">Equity Amount</div>
                    <div
                      className={cn('text-xl font-bold', getEquityColor(property.equityPercent))}
                    >
                      {formatCurrency(equityAmount)}
                    </div>
                  </div>

                  {/* Mortgage Balance */}
                  <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground mb-1">Mortgage Balance</div>
                    <div className="text-lg font-semibold font-variant-numeric-tabular">
                      {formatCurrency(property.mortgageBalance)}
                    </div>
                  </div>

                  {/* Rent Estimate */}
                  <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                    <div className="text-xs text-muted-foreground mb-1">Rent Estimate</div>
                    <div className="text-lg font-semibold font-variant-numeric-tabular">
                      {formatCurrency(property.rentEstimate)}
                    </div>
                  </div>
                </div>

                {/* Last Sale Info */}
                {property.lastSalePrice && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="size-4" />
                      <span>Last Sale</span>
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(property.lastSalePrice)}
                      {property.lastSaleDate && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatDate(property.lastSaleDate)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Property Details Section */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="size-5 text-primary" />
                  Property Details
                </h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {property.bedrooms !== null && property.bedrooms !== undefined && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <Bed className="size-4 text-muted-foreground" />
                      <span className="font-medium">{property.bedrooms}</span>
                      <span className="text-muted-foreground">Beds</span>
                    </div>
                  )}

                  {property.bathrooms !== null && property.bathrooms !== undefined && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <Bath className="size-4 text-muted-foreground" />
                      <span className="font-medium">{property.bathrooms}</span>
                      <span className="text-muted-foreground">Baths</span>
                    </div>
                  )}

                  {property.squareFootage && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <Maximize className="size-4 text-muted-foreground" />
                      <span className="font-medium">{formatNumber(property.squareFootage)}</span>
                      <span className="text-muted-foreground">sqft</span>
                    </div>
                  )}

                  {property.yearBuilt && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="font-medium">{property.yearBuilt}</span>
                      <span className="text-muted-foreground">Built</span>
                    </div>
                  )}

                  {property.lotSize && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span className="font-medium">{formatNumber(property.lotSize)}</span>
                      <span className="text-muted-foreground">sqft lot</span>
                    </div>
                  )}

                  {property.propertyType && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <Building className="size-4 text-muted-foreground" />
                      <span className="font-medium">{property.propertyType}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Owner Information Section */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    Owner Information
                  </h3>
                  {!showContactDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowContactDetails(true)}
                      className="text-xs"
                    >
                      Show Contact Details
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {property.ownerName && (
                    <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm">
                      <div className="text-xs text-muted-foreground mb-1">Owner Name</div>
                      <div className="font-semibold">{property.ownerName}</div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {property.ownerType && (
                      <Badge variant="secondary" className="text-xs">
                        {property.ownerType}
                      </Badge>
                    )}
                    {property.isOwnerOccupied === false && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[var(--fluid-warning)] text-[var(--fluid-warning)]"
                      >
                        Absentee Owner
                      </Badge>
                    )}
                    {property.ownerState && property.ownerState !== property.state && (
                      <Badge
                        variant="outline"
                        className="text-xs border-[var(--fluid-warning)] text-[var(--fluid-warning)]"
                      >
                        Out of State
                      </Badge>
                    )}
                    {property.ownershipMonths && property.ownershipMonths >= 12 && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="size-3 mr-1" />
                        Owned {Math.floor(property.ownershipMonths / 12)}y
                      </Badge>
                    )}
                  </div>

                  {/* Contact Details (expandable) */}
                  <AnimatePresence>
                    {showContactDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springPresets.standard}
                        className="space-y-2 overflow-hidden"
                      >
                        {property.mailingAddress && (
                          <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm text-sm">
                            <div className="text-xs text-muted-foreground mb-1">
                              Mailing Address
                            </div>
                            <div>
                              {property.mailingAddress}
                              {property.mailingCity && property.mailingState && (
                                <div className="text-muted-foreground">
                                  {property.mailingCity}, {property.mailingState}{' '}
                                  {property.mailingZip}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="p-3 rounded-lg bg-white/40 dark:bg-black/40 backdrop-blur-sm text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="size-4" />
                            <span>Contact information available via skip trace</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Motivation Signals Section */}
              {filterResults.matchedFilters.length > 0 && (
                <motion.div
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="size-5 text-[var(--fluid-success)]" />
                    Motivation Signals
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {filterResults.matchedFilters.length} matched
                    </Badge>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {filterResults.matchedFilters.map((filterId) => (
                      <Badge
                        key={filterId}
                        variant="outline"
                        className="text-xs border-[var(--fluid-success)] text-[var(--fluid-success)] bg-[var(--fluid-success)]/5"
                      >
                        {getFilterLabel(filterId)}
                      </Badge>
                    ))}
                  </div>

                  {/* Combined Score */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[var(--fluid-success)]/10 to-transparent">
                    <span className="text-sm font-medium">Overall Match Score</span>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-[var(--fluid-success)]">
                        {Math.round(filterResults.combinedScore)}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scout Insight Section (Placeholder) */}
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="size-5 text-primary">🤖</span>
                  Scout Insight
                </h3>

                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground italic">
                    AI-generated insights will appear here based on property analysis and market
                    data.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="p-4 border-t border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-sm"
          >
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onContact();
                }}
              >
                <Phone className="size-4 mr-1" />
                Contact
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <Star className="size-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToDeal();
                }}
              >
                <Plus className="size-4 mr-1" />
                Add to Deal
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
