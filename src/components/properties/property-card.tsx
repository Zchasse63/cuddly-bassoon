'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertySearchResultItem } from '@/lib/filters/types';
import { getFilterById } from '@/lib/filters/registry';

interface PropertyCardProps {
  result: PropertySearchResultItem;
  onClick?: () => void;
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

function getScoreVariant(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function PropertyCard({ result, onClick, isSelected }: PropertyCardProps) {
  const { property, filterResults, rank } = result;
  const { matchedFilters, combinedScore } = filterResults;
  const scoreVariant = getScoreVariant(combinedScore);

  return (
    <div className={cn('property-card', isSelected && 'selected')} onClick={onClick}>
      {/* Header with Address and Score */}
      <div className="property-card__content">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="property-card__address truncate">{property.address}</h3>
            <p className="property-card__location">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">#{rank}</span>
            <div className={cn('score-badge', `score-badge--${scoreVariant}`)}>
              {Math.round(combinedScore)}
            </div>
          </div>
        </div>

        {/* Property Stats */}
        <div className="property-card__stats">
          <div className="property-card__stat">
            <div className="property-card__stat-value">
              {formatCurrency(property.estimatedValue)}
            </div>
            <div className="property-card__stat-label">Value</div>
          </div>
          <div className="property-card__stat">
            <div className="property-card__stat-value">
              {property.equityPercent !== null && property.equityPercent !== undefined
                ? `${property.equityPercent.toFixed(0)}%`
                : 'N/A'}
            </div>
            <div className="property-card__stat-label">Equity</div>
          </div>
          <div className="property-card__stat">
            <div className="property-card__stat-value">{property.propertyType || 'N/A'}</div>
            <div className="property-card__stat-label">Type</div>
          </div>
        </div>

        {/* Property Specs */}
        <div className="flex gap-4 text-sm text-muted-foreground mt-3">
          {property.bedrooms && <span>{property.bedrooms} bed</span>}
          {property.bathrooms && <span>{property.bathrooms} bath</span>}
          {property.squareFootage && <span>{property.squareFootage.toLocaleString()} sqft</span>}
          {property.yearBuilt && <span>Built {property.yearBuilt}</span>}
        </div>

        {/* Matched Filters */}
        {matchedFilters.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {matchedFilters.map((filterId) => {
              const filter = getFilterById(filterId);
              return (
                <Badge key={filterId} variant="secondary" className="text-xs">
                  {filter?.name || filterId}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Owner Info */}
        {property.ownerName && (
          <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
            <span className="font-medium">Owner:</span> {property.ownerName}
            {property.ownerType && ` (${property.ownerType})`}
          </div>
        )}
      </div>
    </div>
  );
}
