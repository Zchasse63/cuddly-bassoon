'use client';

import { Home, Bed, Bath, Maximize, TrendingUp, Phone, Mail, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PropertySearchResultItem } from '@/lib/filters/types';

/**
 * PropertyCardCompact Component
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 * 
 * Compact property card optimized for split-view list panel.
 * Designed to be narrow (380-480px) and stack vertically.
 * 
 * Features:
 * - Property image (if available)
 * - Address and location
 * - Key specs (bed/bath/sqft)
 * - Price and equity %
 * - Motivation indicators
 * - Quick action buttons
 */

interface PropertyCardCompactProps {
  result: PropertySearchResultItem;
  onClick?: () => void;
  isHighlighted?: boolean;
  isSelected?: boolean;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getEquityVariant(equity: number | null | undefined): 'high' | 'medium' | 'low' {
  if (equity === null || equity === undefined) return 'low';
  if (equity >= 50) return 'high';
  if (equity >= 30) return 'medium';
  return 'low';
}

export function PropertyCardCompact({
  result,
  onClick,
  isHighlighted = false,
  isSelected = false,
}: PropertyCardCompactProps) {
  const { property, filterResults, rank } = result;
  const { combinedScore = 0 } = filterResults || {};
  const equityVariant = getEquityVariant(property.equityPercent);

  // Ensure combinedScore is a valid number
  const safeScore = typeof combinedScore === 'number' && !isNaN(combinedScore) ? combinedScore : 0;

  return (
    <div
      className={cn(
        'group relative rounded-lg border bg-card p-3 transition-all duration-200',
        'hover:shadow-md hover:border-primary/50 cursor-pointer',
        isHighlighted && 'ring-2 ring-primary shadow-lg',
        isSelected && 'border-primary bg-accent',
        'flex flex-col gap-2'
      )}
      onClick={onClick}
    >
      {/* Header: Address and Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{property.address}</h3>
          <p className="text-xs text-muted-foreground">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground">#{rank}</span>
          <div
            className={cn(
              'flex items-center justify-center size-8 rounded-full text-xs font-semibold',
              safeScore >= 70 && 'bg-green-100 text-green-700',
              safeScore >= 40 && safeScore < 70 && 'bg-yellow-100 text-yellow-700',
              safeScore < 40 && 'bg-gray-100 text-gray-700'
            )}
          >
            {Math.round(safeScore)}
          </div>
        </div>
      </div>

      {/* Property Specs */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {property.bedrooms && (
          <div className="flex items-center gap-1">
            <Bed className="size-3" />
            <span>{property.bedrooms}</span>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex items-center gap-1">
            <Bath className="size-3" />
            <span>{property.bathrooms}</span>
          </div>
        )}
        {property.squareFootage && (
          <div className="flex items-center gap-1">
            <Maximize className="size-3" />
            <span>{property.squareFootage.toLocaleString()} sqft</span>
          </div>
        )}
      </div>

      {/* Price and Equity */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">{formatCurrency(property.estimatedValue)}</div>
          <div className="text-xs text-muted-foreground">Estimated Value</div>
        </div>
        {property.equityPercent !== null && property.equityPercent !== undefined && (
          <div className="text-right">
            <div
              className={cn(
                'text-lg font-bold',
                equityVariant === 'high' && 'text-green-600',
                equityVariant === 'medium' && 'text-yellow-600',
                equityVariant === 'low' && 'text-gray-600'
              )}
            >
              {property.equityPercent.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Equity</div>
          </div>
        )}
      </div>

      {/* Motivation Indicators */}
      {filterResults.matchedFilters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filterResults.matchedFilters.slice(0, 3).map((filterId) => (
            <Badge key={filterId} variant="secondary" className="text-xs">
              {filterId.replace(/_/g, ' ')}
            </Badge>
          ))}
          {filterResults.matchedFilters.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{filterResults.matchedFilters.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open contact modal
          }}
        >
          <Phone className="size-3 mr-1" />
          Contact
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add to favorites
          }}
        >
          <Star className="size-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}

