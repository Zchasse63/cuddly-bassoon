/**
 * CRM Lead Service
 * Business logic for lead CRUD operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  Lead,
  LeadWithDetails,
  CreateLeadInput,
  UpdateLeadInput,
  LeadListFilters,
  LeadStatus,
  LeadContactHistory,
  CreateContactHistoryInput,
} from './types';
import { isValidLeadTransition } from './lead-workflow';

export class LeadService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create a new lead
   */
  async createLead(userId: string, input: CreateLeadInput): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert({
        user_id: userId,
        property_address: input.property_address,
        owner_name: input.owner_name,
        owner_phone: input.owner_phone,
        owner_email: input.owner_email,
        status: input.status || 'new',
        source: input.source,
        motivation_score: input.motivation_score,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    return data as Lead;
  }

  /**
   * Get a lead by ID
   */
  async getLead(leadId: string, userId: string): Promise<LeadWithDetails | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get lead: ${error.message}`);
    }

    // Get contact history
    const { data: contacts } = await this.supabase
      .from('lead_contact_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      ...data,
      contact_history: (contacts || []) as LeadContactHistory[],
      total_contacts: contacts?.length || 0,
      last_contact_date: contacts?.[0]?.created_at || null,
    } as LeadWithDetails;
  }

  /**
   * List leads with filters
   */
  async listLeads(
    userId: string,
    filters: LeadListFilters = {},
    page = 1,
    limit = 25
  ): Promise<{ leads: LeadWithDetails[]; total: number }> {
    let query = this.supabase.from('leads').select('*', { count: 'exact' }).eq('user_id', userId);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    if (filters.min_motivation !== undefined) {
      query = query.gte('motivation_score', filters.min_motivation);
    }

    if (filters.max_motivation !== undefined) {
      query = query.lte('motivation_score', filters.max_motivation);
    }

    if (filters.search) {
      query = query.or(
        `property_address.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%`
      );
    }

    const offset = (page - 1) * limit;
    query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list leads: ${error.message}`);
    }

    return {
      leads: (data || []) as LeadWithDetails[],
      total: count || 0,
    };
  }

  /**
   * Update a lead
   */
  async updateLead(leadId: string, userId: string, input: UpdateLeadInput): Promise<Lead> {
    // Validate status transition if changing status
    if (input.status) {
      const current = await this.getLead(leadId, userId);
      if (!current) {
        throw new Error('Lead not found');
      }

      if (!isValidLeadTransition(current.status as LeadStatus, input.status)) {
        throw new Error(`Invalid status transition from ${current.status} to ${input.status}`);
      }
    }

    const { data, error } = await this.supabase
      .from('leads')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', leadId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    return data as Lead;
  }

  /**
   * Log contact with a lead
   */
  async logContact(
    leadId: string,
    userId: string,
    input: CreateContactHistoryInput
  ): Promise<LeadContactHistory> {
    const { data, error } = await this.supabase
      .from('lead_contact_history')
      .insert({
        lead_id: leadId,
        user_id: userId,
        contact_type: input.contact_type,
        outcome: input.outcome,
        notes: input.notes,
        follow_up_date: input.follow_up_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log contact: ${error.message}`);
    }

    return data as LeadContactHistory;
  }
}
