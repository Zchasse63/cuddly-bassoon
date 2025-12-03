'use client';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  STANDARD_FILTERS,
  ENHANCED_FILTERS,
  CONTRARIAN_FILTERS,
} from '@/lib/filters/registry';
import type { ActiveFilter, FilterId, FilterCombinationMode, FilterConfig } from '@/lib/filters/types';

interface FilterSidebarProps {
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  filterMode: FilterCombinationMode;
  onFilterModeChange: (mode: FilterCombinationMode) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

function FilterCheckbox({
  filter,
  isActive,
  params,
  onToggle,
  onParamChange,
}: {
  filter: FilterConfig;
  isActive: boolean;
  params?: Record<string, unknown>;
  onToggle: () => void;
  onParamChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={filter.id}
          checked={isActive}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor={filter.id} className="text-sm font-medium cursor-pointer">
          {filter.name}
        </Label>
      </div>
      {isActive && filter.parameters && filter.parameters.length > 0 && (
        <div className="ml-6 space-y-2">
          {filter.parameters.map((param) => (
            <div key={param.key} className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground w-24">
                {param.label}
              </Label>
              {param.type === 'number' && (
                <Input
                  type="number"
                  value={(params?.[param.key] as number) ?? param.defaultValue}
                  onChange={(e) => onParamChange(param.key, Number(e.target.value))}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="h-7 w-20 text-xs"
                />
              )}
              {param.type === 'range' && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={(params?.[param.key] as [number, number])?.[0] ?? (param.defaultValue as [number, number])[0]}
                    onChange={(e) => {
                      const current = (params?.[param.key] as [number, number]) ?? param.defaultValue;
                      onParamChange(param.key, [Number(e.target.value), (current as [number, number])[1]]);
                    }}
                    min={param.min}
                    max={param.max}
                    className="h-7 w-16 text-xs"
                  />
                  <span className="text-xs">-</span>
                  <Input
                    type="number"
                    value={(params?.[param.key] as [number, number])?.[1] ?? (param.defaultValue as [number, number])[1]}
                    onChange={(e) => {
                      const current = (params?.[param.key] as [number, number]) ?? param.defaultValue;
                      onParamChange(param.key, [(current as [number, number])[0], Number(e.target.value)]);
                    }}
                    min={param.min}
                    max={param.max}
                    className="h-7 w-16 text-xs"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="ml-6 text-xs text-muted-foreground">{filter.description}</p>
    </div>
  );
}

function FilterSection({
  title,
  filters,
  activeFilters,
  onToggle,
  onParamChange,
}: {
  title: string;
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onToggle: (filterId: FilterId) => void;
  onParamChange: (filterId: FilterId, key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <div className="space-y-4">
        {filters.map((filter) => {
          const active = activeFilters.find((f) => f.filterId === filter.id);
          return (
            <FilterCheckbox
              key={filter.id}
              filter={filter}
              isActive={!!active}
              params={active?.params}
              onToggle={() => onToggle(filter.id)}
              onParamChange={(key, value) => onParamChange(filter.id, key, value)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function FilterSidebar({
  activeFilters,
  onFiltersChange,
  filterMode,
  onFilterModeChange,
  onSearch,
  isLoading,
}: FilterSidebarProps) {
  const handleToggle = (filterId: FilterId) => {
    const existing = activeFilters.find((f) => f.filterId === filterId);
    if (existing) {
      onFiltersChange(activeFilters.filter((f) => f.filterId !== filterId));
    } else {
      onFiltersChange([...activeFilters, { filterId }]);
    }
  };

  const handleParamChange = (filterId: FilterId, key: string, value: unknown) => {
    onFiltersChange(
      activeFilters.map((f) =>
        f.filterId === filterId
          ? { ...f, params: { ...f.params, [key]: value } }
          : f
      )
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Property Filters</CardTitle>
        <div className="flex gap-1 mt-2">
          {(['AND', 'OR', 'WEIGHTED'] as FilterCombinationMode[]).map((mode) => (
            <Button
              key={mode}
              variant={filterMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterModeChange(mode)}
              className="text-xs h-7"
            >
              {mode}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="px-6 pb-6 space-y-6">
            <FilterSection
              title="Standard Filters"
              filters={STANDARD_FILTERS}
              activeFilters={activeFilters}
              onToggle={handleToggle}
              onParamChange={handleParamChange}
            />
            <Separator />
            <FilterSection
              title="Enhanced Filters"
              filters={ENHANCED_FILTERS}
              activeFilters={activeFilters}
              onToggle={handleToggle}
              onParamChange={handleParamChange}
            />
            <Separator />
            <FilterSection
              title="Contrarian Filters"
              filters={CONTRARIAN_FILTERS}
              activeFilters={activeFilters}
              onToggle={handleToggle}
              onParamChange={handleParamChange}
            />
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            onClick={onSearch}
            className="w-full"
            disabled={isLoading || activeFilters.length === 0}
          >
            {isLoading ? 'Searching...' : `Search (${activeFilters.length} filters)`}
          </Button>
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange([])}
              className="w-full mt-2"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

