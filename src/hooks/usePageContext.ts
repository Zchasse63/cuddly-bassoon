'use client';

import { useEffect } from 'react';
import {
  useViewContext,
  type ViewType,
  type EntityContext,
  type QuickAction,
} from '@/contexts/ViewContext';

/**
 * usePageContext - Hook to set page context for AI awareness
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 8
 *
 * Use this hook at the top of page components to set the current view
 * and optionally the entity being viewed.
 *
 * @example
 * // Simple page context
 * usePageContext('dashboard');
 *
 * @example
 * // Page with entity context
 * usePageContext('property-detail', {
 *   entity: {
 *     type: 'property',
 *     id: property.id,
 *     name: property.address,
 *     metadata: { price: property.price }
 *   },
 *   quickActions: [
 *     { id: 'analyze', label: 'Analyze Deal', action: () => {} },
 *     { id: 'comps', label: 'Find Comps', action: () => {} },
 *   ]
 * });
 */

interface PageContextOptions {
  label?: string;
  entity?: EntityContext;
  quickActions?: QuickAction[];
}

export function usePageContext(view: ViewType, options: PageContextOptions = {}) {
  const { setView, setEntity, setQuickActions, clearEntity } = useViewContext();

  // Destructure options to satisfy exhaustive-deps
  const { label, entity, quickActions } = options;

  useEffect(() => {
    // Set the view
    setView(view, label);

    // Set entity if provided
    if (entity) {
      setEntity(entity);
    }

    // Set quick actions if provided
    if (quickActions) {
      setQuickActions(quickActions);
    }

    // Cleanup on unmount
    return () => {
      clearEntity();
    };
  }, [view, label, entity, quickActions, setView, setEntity, setQuickActions, clearEntity]);

  // Return context methods for dynamic updates
  return { setEntity, setQuickActions, clearEntity };
}

/**
 * Default quick actions for common page types
 */
export const DEFAULT_QUICK_ACTIONS: Record<ViewType, QuickAction[]> = {
  dashboard: [
    { id: 'search', label: 'Search Properties', action: () => {} },
    { id: 'add-deal', label: 'Add Deal', action: () => {} },
  ],
  properties: [
    { id: 'search', label: 'AI Search', action: () => {} },
    { id: 'filter', label: 'Smart Filter', action: () => {} },
  ],
  'property-detail': [
    { id: 'analyze', label: 'Analyze Deal', action: () => {} },
    { id: 'comps', label: 'Find Comps', action: () => {} },
    { id: 'outreach', label: 'Generate Outreach', action: () => {} },
  ],
  buyers: [
    { id: 'search', label: 'Find Buyers', action: () => {} },
    { id: 'match', label: 'Match Properties', action: () => {} },
  ],
  'buyer-detail': [
    { id: 'match', label: 'Find Matches', action: () => {} },
    { id: 'contact', label: 'Draft Message', action: () => {} },
  ],
  deals: [
    { id: 'analyze', label: 'Analyze Pipeline', action: () => {} },
    { id: 'add', label: 'Add Deal', action: () => {} },
  ],
  'deal-detail': [
    { id: 'analyze', label: 'Deal Analysis', action: () => {} },
    { id: 'docs', label: 'Generate Docs', action: () => {} },
  ],
  documents: [
    { id: 'generate', label: 'Generate Document', action: () => {} },
    { id: 'search', label: 'Search Docs', action: () => {} },
  ],
  analytics: [
    { id: 'report', label: 'Generate Report', action: () => {} },
    { id: 'insights', label: 'Get Insights', action: () => {} },
  ],
  'analytics-buyers': [
    { id: 'report', label: 'Buyer Report', action: () => {} },
    { id: 'insights', label: 'Buyer Insights', action: () => {} },
  ],
  'analytics-communications': [
    { id: 'report', label: 'Communication Report', action: () => {} },
    { id: 'analyze', label: 'Analyze Outreach', action: () => {} },
  ],
  'analytics-deals': [
    { id: 'report', label: 'Deal Report', action: () => {} },
    { id: 'forecast', label: 'Pipeline Forecast', action: () => {} },
  ],
  'analytics-heatmap': [
    { id: 'analyze', label: 'Analyze Area', action: () => {} },
    { id: 'compare', label: 'Compare Regions', action: () => {} },
  ],
  'analytics-markets': [
    { id: 'report', label: 'Market Report', action: () => {} },
    { id: 'trends', label: 'Market Trends', action: () => {} },
  ],
  'analytics-reports': [
    { id: 'create', label: 'Create Report', action: () => {} },
    { id: 'schedule', label: 'Schedule Report', action: () => {} },
  ],
  search: [
    { id: 'save', label: 'Save Search', action: () => {} },
    { id: 'export', label: 'Export Results', action: () => {} },
  ],
  settings: [],
  notifications: [],
  help: [
    { id: 'docs', label: 'View Docs', action: () => {} },
    { id: 'support', label: 'Contact Support', action: () => {} },
  ],
  team: [
    { id: 'analyze', label: 'Team Performance', action: () => {} },
    { id: 'add', label: 'Add Member', action: () => {} },
  ],
  lists: [
    { id: 'create', label: 'Create List', action: () => {} },
    { id: 'search', label: 'Search Lists', action: () => {} },
  ],
  filters: [
    { id: 'create', label: 'Create Filter', action: () => {} },
    { id: 'search', label: 'Search Filters', action: () => {} },
  ],
  market: [
    { id: 'analyze', label: 'Market Analysis', action: () => {} },
    { id: 'search', label: 'Search Markets', action: () => {} },
  ],
  map: [
    { id: 'search', label: 'Search Area', action: () => {} },
    { id: 'analyze', label: 'Analyze Area', action: () => {} },
  ],
  inbox: [
    { id: 'compose', label: 'New Message', action: () => {} },
    { id: 'search', label: 'Search Messages', action: () => {} },
  ],
  leads: [
    { id: 'add', label: 'Add Lead', action: () => {} },
    { id: 'import', label: 'Import Leads', action: () => {} },
  ],
  onboarding: [],
};
