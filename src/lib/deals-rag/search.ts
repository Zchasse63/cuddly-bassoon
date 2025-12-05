/**
 * Historical Deals Semantic Search Service
 * Performs vector similarity search for deal outcome predictions
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, formatEmbeddingForPgVector } from '../rag/embedder';
import type {
  DealSearchResult,
  SimilarDealResult,
  DealOutcomePattern,
  DealSearchOptions,
  SimilarDealOptions,
  DealType,
  DealOutcome,
} from './types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(url, key);
}

/**
 * Build a text representation of a deal for embedding
 */
export function buildDealEmbeddingText(deal: {
  address: string;
  city?: string;
  state?: string;
  dealType?: string;
  sellerType?: string;
  propertyType?: string;
  purchasePrice: number;
  arv?: number;
  profit?: number;
  outcome?: string;
  lessonsLearned?: string;
}): string {
  const parts: string[] = [];

  // Location context
  if (deal.city && deal.state) {
    parts.push(`Property located in ${deal.city}, ${deal.state}`);
  }

  // Deal type and strategy
  if (deal.dealType) {
    const dealTypeLabels: Record<string, string> = {
      wholesale: 'wholesale assignment deal',
      fix_flip: 'fix and flip deal',
      brrrr: 'BRRRR strategy deal',
      subject_to: 'subject-to financing deal',
      owner_finance: 'owner financed deal',
    };
    parts.push(dealTypeLabels[deal.dealType] || `${deal.dealType} deal`);
  }

  // Seller context
  if (deal.sellerType) {
    const sellerLabels: Record<string, string> = {
      individual: 'individual seller',
      bank_reo: 'bank-owned REO property',
      trust: 'trust-owned property',
      estate: 'estate sale',
      corporate: 'corporate seller',
      government: 'government-owned property',
    };
    parts.push(sellerLabels[deal.sellerType] || deal.sellerType);
  }

  // Property type
  if (deal.propertyType) {
    const propertyLabels: Record<string, string> = {
      single_family: 'single family home',
      multi_family: 'multi-family property',
      condo: 'condominium',
      townhouse: 'townhouse',
      mobile: 'mobile home',
      land: 'vacant land',
    };
    parts.push(propertyLabels[deal.propertyType] || deal.propertyType);
  }

  // Financial context
  parts.push(`Purchase price $${deal.purchasePrice.toLocaleString()}`);
  if (deal.arv) {
    parts.push(`ARV $${deal.arv.toLocaleString()}`);
    const discount = ((deal.arv - deal.purchasePrice) / deal.arv * 100).toFixed(1);
    parts.push(`${discount}% below ARV`);
  }
  if (deal.profit !== undefined) {
    parts.push(`Profit $${deal.profit.toLocaleString()}`);
  }

  // Outcome
  if (deal.outcome) {
    const outcomeLabels: Record<string, string> = {
      success: 'Deal closed successfully',
      failed_financing: 'Deal failed due to financing issues',
      failed_inspection: 'Deal failed at inspection',
      seller_backed_out: 'Seller backed out of deal',
      buyer_backed_out: 'Buyer backed out of deal',
      title_issues: 'Deal failed due to title issues',
      other_failure: 'Deal failed for other reasons',
    };
    parts.push(outcomeLabels[deal.outcome] || deal.outcome);
  }

  // Lessons learned (most important for similarity)
  if (deal.lessonsLearned) {
    parts.push(`Key learnings: ${deal.lessonsLearned}`);
  }

  return parts.join('. ') + '.';
}

/**
 * Search for similar historical deals using semantic similarity
 */
