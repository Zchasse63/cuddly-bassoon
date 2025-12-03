'use client';

/**
 * ViewContext Provider
 * React context for managing AI view context across the application
 */

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

import { ViewContext, ViewType } from '@/lib/ai/context';

interface ViewContextState {
  currentContext: ViewContext | null;
  contextHistory: ViewContext[];
}

interface ViewContextActions {
  setContext: (context: ViewContext) => void;
  updateContext: (updates: Partial<ViewContext>) => void;
  clearContext: () => void;
  getContextForAI: () => string;
}

type ViewContextValue = ViewContextState & ViewContextActions;

const ViewContextContext = createContext<ViewContextValue | null>(null);

const MAX_HISTORY_LENGTH = 10;

interface ViewContextProviderProps {
  children: ReactNode;
}

export function ViewContextProvider({ children }: ViewContextProviderProps) {
  const [state, setState] = useState<ViewContextState>({
    currentContext: null,
    contextHistory: [],
  });

  const setContext = useCallback((context: ViewContext) => {
    setState((prev) => ({
      currentContext: context,
      contextHistory: [context, ...prev.contextHistory].slice(0, MAX_HISTORY_LENGTH),
    }));
  }, []);

  const updateContext = useCallback((updates: Partial<ViewContext>) => {
    setState((prev) => {
      if (!prev.currentContext) return prev;
      const updated = { ...prev.currentContext, ...updates } as ViewContext;
      return {
        currentContext: updated,
        contextHistory: [updated, ...prev.contextHistory.slice(1)].slice(0, MAX_HISTORY_LENGTH),
      };
    });
  }, []);

  const clearContext = useCallback(() => {
    setState({ currentContext: null, contextHistory: [] });
  }, []);

  const getContextForAI = useCallback((): string => {
    if (!state.currentContext) return 'No current view context available.';

    const ctx = state.currentContext;
    const lines: string[] = [`## Current View: ${formatViewType(ctx.viewType)}`];

    // Add view-specific context
    if (ctx.viewType === 'property_search' && 'filters' in ctx) {
      lines.push(`\n### Search Context`);
      lines.push(`- Results: ${ctx.resultCount} properties found`);
      if (ctx.filters.location) lines.push(`- Location: ${ctx.filters.location}`);
      if (ctx.filters.propertyType?.length) {
        lines.push(`- Property Types: ${ctx.filters.propertyType.join(', ')}`);
      }
      if (ctx.filters.priceRange) {
        const min = ctx.filters.priceRange.min ? `$${ctx.filters.priceRange.min.toLocaleString()}` : 'Any';
        const max = ctx.filters.priceRange.max ? `$${ctx.filters.priceRange.max.toLocaleString()}` : 'Any';
        lines.push(`- Price Range: ${min} - ${max}`);
      }
    } else if (ctx.viewType === 'property_detail' && 'property' in ctx) {
      lines.push(`\n### Property Details`);
      lines.push(`- Address: ${ctx.property.address}`);
      if (ctx.property.city && ctx.property.state) {
        lines.push(`- Location: ${ctx.property.city}, ${ctx.property.state}`);
      }
      if (ctx.property.propertyType) lines.push(`- Type: ${ctx.property.propertyType}`);
      if (ctx.property.bedrooms) lines.push(`- Bedrooms: ${ctx.property.bedrooms}`);
      if (ctx.property.bathrooms) lines.push(`- Bathrooms: ${ctx.property.bathrooms}`);
      if (ctx.property.squareFootage) {
        lines.push(`- Square Footage: ${ctx.property.squareFootage.toLocaleString()}`);
      }
      if (ctx.property.estimatedValue) {
        lines.push(`- Estimated Value: $${ctx.property.estimatedValue.toLocaleString()}`);
      }
      if (ctx.property.motivationScore) {
        lines.push(`- Motivation Score: ${ctx.property.motivationScore}/100`);
      }
    } else if (ctx.viewType === 'deal_analysis' && 'deal' in ctx) {
      lines.push(`\n### Deal Analysis`);
      lines.push(`- Property: ${ctx.deal.address}`);
      if (ctx.deal.arv) lines.push(`- ARV: $${ctx.deal.arv.toLocaleString()}`);
      if (ctx.deal.repairCost) lines.push(`- Repair Cost: $${ctx.deal.repairCost.toLocaleString()}`);
      if (ctx.deal.mao) lines.push(`- MAO: $${ctx.deal.mao.toLocaleString()}`);
      if (ctx.deal.potentialProfit) {
        lines.push(`- Potential Profit: $${ctx.deal.potentialProfit.toLocaleString()}`);
      }
      if (ctx.deal.dealScore) lines.push(`- Deal Score: ${ctx.deal.dealScore}/10`);
    }

    return lines.join('\n');
  }, [state.currentContext]);

  const value = useMemo<ViewContextValue>(
    () => ({
      ...state,
      setContext,
      updateContext,
      clearContext,
      getContextForAI,
    }),
    [state, setContext, updateContext, clearContext, getContextForAI]
  );

  return <ViewContextContext.Provider value={value}>{children}</ViewContextContext.Provider>;
}

export function useViewContext(): ViewContextValue {
  const context = useContext(ViewContextContext);
  if (!context) {
    throw new Error('useViewContext must be used within a ViewContextProvider');
  }
  return context;
}

function formatViewType(viewType: ViewType): string {
  return viewType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

