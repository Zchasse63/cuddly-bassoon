# AI Interaction Map: Complete Platform Specification

**Version:** 1.0  
**Date:** December 2, 2025  
**Status:** Ready for Implementation  
**Related Documents:** AI-First Wholesaling Platform Definitive Plan v2, RentCast Integration Specification v2

---

## Executive Summary

This document defines how the AI assistant integrates throughout the entire platform, creating fluid, contextual interactions that make the AI feel native rather than bolted-on. The AI "follows" the user through every part of the platform, understanding context and enabling natural language commands to take action.

### Key Principles

1. **Context Awareness** — AI knows what the user is viewing and can act on it
2. **Action-Oriented** — AI executes tasks, not just answers questions
3. **Chained Operations** — AI can perform multi-step workflows in one request
4. **Natural Language** — Users speak naturally, AI interprets and acts
5. **Platform Native** — AI understands filters, deals, buyers, and all platform concepts

### Scope

- **11 Platform Areas** (10 core + Heat Mapping)
- **126 AI Tools** (112 core + 14 heat map/market tools)
- **Full RentCast Integration** for heat mapping and market analysis

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [View Context System](#2-view-context-system)
3. [Property Search & Discovery](#3-property-search--discovery)
4. [Property Detail View](#4-property-detail-view)
5. [Deal Pipeline](#5-deal-pipeline)
6. [Lead Lists / CRM](#6-lead-lists--crm)
7. [Buyer Database](#7-buyer-database)
8. [Market Analysis](#8-market-analysis)
9. [Filter System](#9-filter-system)
10. [Dashboard / KPIs](#10-dashboard--kpis)
11. [Skip Tracing](#11-skip-tracing)
12. [Notifications & Alerts](#12-notifications--alerts)
13. [Heat Mapping System](#13-heat-mapping-system)
14. [Database Schema Additions](#14-database-schema-additions)
15. [Tool Implementation Reference](#15-tool-implementation-reference)

---

## 1. Architecture Overview

### System Prompt Layers

The AI system prompt is assembled dynamically from multiple layers:

```typescript
// lib/ai/system-prompts.ts

// Layer 1: Platform Identity (static)
const PLATFORM_IDENTITY = `
You are the AI assistant for [Platform Name], an AI-first real estate wholesaling platform.

## What Makes This Platform Different
- We use "Contrarian Filters" to find motivated sellers that competitors overlook
- We auto-discover buyers from transaction data
- Natural language is the primary way users interact
- Everything connects: search, analysis, CRM, deals

## Your Role
You're not a generic chatbot—you ARE the interface. Users expect you to:
- Execute searches directly, not explain how to use filters
- Know their preferences and apply them automatically
- Understand our filter system deeply
- Guide them through deals proactively
`;

// Layer 2: Filter Knowledge (static or RAG-retrieved)
const FILTER_KNOWLEDGE = `
## Our Three-Tier Filter System

**Standard Filters** (High competition - everyone uses these):
- Absentee owner, high equity, free & clear, tired landlord

**Enhanced Filters** (Moderate competition - our improvements):
- New absentee, distant owner, equity sweet spot, accidental landlord

**Contrarian Filters** (Low competition - our secret sauce):
- Almost Sold: Listed but failed to sell—they WANT to sell
- Underwater Landlord: Negative cash flow, bleeding money monthly
- Tax Squeeze: Assessment rising faster than value
- Shrinking Landlord: Investor actively reducing portfolio
- Quiet Equity Builder: Recently paid off mortgage
- FSBO Fatigue: Failed For Sale By Owner attempt
- Negative Momentum: In declining market area
- Life Stage Transition: Signs of major life change
- Orphan Property: Data anomalies, often overlooked

When users ask for "less competition" or "unique leads," recommend contrarian filters.
`;

// Layer 3: User Context (dynamic, loaded per request)
function buildUserContext(user: User, preferences: UserPreferences, activity: RecentActivity): string {
  return `
## This User
- Name: ${user.name}
- Default Markets: ${preferences.default_city}, ${preferences.default_state}
- Target Profit Margin: ${(preferences.target_profit_margin * 100)}%
- Preferred Property Types: ${preferences.default_property_types?.join(', ') || 'All types'}
- Active Deals: ${activity.activeDeals}
- Saved Filters: ${activity.savedFilters?.map(f => f.name).join(', ') || 'None'}
- Total Leads: ${activity.totalLeads}
`;
}

// Layer 4: View Context (dynamic, passed per request)
function buildViewContext(context: ViewContext): string {
  return `
## Current Context
User is viewing: ${context.currentView}
${context.visiblePropertyIds?.length ? `Properties in view: ${context.visiblePropertyIds.length}` : ''}
${context.selectedPropertyIds?.length ? `Selected properties: ${context.selectedPropertyIds.length}` : ''}
${context.propertyId ? `Current property: ${context.propertyId}` : ''}
${context.dealId ? `Current deal: ${context.dealId}` : ''}
${context.activeFilters ? `Active filters: ${JSON.stringify(context.activeFilters)}` : ''}
${context.currentList ? `Current list: ${context.currentList.name} (${context.currentList.itemCount} items)` : ''}

Tailor your responses to this context. When users say "these" or "this," they mean the current view context.
`;
}

// Layer 5: Session Memory (accumulated during conversation)
function buildSessionMemory(session: ChatSession): string {
  if (!session.context) return '';
  
  return `
## This Conversation
- Properties discussed: ${session.context.mentionedProperties?.join(', ') || 'None'}
- Filters explored: ${session.context.filtersDiscussed?.join(', ') || 'None'}
- Last search: ${session.context.lastSearchResults ? `${session.context.lastSearchResults.count} results` : 'None'}
`;
}
```

### Chat API Route with Context

```typescript
// app/api/ai/chat/route.ts

import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { aiTools } from '@/lib/ai/ai-tools';
import {
  PLATFORM_IDENTITY,
  FILTER_KNOWLEDGE,
  buildUserContext,
  buildViewContext,
  buildSessionMemory
} from '@/lib/ai/system-prompts';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const { messages, sessionId, viewContext } = await req.json();
  
  // Load user data
  const [preferences, activity, session] = await Promise.all([
    supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
    getUserActivity(user.id),
    supabase.from('chat_sessions').select('*').eq('id', sessionId).single()
  ]);
  
  // Assemble system prompt
  const systemPrompt = [
    PLATFORM_IDENTITY,
    FILTER_KNOWLEDGE,
    buildUserContext(user, preferences.data, activity),
    buildViewContext(viewContext),
    buildSessionMemory(session.data)
  ].join('\n\n');
  
  const result = await streamText({
    model: anthropic('claude-sonnet-4-5-20250514'),
    system: systemPrompt,
    messages,
    tools: aiTools,
    maxTokens: 4096,
    onFinish: async ({ text, usage, toolCalls }) => {
      // Save message
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: text,
        model_used: 'claude-sonnet-4-5-20250514',
        tokens_used: usage?.totalTokens,
        tool_calls: toolCalls
      });
      
      // Update session context based on conversation
      await updateSessionContext(sessionId, { text, toolCalls });
    }
  });
  
  return result.toDataStreamResponse();
}
```

---

## 2. View Context System

Every page in the platform passes context to the AI, enabling contextual interactions.

### ViewContext Interface

```typescript
// types/ai-context.ts

interface ViewContext {
  // Current location in platform
  currentView: 
    | 'dashboard'
    | 'search-results'
    | 'map-view'
    | 'property-detail'
    | 'deal-pipeline'
    | 'deal-detail'
    | 'lead-list'
    | 'all-lists'
    | 'buyer-list'
    | 'buyer-detail'
    | 'market-analysis'
    | 'filter-builder'
    | 'saved-filters'
    | 'skip-trace'
    | 'notifications'
    | 'heat-map'
    | 'settings';
  
  // Property context
  visiblePropertyIds?: string[];      // Properties currently displayed
  selectedPropertyIds?: string[];     // Properties user has selected/checked
  propertyId?: string;                // Single property being viewed
  
  // Deal context
  dealId?: string;                    // Deal being viewed
  dealsByStatus?: Record<string, number>; // Pipeline counts
  
  // List context
  currentList?: {
    id: string;
    name: string;
    itemCount: number;
  };
  
  // Search/Filter context
  activeFilters?: Record<string, any>;
  activeFilterTemplates?: string[];
  searchQuery?: string;
  resultCount?: number;
  
  // Buyer context
  buyerId?: string;
  
  // Map context
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  mapCenter?: {
    lat: number;
    lng: number;
  };
  mapZoom?: number;
  activeHeatLayers?: string[];
  
  // Market context
  selectedMarket?: {
    type: 'zip' | 'city' | 'county' | 'metro';
    value: string;
  };
}
```

### Frontend Context Provider

```typescript
// contexts/ai-context.tsx

import { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';

const AIContextProvider = ({ children }) => {
  const pathname = usePathname();
  
  // Derive current view from pathname
  const currentView = useMemo(() => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/search')) return 'search-results';
    if (pathname.startsWith('/map')) return 'map-view';
    if (pathname.startsWith('/property/')) return 'property-detail';
    if (pathname.startsWith('/deals')) return 'deal-pipeline';
    if (pathname.startsWith('/leads')) return 'lead-list';
    if (pathname.startsWith('/buyers')) return 'buyer-list';
    if (pathname.startsWith('/market')) return 'market-analysis';
    if (pathname.startsWith('/filters')) return 'filter-builder';
    if (pathname.startsWith('/heat-map')) return 'heat-map';
    // ... etc
    return 'dashboard';
  }, [pathname]);
  
  // Context is assembled from various sources
  const viewContext: ViewContext = {
    currentView,
    // Other context comes from page-specific providers
  };
  
  return (
    <AIContext.Provider value={viewContext}>
      {children}
    </AIContext.Provider>
  );
};

// Hook for pages to add their specific context
export const useAIContext = () => {
  const context = useContext(AIContext);
  
  const setPageContext = (pageContext: Partial<ViewContext>) => {
    // Merge page-specific context
  };
  
  return { ...context, setPageContext };
};
```

### Usage in Components

```typescript
// Example: Property List Component
const PropertyListView = () => {
  const { setPageContext } = useAIContext();
  const { properties, selectedIds, filters } = usePropertyList();
  
  // Update AI context when view changes
  useEffect(() => {
    setPageContext({
      visiblePropertyIds: properties.map(p => p.id),
      selectedPropertyIds: selectedIds,
      activeFilters: filters,
      resultCount: properties.length
    });
  }, [properties, selectedIds, filters]);
  
  return (
    // ... component UI
  );
};
```

---

## 3. Property Search & Discovery

### Context Available

```typescript
{
  currentView: 'search-results' | 'map-view',
  activeFilters: { city, state, propertyType, filterTemplates... },
  activeFilterTemplates: ['absentee-owner', 'high-equity'],
  visiblePropertyIds: string[],      // Up to 100 visible properties
  selectedPropertyIds: string[],     // User-checked properties
  resultCount: number,
  currentPage: number,
  sortOrder: string,
  searchQuery: string                // Natural language query if used
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Narrow this down to just the tired landlords" | Adds `tired-landlord` filter template to current search |
| "Show me only the ones with 60%+ equity" | Adds `equityMin: 60` filter |
| "Why are these showing up?" | Explains which filters matched for visible properties |
| "Add all of these to my Hot Leads list" | Bulk adds all visible properties to specified lead list |
| "Add the selected ones to Tuesday Calls" | Adds only checked properties to list |
| "Skip trace the top 50 and save to Hot Leads" | Chains: rank by motivation → skip trace top 50 → add to list |
| "Export this to a spreadsheet" | Generates CSV/Excel download of current results |
| "Save this search and alert me daily" | Creates saved filter with daily notification |
| "How does this compare to last week's search?" | Compares current results to previous execution |
| "Remove the ones I've already contacted" | Filters out properties with 'contacted' status in CRM |
| "Sort by newest absentee first" | Changes sort to `became_absentee_date_desc` |
| "Show me properties I haven't seen before" | Excludes previously viewed properties |
| "What's the average equity in these results?" | Calculates aggregate stats on current results |

### Tools Required

```typescript
// lib/ai/tools/search-tools.ts

export const searchTools = {
  addFilterToSearch: tool({
    description: 'Add a filter criterion to the current property search',
    parameters: z.object({
      filterType: z.enum(['template', 'custom']),
      templateSlug: z.string().optional().describe('Filter template slug like "tired-landlord"'),
      customFilter: z.object({
        field: z.string(),
        operator: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains']),
        value: z.any()
      }).optional()
    }),
    execute: async ({ filterType, templateSlug, customFilter }, { userId, viewContext }) => {
      // Add filter to current search state
      // Return updated results count
    }
  }),
  
  removeFilterFromSearch: tool({
    description: 'Remove a filter from the current search',
    parameters: z.object({
      filterType: z.enum(['template', 'custom']),
      templateSlug: z.string().optional(),
      field: z.string().optional()
    }),
    execute: async (params, context) => {
      // Remove filter, return updated results
    }
  }),
  
  explainSearchResults: tool({
    description: 'Explain why properties appear in current search results',
    parameters: z.object({
      propertyIds: z.array(z.string()).optional().describe('Specific properties to explain, or omit for general explanation'),
      limit: z.number().default(5)
    }),
    execute: async ({ propertyIds, limit }, { viewContext }) => {
      // Analyze which filters each property matches
      // Return explanation with filter breakdown
    }
  }),
  
  bulkAddToLeadList: tool({
    description: 'Add multiple properties to a lead list',
    parameters: z.object({
      listName: z.string().describe('Name of list (creates if does not exist)'),
      propertyIds: z.array(z.string()).optional().describe('Specific IDs, or omit to use visible/selected'),
      source: z.enum(['visible', 'selected', 'specific']).default('visible'),
      reasoning: z.string().optional()
    }),
    execute: async ({ listName, propertyIds, source, reasoning }, { userId, viewContext }) => {
      // Determine which properties to add based on source
      const idsToAdd = source === 'specific' ? propertyIds 
        : source === 'selected' ? viewContext.selectedPropertyIds
        : viewContext.visiblePropertyIds;
      
      // Find or create list
      // Bulk insert with reasoning
      // Return count added
    }
  }),
  
  rankAndAddToList: tool({
    description: 'Rank properties by motivation score and add top N to a list',
    parameters: z.object({
      listName: z.string(),
      topN: z.number().describe('Number of top properties to add'),
      skipTrace: z.boolean().default(false).describe('Whether to skip trace before adding')
    }),
    execute: async ({ listName, topN, skipTrace }, { viewContext }) => {
      // Get visible properties
      // Calculate motivation scores
      // Sort and take top N
      // Optionally skip trace
      // Add to list
    }
  }),
  
  exportSearchResults: tool({
    description: 'Export current search results to a file',
    parameters: z.object({
      format: z.enum(['csv', 'excel']),
      fields: z.array(z.string()).optional().describe('Specific fields to include'),
      source: z.enum(['visible', 'selected', 'all']).default('visible')
    }),
    execute: async ({ format, fields, source }, { viewContext }) => {
      // Generate export file
      // Return download URL
    }
  }),
  
  saveSearchAsFilter: tool({
    description: 'Save current search criteria as a reusable filter',
    parameters: z.object({
      name: z.string(),
      notifyOnNewMatches: z.boolean().default(false),
      notificationFrequency: z.enum(['realtime', 'daily', 'weekly']).optional()
    }),
    execute: async ({ name, notifyOnNewMatches, notificationFrequency }, { userId, viewContext }) => {
      // Save filter combination to user_saved_filters
    }
  }),
  
  compareToSavedSearch: tool({
    description: 'Compare current results to a previous search execution',
    parameters: z.object({
      savedFilterId: z.string().optional(),
      savedFilterName: z.string().optional(),
      comparisonType: z.enum(['new_matches', 'removed', 'all_changes'])
    }),
    execute: async (params, { userId, viewContext }) => {
      // Compare current results to last execution
      // Return diff analysis
    }
  }),
  
  excludeContactedLeads: tool({
    description: 'Remove properties from results that have been contacted',
    parameters: z.object({
      statusesToExclude: z.array(z.string()).default(['contacted', 'negotiating', 'dead'])
    }),
    execute: async ({ statusesToExclude }, { userId, viewContext }) => {
      // Filter out properties in CRM with specified statuses
    }
  }),
  
  changeSortOrder: tool({
    description: 'Change how search results are sorted',
    parameters: z.object({
      sortBy: z.enum([
        'motivation_score', 'equity_percent', 'days_owned', 
        'estimated_value', 'last_sale_date', 'became_absentee_date'
      ]),
      direction: z.enum(['asc', 'desc']).default('desc')
    }),
    execute: async ({ sortBy, direction }, { viewContext }) => {
      // Update sort order
    }
  }),
  
  calculateResultsStats: tool({
    description: 'Calculate aggregate statistics on current search results',
    parameters: z.object({
      metrics: z.array(z.enum([
        'avg_equity', 'median_equity', 'avg_value', 'total_value',
        'avg_days_owned', 'motivation_distribution', 'property_type_breakdown'
      ]))
    }),
    execute: async ({ metrics }, { viewContext }) => {
      // Calculate requested stats
    }
  })
};
```

**Tool Count: 10**

---

## 4. Property Detail View

### Context Available

```typescript
{
  currentView: 'property-detail',
  propertyId: string,
  propertyData: {
    address: string,
    city: string,
    state: string,
    zipCode: string,
    propertyType: string,
    bedrooms: number,
    bathrooms: number,
    squareFootage: number,
    yearBuilt: number,
    estimatedValue: number,
    lastSalePrice: number,
    lastSaleDate: string,
    ownerOccupied: boolean,
    owner: {
      names: string[],
      mailingAddress: string,
      ownerType: string
    },
    equityPercent: number,
    motivationScore: number
  },
  valuationData: {
    arv: number,
    rentEstimate: number,
    comps: Comp[]
  },
  motivationIndicators: string[],      // ['absentee', 'high-equity', 'tired-landlord']
  existingDealStatus: string | null,   // If property is already in pipeline
  existingListMembership: string[]     // Lists this property belongs to
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Analyze this deal" | Runs full deal analysis with recommendation |
| "Is this a good flip or rental?" | Compares both strategies with numbers |
| "What's wrong with this property?" | Highlights risk factors and concerns |
| "Find me buyers for this" | Matches to buyer database, ranks by fit |
| "Add to my pipeline" | Creates deal record in 'lead' status |
| "Skip trace the owner" | Initiates skip trace, returns contact info |
| "What comps support this ARV?" | Explains each comp with adjustments |
| "Draft an offer at 70% of ARV minus repairs" | Calculates MAO, generates offer amount |
| "How long has the owner had this?" | Returns ownership history summary |
| "Show me other properties this owner has" | Queries owner's portfolio |
| "Why is the motivation score 78?" | Breaks down scoring factors |
| "Compare this to the one on Oak Street" | Side-by-side comparison |
| "What would my cash flow be?" | Runs rental analysis with user's defaults |

### Tools Required

```typescript
// lib/ai/tools/property-tools.ts

export const propertyTools = {
  analyzeDeal: tool({
    description: 'Run comprehensive deal analysis on a property',
    parameters: z.object({
      propertyId: z.string().optional().describe('Property ID, or omit to use current'),
      repairEstimate: z.number().optional(),
      targetProfitMargin: z.number().optional()
    }),
    execute: async ({ propertyId, repairEstimate, targetProfitMargin }, { viewContext, userPreferences }) => {
      const propId = propertyId || viewContext.propertyId;
      // Load property data
      // Calculate ARV, MAO, equity, cash flow
      // Generate AI narrative with recommendation
      // Return DealAnalysis object
    }
  }),
  
  compareStrategies: tool({
    description: 'Compare different investment strategies for a property',
    parameters: z.object({
      propertyId: z.string().optional(),
      strategies: z.array(z.enum(['wholesale', 'flip', 'rental', 'brrrr'])).default(['wholesale', 'flip', 'rental'])
    }),
    execute: async ({ propertyId, strategies }, context) => {
      // Calculate returns for each strategy
      // Return comparison with recommendation
    }
  }),
  
  identifyRiskFactors: tool({
    description: 'Identify potential risks and concerns for a property',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Analyze property for risks:
      // - Market trends
      // - Property condition indicators
      // - Comp quality
      // - Owner situation
      // - Title concerns
    }
  }),
  
  matchBuyersToProperty: tool({
    description: 'Find and rank buyers who would be interested in this property',
    parameters: z.object({
      propertyId: z.string().optional(),
      limit: z.number().default(10)
    }),
    execute: async ({ propertyId, limit }, { userId, viewContext }) => {
      // Load property details
      // Query buyer database for matches
      // Score each buyer on fit
      // Return ranked list with match reasons
    }
  }),
  
  createDeal: tool({
    description: 'Create a deal record for a property',
    parameters: z.object({
      propertyId: z.string().optional(),
      status: z.enum(['lead', 'analyzing', 'contacted']).default('lead'),
      notes: z.string().optional()
    }),
    execute: async ({ propertyId, status, notes }, { userId, viewContext }) => {
      // Create deal in database
      // Return deal ID
    }
  }),
  
  skipTraceOwner: tool({
    description: 'Skip trace the property owner to get contact information',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Call BatchSkipTracing API
      // Return contact info (phones, emails)
    }
  }),
  
  explainComps: tool({
    description: 'Explain the comparable properties supporting the ARV',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Load comps from valuation
      // Generate explanation for each comp:
      // - Why it's comparable
      // - Adjustments needed
      // - How it supports/challenges the ARV
    }
  }),
  
  calculateOffer: tool({
    description: 'Calculate maximum allowable offer based on formula',
    parameters: z.object({
      propertyId: z.string().optional(),
      arvOverride: z.number().optional(),
      repairEstimate: z.number().optional(),
      formula: z.enum(['70_percent', '75_percent', 'custom']).default('70_percent'),
      targetProfit: z.number().optional().describe('For custom formula')
    }),
    execute: async (params, context) => {
      // Calculate MAO using specified formula
      // Return offer amount with breakdown
    }
  }),
  
  getOwnershipHistory: tool({
    description: 'Get the ownership history of a property',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Return transaction history
      // Include hold times, price changes
    }
  }),
  
  getOwnerPortfolio: tool({
    description: 'Find other properties owned by this owner',
    parameters: z.object({
      propertyId: z.string().optional(),
      ownerName: z.string().optional()
    }),
    execute: async ({ propertyId, ownerName }, context) => {
      // Search for other properties with same owner
      // Return portfolio summary
    }
  }),
  
  explainMotivationScore: tool({
    description: 'Break down why a property has its motivation score',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Return score breakdown:
      // - Which indicators are present
      // - Point value for each
      // - Comparison to average
    }
  }),
  
  compareProperties: tool({
    description: 'Compare two or more properties side by side',
    parameters: z.object({
      propertyIds: z.array(z.string()).min(2).max(5),
      aspects: z.array(z.enum([
        'value', 'equity', 'motivation', 'cash_flow', 'flip_potential', 'location'
      ])).optional()
    }),
    execute: async ({ propertyIds, aspects }, context) => {
      // Load all properties
      // Generate comparison table
      // Highlight winner for each aspect
    }
  }),
  
  calculateCashFlow: tool({
    description: 'Calculate rental cash flow for a property',
    parameters: z.object({
      propertyId: z.string().optional(),
      purchasePrice: z.number().optional(),
      downPaymentPercent: z.number().optional(),
      interestRate: z.number().optional(),
      monthlyExpenses: z.number().optional()
    }),
    execute: async (params, { userPreferences }) => {
      // Use user defaults where not specified
      // Calculate monthly cash flow
      // Calculate cap rate, cash-on-cash return
    }
  })
};
```

**Tool Count: 13**

---

## 5. Deal Pipeline

### Context Available

```typescript
{
  currentView: 'deal-pipeline' | 'deal-detail',
  deals: Deal[],                       // All user's deals
  dealsByStatus: {
    lead: number,
    analyzing: number,
    contacted: number,
    negotiating: number,
    under_contract: number,
    assigned: number,
    closed: number,
    dead: number
  },
  selectedDeal: Deal | null,           // If viewing a specific deal
  pipelineValue: number,               // Total potential assignment fees
  filterApplied: string | null         // If pipeline is filtered
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Which deals need attention?" | Identifies stale deals, overdue follow-ups |
| "Move Oak Street to negotiating" | Updates deal status |
| "What's my pipeline value?" | Sums potential assignment fees |
| "Show me deals I haven't touched in a week" | Filters to stale deals |
| "Who should I call first today?" | Prioritizes by motivation + recency + stage |
| "Update Elm Ave—talked to seller, wants $180k" | Adds note, updates asking price |
| "Find buyers for my under-contract deals" | Batch matches buyers to all UC deals |
| "What's my conversion rate?" | Calculates lead → closed percentage |
| "Archive all dead deals from last month" | Bulk status update with date filter |
| "Remind me to follow up on Main St tomorrow" | Creates follow-up task |
| "Draft a follow-up text for the Maple deal" | Generates message based on deal context |
| "What's blocking my contracted deals?" | Analyzes stuck deals |

### Tools Required

```typescript
// lib/ai/tools/deal-tools.ts

export const dealTools = {
  identifyStaleDeals: tool({
    description: 'Find deals that need attention based on inactivity',
    parameters: z.object({
      staleDays: z.number().default(7),
      statuses: z.array(z.string()).optional()
    }),
    execute: async ({ staleDays, statuses }, { userId }) => {
      // Query deals with no activity in staleDays
      // Return list with last activity info
    }
  }),
  
  updateDealStatus: tool({
    description: 'Move a deal to a different pipeline status',
    parameters: z.object({
      dealId: z.string().optional().describe('Deal ID or omit for current'),
      propertyAddress: z.string().optional().describe('Find by address'),
      newStatus: z.enum(['lead', 'analyzing', 'contacted', 'negotiating', 'under_contract', 'assigned', 'closed', 'dead']),
      notes: z.string().optional()
    }),
    execute: async (params, { userId, viewContext }) => {
      // Find deal by ID or address
      // Update status
      // Add note if provided
    }
  }),
  
  calculatePipelineValue: tool({
    description: 'Calculate total potential value of deal pipeline',
    parameters: z.object({
      statuses: z.array(z.string()).optional().describe('Filter to specific statuses'),
      includeProjected: z.boolean().default(true)
    }),
    execute: async ({ statuses, includeProjected }, { userId }) => {
      // Sum assignment fees by status
      // Return breakdown
    }
  }),
  
  filterDealsByCondition: tool({
    description: 'Filter deals by various conditions',
    parameters: z.object({
      condition: z.enum([
        'stale', 'high_value', 'needs_followup', 'closing_soon', 
        'no_buyer', 'has_buyer', 'by_market'
      ]),
      value: z.any().optional()
    }),
    execute: async ({ condition, value }, { userId }) => {
      // Apply filter and return matching deals
    }
  }),
  
  prioritizeDealsForOutreach: tool({
    description: 'Rank deals by priority for outreach today',
    parameters: z.object({
      limit: z.number().default(10),
      factors: z.array(z.enum([
        'motivation', 'recency', 'stage', 'value', 'followup_due'
      ])).optional()
    }),
    execute: async ({ limit, factors }, { userId }) => {
      // Score deals on multiple factors
      // Return prioritized list with reasoning
    }
  }),
  
  updateDealDetails: tool({
    description: 'Update deal information (notes, prices, contacts)',
    parameters: z.object({
      dealId: z.string().optional(),
      propertyAddress: z.string().optional(),
      updates: z.object({
        notes: z.string().optional(),
        askingPrice: z.number().optional(),
        offerPrice: z.number().optional(),
        assignmentFee: z.number().optional(),
        lastContactDate: z.string().optional(),
        nextFollowUp: z.string().optional()
      })
    }),
    execute: async (params, { userId }) => {
      // Update deal record
    }
  }),
  
  batchMatchBuyersToDealS: tool({
    description: 'Find matching buyers for multiple deals',
    parameters: z.object({
      dealIds: z.array(z.string()).optional(),
      statuses: z.array(z.string()).optional().describe('Match all deals in these statuses')
    }),
    execute: async ({ dealIds, statuses }, { userId }) => {
      // Get deals
      // Match buyers to each
      // Return summary
    }
  }),
  
  calculateConversionMetrics: tool({
    description: 'Calculate pipeline conversion rates and metrics',
    parameters: z.object({
      timeframe: z.enum(['week', 'month', 'quarter', 'year', 'all']).default('month'),
      breakdownBy: z.enum(['status', 'source', 'market']).optional()
    }),
    execute: async ({ timeframe, breakdownBy }, { userId }) => {
      // Calculate conversion rates between stages
      // Return funnel analysis
    }
  }),
  
  bulkUpdateDealStatus: tool({
    description: 'Update status for multiple deals at once',
    parameters: z.object({
      filter: z.object({
        status: z.string().optional(),
        olderThan: z.number().optional().describe('Days since last activity'),
        market: z.string().optional()
      }),
      newStatus: z.string(),
      addNote: z.string().optional()
    }),
    execute: async (params, { userId }) => {
      // Find matching deals
      // Bulk update
      // Return count updated
    }
  }),
  
  createFollowUpReminder: tool({
    description: 'Create a reminder to follow up on a deal',
    parameters: z.object({
      dealId: z.string().optional(),
      propertyAddress: z.string().optional(),
      reminderDate: z.string(),
      reminderType: z.enum(['call', 'text', 'email', 'general']),
      notes: z.string().optional()
    }),
    execute: async (params, { userId }) => {
      // Create notification/task for future
    }
  }),
  
  draftOutreachMessage: tool({
    description: 'Draft a follow-up message for a deal',
    parameters: z.object({
      dealId: z.string().optional(),
      propertyAddress: z.string().optional(),
      messageType: z.enum(['initial', 'followup', 'offer', 'closing']),
      channel: z.enum(['text', 'email', 'voicemail']),
      tone: z.enum(['professional', 'friendly', 'urgent']).default('professional')
    }),
    execute: async (params, context) => {
      // Load deal context
      // Generate appropriate message
    }
  }),
  
  analyzeBlockedDeals: tool({
    description: 'Analyze why deals are stuck and suggest actions',
    parameters: z.object({
      statuses: z.array(z.string()).optional().describe('Statuses to analyze'),
      minDaysInStatus: z.number().default(14)
    }),
    execute: async ({ statuses, minDaysInStatus }, { userId }) => {
      // Find stuck deals
      // Analyze patterns
      // Suggest actions
    }
  })
};
```

**Tool Count: 12**

---

## 6. Lead Lists / CRM

### Context Available

```typescript
{
  currentView: 'lead-list' | 'all-lists',
  currentList: {
    id: string,
    name: string,
    itemCount: number,
    lastUpdated: string,
    listType: 'manual' | 'smart' | 'ai-generated'
  } | null,
  listItems: LeadListItem[],           // Items in current list
  selectedItems: string[],             // Selected item IDs
  allLists: {
    name: string,
    count: number,
    type: string
  }[]
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Create a new list called High Priority" | Creates list |
| "Merge these two lists" | Combines lists, deduplicates |
| "Remove duplicates from this list" | Deduplicates within list or against all |
| "Which leads haven't been contacted?" | Filters to status = 'new' |
| "Skip trace everyone on this list" | Batch skip trace |
| "Rank this list by likelihood to sell" | Applies motivation scoring |
| "Move contacted leads to Follow Up list" | Bulk move by status |
| "How many leads did I add this week?" | Returns activity metrics |
| "Export this for my VA" | Generates CSV |
| "Start a drip campaign on these" | Initiates outreach sequence |
| "Split this list by zip code" | Creates multiple lists |
| "Show me leads that match my top buyers" | Cross-references with buyer criteria |

### Tools Required

```typescript
// lib/ai/tools/crm-tools.ts

export const crmTools = {
  createLeadList: tool({
    description: 'Create a new lead list',
    parameters: z.object({
      name: z.string(),
      description: z.string().optional(),
      listType: z.enum(['manual', 'smart']).default('manual')
    }),
    execute: async ({ name, description, listType }, { userId }) => {
      // Create list in database
      // Return list ID
    }
  }),
  
  mergeLists: tool({
    description: 'Merge two or more lists into one',
    parameters: z.object({
      sourceListIds: z.array(z.string()).min(2),
      targetListName: z.string(),
      deleteSources: z.boolean().default(false)
    }),
    execute: async ({ sourceListIds, targetListName, deleteSources }, { userId }) => {
      // Combine lists
      // Deduplicate
      // Optionally delete sources
    }
  }),
  
  deduplicateList: tool({
    description: 'Remove duplicate properties from a list',
    parameters: z.object({
      listId: z.string().optional().describe('List ID or omit for current'),
      scope: z.enum(['within_list', 'across_all_lists']).default('within_list')
    }),
    execute: async ({ listId, scope }, { userId, viewContext }) => {
      // Find duplicates
      // Remove keeping oldest
      // Return count removed
    }
  }),
  
  filterListByStatus: tool({
    description: 'Filter list items by CRM status',
    parameters: z.object({
      listId: z.string().optional(),
      statuses: z.array(z.enum(['new', 'contacted', 'interested', 'negotiating', 'dead'])),
      exclude: z.boolean().default(false).describe('Exclude these statuses instead of include')
    }),
    execute: async (params, context) => {
      // Apply status filter
    }
  }),
  
  batchSkipTraceList: tool({
    description: 'Skip trace all items in a list',
    parameters: z.object({
      listId: z.string().optional(),
      onlyMissingContact: z.boolean().default(true)
    }),
    execute: async ({ listId, onlyMissingContact }, { userId, viewContext }) => {
      // Get list items
      // Filter to those needing skip trace
      // Call BatchSkipTracing API
      // Update records
      // Return success/failure counts
    }
  }),
  
  rankListByMotivation: tool({
    description: 'Sort a list by motivation score',
    parameters: z.object({
      listId: z.string().optional(),
      recalculate: z.boolean().default(false).describe('Recalculate scores fresh')
    }),
    execute: async ({ listId, recalculate }, context) => {
      // Score/re-score properties
      // Sort list
    }
  }),
  
  bulkMoveLeads: tool({
    description: 'Move leads between lists based on criteria',
    parameters: z.object({
      sourceListId: z.string().optional(),
      targetListName: z.string(),
      filter: z.object({
        status: z.string().optional(),
        motivationMin: z.number().optional(),
        hasContact: z.boolean().optional()
      })
    }),
    execute: async (params, { userId }) => {
      // Find matching leads
      // Move to target list
      // Return count moved
    }
  }),
  
  getListActivityMetrics: tool({
    description: 'Get activity statistics for lead lists',
    parameters: z.object({
      timeframe: z.enum(['day', 'week', 'month']).default('week'),
      listId: z.string().optional()
    }),
    execute: async ({ timeframe, listId }, { userId }) => {
      // Calculate:
      // - Leads added
      // - Leads contacted
      // - Status changes
      // - Conversion rates
    }
  }),
  
  exportList: tool({
    description: 'Export a list to a downloadable file',
    parameters: z.object({
      listId: z.string().optional(),
      format: z.enum(['csv', 'excel']),
      fields: z.array(z.string()).optional(),
      includeSkipTrace: z.boolean().default(true)
    }),
    execute: async (params, context) => {
      // Generate export
      // Return download URL
    }
  }),
  
  startDripCampaign: tool({
    description: 'Start an automated outreach campaign on a list',
    parameters: z.object({
      listId: z.string().optional(),
      campaignType: z.enum(['sms', 'email', 'direct_mail', 'multi_channel']),
      templateId: z.string().optional()
    }),
    execute: async (params, context) => {
      // Initialize campaign
      // Queue first messages
    }
  }),
  
  splitListByField: tool({
    description: 'Split a list into multiple lists by a field value',
    parameters: z.object({
      listId: z.string().optional(),
      splitField: z.enum(['zip_code', 'city', 'property_type', 'motivation_tier', 'status']),
      namePrefix: z.string().optional()
    }),
    execute: async ({ listId, splitField, namePrefix }, context) => {
      // Group items by field
      // Create new lists
      // Return list of created lists
    }
  }),
  
  matchLeadsToBuyerCriteria: tool({
    description: 'Find leads that match your top buyers preferences',
    parameters: z.object({
      listId: z.string().optional(),
      buyerIds: z.array(z.string()).optional().describe('Specific buyers or top N')
    }),
    execute: async (params, context) => {
      // Get buyer criteria
      // Match against list
      // Return matched leads with buyer fits
    }
  })
};
```

**Tool Count: 12**

---

## 7. Buyer Database

### Context Available

```typescript
{
  currentView: 'buyer-list' | 'buyer-detail',
  buyers: Buyer[],                     // Visible buyers
  selectedBuyer: Buyer | null,         // If viewing specific buyer
  buyerPortfolio: Property[],          // Properties they own
  buyerPurchaseHistory: Transaction[], // Their transaction history
  buyerCriteria: {                     // Their preferences
    propertyTypes: string[],
    priceRange: { min: number, max: number },
    locations: string[],
    strategy: string
  }
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Who buys 3-beds in 33601?" | Filters buyers by criteria |
| "Show me my most active buyers" | Sorts by purchase frequency |
| "Find buyers for this deal" | Matches current deal context |
| "Add John Smith as a new buyer" | Creates buyer record |
| "What does this buyer typically pay?" | Returns price range |
| "When was the last time they bought?" | Returns last purchase date |
| "Email my top 10 buyers about 123 Oak St" | Drafts buyer outreach |
| "Which buyers haven't bought in 6 months?" | Identifies inactive buyers |
| "Rank buyers by likelihood to buy this deal" | Scores match quality |
| "How many deals has Michael Chen closed with us?" | Returns history |
| "Update buyer preferences—they now want 4+ beds" | Updates profile |
| "Find new buyers from recent transactions in 33602" | Triggers discovery |

### Tools Required

```typescript
// lib/ai/tools/buyer-tools.ts

export const buyerTools = {
  searchBuyers: tool({
    description: 'Search for buyers matching criteria',
    parameters: z.object({
      propertyType: z.string().optional(),
      location: z.string().optional(),
      priceMin: z.number().optional(),
      priceMax: z.number().optional(),
      buyerType: z.enum(['Flipper', 'Buy-and-Hold', 'Wholesaler', 'BRRRR', 'Unknown']).optional(),
      minPurchases: z.number().optional()
    }),
    execute: async (params, { userId }) => {
      // Query buyer database with filters
    }
  }),
  
  sortBuyersByActivity: tool({
    description: 'Get buyers sorted by recent activity',
    parameters: z.object({
      sortBy: z.enum(['last_purchase', 'total_purchases', 'purchase_frequency']),
      limit: z.number().default(20)
    }),
    execute: async ({ sortBy, limit }, { userId }) => {
      // Sort and return buyers
    }
  }),
  
  matchBuyersToProperty: tool({
    description: 'Find buyers that would want a specific property',
    parameters: z.object({
      propertyId: z.string().optional(),
      limit: z.number().default(10)
    }),
    execute: async ({ propertyId, limit }, context) => {
      // Load property
      // Match against buyer criteria
      // Score and rank
    }
  }),
  
  createBuyer: tool({
    description: 'Add a new buyer to the database',
    parameters: z.object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      buyerType: z.enum(['Flipper', 'Buy-and-Hold', 'Wholesaler', 'BRRRR', 'Unknown']).optional(),
      criteria: z.object({
        propertyTypes: z.array(z.string()).optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        locations: z.array(z.string()).optional()
      }).optional()
    }),
    execute: async (params, { userId }) => {
      // Create buyer record
    }
  }),
  
  getBuyerPriceRange: tool({
    description: 'Get the typical price range for a buyer',
    parameters: z.object({
      buyerId: z.string().optional(),
      buyerName: z.string().optional()
    }),
    execute: async (params, context) => {
      // Analyze purchase history
      // Return min, max, avg, median
    }
  }),
  
  getBuyerLastPurchase: tool({
    description: 'Get information about a buyers last purchase',
    parameters: z.object({
      buyerId: z.string().optional(),
      buyerName: z.string().optional()
    }),
    execute: async (params, context) => {
      // Return last transaction details
    }
  }),
  
  draftBuyerOutreach: tool({
    description: 'Draft a message to send to buyers about a deal',
    parameters: z.object({
      buyerIds: z.array(z.string()).optional(),
      topN: z.number().optional().describe('Send to top N matched buyers'),
      propertyId: z.string().optional(),
      channel: z.enum(['email', 'sms']),
      includePhotos: z.boolean().default(true)
    }),
    execute: async (params, context) => {
      // Generate personalized outreach
      // Return draft or queue for sending
    }
  }),
  
  identifyInactiveBuyers: tool({
    description: 'Find buyers who havent purchased recently',
    parameters: z.object({
      inactiveDays: z.number().default(180),
      minPreviousPurchases: z.number().default(1)
    }),
    execute: async ({ inactiveDays, minPreviousPurchases }, { userId }) => {
      // Find buyers with no recent activity
    }
  }),
  
  scoreBuyerMatch: tool({
    description: 'Score how well a buyer matches a property',
    parameters: z.object({
      buyerId: z.string(),
      propertyId: z.string().optional()
    }),
    execute: async (params, context) => {
      // Calculate match score
      // Return score with breakdown
    }
  }),
  
  getBuyerTransactionHistory: tool({
    description: 'Get a buyers purchase history',
    parameters: z.object({
      buyerId: z.string().optional(),
      buyerName: z.string().optional(),
      timeframe: z.enum(['year', '2years', '5years', 'all']).default('all')
    }),
    execute: async (params, context) => {
      // Return transaction list with details
    }
  }),
  
  updateBuyerPreferences: tool({
    description: 'Update a buyers criteria and preferences',
    parameters: z.object({
      buyerId: z.string().optional(),
      buyerName: z.string().optional(),
      updates: z.object({
        propertyTypes: z.array(z.string()).optional(),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        locations: z.array(z.string()).optional(),
        bedroomsMin: z.number().optional(),
        strategy: z.string().optional()
      })
    }),
    execute: async (params, context) => {
      // Update buyer record
    }
  }),
  
  discoverNewBuyers: tool({
    description: 'Discover new buyers from recent transactions',
    parameters: z.object({
      location: z.string(),
      lookbackMonths: z.number().default(6),
      minPurchases: z.number().default(2)
    }),
    execute: async ({ location, lookbackMonths, minPurchases }, { userId }) => {
      // Analyze recent transactions
      // Identify repeat investor purchasers
      // Add to buyer database
      // Return newly discovered count
    }
  })
};
```

**Tool Count: 12**

---

## 8. Market Analysis

### Context Available

```typescript
{
  currentView: 'market-analysis',
  selectedMarket: {
    type: 'zip' | 'city' | 'county' | 'metro',
    value: string
  },
  marketStats: {
    medianPrice: number,
    avgDaysOnMarket: number,
    inventoryLevel: number,
    pricePerSqft: number,
    rentYield: number,
    priceChange6m: number,
    rentChange6m: number,
    foreclosureRate: number
  },
  historicalData: MarketDataPoint[],
  compareMarkets: string[] | null
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "How's the Tampa market doing?" | Summarizes key metrics and trends |
| "Compare 33601 to 33602" | Side-by-side comparison |
| "Where are prices dropping?" | Identifies declining areas |
| "What's the average rent in this zip?" | Returns rent data |
| "Should I be looking here or downtown?" | Comparative recommendation |
| "Show me the trend over the last year" | Historical analysis |
| "Which areas have the best cash flow potential?" | Analyzes rent-to-price |
| "Are investors leaving this market?" | Analyzes transaction patterns |
| "What's the foreclosure trend here?" | Returns distress data |
| "Find me emerging markets within 50 miles" | Opportunity identification |

### Tools Required

```typescript
// lib/ai/tools/market-tools.ts

export const marketTools = {
  summarizeMarket: tool({
    description: 'Get a summary of market conditions',
    parameters: z.object({
      market: z.string().describe('Zip, city, or metro name')
    }),
    execute: async ({ market }) => {
      // Load market data from RentCast
      // Generate summary with key metrics
      // Include trend indicators
    }
  }),
  
  compareMarkets: tool({
    description: 'Compare two or more markets',
    parameters: z.object({
      markets: z.array(z.string()).min(2).max(5),
      metrics: z.array(z.enum([
        'median_price', 'rent', 'days_on_market', 'inventory',
        'price_change', 'rent_yield', 'foreclosure_rate'
      ])).optional()
    }),
    execute: async ({ markets, metrics }) => {
      // Load data for all markets
      // Generate comparison table
      // Highlight winner for each metric
    }
  }),
  
  identifyDecliningMarkets: tool({
    description: 'Find markets with declining prices or rents',
    parameters: z.object({
      scope: z.enum(['state', 'metro', 'national']),
      state: z.string().optional(),
      metric: z.enum(['price', 'rent', 'both']).default('price'),
      minDeclinePercent: z.number().default(5)
    }),
    execute: async (params) => {
      // Analyze price trends
      // Return declining markets ranked by severity
    }
  }),
  
  getMarketRentData: tool({
    description: 'Get rental market data for an area',
    parameters: z.object({
      market: z.string(),
      propertyType: z.string().optional(),
      bedrooms: z.number().optional()
    }),
    execute: async (params) => {
      // Query RentCast rent endpoints
      // Return rent ranges and trends
    }
  }),
  
  recommendMarket: tool({
    description: 'Get AI recommendation between markets',
    parameters: z.object({
      markets: z.array(z.string()),
      strategy: z.enum(['wholesale', 'flip', 'rental']).default('wholesale'),
      prioritize: z.enum(['profit', 'volume', 'low_competition']).default('profit')
    }),
    execute: async ({ markets, strategy, prioritize }) => {
      // Analyze all markets
      // Score based on strategy and priority
      // Return recommendation with reasoning
    }
  }),
  
  getHistoricalTrend: tool({
    description: 'Get historical trend data for a market',
    parameters: z.object({
      market: z.string(),
      metric: z.enum(['price', 'rent', 'inventory', 'days_on_market']),
      timeframe: z.enum(['6m', '1y', '2y', '5y']).default('1y')
    }),
    execute: async (params) => {
      // Return time series data
      // Include trend line and prediction
    }
  }),
  
  analyzeCashFlowPotential: tool({
    description: 'Analyze which areas have best rental cash flow',
    parameters: z.object({
      scope: z.string().describe('State, metro, or zip list'),
      propertyType: z.string().optional(),
      minYield: z.number().optional()
    }),
    execute: async (params) => {
      // Calculate rent-to-price ratios
      // Rank by cash flow potential
    }
  }),
  
  analyzeInvestorActivity: tool({
    description: 'Analyze investor purchase activity in a market',
    parameters: z.object({
      market: z.string(),
      timeframe: z.enum(['3m', '6m', '1y']).default('6m')
    }),
    execute: async ({ market, timeframe }) => {
      // Analyze LLC/Corp purchases
      // Analyze cash transactions
      // Identify trends (entering/exiting)
    }
  }),
  
  getDistressIndicators: tool({
    description: 'Get foreclosure and distress data for a market',
    parameters: z.object({
      market: z.string()
    }),
    execute: async ({ market }) => {
      // Return foreclosure rates
      // Pre-foreclosure counts
      // Tax delinquency data
      // Trends
    }
  }),
  
  findEmergingMarkets: tool({
    description: 'Identify emerging opportunity markets',
    parameters: z.object({
      nearLocation: z.string().optional(),
      radiusMiles: z.number().optional(),
      criteria: z.array(z.enum([
        'rising_rents', 'stable_prices', 'low_inventory',
        'high_investor_activity', 'job_growth'
      ])).optional()
    }),
    execute: async (params) => {
      // Analyze markets matching criteria
      // Return ranked opportunities
    }
  })
};
```

**Tool Count: 10**

---

## 9. Filter System

### Context Available

```typescript
{
  currentView: 'filter-builder' | 'saved-filters',
  availableFilters: FilterTemplate[],
  selectedFilters: string[],           // Currently selected template slugs
  savedFilters: {
    id: string,
    name: string,
    templates: string[],
    lastRun: string,
    matchCount: number
  }[],
  filterExplanations: Record<string, string>
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "What filters should I use for less competition?" | Recommends contrarian filters |
| "Explain the 'almost sold' filter" | Describes filter and why it works |
| "Combine tired landlord with tax squeeze" | Creates compound filter |
| "What's the difference between standard and contrarian?" | Educational explanation |
| "Save this combination as 'Secret Sauce Tampa'" | Saves filter set |
| "Run my Secret Sauce filter in 33601" | Executes saved filter |
| "Which filter finds the most motivated sellers?" | Ranks filters |
| "Create a filter for accidental landlords who tried to sell" | Builds custom |
| "Why aren't I seeing results with this filter?" | Diagnoses issues |
| "What new filters should I try?" | Suggests unexplored filters |
| "How many people are using absentee owner filter?" | Explains competition |

### Tools Required

```typescript
// lib/ai/tools/filter-tools.ts

export const filterTools = {
  recommendFilters: tool({
    description: 'Recommend filters based on user goals',
    parameters: z.object({
      goal: z.enum([
        'less_competition', 'most_motivated', 'high_equity',
        'distressed', 'quick_sale', 'rental_opportunity'
      ]),
      market: z.string().optional()
    }),
    execute: async ({ goal, market }) => {
      // Map goal to filter recommendations
      // Include contrarian options
      // Explain why each filter helps
    }
  }),
  
  explainFilter: tool({
    description: 'Explain what a filter does and why it works',
    parameters: z.object({
      filterSlug: z.string()
    }),
    execute: async ({ filterSlug }) => {
      // Return comprehensive explanation:
      // - What it detects
      // - Why these owners are motivated
      // - Competition level
      // - Best use cases
    }
  }),
  
  combineFilters: tool({
    description: 'Create a combination of multiple filters',
    parameters: z.object({
      filterSlugs: z.array(z.string()),
      name: z.string().optional(),
      save: z.boolean().default(false)
    }),
    execute: async ({ filterSlugs, name, save }, { userId }) => {
      // Validate combination makes sense
      // Preview result count
      // Optionally save
    }
  }),
  
  compareFilterCategories: tool({
    description: 'Explain differences between filter categories',
    parameters: z.object({
      categories: z.array(z.enum(['standard', 'enhanced', 'contrarian']))
    }),
    execute: async ({ categories }) => {
      // Return comparison with examples
    }
  }),
  
  saveFilterCombination: tool({
    description: 'Save a filter combination for reuse',
    parameters: z.object({
      name: z.string(),
      filterSlugs: z.array(z.string()),
      customCriteria: z.record(z.any()).optional(),
      geographicScope: z.object({
        type: z.enum(['zip', 'city', 'county', 'state']),
        values: z.array(z.string())
      }).optional(),
      notifyOnNew: z.boolean().default(false),
      notificationFrequency: z.enum(['realtime', 'daily', 'weekly']).optional()
    }),
    execute: async (params, { userId }) => {
      // Save to user_saved_filters
    }
  }),
  
  executeFilter: tool({
    description: 'Run a saved or ad-hoc filter',
    parameters: z.object({
      savedFilterId: z.string().optional(),
      savedFilterName: z.string().optional(),
      filterSlugs: z.array(z.string()).optional(),
      location: z.string().optional()
    }),
    execute: async (params, { userId }) => {
      // Execute filter
      // Return results summary
    }
  }),
  
  rankFiltersByMotivation: tool({
    description: 'Rank filters by how motivated the sellers typically are',
    parameters: z.object({
      category: z.enum(['all', 'standard', 'enhanced', 'contrarian']).optional()
    }),
    execute: async ({ category }) => {
      // Return filters ranked by avg motivation score
    }
  }),
  
  buildCustomFilter: tool({
    description: 'Build a custom filter from natural language description',
    parameters: z.object({
      description: z.string()
    }),
    execute: async ({ description }) => {
      // Parse description
      // Map to filter templates and custom criteria
      // Return proposed filter
    }
  }),
  
  diagnoseFilterResults: tool({
    description: 'Diagnose why a filter is returning too few or too many results',
    parameters: z.object({
      savedFilterId: z.string().optional(),
      filterSlugs: z.array(z.string()).optional(),
      location: z.string()
    }),
    execute: async (params) => {
      // Analyze each filter component
      // Identify which is most restrictive
      // Suggest adjustments
    }
  }),
  
  suggestNewFilters: tool({
    description: 'Suggest filters the user hasnt tried',
    parameters: z.object({
      basedOn: z.enum(['unused', 'similar_to_favorites', 'trending']).default('unused')
    }),
    execute: async ({ basedOn }, { userId }) => {
      // Analyze user's filter history
      // Recommend new ones to try
    }
  }),
  
  explainCompetitionLevel: tool({
    description: 'Explain how much competition a filter has',
    parameters: z.object({
      filterSlug: z.string()
    }),
    execute: async ({ filterSlug }) => {
      // Return competition analysis:
      // - How common this filter is
      // - What competitors use it
      // - Alternatives with less competition
    }
  })
};
```

**Tool Count: 11**

---

## 10. Dashboard / KPIs

### Context Available

```typescript
{
  currentView: 'dashboard',
  kpis: {
    activeDeals: number,
    pipelineValue: number,
    leadsThisWeek: number,
    leadsThisMonth: number,
    contactRate: number,
    closedThisMonth: number,
    revenueThisMonth: number,
    avgAssignmentFee: number
  },
  recentActivity: Activity[],
  notifications: Notification[],
  alerts: Alert[],
  goals: {
    monthlyRevenue: number,
    monthlyDeals: number
  }
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "How am I doing this month?" | Summarizes KPIs with comparison |
| "What should I focus on today?" | Prioritizes tasks |
| "Why is my conversion rate low?" | Analyzes funnel |
| "Show me my best performing markets" | Ranks by closed deals |
| "What's my average assignment fee?" | Calculates from data |
| "Am I on track to hit my goal?" | Compares to target |
| "What did I do yesterday?" | Returns activity log |
| "Compare this month to last month" | Trend comparison |
| "Where am I losing deals?" | Analyzes drop-off |
| "Predict my revenue for this quarter" | Forecasts based on pipeline |
| "What's my cost per lead?" | Marketing efficiency |
| "Send me a weekly summary every Monday" | Sets up report |

### Tools Required

```typescript
// lib/ai/tools/dashboard-tools.ts

export const dashboardTools = {
  summarizePerformance: tool({
    description: 'Summarize performance for a time period',
    parameters: z.object({
      period: z.enum(['today', 'week', 'month', 'quarter', 'year']).default('month'),
      compareToLast: z.boolean().default(true)
    }),
    execute: async ({ period, compareToLast }, { userId }) => {
      // Calculate KPIs for period
      // Compare to previous period
      // Generate summary with trends
    }
  }),
  
  prioritizeDailyTasks: tool({
    description: 'Get prioritized list of tasks for today',
    parameters: z.object({
      maxTasks: z.number().default(10)
    }),
    execute: async ({ maxTasks }, { userId }) => {
      // Analyze:
      // - Deals needing follow-up
      // - Hot leads to contact
      // - Buyers to reach out to
      // - Overdue items
      // Return prioritized list
    }
  }),
  
  analyzeFunnel: tool({
    description: 'Analyze the deal funnel to identify problems',
    parameters: z.object({
      timeframe: z.enum(['month', 'quarter', 'year']).default('month')
    }),
    execute: async ({ timeframe }, { userId }) => {
      // Calculate conversion at each stage
      // Identify bottleneck
      // Suggest improvements
    }
  }),
  
  rankMarketsByPerformance: tool({
    description: 'Rank markets by user performance',
    parameters: z.object({
      metric: z.enum(['closed_deals', 'revenue', 'conversion_rate', 'avg_fee']),
      timeframe: z.enum(['month', 'quarter', 'year', 'all']).default('year')
    }),
    execute: async ({ metric, timeframe }, { userId }) => {
      // Group deals by market
      // Rank by specified metric
    }
  }),
  
  calculateAverageMetric: tool({
    description: 'Calculate average for any metric',
    parameters: z.object({
      metric: z.enum([
        'assignment_fee', 'days_to_close', 'profit_margin',
        'leads_per_deal', 'contact_to_close'
      ]),
      timeframe: z.enum(['month', 'quarter', 'year', 'all']).default('all')
    }),
    execute: async ({ metric, timeframe }, { userId }) => {
      // Calculate average
      // Include trend
    }
  }),
  
  trackGoalProgress: tool({
    description: 'Check progress toward goals',
    parameters: z.object({
      goalType: z.enum(['revenue', 'deals', 'leads', 'contacts']).optional()
    }),
    execute: async ({ goalType }, { userId }) => {
      // Load user goals
      // Calculate progress
      // Project end-of-period result
    }
  }),
  
  getActivityLog: tool({
    description: 'Get activity log for a time period',
    parameters: z.object({
      timeframe: z.enum(['today', 'yesterday', 'week']).default('today'),
      activityTypes: z.array(z.string()).optional()
    }),
    execute: async ({ timeframe, activityTypes }, { userId }) => {
      // Return activity history
    }
  }),
  
  comparePeriods: tool({
    description: 'Compare performance between two periods',
    parameters: z.object({
      period1: z.object({
        start: z.string(),
        end: z.string()
      }),
      period2: z.object({
        start: z.string(),
        end: z.string()
      }),
      metrics: z.array(z.string()).optional()
    }),
    execute: async (params, { userId }) => {
      // Calculate metrics for both periods
      // Return comparison with % changes
    }
  }),
  
  analyzeDealDropoff: tool({
    description: 'Analyze where deals are being lost',
    parameters: z.object({
      timeframe: z.enum(['month', 'quarter', 'year']).default('quarter')
    }),
    execute: async ({ timeframe }, { userId }) => {
      // Analyze deals that went to 'dead'
      // Group by stage where lost
      // Identify patterns
    }
  }),
  
  forecastRevenue: tool({
    description: 'Forecast revenue based on pipeline',
    parameters: z.object({
      period: z.enum(['month', 'quarter']).default('quarter')
    }),
    execute: async ({ period }, { userId }) => {
      // Analyze current pipeline
      // Apply stage-based probabilities
      // Generate forecast with confidence range
    }
  }),
  
  calculateCostPerLead: tool({
    description: 'Calculate marketing cost per lead',
    parameters: z.object({
      includeSkipTrace: z.boolean().default(true),
      timeframe: z.enum(['month', 'quarter', 'year']).default('month')
    }),
    execute: async ({ includeSkipTrace, timeframe }, { userId }) => {
      // Sum marketing costs
      // Divide by leads generated
      // Compare to industry benchmarks
    }
  }),
  
  scheduleReport: tool({
    description: 'Schedule an automated report',
    parameters: z.object({
      reportType: z.enum(['daily_summary', 'weekly_summary', 'pipeline_status', 'performance']),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      dayOfWeek: z.number().optional().describe('0=Sunday, 1=Monday, etc'),
      deliveryMethod: z.enum(['email', 'in_app', 'both']).default('both')
    }),
    execute: async (params, { userId }) => {
      // Create scheduled report
    }
  })
};
```

**Tool Count: 12**

---

## 11. Skip Tracing

### Context Available

```typescript
{
  currentView: 'skip-trace',
  pendingTraces: SkipTraceJob[],
  completedTraces: SkipTraceResult[],
  currentResults: {
    phones: PhoneResult[],
    emails: string[],
    confidence: number
  } | null,
  skipTraceCredits: number
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Skip trace this property" | Initiates trace for current property |
| "Skip trace my Hot Leads list" | Batch trace |
| "How many credits do I have?" | Returns balance |
| "Which phone number should I call first?" | Recommends by confidence |
| "Find a different number for this owner" | Re-traces |
| "Export skip trace results" | Generates CSV |
| "How accurate are these results?" | Explains confidence |
| "Trace only the ones without phone numbers" | Selective batch |
| "What's my skip trace hit rate?" | Calculates success % |
| "Flag this number as wrong" | Updates data quality |

### Tools Required

```typescript
// lib/ai/tools/skip-trace-tools.ts

export const skipTraceTools = {
  skipTraceProperty: tool({
    description: 'Skip trace a single property owner',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Call BatchSkipTracing API
      // Return results
    }
  }),
  
  batchSkipTrace: tool({
    description: 'Skip trace multiple properties',
    parameters: z.object({
      listId: z.string().optional(),
      propertyIds: z.array(z.string()).optional(),
      onlyMissing: z.boolean().default(true)
    }),
    execute: async (params, context) => {
      // Batch API call
      // Return summary
    }
  }),
  
  getSkipTraceCredits: tool({
    description: 'Check skip trace credit balance',
    parameters: z.object({}),
    execute: async (_, { userId }) => {
      // Return credit balance
    }
  }),
  
  recommendContactMethod: tool({
    description: 'Recommend which contact method to try first',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Analyze available contacts
      // Rank by confidence and type
      // Return recommendation
    }
  }),
  
  retraceOwner: tool({
    description: 'Re-run skip trace to find additional contacts',
    parameters: z.object({
      propertyId: z.string().optional(),
      reason: z.enum(['wrong_number', 'no_answer', 'need_more']).optional()
    }),
    execute: async (params, context) => {
      // Re-run with different parameters
    }
  }),
  
  exportSkipTraceResults: tool({
    description: 'Export skip trace results to file',
    parameters: z.object({
      listId: z.string().optional(),
      format: z.enum(['csv', 'excel']),
      includeAllContacts: z.boolean().default(true)
    }),
    execute: async (params, context) => {
      // Generate export
      // Return download URL
    }
  }),
  
  explainConfidence: tool({
    description: 'Explain skip trace confidence scores',
    parameters: z.object({
      propertyId: z.string().optional()
    }),
    execute: async ({ propertyId }, context) => {
      // Explain what confidence means
      // Breakdown for current results
    }
  }),
  
  selectiveSkipTrace: tool({
    description: 'Skip trace only properties meeting criteria',
    parameters: z.object({
      listId: z.string().optional(),
      filter: z.object({
        missingPhone: z.boolean().optional(),
        missingEmail: z.boolean().optional(),
        motivationMin: z.number().optional(),
        status: z.array(z.string()).optional()
      })
    }),
    execute: async (params, context) => {
      // Filter list
      // Trace only matching
    }
  }),
  
  calculateHitRate: tool({
    description: 'Calculate skip trace success rate',
    parameters: z.object({
      timeframe: z.enum(['week', 'month', 'all']).default('month')
    }),
    execute: async ({ timeframe }, { userId }) => {
      // Calculate % with valid results
      // Compare to average
    }
  }),
  
  flagBadContact: tool({
    description: 'Flag a contact as incorrect',
    parameters: z.object({
      propertyId: z.string().optional(),
      contactType: z.enum(['phone', 'email']),
      contactValue: z.string(),
      reason: z.enum(['wrong_person', 'disconnected', 'spam', 'other'])
    }),
    execute: async (params, context) => {
      // Update data quality flag
      // Optionally request new trace
    }
  })
};
```

**Tool Count: 10**

---

## 12. Notifications & Alerts

### Context Available

```typescript
{
  currentView: 'notifications',
  unreadCount: number,
  notifications: Notification[],
  alertSettings: {
    newMatches: boolean,
    priceDrops: boolean,
    dealUpdates: boolean,
    frequency: 'realtime' | 'daily' | 'weekly'
  }
}
```

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "What's new?" | Summarizes recent notifications |
| "Mark all as read" | Bulk update |
| "Only alert me for high-equity deals" | Updates preferences |
| "Why did I get this alert?" | Explains trigger |
| "Pause notifications for 2 hours" | Quiet mode |
| "Show me price drops from this week" | Filters by type/time |
| "Set up a daily digest instead of real-time" | Changes frequency |
| "Create an alert for new listings in 33602" | Custom alert |
| "What properties matched my filters today?" | Filter match summary |
| "Unsubscribe from system notifications" | Updates preferences |

### Tools Required

```typescript
// lib/ai/tools/notification-tools.ts

export const notificationTools = {
  summarizeNotifications: tool({
    description: 'Summarize recent notifications',
    parameters: z.object({
      timeframe: z.enum(['today', 'week']).default('today'),
      types: z.array(z.string()).optional()
    }),
    execute: async ({ timeframe, types }, { userId }) => {
      // Group notifications
      // Generate summary
    }
  }),
  
  bulkUpdateNotifications: tool({
    description: 'Update multiple notifications at once',
    parameters: z.object({
      action: z.enum(['mark_read', 'mark_unread', 'delete']),
      filter: z.object({
        type: z.string().optional(),
        beforeDate: z.string().optional(),
        read: z.boolean().optional()
      }).optional()
    }),
    execute: async (params, { userId }) => {
      // Apply action to matching notifications
    }
  }),
  
  updateNotificationPreferences: tool({
    description: 'Update notification settings',
    parameters: z.object({
      updates: z.object({
        newMatches: z.boolean().optional(),
        priceDrops: z.boolean().optional(),
        dealUpdates: z.boolean().optional(),
        systemNotifications: z.boolean().optional(),
        frequency: z.enum(['realtime', 'daily', 'weekly']).optional()
      })
    }),
    execute: async ({ updates }, { userId }) => {
      // Update preferences
    }
  }),
  
  explainNotificationTrigger: tool({
    description: 'Explain why a notification was sent',
    parameters: z.object({
      notificationId: z.string()
    }),
    execute: async ({ notificationId }, { userId }) => {
      // Load notification
      // Explain trigger condition
    }
  }),
  
  setQuietMode: tool({
    description: 'Temporarily pause notifications',
    parameters: z.object({
      duration: z.enum(['1h', '2h', '4h', '8h', 'until_tomorrow']),
      exceptUrgent: z.boolean().default(true)
    }),
    execute: async ({ duration, exceptUrgent }, { userId }) => {
      // Set quiet mode
    }
  }),
  
  filterNotifications: tool({
    description: 'Filter notifications by criteria',
    parameters: z.object({
      type: z.string().optional(),
      timeframe: z.enum(['today', 'week', 'month']).optional(),
      read: z.boolean().optional()
    }),
    execute: async (params, { userId }) => {
      // Return filtered notifications
    }
  }),
  
  changeNotificationFrequency: tool({
    description: 'Change how often notifications are delivered',
    parameters: z.object({
      frequency: z.enum(['realtime', 'daily', 'weekly']),
      digestTime: z.string().optional().describe('Time for digest (e.g., "09:00")')
    }),
    execute: async (params, { userId }) => {
      // Update frequency settings
    }
  }),
  
  createCustomAlert: tool({
    description: 'Create a custom alert for specific conditions',
    parameters: z.object({
      name: z.string(),
      triggerType: z.enum(['new_listing', 'price_drop', 'filter_match', 'market_change']),
      conditions: z.record(z.any()),
      channels: z.array(z.enum(['push', 'email', 'sms']))
    }),
    execute: async (params, { userId }) => {
      // Create custom alert rule
    }
  }),
  
  getFilterMatches: tool({
    description: 'Get properties that matched saved filters',
    parameters: z.object({
      filterId: z.string().optional(),
      filterName: z.string().optional(),
      timeframe: z.enum(['today', 'week']).default('today')
    }),
    execute: async (params, { userId }) => {
      // Return new matches
    }
  }),
  
  manageSubscriptions: tool({
    description: 'Manage notification subscriptions',
    parameters: z.object({
      action: z.enum(['list', 'subscribe', 'unsubscribe']),
      notificationType: z.string().optional()
    }),
    execute: async (params, { userId }) => {
      // List or modify subscriptions
    }
  })
};
```

**Tool Count: 10**

---

## 13. Heat Mapping System

### Overview

Heat maps provide geographic visualization of various metrics to help users identify opportunity areas. All data comes from RentCast API.

### Context Available

```typescript
{
  currentView: 'heat-map',
  mapBounds: {
    north: number,
    south: number,
    east: number,
    west: number
  },
  mapCenter: { lat: number, lng: number },
  mapZoom: number,
  activeHeatLayers: string[],          // Currently displayed layers
  selectedArea: {
    type: 'zip' | 'tract' | 'neighborhood',
    value: string
  } | null
}
```

### Heat Map Layers

#### Global Layers (Same for All Users)

| Layer ID | Name | Data Source | Description |
|----------|------|-------------|-------------|
| `property_values` | Property Values | RentCast `estimatedValue` | Median property values by area |
| `rent_prices` | Rent Prices | RentCast rent estimates | Average rents by area |
| `days_on_market` | Days on Market | RentCast listing data | Average DOM indicating market velocity |
| `foreclosure_rate` | Foreclosure Rate | RentCast distress indicators | Concentration of foreclosures |
| `investor_activity` | Investor Activity | RentCast owner data (LLC patterns, cash purchases) | Where investors are buying |
| `price_change` | Price Trends | RentCast historical | Price appreciation/depreciation |
| `rent_yield` | Rent Yield | Calculated (rent / price) | Gross rent yield by area |

#### Platform Differentiator Layers (Our Secret Sauce)

| Layer ID | Name | Data Source | Description |
|----------|------|-------------|-------------|
| `wholesale_volume` | Wholesale Activity | Inferred from quick-flip transactions | Where wholesale deals are happening |
| `motivation_density` | Motivation Density | Properties matching any filter | Concentration of motivated sellers |
| `contrarian_opportunity` | Contrarian Opportunity | Properties matching contrarian filters | Low-competition opportunity zones |
| `competition_estimate` | Competition Level | Inverse of contrarian + standard filter overlap | Where competitors likely focus |
| `assignment_fee_potential` | Profit Potential | Calculated (ARV - distress price) | Potential spread by area |
| `buyer_activity` | Buyer Hotspots | From buyer database purchases | Where your buyers are active |
| `equity_density` | Equity Concentration | Properties with high equity | High-equity zones |

#### User-Specific Layers (Personalized)

| Layer ID | Name | Data Source | Description |
|----------|------|-------------|-------------|
| `my_filter_matches` | My Opportunities | User's saved filter results | Properties matching their specific filters |
| `my_buyer_zones` | My Buyer Zones | User's buyer database locations | Where their specific buyers purchase |
| `my_lead_density` | My Leads | User's lead lists | Where their current leads are located |
| `untouched_opportunity` | Untouched Areas | High opportunity + no user leads | Opportunity gaps in their coverage |
| `my_closed_deals` | My Wins | User's closed deals | Where they've had success |

### Example Interactions

| User Says | AI Does |
|-----------|---------|
| "Show me where the opportunities are" | Enables contrarian opportunity layer |
| "Where are wholesalers most active?" | Enables wholesale volume layer |
| "Find areas with high equity but low competition" | Combines equity + competition layers |
| "Why is this zip highlighted?" | Explains the data driving the heat score |
| "Compare these two areas" | Side-by-side heat analysis |
| "Where should I focus marketing?" | Recommends based on layers + user data |
| "Show me where my buyers are purchasing" | Enables my_buyer_zones layer |
| "Find contrarian opportunities near downtown" | Filters to area + enables layer |
| "What's the wholesale volume in 33601?" | Returns specific metrics |
| "Show me gaps in my coverage" | Enables untouched_opportunity layer |
| "Layer motivation density over investor activity" | Enables multiple layers |
| "Zoom to highest opportunity area" | Navigates map to top zone |
| "Export this heat map data" | Generates report/CSV |
| "Create a lead list from this hot zone" | Converts visible area to search/list |

### Tools Required

```typescript
// lib/ai/tools/heat-map-tools.ts

export const heatMapTools = {
  enableHeatLayer: tool({
    description: 'Enable a heat map layer',
    parameters: z.object({
      layerId: z.enum([
        // Global
        'property_values', 'rent_prices', 'days_on_market', 'foreclosure_rate',
        'investor_activity', 'price_change', 'rent_yield',
        // Differentiator
        'wholesale_volume', 'motivation_density', 'contrarian_opportunity',
        'competition_estimate', 'assignment_fee_potential', 'buyer_activity', 'equity_density',
        // User-specific
        'my_filter_matches', 'my_buyer_zones', 'my_lead_density',
        'untouched_opportunity', 'my_closed_deals'
      ]),
      opacity: z.number().min(0).max(1).default(0.7)
    }),
    execute: async ({ layerId, opacity }, { viewContext }) => {
      // Enable layer on map
      // Return layer data for current bounds
    }
  }),
  
  disableHeatLayer: tool({
    description: 'Disable a heat map layer',
    parameters: z.object({
      layerId: z.string()
    }),
    execute: async ({ layerId }) => {
      // Disable layer
    }
  }),
  
  getHeatMapData: tool({
    description: 'Get heat map data for current view',
    parameters: z.object({
      layers: z.array(z.string()),
      granularity: z.enum(['zip', 'tract', 'neighborhood']).default('zip')
    }),
    execute: async ({ layers, granularity }, { viewContext }) => {
      // Calculate data for each layer
      // Return aggregated by granularity
    }
  }),
  
  explainHeatMapArea: tool({
    description: 'Explain why an area has its heat score',
    parameters: z.object({
      location: z.string().describe('Zip code or area identifier'),
      layer: z.string()
    }),
    execute: async ({ location, layer }) => {
      // Break down contributing factors
      // Return detailed explanation
    }
  }),
  
  compareHeatMapAreas: tool({
    description: 'Compare heat scores between areas',
    parameters: z.object({
      areas: z.array(z.string()),
      layers: z.array(z.string()).optional()
    }),
    execute: async ({ areas, layers }) => {
      // Get scores for each area
      // Generate comparison
    }
  }),
  
  recommendFocusArea: tool({
    description: 'Recommend where to focus based on heat map analysis',
    parameters: z.object({
      goal: z.enum(['high_opportunity', 'low_competition', 'buyer_demand', 'quick_deals']),
      currentLocation: z.string().optional()
    }),
    execute: async ({ goal, currentLocation }, { userId, viewContext }) => {
      // Analyze layers based on goal
      // Consider user's buyer locations
      // Return recommendation
    }
  }),
  
  getWholesaleVolumeData: tool({
    description: 'Get wholesale transaction volume for an area',
    parameters: z.object({
      location: z.string(),
      timeframe: z.enum(['3m', '6m', '12m']).default('6m')
    }),
    execute: async ({ location, timeframe }) => {
      // Analyze transactions
      // Identify quick flips
      // Return volume and trend
    }
  }),
  
  navigateToHotZone: tool({
    description: 'Navigate map to highest opportunity area',
    parameters: z.object({
      layer: z.string(),
      within: z.string().optional().describe('Limit to metro or state')
    }),
    execute: async ({ layer, within }, { viewContext }) => {
      // Find highest scoring area
      // Return new map center/zoom
    }
  }),
  
  exportHeatMapData: tool({
    description: 'Export heat map data to file',
    parameters: z.object({
      layers: z.array(z.string()),
      granularity: z.enum(['zip', 'tract']),
      format: z.enum(['csv', 'excel', 'geojson'])
    }),
    execute: async (params, { viewContext }) => {
      // Generate export
      // Return download URL
    }
  }),
  
  createListFromHeatZone: tool({
    description: 'Create a lead list from properties in a heat map area',
    parameters: z.object({
      location: z.string(),
      minHeatScore: z.number().optional(),
      additionalFilters: z.array(z.string()).optional(),
      listName: z.string()
    }),
    execute: async (params, { userId }) => {
      // Query properties in zone
      // Apply filters
      // Create lead list
    }
  }),
  
  getAreaMetrics: tool({
    description: 'Get detailed metrics for a specific area',
    parameters: z.object({
      location: z.string()
    }),
    execute: async ({ location }) => {
      // Return all available metrics:
      // - Property values
      // - Rent data
      // - Transaction volume
      // - Investor activity
      // - Motivation indicators
      // - Wholesale activity (inferred)
    }
  }),
  
  findOpportunityGaps: tool({
    description: 'Find high-opportunity areas where user has no coverage',
    parameters: z.object({
      minOpportunityScore: z.number().default(70),
      within: z.string().optional()
    }),
    execute: async (params, { userId, viewContext }) => {
      // Compare opportunity heat to user's lead locations
      // Identify gaps
    }
  }),
  
  layerHeatMaps: tool({
    description: 'Combine multiple heat layers with custom weights',
    parameters: z.object({
      layers: z.array(z.object({
        layerId: z.string(),
        weight: z.number().min(0).max(1)
      }))
    }),
    execute: async ({ layers }) => {
      // Create composite heat map
    }
  }),
  
  getMarketOpportunityScore: tool({
    description: 'Get composite opportunity score for a market',
    parameters: z.object({
      location: z.string(),
      forStrategy: z.enum(['wholesale', 'flip', 'rental']).default('wholesale')
    }),
    execute: async ({ location, forStrategy }) => {
      // Calculate composite score
      // Based on multiple factors weighted for strategy
    }
  })
};
```

**Tool Count: 14**

### Heat Map Calculation Methods

```typescript
// lib/heat-map/calculations.ts

// Wholesale Volume Detection
export async function calculateWholesaleVolume(
  zipCode: string,
  timeframeDays: number = 180
): Promise<WholesaleVolumeData> {
  const transactions = await getTransactionHistory(zipCode, timeframeDays);
  
  // Identify quick flips (< 90 days between purchases)
  const quickFlips = transactions.filter(t => {
    const holdDays = daysBetween(t.purchaseDate, t.saleDate);
    return holdDays < 90 && holdDays >= 0;
  });
  
  // Calculate average spread (assignment fee proxy)
  const spreads = quickFlips.map(t => t.salePrice - t.purchasePrice);
  const avgSpread = spreads.length > 0 
    ? spreads.reduce((a, b) => a + b, 0) / spreads.length 
    : 0;
  
  return {
    totalTransactions: transactions.length,
    quickFlipCount: quickFlips.length,
    wholesaleRate: quickFlips.length / transactions.length,
    averageSpread: avgSpread,
    trend: calculateTrend(quickFlips)
  };
}

// Motivation Density Calculation
export async function calculateMotivationDensity(
  zipCode: string
): Promise<MotivationDensityData> {
  const properties = await getPropertiesInZip(zipCode);
  
  // Score each property
  const scored = properties.map(p => ({
    ...p,
    motivationScore: calculateMotivationScore(p)
  }));
  
  // Calculate density metrics
  const highMotivation = scored.filter(p => p.motivationScore >= 70);
  const totalHomes = await getHousingUnitsInZip(zipCode);
  
  return {
    totalProperties: properties.length,
    highMotivationCount: highMotivation.length,
    densityPer1000Homes: (highMotivation.length / totalHomes) * 1000,
    averageMotivationScore: avg(scored.map(p => p.motivationScore)),
    filterBreakdown: {
      absentee: scored.filter(p => p.matchesFilter('absentee-owner')).length,
      highEquity: scored.filter(p => p.matchesFilter('high-equity')).length,
      tiredLandlord: scored.filter(p => p.matchesFilter('tired-landlord')).length,
      // ... other filters
    }
  };
}

// Competition Estimate
export async function estimateCompetition(
  zipCode: string
): Promise<CompetitionData> {
  // Properties matching STANDARD filters (what everyone uses)
  const standardMatches = await countFilterMatches(zipCode, STANDARD_FILTERS);
  
  // Properties matching CONTRARIAN filters (our edge)
  const contrarianMatches = await countFilterMatches(zipCode, CONTRARIAN_FILTERS);
  
  // Higher standard match = more competition
  // Lower contrarian overlap = better opportunity
  const competitionScore = (standardMatches / totalProperties) * 100;
  const opportunityScore = (contrarianMatches / totalProperties) * 100;
  
  return {
    competitionLevel: categorize(competitionScore), // 'low', 'medium', 'high'
    standardFilterDensity: standardMatches,
    contrarianFilterDensity: contrarianMatches,
    opportunityRatio: contrarianMatches / Math.max(standardMatches, 1),
    recommendation: generateRecommendation(competitionScore, opportunityScore)
  };
}

// Buyer Activity Heat
export async function calculateBuyerActivityHeat(
  zipCode: string,
  userId: string
): Promise<BuyerActivityData> {
  // Get user's buyer database
  const buyers = await getUserBuyers(userId);
  
  // Count purchases by zip
  const purchasesInZip = buyers.flatMap(b => 
    b.properties.filter(p => p.zipCode === zipCode && p.isCurrentOwner)
  );
  
  return {
    buyerCount: new Set(purchasesInZip.map(p => p.buyerId)).size,
    purchaseCount: purchasesInZip.length,
    recentPurchases: purchasesInZip.filter(p => 
      daysSince(p.purchaseDate) < 180
    ).length,
    topBuyers: identifyTopBuyers(purchasesInZip),
    demandIndicator: purchasesInZip.length > 5 ? 'high' : 
                     purchasesInZip.length > 1 ? 'medium' : 'low'
  };
}
```

---

## 14. Database Schema Additions

### Lead Lists / CRM Tables

```sql
-- Lead lists (user-created lists of properties)
CREATE TABLE lead_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- List metadata
  name TEXT NOT NULL,
  description TEXT,
  list_type TEXT DEFAULT 'manual' CHECK (list_type IN ('manual', 'smart', 'ai-generated')),
  
  -- Smart list criteria (for auto-updating lists)
  smart_criteria JSONB,
  
  -- Stats
  item_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_lists_user ON lead_lists(user_id);

-- Lead list items (properties in lists)
CREATE TABLE lead_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES lead_lists(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- How it was added
  added_by TEXT DEFAULT 'user' CHECK (added_by IN ('user', 'ai', 'automation', 'import')),
  added_reason TEXT,                              -- AI reasoning for why it was added
  
  -- Scoring
  motivation_score NUMERIC(5,2),
  motivation_factors JSONB,                       -- Breakdown of score
  
  -- CRM status
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'callback', 'interested', 
    'negotiating', 'dead', 'do_not_contact'
  )),
  
  -- Contact tracking
  last_contacted TIMESTAMPTZ,
  contact_attempts INTEGER DEFAULT 0,
  next_follow_up TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(list_id, property_id)
);

CREATE INDEX idx_lead_list_items_list ON lead_list_items(list_id);
CREATE INDEX idx_lead_list_items_property ON lead_list_items(property_id);
CREATE INDEX idx_lead_list_items_status ON lead_list_items(status);
CREATE INDEX idx_lead_list_items_motivation ON lead_list_items(motivation_score DESC);

-- Contact history for leads
CREATE TABLE lead_contact_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_item_id UUID REFERENCES lead_list_items(id) ON DELETE CASCADE,
  
  -- Contact details
  contact_type TEXT CHECK (contact_type IN ('call', 'text', 'email', 'voicemail', 'direct_mail')),
  contact_direction TEXT CHECK (contact_direction IN ('outbound', 'inbound')),
  
  -- Outcome
  outcome TEXT CHECK (outcome IN (
    'connected', 'no_answer', 'voicemail', 'wrong_number',
    'callback_requested', 'not_interested', 'interested', 'offer_made'
  )),
  
  -- Details
  notes TEXT,
  duration_seconds INTEGER,                       -- For calls
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_history_lead ON lead_contact_history(lead_item_id);

-- RLS Policies
ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_contact_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own lists" ON lead_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own list items" ON lead_list_items
  FOR ALL USING (
    list_id IN (SELECT id FROM lead_lists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can access own contact history" ON lead_contact_history
  FOR ALL USING (
    lead_item_id IN (
      SELECT li.id FROM lead_list_items li
      JOIN lead_lists l ON li.list_id = l.id
      WHERE l.user_id = auth.uid()
    )
  );
```

### Heat Map Cache Tables

```sql
-- Pre-calculated heat map data (refreshed periodically)
CREATE TABLE heat_map_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Location
  location_type TEXT CHECK (location_type IN ('zip', 'tract', 'city', 'county')),
  location_value TEXT NOT NULL,
  state TEXT,
  
  -- Layer data (JSONB for flexibility)
  layer_data JSONB NOT NULL,
  /* Structure:
  {
    "property_values": { "median": 250000, "mean": 275000, "trend": 0.05 },
    "rent_prices": { "median": 1800, "mean": 1950, "trend": 0.03 },
    "days_on_market": { "median": 45, "mean": 52 },
    "foreclosure_rate": { "count": 23, "rate": 0.02 },
    "investor_activity": { "llc_purchases": 45, "cash_purchases": 78, "rate": 0.15 },
    "wholesale_volume": { "quick_flips": 12, "avg_spread": 15000, "trend": 0.1 },
    "motivation_density": { "high_count": 156, "per_1000": 23.5 },
    "equity_density": { "high_equity_count": 234, "avg_equity": 0.45 }
  }
  */
  
  -- Metadata
  property_count INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  UNIQUE(location_type, location_value)
);

CREATE INDEX idx_heat_map_location ON heat_map_cache(location_type, location_value);
CREATE INDEX idx_heat_map_state ON heat_map_cache(state);
CREATE INDEX idx_heat_map_expires ON heat_map_cache(expires_at);

-- User-specific heat map data
CREATE TABLE user_heat_map_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Location
  location_type TEXT,
  location_value TEXT NOT NULL,
  
  -- User-specific metrics
  user_data JSONB NOT NULL,
  /* Structure:
  {
    "filter_matches": { "count": 45, "filter_ids": ["uuid1", "uuid2"] },
    "buyer_activity": { "buyer_count": 3, "purchase_count": 8 },
    "lead_count": 12,
    "deal_count": 2,
    "closed_count": 1
  }
  */
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, location_type, location_value)
);

CREATE INDEX idx_user_heat_map_user ON user_heat_map_data(user_id);
```

### Tasks / Reminders Table

```sql
-- User tasks and reminders
CREATE TABLE user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('follow_up', 'call', 'review', 'general')),
  
  -- References
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  lead_item_id UUID REFERENCES lead_list_items(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
  
  -- Scheduling
  due_date TIMESTAMPTZ,
  reminder_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  
  -- AI generated
  created_by TEXT DEFAULT 'user' CHECK (created_by IN ('user', 'ai', 'automation')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON user_tasks(user_id);
CREATE INDEX idx_tasks_due ON user_tasks(due_date) WHERE status = 'pending';
CREATE INDEX idx_tasks_deal ON user_tasks(deal_id);
CREATE INDEX idx_tasks_property ON user_tasks(property_id);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own tasks" ON user_tasks
  FOR ALL USING (auth.uid() = user_id);
```

### Scheduled Reports Table

```sql
-- Scheduled reports
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report configuration
  report_type TEXT CHECK (report_type IN (
    'daily_summary', 'weekly_summary', 'pipeline_status', 
    'performance', 'market_update', 'custom'
  )),
  report_config JSONB,                            -- Custom report parameters
  
  -- Schedule
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  day_of_week INTEGER,                            -- 0-6 for weekly
  day_of_month INTEGER,                           -- 1-31 for monthly
  time_of_day TIME DEFAULT '09:00',
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Delivery
  delivery_method TEXT[] DEFAULT ARRAY['email'],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sent TIMESTAMPTZ,
  next_scheduled TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_reports_user ON scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next ON scheduled_reports(next_scheduled) WHERE is_active = true;

ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own reports" ON scheduled_reports
  FOR ALL USING (auth.uid() = user_id);
```

---

## 15. Tool Implementation Reference

### Complete Tool Registry

```typescript
// lib/ai/ai-tools.ts

import { searchTools } from './tools/search-tools';
import { propertyTools } from './tools/property-tools';
import { dealTools } from './tools/deal-tools';
import { crmTools } from './tools/crm-tools';
import { buyerTools } from './tools/buyer-tools';
import { marketTools } from './tools/market-tools';
import { filterTools } from './tools/filter-tools';
import { dashboardTools } from './tools/dashboard-tools';
import { skipTraceTools } from './tools/skip-trace-tools';
import { notificationTools } from './tools/notification-tools';
import { heatMapTools } from './tools/heat-map-tools';

export const aiTools = {
  // Property Search & Discovery (10 tools)
  ...searchTools,
  
  // Property Detail (13 tools)
  ...propertyTools,
  
  // Deal Pipeline (12 tools)
  ...dealTools,
  
  // Lead Lists / CRM (12 tools)
  ...crmTools,
  
  // Buyer Database (12 tools)
  ...buyerTools,
  
  // Market Analysis (10 tools)
  ...marketTools,
  
  // Filter System (11 tools)
  ...filterTools,
  
  // Dashboard / KPIs (12 tools)
  ...dashboardTools,
  
  // Skip Tracing (10 tools)
  ...skipTraceTools,
  
  // Notifications (10 tools)
  ...notificationTools,
  
  // Heat Mapping (14 tools)
  ...heatMapTools
};

// Total: 126 tools
```

### Tool Summary by Category

| Category | Tool Count | Priority |
|----------|------------|----------|
| Property Search & Discovery | 10 | P0 |
| Property Detail | 13 | P0 |
| Deal Pipeline | 12 | P0 |
| Lead Lists / CRM | 12 | P0 |
| Buyer Database | 12 | P1 |
| Market Analysis | 10 | P1 |
| Filter System | 11 | P1 |
| Dashboard / KPIs | 12 | P1 |
| Skip Tracing | 10 | P2 |
| Notifications | 10 | P2 |
| Heat Mapping | 14 | P1 |
| **TOTAL** | **126** | |

---

## Appendix: AI Interaction Examples

### Multi-Step Workflow Example

**User (viewing search results with 100 properties):**
> "Skip trace the top 25 most motivated sellers and add them to a new list called Priority Leads"

**AI Internal Process:**
1. Get visible property IDs from context
2. Call `rankListByMotivation` with property IDs
3. Take top 25
4. Call `batchSkipTraceList` on those 25
5. Call `createLeadList` with name "Priority Leads"
6. Call `bulkAddToLeadList` with the 25 properties

**AI Response:**
> "Done! I created 'Priority Leads' with 25 properties. Here's a summary:
> - 22 out of 25 successfully skip traced
> - Top motivation factors: 8 almost-sold, 6 tired landlords, 5 underwater landlords
> - Average motivation score: 78
> 
> The top 3 most motivated are:
> 1. 123 Oak St (score: 92) - Listed twice, failed both times
> 2. 456 Elm Ave (score: 88) - 18-year owner, out-of-state
> 3. 789 Main St (score: 85) - Tax squeeze + high equity
>
> Would you like me to prioritize these for calling today?"

### Context-Aware Example

**User (viewing property detail for 123 Oak St):**
> "Find buyers for this"

**AI Internal Process:**
1. Get property ID from `viewContext.propertyId`
2. Load property details
3. Call `matchBuyersToProperty` with property context
4. Return ranked buyers with reasoning

**AI Response:**
> "I found 8 buyers who would be interested in 123 Oak St:
>
> **Best Match: Michael Chen (Score: 94)**
> - Has bought 6 properties in 33601 in the last year
> - Avg purchase: $185k (this is $175k)
> - Prefers 3-beds (this is 3-bed)
> - Last purchased 3 weeks ago
>
> **Strong Match: Tampa Flip LLC (Score: 87)**
> - Specializes in this zip code
> - Does 2-3 flips per month
> - Price range: $150k-$250k
>
> Want me to draft outreach to your top buyers?"

---

*End of Document*
