'use client';

/**
 * AI Tool Command Palette
 *
 * A searchable, categorized browser for all AI tools.
 * Users can discover tools, see usage examples, and insert prompts directly.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Calculator,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  GitBranch,
  Phone,
  FileText,
  Settings,
  HelpCircle,
  List,
  Zap,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  CornerDownLeft,
  Sparkles,
  Home,
  Star,
  Scale,
  Mail,
  Target,
  UserCheck,
  MapPin,
  Bell,
  Bookmark,
  StickyNote,
  Hammer,
  Gauge,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  UserSearch,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  getSortedCategories,
  getToolsByCategory,
  searchTools,
} from '@/lib/ai/tool-discovery';
import type {
  DiscoveryCategory,
  DiscoveryToolDefinition,
  CategoryDefinition,
} from '@/lib/ai/tool-discovery/types';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Calculator,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  GitBranch,
  Phone,
  FileText,
  Settings,
  HelpCircle,
  List,
  Zap,
  Sparkles,
  Home,
  Star,
  Scale,
  Mail,
  Target,
  UserCheck,
  MapPin,
  Bell,
  Bookmark,
  StickyNote,
  Hammer,
  Gauge,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  UserSearch,
  Wrench,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || Wrench;
}

interface AIToolPaletteProps {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Callback when palette should close */
  onClose: () => void;
  /** Callback when user selects a prompt to insert */
  onInsertPrompt: (prompt: string) => void;
  /** Initial search query */
  initialQuery?: string;
}

interface ToolListItemProps {
  tool: DiscoveryToolDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onExpand: () => void;
  showCategory?: boolean;
}

interface ToolDetailViewProps {
  tool: DiscoveryToolDefinition;
  onBack: () => void;
  onInsertExample: (prompt: string) => void;
}

interface CategoryGroupProps {
  category: CategoryDefinition;
  tools: DiscoveryToolDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  selectedIndex: number;
  startIndex: number;
  onSelectTool: (tool: DiscoveryToolDefinition) => void;
  onExpandTool: (tool: DiscoveryToolDefinition) => void;
}

