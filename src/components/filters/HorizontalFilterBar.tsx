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
import {
  STANDARD_FILTERS,
  ENHANCED_FILTERS,
  ALL_FILTERS,
} from '@/lib/filters/registry';
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
        'flex items-center gap-3 px-4 py-3 border-b bg-background',
        'overflow-x-auto scrollbar-thin',
        className
      )}
    >
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex-shrink-0 w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search address, city..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </form>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Beds Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Beds
              <ChevronDown className="ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Bedrooms</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[1, 2, 3, 4, 5].map((beds) => (
              <DropdownMenuItem key={beds} onClick={() => {/* TODO: Add bed filter */}}>
                {beds}+ beds
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Price Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Price
              <ChevronDown className="ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Price Range</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {/* TODO: Add price filter */}}>
              Under $200k
            </DropdownMenuItem>
            <DropdownMenuItem>$200k - $400k</DropdownMenuItem>
            <DropdownMenuItem>$400k - $600k</DropdownMenuItem>
            <DropdownMenuItem>Over $600k</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Equity Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Equity
              <ChevronDown className="ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Equity %</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STANDARD_FILTERS.filter((f) => f.id === 'high_equity' || f.id === 'free_clear').map(
              (filter) => {
                const isActive = activeFilters.some((f) => f.filterId === filter.id);
                return (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={cn(isActive && 'bg-accent')}
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
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="mr-1 size-3" />
              More
              <ChevronDown className="ml-1 size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Standard Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STANDARD_FILTERS.slice(0, 4).map((filter) => {
              const isActive = activeFilters.some((f) => f.filterId === filter.id);
              return (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(isActive && 'bg-accent')}
                >
                  {filter.name}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Enhanced Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ENHANCED_FILTERS.slice(0, 3).map((filter) => {
              const isActive = activeFilters.some((f) => f.filterId === filter.id);
              return (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(isActive && 'bg-accent')}
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
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeFilters.map((filter) => {
            const config = ALL_FILTERS.find((f) => f.id === filter.filterId);
            return (
              <Badge key={filter.filterId} variant="secondary" className="gap-1">
                {config?.name || filter.filterId}
                <X
                  className="size-3 cursor-pointer hover:text-destructive"
                  onClick={() => toggleFilter(filter.filterId)}
                />
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sort Control */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {resultsCount !== undefined && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {resultsCount.toLocaleString()} results
          </span>
        )}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
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

