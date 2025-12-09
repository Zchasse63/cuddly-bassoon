import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RecommendationEngine, DealPattern } from '@/lib/recommendations';
import type { Database } from '@/types/database';

type Deal = Database['public']['Tables']['deals']['Row'];

/**
 * Recommendations API
 * GET /api/recommendations - Get property recommendations based on success patterns
 * POST /api/recommendations/learn - Learn from new closed deals
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const minScore = parseFloat(searchParams.get('minScore') || '0.5');

    // Initialize recommendation engine with user's historical deals
    const engine = new RecommendationEngine({ minConfidence: minScore, maxResults: limit });

    // Fetch user's closed deals to learn patterns
    const { data: closedDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(100);

    if (closedDeals && closedDeals.length > 0) {
      const patterns: DealPattern[] = closedDeals.map((deal: Deal) => ({
        zipCode: '',
        priceRange: {
          min: Number(deal.contract_price || 0) * 0.8,
          max: Number(deal.contract_price || 0) * 1.2,
        },
        propertyType: 'single_family',
        bedrooms: 3,
        buyerId: deal.assigned_buyer_id || undefined,
        profit: Number(deal.assignment_fee) || 0,
        daysToClose: 30,
      }));
      engine.learnFromDeals(patterns);
    }

    // Fetch available properties to score
    const { data: properties } = await supabase
      .from('properties')
      .select('id, address, city, state, zip, asking_price, property_type, bedrooms')
      .eq('listing_status', 'active')
      .limit(100);

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        recommendations: [],
        patterns: engine.getPatternCount(),
        topZipCodes: engine.getTopZipCodes(),
        message: 'No available properties to recommend',
      });
    }

    // Get recommendations
    const recommendations = engine.getRecommendations(
      properties.map((p) => ({
        id: p.id,
        zipCode: p.zip || '',
        price: p.asking_price || 0,
        propertyType: p.property_type || 'single_family',
        bedrooms: p.bedrooms || 0,
      }))
    );

    // Enrich with property details
    const enrichedRecommendations = recommendations.map((rec) => {
      const property = properties.find((p) => p.id === rec.propertyId);
      return {
        ...rec,
        property: property
          ? {
              id: property.id,
              address: property.address,
              city: property.city,
              state: property.state,
              zipCode: property.zip,
              price: property.asking_price,
              propertyType: property.property_type,
              bedrooms: property.bedrooms,
            }
          : null,
      };
    });

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      patterns: engine.getPatternCount(),
      topZipCodes: engine.getTopZipCodes(),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Input deal pattern from request body
interface InputDealPattern {
  zipCode?: string;
  priceRange?: { min?: number; max?: number };
  propertyType?: string;
  bedrooms?: number;
  buyerId?: string;
  profit?: number;
  daysToClose?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { deals } = body as { deals?: InputDealPattern[] };

    if (!deals || !Array.isArray(deals)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Store patterns in database for persistence
    // Note: recommendation_patterns table not yet in generated types
    const patterns = deals.map((deal: InputDealPattern) => ({
      user_id: user.id,
      zip_code: deal.zipCode,
      price_min: deal.priceRange?.min || 0,
      price_max: deal.priceRange?.max || 0,
      property_type: deal.propertyType,
      bedrooms: deal.bedrooms,
      buyer_id: deal.buyerId,
      profit: deal.profit,
      days_to_close: deal.daysToClose,
      created_at: new Date().toISOString(),
    }));

    // Using type assertion for untyped table
    const { error: insertError } = await (
      supabase as unknown as {
        from: (table: string) => {
          insert: (data: typeof patterns) => Promise<{ error: Error | null }>;
        };
      }
    )
      .from('recommendation_patterns')
      .insert(patterns);

    if (insertError) {
      console.error('Error storing patterns:', insertError);
      return NextResponse.json({ error: 'Failed to store patterns' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      patternsLearned: patterns.length,
    });
  } catch (error) {
    console.error('Learn patterns error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
