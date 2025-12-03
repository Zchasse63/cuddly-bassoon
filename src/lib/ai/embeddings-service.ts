/**
 * Embeddings Service
 * High-level service for generating and managing embeddings
 * Builds on the existing RAG embedder with additional features
 */

import { getOpenAIClient } from './openai';
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from './models';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const BATCH_SIZE = 20;

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
 * Generate embedding for a single text
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
        await sleep(delay);
      } else if (attempt < MAX_RETRIES - 1) {
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

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, Math.min(i + BATCH_SIZE, texts.length));

    try {
      const batchResults = await processBatch(batch);
      results.push(...batchResults.embeddings);
      totalTokens += batchResults.totalTokens;
      successCount += batchResults.successCount;
    } catch {
      for (let j = 0; j < batch.length; j++) {
        results.push({ embedding: [], tokenCount: 0 });
        failureCount++;
      }
    }

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, texts.length), texts.length);
    }

    if (i + BATCH_SIZE < texts.length) {
      await sleep(100);
    }
  }

  return { embeddings: results, totalTokens, successCount, failureCount };
}

async function processBatch(
  texts: string[]
): Promise<{ embeddings: EmbeddingResult[]; totalTokens: number; successCount: number }> {
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const embeddings = response.data.map((item) => ({
    embedding: item.embedding,
    tokenCount: 0,
  }));

  return {
    embeddings,
    totalTokens: response.usage.total_tokens,
    successCount: texts.length,
  };
}

/**
 * Normalize an embedding vector
 */
export function normalizeEmbedding(embedding: number[]): number[] {
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return embedding;
  return embedding.map((val) => val / magnitude);
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i] ?? 0;
    const bVal = b[i] ?? 0;
    dotProduct += aVal * bVal;
    normA += aVal * aVal;
    normB += bVal * bVal;
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Format embedding for pgvector storage
 */
export function formatEmbeddingForPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
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

