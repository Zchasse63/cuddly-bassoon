/**
 * Deal Pipeline Types
 * Types for deal management, stages, and activities
 */

export type DealStage =
  | 'lead'
  | 'contacted'
  | 'appointment'
  | 'offer'
  | 'contract'
  | 'assigned'
  | 'closing'
  | 'closed'
  | 'lost';

export type DealStatus = 'active' | 'on_hold' | 'cancelled' | 'completed';

export type ActivityType = 'call' | 'email' | 'sms' | 'note' | 'stage_change' | 'meeting' | 'other';

export interface Deal {
  id: string;
  user_id: string;
  property_id?: string | null;
  property_address: string;
  stage: DealStage;
  status: DealStatus;
  seller_name?: string | null;
  seller_phone?: string | null;
  seller_email?: string | null;
  asking_price?: number | null;
  offer_price?: number | null;
  contract_price?: number | null;
  assignment_fee?: number | null;
  estimated_arv?: number | null;
  estimated_repairs?: number | null;
  assigned_buyer_id?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DealActivity {
  id: string;
  deal_id: string;
  user_id: string;
  activity_type: ActivityType;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface Offer {
  id: string;
  deal_id: string;
  offer_amount: number;
  offer_date: string;
  expiration_date?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'withdrawn';
  counter_amount?: number | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Extended deal with related data
export interface DealWithDetails extends Deal {
  activities?: DealActivity[];
  offers?: Offer[];
  assigned_buyer?: {
    id: string;
    name: string;
    company_name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  property?: {
    id: string;
    address: string;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    square_footage?: number | null;
  } | null;
  days_in_stage?: number;
}

// Input types for CRUD operations
export interface CreateDealInput {
  property_address: string;
  property_id?: string;
  stage?: DealStage;
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  asking_price?: number;
  offer_price?: number;
  estimated_arv?: number;
  estimated_repairs?: number;
  notes?: string;
}

export interface UpdateDealInput {
  property_address?: string;
  property_id?: string | null;
  stage?: DealStage;
  status?: DealStatus;
  seller_name?: string | null;
  seller_phone?: string | null;
  seller_email?: string | null;
  asking_price?: number | null;
  offer_price?: number | null;
  contract_price?: number | null;
  assignment_fee?: number | null;
  estimated_arv?: number | null;
  estimated_repairs?: number | null;
  assigned_buyer_id?: string | null;
  notes?: string | null;
}

export interface DealListFilters {
  stage?: DealStage;
  status?: DealStatus;
  search?: string;
  assigned_buyer_id?: string;
  min_value?: number;
  max_value?: number;
}

export interface CreateActivityInput {
  activity_type: ActivityType;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateOfferInput {
  offer_amount: number;
  offer_date: string;
  expiration_date?: string;
  notes?: string;
}

// Stage transition result
export interface StageTransitionResult {
  success: boolean;
  previousStage: DealStage;
  newStage: DealStage;
  reason?: string;
  requiresAction?: string;
}
