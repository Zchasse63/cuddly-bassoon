'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertySearchResultItem } from '@/lib/filters/types';
import { getFilterById } from '@/lib/filters/registry';
import { motion } from 'framer-motion';

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
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'glass-card squircle p-4',
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:glass-high',
        'cursor-pointer'
      )}
      onClick={onClick}
    >
      {/* Header with Address and Score */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground truncate">{property.address}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
            #{rank}
          </span>
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shadow-sm',
              scoreVariant === 'high' && 'bg-emerald-500 shadow-emerald-500/20',
              scoreVariant === 'medium' && 'bg-amber-500 shadow-amber-500/20',
              scoreVariant === 'low' && 'bg-rose-500 shadow-rose-500/20'
            )}
          >
            {Math.round(combinedScore)}
          </div>
        </div>
      </div>

      {/* Property Stats Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/10 bg-white/5 rounded-lg mb-4">
        <div className="text-center px-1">
          <div className="text-sm font-bold text-foreground">
            {formatCurrency(property.estimatedValue)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Value
          </div>
        </div>
        <div className="text-center px-1 border-l border-border/10">
          <div className="text-sm font-bold text-foreground">
            {property.equityPercent !== null && property.equityPercent !== undefined
              ? `${property.equityPercent.toFixed(0)}%`
              : '-'}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Equity
          </div>
        </div>
        <div className="text-center px-1 border-l border-border/10">
          <div className="text-sm font-bold text-foreground truncate">
            {property.propertyType || '-'}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Type
          </div>
        </div>
      </div>

      {/* Property Specs */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
        {property.bedrooms && (
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground">{property.bedrooms}</span> bed
          </span>
        )}
        {property.bathrooms && (
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground">{property.bathrooms}</span> bath
          </span>
        )}
        {property.squareFootage && (
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground">
              {property.squareFootage.toLocaleString()}
            </span>{' '}
            sqft
          </span>
        )}
        {property.yearBuilt && <span>Built {property.yearBuilt}</span>}
      </div>

      {/* Matched Filters (Pills) */}
      {matchedFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {matchedFilters.slice(0, 3).map((filterId) => {
            const filter = getFilterById(filterId);
            return (
              <Badge
                key={filterId}
                variant="secondary"
                className="bg-secondary/40 hover:bg-secondary/60 text-[10px] px-2 py-0.5"
              >
                {filter?.name || filterId}
              </Badge>
            );
          })}
          {matchedFilters.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-dashed">
              +{matchedFilters.length - 3} more
            </Badge>
          )}
        </div>
      )}

      {/* Owner Info & Actions */}
      <div className="flex items-center justify-between text-xs pt-2 mt-auto border-t border-border/5">
        <div className="text-muted-foreground truncate max-w-[70%]">
          {property.ownerName ? (
            <>
              <span className="font-medium text-foreground/80">Owner:</span> {property.ownerName}
            </>
          ) : (
            <span className="italic opacity-50">No owner info</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