export async function searchHistoricalDeals(
  query: string,
  options: DealSearchOptions = {}
): Promise<DealSearchResult[]> {
  const {
    limit = 5,
    similarityThreshold = 0.5,
    filterDealType,
    filterOutcome,
    filterState,
  } = options;

  const supabase = getSupabaseClient();

  // Generate embedding for the query
  const { embedding } = await generateEmbedding(query);
  const embeddingStr = formatEmbeddingForPgVector(embedding);

  // Call the RPC function
  const { data, error } = await supabase.rpc('match_historical_deals', {
    query_embedding: embeddingStr,
    similarity_threshold: similarityThreshold,
    match_count: limit,
    filter_deal_type: filterDealType || null,
    filter_outcome: filterOutcome || null,
    filter_state: filterState || null,
  });

  if (error) {
    console.error('[DealsRAG] Search error:', error);
    throw new Error(`Historical deals search failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row: {
    deal_id: string;
    address: string;
    city: string | null;
    state: string | null;
    deal_type: string | null;
    purchase_price: number;
    arv: number | null;
    profit: number | null;
    roi: number | null;
    outcome: string | null;
    days_to_close: number | null;
    seller_type: string | null;
    lessons_learned: string | null;
    similarity: number;
  }) => ({
    dealId: row.deal_id,
    address: row.address,
    city: row.city || undefined,
    state: row.state || undefined,
    dealType: row.deal_type as DealType | undefined,
    purchasePrice: row.purchase_price,
    arv: row.arv || undefined,
    profit: row.profit || undefined,
    roi: row.roi || undefined,
    outcome: row.outcome as DealOutcome | undefined,
    daysToClose: row.days_to_close || undefined,
    sellerType: row.seller_type || undefined,
    lessonsLearned: row.lessons_learned || undefined,
    similarity: row.similarity,
  }));
}

/**
 * Find similar deals based on property and deal characteristics
 */
export async function findSimilarDeals(
  options: SimilarDealOptions
): Promise<SimilarDealResult[]> {
  const {
    city,
    state,
    dealType,
    sellerType,
    priceMin,
    priceMax,
    limit = 10,
  } = options;

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc('find_similar_deals', {
    p_city: city || null,
    p_state: state || null,
    p_deal_type: dealType || null,
    p_seller_type: sellerType || null,
    p_price_min: priceMin || null,
    p_price_max: priceMax || null,
    p_limit: limit,
  });

  if (error) {
    console.error('[DealsRAG] Similar deals error:', error);
    throw new Error(`Similar deals search failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((row: {
    deal_id: string;
    address: string;
    city: string | null;
    state: string | null;
    deal_type: string | null;
    seller_type: string | null;
    purchase_price: number;
    arv: number | null;
    profit: number | null;
    roi: number | null;
    outcome: string | null;
    days_to_close: number | null;
    lessons_learned: string | null;
    relevance_score: number;
  }) => ({
    dealId: row.deal_id,
    address: row.address,
    city: row.city || undefined,
    state: row.state || undefined,
    dealType: row.deal_type as DealType | undefined,
    sellerType: row.seller_type || undefined,
    purchasePrice: row.purchase_price,
    arv: row.arv || undefined,
    profit: row.profit || undefined,
    roi: row.roi || undefined,
    outcome: row.outcome as DealOutcome | undefined,
    daysToClose: row.days_to_close || undefined,
    lessonsLearned: row.lessons_learned || undefined,
    similarity: row.relevance_score,
    relevanceScore: row.relevance_score,
  }));
}

/**
 * Get outcome patterns for a specific combination of factors
 */
export async function getOutcomePattern(options: {
  city?: string;
  state?: string;
  dealType?: DealType;
  sellerType?: string;
}): Promise<DealOutcomePattern | null> {
  const supabase = getSupabaseClient();

  // Try to find the most specific pattern first, then fallback to less specific
  const queries = [
    // Most specific: all four factors
    options.city && options.state && options.dealType && options.sellerType
      ? supabase
          .from('deal_outcome_patterns')
          .select('*')
          .eq('city', options.city)
          .eq('state', options.state)
          .eq('deal_type', options.dealType)
          .eq('seller_type', options.sellerType)
          .single()
      : null,
    // State + deal type + seller type
    options.state && options.dealType && options.sellerType
      ? supabase
          .from('deal_outcome_patterns')
          .select('*')
          .is('city', null)
          .eq('state', options.state)
          .eq('deal_type', options.dealType)
          .eq('seller_type', options.sellerType)
          .single()
      : null,
    // Deal type + seller type
    options.dealType && options.sellerType
      ? supabase
          .from('deal_outcome_patterns')
          .select('*')
          .is('city', null)
          .is('state', null)
          .eq('deal_type', options.dealType)
          .eq('seller_type', options.sellerType)
          .single()
      : null,
    // Deal type only
    options.dealType
      ? supabase
          .from('deal_outcome_patterns')
          .select('*')
          .is('city', null)
          .is('state', null)
          .eq('deal_type', options.dealType)
          .is('seller_type', null)
          .single()
      : null,
    // Global pattern
    supabase
      .from('deal_outcome_patterns')
      .select('*')
      .is('city', null)
      .is('state', null)
      .is('deal_type', null)
      .is('seller_type', null)
      .single(),
  ].filter(Boolean);

  for (const query of queries) {
    if (!query) continue;
    const { data, error } = await query;
    if (!error && data) {
      return {
        patternKey: data.pattern_key,
        city: data.city || undefined,
        state: data.state || undefined,
        dealType: data.deal_type as DealType | undefined,
        sellerType: data.seller_type || undefined,
        marketCondition: data.market_condition || undefined,
        totalDeals: data.total_deals,
        successfulDeals: data.successful_deals,
        successRate: data.success_rate,
        avgProfit: data.avg_profit || undefined,
        avgRoi: data.avg_roi || undefined,
        avgDaysToClose: data.avg_days_to_close || undefined,
        avgDiscountFromArv: data.avg_discount_from_arv || undefined,
        failureRate: data.failure_rate,
        mostCommonFailureReason: data.most_common_failure_reason || undefined,
        sampleSize: data.sample_size,
      };
    }
  }

  return null;
}

/**
 * Get count of historical deals
 */
export async function getHistoricalDealCount(): Promise<number> {
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from('historical_deals')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('[DealsRAG] Count error:', error);
    return 0;
  }

  return count || 0;
}
