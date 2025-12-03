import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RecommendationEngine, DealPattern } from '@/lib/recommendations';

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
    const { data: closedDeals } = await (supabase as any)
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(100);

    if (closedDeals && closedDeals.length > 0) {
      const patterns: DealPattern[] = closedDeals.map((deal: any) => ({
        zipCode: deal.zip_code || '',
        priceRange: { min: deal.purchase_price * 0.8, max: deal.purchase_price * 1.2 },
        propertyType: deal.property_type || 'single_family',
        bedrooms: deal.bedrooms || 3,
        buyerId: deal.buyer_id,
        profit: deal.profit || 0,
        daysToClose: deal.days_to_close || 30,
      }));
      engine.learnFromDeals(patterns);
    }

    // Fetch available properties to score
    const { data: properties } = await (supabase as any)
      .from('properties')
      .select('id, address, city, state, zip_code, price, property_type, bedrooms')
      .eq('status', 'available')
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
      properties.map((p: any) => ({
        id: p.id,
        zipCode: p.zip_code,
        price: p.price,
        propertyType: p.property_type,
        bedrooms: p.bedrooms,
      }))
    );

    // Enrich with property details
    const enrichedRecommendations = recommendations.map((rec) => {
      const property = properties.find((p: any) => p.id === rec.propertyId);
      return {
        ...rec,
        property: property
          ? {
              id: property.id,
              address: property.address,
              city: property.city,
              state: property.state,
              zipCode: property.zip_code,
              price: property.price,
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
    const { deals } = body;

    if (!deals || !Array.isArray(deals)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Store patterns in database for persistence
    const patterns = deals.map((deal: any) => ({
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

    const { error: insertError } = await (supabase as any)
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
