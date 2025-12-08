'use client';

/**
 * Property Card Widget
 *
 * Source: Fluid_OS_Master_Plan.md Phase 3.4
 *
 * Mini property preview widget for display in AI chat responses.
 * Shows key property stats in a compact, actionable format.
 */

import { Building2, MapPin, Bed, Bath, Ruler, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GenUIWidget } from './GenUIWidget';

export interface PropertyCardWidgetData {
  id: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  estimatedValue?: number | null;
  equityPercent?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFootage?: number | null;
  propertyType?: string | null;
  listingStatus?: string | null;
}

interface PropertyCardWidgetProps {
  property: PropertyCardWidgetData;
  onClose?: () => void;
  showActions?: boolean;
  className?: string;
}

export function PropertyCardWidget({
  property,
  onClose,
  showActions = true,
  className,
}: PropertyCardWidgetProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getEquityColor = (equity: number | null | undefined) => {
    if (!equity) return 'bg-muted text-muted-foreground';
    if (equity >= 50) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (equity >= 20) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-red-500/10 text-red-600 border-red-500/20';
  };

  return (
    <GenUIWidget
      title={property.address}
      icon={<Building2 className="h-4 w-4" />}
      onClose={onClose}
      collapsible={false}
      variant="compact"
      className={className}
    >
      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        <MapPin className="h-3 w-3" />
        <span>{property.city}, {property.state} {property.zip}</span>
        {property.propertyType && (
          <Badge variant="outline" className="ml-auto text-[10px] px-1.5">
            {property.propertyType}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Value */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Value</div>
            <div className="text-sm font-semibold">{formatCurrency(property.estimatedValue)}</div>
          </div>
        </div>

        {/* Equity */}
        <div className={cn(
          'flex items-center gap-2 p-2 rounded-lg border',
          getEquityColor(property.equityPercent)
        )}>
          <TrendingUp className="h-3.5 w-3.5" />
          <div>
            <div className="text-xs opacity-80">Equity</div>
            <div className="text-sm font-semibold">
              {property.equityPercent ? `${property.equityPercent.toFixed(0)}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {property.bedrooms && (
          <span className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {property.bedrooms} bd
          </span>
        )}
        {property.bathrooms && (
          <span className="flex items-center gap-1">
            <Bath className="h-3 w-3" />
            {property.bathrooms} ba
          </span>
        )}
        {property.squareFootage && (
          <span className="flex items-center gap-1">
            <Ruler className="h-3 w-3" />
            {property.squareFootage.toLocaleString()} sqft
          </span>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="default" className="flex-1 h-8 text-xs">
            <Link href={`/properties/${property.id}`}>
              View Details
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            Add to Deal
          </Button>
        </div>
      )}
    </GenUIWidget>
  );
}

/**
 * Compact inline property reference (no widget chrome)
 */
export function PropertyReference({
  property,
  className,
}: {
  property: Pick<PropertyCardWidgetData, 'id' | 'address' | 'city' | 'state' | 'estimatedValue'>;
  className?: string;
}) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'glass-subtle hover:bg-brand-500/10 transition-colors',
        'text-sm group',
        className
      )}
    >
      <Building2 className="h-3.5 w-3.5 text-brand-500" />
      <span className="font-medium">{property.address}</span>
      <span className="text-muted-foreground text-xs">
        {property.city}, {property.state}
      </span>
      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}
