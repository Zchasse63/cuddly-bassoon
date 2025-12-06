'use client';

/**
 * AI Tools Documentation Page
 *
 * Comprehensive documentation for all 253 AI tools available in the platform.
 * Organized by category with search, filtering, and detailed descriptions.
 */

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getIcon } from '@/lib/ai/icon-map';

// Import the comprehensive tool catalog
// This will be all 253 tools organized by category
import { allAITools, toolCategories, type AIToolDoc } from './tools-data';

export default function AIToolsDocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['property_search', 'deal_analysis', 'buyer_management'])
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return allAITools;

    const query = searchQuery.toLowerCase();
    return allAITools.filter((tool) => {
      const searchableText = [tool.name, tool.description, tool.category, ...tool.keywords]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [searchQuery]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped = new Map<string, typeof filteredTools>();
    filteredTools.forEach((tool) => {
      if (!grouped.has(tool.category)) {
        grouped.set(tool.category, []);
      }
      grouped.get(tool.category)!.push(tool);
    });
    return grouped;
  }, [filteredTools]);

  // Filter by selected category if any
  const displayCategories: [string, AIToolDoc[]][] = selectedCategory
    ? [[selectedCategory, toolsByCategory.get(selectedCategory) || []]]
    : Array.from(toolsByCategory.entries());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const totalTools = allAITools.length;
  const filteredCount = filteredTools.length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/help">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help
          </Button>
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">AI Tools Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Complete reference for all {totalTools} AI-powered tools available in Scout
            </p>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools by name, description, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `${filteredCount} of ${totalTools} tools found`
              : `${totalTools} tools across ${toolCategories.length} categories`}
          </p>
          {selectedCategory && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              Clear filter
            </Button>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      {!selectedCategory && (
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {toolCategories.map((cat) => {
              const Icon = getIcon(cat.icon);
              const count = toolsByCategory.get(cat.id)?.length || 0;
              return (
                <Button
                  key={cat.id}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setExpandedCategories(new Set([cat.id]));
                  }}
                >
                  <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{cat.displayName}</div>
                    <div className="text-xs text-muted-foreground">{count} tools</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tools by Category */}
      <div className="space-y-4">
        {displayCategories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No tools found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </CardContent>
          </Card>
        ) : (
          displayCategories.map(([categoryId, tools]) => {
            const category = toolCategories.find((c) => c.id === categoryId);
            if (!category || !tools || tools.length === 0) return null;

            const isExpanded = expandedCategories.has(categoryId);
            const CategoryIcon = getIcon(category.icon);

            return (
              <Card key={categoryId}>
                <CardHeader className="cursor-pointer" onClick={() => toggleCategory(categoryId)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          'bg-primary/10 text-primary'
                        )}
                      >
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.displayName}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tools.length} tools</Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {tools.map((tool) => {
                        const ToolIcon = getIcon(tool.icon);
                        return (
                          <div
                            key={tool.id}
                            className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                <ToolIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-sm">{tool.name}</h3>
                                  {tool.isPrimary && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                              </div>
                            </div>

                            {tool.examples && tool.examples.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Example prompts:
                                </p>
                                {tool.examples.slice(0, 2).map((example, idx) => (
                                  <div key={idx} className="bg-muted/50 rounded p-2">
                                    <p className="text-xs font-mono">&ldquo;{example}&rdquo;</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {tool.keywords && tool.keywords.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {tool.keywords.slice(0, 4).map((keyword) => (
                                  <Badge key={keyword} variant="outline" className="text-[10px]">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>
          Can&apos;t find what you&apos;re looking for? Contact support or{' '}
          <Link href="/help" className="text-primary hover:underline">
            visit the help center
          </Link>
        </p>
      </div>
    </div>
  );
}