function ToolListItem({
  tool,
  isSelected,
  onSelect,
  onExpand,
  showCategory,
}: ToolListItemProps) {
  const Icon = getIcon(tool.icon);
  const firstExample = tool.examples[0];

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{tool.displayName}</span>
          {tool.isPrimary && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              Popular
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          &ldquo;{firstExample?.prompt}&rdquo;
        </p>
        {showCategory && (
          <p className="text-[10px] text-muted-foreground/70 mt-1">{tool.category}</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        className={cn(
          'p-1 rounded hover:bg-muted flex-shrink-0',
          isSelected && 'hover:bg-background/50'
        )}
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </button>
  );
}

function CategoryGroup({
  category,
  tools,
  isExpanded,
  onToggle,
  selectedIndex,
  startIndex,
  onSelectTool,
  onExpandTool,
}: CategoryGroupProps) {
  const Icon = getIcon(category.icon);

  if (tools.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">{category.displayName}</span>
        <Badge variant="outline" className="text-[10px] px-1">
          {tools.length}
        </Badge>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-0.5 mt-1">
          {tools.map((tool, idx) => (
            <ToolListItem
              key={tool.slug}
              tool={tool}
              isSelected={selectedIndex === startIndex + idx}
              onSelect={() => onSelectTool(tool)}
              onExpand={() => onExpandTool(tool)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolDetailView({ tool, onBack, onInsertExample }: ToolDetailViewProps) {
  const Icon = getIcon(tool.icon);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Tool Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{tool.displayName}</h2>
              <p className="text-sm text-muted-foreground">{tool.shortDescription}</p>
            </div>
          </div>

          {/* Full Description */}
          <p className="text-sm text-muted-foreground mb-6">{tool.fullDescription}</p>

          {/* Examples */}
          <div>
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Example Prompts
            </h3>
            <div className="space-y-2">
              {tool.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="group bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-mono">&ldquo;{example.prompt}&rdquo;</p>
                      {example.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {example.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onInsertExample(example.prompt)}
                      className="flex-shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Insert
                      <CornerDownLeft className="h-3 w-3" />
                    </Button>
                  </div>
                  {example.resultPreview && (
                    <p className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      {example.resultPreview}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          {tool.keywords.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Related Keywords</h4>
              <div className="flex flex-wrap gap-1">
                {tool.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function AIToolPalette({
  isOpen,
  onClose,
  onInsertPrompt,
  initialQuery = '',
}: AIToolPaletteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedTool, setExpandedTool] = useState<DiscoveryToolDefinition | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<DiscoveryCategory>>(
    new Set(['property-search', 'deal-analysis', 'buyer-intelligence'])
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 100);

  // Get categories and tools
  const categories = useMemo(() => getSortedCategories(), []);
  const searchResults = useMemo(
    () => (debouncedQuery.trim() ? searchTools(debouncedQuery) : []),
    [debouncedQuery]
  );

  // Calculate flat list for keyboard navigation
  const flatTools = useMemo(() => {
    if (debouncedQuery.trim()) {
      return searchResults;
    }

    const tools: DiscoveryToolDefinition[] = [];
    categories.forEach((category) => {
      if (expandedCategories.has(category.id)) {
        tools.push(...getToolsByCategory(category.id));
      }
    });
    return tools;
  }, [debouncedQuery, searchResults, categories, expandedCategories]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setExpandedTool(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, initialQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatTools.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (expandedTool) {
        if (e.key === 'Escape' || e.key === 'ArrowLeft') {
          e.preventDefault();
          setExpandedTool(null);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatTools.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          const selected = flatTools[selectedIndex];
          if (selected) {
            handleSelectTool(selected);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          const toExpand = flatTools[selectedIndex];
          if (toExpand) {
            setExpandedTool(toExpand);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [expandedTool, flatTools, selectedIndex, onClose]
  );

  const handleSelectTool = useCallback(
    (tool: DiscoveryToolDefinition) => {
      const firstExample = tool.examples[0];
      if (firstExample) {
        onInsertPrompt(firstExample.prompt);
        onClose();
      }
    },
    [onInsertPrompt, onClose]
  );

  const handleInsertExample = useCallback(
    (prompt: string) => {
      onInsertPrompt(prompt);
      onClose();
    },
    [onInsertPrompt, onClose]
  );

  const toggleCategory = useCallback((categoryId: DiscoveryCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // Calculate start indices for each category
  const getCategoryStartIndex = useCallback(
    (categoryIndex: number) => {
      let index = 0;
      for (let i = 0; i < categoryIndex; i++) {
        const cat = categories[i];
        if (expandedCategories.has(cat.id)) {
          index += getToolsByCategory(cat.id).length;
        }
      }
      return index;
    },
    [categories, expandedCategories]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">AI Tools</DialogTitle>

        {expandedTool ? (
          <ToolDetailView
            tool={expandedTool}
            onBack={() => setExpandedTool(null)}
            onInsertExample={handleInsertExample}
          />
        ) : (
          <>
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search AI tools..."
                className="border-0 h-14 text-base focus-visible:ring-0 px-0"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {debouncedQuery.trim() ? (
                  // Search Results
                  <>
                    {searchResults.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No tools found for &ldquo;{debouncedQuery}&rdquo;</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground px-2 py-1">
                          {searchResults.length} tool{searchResults.length !== 1 ? 's' : ''} found
                        </p>
                        {searchResults.map((tool, idx) => (
                          <ToolListItem
                            key={tool.slug}
                            tool={tool}
                            isSelected={selectedIndex === idx}
                            onSelect={() => handleSelectTool(tool)}
                            onExpand={() => setExpandedTool(tool)}
                            showCategory
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Category Browse
                  <>
                    {categories.map((category, catIdx) => {
                      const tools = getToolsByCategory(category.id);
                      return (
                        <CategoryGroup
                          key={category.id}
                          category={category}
                          tools={tools}
                          isExpanded={expandedCategories.has(category.id)}
                          onToggle={() => toggleCategory(category.id)}
                          selectedIndex={selectedIndex}
                          startIndex={getCategoryStartIndex(catIdx)}
                          onSelectTool={handleSelectTool}
                          onExpandTool={setExpandedTool}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>

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
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">→</kbd>
                  Details
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                AI Tools
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage AI Tool Palette state
 */
export function useAIToolPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const open = useCallback((query?: string) => {
    setInitialQuery(query || '');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInitialQuery('');
  }, []);

  // Listen for keyboard shortcut (Cmd+K already handled by existing command palette)
  // This hook is for programmatic control

  return {
    isOpen,
    initialQuery,
    open,
    close,
    setIsOpen,
  };
}
