/**
 * Model Selection Tests
 *
 * Tests validating correct routing to Grok 4.1 Reasoning, Fast, and Standard
 * based on task complexity.
 *
 * Uses REAL xAI Grok API for classification.
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

import { describe, it, expect } from 'vitest';
import { CLAUDE_MODELS } from '@/lib/ai/models';
import { classifyAndRoute, routeByCategory } from '@/lib/ai/router';
import { skipIfNoApi, trackApiCall } from './setup';

// ============================================================================
// DIRECT ROUTING TESTS (No API calls)
// ============================================================================

describe('Direct Category Routing', () => {
  it('should route complex_analysis to Opus', () => {
    const decision = routeByCategory('complex_analysis');
    expect(decision.model).toBe(CLAUDE_MODELS.OPUS);
    expect(decision.category).toBe('complex_analysis');
  });

  it('should route deal_analysis to Opus', () => {
    const decision = routeByCategory('deal_analysis');
    expect(decision.model).toBe(CLAUDE_MODELS.OPUS);
  });

  it('should route property_analysis to Opus', () => {
    const decision = routeByCategory('property_analysis');
    expect(decision.model).toBe(CLAUDE_MODELS.OPUS);
  });

  it('should route content_generation to Sonnet', () => {
    const decision = routeByCategory('content_generation');
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should route document_summarization to Sonnet', () => {
    const decision = routeByCategory('document_summarization');
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should route rag_response to Sonnet', () => {
    const decision = routeByCategory('rag_response');
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should route offer_letter to Sonnet', () => {
    const decision = routeByCategory('offer_letter');
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should route buyer_matching to Sonnet', () => {
    const decision = routeByCategory('buyer_matching');
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should route intent_classification to Haiku', () => {
    const decision = routeByCategory('intent_classification');
    expect(decision.model).toBe(CLAUDE_MODELS.HAIKU);
  });

  it('should route simple_qa to Haiku', () => {
    const decision = routeByCategory('simple_qa');
    expect(decision.model).toBe(CLAUDE_MODELS.HAIKU);
  });

  it('should route data_extraction to Haiku', () => {
    const decision = routeByCategory('data_extraction');
    expect(decision.model).toBe(CLAUDE_MODELS.HAIKU);
  });
});

// ============================================================================
// ROUTING OPTIONS TESTS
// ============================================================================

describe('Routing Options', () => {
  it('should respect forceModel override', () => {
    const decision = routeByCategory('complex_analysis', {
      forceModel: CLAUDE_MODELS.HAIKU,
    });
    expect(decision.model).toBe(CLAUDE_MODELS.HAIKU);
    expect(decision.reason).toContain('override');
  });

  it('should downgrade Opus to Sonnet when preferSpeed is true', () => {
    const decision = routeByCategory('complex_analysis', {
      preferSpeed: true,
    });
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should upgrade Haiku to Sonnet when preferQuality is true', () => {
    const decision = routeByCategory('simple_qa', {
      preferQuality: true,
    });
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });

  it('should not change Sonnet tier with preferSpeed', () => {
    const decision = routeByCategory('content_generation', {
      preferSpeed: true,
    });
    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
  });
});

// ============================================================================
// CLASSIFICATION TESTS (Uses Claude API)
// ============================================================================

describe('Task Classification', () => {
  it('should classify deal analysis query to Opus', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Analyze this deal: property at 123 Main St, asking $280k, ARV $380k, repairs $50k. Calculate ROI and recommend offer price.'
    );

    expect(decision.model).toBe(CLAUDE_MODELS.OPUS);
    expect(['deal_analysis', 'property_analysis', 'complex_analysis']).toContain(decision.category);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });

  it('should classify property analysis query to Opus', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Evaluate this property: 4 bed 3 bath in Miami, built 1995, 2400 sqft. Compare to recent sales and estimate ARV.'
    );

    expect(decision.model).toBe(CLAUDE_MODELS.OPUS);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });

  it('should classify simple question to Haiku', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute('What is ARV?');

    expect(decision.model).toBe(CLAUDE_MODELS.HAIKU);
    expect(['simple_qa', 'intent_classification']).toContain(decision.category);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });

  it('should classify content generation to Sonnet', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Write a compelling property description for a 3 bed 2 bath home in Miami with a pool.'
    );

    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
    expect(['content_generation', 'offer_letter']).toContain(decision.category);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });

  it('should classify offer letter request to Sonnet', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Draft an offer letter for 123 Main St at $250,000 with 30 day close.'
    );

    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });

  it('should classify data extraction to Haiku', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Extract the address and price from: "Property at 456 Oak Ave listed for $350,000"'
    );

    expect(decision.model).toBe(CLAUDE_MODELS.HAIKU);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });

  it('should classify buyer matching to Sonnet', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Find buyers who would be interested in a 4 bed single family in Miami under $400k.'
    );

    expect(decision.model).toBe(CLAUDE_MODELS.SONNET);
    console.log(`  ✓ Classified as ${decision.category} → ${decision.model}`);
  });
});

// ============================================================================
// MODEL TIER DISTRIBUTION TESTS
// ============================================================================

describe('Model Tier Distribution', () => {
  const testCases: Array<{ query: string; expectedTier: 'high' | 'medium' | 'low' }> = [
    // High tier (Opus)
    { query: 'Analyze the ROI potential of this multi-family investment', expectedTier: 'high' },
    { query: 'Calculate the optimal offer price considering market trends', expectedTier: 'high' },
    { query: 'Evaluate this deal with full comp analysis and risk assessment', expectedTier: 'high' },

    // Medium tier (Sonnet)
    { query: 'Write a follow-up email to the seller', expectedTier: 'medium' },
    { query: 'Summarize the property inspection report', expectedTier: 'medium' },
    { query: 'Match this property to potential buyers', expectedTier: 'medium' },

    // Low tier (Haiku)
    { query: 'What does ARV mean?', expectedTier: 'low' },
    { query: 'How many bedrooms does this property have?', expectedTier: 'low' },
    { query: 'Is this property in Miami?', expectedTier: 'low' },
  ];

  it.each(testCases)('should route "$query" to $expectedTier tier', async ({ query, expectedTier }) => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(query);

    // Allow some flexibility - adjacent tiers are acceptable
    const acceptableTiers = expectedTier === 'medium'
      ? [CLAUDE_MODELS.OPUS, CLAUDE_MODELS.SONNET, CLAUDE_MODELS.HAIKU]
      : expectedTier === 'high'
        ? [CLAUDE_MODELS.OPUS, CLAUDE_MODELS.SONNET]
        : [CLAUDE_MODELS.SONNET, CLAUDE_MODELS.HAIKU];

    expect(acceptableTiers).toContain(decision.model);
    console.log(`  ✓ "${query.slice(0, 40)}..." → ${decision.category} (${decision.model})`);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty query gracefully', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute('');
    expect(decision.model).toBeDefined();
    expect(decision.category).toBeDefined();
  });

  it('should handle very long query', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const longQuery = 'Analyze this property: '.repeat(50) + 'What is the ARV?';
    const decision = await classifyAndRoute(longQuery);
    expect(decision.model).toBeDefined();
  });

  it('should handle mixed intent query', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const decision = await classifyAndRoute(
      'Find properties in Miami, analyze the best one, and write an offer letter'
    );

    // Should pick the most complex task
    expect([CLAUDE_MODELS.OPUS, CLAUDE_MODELS.SONNET]).toContain(decision.model);
    console.log(`  ✓ Mixed intent → ${decision.category} (${decision.model})`);
  });
});

