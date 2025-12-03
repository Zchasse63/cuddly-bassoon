'use client';

import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Event types for analytics tracking
export type EventType =
  // Search & Discovery
  | 'property_search'
  | 'property_view'
  | 'property_save'
  | 'property_analyze'
  | 'filter_applied'
  | 'skip_trace_run'
  // Outreach
  | 'call_made'
  | 'call_completed'
  | 'sms_sent'
  | 'sms_received'
  | 'email_sent'
  | 'email_opened'
  | 'email_replied'
  | 'mail_sent'
  // Pipeline
  | 'lead_created'
  | 'lead_stage_changed'
  | 'appointment_set'
  | 'offer_made'
  | 'contract_signed'
  | 'deal_closed'
  // Financial
  | 'revenue_recorded'
  | 'expense_recorded';

interface TrackEventOptions {
  eventType: EventType;
  eventData?: Record<string, unknown>;
}

interface UseAnalyticsReturn {
  trackEvent: (options: TrackEventOptions) => Promise<void>;
  trackPropertySearch: (query: string, resultsCount: number) => Promise<void>;
  trackPropertyView: (propertyId: string) => Promise<void>;
  trackPropertySave: (propertyId: string) => Promise<void>;
  trackPropertyAnalyze: (propertyId: string) => Promise<void>;
  trackLeadCreated: (leadId: string, source?: string) => Promise<void>;
  trackOfferMade: (dealId: string, amount: number) => Promise<void>;
  trackDealClosed: (dealId: string, revenue: number) => Promise<void>;
  sessionId: string;
}

export function useAnalytics(): UseAnalyticsReturn {
  // Generate session ID once per hook instance
  const sessionIdRef = useRef<string>(uuidv4());

  const trackEvent = useCallback(async ({ eventType, eventData = {} }: TrackEventOptions) => {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData,
          session_id: sessionIdRef.current,
        }),
      });
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.error('Analytics tracking error:', error);
    }
  }, []);

  // Convenience methods for common events
  const trackPropertySearch = useCallback(
    async (query: string, resultsCount: number) => {
      await trackEvent({
        eventType: 'property_search',
        eventData: { query, results_count: resultsCount },
      });
    },
    [trackEvent]
  );

  const trackPropertyView = useCallback(
    async (propertyId: string) => {
      await trackEvent({
        eventType: 'property_view',
        eventData: { property_id: propertyId },
      });
    },
    [trackEvent]
  );

  const trackPropertySave = useCallback(
    async (propertyId: string) => {
      await trackEvent({
        eventType: 'property_save',
        eventData: { property_id: propertyId },
      });
    },
    [trackEvent]
  );

  const trackPropertyAnalyze = useCallback(
    async (propertyId: string) => {
      await trackEvent({
        eventType: 'property_analyze',
        eventData: { property_id: propertyId },
      });
    },
    [trackEvent]
  );

  const trackLeadCreated = useCallback(
    async (leadId: string, source?: string) => {
      await trackEvent({
        eventType: 'lead_created',
        eventData: { lead_id: leadId, source },
      });
    },
    [trackEvent]
  );

  const trackOfferMade = useCallback(
    async (dealId: string, amount: number) => {
      await trackEvent({
        eventType: 'offer_made',
        eventData: { deal_id: dealId, amount },
      });
    },
    [trackEvent]
  );

  const trackDealClosed = useCallback(
    async (dealId: string, revenue: number) => {
      await trackEvent({
        eventType: 'deal_closed',
        eventData: { deal_id: dealId, revenue },
      });
      // Also track revenue
      await trackEvent({
        eventType: 'revenue_recorded',
        eventData: { deal_id: dealId, amount: revenue },
      });
    },
    [trackEvent]
  );

  // Create a getter for sessionId to avoid accessing ref during render
  const getSessionId = useCallback(() => sessionIdRef.current, []);

  return {
    trackEvent,
    trackPropertySearch,
    trackPropertyView,
    trackPropertySave,
    trackPropertyAnalyze,
    trackLeadCreated,
    trackOfferMade,
    trackDealClosed,
    getSessionId,
  };
}
