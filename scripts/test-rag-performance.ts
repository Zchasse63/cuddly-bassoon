#!/usr/bin/env npx tsx
/**
 * RAG Performance Testing
 * Tests response latency and throughput
 */

import 'dotenv/config';

const TEST_QUERIES = [
  "What is the 70% rule?",
  "How do I find motivated sellers?",
  "What is MAO?",
  "Explain underwater landlords",
  "How to analyze a deal?",
];

interface PerformanceResult {
  query: string;
  searchLatencyMs: number;
  streamStartMs: number;
  totalTimeMs: number;
  cached: boolean;
  contentLength: number;
}

async function testSearchPerformance(query: string): Promise<number> {
  const start = Date.now();
  await fetch('http://localhost:3000/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit: 5 }),
  });
  return Date.now() - start;
}

async function testStreamingPerformance(query: string): Promise<Omit<PerformanceResult, 'searchLatencyMs'>> {
  const start = Date.now();
  let streamStartMs = 0;
  let cached = false;
  let contentLength = 0;

  const response = await fetch('http://localhost:3000/api/rag/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader');

  const decoder = new TextDecoder();
  let firstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (firstChunk) {
      streamStartMs = Date.now() - start;
      firstChunk = false;
    }

    const chunk = decoder.decode(value);
    contentLength += chunk.length;
    
    if (chunk.includes('"cached":true')) {
      cached = true;
    }
  }

  return {
    query,
    streamStartMs,
    totalTimeMs: Date.now() - start,
    cached,
    contentLength,
  };
}

async function main() {
  console.log('⚡ RAG Performance Testing\n');
  console.log('='.repeat(60));

  // 1. Search latency tests
  console.log('\n📍 Search Endpoint Latency (/api/rag/search)\n');
  const searchLatencies: number[] = [];

  for (const query of TEST_QUERIES) {
    const latency = await testSearchPerformance(query);
    searchLatencies.push(latency);
    const status = latency < 200 ? '✅' : '⚠️';
    console.log(`${status} "${query.slice(0, 30)}..." - ${latency}ms`);
  }

  const avgSearch = Math.round(searchLatencies.reduce((a, b) => a + b, 0) / searchLatencies.length);
  const maxSearch = Math.max(...searchLatencies);
  // Target: <500ms (includes ~300ms for OpenAI embedding generation)
  console.log(`\n   Avg: ${avgSearch}ms | Max: ${maxSearch}ms | Target: <500ms (includes embedding)`);

  // 2. Streaming response tests
  console.log('\n📍 Streaming Endpoint Performance (/api/rag/ask)\n');
  const streamResults: PerformanceResult[] = [];

  for (const query of TEST_QUERIES) {
    const searchLatency = await testSearchPerformance(query);
    const streamResult = await testStreamingPerformance(query);
    streamResults.push({ ...streamResult, searchLatencyMs: searchLatency });

    const status = streamResult.streamStartMs < 500 ? '✅' : '⚠️';
    console.log(`${status} "${query.slice(0, 30)}..."`);
    console.log(`   Stream start: ${streamResult.streamStartMs}ms | Total: ${streamResult.totalTimeMs}ms | Cached: ${streamResult.cached}`);
  }

  // 3. Cache performance (run same query twice)
  console.log('\n📍 Cache Performance Test\n');
  const cacheQuery = "What is the 70% rule?";
  
  // First request (uncached)
  const first = await testStreamingPerformance(cacheQuery);
  console.log(`   1st request (cold): ${first.totalTimeMs}ms`);
  
  // Second request (should be cached)
  const second = await testStreamingPerformance(cacheQuery);
  console.log(`   2nd request (warm): ${second.totalTimeMs}ms`);
  
  const speedup = first.totalTimeMs / second.totalTimeMs;
  console.log(`   Speedup: ${speedup.toFixed(1)}x ${second.cached ? '(cached)' : '(not cached)'}`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Performance Summary\n');

  const avgStreamStart = Math.round(streamResults.reduce((a, r) => a + r.streamStartMs, 0) / streamResults.length);
  const avgTotal = Math.round(streamResults.reduce((a, r) => a + r.totalTimeMs, 0) / streamResults.length);

  // Realistic targets: embedding generation adds ~300ms, classification adds ~200ms
  console.log(`   Search latency: ${avgSearch}ms avg (target <500ms) ${avgSearch < 500 ? '✅' : '❌'}`);
  console.log(`   Stream start: ${avgStreamStart}ms avg (target <2000ms) ${avgStreamStart < 2000 ? '✅' : '❌'}`);
  console.log(`   Total response: ${avgTotal}ms avg`);
  console.log(`   Cache speedup: ${speedup.toFixed(1)}x`);

  const searchPass = avgSearch < 500;
  const streamPass = avgStreamStart < 2000;
  
  console.log(`\n   Overall: ${searchPass && streamPass ? '✅ PASS' : '❌ FAIL'}`);
  
  process.exit(searchPass && streamPass ? 0 : 1);
}

main().catch(console.error);

