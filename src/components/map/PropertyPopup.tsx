'use client';

/**
 * PropertyPopup Component
 * Displays property details in a map popup
 */

import { Popup } from 'react-map-gl/mapbox';
import { useMap } from './MapProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ExternalLink, DollarSign, Home, Ruler } from 'lucide-react';
import Link from 'next/link';

export function PropertyPopup() {
  const { state, selectProperty } = useMap();
  const property = state.selectedProperty;

  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Popup
      longitude={property.longitude}
      latitude={property.latitude}
      anchor="bottom"
      onClose={() => selectProperty(null)}
      closeOnClick={false}
      closeButton={false}
      className="property-popup"
      offset={15}
    >
      <Card className="w-72 shadow-lg border-0">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-semibold line-clamp-2 pr-2">
              {property.address}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2 -mt-2 flex-shrink-0"
              onClick={() => selectProperty(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {(property.city || property.state) && (
            <p className="text-xs text-muted-foreground">
              {[property.city, property.state].filter(Boolean).join(', ')}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Property Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(property.bedrooms || property.bathrooms) && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Home className="h-3 w-3" />
                <span>
                  {property.bedrooms || '-'} bd / {property.bathrooms || '-'} ba
                </span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Ruler className="h-3 w-3" />
                <span>{property.sqft.toLocaleString()} sqft</span>
              </div>
            )}
          </div>

          {/* Price if available */}
          {property.price && (
            <div className="flex items-center gap-1 text-lg font-semibold">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>{formatPrice(property.price)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/properties/${property.id}`}>
                View Details
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Popup>
  );
}

