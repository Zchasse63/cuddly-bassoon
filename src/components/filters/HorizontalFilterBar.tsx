'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Flame, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  STANDARD_FILTERS,
  ENHANCED_FILTERS,
  CONTRARIAN_FILTERS,
  ALL_FILTERS,
} from '@/lib/filters/registry';
import type { ActiveFilter, FilterId } from '@/lib/filters/types';
import { FilterPill, FilterPillGroup } from './FilterPill';

/**
 * HorizontalFilterBar Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 * Enhanced: ARCHITECTURE_SOURCE_OF_TRUTH.md Section 9 Phase 5
 *
 * Horizontal filter bar for split-view property search.
 * Replaces vertical FilterSidebar with compact horizontal layout.
 *
 * Features:
 * - Search input
 * - Quick filter dropdowns (Beds, Price, Equity, More) with glass styling
 * - FluidOS FilterPill components for active filters with tooltips
 * - Sort control
 * - Results count
 * - Scrollable on mobile
 * - Filter count badges in More dropdown
 */

interface HorizontalFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  resultsCount?: number;
  className?: string;
  // Market Velocity overlay toggle
  velocityEnabled?: boolean;
  onVelocityToggle?: (enabled: boolean) => void;
}

export function HorizontalFilterBar({
  searchQuery = '',
  onSearchChange,
  activeFilters,
  onFiltersChange,
  sortBy = 'score',
  onSortChange,
  resultsCount,
  className,
  velocityEnabled = false,
  onVelocityToggle,
}: HorizontalFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  const toggleFilter = (filterId: FilterId) => {
    const existing = activeFilters.find((f) => f.filterId === filterId);
    if (existing) {
      onFiltersChange(activeFilters.filter((f) => f.filterId !== filterId));
    } else {
      onFiltersChange([...activeFilters, { filterId }]);
    }
  };

  const clearFilters = () => {
    onFiltersChange([]);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3',
        'bg-transparent', // Transparent to let SplitView wrapper handle glass
        'overflow-x-auto scrollbar-hide',
        className
      )}
    >
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-shrink-0 w-64 md:w-72">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
          <Input
            type="text"
            placeholder="Search address, city, zip..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 bg-background/50 border-transparent hover:bg-background/80 focus:bg-background focus:border-brand-500/50 transition-all rounded-full"
          />
        </div>
      </form>

      {/* Divider */}
      <div className="h-6 w-px bg-border/40 flex-shrink-0 mx-1" />

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Beds Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 rounded-full transition-all',
                'bg-white/65 backdrop-blur-md border border-white/40',
                'hover:bg-white/80 hover:border-white/60 hover:scale-105',
                'text-foreground font-medium'
              )}
            >
              Beds
              <ChevronDown className="ml-1 size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-high border-border/40">
            <DropdownMenuLabel>Bedrooms</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            {[1, 2, 3, 4, 5].map((beds) => (
              <DropdownMenuItem
                key={beds}
                onClick={() => {
                  // TODO: Add bed filter - requires adding min_bedrooms to FilterId type and registry
                  console.log(`Filter by ${beds}+ beds`);
                }}
                className="focus:bg-brand-500/10 focus:text-brand-600"
              >
                {beds}+ beds
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Price Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 rounded-full transition-all',
                'bg-white/65 backdrop-blur-md border border-white/40',
                'hover:bg-white/80 hover:border-white/60 hover:scale-105',
                'text-foreground font-medium'
              )}
            >
              Price
              <ChevronDown className="ml-1 size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-high border-border/40">
            <DropdownMenuLabel>Price Range</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem className="focus:bg-brand-500/10 focus:text-brand-600">
              Under $200k
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-brand-500/10 focus:text-brand-600">
              $200k - $400k
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-brand-500/10 focus:text-brand-600">
              $400k - $600k
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-brand-500/10 focus:text-brand-600">
              Over $600k
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Equity Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 rounded-full transition-all',
                'bg-white/65 backdrop-blur-md border border-white/40',
                'hover:bg-white/80 hover:border-white/60 hover:scale-105',
                'text-foreground font-medium'
              )}
            >
              Equity
              <ChevronDown className="ml-1 size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-high border-border/40">
            <DropdownMenuLabel>Equity %</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            {STANDARD_FILTERS.filter((f) => f.id === 'high_equity' || f.id === 'free_clear').map(
              (filter) => {
                const isActive = activeFilters.some((f) => f.filterId === filter.id);
                return (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={cn(
                      'focus:bg-brand-500/10 focus:text-brand-600',
                      isActive && 'bg-brand-50 text-brand-700 font-medium'
                    )}
                  >
                    {filter.name}
                  </DropdownMenuItem>
                );
              }
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 rounded-full transition-all px-3 relative',
                'bg-white/65 backdrop-blur-md border border-white/40',
                'hover:bg-white/80 hover:border-white/60 hover:scale-105',
                'text-foreground font-medium'
              )}
            >
              <SlidersHorizontal className="mr-1.5 size-3" />
              More
              {/* Filter count badge */}
              {(() => {
                const moreFilterIds = [
                  ...STANDARD_FILTERS.slice(0, 4).map((f) => f.id),
                  ...ENHANCED_FILTERS.slice(0, 3).map((f) => f.id),
                ];
                const activeCount = activeFilters.filter((f) =>
                  moreFilterIds.includes(f.filterId)
                ).length;
                return activeCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-brand-500 text-white border-0"
                  >
                    {activeCount}
                  </Badge>
                ) : null;
              })()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 glass-high border-border/40">
            <DropdownMenuLabel>Standard Filters</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            {STANDARD_FILTERS.slice(0, 4).map((filter) => {
              const isActive = activeFilters.some((f) => f.filterId === filter.id);
              return (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    'focus:bg-brand-500/10 focus:text-brand-600',
                    isActive && 'bg-brand-50 text-brand-700 font-medium'
                  )}
                >
                  {filter.name}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuLabel>Enhanced Filters</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            {ENHANCED_FILTERS.slice(0, 3).map((filter) => {
              const isActive = activeFilters.some((f) => f.filterId === filter.id);
              return (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    'focus:bg-brand-500/10 focus:text-brand-600',
                    isActive && 'bg-brand-50 text-brand-700 font-medium'
                  )}
                >
                  {filter.name}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Contrarian Filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 rounded-full transition-all px-3 relative',
                'bg-white/65 backdrop-blur-md border border-white/40',
                'hover:bg-white/80 hover:border-white/60 hover:scale-105',
                'text-foreground font-medium'
              )}
            >
              <TrendingDown className="mr-1.5 size-3" />
              Contrarian
              {/* Filter count badge */}
              {(() => {
                const contrarianFilterIds = CONTRARIAN_FILTERS.map((f) => f.id);
                const activeCount = activeFilters.filter((f) =>
                  contrarianFilterIds.includes(f.filterId)
                ).length;
                return activeCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-brand-500 text-white border-0"
                  >
                    {activeCount}
                  </Badge>
                ) : null;
              })()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 glass-high border-border/40 max-h-80 overflow-y-auto"
          >
            <DropdownMenuLabel>Contrarian Strategies</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            {CONTRARIAN_FILTERS.map((filter) => {
              const isActive = activeFilters.some((f) => f.filterId === filter.id);
              return (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    'focus:bg-brand-500/10 focus:text-brand-600 flex flex-col items-start gap-0.5',
                    isActive && 'bg-brand-50 text-brand-700 font-medium'
                  )}
                >
                  <span>{filter.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {filter.description}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Market Velocity Toggle */}
        <Button
          variant={velocityEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={() => onVelocityToggle?.(!velocityEnabled)}
          className={cn(
            'h-8 rounded-full transition-all px-3',
            velocityEnabled
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600'
              : 'border-border/50 bg-background/30 hover:bg-background/80'
          )}
        >
          <Flame className={cn('mr-1.5 size-3', velocityEnabled && 'animate-pulse')} />
          Velocity
        </Button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <>
          <div className="h-6 w-px bg-border/40 flex-shrink-0 mx-1" />
          <FilterPillGroup className="flex-shrink-0">
            {activeFilters.map((filter) => {
              const config = ALL_FILTERS.find((f) => f.id === filter.filterId);
              return (
                <FilterPill
                  key={filter.filterId}
                  label={config?.name || filter.filterId}
                  description={config?.description}
                  isActive={true}
                  onRemove={() => toggleFilter(filter.filterId)}
                  showClose={true}
                />
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs rounded-full hover:bg-destructive/10 hover:text-destructive px-3 font-medium"
            >
              Clear All
            </Button>
          </FilterPillGroup>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort Control */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
        {resultsCount !== undefined && (
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium hidden sm:inline-block">
            {resultsCount.toLocaleString()} properties
          </span>
        )}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] h-9 rounded-full bg-transparent border-transparent hover:bg-background/50 focus:ring-0 text-sm font-medium">
            <span className="text-muted-foreground mr-1">Sort:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="glass-high border-border/40">
            <SelectItem value="score">Best Match</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="equity_desc">Equity: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
