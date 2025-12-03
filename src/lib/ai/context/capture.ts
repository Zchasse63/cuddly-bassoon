/**
 * ViewContext Capture
 * Utilities for capturing page-specific context
 */

import {
  ViewContext,
  ViewType,
  PropertySearchContext,
  PropertyDetailContext,
  DealAnalysisContext,
  BuyerListContext,
  BuyerDetailContext,
  DashboardContext,
  CampaignContext,
} from './types';

/**
 * Create a base context with common fields
 */
export function createBaseContext(viewType: ViewType, userId?: string, sessionId?: string): ViewContext {
  return {
    viewType,
    timestamp: new Date(),
    userId,
    sessionId,
  };
}

/**
 * Capture dashboard context
 */
export function captureDashboardContext(
  data: Omit<DashboardContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): DashboardContext {
  return {
    viewType: 'dashboard',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Capture property search context
 */
export function capturePropertySearchContext(
  data: Omit<PropertySearchContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): PropertySearchContext {
  return {
    viewType: 'property_search',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Capture property detail context
 */
export function capturePropertyDetailContext(
  data: Omit<PropertyDetailContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): PropertyDetailContext {
  return {
    viewType: 'property_detail',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Capture deal analysis context
 */
export function captureDealAnalysisContext(
  data: Omit<DealAnalysisContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): DealAnalysisContext {
  return {
    viewType: 'deal_analysis',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Capture buyer list context
 */
export function captureBuyerListContext(
  data: Omit<BuyerListContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): BuyerListContext {
  return {
    viewType: 'buyer_list',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Capture buyer detail context
 */
export function captureBuyerDetailContext(
  data: Omit<BuyerDetailContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): BuyerDetailContext {
  return {
    viewType: 'buyer_detail',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Capture campaign context
 */
export function captureCampaignContext(
  data: Omit<CampaignContext, 'viewType' | 'timestamp'>,
  userId?: string,
  sessionId?: string
): CampaignContext {
  return {
    viewType: 'campaign',
    timestamp: new Date(),
    userId,
    sessionId,
    ...data,
  };
}

/**
 * Serialize context for AI consumption
 */
export function serializeContext(context: ViewContext): string {
  const lines: string[] = [`Current View: ${context.viewType}`];

  if (context.viewType === 'property_search') {
    const ctx = context as PropertySearchContext;
    lines.push(`Results: ${ctx.resultCount} properties`);
    if (ctx.filters.location) lines.push(`Location: ${ctx.filters.location}`);
    if (ctx.filters.propertyType?.length) lines.push(`Property Types: ${ctx.filters.propertyType.join(', ')}`);
    if (ctx.filters.priceRange) {
      lines.push(`Price Range: $${ctx.filters.priceRange.min || 0} - $${ctx.filters.priceRange.max || 'unlimited'}`);
    }
  } else if (context.viewType === 'property_detail') {
    const ctx = context as PropertyDetailContext;
    lines.push(`Property: ${ctx.property.address}`);
    if (ctx.property.estimatedValue) lines.push(`Estimated Value: $${ctx.property.estimatedValue.toLocaleString()}`);
    if (ctx.property.motivationScore) lines.push(`Motivation Score: ${ctx.property.motivationScore}/100`);
  } else if (context.viewType === 'deal_analysis') {
    const ctx = context as DealAnalysisContext;
    lines.push(`Deal: ${ctx.deal.address}`);
    if (ctx.deal.arv) lines.push(`ARV: $${ctx.deal.arv.toLocaleString()}`);
    if (ctx.deal.potentialProfit) lines.push(`Potential Profit: $${ctx.deal.potentialProfit.toLocaleString()}`);
  }

  return lines.join('\n');
}

