/**
 * Buyer Service
 * CRUD operations and business logic for buyers
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  Buyer,
  BuyerWithDetails,
  BuyerPreferences,
  BuyerTransaction,
  CreateBuyerInput,
  UpdateBuyerInput,
  BuyerListFilters
} from './types';

export class BuyerService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create a new buyer
   */
  async createBuyer(userId: string, input: CreateBuyerInput): Promise<Buyer> {
    const { data, error } = await this.supabase
      .from('buyers')
      .insert({
        user_id: userId,
        name: input.name,
        company_name: input.company_name || null,
        email: input.email || null,
        phone: input.phone || null,
        buyer_type: input.buyer_type || null,
        status: input.status || 'active',
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create buyer: ${error.message}`);
    return data as Buyer;
  }

  /**
   * Get a buyer by ID
   */
  async getBuyer(buyerId: string, userId: string): Promise<BuyerWithDetails | null> {
    const { data: buyer, error } = await this.supabase
      .from('buyers')
      .select(`
        *,
        buyer_preferences(*),
        buyer_transactions(*)
      `)
      .eq('id', buyerId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get buyer: ${error.message}`);
    }

    // buyer_preferences is an array from the join, get first item
    const prefsArray = buyer.buyer_preferences as unknown as Array<BuyerPreferences> | null;
    const txArray = buyer.buyer_transactions as unknown as Array<BuyerTransaction> | null;

    return {
      ...buyer,
      preferences: prefsArray?.[0] || null,
      transactions: txArray || [],
      transactionCount: txArray?.length || 0,
    } as unknown as BuyerWithDetails;
  }

  /**
   * List buyers with filters
   */
  async listBuyers(
    userId: string,
    filters: BuyerListFilters = {},
    page = 1,
    limit = 25
  ): Promise<{ buyers: BuyerWithDetails[]; total: number }> {
    let query = this.supabase
      .from('buyers')
      .select('*, buyer_preferences(*), buyer_transactions(count)', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('buyer_type', filters.type);
    if (filters.tier) query = query.eq('tier', filters.tier);
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to list buyers: ${error.message}`);

    const buyers = (data || []).map((buyer) => {
      // buyer_preferences is an array from the join
      const prefsArray = buyer.buyer_preferences as unknown as Array<Record<string, unknown>> | null;
      // buyer_transactions with count aggregation returns [{count: n}]
      const txCountArray = buyer.buyer_transactions as unknown as Array<{ count: number }> | null;

      return {
        ...buyer,
        preferences: prefsArray?.[0] || null,
        transactionCount: txCountArray?.[0]?.count || 0,
      };
    }) as BuyerWithDetails[];

    return { buyers, total: count || 0 };
  }

  /**
   * Update a buyer
   */
  async updateBuyer(buyerId: string, userId: string, input: UpdateBuyerInput): Promise<Buyer> {
    const { data, error } = await this.supabase
      .from('buyers')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', buyerId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update buyer: ${error.message}`);
    return data as Buyer;
  }

  /**
   * Soft delete a buyer (set status to inactive)
   */
  async deleteBuyer(buyerId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('buyers')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', buyerId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete buyer: ${error.message}`);
  }

  /**
   * Get buyer count by status
   */
  async getBuyerStats(userId: string): Promise<{ active: number; qualified: number; total: number }> {
    const { data, error } = await this.supabase
      .from('buyers')
      .select('status')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to get buyer stats: ${error.message}`);

    const stats = { active: 0, qualified: 0, total: data?.length || 0 };
    for (const buyer of data || []) {
      if (buyer.status === 'active') stats.active++;
      if (buyer.status === 'qualified') stats.qualified++;
    }
    return stats;
  }
}

