'use client';

import { Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Filters Page - Saved search filters
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function FiltersPage() {
  usePageContext('properties'); // Filters are property-related

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Filters</h1>
          <p className="page-description">
            Manage your saved search filters for quick property searches
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Filter
        </Button>
      </div>

      <div className="empty-state">
        <div className="empty-state__icon">
          <Filter className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="empty-state__title">No saved filters</h3>
        <p className="empty-state__description">
          Save your search criteria to quickly find properties matching your investment goals.
        </p>
        <Button variant="outline" className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create your first filter
        </Button>
      </div>
    </div>
  );
}
