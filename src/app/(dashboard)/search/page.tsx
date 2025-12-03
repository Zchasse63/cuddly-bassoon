'use client';

import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Search Page - AI-powered property search
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function SearchPage() {
  usePageContext('search');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Search</h1>
          <p className="page-description">Find properties using natural language</p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find 3-bedroom homes under $200k in distressed condition..."
                className="pl-10"
              />
            </div>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-3">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Vacant properties in 32801',
                'Pre-foreclosures under $150k',
                'Absentee owners with equity',
                'Properties with code violations',
              ].map((suggestion) => (
                <Button key={suggestion} variant="outline" size="sm" className="text-xs">
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-muted-foreground">
        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Search results will appear here</p>
      </div>
    </div>
  );
}
