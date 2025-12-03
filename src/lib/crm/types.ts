/**
 * CRM Lead Management Types
 */

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'engaged'
  | 'qualified'
  | 'offer_made'
  | 'negotiating'
  | 'under_contract'
  | 'closed'
  | 'lost';

export type LeadSource =
  | 'cold_call'
  | 'direct_mail'
  | 'online_ad'
  | 'referral'
  | 'driving_for_dollars'
  | 'probate'
  | 'tax_lien'
  | 'other';

export type ContactType = 'call' | 'email' | 'sms' | 'visit' | 'other';
export type ContactOutcome =
  | 'connected'
  | 'no_answer'
  | 'left_voicemail'
  | 'wrong_number'
  | 'callback_scheduled'
  | 'not_interested'
  | 'interested';

export interface Lead {
  id: string;
  user_id: string;
  property_address: string;
  owner_name?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  status: LeadStatus;
  source?: LeadSource | null;
  motivation_score?: number | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LeadList {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  list_type: 'static' | 'dynamic';
  filter_criteria?: Record<string, unknown> | null;
  lead_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LeadListItem {
  id: string;
  list_id: string;
  lead_id: string;
  added_at?: string | null;
}

export interface LeadContactHistory {
  id: string;
  lead_id: string;
  user_id: string;
  contact_type: ContactType;
  outcome?: ContactOutcome | null;
  notes?: string | null;
  follow_up_date?: string | null;
  created_at?: string | null;
}

export interface LeadWithDetails extends Lead {
  contact_history?: LeadContactHistory[];
  lists?: LeadList[];
  total_contacts?: number;
  last_contact_date?: string | null;
}

// Input types for CRUD operations
export interface CreateLeadInput {
  property_address: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  status?: LeadStatus;
  source?: LeadSource;
  motivation_score?: number;
  notes?: string;
}

export interface UpdateLeadInput {
  property_address?: string;
  owner_name?: string | null;
  owner_phone?: string | null;
  owner_email?: string | null;
  status?: LeadStatus;
  source?: LeadSource | null;
  motivation_score?: number | null;
  notes?: string | null;
}

export interface LeadListFilters {
  status?: LeadStatus;
  source?: LeadSource;
  min_motivation?: number;
  max_motivation?: number;
  search?: string;
  list_id?: string;
}

export interface CreateLeadListInput {
  name: string;
  description?: string;
  list_type: 'static' | 'dynamic';
  filter_criteria?: Record<string, unknown>;
}

export interface CreateContactHistoryInput {
  contact_type: ContactType;
  outcome?: ContactOutcome;
  notes?: string;
  follow_up_date?: string;
}

// Offer Strategy Types
export interface OfferStrategy {
  id: string;
  deal_id: string;
  user_id: string;
  optimal_price: number | null;
  target_price: number | null;
  maximum_price: number | null;
  walk_away_price: number | null;
  arv?: number | null;
  repair_estimate?: number | null;
  profit_margin?: number | null;
  market_factor?: number | null;
  strategy_reasoning?: string | null;
  negotiation_tips?: unknown[] | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateOfferStrategyInput {
  optimal_price: number;
  target_price: number;
  maximum_price: number;
  walk_away_price: number;
  arv?: number;
  repair_estimate?: number;
  profit_margin?: number;
  market_factor?: number;
  strategy_reasoning?: string;
  negotiation_tips?: string[];
}

// Sales Report Types
export type ReportType = 'caller_briefing' | 'property_analysis' | 'negotiation_guide';

export interface SalesReport {
  id: string;
  user_id: string;
  deal_id?: string | null;
  lead_id?: string | null;
  report_type: ReportType;
  title: string;
  content: Record<string, unknown>;
  generated_at?: string | null;
  expires_at?: string | null;
  is_archived?: boolean | null;
  created_at?: string | null;
}

export interface CreateSalesReportInput {
  deal_id?: string;
  lead_id?: string;
  report_type: ReportType;
  title?: string;
  content: Record<string, unknown>;
}
