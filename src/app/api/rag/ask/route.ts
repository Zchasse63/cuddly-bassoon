/**
 * RAG Ask API Endpoint
 * Streaming Q&A endpoint for knowledge base queries
 *
 * Features:
 * - Query preprocessing with intent classification
 * - Word-buffered + time-based streaming for smoother output
 * - Category-based search filtering for improved accuracy
 * - Response caching for common queries
 * - Rate limiting to prevent abuse
 *
 * Stream events:
 * - classification: Query classification result (intent, topics, complexity)
 * - sources: Retrieved source documents
 * - text: Buffered response text chunks
 * - cached: Boolean indicating if response was from cache
 * - done: Stream completion
 * - error: Error message
 */

import { NextRequest } from 'next/server';
import { generateStreamingResponse, type GenerationOptions } from '@/lib/rag/generator';
import { checkRateLimit, RateLimitTiers } from '@/lib/rag/rate-limiter';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Query validation constraints
const MAX_QUERY_LENGTH = 2000;
const MIN_QUERY_LENGTH = 3;

/**
 * Get client identifier for rate limiting.
 * Uses X-Forwarded-For header if behind a proxy, otherwise falls back to a default.
 */
function getClientIdentifier(request: NextRequest): string {
  // Try X-Forwarded-For first (common with proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain
    const firstIp = forwardedFor.split(',')[0];
    return firstIp ? firstIp.trim() : 'unknown-client';
  }

  // Try X-Real-IP (some proxies use this)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier (not ideal but prevents crashes)
  return 'unknown-client';
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit first (before parsing body)
    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(clientId, RateLimitTiers.ANONYMOUS);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimit.resetInSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.resetInSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetInSeconds),
          }
        }
      );
    }

    const body = await request.json();
    const { query, options = {} } = body as { query: string; options?: GenerationOptions };

    // Validate query presence and type
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate query length
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      return new Response(JSON.stringify({ error: 'Query is too short (minimum 3 characters)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      return new Response(JSON.stringify({ error: `Query is too long (maximum ${MAX_QUERY_LENGTH} characters)` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a streaming response with buffered output
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateStreamingResponse(trimmedQuery, options);

          for await (const chunk of generator) {
            const data = JSON.stringify(chunk) + '\n';
            controller.enqueue(encoder.encode(`data: ${data}\n`));
          }

          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetInSeconds),
      },
    });
  } catch (error) {
    console.error('RAG Ask API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

