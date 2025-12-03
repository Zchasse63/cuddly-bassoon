/**
 * Embedding Generator Service
 * Generates embeddings using OpenAI text-embedding-3-small model
 */

import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 20;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalTokens: number;
  successCount: number;
  failureCount: number;
}

/**
 * Generate embedding for a single text with retry logic
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const client = getOpenAIClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      const firstData = response.data[0];
      if (!firstData) {
        throw new Error('No embedding data returned');
      }

      return {
        embedding: firstData.embedding,
        tokenCount: response.usage.total_tokens,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (isRateLimitError(error)) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[RAG] Embedding rate limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        await sleep(delay);
      } else if (attempt < MAX_RETRIES - 1) {
        // Retry on transient errors
        console.warn(`[RAG] Embedding error, retry ${attempt + 1}/${MAX_RETRIES}:`, lastError.message);
        await sleep(RETRY_DELAY_MS);
      } else {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded for embedding');
}

/**
 * Generate embeddings for multiple texts in batches
 */
export async function generateBatchEmbeddings(
  texts: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<BatchEmbeddingResult> {
  const results: EmbeddingResult[] = [];
  let totalTokens = 0;
  let successCount = 0;
  let failureCount = 0;

  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, Math.min(i + BATCH_SIZE, texts.length));
    
    try {
      const batchResults = await processBatchWithRetry(batch);
      results.push(...batchResults.embeddings);
      totalTokens += batchResults.totalTokens;
      successCount += batchResults.successCount;
      failureCount += batchResults.failureCount;
    } catch (error) {
      // If batch fails completely, add null embeddings
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error);
      for (let j = 0; j < batch.length; j++) {
        results.push({ embedding: [], tokenCount: 0 });
        failureCount++;
      }
    }

    // Report progress
    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, texts.length), texts.length);
    }

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < texts.length) {
      await sleep(100);
    }
  }

  return {
    embeddings: results,
    totalTokens,
    successCount,
    failureCount,
  };
}

async function processBatchWithRetry(texts: string[]): Promise<BatchEmbeddingResult> {
  const client = getOpenAIClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      const embeddings = response.data.map((item) => ({
        embedding: item.embedding,
        tokenCount: 0, // OpenAI doesn't provide per-item token counts
      }));

      return {
        embeddings,
        totalTokens: response.usage.total_tokens,
        successCount: texts.length,
        failureCount: 0,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a rate limit error
      if (isRateLimitError(error)) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
        console.log(`Rate limited, waiting ${delay}ms before retry ${attempt + 1}/${MAX_RETRIES}`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 429;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format embedding array as pgvector-compatible string
 */
export function formatEmbeddingForPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };

