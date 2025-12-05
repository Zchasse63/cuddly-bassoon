/**
 * Property Motivation Score API
 *
 * GET /api/properties/[id]/motivation
 * Returns the seller motivation score for a property
 *
 * Query params:
 * - scoreType: 'standard' | 'dealflow_iq' | 'both' (default: 'standard')
 * - refresh: 'true' to bypass cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateSellerMotivation } from '@/lib/seller-motivation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const scoreType = searchParams.get('scoreType') as 'standard' | 'dealflow_iq' | 'both' || 'standard';
    const refresh = searchParams.get('refresh') === 'true';

    // Try to get address from property or shovels data
    let address: string | undefined;

    // First try properties table
    const { data: property } = await supabase
      .from('properties')
      .select('address, city, state, zip')
      .eq('id', propertyId)
      .single();

    if (property) {
      address = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;
    } else {
      // Try shovels_address_metrics
      const { data: shovelsData } = await supabase
        .from('shovels_address_metrics')
        .select('formatted_address')
        .eq('address_id', propertyId)
        .single();

      if (shovelsData?.formatted_address) {
        address = shovelsData.formatted_address;
      }
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Calculate motivation score
    const result = await calculateSellerMotivation({
      propertyId,
      address,
      scoreType,
      useCache: !refresh,
      cacheTtlSeconds: 3600, // 1 hour
    });

    // Store score in database for analytics
    await supabase.from('motivation_scores').insert({
      property_id: propertyId,
      address,
      score_type: scoreType === 'both' ? 'standard' : scoreType,
      score: result.standardScore.score,
      confidence: result.standardScore.confidence,
      model_used: result.standardScore.modelUsed,
      factors: result.standardScore.factors,
      recommendation: result.standardScore.recommendation,
      risk_factors: result.standardScore.riskFactors,
      created_by: user.id,
    }).catch((err) => {
      // Non-critical, just log
      console.warn('[Motivation API] Failed to store score:', err);
    });

    return NextResponse.json({
      propertyId,
      address,
      standardScore: {
        score: result.standardScore.score,
        confidence: result.standardScore.confidence,
        factors: result.standardScore.factors,
        recommendation: result.standardScore.recommendation,
        riskFactors: result.standardScore.riskFactors,
        modelUsed: result.standardScore.modelUsed,
      },
      ownerClassification: {
        primaryClass: result.classification.primaryClass,
        subClass: result.classification.subClass,
        confidence: result.classification.confidence,
      },
      ...(result.dealFlowIQ && {
        dealFlowIQ: {
          iqScore: result.dealFlowIQ.iqScore,
          aiAdjustments: result.dealFlowIQ.aiAdjustments,
          predictions: result.dealFlowIQ.predictions,
        },
      }),
      dataQuality: result.dataQuality,
      timing: result.timing,
    });
  } catch (error) {
    console.error('[Motivation API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate motivation score',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
