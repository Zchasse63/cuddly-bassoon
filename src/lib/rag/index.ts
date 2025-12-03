/**
 * RAG (Retrieval-Augmented Generation) Module
 * 
 * This module provides knowledge base search and AI-powered Q&A capabilities
 * for the real estate wholesaling platform.
 */

// Document Processing
export { parseDocument, type ProcessedDocument, type DocumentMetadata } from './document-processor';

// Text Chunking
export { chunkDocument, countTokens, type DocumentChunk, type ChunkerOptions } from './chunker';

// Embedding Generation
export { 
  generateEmbedding, 
  generateBatchEmbeddings, 
  formatEmbeddingForPgVector,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  type EmbeddingResult,
  type BatchEmbeddingResult,
} from './embedder';

// Document Ingestion
export { 
  ingestAllDocuments, 
  ingestSingleDocument,
  type IngestionProgress,
  type IngestionResult,
} from './ingestion';

// Semantic Search
export { 
  searchDocuments, 
  getRelatedDocuments,
  getDocumentBySlug,
  type SearchResult,
  type SearchOptions,
} from './search';

// Context Building
export { 
  buildContext, 
  formatPrompt,
  buildClassificationContext,
  type RAGContext,
} from './context-builder';

// Response Generation
export {
  generateResponse,
  generateStreamingResponse,
  classifyQuery,
  type GenerationOptions,
  type GenerationResult,
  type QueryClassification,
  type StreamingChunk,
} from './generator';

// Caching
export {
  ragCache,
  generateQueryCacheKey,
  generateEmbeddingCacheKey,
  RAGCacheTTL,
  type CachedRAGResponse,
} from './cache';

// Rate Limiting
export {
  checkRateLimit,
  getRateLimitStatus,
  resetRateLimit,
  RateLimitTiers,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limiter';
