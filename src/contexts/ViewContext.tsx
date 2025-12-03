'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

/**
 * ViewContext - Page awareness and entity tracking for AI
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 8
 *
 * Provides context-aware AI interactions by tracking:
 * - Current page/view type
 * - Active entity (property, buyer, deal)
 * - Available quick actions for the context
 */

export type ViewType =
  | 'dashboard'
  | 'properties'
  | 'property-detail'
  | 'buyers'
  | 'buyer-detail'
  | 'deals'
  | 'deal-detail'
  | 'documents'
  | 'analytics'
  | 'search'
  | 'settings'
  | 'notifications'
  | 'help'
  | 'team'
  | 'lists'
  | 'filters'
  | 'market'
  | 'map';

export interface EntityContext {
  type: 'property' | 'buyer' | 'deal' | 'document' | null;
  id: string | null;
  name: string | null;
  metadata?: Record<string, unknown>;
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

interface ViewContextValue {
  // Current view state
  currentView: ViewType;
  viewLabel: string;

  // Entity context
  entity: EntityContext;

  // Quick actions for current context
  quickActions: QuickAction[];

  // Methods to update context
  setView: (view: ViewType, label?: string) => void;
  setEntity: (entity: EntityContext) => void;
  setQuickActions: (actions: QuickAction[]) => void;
  clearEntity: () => void;

  // AI context string for prompts
  getAIContext: () => string;
}

const ViewContext = createContext<ViewContextValue | null>(null);

export function useViewContext() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext must be used within a ViewContextProvider');
  }
  return context;
}

// Safe hook that doesn't throw if outside provider
export function useViewContextSafe() {
  return useContext(ViewContext);
}

const DEFAULT_ENTITY: EntityContext = {
  type: null,
  id: null,
  name: null,
};

const VIEW_LABELS: Record<ViewType, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  'property-detail': 'Property Details',
  buyers: 'Buyers',
  'buyer-detail': 'Buyer Details',
  deals: 'Deals',
  'deal-detail': 'Deal Details',
  documents: 'Documents',
  analytics: 'Analytics',
  search: 'Search',
  settings: 'Settings',
  notifications: 'Notifications',
  help: 'Help',
  team: 'Team',
  lists: 'Lists',
  filters: 'Filters',
  market: 'Market',
  map: 'Map',
};

interface ViewContextProviderProps {
  children: ReactNode;
  initialView?: ViewType;
}

export function ViewContextProvider({
  children,
  initialView = 'dashboard',
}: ViewContextProviderProps) {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [viewLabel, setViewLabel] = useState(VIEW_LABELS[initialView]);
  const [entity, setEntityState] = useState<EntityContext>(DEFAULT_ENTITY);
  const [quickActions, setQuickActionsState] = useState<QuickAction[]>([]);

  const setView = useCallback((view: ViewType, label?: string) => {
    setCurrentView(view);
    setViewLabel(label || VIEW_LABELS[view]);
  }, []);

  const setEntity = useCallback((newEntity: EntityContext) => {
    setEntityState(newEntity);
  }, []);

  const setQuickActions = useCallback((actions: QuickAction[]) => {
    setQuickActionsState(actions);
  }, []);

  const clearEntity = useCallback(() => {
    setEntityState(DEFAULT_ENTITY);
    setQuickActionsState([]);
  }, []);

  const getAIContext = useCallback(() => {
    let context = `Current page: ${viewLabel}`;
    if (entity.type && entity.name) {
      context += `\nViewing ${entity.type}: ${entity.name}`;
      if (entity.metadata) {
        context += `\nDetails: ${JSON.stringify(entity.metadata)}`;
      }
    }
    return context;
  }, [viewLabel, entity]);

  const value = useMemo(
    () => ({
      currentView,
      viewLabel,
      entity,
      quickActions,
      setView,
      setEntity,
      setQuickActions,
      clearEntity,
      getAIContext,
    }),
    [
      currentView,
      viewLabel,
      entity,
      quickActions,
      setView,
      setEntity,
      setQuickActions,
      clearEntity,
      getAIContext,
    ]
  );

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}
