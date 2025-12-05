# CRM & Sales Intelligence Hub
## Complete Development Specification

**Version:** 1.0 - DEFINITIVE  
**Last Updated:** December 2, 2025  
**Status:** Ready for Implementation - Companion to AI_First_Wholesaling_Platform_DEFINITIVE_PLAN_v2.md  
**Integration Point:** Extends Phase 2-3 of Main Platform Development

---

## Document Purpose

This document contains the **complete, self-contained specification** for the CRM and Sales Intelligence Hub features of the AI-First Real Estate Wholesaling Platform. This is a **companion document** to the main Definitive Plan V2 and follows the same technology stack, conventions, and implementation patterns.

The features specified here transform the platform from a data/search tool into a **complete sales enablement system** with AI-powered outreach generation, intelligent lead management, and comprehensive deal analysis.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Overview](#2-feature-overview)
3. [Database Schema Extensions](#3-database-schema-extensions)
4. [CRM Core System](#4-crm-core-system)
5. [Sales Intelligence Hub - Property Card](#5-sales-intelligence-hub---property-card)
6. [AI-Generated Outreach System](#6-ai-generated-outreach-system)
7. [Sales Intelligence Report](#7-sales-intelligence-report)
8. [Tiered Offer Strategy Engine](#8-tiered-offer-strategy-engine)
9. [Unified Communication Inbox](#9-unified-communication-inbox)
10. [Workflow Automation Engine](#10-workflow-automation-engine)
11. [AI System Prompts - Outreach & Analysis](#11-ai-system-prompts---outreach--analysis)
12. [API Routes](#12-api-routes)
13. [Component Architecture](#13-component-architecture)
14. [Integration with Main Platform](#14-integration-with-main-platform)
15. [Implementation Timeline](#15-implementation-timeline)
16. [Environment Variables - Additional](#16-environment-variables---additional)

---

## 1. Executive Summary

### What This Adds

The CRM & Sales Intelligence Hub extends the core platform with:

1. **AI-Native CRM** - Lead/contact management with AI-powered prioritization
2. **Sales Intelligence Hub** - Transform property cards into action centers
3. **AI-Generated Outreach** - One-click email/SMS generation with sensitivity filtering
4. **Sales Intelligence Reports** - Comprehensive caller briefing documents
5. **Tiered Offer Strategy** - 3-4 tier offer calculations with negotiation guidance
6. **Unified Inbox** - Centralized SMS/email/call communication tracking
7. **Workflow Automation** - Trigger-based actions and follow-up sequences

### Core Differentiator

**No competitor provides AI-generated, sensitivity-aware outreach directly from property data.** Users currently spend 20-30 minutes per lead on manual research and message crafting. This system reduces that to a single click.

### Key Principles

| Principle | Implementation |
|-----------|----------------|
| AI generates, human approves | All outreach is draft-first, editable before send |
| Sensitivity-aware messaging | Divorce, foreclosure, death never mentioned in written outreach |
| Complete activity logging | Every action flows back to CRM as tracked activity |
| Tiered negotiation guidance | 3-4 offer tiers with rationale for each |

---

## 2. Feature Overview

### CRM vs. Kanban Clarification

A Kanban board only handles pipeline visualization. A true wholesaling CRM requires:

| Capability | Kanban | This CRM |
|------------|--------|----------|
| Pipeline stages | ✅ | ✅ |
| Contact/lead records | ❌ | ✅ |
| Communication tracking | ❌ | ✅ |
| Activity logging | ❌ | ✅ |
| Follow-up automation | ❌ | ✅ |
| AI lead scoring | ❌ | ✅ |
| Deal analysis integration | ❌ | ✅ |
| Multi-channel outreach | ❌ | ✅ |

### Sales Intelligence Hub Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROPERTY CARD → SALES INTELLIGENCE HUB                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PROPERTY DATA          SKIP TRACE           MOTIVATION ANALYSIS           │
│   ├── Address            ├── Phones           ├── Score: 78/100            │
│   ├── Beds/Baths/Sqft    ├── Emails           ├── Divorce (hidden)         │
│   ├── Year Built         └── Verified ✓       ├── Absentee (shown)         │
│   └── Est. Value                              └── High Equity (shown)      │
│                                                                             │
│   ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │ 📧 Generate  │  │ 💬 Generate  │  │ 📞 Call Now  │  │ 📋 Sales     │   │
│   │    Email     │  │    SMS       │  │ (Click2Call) │  │    Report    │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│   AI generates personalized outreach → User reviews/edits → Send/Log       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Extensions

These tables extend the existing schema from the main Definitive Plan V2.

```sql
-- ============================================
-- CRM CORE TABLES
-- ============================================

-- Leads: Central lead/contact management
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Owner Information (enriched from property + skip trace)
  owner_name TEXT NOT NULL,
  owner_type TEXT CHECK (owner_type IN ('Individual', 'Organization', 'Trust')),
  mailing_address JSONB,          -- {line1, line2, city, state, zip}
  
  -- Contact Information (from skip trace)
  phones JSONB,                   -- [{number, type, verified, isPrimary}]
  emails JSONB,                   -- [{address, type, verified, isPrimary}]
  skip_traced_at TIMESTAMPTZ,
  skip_trace_data JSONB,          -- Full skip trace response
  
  -- Pipeline Status
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'engaged', 'qualified', 
    'offer_made', 'negotiating', 'under_contract', 
    'closed_won', 'closed_lost', 'dead'
  )),
  status_changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Motivation Analysis (AI-calculated)
  motivation_score INTEGER,        -- 0-100
  motivation_factors JSONB,        -- [{factor, weight, isSensitive}]
  motivation_calculated_at TIMESTAMPTZ,
  
  -- Distress Indicators (for AI context, some are sensitive)
  distress_indicators JSONB,       -- {preForeclosure, taxDelinquent, divorce, probate, etc.}
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Tags & Lists
  tags TEXT[],
  lists UUID[],                    -- References to lead_lists table
  
  -- Source Tracking
  source TEXT,                     -- 'filter_search', 'driving_for_dollars', 'manual', 'import'
  source_filter_id UUID,           -- If from saved filter
  
  -- Follow-up
  next_follow_up TIMESTAMPTZ,
  follow_up_notes TEXT,
  
  -- AI-Generated Content Cache
  cached_email_draft JSONB,        -- {subject, body, generatedAt, tone}
  cached_sms_draft JSONB,          -- {body, generatedAt, tone}
  cached_sales_report JSONB,       -- Full sales intelligence report
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Lists: User-created lists for organization
CREATE TABLE lead_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',    -- For UI display
  icon TEXT DEFAULT 'folder',
  
  -- Smart list criteria (optional - for dynamic lists)
  is_smart_list BOOLEAN DEFAULT false,
  smart_criteria JSONB,            -- Filter criteria for auto-population
  
  lead_count INTEGER DEFAULT 0,    -- Cached count
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities: All lead interactions
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Activity Type
  type TEXT NOT NULL CHECK (type IN (
    'call_outbound', 'call_inbound', 'call_missed',
    'sms_sent', 'sms_received',
    'email_sent', 'email_received', 'email_opened',
    'voicemail_left', 'voicemail_received',
    'note_added', 'status_changed', 'offer_made',
    'document_sent', 'document_signed',
    'meeting_scheduled', 'meeting_completed',
    'site_visit', 'skip_trace_completed',
    'ai_outreach_generated', 'ai_report_generated'
  )),
  
  -- Activity Details
  subject TEXT,                    -- For emails
  body TEXT,                       -- Content of message/note
  duration_seconds INTEGER,        -- For calls
  
  -- Communication Details
  channel TEXT CHECK (channel IN ('phone', 'sms', 'email', 'in_person', 'system')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound', 'internal')),
  
  -- External References
  external_id TEXT,                -- Twilio SID, email ID, etc.
  external_provider TEXT,          -- 'twilio', 'sendgrid', etc.
  
  -- Outcome (for calls)
  outcome TEXT CHECK (outcome IN (
    'answered', 'no_answer', 'busy', 'voicemail', 
    'wrong_number', 'disconnected', 'callback_requested',
    'interested', 'not_interested', 'do_not_call'
  )),
  
  -- AI-Generated Flag
  is_ai_generated BOOLEAN DEFAULT false,
  ai_model_used TEXT,
  ai_prompt_id TEXT,
  
  -- Metadata
  metadata JSONB,                  -- Flexible additional data
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OFFER & DEAL ANALYSIS TABLES
-- ============================================

-- Offer Strategies: Tiered offer calculations per lead
CREATE TABLE offer_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- ARV Analysis
  arv_estimate INTEGER NOT NULL,
  arv_confidence TEXT CHECK (arv_confidence IN ('high', 'medium', 'low')),
  arv_method TEXT,                 -- 'ai_comps', 'manual', 'hybrid'
  comps_used JSONB,                -- Array of comp details
  
  -- Repair Estimate
  repair_estimate INTEGER NOT NULL,
  repair_breakdown JSONB,          -- {roof: 8000, hvac: 5000, cosmetic: 12000}
  repair_confidence TEXT CHECK (repair_confidence IN ('high', 'medium', 'low')),
  
  -- User's Deal Parameters
  target_profit_margin NUMERIC(5,2) DEFAULT 0.30,
  wholesale_fee_target INTEGER DEFAULT 10000,
  holding_cost_monthly INTEGER DEFAULT 1500,
  estimated_hold_months INTEGER DEFAULT 3,
  
  -- Tiered Offers (Calculated)
  offer_tiers JSONB NOT NULL,      -- See structure below
  /*
  {
    optimal: {price: 150000, margin: 26500, rationale: "First offer, test"},
    target: {price: 160000, margin: 16500, rationale: "After pushback"},
    maximum: {price: 170000, margin: 6500, rationale: "Competitive situation"},
    walk_away: {price: 176500, rationale: "Below this, not worth it"}
  }
  */
  
  -- MAO Calculation
  mao_70_rule INTEGER,             -- (ARV * 0.70) - repairs
  mao_custom INTEGER,              -- User's custom formula result
  
  -- AI Analysis
  ai_analysis_summary TEXT,
  ai_negotiation_tips JSONB,       -- Array of tips
  ai_risk_factors JSONB,           -- Array of risks
  ai_opportunity_factors JSONB,    -- Array of opportunities
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

-- Messages: Unified inbox for all communications
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  thread_id UUID,                  -- For grouping conversations
  
  -- Message Type
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'voicemail')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  
  -- Participants
  from_address TEXT NOT NULL,      -- Phone number or email
  to_address TEXT NOT NULL,
  
  -- Content
  subject TEXT,                    -- For emails
  body TEXT NOT NULL,
  body_html TEXT,                  -- For rich emails
  
  -- Attachments
  attachments JSONB,               -- [{name, url, type, size}]
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN (
    'draft', 'queued', 'sent', 'delivered', 'failed',
    'opened', 'clicked', 'bounced', 'spam'
  )),
  status_updated_at TIMESTAMPTZ,
  
  -- External References
  external_id TEXT,                -- Provider message ID
  external_provider TEXT,          -- 'twilio', 'sendgrid'
  
  -- AI Generation
  is_ai_generated BOOLEAN DEFAULT false,
  ai_template_id TEXT,
  original_ai_draft TEXT,          -- Before user edits
  
  -- Read Status (for inbox)
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Templates: Reusable templates for outreach
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Template Info
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'voicemail_script')),
  
  -- Content
  subject TEXT,                    -- For emails
  body TEXT NOT NULL,              -- Supports {{variable}} placeholders
  
  -- Categorization
  category TEXT CHECK (category IN (
    'initial_outreach', 'follow_up', 'offer', 
    'contract', 'closing', 'general'
  )),
  tone TEXT CHECK (tone IN ('friendly', 'professional', 'urgent', 'empathetic')),
  
  -- AI Enhancement
  is_ai_base_template BOOLEAN DEFAULT false,
  ai_personalization_prompt TEXT,  -- Instructions for AI personalization
  
  -- Usage Stats
  times_used INTEGER DEFAULT 0,
  avg_response_rate NUMERIC(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKFLOW AUTOMATION TABLES
-- ============================================

-- Workflows: Automation rules
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'new_lead', 'status_change', 'no_response', 
    'property_match', 'schedule', 'manual'
  )),
  trigger_config JSONB NOT NULL,   -- Trigger-specific configuration
  /*
  Examples:
  {type: 'status_change', from: 'new', to: 'contacted'}
  {type: 'no_response', days: 3, channel: 'sms'}
  {type: 'property_match', filter_id: 'uuid'}
  {type: 'schedule', cron: '0 9 * * 1'} // Every Monday 9am
  */
  
  -- Conditions (optional additional filters)
  conditions JSONB,                -- [{field, operator, value}]
  
  -- Actions (executed in order)
  actions JSONB NOT NULL,          -- Array of action configs
  /*
  [
    {type: 'send_sms', template_id: 'uuid', delay_minutes: 0},
    {type: 'add_tag', tag: 'hot-lead'},
    {type: 'create_task', title: 'Call within 24h', due_hours: 24},
    {type: 'update_status', status: 'contacted'},
    {type: 'assign_user', user_id: 'uuid'},
    {type: 'webhook', url: 'https://...', method: 'POST'}
  ]
  */
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  times_triggered INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Executions: Log of workflow runs
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Execution Status
  status TEXT DEFAULT 'running' CHECK (status IN (
    'running', 'completed', 'failed', 'cancelled'
  )),
  
  -- Results
  actions_completed INTEGER DEFAULT 0,
  actions_failed INTEGER DEFAULT 0,
  action_results JSONB,            -- [{action, status, result, error}]
  
  -- Error Handling
  error_message TEXT,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- SALES INTELLIGENCE TABLES
-- ============================================

-- Sales Reports: Cached AI-generated sales intelligence reports
CREATE TABLE sales_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Report Content (structured JSON)
  report_data JSONB NOT NULL,
  /*
  {
    ownerProfile: {...},
    propertySnapshot: {...},
    motivationAnalysis: {
      score: 78,
      factors: [{factor, weight, isSensitive, displayText}]
    },
    conversationGuide: {
      talkingPoints: [...],
      listenFor: [...],
      avoid: [...]
    },
    offerStrategy: {
      arvEstimate: 295000,
      repairEstimate: 30000,
      tiers: {...}
    },
    comparables: [...],
    suggestedOpener: "..."
  }
  */
  
  -- Version Control
  version INTEGER DEFAULT 1,
  
  -- AI Generation Metadata
  ai_model_used TEXT,
  generation_time_ms INTEGER,
  tokens_used INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Leads indexes
CREATE INDEX idx_leads_user_status ON leads(user_id, status);
CREATE INDEX idx_leads_user_score ON leads(user_id, motivation_score DESC);
CREATE INDEX idx_leads_next_followup ON leads(user_id, next_follow_up) 
  WHERE next_follow_up IS NOT NULL;
CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_tags ON leads USING GIN(tags);

-- Activities indexes
CREATE INDEX idx_activities_lead ON activities(lead_id, created_at DESC);
CREATE INDEX idx_activities_user_type ON activities(user_id, type, created_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_lead ON messages(lead_id, created_at DESC);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_messages_unread ON messages(user_id, is_read, created_at DESC) 
  WHERE is_read = false;

-- Offer strategies indexes
CREATE INDEX idx_offer_strategies_lead ON offer_strategies(lead_id) 
  WHERE is_active = true;

-- Workflows indexes
CREATE INDEX idx_workflows_user_active ON workflows(user_id) 
  WHERE is_active = true;
CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id, started_at DESC);
```

---

## 4. CRM Core System

### TypeScript Types

```typescript
// types/crm.ts

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'engaged' 
  | 'qualified' 
  | 'offer_made' 
  | 'negotiating' 
  | 'under_contract' 
  | 'closed_won' 
  | 'closed_lost' 
  | 'dead';

export type ActivityType = 
  | 'call_outbound' | 'call_inbound' | 'call_missed'
  | 'sms_sent' | 'sms_received'
  | 'email_sent' | 'email_received' | 'email_opened'
  | 'voicemail_left' | 'voicemail_received'
  | 'note_added' | 'status_changed' | 'offer_made'
  | 'document_sent' | 'document_signed'
  | 'meeting_scheduled' | 'meeting_completed'
  | 'site_visit' | 'skip_trace_completed'
  | 'ai_outreach_generated' | 'ai_report_generated';

export type CallOutcome = 
  | 'answered' | 'no_answer' | 'busy' | 'voicemail' 
  | 'wrong_number' | 'disconnected' | 'callback_requested'
  | 'interested' | 'not_interested' | 'do_not_call';

export interface Lead {
  id: string;
  userId: string;
  propertyId: string | null;
  
  // Owner Info
  ownerName: string;
  ownerType: 'Individual' | 'Organization' | 'Trust';
  mailingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  } | null;
  
  // Contact Info
  phones: Array<{
    number: string;
    type: 'mobile' | 'landline' | 'voip' | 'unknown';
    verified: boolean;
    isPrimary: boolean;
  }>;
  emails: Array<{
    address: string;
    type: 'personal' | 'work' | 'unknown';
    verified: boolean;
    isPrimary: boolean;
  }>;
  skipTracedAt: Date | null;
  
  // Pipeline
  status: LeadStatus;
  statusChangedAt: Date;
  
  // Motivation
  motivationScore: number | null;
  motivationFactors: Array<{
    factor: string;
    weight: number;
    isSensitive: boolean;
    displayText: string;
  }>;
  
  // Distress Indicators
  distressIndicators: {
    preForeclosure: boolean;
    taxDelinquent: boolean;
    taxDelinquentYears?: number;
    divorce: boolean;
    probate: boolean;
    codeViolations: boolean;
    codeViolationCount?: number;
    bankruptcy: boolean;
    vacant: boolean;
    liens: boolean;
    lienAmount?: number;
  };
  
  // Organization
  tags: string[];
  assignedTo: string | null;
  source: string;
  
  // Follow-up
  nextFollowUp: Date | null;
  followUpNotes: string | null;
  
  // Cached AI Content
  cachedEmailDraft: {
    subject: string;
    body: string;
    generatedAt: Date;
    tone: string;
  } | null;
  cachedSmsDraft: {
    body: string;
    generatedAt: Date;
    tone: string;
  } | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  leadId: string;
  propertyId: string | null;
  
  type: ActivityType;
  subject: string | null;
  body: string | null;
  durationSeconds: number | null;
  
  channel: 'phone' | 'sms' | 'email' | 'in_person' | 'system';
  direction: 'inbound' | 'outbound' | 'internal';
  
  outcome: CallOutcome | null;
  
  isAiGenerated: boolean;
  aiModelUsed: string | null;
  
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface LeadWithProperty extends Lead {
  property: Property | null;
}

export interface LeadWithActivities extends Lead {
  activities: Activity[];
  activityCount: number;
  lastActivity: Activity | null;
}
```

### Lead Service

```typescript
// lib/crm/lead-service.ts

import { createClient } from '@/lib/supabase/server';
import { Lead, LeadStatus, Activity, ActivityType } from '@/types/crm';

export async function createLead(params: {
  userId: string;
  propertyId: string;
  ownerName: string;
  ownerType?: Lead['ownerType'];
  mailingAddress?: Lead['mailingAddress'];
  source?: string;
  sourceFilterId?: string;
  tags?: string[];
}): Promise<Lead> {
  const supabase = createClient();
  
  // Check if lead already exists for this property + user
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('user_id', params.userId)
    .eq('property_id', params.propertyId)
    .single();
  
  if (existing) {
    throw new Error('Lead already exists for this property');
  }
  
  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: params.userId,
      property_id: params.propertyId,
      owner_name: params.ownerName,
      owner_type: params.ownerType || 'Individual',
      mailing_address: params.mailingAddress,
      source: params.source || 'manual',
      source_filter_id: params.sourceFilterId,
      tags: params.tags || [],
      phones: [],
      emails: [],
      distress_indicators: {}
    })
    .select()
    .single();
  
  if (error) throw error;
  return mapLeadFromDb(data);
}

export async function getLeadById(leadId: string, userId: string): Promise<Lead | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return mapLeadFromDb(data);
}

export async function getLeadsForUser(
  userId: string,
  params: {
    status?: LeadStatus | LeadStatus[];
    tags?: string[];
    minScore?: number;
    search?: string;
    sortBy?: 'created' | 'updated' | 'score' | 'followup';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ leads: Lead[]; total: number }> {
  const supabase = createClient();
  
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);
  
  // Apply filters
  if (params.status) {
    if (Array.isArray(params.status)) {
      query = query.in('status', params.status);
    } else {
      query = query.eq('status', params.status);
    }
  }
  
  if (params.tags && params.tags.length > 0) {
    query = query.overlaps('tags', params.tags);
  }
  
  if (params.minScore !== undefined) {
    query = query.gte('motivation_score', params.minScore);
  }
  
  if (params.search) {
    query = query.or(`owner_name.ilike.%${params.search}%,property_id.ilike.%${params.search}%`);
  }
  
  // Apply sorting
  const sortColumn = {
    created: 'created_at',
    updated: 'updated_at',
    score: 'motivation_score',
    followup: 'next_follow_up'
  }[params.sortBy || 'created'];
  
  query = query.order(sortColumn, { 
    ascending: params.sortOrder === 'asc',
    nullsFirst: false 
  });
  
  // Apply pagination
  if (params.limit) {
    query = query.limit(params.limit);
  }
  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
  }
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    leads: (data || []).map(mapLeadFromDb),
    total: count || 0
  };
}

export async function updateLeadStatus(
  leadId: string,
  userId: string,
  newStatus: LeadStatus,
  notes?: string
): Promise<Lead> {
  const supabase = createClient();
  
  // Update lead status
  const { data, error } = await supabase
    .from('leads')
    .update({
      status: newStatus,
      status_changed_at: new Date().toISOString()
    })
    .eq('id', leadId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Log activity
  await logActivity({
    userId,
    leadId,
    type: 'status_changed',
    body: notes || `Status changed to ${newStatus}`,
    channel: 'system',
    direction: 'internal',
    metadata: { newStatus, previousStatus: data.status }
  });
  
  return mapLeadFromDb(data);
}

export async function updateLeadSkipTrace(
  leadId: string,
  userId: string,
  skipTraceData: {
    phones: Lead['phones'];
    emails: Lead['emails'];
    rawResponse: any;
  }
): Promise<Lead> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('leads')
    .update({
      phones: skipTraceData.phones,
      emails: skipTraceData.emails,
      skip_traced_at: new Date().toISOString(),
      skip_trace_data: skipTraceData.rawResponse
    })
    .eq('id', leadId)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Log activity
  await logActivity({
    userId,
    leadId,
    type: 'skip_trace_completed',
    body: `Skip trace completed: ${skipTraceData.phones.length} phones, ${skipTraceData.emails.length} emails found`,
    channel: 'system',
    direction: 'internal'
  });
  
  return mapLeadFromDb(data);
}

export async function logActivity(params: {
  userId: string;
  leadId: string;
  propertyId?: string;
  type: ActivityType;
  subject?: string;
  body?: string;
  durationSeconds?: number;
  channel?: Activity['channel'];
  direction?: Activity['direction'];
  outcome?: Activity['outcome'];
  isAiGenerated?: boolean;
  aiModelUsed?: string;
  externalId?: string;
  externalProvider?: string;
  metadata?: Record<string, any>;
}): Promise<Activity> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: params.userId,
      lead_id: params.leadId,
      property_id: params.propertyId,
      type: params.type,
      subject: params.subject,
      body: params.body,
      duration_seconds: params.durationSeconds,
      channel: params.channel || 'system',
      direction: params.direction || 'internal',
      outcome: params.outcome,
      is_ai_generated: params.isAiGenerated || false,
      ai_model_used: params.aiModelUsed,
      external_id: params.externalId,
      external_provider: params.externalProvider,
      metadata: params.metadata || {}
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update lead's updated_at
  await supabase
    .from('leads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.leadId);
  
  return mapActivityFromDb(data);
}

export async function getLeadActivities(
  leadId: string,
  userId: string,
  limit: number = 50
): Promise<Activity[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return (data || []).map(mapActivityFromDb);
}

// Helper functions
function mapLeadFromDb(data: any): Lead {
  return {
    id: data.id,
    userId: data.user_id,
    propertyId: data.property_id,
    ownerName: data.owner_name,
    ownerType: data.owner_type,
    mailingAddress: data.mailing_address,
    phones: data.phones || [],
    emails: data.emails || [],
    skipTracedAt: data.skip_traced_at ? new Date(data.skip_traced_at) : null,
    status: data.status,
    statusChangedAt: new Date(data.status_changed_at),
    motivationScore: data.motivation_score,
    motivationFactors: data.motivation_factors || [],
    distressIndicators: data.distress_indicators || {},
    tags: data.tags || [],
    assignedTo: data.assigned_to,
    source: data.source,
    nextFollowUp: data.next_follow_up ? new Date(data.next_follow_up) : null,
    followUpNotes: data.follow_up_notes,
    cachedEmailDraft: data.cached_email_draft,
    cachedSmsDraft: data.cached_sms_draft,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
}

function mapActivityFromDb(data: any): Activity {
  return {
    id: data.id,
    userId: data.user_id,
    leadId: data.lead_id,
    propertyId: data.property_id,
    type: data.type,
    subject: data.subject,
    body: data.body,
    durationSeconds: data.duration_seconds,
    channel: data.channel,
    direction: data.direction,
    outcome: data.outcome,
    isAiGenerated: data.is_ai_generated,
    aiModelUsed: data.ai_model_used,
    metadata: data.metadata || {},
    createdAt: new Date(data.created_at)
  };
}
```

---

## 5. Sales Intelligence Hub - Property Card

### Enhanced Property Card Component

```typescript
// components/property/PropertyCardIntelligenceHub.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Property } from '@/types/property';
import { Lead } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, MessageSquare, Phone, FileText, 
  AlertTriangle, CheckCircle, Clock, MapPin,
  User, Home, TrendingUp, DollarSign
} from 'lucide-react';
import { OutreachModal } from './OutreachModal';
import { SalesReportDrawer } from './SalesReportDrawer';
import { OfferStrategyPanel } from './OfferStrategyPanel';

interface PropertyCardIntelligenceHubProps {
  property: Property;
  lead?: Lead;
  onLeadCreated?: (lead: Lead) => void;
}

export function PropertyCardIntelligenceHub({
  property,
  lead,
  onLeadCreated
}: PropertyCardIntelligenceHubProps) {
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [outreachChannel, setOutreachChannel] = useState<'email' | 'sms'>('email');
  const [salesReportOpen, setSalesReportOpen] = useState(false);
  
  const isSkipTraced = lead?.skipTracedAt !== null;
  const hasContactInfo = lead && (lead.phones.length > 0 || lead.emails.length > 0);
  
  // Fetch motivation analysis if lead exists
  const { data: motivationData } = useQuery({
    queryKey: ['motivation', lead?.id],
    queryFn: () => fetch(`/api/crm/leads/${lead!.id}/motivation`).then(r => r.json()),
    enabled: !!lead
  });
  
  const handleGenerateOutreach = (channel: 'email' | 'sms') => {
    setOutreachChannel(channel);
    setOutreachModalOpen(true);
  };
  
  const handleCallNow = () => {
    const primaryPhone = lead?.phones.find(p => p.isPrimary) || lead?.phones[0];
    if (primaryPhone) {
      window.location.href = `tel:${primaryPhone.number}`;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{property.formattedAddress}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {property.bedrooms} bed | {property.bathrooms} bath | {property.squareFootage?.toLocaleString()} sqft
              {property.yearBuilt && ` | Built ${property.yearBuilt}`}
            </p>
          </div>
          {motivationData?.score && (
            <Badge 
              variant={motivationData.score >= 70 ? 'destructive' : motivationData.score >= 50 ? 'default' : 'secondary'}
              className="text-sm"
            >
              Score: {motivationData.score}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Owner & Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Owner Information
            </h4>
            <div className="text-sm space-y-1">
              <p className="font-medium">{lead?.ownerName || property.owner?.names?.[0] || 'Unknown'}</p>
              {lead?.mailingAddress && (
                <p className="text-muted-foreground">
                  {lead.mailingAddress.city}, {lead.mailingAddress.state}
                </p>
              )}
              {lead?.mailingAddress?.state !== property.state && (
                <Badge variant="outline" className="mt-1">Out of State</Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Info
              {isSkipTraced ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-500" />
              )}
            </h4>
            {hasContactInfo ? (
              <div className="text-sm space-y-1">
                {lead?.phones.slice(0, 2).map((phone, i) => (
                  <p key={i} className={phone.isPrimary ? 'font-medium' : 'text-muted-foreground'}>
                    📱 {phone.number} {phone.verified && '✓'}
                  </p>
                ))}
                {lead?.emails.slice(0, 1).map((email, i) => (
                  <p key={i} className="text-muted-foreground truncate">
                    📧 {email.address}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isSkipTraced ? 'No contact info found' : 'Skip trace required'}
              </p>
            )}
          </div>
        </div>
        
        {/* Motivation Indicators */}
        {motivationData?.factors && motivationData.factors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Motivation Indicators</h4>
            <div className="flex flex-wrap gap-2">
              {motivationData.factors
                .filter((f: any) => !f.isSensitive) // Only show non-sensitive factors
                .map((factor: any, i: number) => (
                  <Badge key={i} variant="outline">
                    {factor.displayText}
                  </Badge>
                ))}
            </div>
            {motivationData.factors.some((f: any) => f.isSensitive) && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Additional sensitive factors available in Sales Report
              </p>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={() => handleGenerateOutreach('email')}
              disabled={!hasContactInfo || !lead?.emails.length}
            >
              <Mail className="h-5 w-5 mb-1" />
              <span className="text-xs">Email</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={() => handleGenerateOutreach('sms')}
              disabled={!hasContactInfo || !lead?.phones.length}
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs">SMS</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={handleCallNow}
              disabled={!hasContactInfo || !lead?.phones.length}
            >
              <Phone className="h-5 w-5 mb-1" />
              <span className="text-xs">Call</span>
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={() => setSalesReportOpen(true)}
              disabled={!lead}
            >
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Report</span>
            </Button>
          </div>
        </div>
        
        {/* Offer Strategy Preview */}
        {lead && (
          <div className="border-t pt-4">
            <OfferStrategyPanel leadId={lead.id} propertyId={property.id} compact />
          </div>
        )}
      </CardContent>
      
      {/* Modals */}
      <OutreachModal
        open={outreachModalOpen}
        onOpenChange={setOutreachModalOpen}
        channel={outreachChannel}
        lead={lead!}
        property={property}
      />
      
      <SalesReportDrawer
        open={salesReportOpen}
        onOpenChange={setSalesReportOpen}
        lead={lead!}
        property={property}
      />
    </Card>
  );
}
```

---

## 6. AI-Generated Outreach System

### Sensitivity Configuration

```typescript
// lib/ai/outreach/sensitivity-config.ts

/**
 * Sensitivity rules for AI-generated outreach
 * 
 * CRITICAL: These rules determine what information can be included
 * in different communication channels.
 */

export type SensitivityLevel = 'safe' | 'caution' | 'forbidden';

export interface SensitivityRule {
  factor: string;
  email: SensitivityLevel;
  sms: SensitivityLevel;
  phoneScript: SensitivityLevel;  // For caller briefing
  salesReport: SensitivityLevel;  // Full internal report
}

export const SENSITIVITY_RULES: SensitivityRule[] = [
  // FORBIDDEN - Never mention in any written outreach
  {
    factor: 'divorce',
    email: 'forbidden',
    sms: 'forbidden',
    phoneScript: 'caution',      // Caller is aware, doesn't mention
    salesReport: 'safe'          // Full visibility in report
  },
  {
    factor: 'probate',
    email: 'forbidden',
    sms: 'forbidden',
    phoneScript: 'caution',
    salesReport: 'safe'
  },
  {
    factor: 'preForeclosure',
    email: 'forbidden',
    sms: 'forbidden',
    phoneScript: 'caution',
    salesReport: 'safe'
  },
  {
    factor: 'bankruptcy',
    email: 'forbidden',
    sms: 'forbidden',
    phoneScript: 'caution',
    salesReport: 'safe'
  },
  {
    factor: 'taxDelinquent',
    email: 'forbidden',
    sms: 'forbidden',
    phoneScript: 'caution',
    salesReport: 'safe'
  },
  {
    factor: 'death',
    email: 'forbidden',
    sms: 'forbidden',
    phoneScript: 'forbidden',    // Even caller shouldn't mention
    salesReport: 'safe'
  },
  
  // CAUTION - Can hint at but don't state directly
  {
    factor: 'codeViolations',
    email: 'caution',            // "property may need attention"
    sms: 'forbidden',
    phoneScript: 'caution',
    salesReport: 'safe'
  },
  {
    factor: 'vacant',
    email: 'caution',            // "noticed property may be unoccupied"
    sms: 'caution',
    phoneScript: 'safe',
    salesReport: 'safe'
  },
  
  // SAFE - Can mention directly
  {
    factor: 'absentee',
    email: 'safe',               // "managing from afar"
    sms: 'safe',
    phoneScript: 'safe',
    salesReport: 'safe'
  },
  {
    factor: 'outOfState',
    email: 'safe',
    sms: 'safe',
    phoneScript: 'safe',
    salesReport: 'safe'
  },
  {
    factor: 'highEquity',
    email: 'safe',               // Don't mention number, just that they have options
    sms: 'forbidden',            // Too specific for SMS
    phoneScript: 'safe',
    salesReport: 'safe'
  },
  {
    factor: 'longOwnership',
    email: 'safe',               // "after X years of ownership"
    sms: 'safe',
    phoneScript: 'safe',
    salesReport: 'safe'
  },
  {
    factor: 'tiredLandlord',
    email: 'caution',            // Imply, don't state
    sms: 'forbidden',
    phoneScript: 'safe',
    salesReport: 'safe'
  }
];

export function getSensitivityLevel(
  factor: string, 
  channel: 'email' | 'sms' | 'phoneScript' | 'salesReport'
): SensitivityLevel {
  const rule = SENSITIVITY_RULES.find(r => r.factor === factor);
  if (!rule) return 'caution'; // Default to caution for unknown factors
  return rule[channel];
}

export function filterFactorsForChannel(
  factors: Array<{ factor: string; [key: string]: any }>,
  channel: 'email' | 'sms' | 'phoneScript' | 'salesReport'
): Array<{ factor: string; sensitivityLevel: SensitivityLevel; [key: string]: any }> {
  return factors.map(f => ({
    ...f,
    sensitivityLevel: getSensitivityLevel(f.factor, channel)
  }));
}

export function getUsableFactors(
  factors: Array<{ factor: string; [key: string]: any }>,
  channel: 'email' | 'sms'
): Array<{ factor: string; [key: string]: any }> {
  return factors.filter(f => {
    const level = getSensitivityLevel(f.factor, channel);
    return level === 'safe' || level === 'caution';
  });
}
```

### Outreach Generation Service

```typescript
// lib/ai/outreach/outreach-generator.ts

import Anthropic from '@anthropic-ai/sdk';
import { Lead } from '@/types/crm';
import { Property } from '@/types/property';
import { 
  filterFactorsForChannel, 
  getUsableFactors,
  SensitivityLevel 
} from './sensitivity-config';
import { OUTREACH_EMAIL_PROMPT, OUTREACH_SMS_PROMPT } from './outreach-prompts';

const anthropic = new Anthropic();

export interface OutreachGenerationInput {
  lead: Lead;
  property: Property;
  channel: 'email' | 'sms';
  tone: 'friendly' | 'professional' | 'urgent' | 'empathetic';
  userBrandName?: string;
  userPhone?: string;
  includeOffer?: boolean;
  offerRange?: { low: number; high: number };
}

export interface GeneratedOutreach {
  subject?: string;       // For email only
  body: string;
  factorsUsed: string[];  // Which property/owner factors were incorporated
  factorsOmitted: string[]; // Sensitive factors intentionally excluded
  tone: string;
  channel: string;
  generatedAt: Date;
  modelUsed: string;
}

export async function generateOutreach(
  input: OutreachGenerationInput
): Promise<GeneratedOutreach> {
  const { lead, property, channel, tone, userBrandName, userPhone, includeOffer, offerRange } = input;
  
  // Build context object with sensitivity-filtered factors
  const allFactors = buildMotivationFactors(lead, property);
  const usableFactors = getUsableFactors(allFactors, channel);
  const omittedFactors = allFactors.filter(
    f => !usableFactors.find(u => u.factor === f.factor)
  );
  
  // Build the property context (safe info only)
  const propertyContext = {
    address: property.formattedAddress,
    city: property.city,
    state: property.state,
    yearBuilt: property.yearBuilt,
    squareFootage: property.squareFootage,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    ownershipYears: calculateOwnershipYears(property.lastSaleDate)
  };
  
  // Build owner context (filtered)
  const ownerContext = {
    name: lead.ownerName,
    firstName: extractFirstName(lead.ownerName),
    isOutOfState: lead.mailingAddress?.state !== property.state,
    ownerState: lead.mailingAddress?.state,
    isAbsentee: lead.distressIndicators.vacant || 
                (lead.mailingAddress?.state !== property.state)
  };
  
  // Build the AI prompt
  const prompt = channel === 'email' 
    ? OUTREACH_EMAIL_PROMPT 
    : OUTREACH_SMS_PROMPT;
  
  const systemPrompt = prompt.system;
  const userPrompt = prompt.buildUserMessage({
    propertyContext,
    ownerContext,
    usableFactors: usableFactors.map(f => f.factor),
    tone,
    brandName: userBrandName || '[Your Company]',
    phone: userPhone || '[Your Phone]',
    includeOffer,
    offerRange
  });
  
  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });
  
  // Parse response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  
  const parsed = parseOutreachResponse(content.text, channel);
  
  return {
    ...parsed,
    factorsUsed: usableFactors.map(f => f.factor),
    factorsOmitted: omittedFactors.map(f => f.factor),
    tone,
    channel,
    generatedAt: new Date(),
    modelUsed: 'claude-sonnet-4-5-20250929'
  };
}

function buildMotivationFactors(lead: Lead, property: Property): Array<{ factor: string; value: any }> {
  const factors: Array<{ factor: string; value: any }> = [];
  
  // Distress indicators from lead
  if (lead.distressIndicators.divorce) factors.push({ factor: 'divorce', value: true });
  if (lead.distressIndicators.probate) factors.push({ factor: 'probate', value: true });
  if (lead.distressIndicators.preForeclosure) factors.push({ factor: 'preForeclosure', value: true });
  if (lead.distressIndicators.bankruptcy) factors.push({ factor: 'bankruptcy', value: true });
  if (lead.distressIndicators.taxDelinquent) {
    factors.push({ factor: 'taxDelinquent', value: lead.distressIndicators.taxDelinquentYears });
  }
  if (lead.distressIndicators.codeViolations) {
    factors.push({ factor: 'codeViolations', value: lead.distressIndicators.codeViolationCount });
  }
  if (lead.distressIndicators.vacant) factors.push({ factor: 'vacant', value: true });
  
  // Calculated factors
  if (lead.mailingAddress?.state !== property.state) {
    factors.push({ factor: 'outOfState', value: lead.mailingAddress?.state });
  }
  if (!property.ownerOccupied) {
    factors.push({ factor: 'absentee', value: true });
  }
  
  const ownershipYears = calculateOwnershipYears(property.lastSaleDate);
  if (ownershipYears >= 10) {
    factors.push({ factor: 'longOwnership', value: ownershipYears });
  }
  if (ownershipYears >= 10 && !property.ownerOccupied) {
    factors.push({ factor: 'tiredLandlord', value: ownershipYears });
  }
  
  // Calculate equity if we have the data
  if (property.estimatedValue && property.lastSalePrice) {
    const estimatedEquityPercent = calculateEquityPercent(
      property.estimatedValue,
      property.lastSalePrice,
      property.lastSaleDate
    );
    if (estimatedEquityPercent >= 50) {
      factors.push({ factor: 'highEquity', value: estimatedEquityPercent });
    }
  }
  
  return factors;
}

function calculateOwnershipYears(lastSaleDate: string | null): number {
  if (!lastSaleDate) return 0;
  const saleDate = new Date(lastSaleDate);
  const now = new Date();
  return Math.floor((now.getTime() - saleDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
}

function calculateEquityPercent(
  currentValue: number,
  purchasePrice: number,
  purchaseDate: string | null
): number {
  // Simplified equity estimation
  // In production, would use actual mortgage data
  const yearsOwned = calculateOwnershipYears(purchaseDate);
  const estimatedPaidDown = Math.min(purchasePrice * 0.8, purchasePrice * 0.8 * (yearsOwned / 30));
  const estimatedBalance = Math.max(0, purchasePrice * 0.8 - estimatedPaidDown);
  return Math.round(((currentValue - estimatedBalance) / currentValue) * 100);
}

function extractFirstName(fullName: string): string {
  return fullName.split(/\s+/)[0];
}

function parseOutreachResponse(
  text: string, 
  channel: 'email' | 'sms'
): { subject?: string; body: string } {
  if (channel === 'sms') {
    return { body: text.trim() };
  }
  
  // Parse email with subject
  const subjectMatch = text.match(/Subject:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = text.match(/(?:Body:|Message:)?\s*([\s\S]+)$/i);
  
  return {
    subject: subjectMatch?.[1]?.trim() || 'Quick question about your property',
    body: bodyMatch?.[1]?.replace(/^Subject:.+\n/i, '').trim() || text.trim()
  };
}
```

### Outreach Prompts

```typescript
// lib/ai/outreach/outreach-prompts.ts

export const OUTREACH_EMAIL_PROMPT = {
  system: `You are an expert real estate wholesaler writing personalized outreach emails to property owners. 

CRITICAL RULES:
1. NEVER mention divorce, death, foreclosure, bankruptcy, tax problems, or any financial distress
2. NEVER sound like a mass mailer - each email must feel personally written
3. NEVER use aggressive sales language or create false urgency
4. ALWAYS personalize based on the property details provided
5. ALWAYS maintain a respectful, professional tone
6. Keep emails concise - 3-4 short paragraphs maximum
7. End with a soft call-to-action, not a hard sell

WHAT YOU CAN REFERENCE:
- Property address and location
- Length of ownership (if 10+ years)
- Out-of-state ownership (managing from afar angle)
- Property may need attention (if code violations, but don't mention violations specifically)
- Property may be unoccupied (if vacant, frame as convenience)
- Market changes in the area
- Convenience of cash offer

TONE OPTIONS:
- friendly: Warm, conversational, neighbor-to-neighbor feel
- professional: Business-like but personable
- urgent: Time-sensitive opportunity (use sparingly)
- empathetic: Understanding, no-pressure approach`,

  buildUserMessage: (context: {
    propertyContext: any;
    ownerContext: any;
    usableFactors: string[];
    tone: string;
    brandName: string;
    phone: string;
    includeOffer?: boolean;
    offerRange?: { low: number; high: number };
  }) => `Generate a personalized email for this property owner:

PROPERTY:
- Address: ${context.propertyContext.address}
- City/State: ${context.propertyContext.city}, ${context.propertyContext.state}
- Year Built: ${context.propertyContext.yearBuilt || 'Unknown'}
- Size: ${context.propertyContext.squareFootage?.toLocaleString() || 'Unknown'} sqft
- Beds/Baths: ${context.propertyContext.bedrooms}/${context.propertyContext.bathrooms}
- Ownership Length: ${context.propertyContext.ownershipYears} years

OWNER:
- Name: ${context.ownerContext.name}
- First Name: ${context.ownerContext.firstName}
- Out of State: ${context.ownerContext.isOutOfState ? `Yes (lives in ${context.ownerContext.ownerState})` : 'No'}
- Absentee: ${context.ownerContext.isAbsentee ? 'Yes' : 'No'}

USABLE TALKING POINTS (incorporate naturally, don't list all):
${context.usableFactors.map(f => `- ${f}`).join('\n')}

TONE: ${context.tone}
BRAND NAME: ${context.brandName}
PHONE: ${context.phone}
${context.includeOffer ? `INCLUDE SOFT OFFER RANGE: $${context.offerRange?.low?.toLocaleString()} - $${context.offerRange?.high?.toLocaleString()}` : 'DO NOT INCLUDE SPECIFIC OFFER NUMBERS'}

Generate the email with a Subject line first, then the body. Format as:
Subject: [subject line]

[email body]`
};

export const OUTREACH_SMS_PROMPT = {
  system: `You are an expert real estate wholesaler writing personalized SMS messages to property owners.

CRITICAL RULES:
1. NEVER mention divorce, death, foreclosure, bankruptcy, tax problems, or ANY personal circumstances
2. Keep messages under 160 characters when possible, never over 320
3. Be direct but friendly - SMS should feel like a quick text, not a sales pitch
4. Include the property address reference
5. End with a simple question or soft CTA
6. ALWAYS include "Reply STOP to opt out" at the end

WHAT YOU CAN REFERENCE:
- Property address (abbreviated is fine)
- You buy houses directly
- Cash offer / close fast
- No repairs needed
- Their timeline

TONE OPTIONS:
- friendly: Casual, approachable
- professional: Brief but businesslike
- empathetic: Understanding, no-pressure`,

  buildUserMessage: (context: {
    propertyContext: any;
    ownerContext: any;
    usableFactors: string[];
    tone: string;
    brandName: string;
    phone: string;
  }) => `Generate a personalized SMS for this property owner:

PROPERTY: ${context.propertyContext.address}
OWNER FIRST NAME: ${context.ownerContext.firstName}
TONE: ${context.tone}
BRAND/YOUR NAME: ${context.brandName}

Generate ONLY the SMS message text. Keep it under 300 characters total including the opt-out.`
};
```

---

## 7. Sales Intelligence Report

### Report Generator Service

```typescript
// lib/ai/reports/sales-report-generator.ts

import Anthropic from '@anthropic-ai/sdk';
import { Lead } from '@/types/crm';
import { Property } from '@/types/property';
import { Valuation } from '@/types/valuation';
import { filterFactorsForChannel } from '../outreach/sensitivity-config';
import { calculateOfferTiers } from '../offers/offer-calculator';

const anthropic = new Anthropic();

export interface SalesIntelligenceReport {
  // Section 1: Owner Profile
  ownerProfile: {
    name: string;
    phones: Array<{ number: string; type: string; verified: boolean }>;
    emails: Array<{ address: string; verified: boolean }>;
    currentAddress: string;
    ownerType: string;
    ownershipLength: number;
  };
  
  // Section 2: Property Snapshot
  propertySnapshot: {
    address: string;
    type: string;
    beds: number;
    baths: number;
    sqft: number;
    yearBuilt: number;
    lotSize: number;
    lastSale: { date: string; price: number };
    estimatedValue: number;
    estimatedEquity: number;
    estimatedEquityPercent: number;
  };
  
  // Section 3: Motivation Analysis
  motivationAnalysis: {
    overallScore: number;
    scoreLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    factors: Array<{
      factor: string;
      weight: number;
      isSensitive: boolean;
      displayText: string;
      doNotMention: boolean;   // For caller guidance
      notes: string;
    }>;
  };
  
  // Section 4: Conversation Guide
  conversationGuide: {
    talkingPoints: string[];           // Safe to bring up
    listenFor: string[];               // Don't bring up, but note if mentioned
    avoid: string[];                   // Never mention
    suggestedOpener: string;
  };
  
  // Section 5: Deal Analysis & Offer Strategy
  offerStrategy: {
    arvEstimate: number;
    arvConfidence: 'high' | 'medium' | 'low';
    repairEstimate: number;
    repairBreakdown: Record<string, number>;
    tiers: {
      optimal: { price: number; margin: number; rationale: string };
      target: { price: number; margin: number; rationale: string };
      maximum: { price: number; margin: number; rationale: string };
      walkAway: { price: number; rationale: string };
    };
    negotiationTips: string[];
  };
  
  // Section 6: Comparables
  comparables: Array<{
    address: string;
    soldPrice: number;
    soldDate: string;
    beds: number;
    baths: number;
    sqft: number;
    condition: string;
    adjustment: number;
    adjustmentReason: string;
  }>;
  
  // Metadata
  generatedAt: Date;
  expiresAt: Date;
  modelUsed: string;
  tokensUsed: number;
}

export async function generateSalesIntelligenceReport(
  lead: Lead,
  property: Property,
  valuation: Valuation | null,
  userParams: {
    targetProfitMargin?: number;
    wholesaleFeeTarget?: number;
    holdingCostMonthly?: number;
  }
): Promise<SalesIntelligenceReport> {
  // Build motivation factors with sensitivity info
  const allFactors = buildDetailedMotivationFactors(lead, property);
  const factorsWithSensitivity = filterFactorsForChannel(allFactors, 'salesReport');
  
  // Calculate motivation score
  const { score, label } = calculateMotivationScore(factorsWithSensitivity);
  
  // Calculate offer tiers
  const arvEstimate = valuation?.estimate || property.estimatedValue || 0;
  const repairEstimate = estimateRepairs(property);
  const offerTiers = calculateOfferTiers({
    arv: arvEstimate,
    repairs: repairEstimate,
    targetProfitMargin: userParams.targetProfitMargin || 0.30,
    wholesaleFee: userParams.wholesaleFeeTarget || 10000,
    holdingCosts: (userParams.holdingCostMonthly || 1500) * 3
  });
  
  // Generate AI content for conversation guide
  const conversationGuide = await generateConversationGuide(
    lead, 
    property, 
    factorsWithSensitivity
  );
  
  // Build the full report
  const report: SalesIntelligenceReport = {
    ownerProfile: {
      name: lead.ownerName,
      phones: lead.phones.map(p => ({
        number: p.number,
        type: p.type,
        verified: p.verified
      })),
      emails: lead.emails.map(e => ({
        address: e.address,
        verified: e.verified
      })),
      currentAddress: formatAddress(lead.mailingAddress),
      ownerType: lead.ownerType,
      ownershipLength: calculateOwnershipYears(property.lastSaleDate)
    },
    
    propertySnapshot: {
      address: property.formattedAddress,
      type: property.propertyType || 'Single Family',
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      sqft: property.squareFootage || 0,
      yearBuilt: property.yearBuilt || 0,
      lotSize: property.lotSize || 0,
      lastSale: {
        date: property.lastSaleDate || 'Unknown',
        price: property.lastSalePrice || 0
      },
      estimatedValue: arvEstimate,
      estimatedEquity: calculateEquity(arvEstimate, property),
      estimatedEquityPercent: calculateEquityPercent(arvEstimate, property)
    },
    
    motivationAnalysis: {
      overallScore: score,
      scoreLabel: label,
      factors: factorsWithSensitivity.map(f => ({
        factor: f.factor,
        weight: f.weight,
        isSensitive: f.sensitivityLevel === 'forbidden' || f.sensitivityLevel === 'caution',
        displayText: f.displayText,
        doNotMention: f.sensitivityLevel === 'forbidden',
        notes: getFactorNotes(f)
      }))
    },
    
    conversationGuide,
    
    offerStrategy: {
      arvEstimate,
      arvConfidence: valuation ? 'high' : 'medium',
      repairEstimate: repairEstimate.total,
      repairBreakdown: repairEstimate.breakdown,
      tiers: offerTiers,
      negotiationTips: generateNegotiationTips(lead, property, offerTiers)
    },
    
    comparables: (valuation?.comparables || []).slice(0, 5).map(comp => ({
      address: comp.formattedAddress,
      soldPrice: comp.price,
      soldDate: comp.listedDate || comp.removedDate || 'Unknown',
      beds: comp.bedrooms || 0,
      baths: comp.bathrooms || 0,
      sqft: comp.squareFootage || 0,
      condition: 'Unknown',
      adjustment: calculateCompAdjustment(property, comp),
      adjustmentReason: getAdjustmentReason(property, comp)
    })),
    
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    modelUsed: 'claude-sonnet-4-5-20250929',
    tokensUsed: 0 // Will be updated after AI call
  };
  
  return report;
}

async function generateConversationGuide(
  lead: Lead,
  property: Property,
  factors: Array<{ factor: string; sensitivityLevel: string; [key: string]: any }>
): Promise<SalesIntelligenceReport['conversationGuide']> {
  const safeFac = factors.filter(f => f.sensitivityLevel === 'safe');
  const cautionFactors = factors.filter(f => f.sensitivityLevel === 'caution');
  const forbiddenFactors = factors.filter(f => f.sensitivityLevel === 'forbidden');
  
  // Build talking points from safe factors
  const talkingPoints: string[] = [];
  
  if (calculateOwnershipYears(property.lastSaleDate) >= 10) {
    talkingPoints.push(`"You've owned this property for over ${calculateOwnershipYears(property.lastSaleDate)} years—that's incredible."`);
  }
  
  if (lead.mailingAddress?.state !== property.state) {
    talkingPoints.push(`"Managing a property from ${lead.mailingAddress?.state} must have its challenges."`);
  }
  
  talkingPoints.push(`"The ${property.city} market has changed a lot since ${new Date(property.lastSaleDate || '').getFullYear() || 'you purchased'}."`);
  talkingPoints.push('"I can close on your timeline—no rush, no pressure."');
  
  // Build "listen for" from caution/forbidden factors
  const listenFor: string[] = [];
  
  if (forbiddenFactors.some(f => f.factor === 'divorce')) {
    listenFor.push('Life changes: divorce, family situations, job relocation');
  }
  if (forbiddenFactors.some(f => f.factor === 'preForeclosure' || f.factor === 'taxDelinquent')) {
    listenFor.push('Financial stress: behind on payments, liens, repairs too costly');
  }
  if (cautionFactors.some(f => f.factor === 'codeViolations' || f.factor === 'vacant')) {
    listenFor.push('Property issues: tenant problems, vandalism, costly repairs');
  }
  listenFor.push('Timeline urgency: "need to sell fast," "want this handled"');
  
  // Build avoid list from forbidden factors
  const avoid: string[] = [
    'Any direct mention of divorce, tax issues, or financial problems',
    'Appearing to have "researched" their personal life'
  ];
  
  if (calculateEquityPercent(property.estimatedValue || 0, property) >= 70) {
    avoid.push('Lowball opening—high equity owner expects fair treatment');
  }
  
  // Generate suggested opener
  const firstName = lead.ownerName.split(/\s+/)[0];
  const suggestedOpener = `"Hi ${firstName}, this is [Name]. I'm a local investor in ${property.city}, and I noticed you own a property on ${property.addressLine1?.split(/\s+/).slice(1).join(' ') || 'your street'}. I wasn't sure if you'd ever considered selling, but I wanted to introduce myself in case it's something you'd explore down the road. Do you have a minute?"`;
  
  return {
    talkingPoints,
    listenFor,
    avoid,
    suggestedOpener
  };
}

// Helper functions
function buildDetailedMotivationFactors(lead: Lead, property: Property) {
  const factors: Array<{ factor: string; weight: number; displayText: string; value: any }> = [];
  
  // High weight factors
  if (lead.distressIndicators.divorce) {
    factors.push({ factor: 'divorce', weight: 25, displayText: 'Divorce filing (6 mo)', value: true });
  }
  if (lead.distressIndicators.preForeclosure) {
    factors.push({ factor: 'preForeclosure', weight: 30, displayText: 'Pre-foreclosure status', value: true });
  }
  if (lead.distressIndicators.probate) {
    factors.push({ factor: 'probate', weight: 25, displayText: 'Probate case', value: true });
  }
  
  // Medium weight factors
  if (lead.mailingAddress?.state !== property.state) {
    factors.push({ factor: 'outOfState', weight: 20, displayText: 'Out of state owner', value: lead.mailingAddress?.state });
  }
  if (!property.ownerOccupied) {
    factors.push({ factor: 'absentee', weight: 15, displayText: 'Absentee owner', value: true });
  }
  if (lead.distressIndicators.taxDelinquent) {
    factors.push({ 
      factor: 'taxDelinquent', 
      weight: 15, 
      displayText: `Tax delinquent (${lead.distressIndicators.taxDelinquentYears || '?'} yrs)`, 
      value: lead.distressIndicators.taxDelinquentYears 
    });
  }
  
  // Lower weight factors
  const equityPercent = calculateEquityPercent(property.estimatedValue || 0, property);
  if (equityPercent >= 50) {
    factors.push({ factor: 'highEquity', weight: 12, displayText: `High equity (${equityPercent}%)`, value: equityPercent });
  }
  
  const ownershipYears = calculateOwnershipYears(property.lastSaleDate);
  if (ownershipYears >= 10) {
    factors.push({ factor: 'longOwnership', weight: 8, displayText: `Long ownership (${ownershipYears} yrs)`, value: ownershipYears });
  }
  
  if (lead.distressIndicators.vacant) {
    factors.push({ factor: 'vacant', weight: 15, displayText: 'Vacant property', value: true });
  }
  
  if (lead.distressIndicators.codeViolations) {
    factors.push({ 
      factor: 'codeViolations', 
      weight: 10, 
      displayText: `Code violations (${lead.distressIndicators.codeViolationCount || '?'})`, 
      value: lead.distressIndicators.codeViolationCount 
    });
  }
  
  return factors;
}

function calculateMotivationScore(
  factors: Array<{ weight: number; [key: string]: any }>
): { score: number; label: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' } {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const score = Math.min(100, totalWeight);
  
  let label: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  if (score >= 80) label = 'VERY_HIGH';
  else if (score >= 60) label = 'HIGH';
  else if (score >= 40) label = 'MEDIUM';
  else label = 'LOW';
  
  return { score, label };
}

function calculateOwnershipYears(lastSaleDate: string | null): number {
  if (!lastSaleDate) return 0;
  const saleDate = new Date(lastSaleDate);
  const now = new Date();
  return Math.floor((now.getTime() - saleDate.getTime()) / (365 * 24 * 60 * 60 * 1000));
}

function calculateEquity(arv: number, property: Property): number {
  const yearsOwned = calculateOwnershipYears(property.lastSaleDate);
  const purchasePrice = property.lastSalePrice || 0;
  const estimatedPaidDown = Math.min(purchasePrice * 0.8, purchasePrice * 0.8 * (yearsOwned / 30));
  const estimatedBalance = Math.max(0, purchasePrice * 0.8 - estimatedPaidDown);
  return Math.max(0, arv - estimatedBalance);
}

function calculateEquityPercent(arv: number, property: Property): number {
  if (!arv) return 0;
  const equity = calculateEquity(arv, property);
  return Math.round((equity / arv) * 100);
}

function estimateRepairs(property: Property): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;
  
  const age = property.yearBuilt ? new Date().getFullYear() - property.yearBuilt : 30;
  
  // Roof: typically needs replacement every 20-25 years
  if (age > 20) {
    breakdown.roof = 8000;
    total += 8000;
  }
  
  // HVAC: typically needs replacement every 15-20 years
  if (age > 15) {
    breakdown.hvac = 5000;
    total += 5000;
  }
  
  // General cosmetic updates
  const sqft = property.squareFootage || 1500;
  breakdown.cosmetic = Math.round(sqft * 10); // $10/sqft for cosmetics
  total += breakdown.cosmetic;
  
  // Plumbing/electrical for older homes
  if (age > 40) {
    breakdown.plumbing = 3000;
    breakdown.electrical = 2500;
    total += 5500;
  }
  
  return { total, breakdown };
}

function formatAddress(addr: Lead['mailingAddress']): string {
  if (!addr) return 'Unknown';
  return `${addr.line1}, ${addr.city}, ${addr.state} ${addr.zip}`;
}

function getFactorNotes(factor: any): string {
  switch (factor.factor) {
    case 'divorce': return '🔇 DO NOT MENTION DIRECTLY';
    case 'preForeclosure': return '🔇 DO NOT MENTION';
    case 'probate': return '🔇 DO NOT MENTION';
    case 'taxDelinquent': return '🔇 DO NOT MENTION';
    case 'absentee': return '✅ Safe to discuss';
    case 'outOfState': return '✅ Safe to discuss ("managing from afar")';
    case 'highEquity': return 'Strong negotiating position';
    case 'longOwnership': return 'May have deferred maintenance';
    default: return '';
  }
}

function calculateCompAdjustment(subject: Property, comp: any): number {
  let adjustment = 0;
  
  // Size adjustment (~$50/sqft difference)
  const sqftDiff = (subject.squareFootage || 1500) - (comp.squareFootage || 1500);
  adjustment += Math.round(sqftDiff * 50);
  
  // Bed/bath adjustment
  const bedDiff = (subject.bedrooms || 3) - (comp.bedrooms || 3);
  adjustment += bedDiff * 5000;
  
  return adjustment;
}

function getAdjustmentReason(subject: Property, comp: any): string {
  const reasons: string[] = [];
  const adjustment = calculateCompAdjustment(subject, comp);
  
  if (Math.abs(adjustment) < 2000) return 'Very comparable';
  
  const sqftDiff = (comp.squareFootage || 1500) - (subject.squareFootage || 1500);
  if (Math.abs(sqftDiff) > 100) {
    reasons.push(sqftDiff > 0 ? 'larger' : 'smaller');
  }
  
  return reasons.length > 0 ? `Comp is ${reasons.join(', ')}` : 'Minor differences';
}

function generateNegotiationTips(
  lead: Lead, 
  property: Property, 
  tiers: any
): string[] {
  const tips: string[] = [];
  
  const equityPercent = calculateEquityPercent(property.estimatedValue || 0, property);
  
  if (equityPercent >= 70) {
    tips.push('High equity owner may expect closer to retail. Be prepared to justify discount with repair estimates.');
  }
  
  if (lead.distressIndicators.preForeclosure || lead.distressIndicators.taxDelinquent) {
    tips.push('Owner may be motivated by timeline. Emphasize quick, certain close.');
  }
  
  if (calculateOwnershipYears(property.lastSaleDate) >= 20) {
    tips.push('Long-term owner may have emotional attachment. Acknowledge their history with the property.');
  }
  
  if (lead.mailingAddress?.state !== property.state) {
    tips.push('Out-of-state owner values convenience. Emphasize handling everything remotely.');
  }
  
  tips.push('Start at optimal tier. Only move to target tier after genuine pushback.');
  tips.push('Never go above maximum tier without re-analyzing the deal.');
  
  return tips;
}
```

---

## 8. Tiered Offer Strategy Engine

### Offer Calculator

```typescript
// lib/ai/offers/offer-calculator.ts

export interface OfferCalculationInput {
  arv: number;                    // After Repair Value
  repairs: number;                // Estimated repair costs
  targetProfitMargin: number;     // e.g., 0.30 for 30%
  wholesaleFee: number;           // Target assignment fee
  holdingCosts: number;           // Total holding costs for flip period
  closingCosts?: number;          // Default 3% of ARV
}

export interface OfferTiers {
  optimal: {
    price: number;
    margin: number;
    marginPercent: number;
    rationale: string;
  };
  target: {
    price: number;
    margin: number;
    marginPercent: number;
    rationale: string;
  };
  maximum: {
    price: number;
    margin: number;
    marginPercent: number;
    rationale: string;
  };
  walkAway: {
    price: number;
    rationale: string;
  };
}

export function calculateOfferTiers(input: OfferCalculationInput): OfferTiers {
  const { arv, repairs, targetProfitMargin, wholesaleFee, holdingCosts } = input;
  const closingCosts = input.closingCosts ?? Math.round(arv * 0.03);
  
  // Standard 70% Rule: (ARV × 0.70) - Repairs = Max Offer
  const mao70Rule = Math.round(arv * 0.70 - repairs);
  
  // Calculate what a flipper needs to make their profit
  // ARV - Repairs - Holding - Closing - Flipper Profit = What flipper can pay
  const flipperProfit = Math.round(arv * targetProfitMargin);
  const flipperMaxPurchase = arv - repairs - holdingCosts - closingCosts - flipperProfit;
  
  // Our maximum is what flipper can pay minus our fee
  const ourMaximum = Math.round(flipperMaxPurchase - wholesaleFee);
  
  // Use the lower of 70% rule and calculated max
  const trueMax = Math.min(mao70Rule, ourMaximum);
  
  // Calculate tiers based on true max
  // Optimal: Start 15% below max for negotiation room
  const optimalPrice = Math.round(trueMax * 0.85);
  const optimalMargin = trueMax - optimalPrice + wholesaleFee;
  
  // Target: 7% below max
  const targetPrice = Math.round(trueMax * 0.93);
  const targetMargin = trueMax - targetPrice + wholesaleFee;
  
  // Maximum: At the limit
  const maximumPrice = trueMax;
  const maximumMargin = wholesaleFee; // Just our fee at this point
  
  // Walk away: Beyond this, the deal doesn't work
  const walkAwayPrice = Math.round(trueMax * 1.05);
  
  return {
    optimal: {
      price: optimalPrice,
      margin: optimalMargin,
      marginPercent: Math.round((optimalMargin / optimalPrice) * 100),
      rationale: 'First offer - test the waters with maximum negotiation room'
    },
    target: {
      price: targetPrice,
      margin: targetMargin,
      marginPercent: Math.round((targetMargin / targetPrice) * 100),
      rationale: 'After pushback - still profitable with solid margin'
    },
    maximum: {
      price: maximumPrice,
      margin: maximumMargin,
      marginPercent: Math.round((maximumMargin / maximumPrice) * 100),
      rationale: 'Competitive situation only - minimum acceptable profit'
    },
    walkAway: {
      price: walkAwayPrice,
      rationale: 'Above this price, the numbers do not work. Walk away.'
    }
  };
}

export function formatOfferTiersForDisplay(tiers: OfferTiers): string {
  return `
TIERED OFFER STRATEGY
━━━━━━━━━━━━━━━━━━━━━

🎯 OPTIMAL: $${tiers.optimal.price.toLocaleString()}
   Margin: $${tiers.optimal.margin.toLocaleString()} (${tiers.optimal.marginPercent}%)
   Use: ${tiers.optimal.rationale}

📊 TARGET: $${tiers.target.price.toLocaleString()}
   Margin: $${tiers.target.margin.toLocaleString()} (${tiers.target.marginPercent}%)
   Use: ${tiers.target.rationale}

⚠️ MAXIMUM: $${tiers.maximum.price.toLocaleString()}
   Margin: $${tiers.maximum.margin.toLocaleString()} (${tiers.maximum.marginPercent}%)
   Use: ${tiers.maximum.rationale}

🚫 WALK AWAY: $${tiers.walkAway.price.toLocaleString()}+
   ${tiers.walkAway.rationale}
`.trim();
}
```

---

## 9. Unified Communication Inbox

### Message Service

```typescript
// lib/communication/message-service.ts

import { createClient } from '@/lib/supabase/server';

export type MessageChannel = 'sms' | 'email' | 'voicemail';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked' | 'bounced' | 'spam';

export interface Message {
  id: string;
  userId: string;
  leadId: string | null;
  threadId: string | null;
  
  channel: MessageChannel;
  direction: MessageDirection;
  
  fromAddress: string;
  toAddress: string;
  
  subject: string | null;
  body: string;
  bodyHtml: string | null;
  
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  
  status: MessageStatus;
  statusUpdatedAt: Date | null;
  
  externalId: string | null;
  externalProvider: string | null;
  
  isAiGenerated: boolean;
  aiTemplateId: string | null;
  originalAiDraft: string | null;
  
  isRead: boolean;
  readAt: Date | null;
  
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Thread {
  id: string;
  leadId: string;
  messages: Message[];
  lastMessageAt: Date;
  unreadCount: number;
}

export async function getInboxMessages(
  userId: string,
  params: {
    channel?: MessageChannel;
    leadId?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ messages: Message[]; total: number }> {
  const supabase = createClient();
  
  let query = supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (params.channel) query = query.eq('channel', params.channel);
  if (params.leadId) query = query.eq('lead_id', params.leadId);
  if (params.isRead !== undefined) query = query.eq('is_read', params.isRead);
  
  if (params.limit) query = query.limit(params.limit);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    messages: (data || []).map(mapMessageFromDb),
    total: count || 0
  };
}

export async function getThreadsForLead(
  userId: string,
  leadId: string
): Promise<Thread[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  // Group by thread_id
  const threadMap = new Map<string, Message[]>();
  
  for (const msg of data || []) {
    const threadId = msg.thread_id || msg.id; // Use message ID if no thread
    if (!threadMap.has(threadId)) {
      threadMap.set(threadId, []);
    }
    threadMap.get(threadId)!.push(mapMessageFromDb(msg));
  }
  
  // Convert to Thread objects
  const threads: Thread[] = [];
  for (const [threadId, messages] of threadMap) {
    threads.push({
      id: threadId,
      leadId,
      messages,
      lastMessageAt: messages[messages.length - 1].createdAt,
      unreadCount: messages.filter(m => !m.isRead && m.direction === 'inbound').length
    });
  }
  
  // Sort by last message
  threads.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  
  return threads;
}

export async function sendMessage(params: {
  userId: string;
  leadId: string;
  channel: MessageChannel;
  toAddress: string;
  subject?: string;
  body: string;
  isAiGenerated?: boolean;
  aiTemplateId?: string;
  originalAiDraft?: string;
}): Promise<Message> {
  const supabase = createClient();
  
  // Get user's from address
  const fromAddress = params.channel === 'sms' 
    ? process.env.TWILIO_PHONE_NUMBER!
    : process.env.SENDGRID_FROM_EMAIL!;
  
  // Create message record
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      user_id: params.userId,
      lead_id: params.leadId,
      channel: params.channel,
      direction: 'outbound',
      from_address: fromAddress,
      to_address: params.toAddress,
      subject: params.subject,
      body: params.body,
      status: 'queued',
      is_ai_generated: params.isAiGenerated || false,
      ai_template_id: params.aiTemplateId,
      original_ai_draft: params.originalAiDraft
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Send via appropriate provider
  try {
    let externalId: string;
    
    if (params.channel === 'sms') {
      externalId = await sendSms(params.toAddress, params.body);
    } else {
      externalId = await sendEmail(params.toAddress, params.subject || '', params.body);
    }
    
    // Update with external ID and sent status
    await supabase
      .from('messages')
      .update({
        external_id: externalId,
        external_provider: params.channel === 'sms' ? 'twilio' : 'sendgrid',
        status: 'sent',
        status_updated_at: new Date().toISOString()
      })
      .eq('id', message.id);
    
  } catch (sendError) {
    // Update with failed status
    await supabase
      .from('messages')
      .update({
        status: 'failed',
        status_updated_at: new Date().toISOString(),
        metadata: { error: (sendError as Error).message }
      })
      .eq('id', message.id);
    
    throw sendError;
  }
  
  // Log activity
  await supabase.from('activities').insert({
    user_id: params.userId,
    lead_id: params.leadId,
    type: params.channel === 'sms' ? 'sms_sent' : 'email_sent',
    subject: params.subject,
    body: params.body,
    channel: params.channel,
    direction: 'outbound',
    is_ai_generated: params.isAiGenerated || false
  });
  
  return mapMessageFromDb({ ...message, status: 'sent' });
}

async function sendSms(to: string, body: string): Promise<string> {
  // Twilio integration
  const twilio = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  const message = await twilio.messages.create({
    body,
    to,
    from: process.env.TWILIO_PHONE_NUMBER
  });
  
  return message.sid;
}

async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  // SendGrid integration
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const response = await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>')
  });
  
  return response[0].headers['x-message-id'];
}

function mapMessageFromDb(data: any): Message {
  return {
    id: data.id,
    userId: data.user_id,
    leadId: data.lead_id,
    threadId: data.thread_id,
    channel: data.channel,
    direction: data.direction,
    fromAddress: data.from_address,
    toAddress: data.to_address,
    subject: data.subject,
    body: data.body,
    bodyHtml: data.body_html,
    attachments: data.attachments || [],
    status: data.status,
    statusUpdatedAt: data.status_updated_at ? new Date(data.status_updated_at) : null,
    externalId: data.external_id,
    externalProvider: data.external_provider,
    isAiGenerated: data.is_ai_generated,
    aiTemplateId: data.ai_template_id,
    originalAiDraft: data.original_ai_draft,
    isRead: data.is_read,
    readAt: data.read_at ? new Date(data.read_at) : null,
    metadata: data.metadata || {},
    createdAt: new Date(data.created_at)
  };
}
```

---

## 10. Workflow Automation Engine

### Workflow Executor

```typescript
// lib/workflows/workflow-executor.ts

import { createClient } from '@/lib/supabase/server';
import { sendMessage } from '@/lib/communication/message-service';
import { updateLeadStatus, logActivity } from '@/lib/crm/lead-service';

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  triggerType: 'new_lead' | 'status_change' | 'no_response' | 'property_match' | 'schedule' | 'manual';
  triggerConfig: Record<string, any>;
  conditions: Array<{ field: string; operator: string; value: any }> | null;
  actions: WorkflowAction[];
  isActive: boolean;
}

export interface WorkflowAction {
  type: 'send_sms' | 'send_email' | 'add_tag' | 'remove_tag' | 
        'update_status' | 'create_task' | 'assign_user' | 'webhook';
  config: Record<string, any>;
  delayMinutes?: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  leadId: string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  actionsCompleted: number;
  actionsFailed: number;
  actionResults: Array<{ action: string; status: string; result?: any; error?: string }>;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

export async function executeWorkflow(
  workflow: Workflow,
  leadId: string,
  context: Record<string, any> = {}
): Promise<WorkflowExecution> {
  const supabase = createClient();
  
  // Create execution record
  const { data: execution, error: createError } = await supabase
    .from('workflow_executions')
    .insert({
      workflow_id: workflow.id,
      lead_id: leadId,
      status: 'running',
      actions_completed: 0,
      actions_failed: 0,
      action_results: []
    })
    .select()
    .single();
  
  if (createError) throw createError;
  
  // Get lead data
  const { data: lead } = await supabase
    .from('leads')
    .select('*, property:properties(*)')
    .eq('id', leadId)
    .single();
  
  if (!lead) {
    await updateExecutionStatus(execution.id, 'failed', 'Lead not found');
    throw new Error('Lead not found');
  }
  
  // Check conditions
  if (workflow.conditions && !checkConditions(lead, workflow.conditions)) {
    await updateExecutionStatus(execution.id, 'completed', 'Conditions not met');
    return mapExecutionFromDb({ ...execution, status: 'completed' });
  }
  
  // Execute actions
  const actionResults: WorkflowExecution['actionResults'] = [];
  let actionsCompleted = 0;
  let actionsFailed = 0;
  
  for (const action of workflow.actions) {
    // Handle delay
    if (action.delayMinutes && action.delayMinutes > 0) {
      // For now, skip delayed actions (would need job queue in production)
      // In production: schedule job for later execution
      continue;
    }
    
    try {
      const result = await executeAction(action, lead, workflow.userId, context);
      actionResults.push({ action: action.type, status: 'success', result });
      actionsCompleted++;
    } catch (error) {
      actionResults.push({ 
        action: action.type, 
        status: 'failed', 
        error: (error as Error).message 
      });
      actionsFailed++;
    }
  }
  
  // Update execution record
  const finalStatus = actionsFailed > 0 && actionsCompleted === 0 ? 'failed' : 'completed';
  
  await supabase
    .from('workflow_executions')
    .update({
      status: finalStatus,
      actions_completed: actionsCompleted,
      actions_failed: actionsFailed,
      action_results: actionResults,
      completed_at: new Date().toISOString()
    })
    .eq('id', execution.id);
  
  // Update workflow stats
  await supabase
    .from('workflows')
    .update({
      times_triggered: workflow.timesTriggered + 1,
      last_triggered_at: new Date().toISOString()
    })
    .eq('id', workflow.id);
  
  return {
    id: execution.id,
    workflowId: workflow.id,
    leadId,
    status: finalStatus,
    actionsCompleted,
    actionsFailed,
    actionResults,
    errorMessage: null,
    startedAt: new Date(execution.started_at),
    completedAt: new Date()
  };
}

async function executeAction(
  action: WorkflowAction,
  lead: any,
  userId: string,
  context: Record<string, any>
): Promise<any> {
  const supabase = createClient();
  
  switch (action.type) {
    case 'send_sms': {
      const primaryPhone = lead.phones?.find((p: any) => p.isPrimary) || lead.phones?.[0];
      if (!primaryPhone) throw new Error('No phone number available');
      
      // Get template or use config body
      let body = action.config.body;
      if (action.config.templateId) {
        const { data: template } = await supabase
          .from('message_templates')
          .select('body')
          .eq('id', action.config.templateId)
          .single();
        body = template?.body || body;
      }
      
      // Replace variables
      body = replaceVariables(body, lead);
      
      await sendMessage({
        userId,
        leadId: lead.id,
        channel: 'sms',
        toAddress: primaryPhone.number,
        body
      });
      
      return { sent: true, to: primaryPhone.number };
    }
    
    case 'send_email': {
      const primaryEmail = lead.emails?.find((e: any) => e.isPrimary) || lead.emails?.[0];
      if (!primaryEmail) throw new Error('No email available');
      
      let subject = action.config.subject;
      let body = action.config.body;
      
      if (action.config.templateId) {
        const { data: template } = await supabase
          .from('message_templates')
          .select('subject, body')
          .eq('id', action.config.templateId)
          .single();
        subject = template?.subject || subject;
        body = template?.body || body;
      }
      
      subject = replaceVariables(subject, lead);
      body = replaceVariables(body, lead);
      
      await sendMessage({
        userId,
        leadId: lead.id,
        channel: 'email',
        toAddress: primaryEmail.address,
        subject,
        body
      });
      
      return { sent: true, to: primaryEmail.address };
    }
    
    case 'add_tag': {
      const currentTags = lead.tags || [];
      if (!currentTags.includes(action.config.tag)) {
        await supabase
          .from('leads')
          .update({ tags: [...currentTags, action.config.tag] })
          .eq('id', lead.id);
      }
      return { tag: action.config.tag, added: true };
    }
    
    case 'remove_tag': {
      const tags = (lead.tags || []).filter((t: string) => t !== action.config.tag);
      await supabase
        .from('leads')
        .update({ tags })
        .eq('id', lead.id);
      return { tag: action.config.tag, removed: true };
    }
    
    case 'update_status': {
      await updateLeadStatus(lead.id, userId, action.config.status);
      return { newStatus: action.config.status };
    }
    
    case 'create_task': {
      const dueDate = action.config.dueHours 
        ? new Date(Date.now() + action.config.dueHours * 60 * 60 * 1000)
        : null;
      
      await logActivity({
        userId,
        leadId: lead.id,
        type: 'note_added',
        subject: `Task: ${action.config.title}`,
        body: action.config.description,
        channel: 'system',
        direction: 'internal',
        metadata: { isTask: true, dueDate }
      });
      
      // Update lead's next follow-up
      if (dueDate) {
        await supabase
          .from('leads')
          .update({ next_follow_up: dueDate.toISOString() })
          .eq('id', lead.id);
      }
      
      return { task: action.config.title, dueDate };
    }
    
    case 'assign_user': {
      await supabase
        .from('leads')
        .update({ assigned_to: action.config.userId })
        .eq('id', lead.id);
      return { assignedTo: action.config.userId };
    }
    
    case 'webhook': {
      const response = await fetch(action.config.url, {
        method: action.config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(action.config.headers || {})
        },
        body: JSON.stringify({
          lead,
          trigger: context.trigger,
          timestamp: new Date().toISOString()
        })
      });
      
      return { status: response.status, ok: response.ok };
    }
    
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

function checkConditions(
  lead: any, 
  conditions: Array<{ field: string; operator: string; value: any }>
): boolean {
  for (const condition of conditions) {
    const fieldValue = getNestedValue(lead, condition.field);
    
    switch (condition.operator) {
      case 'eq':
        if (fieldValue !== condition.value) return false;
        break;
      case 'neq':
        if (fieldValue === condition.value) return false;
        break;
      case 'gt':
        if (!(fieldValue > condition.value)) return false;
        break;
      case 'gte':
        if (!(fieldValue >= condition.value)) return false;
        break;
      case 'lt':
        if (!(fieldValue < condition.value)) return false;
        break;
      case 'lte':
        if (!(fieldValue <= condition.value)) return false;
        break;
      case 'in':
        if (!condition.value.includes(fieldValue)) return false;
        break;
      case 'contains':
        if (!fieldValue?.includes?.(condition.value)) return false;
        break;
    }
  }
  
  return true;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function replaceVariables(text: string, lead: any): string {
  const variables: Record<string, string> = {
    '{{firstName}}': lead.owner_name?.split(/\s+/)[0] || 'there',
    '{{lastName}}': lead.owner_name?.split(/\s+/).slice(1).join(' ') || '',
    '{{ownerName}}': lead.owner_name || 'Property Owner',
    '{{propertyAddress}}': lead.property?.formatted_address || 'your property',
    '{{propertyCity}}': lead.property?.city || '',
    '{{propertyState}}': lead.property?.state || ''
  };
  
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  
  return result;
}

async function updateExecutionStatus(
  executionId: string, 
  status: string, 
  errorMessage?: string
) {
  const supabase = createClient();
  
  await supabase
    .from('workflow_executions')
    .update({
      status,
      error_message: errorMessage,
      completed_at: new Date().toISOString()
    })
    .eq('id', executionId);
}

function mapExecutionFromDb(data: any): WorkflowExecution {
  return {
    id: data.id,
    workflowId: data.workflow_id,
    leadId: data.lead_id,
    status: data.status,
    actionsCompleted: data.actions_completed,
    actionsFailed: data.actions_failed,
    actionResults: data.action_results || [],
    errorMessage: data.error_message,
    startedAt: new Date(data.started_at),
    completedAt: data.completed_at ? new Date(data.completed_at) : null
  };
}
```

---

## 11. AI System Prompts - Outreach & Analysis

These prompts are in addition to the system prompts in the main Definitive Plan V2.

```typescript
// lib/ai/prompts/crm-prompts.ts

export const CRM_SYSTEM_PROMPTS = {
  MOTIVATION_ANALYZER: `You are an expert real estate investment analyst specializing in identifying motivated sellers.

Your task is to analyze property and owner data to calculate a motivation score and identify key factors.

SCORING WEIGHTS:
- Pre-foreclosure: +30
- Divorce filing: +25
- Probate: +25
- Out-of-state owner: +20
- Absentee owner: +15
- Tax delinquent: +15 (per year, max 30)
- High equity (50%+): +12
- Vacant property: +15
- Code violations: +10
- Long ownership (10+ years): +8

RULES:
1. Calculate total score (0-100 scale, cap at 100)
2. List ALL factors with their weights
3. Mark sensitive factors (divorce, death, foreclosure, bankruptcy, tax issues) with isSensitive: true
4. Provide a brief rationale for the overall score
5. Suggest best outreach approach based on factors

Return JSON format:
{
  "score": number,
  "label": "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH",
  "factors": [
    {"factor": string, "weight": number, "isSensitive": boolean, "displayText": string}
  ],
  "rationale": string,
  "recommendedApproach": string
}`,

  NEGOTIATION_ADVISOR: `You are an expert real estate negotiation coach helping wholesalers prepare for seller conversations.

Based on the property data, owner situation, and offer strategy provided, generate:

1. TALKING POINTS (3-5): Safe topics to discuss that build rapport
2. LISTEN FOR (3-5): Things the seller might mention that indicate motivation (without directly asking)
3. AVOID (3-5): Topics that should never be brought up
4. OBJECTION RESPONSES: Common objections and how to handle them
5. CLOSING TECHNIQUES: Appropriate ways to move toward agreement

CRITICAL RULES:
- Never suggest mentioning divorce, death, foreclosure, or financial distress
- Focus on convenience, speed, and certainty over price
- Always maintain ethical, non-manipulative approach
- Tailor advice to the specific situation

Return JSON format:
{
  "talkingPoints": string[],
  "listenFor": string[],
  "avoid": string[],
  "objectionResponses": [{"objection": string, "response": string}],
  "closingTechniques": string[]
}`,

  COMP_ANALYZER: `You are an expert real estate appraiser analyzing comparable sales for ARV estimation.

Given a subject property and potential comparables, analyze and adjust each comp to estimate the subject's ARV.

ADJUSTMENT GUIDELINES:
- Size: ~$50-75/sqft difference
- Bedrooms: ~$5,000-10,000 per bedroom
- Bathrooms: ~$3,000-7,000 per bathroom
- Age: ~$1,000-2,000 per decade
- Condition: ~10-20% for major condition differences
- Location: ~5-15% for neighborhood quality differences

RULES:
1. Select the 3-5 most relevant comps
2. Explain why each comp was selected
3. Calculate adjustments with reasoning
4. Provide confidence level based on comp quality
5. Note any data quality concerns

Return JSON format:
{
  "adjustedComps": [
    {
      "address": string,
      "soldPrice": number,
      "adjustments": [{"reason": string, "amount": number}],
      "adjustedValue": number
    }
  ],
  "arvEstimate": number,
  "arvRange": {"low": number, "high": number},
  "confidence": "high" | "medium" | "low",
  "notes": string
}`
};
```

---

## 12. API Routes

### CRM API Routes

```typescript
// app/api/crm/leads/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLeadsForUser, createLead } from '@/lib/crm/lead-service';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  
  const result = await getLeadsForUser(user.id, {
    status: searchParams.get('status') as any,
    tags: searchParams.get('tags')?.split(','),
    minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') as any,
    sortOrder: searchParams.get('sortOrder') as any,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
  });
  
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  try {
    const lead = await createLead({
      userId: user.id,
      propertyId: body.propertyId,
      ownerName: body.ownerName,
      ownerType: body.ownerType,
      mailingAddress: body.mailingAddress,
      source: body.source,
      sourceFilterId: body.sourceFilterId,
      tags: body.tags
    });
    
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 400 }
    );
  }
}
```

```typescript
// app/api/crm/leads/[id]/outreach/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLeadById } from '@/lib/crm/lead-service';
import { getPropertyById } from '@/lib/rentcast/rentcast-service';
import { generateOutreach } from '@/lib/ai/outreach/outreach-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { channel, tone } = body;
  
  // Get lead
  const lead = await getLeadById(params.id, user.id);
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  
  // Get property
  const property = lead.propertyId 
    ? await getPropertyById(lead.propertyId)
    : null;
  
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }
  
  // Get user preferences
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Generate outreach
  const outreach = await generateOutreach({
    lead,
    property,
    channel,
    tone: tone || 'friendly',
    userBrandName: userPrefs?.brand_name,
    userPhone: userPrefs?.phone
  });
  
  // Cache the draft
  const cacheField = channel === 'email' ? 'cached_email_draft' : 'cached_sms_draft';
  await supabase
    .from('leads')
    .update({
      [cacheField]: {
        ...outreach,
        generatedAt: new Date().toISOString()
      }
    })
    .eq('id', params.id);
  
  return NextResponse.json(outreach);
}
```

```typescript
// app/api/crm/leads/[id]/sales-report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLeadById } from '@/lib/crm/lead-service';
import { getPropertyById } from '@/lib/rentcast/rentcast-service';
import { getValuationByPropertyId } from '@/lib/rentcast/valuation-service';
import { generateSalesIntelligenceReport } from '@/lib/ai/reports/sales-report-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check for cached report
  const { data: cachedReport } = await supabase
    .from('sales_reports')
    .select('*')
    .eq('lead_id', params.id)
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (cachedReport) {
    return NextResponse.json(cachedReport.report_data);
  }
  
  // Generate new report
  const lead = await getLeadById(params.id, user.id);
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  
  const property = lead.propertyId 
    ? await getPropertyById(lead.propertyId)
    : null;
  
  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }
  
  const valuation = lead.propertyId
    ? await getValuationByPropertyId(lead.propertyId, 'value')
    : null;
  
  // Get user preferences for calculations
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('target_profit_margin, default_repair_percent, holding_cost_per_month')
    .eq('user_id', user.id)
    .single();
  
  const report = await generateSalesIntelligenceReport(
    lead,
    property,
    valuation,
    {
      targetProfitMargin: userPrefs?.target_profit_margin,
      wholesaleFeeTarget: 10000,
      holdingCostMonthly: userPrefs?.holding_cost_per_month
    }
  );
  
  // Cache the report
  await supabase.from('sales_reports').insert({
    user_id: user.id,
    lead_id: params.id,
    property_id: lead.propertyId,
    report_data: report,
    ai_model_used: report.modelUsed,
    tokens_used: report.tokensUsed
  });
  
  return NextResponse.json(report);
}
```

---

## 13. Component Architecture

### Key Components

```
components/
├── crm/
│   ├── LeadList.tsx                    # Main lead list view
│   ├── LeadListItem.tsx                # Individual lead row
│   ├── LeadDetailDrawer.tsx            # Slide-out lead details
│   ├── LeadStatusBadge.tsx             # Status indicator
│   ├── LeadTimeline.tsx                # Activity timeline
│   ├── PipelineKanban.tsx              # Kanban view of pipeline
│   └── PipelineColumn.tsx              # Single kanban column
│
├── property/
│   ├── PropertyCardIntelligenceHub.tsx # Enhanced property card
│   ├── MotivationIndicators.tsx        # Motivation factor display
│   ├── QuickActionsBar.tsx             # Email/SMS/Call/Report buttons
│   └── PropertyCompactCard.tsx         # Minimal property display
│
├── outreach/
│   ├── OutreachModal.tsx               # Generate/edit/send modal
│   ├── OutreachPreview.tsx             # Preview generated content
│   ├── OutreachEditor.tsx              # Rich text editor for drafts
│   ├── TemplateSelector.tsx            # Choose from templates
│   └── SensitivityWarning.tsx          # Alert for sensitive omissions
│
├── reports/
│   ├── SalesReportDrawer.tsx           # Full sales intelligence report
│   ├── OwnerProfileSection.tsx         # Owner info section
│   ├── MotivationAnalysisSection.tsx   # Score + factors
│   ├── ConversationGuideSection.tsx    # Talking points, avoid, etc.
│   ├── OfferStrategySection.tsx        # Tiered offers
│   └── ComparablesSection.tsx          # Comp analysis
│
├── offers/
│   ├── OfferStrategyPanel.tsx          # Tiered offer display
│   ├── OfferTierCard.tsx               # Single tier card
│   ├── OfferCalculator.tsx             # Manual calculation tool
│   └── NegotiationTips.tsx             # AI-generated tips
│
├── inbox/
│   ├── UnifiedInbox.tsx                # Main inbox view
│   ├── InboxSidebar.tsx                # Lead list / filters
│   ├── ConversationThread.tsx          # Message thread view
│   ├── MessageBubble.tsx               # Individual message
│   ├── ComposeMessage.tsx              # New message composer
│   └── InboxFilters.tsx                # Channel/read filters
│
├── workflows/
│   ├── WorkflowList.tsx                # List of workflows
│   ├── WorkflowBuilder.tsx             # Visual workflow editor
│   ├── TriggerConfig.tsx               # Trigger configuration
│   ├── ActionConfig.tsx                # Action configuration
│   └── WorkflowExecutionLog.tsx        # Execution history
│
└── shared/
    ├── ActivityIcon.tsx                # Icon for activity types
    ├── ChannelIcon.tsx                 # SMS/Email/Phone icons
    └── RelativeTime.tsx                # "2 hours ago" display
```

---

## 14. Integration with Main Platform

### Connection Points

This CRM specification integrates with the main Definitive Plan V2 at these points:

| Main Platform Component | CRM Integration |
|------------------------|-----------------|
| Property Search Results | "Add to CRM" button creates lead |
| Property Card | Extends to Sales Intelligence Hub |
| Deal Pipeline (existing) | Maps to CRM lead statuses |
| Skip Tracing Service | Enriches lead contact data |
| Notifications System | Workflow triggers, follow-up reminders |
| AI Chat Interface | Can query leads, generate outreach via chat |
| User Preferences | Stores brand name, phone, deal parameters |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW INTEGRATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PROPERTY SEARCH                                                           │
│        │                                                                    │
│        ├──→ User clicks "Add to CRM"                                       │
│        │         │                                                          │
│        │         ▼                                                          │
│        │    CREATE LEAD ──→ leads table                                    │
│        │         │                                                          │
│        ▼         │                                                          │
│   PROPERTY CARD  │                                                          │
│        │         │                                                          │
│        ├──→ Skip Trace ──→ UPDATE lead.phones, lead.emails                 │
│        │         │                                                          │
│        ├──→ Generate Outreach ──→ AI generates ──→ User sends              │
│        │         │                       │                                  │
│        │         │                       ▼                                  │
│        │         │              messages table + activities table           │
│        │         │                                                          │
│        ├──→ Sales Report ──→ AI generates ──→ sales_reports table          │
│        │         │                                                          │
│        └──→ Make Offer ──→ offer_strategies table                          │
│                  │                                                          │
│                  ▼                                                          │
│         WORKFLOW TRIGGERS                                                   │
│                  │                                                          │
│                  ├──→ status_change ──→ Execute workflow actions           │
│                  ├──→ no_response ──→ Auto follow-up                       │
│                  └──→ new_lead ──→ Welcome sequence                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Implementation Timeline

This timeline assumes main platform development is progressing in parallel per the Definitive Plan V2. CRM development begins in Phase 2 (Weeks 5+).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CRM IMPLEMENTATION TIMELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2A: CRM FOUNDATION (Weeks 5-6)                                      │
│  ═══════════════════════════════════════                                   │
│  Week 5:                                                                   │
│  • Database schema deployment (leads, activities, messages tables)         │
│  • Lead service CRUD operations                                            │
│  • Activity logging service                                                │
│  • Lead list component + filters                                           │
│                                                                            │
│  Week 6:                                                                   │
│  • Pipeline Kanban view                                                    │
│  • Lead detail drawer                                                      │
│  • Status management                                                       │
│  • Basic search/filter functionality                                       │
│                                                                            │
│  DELIVERABLES:                                                             │
│  ✓ Working CRM with lead management                                        │
│  ✓ Activity timeline per lead                                              │
│  ✓ Pipeline visualization                                                  │
│                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2B: OUTREACH GENERATION (Weeks 7-8)                                 │
│  ═════════════════════════════════════════                                 │
│  Week 7:                                                                   │
│  • Sensitivity configuration system                                        │
│  • AI outreach generator (email)                                           │
│  • AI outreach generator (SMS)                                             │
│  • Outreach modal component                                                │
│                                                                            │
│  Week 8:                                                                   │
│  • Property Card Intelligence Hub upgrade                                  │
│  • One-click outreach generation                                           │
│  • Outreach preview/edit flow                                              │
│  • Integration with skip trace                                             │
│                                                                            │
│  DELIVERABLES:                                                             │
│  ✓ AI-generated email from property card                                   │
│  ✓ AI-generated SMS from property card                                     │
│  ✓ Sensitivity filtering working                                           │
│                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 2C: COMMUNICATION & OFFERS (Weeks 9-10)                             │
│  ═════════════════════════════════════════════                             │
│  Week 9:                                                                   │
│  • Twilio SMS integration                                                  │
│  • SendGrid email integration                                              │
│  • Unified inbox component                                                 │
│  • Message threading                                                       │
│                                                                            │
│  Week 10:                                                                  │
│  • Tiered offer calculator                                                 │
│  • Offer strategy panel                                                    │
│  • Sales Intelligence Report generator                                     │
│  • Sales Report drawer component                                           │
│                                                                            │
│  DELIVERABLES:                                                             │
│  ✓ Send SMS/email from platform                                            │
│  ✓ Unified inbox with threads                                              │
│  ✓ Full Sales Intelligence Reports                                         │
│  ✓ Tiered offer calculations                                               │
│                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 3: AUTOMATION (Weeks 11-12)                                         │
│  ══════════════════════════════════                                        │
│  Week 11:                                                                  │
│  • Workflow engine core                                                    │
│  • Trigger system (status change, schedule)                                │
│  • Action executors (SMS, email, tag, status)                              │
│  • Workflow execution logging                                              │
│                                                                            │
│  Week 12:                                                                  │
│  • Workflow builder UI                                                     │
│  • Template library (messages + workflows)                                 │
│  • Follow-up automation                                                    │
│  • No-response triggers                                                    │
│                                                                            │
│  DELIVERABLES:                                                             │
│  ✓ Create and manage workflows                                             │
│  ✓ Auto follow-up sequences                                                │
│  ✓ Trigger-based automations                                               │
│                                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 4: POLISH & INTEGRATION (Weeks 13-14)                               │
│  ═══════════════════════════════════════════                               │
│  Week 13:                                                                  │
│  • AI chat integration (query leads via chat)                              │
│  • Click-to-call functionality                                             │
│  • Mobile responsiveness for CRM                                           │
│  • Performance optimization                                                │
│                                                                            │
│  Week 14:                                                                  │
│  • Webhook integrations (inbound SMS/email)                                │
│  • Error handling & edge cases                                             │
│  • User documentation                                                      │
│  • Final QA and bug fixes                                                  │
│                                                                            │
│  DELIVERABLES:                                                             │
│  ✓ Complete CRM system production-ready                                    │
│  ✓ Full integration with main platform                                     │
│  ✓ Mobile-responsive CRM interface                                         │
│                                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Environment Variables - Additional

Add these to the existing environment variables from the main Definitive Plan V2:

```bash
# .env.local (additions)

# ===========================================
# TWILIO (SMS)
# ===========================================
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# ===========================================
# SENDGRID (Email)
# ===========================================
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@yourplatform.com
SENDGRID_FROM_NAME=Your Platform Name

# ===========================================
# WEBHOOK SECRETS
# ===========================================
TWILIO_WEBHOOK_SECRET=whsec_...
SENDGRID_WEBHOOK_SECRET=...
```

---

## Summary

This document provides the **complete specification** for the CRM and Sales Intelligence Hub features. Key highlights:

### Features Covered
- Full CRM with lead/activity management
- AI-generated outreach (email/SMS) with sensitivity filtering
- Sales Intelligence Reports with caller briefing
- Tiered offer strategy with negotiation guidance
- Unified communication inbox
- Workflow automation engine

### Technology Integration
- Uses same stack as main platform (Next.js, Supabase, Claude)
- Adds Twilio for SMS, SendGrid for email
- Extends existing database schema
- Integrates with existing AI infrastructure

### Key Differentiators
- Sensitivity-aware AI outreach (never mentions divorce, foreclosure, etc.)
- One-click outreach generation from property card
- Comprehensive Sales Intelligence Reports
- 3-4 tier offer strategies with rationale
- Full CRM-to-Communication tracking

This document, combined with the main Definitive Plan V2, provides everything needed to build the complete platform.
