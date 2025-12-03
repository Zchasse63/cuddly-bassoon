'use client';

import { Map, Layers, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Map Page - Interactive property map
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function MapPage() {
  usePageContext('properties'); // Map is property-related

  return (
    <div className="page-container h-[calc(100vh-4rem)]">
      <div className="page-header">
        <div>
          <h1 className="page-title">Property Map</h1>
          <p className="page-description">Explore properties on an interactive map</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Layers className="mr-2 h-4 w-4" />
            Layers
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="flex items-center justify-center h-full min-h-[500px]">
          <div className="text-center">
            <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-muted-foreground max-w-md">
              Map integration coming soon. View properties, comps, and market data on an interactive
              map.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
