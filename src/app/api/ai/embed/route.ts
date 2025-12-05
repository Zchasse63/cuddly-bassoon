/**
 * AI Embed Endpoint
 * POST /api/ai/embed
 * Generates embeddings for text content
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  generateEmbedding,
  generateBatchEmbeddings,
  formatEmbeddingForPgVector,
} from '@/lib/ai/embeddings-service';
import { parseAIError, getErrorMessage } from '@/lib/ai/errors';

const embedRequestSchema = z
  .object({
    text: z.string().optional(),
    texts: z.array(z.string()).optional(),
    format: z.enum(['array', 'pgvector']).optional().default('array'),
  })
  .refine(
    (data) => data.text !== undefined || (data.texts !== undefined && data.texts.length > 0),
    { message: 'Either text or texts must be provided' }
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = embedRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { text, texts, format } = validated.data;

    // Single text embedding
    if (text) {
      const result = await generateEmbedding(text);

      return NextResponse.json({
        embedding:
          format === 'pgvector' ? formatEmbeddingForPgVector(result.embedding) : result.embedding,
        dimensions: result.embedding.length,
        tokenCount: result.tokenCount,
        format,
      });
    }

    // Batch embeddings
    if (texts && texts.length > 0) {
      const result = await generateBatchEmbeddings(texts);

      return NextResponse.json({
        embeddings:
          format === 'pgvector'
            ? result.embeddings.map((e) => formatEmbeddingForPgVector(e.embedding))
            : result.embeddings.map((e) => e.embedding),
        count: result.embeddings.length,
        dimensions: result.embeddings[0]?.embedding.length || 0,
        totalTokens: result.totalTokens,
        format,
      });
    }

    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  } catch (error) {
    console.error('[AI Embed] Error:', error);
    const aiError = parseAIError(error);
    return NextResponse.json(
      { error: getErrorMessage(aiError), code: aiError.code },
      { status: aiError.statusCode }
    );
  }
}
