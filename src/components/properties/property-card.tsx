'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PropertySearchResultItem } from '@/lib/filters/types';
import { getFilterById } from '@/lib/filters/registry';

interface PropertyCardProps {
  result: PropertySearchResultItem;
  onClick?: () => void;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function PropertyCard({ result, onClick }: PropertyCardProps) {
  const { property, filterResults, rank } = result;
  const { matchedFilters, combinedScore } = filterResults;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">
              {property.address}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {property.city}, {property.state} {property.zip}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#{rank}</span>
            <div 
              className={`px-2 py-1 rounded text-white text-sm font-medium ${getScoreColor(combinedScore)}`}
            >
              {Math.round(combinedScore)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Property Details */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Value</span>
            <p className="font-medium">{formatCurrency(property.estimatedValue)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Equity</span>
            <p className="font-medium">
              {property.equityPercent !== null && property.equityPercent !== undefined
                ? `${property.equityPercent.toFixed(0)}%`
                : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-medium">{property.propertyType || 'N/A'}</p>
          </div>
        </div>

        {/* Property Specs */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {property.bedrooms && <span>{property.bedrooms} bed</span>}
          {property.bathrooms && <span>{property.bathrooms} bath</span>}
          {property.squareFootage && <span>{property.squareFootage.toLocaleString()} sqft</span>}
          {property.yearBuilt && <span>Built {property.yearBuilt}</span>}
        </div>

        {/* Matched Filters */}
        <div className="flex flex-wrap gap-1">
          {matchedFilters.map((filterId) => {
            const filter = getFilterById(filterId);
            return (
              <Badge key={filterId} variant="secondary" className="text-xs">
                {filter?.name || filterId}
              </Badge>
            );
          })}
        </div>

        {/* Owner Info */}
        {property.ownerName && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <span className="font-medium">Owner:</span> {property.ownerName}
            {property.ownerType && ` (${property.ownerType})`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

