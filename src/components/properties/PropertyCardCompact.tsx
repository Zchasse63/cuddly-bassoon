'use client';

import { motion } from 'framer-motion';
import {
  Bed,
  Bath,
  Maximize,
  Phone,
  Star,
  Building2,
  User,
  AlertTriangle,
  Home as HomeIcon,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { springPresets } from '@/lib/animations';
import type { PropertySearchResultItem } from '@/lib/filters/types';

/**
 * PropertyCardCompact Component
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.3
 *
 * Redesigned compact property card with FluidOS design following the glass material system.
 * Optimized for split-view list panel with bidirectional map sync support.
 *
 * Features:
 * - Glass material (surface-glass-base) with backdrop blur
 * - Owner information (name, type, ownership length)
 * - Distress indicator badges (Pre-Foreclosure, Tax Delinquent, Vacant)
 * - Complete property specs including year built
 * - Equity shown in both percentage AND dollar amount
 * - Working action buttons with event handlers
 * - Bidirectional map sync (isHighlightedFromList prop)
 * - Spring-based micro-interactions
 */

interface PropertyCardCompactProps {
  result: PropertySearchResultItem;
  onClick?: () => void;
  onContact?: (propertyId: string) => void;
  onSave?: (propertyId: string) => void;
  onMarkSold?: (propertyId: string) => void;
  isHighlighted?: boolean;
  isHighlightedFromList?: boolean;
  isSelected?: boolean;
}

// Utility functions
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOwnershipLength(months: number | null | undefined): string {
  if (!months) return 'Unknown';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths}mo`;
  if (remainingMonths === 0) return `${years}y`;
  return `${years}y ${remainingMonths}mo`;
}

function getEquityVariant(equity: number | null | undefined): 'high' | 'medium' | 'low' {
  if (equity === null || equity === undefined) return 'low';
  if (equity >= 50) return 'high';
  if (equity >= 30) return 'medium';
  return 'low';
}

function formatOwnerType(ownerType: string | null | undefined): string {
  if (!ownerType) return 'Individual';

  // Map common owner types to readable labels
  const typeMap: Record<string, string> = {
    Individual: 'Individual',
    Company: 'Company',
    LLC: 'LLC',
    Trust: 'Trust',
    Bank: 'Bank',
    Government: 'Government',
  };

  return typeMap[ownerType] || ownerType;
}

function isCompanyOwner(ownerType: string | null | undefined): boolean {
  const type = ownerType?.toLowerCase() || '';
  return type.includes('company') || type.includes('llc') || type.includes('corp');
}

export function PropertyCardCompact({
  result,
  onClick,
  onContact,
  onSave,
  onMarkSold,
  isHighlighted = false,
  isHighlightedFromList = false,
  isSelected = false,
}: PropertyCardCompactProps) {
  const { property, filterResults, rank } = result;
  const { combinedScore = 0 } = filterResults || {};
  const equityVariant = getEquityVariant(property.equityPercent);

  // Ensure combinedScore is a valid number
  const safeScore = typeof combinedScore === 'number' && !isNaN(combinedScore) ? combinedScore : 0;

  // Calculate equity dollar amount
  const equityAmount =
    property.estimatedValue && property.equityPercent
      ? (property.estimatedValue * property.equityPercent) / 100
      : null;

  // Check for distress indicators
  const hasDistress = property.isPreForeclosure || property.isTaxDelinquent || property.isVacant;

  // Determine if this is an absentee owner
  const isAbsentee =
    property.ownerState && property.state && property.ownerState !== property.state;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={springPresets.snappy}
      className={cn(
        'group relative rounded-xl p-3',
        // Glass card styling per FluidOS Design System Section 2.1
        'bg-white/65 dark:bg-[rgb(28,28,30)]/60',
        'backdrop-blur-[20px] saturate-[180%]',
        'border border-white/40 dark:border-white/15',
        'shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        // Hover state
        'hover:shadow-lg hover:bg-white/85 dark:hover:bg-[rgb(44,44,46)]/80',
        'hover:border-[var(--fluid-brand)]/30 cursor-pointer',
        // Highlight state (map hover sync)
        (isHighlighted || isHighlightedFromList) &&
          'ring-2 ring-[var(--fluid-brand)]/60 shadow-lg bg-white/90 dark:bg-[rgb(44,44,46)]/80',
        // Selected state
        isSelected && 'border-[var(--fluid-brand)] bg-[var(--fluid-brand)]/5',
        'flex flex-col gap-2.5',
        'transition-all duration-200'
      )}
      onClick={onClick}
    >
      {/* Header: Address, Location, and Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate text-[var(--fluid-text-primary)]">
            {property.address}
          </h3>
          <p className="text-xs text-[var(--fluid-text-muted)]">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-[var(--fluid-text-muted)] font-medium">#{rank}</span>
          <div
            className={cn(
              'flex items-center justify-center size-8 rounded-full text-[10px] font-bold',
              'border transition-colors',
              safeScore >= 70 &&
                'bg-[var(--fluid-success)]/10 text-[var(--fluid-success)] border-[var(--fluid-success)]/20',
              safeScore >= 40 &&
                safeScore < 70 &&
                'bg-[var(--fluid-warning)]/10 text-[var(--fluid-warning)] border-[var(--fluid-warning)]/20',
              safeScore < 40 &&
                'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
            )}
          >
            {Math.round(safeScore)}
          </div>
        </div>
      </div>

      {/* Owner Information */}
      {property.ownerName && (
        <div className="flex items-center gap-2 text-xs">
          {isCompanyOwner(property.ownerType) ? (
            <Building2 className="size-3.5 text-[var(--fluid-text-muted)] flex-shrink-0" />
          ) : (
            <User className="size-3.5 text-[var(--fluid-text-muted)] flex-shrink-0" />
          )}
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-[var(--fluid-text-primary)] font-medium truncate">
              {property.ownerName}
            </span>
            <span className="text-[var(--fluid-text-muted)]">•</span>
            <span className="text-[var(--fluid-text-muted)]">
              {formatOwnerType(property.ownerType)}
            </span>
            {isAbsentee && (
              <>
                <span className="text-[var(--fluid-text-muted)]">•</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  Absentee
                </Badge>
              </>
            )}
            {property.ownershipMonths && (
              <>
                <span className="text-[var(--fluid-text-muted)]">•</span>
                <span className="text-[var(--fluid-text-muted)]">
                  {formatOwnershipLength(property.ownershipMonths)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Distress Indicators */}
      {hasDistress && (
        <div className="flex flex-wrap gap-1.5">
          {property.isPreForeclosure && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] h-5 px-2 font-medium',
                'bg-[var(--fluid-danger)]/10 border-[var(--fluid-danger)]/30 text-[var(--fluid-danger)]'
              )}
            >
              <AlertTriangle className="size-2.5 mr-1" />
              Pre-Foreclosure
            </Badge>
          )}
          {property.isTaxDelinquent && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] h-5 px-2 font-medium',
                'bg-[var(--fluid-warning)]/10 border-[var(--fluid-warning)]/30 text-[var(--fluid-warning)]'
              )}
            >
              <AlertTriangle className="size-2.5 mr-1" />
              Tax Delinquent
            </Badge>
          )}
          {property.isVacant && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] h-5 px-2 font-medium',
                'bg-[var(--fluid-warning)]/10 border-[var(--fluid-warning)]/30 text-[var(--fluid-warning)]'
              )}
            >
              <HomeIcon className="size-2.5 mr-1" />
              Vacant
            </Badge>
          )}
        </div>
      )}

      {/* Property Specs Row */}
      <div className="flex items-center gap-3 text-xs text-[var(--fluid-text-muted)]">
        {property.bedrooms && (
          <div className="flex items-center gap-1">
            <Bed className="size-3.5" />
            <span className="font-medium">{property.bedrooms}</span>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex items-center gap-1">
            <Bath className="size-3.5" />
            <span className="font-medium">{property.bathrooms}</span>
          </div>
        )}
        {property.squareFootage && (
          <div className="flex items-center gap-1">
            <Maximize className="size-3.5" />
            <span className="font-medium">{property.squareFootage.toLocaleString()}</span>
          </div>
        )}
        {property.yearBuilt && (
          <div className="flex items-center gap-1">
            <span className="font-medium">{property.yearBuilt}</span>
          </div>
        )}
      </div>

      {/* Price and Equity Section */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="text-base font-bold text-[var(--fluid-text-primary)] tabular-nums">
            {formatCurrency(
              property.estimatedValue || property.lastSalePrice || property.askingPrice
            )}
          </div>
          <div className="text-[10px] text-[var(--fluid-text-muted)] uppercase tracking-wide">
            {property.estimatedValue
              ? 'Est. Value'
              : property.lastSalePrice
                ? 'Last Sale'
                : 'Asking Price'}
          </div>
        </div>
        {property.equityPercent !== null &&
          property.equityPercent !== undefined &&
          property.equityPercent > 0 && (
            <div className="text-right">
              <div
                className={cn(
                  'text-base font-bold tabular-nums',
                  equityVariant === 'high' && 'text-[var(--fluid-success)]',
                  equityVariant === 'medium' && 'text-[var(--fluid-warning)]',
                  equityVariant === 'low' && 'text-[var(--fluid-text-muted)]'
                )}
              >
                {property.equityPercent.toFixed(0)}%
              </div>
              {equityAmount && (
                <div className="text-[10px] text-[var(--fluid-text-muted)] tabular-nums">
                  {formatCurrency(equityAmount)}
                </div>
              )}
              <div className="text-[10px] text-[var(--fluid-text-muted)] uppercase tracking-wide">
                Equity
              </div>
            </div>
          )}
      </div>

      {/* Days on Market (if available) */}
      {property.daysOnMarket !== null && property.daysOnMarket !== undefined && (
        <div className="text-xs text-[var(--fluid-text-muted)]">
          <span className="font-medium">{property.daysOnMarket}</span> days on market
        </div>
      )}

      {/* Matched Filters (Motivation Indicators) */}
      {filterResults.matchedFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filterResults.matchedFilters.slice(0, 3).map((filterId) => (
            <Badge
              key={filterId}
              variant="secondary"
              className="text-[10px] h-5 px-2 bg-[var(--fluid-brand)]/10 text-[var(--fluid-brand)] border-[var(--fluid-brand)]/20"
            >
              {filterId.replace(/_/g, ' ')}
            </Badge>
          ))}
          {filterResults.matchedFilters.length > 3 && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-2 text-[var(--fluid-text-muted)]"
            >
              +{filterResults.matchedFilters.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/20 dark:border-white/10">
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'flex-1 h-8 text-xs font-medium',
            'glass-high hover:bg-[var(--fluid-brand)]/10 hover:text-[var(--fluid-brand)] hover:border-[var(--fluid-brand)]/30',
            'transition-colors duration-200'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onContact?.(property.id);
          }}
        >
          <Phone className="size-3 mr-1.5" />
          Contact
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'flex-1 h-8 text-xs font-medium',
            'glass-high hover:bg-[var(--fluid-warning)]/10 hover:text-[var(--fluid-warning)] hover:border-[var(--fluid-warning)]/30',
            'transition-colors duration-200'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.(property.id);
          }}
        >
          <Star className="size-3 mr-1.5" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            'flex-1 h-8 text-xs font-medium',
            'glass-high hover:bg-[var(--fluid-danger)]/10 hover:text-[var(--fluid-danger)] hover:border-[var(--fluid-danger)]/30',
            'transition-colors duration-200'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onMarkSold?.(property.id);
          }}
        >
          <DollarSign className="size-3 mr-1.5" />
          Sold
        </Button>
      </div>
    </motion.div>
  );
}
