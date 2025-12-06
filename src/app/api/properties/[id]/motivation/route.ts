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
import type { Json } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = id;
    const searchParams = request.nextUrl.searchParams;
    const scoreType =
      (searchParams.get('scoreType') as 'standard' | 'dealflow_iq' | 'both') || 'standard';
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
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate motivation score
    const result = await calculateSellerMotivation({
      propertyId,
      address,
      scoreType,
      useCache: !refresh,
      cacheTtlSeconds: 3600, // 1 hour
    });

    // Store score(s) in database for analytics
    // Always store standard score
    const { error: standardScoreError } = await supabase.from('motivation_scores').insert({
      property_id: propertyId,
      address,
      score_type: 'standard',
      score: result.standardScore.score,
      confidence: result.standardScore.confidence,
      model_used: result.standardScore.modelUsed,
      factors: result.standardScore.factors as unknown as Json,
      recommendation: result.standardScore.recommendation,
      risk_factors: result.standardScore.riskFactors,
      created_by: user.id,
    });
    if (standardScoreError) {
      console.warn('[Motivation API] Failed to store standard score:', standardScoreError);
    }

    // Store DealFlow IQ score if calculated
    if (result.dealFlowIQ) {
      const { error: dealFlowError } = await supabase.from('motivation_scores').insert({
        property_id: propertyId,
        address,
        score_type: 'dealflow_iq',
        score: result.dealFlowIQ.iqScore,
        confidence: result.standardScore.confidence, // Use same confidence
        model_used: `${result.standardScore.modelUsed}_dealflow`,
        factors: result.standardScore.factors as unknown as Json, // Base factors
        ai_adjustments: result.dealFlowIQ.aiAdjustments as unknown as Json,
        recommendation: result.standardScore.recommendation,
        risk_factors: result.standardScore.riskFactors,
        created_by: user.id,
      });
      if (dealFlowError) {
        console.warn('[Motivation API] Failed to store DealFlow IQ score:', dealFlowError);
      }
    }

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
