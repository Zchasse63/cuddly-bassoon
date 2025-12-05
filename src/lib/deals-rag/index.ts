/**
 * Historical Deals RAG Module
 *
 * This module provides retrieval-augmented generation capabilities
 * for deal outcome predictions based on historical deal data.
 *
 * Key Features:
 * - Semantic search for similar historical deals
 * - Attribute-based deal matching
 * - Outcome pattern aggregation
 * - Deal ingestion with automatic embedding generation
 * - Prediction context building for AI models
 *
 * Usage:
 * ```typescript
 * import { buildDealPredictionContext, ingestDeal } from '@/lib/deals-rag';
 *
 * // Get predictions for a new deal
 * const context = await buildDealPredictionContext({
 *   city: 'Phoenix',
 *   state: 'AZ',
 *   dealType: 'wholesale',
 *   sellerType: 'bank_reo',
 *   purchasePrice: 150000,
 *   arv: 220000,
 * });
 *
 * // Add a completed deal to the system
 * await ingestDeal({
 *   address: '123 Main St',
 *   city: 'Phoenix',
 *   state: 'AZ',
 *   purchasePrice: 150000,
 *   arv: 220000,
 *   profit: 15000,
 *   outcome: 'success',
 *   lessonsLearned: 'Quick close terms were key to winning this deal',
 * });
 * ```
 */

// Types
export type {
  DealType,
  PropertyType,
  SellerType,
  DealOutcome,
  MarketCondition,
  HistoricalDeal,
  DealSearchResult,
  SimilarDealResult,
  DealOutcomePattern,
  DealSearchOptions,
  SimilarDealOptions,
  DealPredictionContext,
  DealIngestionResult,
} from './types';

// Search Functions
export {
  searchHistoricalDeals,
  findSimilarDeals,
  getOutcomePattern,
  getHistoricalDealCount,
  buildDealEmbeddingText,
} from './search';

// Ingestion Functions
export {
  ingestDeal,
  ingestDeals,
  refreshDealEmbeddings,
  recalculatePatterns,
} from './ingestion';

// Context Building
export {
  buildDealPredictionContext,
  formatPredictionContextForPrompt,
} from './context-builder';
