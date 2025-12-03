/**
 * Deal Service
 * Business logic for deal CRUD operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  Deal,
  DealWithDetails,
  CreateDealInput,
  UpdateDealInput,
  DealListFilters,
  DealStage,
} from './types';
import { validateTransition, calculateDaysInStage } from './stages';
import { ActivityService } from './activities';

export class DealService {
  private activityService: ActivityService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.activityService = new ActivityService(supabase);
  }

  /**
   * Create a new deal
   */
  async createDeal(userId: string, input: CreateDealInput): Promise<Deal> {
    const { data, error } = await this.supabase
      .from('deals')
      .insert({
        user_id: userId,
        property_address: input.property_address,
        property_id: input.property_id,
        stage: input.stage || 'lead',
        status: 'active',
        seller_name: input.seller_name,
        seller_phone: input.seller_phone,
        seller_email: input.seller_email,
        asking_price: input.asking_price,
        offer_price: input.offer_price,
        estimated_arv: input.estimated_arv,
        estimated_repairs: input.estimated_repairs,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    // Log creation activity
    await this.activityService.logActivity(data.id, userId, {
      activity_type: 'note',
      description: 'Deal created',
      metadata: { initial_stage: input.stage || 'lead' },
    });

    return data as Deal;
  }

  /**
   * Get a deal by ID
   */
  async getDeal(dealId: string, userId: string): Promise<DealWithDetails | null> {
    const { data, error } = await this.supabase
      .from('deals')
      .select(
        `
        *,
        buyers:assigned_buyer_id(id, name, company_name, phone, email),
        properties:property_id(id, address, city, state, zip, bedrooms, bathrooms, square_footage)
      `
      )
      .eq('id', dealId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get deal: ${error.message}`);
    }

    const deal = data as unknown as DealWithDetails & {
      buyers: DealWithDetails['assigned_buyer'];
      properties: DealWithDetails['property'];
    };

    return {
      ...deal,
      assigned_buyer: deal.buyers,
      property: deal.properties,
      days_in_stage: calculateDaysInStage(deal.updated_at ?? null),
    };
  }

  /**
   * List deals with filters
   */
  async listDeals(
    userId: string,
    filters: DealListFilters = {},
    page = 1,
    limit = 25
  ): Promise<{ deals: DealWithDetails[]; total: number }> {
    let query = this.supabase
      .from('deals')
      .select(
        `
        *,
        buyers:assigned_buyer_id(id, name, company_name)
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (filters.stage) {
      query = query.eq('stage', filters.stage);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.assigned_buyer_id) {
      query = query.eq('assigned_buyer_id', filters.assigned_buyer_id);
    }

    if (filters.search) {
      query = query.or(
        `property_address.ilike.%${filters.search}%,seller_name.ilike.%${filters.search}%`
      );
    }

    if (filters.min_value !== undefined) {
      query = query.gte('contract_price', filters.min_value);
    }

    if (filters.max_value !== undefined) {
      query = query.lte('contract_price', filters.max_value);
    }

    const offset = (page - 1) * limit;
    query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list deals: ${error.message}`);
    }

    const deals = (data || []).map((deal) => {
      const d = deal as unknown as DealWithDetails & { buyers: DealWithDetails['assigned_buyer'] };
      return {
        ...d,
        assigned_buyer: d.buyers,
        days_in_stage: calculateDaysInStage(d.updated_at ?? null),
      };
    });

    return { deals, total: count || 0 };
  }

  /**
   * Update a deal
   */
  async updateDeal(dealId: string, userId: string, input: UpdateDealInput): Promise<Deal> {
    // If stage is changing, validate the transition
    if (input.stage) {
      const current = await this.getDeal(dealId, userId);
      if (!current) {
        throw new Error('Deal not found');
      }

      const result = validateTransition(current.stage as DealStage, input.stage, {
        ...current,
        ...input,
      });

      if (!result.success) {
        throw new Error(result.reason || 'Invalid stage transition');
      }

      // Log stage change
      await this.activityService.logStageChange(
        dealId,
        userId,
        current.stage as DealStage,
        input.stage
      );
    }

    const { data, error } = await this.supabase
      .from('deals')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', dealId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    return data as Deal;
  }

  /**
   * Delete (soft delete) a deal
   */
  async deleteDeal(dealId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('deals')
      .update({ status: 'cancelled' })
      .eq('id', dealId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete deal: ${error.message}`);
    }
  }

  /**
   * Get deals grouped by stage for Kanban view
   */
  async getDealsByStage(userId: string): Promise<Record<DealStage, DealWithDetails[]>> {
    const { deals } = await this.listDeals(userId, { status: 'active' }, 1, 500);

    const grouped: Record<DealStage, DealWithDetails[]> = {
      lead: [],
      contacted: [],
      appointment: [],
      offer: [],
      contract: [],
      assigned: [],
      closing: [],
      closed: [],
      lost: [],
    };

    for (const deal of deals) {
      const stage = deal.stage as DealStage;
      if (grouped[stage]) {
        grouped[stage].push(deal);
      }
    }

    return grouped;
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(userId: string): Promise<{
    totalDeals: number;
    activeDeals: number;
    dealsByStage: Record<DealStage, number>;
    totalPipelineValue: number;
    closedValue: number;
    avgDaysToClose: number;
  }> {
    const { data, error } = await this.supabase
      .from('deals')
      .select('stage, status, contract_price, assignment_fee, created_at, updated_at')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get pipeline stats: ${error.message}`);
    }

    const deals = data || [];
    const activeDeals = deals.filter((d) => d.status === 'active');
    const closedDeals = deals.filter((d) => d.stage === 'closed');

    const dealsByStage: Record<DealStage, number> = {
      lead: 0,
      contacted: 0,
      appointment: 0,
      offer: 0,
      contract: 0,
      assigned: 0,
      closing: 0,
      closed: 0,
      lost: 0,
    };

    for (const deal of deals) {
      const stage = deal.stage as DealStage;
      if (dealsByStage[stage] !== undefined) {
        dealsByStage[stage]++;
      }
    }

    const pipelineDeals = deals.filter((d) =>
      ['contract', 'assigned', 'closing'].includes(d.stage || '')
    );
    const totalPipelineValue = pipelineDeals.reduce(
      (sum, d) => sum + (d.assignment_fee || d.contract_price || 0),
      0
    );

    const closedValue = closedDeals.reduce((sum, d) => sum + (d.assignment_fee || 0), 0);

    // Calculate average days to close
    let totalDays = 0;
    for (const deal of closedDeals) {
      if (deal.created_at && deal.updated_at) {
        const created = new Date(deal.created_at);
        const closed = new Date(deal.updated_at);
        totalDays += Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    const avgDaysToClose = closedDeals.length > 0 ? Math.round(totalDays / closedDeals.length) : 0;

    return {
      totalDeals: deals.length,
      activeDeals: activeDeals.length,
      dealsByStage,
      totalPipelineValue,
      closedValue,
      avgDaysToClose,
    };
  }
}
