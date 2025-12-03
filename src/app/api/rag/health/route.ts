/**
 * RAG Health Check Endpoint
 * Verifies all RAG system dependencies are operational.
 *
 * Checks:
 * - Supabase database connection (embeddings table)
 * - Upstash Redis connection (cache)
 * - OpenAI API (embeddings)
 * - Anthropic API (generation)
 *
 * Returns:
 * - 200: All systems operational
 * - 503: One or more systems unavailable
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redis } from '@/lib/cache/redis';
import { ragCache } from '@/lib/rag/cache';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    supabase: ServiceStatus;
    redis: ServiceStatus;
    openai: ServiceStatus;
    anthropic: ServiceStatus;
  };
  cache: {
    queryCount: number;
    embeddingCount: number;
  };
}

interface ServiceStatus {
  status: 'up' | 'down' | 'slow';
  latencyMs: number;
  error?: string;
}

async function checkSupabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    
    const { error } = await supabase
      .from('embeddings')
      .select('*', { count: 'exact', head: true });
    
    const latencyMs = Date.now() - start;
    
    if (error) {
      return { status: 'down', latencyMs, error: error.message };
    }
    
    return { 
      status: latencyMs > 2000 ? 'slow' : 'up', 
      latencyMs,
    };
  } catch (error) {
    return { 
      status: 'down', 
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    // Simple ping test
    await redis.ping();
    const latencyMs = Date.now() - start;
    
    return { 
      status: latencyMs > 500 ? 'slow' : 'up', 
      latencyMs,
    };
  } catch (error) {
    return { 
      status: 'down', 
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkOpenAI(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Minimal embedding request to verify API is working
    await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'health check',
      dimensions: 1536,
    });
    
    const latencyMs = Date.now() - start;
    
    return { 
      status: latencyMs > 3000 ? 'slow' : 'up', 
      latencyMs,
    };
  } catch (error) {
    return { 
      status: 'down', 
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkAnthropic(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Minimal message request with fastest model
    await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Reply with OK' }],
    });
    
    const latencyMs = Date.now() - start;
    
    return { 
      status: latencyMs > 5000 ? 'slow' : 'up', 
      latencyMs,
    };
  } catch (error) {
    return { 
      status: 'down', 
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Run all health checks in parallel
    const [supabase, redisStatus, openai, anthropic, cacheStats] = await Promise.all([
      checkSupabase(),
      checkRedis(),
      checkOpenAI(),
      checkAnthropic(),
      ragCache.getStats(),
    ]);

    const services = { supabase, redis: redisStatus, openai, anthropic };
    
    // Determine overall status
    const statuses = Object.values(services).map(s => s.status);
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (statuses.some(s => s === 'down')) {
      overallStatus = 'unhealthy';
    } else if (statuses.some(s => s === 'slow')) {
      overallStatus = 'degraded';
    }

    const health: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      cache: cacheStats,
    };

    const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

    return new Response(JSON.stringify(health, null, 2), {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

