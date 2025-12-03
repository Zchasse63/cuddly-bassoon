'use client';

import { List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Lists Page - Saved property and buyer lists
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function ListsPage() {
  usePageContext('properties'); // Lists are property-related

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lists</h1>
          <p className="page-description">Manage your saved property and buyer lists</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New List
        </Button>
      </div>

      <div className="empty-state">
        <div className="empty-state__icon">
          <List className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="empty-state__title">No lists yet</h3>
        <p className="empty-state__description">
          Create lists to organize your properties and buyers for quick access.
        </p>
        <Button variant="outline" className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create your first list
        </Button>
      </div>
    </div>
  );
}
