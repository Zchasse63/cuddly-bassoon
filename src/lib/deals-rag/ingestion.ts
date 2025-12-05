/**
 * Historical Deals Ingestion Service
 * Handles adding deals to the RAG system with embedding generation
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  generateEmbedding,
  generateBatchEmbeddings,
  formatEmbeddingForPgVector,
  EMBEDDING_MODEL,
} from '../rag/embedder';
import { buildDealEmbeddingText } from './search';
import type { HistoricalDeal, DealIngestionResult } from './types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials not configured (service key required)');
  }
  return createClient(url, key);
}

/**
 * Progress callback type
 */
type ProgressCallback = (progress: {
  phase: 'validating' | 'storing' | 'embedding' | 'patterns' | 'complete';
  current: number;
  total: number;
  message?: string;
}) => void;

/**
 * Ingest a single historical deal
 */
export async function ingestDeal(
  deal: Omit<HistoricalDeal, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string
): Promise<{ success: boolean; dealId?: string; error?: string }> {
  const supabase = getSupabaseClient();

  try {
    // Store the deal
    const { data: storedDeal, error: storeError } = await supabase
      .from('historical_deals')
      .upsert(
        {
          external_id: deal.externalId,
          address: deal.address,
          city: deal.city,
          state: deal.state,
          zip_code: deal.zipCode,
          county: deal.county,
          property_type: deal.propertyType,
          bedrooms: deal.bedrooms,
          bathrooms: deal.bathrooms,
          square_footage: deal.squareFootage,
          year_built: deal.yearBuilt,
          lot_size: deal.lotSize,
          purchase_price: deal.purchasePrice,
          arv: deal.arv,
          repair_cost: deal.repairCost,
          sale_price: deal.salePrice,
          assignment_fee: deal.assignmentFee,
          holding_cost: deal.holdingCost,
          closing_cost: deal.closingCost,
          profit: deal.profit,
          roi: deal.roi,
          deal_type: deal.dealType,
          acquisition_source: deal.acquisitionSource,
          exit_strategy: deal.exitStrategy,
          seller_type: deal.sellerType,
          seller_motivation_score: deal.sellerMotivationScore,
          was_absentee_owner: deal.wasAbsenteeOwner,
          ownership_duration_months: deal.ownershipDurationMonths,
          contract_date: deal.contractDate?.toISOString().split('T')[0],
          close_date: deal.closeDate?.toISOString().split('T')[0],
          days_to_close: deal.daysToClose,
          market_dom_at_deal: deal.marketDomAtDeal,
          market_sale_to_list_ratio: deal.marketSaleToListRatio,
          market_inventory_at_deal: deal.marketInventoryAtDeal,
          outcome: deal.outcome,
          outcome_notes: deal.outcomeNotes,
          lessons_learned: deal.lessonsLearned,
          data_source: deal.dataSource || 'manual',
          created_by: userId,
        },
        { onConflict: 'external_id' }
      )
      .select('id')
      .single();

    if (storeError) {
      throw new Error(`Failed to store deal: ${storeError.message}`);
    }

    const dealId = storedDeal.id;

    // Generate embedding
    const embeddingText = buildDealEmbeddingText({
      address: deal.address,
      city: deal.city,
      state: deal.state,
      dealType: deal.dealType,
      sellerType: deal.sellerType,
      propertyType: deal.propertyType,
      purchasePrice: deal.purchasePrice,
      arv: deal.arv,
      profit: deal.profit,
      outcome: deal.outcome,
      lessonsLearned: deal.lessonsLearned,
    });

    const contentHash = crypto.createHash('sha256').update(embeddingText).digest('hex');
    const { embedding } = await generateEmbedding(embeddingText);

    // Store embedding
    const { error: embedError } = await supabase
      .from('historical_deal_embeddings')
      .upsert(
        {
          deal_id: dealId,
          embedding: formatEmbeddingForPgVector(embedding),
          content_hash: contentHash,
          model_version: EMBEDDING_MODEL,
        },
        { onConflict: 'deal_id' }
      );

    if (embedError) {
      console.error('[DealsRAG] Failed to store embedding:', embedError);
      // Don't throw - the deal is stored, just without embedding
    }

    return { success: true, dealId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DealsRAG] Ingestion error:', message);
    return { success: false, error: message };
  }
}

/**
 * Ingest multiple historical deals in batch
 */
