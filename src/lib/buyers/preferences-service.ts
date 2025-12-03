/**
 * Buyer Preferences Service
 * Manage buyer criteria and preferences
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { BuyerPreferences, CreatePreferencesInput } from './types';

export class PreferencesService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create or update preferences for a buyer
   */
  async upsertPreferences(
    buyerId: string,
    input: CreatePreferencesInput
  ): Promise<BuyerPreferences> {
    const { data, error } = await this.supabase
      .from('buyer_preferences')
      .upsert(
        {
          buyer_id: buyerId,
          property_types: input.property_types ? JSON.stringify(input.property_types) : null,
          price_range_min: input.price_range_min || null,
          price_range_max: input.price_range_max || null,
          bedroom_min: input.bedroom_min || null,
          bedroom_max: input.bedroom_max || null,
          markets: input.markets ? JSON.stringify(input.markets) : null,
          condition_tolerance: input.condition_tolerance || null,
          max_rehab_budget: input.max_rehab_budget || null,
          preferred_roi_percent: input.preferred_roi_percent || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'buyer_id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save preferences: ${error.message}`);
    return this.transformPreferences(data);
  }

  /**
   * Get preferences for a buyer
   */
  async getPreferences(buyerId: string): Promise<BuyerPreferences | null> {
    const { data, error } = await this.supabase
      .from('buyer_preferences')
      .select('*')
      .eq('buyer_id', buyerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get preferences: ${error.message}`);
    }

    return this.transformPreferences(data);
  }

  /**
   * Delete preferences for a buyer
   */
  async deletePreferences(buyerId: string): Promise<void> {
    const { error } = await this.supabase
      .from('buyer_preferences')
      .delete()
      .eq('buyer_id', buyerId);

    if (error) throw new Error(`Failed to delete preferences: ${error.message}`);
  }

  /**
   * Find buyers by preference criteria
   */
  async findBuyersByPreferences(criteria: {
    propertyType?: string;
    price?: number;
    bedrooms?: number;
    zipCode?: string;
    city?: string;
    state?: string;
  }): Promise<string[]> {
    let query = this.supabase
      .from('buyer_preferences')
      .select('buyer_id');

    // Filter by price range
    if (criteria.price) {
      query = query
        .or(`price_range_min.is.null,price_range_min.lte.${criteria.price}`)
        .or(`price_range_max.is.null,price_range_max.gte.${criteria.price}`);
    }

    // Filter by bedrooms
    if (criteria.bedrooms) {
      query = query
        .or(`bedroom_min.is.null,bedroom_min.lte.${criteria.bedrooms}`)
        .or(`bedroom_max.is.null,bedroom_max.gte.${criteria.bedrooms}`);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to find buyers: ${error.message}`);

    return (data || []).map((p) => p.buyer_id);
  }

  /**
   * Transform database preferences to typed format
   */
  private transformPreferences(data: Database['public']['Tables']['buyer_preferences']['Row']): BuyerPreferences {
    return {
      id: data.id,
      buyer_id: data.buyer_id,
      property_types: data.property_types ? (data.property_types as string[]) : null,
      price_range_min: data.price_range_min,
      price_range_max: data.price_range_max,
      bedroom_min: data.bedroom_min,
      bedroom_max: data.bedroom_max,
      markets: data.markets ? (data.markets as Array<{ zip?: string; city?: string; state?: string }>) : null,
      condition_tolerance: data.condition_tolerance as BuyerPreferences['condition_tolerance'],
      max_rehab_budget: data.max_rehab_budget,
      preferred_roi_percent: data.preferred_roi_percent,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}

