'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
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
import { STANDARD_FILTERS, ENHANCED_FILTERS, ALL_FILTERS } from '@/lib/filters/registry';
import type { ActiveFilter, FilterId } from '@/lib/filters/types';

/**
 * HorizontalFilterBar Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 *
 * Horizontal filter bar for split-view property search.
 * Replaces vertical FilterSidebar with compact horizontal layout.
 *
 * Features:
 * - Search input
 * - Quick filter dropdowns (Beds, Price, Equity, More)
 * - Sort control
 * - Results count
 * - Scrollable on mobile
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
        'flex items-center gap-2 px-4 py-3 border-b border-border/40',
        'glass-subtle sticky top-0 z-30',
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
              className="h-8 rounded-full border-border/50 bg-background/30 hover:bg-background/80 transition-all"
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
                  /* TODO: Add bed filter */
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
              className="h-8 rounded-full border-border/50 bg-background/30 hover:bg-background/80 transition-all"
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
              className="h-8 rounded-full border-border/50 bg-background/30 hover:bg-background/80 transition-all"
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
              className="h-8 rounded-full border-border/50 bg-background/30 hover:bg-background/80 transition-all px-3"
            >
              <SlidersHorizontal className="mr-1.5 size-3" />
              More
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
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <>
          <div className="h-6 w-px bg-border/40 flex-shrink-0 mx-1" />
          <div className="flex items-center gap-1.5 flex-shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
            {activeFilters.map((filter) => {
              const config = ALL_FILTERS.find((f) => f.id === filter.filterId);
              return (
                <Badge
                  key={filter.filterId}
                  variant="secondary"
                  className="gap-1 rounded-full h-7 px-2.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/50 transition-colors"
                >
                  {config?.name || filter.filterId}
                  <X
                    className="size-3 cursor-pointer hover:text-brand-900 transition-colors ml-0.5"
                    onClick={() => toggleFilter(filter.filterId)}
                  />
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs rounded-full hover:bg-destructive/10 hover:text-destructive px-2.5"
            >
              Clear
            </Button>
          </div>
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