export async function ingestDeals(
  deals: Array<Omit<HistoricalDeal, 'id' | 'createdAt' | 'updatedAt'>>,
  userId?: string,
  onProgress?: ProgressCallback
): Promise<DealIngestionResult> {
  const startTime = Date.now();
  const errors: Array<{ dealId?: string; error: string }> = [];
  let dealsProcessed = 0;
  let embeddingsGenerated = 0;

  const supabase = getSupabaseClient();
  const totalDeals = deals.length;

  onProgress?.({
    phase: 'validating',
    current: 0,
    total: totalDeals,
    message: `Validating ${totalDeals} deals`,
  });

  // Validate all deals first
  const validDeals: Array<{
    deal: Omit<HistoricalDeal, 'id' | 'createdAt' | 'updatedAt'>;
    embeddingText: string;
    contentHash: string;
  }> = [];

  for (const deal of deals) {
    if (!deal.address || !deal.purchasePrice) {
      errors.push({ error: `Invalid deal: missing required fields (address, purchasePrice)` });
      continue;
    }

    const embeddingText = buildDealEmbeddingText({
      address: deal.address,
      city: deal.city,
      state: deal.state,
      dealType: deal.dealType,
      sellerType: deal.sellerType,
      propertyType: deal.propertyType,
      purchasePrice: deal.purchasePrice,
      arv: deal.arv,
      profit: deal.profit,
      outcome: deal.outcome,
      lessonsLearned: deal.lessonsLearned,
    });

    const contentHash = crypto.createHash('sha256').update(embeddingText).digest('hex');
    validDeals.push({ deal, embeddingText, contentHash });
  }

  // Store deals in batches
  onProgress?.({
    phase: 'storing',
    current: 0,
    total: validDeals.length,
    message: 'Storing deals in database',
  });

  const dealIds: Map<number, string> = new Map();
  const batchSize = 50;

  for (let i = 0; i < validDeals.length; i += batchSize) {
    const batch = validDeals.slice(i, i + batchSize);
    const dealRecords = batch.map(({ deal }) => ({
      external_id: deal.externalId,
      address: deal.address,
      city: deal.city,
      state: deal.state,
      zip_code: deal.zipCode,
      county: deal.county,
      property_type: deal.propertyType,
      bedrooms: deal.bedrooms,
      bathrooms: deal.bathrooms,
      square_footage: deal.squareFootage,
      year_built: deal.yearBuilt,
      lot_size: deal.lotSize,
      purchase_price: deal.purchasePrice,
      arv: deal.arv,
      repair_cost: deal.repairCost,
      sale_price: deal.salePrice,
      assignment_fee: deal.assignmentFee,
      holding_cost: deal.holdingCost,
      closing_cost: deal.closingCost,
      profit: deal.profit,
      roi: deal.roi,
      deal_type: deal.dealType,
      acquisition_source: deal.acquisitionSource,
      exit_strategy: deal.exitStrategy,
      seller_type: deal.sellerType,
      seller_motivation_score: deal.sellerMotivationScore,
      was_absentee_owner: deal.wasAbsenteeOwner,
      ownership_duration_months: deal.ownershipDurationMonths,
      contract_date: deal.contractDate?.toISOString().split('T')[0],
      close_date: deal.closeDate?.toISOString().split('T')[0],
      days_to_close: deal.daysToClose,
      market_dom_at_deal: deal.marketDomAtDeal,
      market_sale_to_list_ratio: deal.marketSaleToListRatio,
      market_inventory_at_deal: deal.marketInventoryAtDeal,
      outcome: deal.outcome,
      outcome_notes: deal.outcomeNotes,
      lessons_learned: deal.lessonsLearned,
      data_source: deal.dataSource || 'batch_import',
      created_by: userId,
    }));

    const { data, error } = await supabase
      .from('historical_deals')
      .upsert(dealRecords, { onConflict: 'external_id' })
      .select('id');

    if (error) {
      errors.push({ error: `Batch store failed: ${error.message}` });
    } else if (data) {
      data.forEach((row, idx) => {
        dealIds.set(i + idx, row.id);
        dealsProcessed++;
      });
    }

    onProgress?.({
      phase: 'storing',
      current: Math.min(i + batchSize, validDeals.length),
      total: validDeals.length,
      message: `Stored ${dealsProcessed} deals`,
    });
  }

  // Generate embeddings in batches
  onProgress?.({
    phase: 'embedding',
    current: 0,
    total: dealsProcessed,
    message: 'Generating embeddings',
  });

  const embeddingTexts = validDeals
    .map((v, idx) => (dealIds.has(idx) ? v.embeddingText : null))
    .filter((t): t is string => t !== null);

  if (embeddingTexts.length > 0) {
    const embeddingResults = await generateBatchEmbeddings(
      embeddingTexts,
      (completed, total) => {
        onProgress?.({
          phase: 'embedding',
          current: completed,
          total,
          message: `Generated ${completed}/${total} embeddings`,
        });
      }
    );

    // Store embeddings
    let embeddingIndex = 0;
    for (let i = 0; i < validDeals.length; i++) {
      const dealId = dealIds.get(i);
      if (!dealId) continue;

      const embedding = embeddingResults.embeddings[embeddingIndex];
      if (embedding && embedding.embedding.length > 0) {
        const { error } = await supabase
          .from('historical_deal_embeddings')
          .upsert({
            deal_id: dealId,
            embedding: formatEmbeddingForPgVector(embedding.embedding),
            content_hash: validDeals[i]!.contentHash,
            model_version: EMBEDDING_MODEL,
          }, { onConflict: 'deal_id' });

        if (!error) {
          embeddingsGenerated++;
        }
      }
      embeddingIndex++;
    }
  }

  // Recalculate outcome patterns
  onProgress?.({
    phase: 'patterns',
    current: 0,
    total: 1,
    message: 'Calculating outcome patterns',
  });

  let patternsCalculated = 0;
  try {
    const { error: patternError } = await supabase.rpc('calculate_deal_outcome_patterns');
    if (!patternError) {
      const { count } = await supabase
        .from('deal_outcome_patterns')
        .select('*', { count: 'exact', head: true });
      patternsCalculated = count || 0;
    }
  } catch (e) {
    console.warn('[DealsRAG] Pattern calculation skipped:', e);
  }

  onProgress?.({
    phase: 'complete',
    current: dealsProcessed,
    total: totalDeals,
    message: 'Ingestion complete',
  });

  return {
    success: errors.length === 0,
    dealsProcessed,
    embeddingsGenerated,
    patternsCalculated,
    errors,
    duration: Date.now() - startTime,
  };
}

