/**
 * Property Service
 *
 * Handles all property-related data operations
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
  PropertyWithDetails,
  PropertyListFilters,
  PropertyListResponse,
  PropertyComp,
  MatchedBuyer,
} from './types';

export class PropertyService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get a single property by ID with all related data
   */
  async getProperty(propertyId: string, userId: string): Promise<PropertyWithDetails | null> {
    // Fetch base property data
    const { data: property, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      console.error('Error fetching property:', error);
      return null;
    }

    // Transform to PropertyWithDetails (only using columns that exist in properties table)
    const propertyWithDetails: PropertyWithDetails = {
      id: property.id,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      propertyType: property.property_type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.square_footage,
      yearBuilt: property.year_built,
      lotSize: property.lot_size,
      ownerName: property.owner_name,
      ownerType: property.owner_type,
      ownershipMonths: property.ownership_length_months,
      listingStatus: property.listing_status,
      latitude: property.latitude,
      longitude: property.longitude,

      // These fields come from related tables (valuations, market_data) - not directly on properties
      // TODO: Join with valuations table to get these values
      estimatedValue: undefined,
      mortgageBalance: undefined,
      equityPercent: undefined,
      rentEstimate: undefined,
      taxAmount: undefined,
      daysOnMarket: undefined,
      lastSaleDate: undefined,
      lastSalePrice: undefined,

      // Computed fields (will be undefined since source data is not available)
      estimatedEquity: undefined,
      pricePerSqft: undefined,
      daysOwned: property.ownership_length_months
        ? property.ownership_length_months * 30
        : undefined,
    };

    // Fetch related permits from shovels_permits if available
    try {
      const { data: permits } = await this.supabase
        .from('shovels_permits')
        .select('*')
        .eq('address_id', property.shovels_address_id || '')
        .order('issue_date', { ascending: false })
        .limit(10);

      if (permits && permits.length > 0) {
        propertyWithDetails.permits = permits.map((p) => ({
          id: p.id,
          permitNumber: p.permit_number || '',
          type: p.permit_type || 'unknown',
          status: (p.permit_status as 'active' | 'completed' | 'expired' | 'cancelled') || 'active',
          description: p.permit_description || undefined,
          jobValue: p.job_value || undefined,
          issuedDate: p.issue_date || undefined,
          completedDate: p.final_date || undefined,
          expirationDate: p.expiration_date || undefined,
        }));
      }
    } catch {
      // Permits table may not exist, continue without
    }

    // Fetch matched buyers based on preferences
    const matchedBuyers = await this.getMatchedBuyers(propertyWithDetails, userId);
    propertyWithDetails.matchedBuyers = matchedBuyers;

    // Generate comps (mock for now, would integrate with RentCast/Zillow API)
    propertyWithDetails.comps = await this.getPropertyComps(propertyWithDetails);

    return propertyWithDetails;
  }

  /**
   * List properties with filtering and pagination
   * @param _userId - User ID (reserved for future RLS filtering)
   */
  async listProperties(
    _userId: string,
    filters: PropertyListFilters = {},
    page = 1,
    limit = 25
  ): Promise<PropertyListResponse> {
    let query = this.supabase.from('properties').select('*', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(
        `address.ilike.%${filters.search}%,city.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%`
      );
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.state) {
      query = query.eq('state', filters.state);
    }
    if (filters.zip) {
      query = query.eq('zip', filters.zip);
    }
    if (filters.minValue) {
      query = query.gte('estimated_value', filters.minValue);
    }
    if (filters.maxValue) {
      query = query.lte('estimated_value', filters.maxValue);
    }
    if (filters.minEquity) {
      query = query.gte('equity_percent', filters.minEquity);
    }
    if (filters.maxEquity) {
      query = query.lte('equity_percent', filters.maxEquity);
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters.minBedrooms) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }
    if (filters.ownerType) {
      query = query.eq('owner_type', filters.ownerType);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('updated_at', { ascending: false });

    const { data: properties, error, count } = await query;

    if (error) {
      console.error('Error listing properties:', error);
      return { properties: [], total: 0, page, limit, totalPages: 0 };
    }

    const transformedProperties: PropertyWithDetails[] = (properties || []).map((p) => ({
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      propertyType: p.property_type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      squareFootage: p.square_footage,
      yearBuilt: p.year_built,
      // These columns are in valuations table, not properties
      estimatedValue: undefined,
      equityPercent: undefined,
      ownerName: p.owner_name,
      ownerType: p.owner_type,
      listingStatus: p.listing_status,
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    const total = count || 0;
    return {
      properties: transformedProperties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find buyers that match a property based on their preferences
   */
  async getMatchedBuyers(property: PropertyWithDetails, userId: string): Promise<MatchedBuyer[]> {
    // Fetch active buyers with their preferences
    const { data: buyers, error } = await this.supabase
      .from('buyers')
      .select(
        `
        id,
        name,
        company_name,
        tier,
        email,
        phone,
        buyer_preferences (
          min_price,
          max_price,
          min_bedrooms,
          max_bedrooms,
          preferred_property_types,
          preferred_locations,
          max_rehab_budget,
          condition_tolerance
        )
      `
      )
      .eq('user_id', userId)
      .in('status', ['active', 'qualified']);

    if (error || !buyers) {
      return [];
    }

    const matchedBuyers: MatchedBuyer[] = [];

    for (const buyer of buyers) {
      const prefs = (buyer as unknown as { buyer_preferences: Array<Record<string, unknown>> })
        .buyer_preferences?.[0];
      if (!prefs) continue;

      const matchReasons: string[] = [];
      let score = 50; // Base score

      // Price match
      const minPrice = prefs.min_price as number | null;
      const maxPrice = prefs.max_price as number | null;
      if (property.estimatedValue) {
        if (minPrice && property.estimatedValue >= minPrice) {
          score += 15;
          matchReasons.push('Price within range');
        }
        if (maxPrice && property.estimatedValue <= maxPrice) {
          score += 15;
        }
      }

      // Bedroom match
      const minBed = prefs.min_bedrooms as number | null;
      const maxBed = prefs.max_bedrooms as number | null;
      if (
        property.bedrooms &&
        (!minBed || property.bedrooms >= minBed) &&
        (!maxBed || property.bedrooms <= maxBed)
      ) {
        score += 10;
        matchReasons.push(`${property.bedrooms} bed matches criteria`);
      }

      // Property type match
      const prefTypes = prefs.preferred_property_types as string[] | null;
      if (
        prefTypes &&
        property.propertyType &&
        prefTypes.includes(property.propertyType.toLowerCase())
      ) {
        score += 10;
        matchReasons.push('Property type matches');
      }

      // Location match
      const prefLocations = prefs.preferred_locations as string[] | null;
      if (prefLocations && property.city) {
        const cityLower = property.city.toLowerCase();
        if (prefLocations.some((loc) => loc.toLowerCase().includes(cityLower))) {
          score += 15;
          matchReasons.push(`Location (${property.city}) matches`);
        }
      }

      // Only include buyers with reasonable match score
      if (score >= 60 && matchReasons.length > 0) {
        matchedBuyers.push({
          id: buyer.id,
          name: buyer.name,
          companyName: buyer.company_name || undefined,
          tier: buyer.tier as 'A' | 'B' | 'C' | undefined,
          matchScore: Math.min(score, 100),
          matchReasons,
          email: buyer.email || undefined,
          phone: buyer.phone || undefined,
        });
      }
    }

    // Sort by match score descending
    return matchedBuyers.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  /**
   * Get comparable properties (comps) for valuation
   */
  async getPropertyComps(property: PropertyWithDetails): Promise<PropertyComp[]> {
    if (!property.city || !property.state) {
      return [];
    }

    // Query properties in same city with recent sales
    const { data: comps, error } = await this.supabase
      .from('properties')
      .select('*')
      .eq('city', property.city)
      .eq('state', property.state)
      .not('last_sale_price', 'is', null)
      .not('last_sale_date', 'is', null)
      .neq('id', property.id)
      .order('last_sale_date', { ascending: false })
      .limit(10);

    if (error || !comps) {
      return [];
    }

    return comps.map((comp) => {
      // Calculate similarity score
      let similarity = 50;

      // Bedroom match (within 1)
      if (property.bedrooms && comp.bedrooms) {
        if (Math.abs(property.bedrooms - comp.bedrooms) <= 1) similarity += 15;
      }

      // Square footage match (within 20%)
      if (property.squareFootage && comp.square_footage) {
        const diff =
          Math.abs(property.squareFootage - comp.square_footage) / property.squareFootage;
        if (diff <= 0.2) similarity += 15;
      }

      // Year built match (within 10 years)
      if (property.yearBuilt && comp.year_built) {
        if (Math.abs(property.yearBuilt - comp.year_built) <= 10) similarity += 10;
      }

      // Property type match
      if (property.propertyType && comp.property_type === property.propertyType) {
        similarity += 10;
      }

      return {
        id: comp.id,
        address: comp.address,
        city: comp.city || undefined,
        state: comp.state || undefined,
        zip: comp.zip || undefined,
        distanceMiles: 0, // Would calculate with lat/lng
        salePrice: comp.last_sale_price || 0,
        saleDate: comp.last_sale_date || '',
        bedrooms: comp.bedrooms || undefined,
        bathrooms: comp.bathrooms || undefined,
        squareFootage: comp.square_footage || undefined,
        yearBuilt: comp.year_built || undefined,
        pricePerSqft:
          comp.last_sale_price && comp.square_footage
            ? Math.round(comp.last_sale_price / comp.square_footage)
            : undefined,
        daysOnMarket: comp.days_on_market || undefined,
        similarityScore: Math.min(similarity, 100),
      };
    });
  }

  /**
   * Get related deals for a property
   */
  async getRelatedDeals(propertyId: string, userId: string) {
    const { data: deals, error } = await this.supabase
      .from('deals')
      .select('id, stage, status, created_at')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return (deals || []).map((d) => ({
      id: d.id,
      stage: d.stage,
      status: d.status,
      createdAt: d.created_at || '',
    }));
  }

  /**
   * Search properties by address for quick search/command palette
   * @param _userId - User ID (reserved for future RLS filtering)
   */
  async searchProperties(
    query: string,
    _userId: string,
    limit = 10
  ): Promise<PropertyWithDetails[]> {
    const { data, error } = await this.supabase
      .from('properties')
      .select('id, address, city, state, zip, bedrooms, bathrooms')
      .or(`address.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((p) => ({
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip,
      estimatedValue: undefined, // In valuations table, not properties
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
    }));
  }
}
