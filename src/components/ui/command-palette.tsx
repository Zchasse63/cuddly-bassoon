'use client';

/**
 * Command Palette (Cmd+K)
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 * Global search and quick actions for power users
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Building2,
  Users,
  Briefcase,
  Plus,
  BarChart3,
  Settings,
  Map,
  FileText,
  ArrowRight,
  Clock,
  Hash,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'property' | 'deal' | 'buyer' | 'page' | 'action';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  badge?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Quick actions available without search
const quickActions: SearchResult[] = [
  {
    id: 'new-deal',
    type: 'action',
    title: 'New Deal',
    subtitle: 'Create a new deal',
    icon: Plus,
    href: '/deals/new',
    badge: 'Action',
  },
  {
    id: 'new-buyer',
    type: 'action',
    title: 'Add Buyer',
    subtitle: 'Add a new buyer to your network',
    icon: Plus,
    href: '/buyers?new=true',
    badge: 'Action',
  },
  {
    id: 'search-properties',
    type: 'action',
    title: 'Search Properties',
    subtitle: 'Find investment properties',
    icon: Search,
    href: '/properties',
    badge: 'Action',
  },
];

// Navigation pages
const navigationPages: SearchResult[] = [
  { id: 'dashboard', type: 'page', title: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { id: 'properties', type: 'page', title: 'Properties', icon: Building2, href: '/properties' },
  { id: 'deals', type: 'page', title: 'Deals', icon: Briefcase, href: '/deals' },
  { id: 'buyers', type: 'page', title: 'Buyers', icon: Users, href: '/buyers' },
  { id: 'analytics', type: 'page', title: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'map', type: 'page', title: 'Map', icon: Map, href: '/map' },
  { id: 'documents', type: 'page', title: 'Documents', icon: FileText, href: '/documents' },
  { id: 'settings', type: 'page', title: 'Settings', icon: Settings, href: '/settings' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('command-palette-recent');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored).slice(0, 5));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [open]);

  // Perform search when query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchAsync = async () => {
      setIsSearching(true);
      try {
        const results: SearchResult[] = [];

        // Search properties
        const propertiesRes = await fetch(
          `/api/search?type=properties&q=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        if (propertiesRes.ok) {
          const { results: props } = await propertiesRes.json();
          results.push(
            ...props.map((p: { id: string; address: string; city?: string; state?: string }) => ({
              id: `property-${p.id}`,
              type: 'property' as const,
              title: p.address,
              subtitle: `${p.city || ''}, ${p.state || ''}`.trim(),
              icon: Building2,
              href: `/properties/${p.id}`,
            }))
          );
        }

        // Search deals
        const dealsRes = await fetch(
          `/api/search?type=deals&q=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        if (dealsRes.ok) {
          const { results: deals } = await dealsRes.json();
          results.push(
            ...deals.map((d: { id: string; property_address: string; stage: string }) => ({
              id: `deal-${d.id}`,
              type: 'deal' as const,
              title: d.property_address,
              subtitle: `Deal • ${d.stage}`,
              icon: Briefcase,
              href: `/deals/${d.id}`,
              badge: d.stage,
            }))
          );
        }

        // Search buyers
        const buyersRes = await fetch(
          `/api/search?type=buyers&q=${encodeURIComponent(debouncedQuery)}&limit=5`
        );
        if (buyersRes.ok) {
          const { results: buyers } = await buyersRes.json();
          results.push(
            ...buyers.map((b: { id: string; name: string; company_name?: string }) => ({
              id: `buyer-${b.id}`,
              type: 'buyer' as const,
              title: b.name,
              subtitle: b.company_name || 'Buyer',
              icon: Users,
              href: `/buyers/${b.id}`,
            }))
          );
        }

        // Filter pages by query
        const matchingPages = navigationPages.filter((p) =>
          p.title.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        results.push(...matchingPages);

        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchAsync();
  }, [debouncedQuery]);

  // Combined results for display
  const displayResults = useMemo(() => {
    if (query.trim()) {
      return searchResults;
    }

    // Show recent + quick actions when no query
    return [...recentSearches, ...quickActions, ...navigationPages.slice(0, 4)];
  }, [query, searchResults, recentSearches]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayResults]);

  // Handle item selection
  const handleSelect = useCallback(
    (item: SearchResult) => {
      // Save to recent searches
      if (item.type !== 'action' && item.type !== 'page') {
        const updated = [item, ...recentSearches.filter((r) => r.id !== item.id)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('command-palette-recent', JSON.stringify(updated));
      }

      // Navigate or execute action
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }

      onOpenChange(false);
      setQuery('');
    },
    [router, onOpenChange, recentSearches]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, displayResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          const selected = displayResults[selectedIndex];
          if (selected) {
            handleSelect(selected);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [displayResults, selectedIndex, onOpenChange, handleSelect]
  );

  // Close on route change
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {
      recent: [],
      properties: [],
      deals: [],
      buyers: [],
      pages: [],
      actions: [],
    };

    displayResults.forEach((result) => {
      if (recentSearches.some((r) => r.id === result.id) && !query.trim()) {
        groups.recent.push(result);
      } else if (result.type === 'property') {
        groups.properties.push(result);
      } else if (result.type === 'deal') {
        groups.deals.push(result);
      } else if (result.type === 'buyer') {
        groups.buyers.push(result);
      } else if (result.type === 'page') {
        groups.pages.push(result);
      } else if (result.type === 'action') {
        groups.actions.push(result);
      }
    });

    return groups;
  }, [displayResults, recentSearches, query]);

  // Calculate flat index for keyboard navigation
  const getFlatIndex = (groupKey: string, itemIndex: number) => {
    const groupOrder = ['recent', 'properties', 'deals', 'buyers', 'actions', 'pages'];
    let index = 0;
    for (const key of groupOrder) {
      if (key === groupKey) {
        return index + itemIndex;
      }
      index += groupedResults[key]?.length || 0;
    }
    return index;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search properties, deals, buyers, or commands..."
            className="border-0 h-14 text-base focus-visible:ring-0 px-0"
            autoFocus
          />
          {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {displayResults.length === 0 && query.trim() && !isSearching && (
            <div className="py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {/* Recent Searches */}
          {groupedResults.recent.length > 0 && (
            <ResultGroup title="Recent" icon={Clock}>
              {groupedResults.recent.map((result, idx) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === getFlatIndex('recent', idx)}
                  onSelect={() => handleSelect(result)}
                  onHover={() => setSelectedIndex(getFlatIndex('recent', idx))}
                />
              ))}
            </ResultGroup>
          )}

          {/* Properties */}
          {groupedResults.properties.length > 0 && (
            <ResultGroup title="Properties" icon={Building2}>
              {groupedResults.properties.map((result, idx) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === getFlatIndex('properties', idx)}
                  onSelect={() => handleSelect(result)}
                  onHover={() => setSelectedIndex(getFlatIndex('properties', idx))}
                />
              ))}
            </ResultGroup>
          )}

          {/* Deals */}
          {groupedResults.deals.length > 0 && (
            <ResultGroup title="Deals" icon={Briefcase}>
              {groupedResults.deals.map((result, idx) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === getFlatIndex('deals', idx)}
                  onSelect={() => handleSelect(result)}
                  onHover={() => setSelectedIndex(getFlatIndex('deals', idx))}
                />
              ))}
            </ResultGroup>
          )}

          {/* Buyers */}
          {groupedResults.buyers.length > 0 && (
            <ResultGroup title="Buyers" icon={Users}>
              {groupedResults.buyers.map((result, idx) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === getFlatIndex('buyers', idx)}
                  onSelect={() => handleSelect(result)}
                  onHover={() => setSelectedIndex(getFlatIndex('buyers', idx))}
                />
              ))}
            </ResultGroup>
          )}

          {/* Actions */}
          {groupedResults.actions.length > 0 && (
            <ResultGroup title="Quick Actions" icon={Hash}>
              {groupedResults.actions.map((result, idx) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === getFlatIndex('actions', idx)}
                  onSelect={() => handleSelect(result)}
                  onHover={() => setSelectedIndex(getFlatIndex('actions', idx))}
                />
              ))}
            </ResultGroup>
          )}

          {/* Pages */}
          {groupedResults.pages.length > 0 && (
            <ResultGroup title="Pages" icon={ArrowRight}>
              {groupedResults.pages.map((result, idx) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  isSelected={selectedIndex === getFlatIndex('pages', idx)}
                  onSelect={() => handleSelect(result)}
                  onHover={() => setSelectedIndex(getFlatIndex('pages', idx))}
                />
              ))}
            </ResultGroup>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 bg-background rounded border">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-background rounded border ml-0.5">K</kbd>
            to open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Result Group Component
function ResultGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// Result Item Component
function ResultItem({
  result,
  isSelected,
  onSelect,
  onHover,
}: {
  result: SearchResult;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  const Icon = result.icon;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          result.type === 'property'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : result.type === 'deal'
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
              : result.type === 'buyer'
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{result.title}</div>
        {result.subtitle && (
          <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
        )}
      </div>
      {result.badge && (
        <Badge variant="secondary" className="flex-shrink-0 text-xs">
          {result.badge}
        </Badge>
      )}
      {isSelected && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
    </button>
  );
}

/**
 * Hook to open command palette with keyboard shortcut
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen };
}