/**
 * Update embeddings for deals that have changed
 */
export async function refreshDealEmbeddings(
  dealIds?: string[],
  onProgress?: ProgressCallback
): Promise<{ updated: number; errors: number }> {
  const supabase = getSupabaseClient();
  let updated = 0;
  let errorCount = 0;

  // Get deals that need embedding updates
  let query = supabase
    .from('historical_deals')
    .select('id, address, city, state, deal_type, seller_type, property_type, purchase_price, arv, profit, outcome, lessons_learned');

  if (dealIds && dealIds.length > 0) {
    query = query.in('id', dealIds);
  }

  const { data: deals, error } = await query;

  if (error || !deals) {
    console.error('[DealsRAG] Failed to fetch deals:', error);
    return { updated: 0, errors: 1 };
  }

  const total = deals.length;
  onProgress?.({
    phase: 'embedding',
    current: 0,
    total,
    message: `Refreshing ${total} embeddings`,
  });

  for (let i = 0; i < deals.length; i++) {
    const deal = deals[i];
    if (!deal) continue;

    try {
      const embeddingText = buildDealEmbeddingText({
        address: deal.address,
        city: deal.city,
        state: deal.state,
        dealType: deal.deal_type,
        sellerType: deal.seller_type,
        propertyType: deal.property_type,
        purchasePrice: deal.purchase_price,
        arv: deal.arv,
        profit: deal.profit,
        outcome: deal.outcome,
        lessonsLearned: deal.lessons_learned,
      });

      const contentHash = crypto.createHash('sha256').update(embeddingText).digest('hex');

      // Check if content has changed
      const { data: existingEmbed } = await supabase
        .from('historical_deal_embeddings')
        .select('content_hash')
        .eq('deal_id', deal.id)
        .single();

      if (existingEmbed?.content_hash === contentHash) {
        // Content unchanged, skip
        continue;
      }

      // Generate new embedding
      const { embedding } = await generateEmbedding(embeddingText);

      await supabase
        .from('historical_deal_embeddings')
        .upsert({
          deal_id: deal.id,
          embedding: formatEmbeddingForPgVector(embedding),
          content_hash: contentHash,
          model_version: EMBEDDING_MODEL,
        }, { onConflict: 'deal_id' });

      updated++;
    } catch (e) {
      console.error(`[DealsRAG] Failed to update embedding for deal ${deal.id}:`, e);
      errorCount++;
    }

    onProgress?.({
      phase: 'embedding',
      current: i + 1,
      total,
      message: `Updated ${updated} embeddings`,
    });
  }

  return { updated, errors: errorCount };
}

/**
 * Recalculate deal outcome patterns
 */
export async function recalculatePatterns(): Promise<number> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc('calculate_deal_outcome_patterns');

  if (error) {
    throw new Error(`Pattern calculation failed: ${error.message}`);
  }

  const { count } = await supabase
    .from('deal_outcome_patterns')
    .select('*', { count: 'exact', head: true });

  return count || 0;
}
