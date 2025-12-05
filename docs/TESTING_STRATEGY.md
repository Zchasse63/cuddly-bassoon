# AI Tools Testing Strategy

**Generated**: December 2024
**Platform**: AI Real Estate Wholesaling Platform

---

## Executive Summary

This document outlines the comprehensive testing strategy for the 187 AI tools implemented in the platform. The strategy covers unit testing, integration testing, end-to-end testing, and performance testing.

---

## Testing Overview

### Current Test Infrastructure

| Component | Location | Framework |
|-----------|----------|-----------|
| Unit Tests | `src/test/` | Vitest |
| AI Tools Tests | `src/test/ai-tools/` | Vitest |
| Integration Tests | `src/test/*.integration.ts` | Vitest |
| Config (Unit) | `vitest.config.ts` | Vitest |
| Config (AI Tools) | `vitest.ai-tools.config.ts` | Vitest |
| Config (Integration) | `vitest.integration.config.ts` | Vitest |

### Test Commands

```bash
# Run all unit tests
npm run test:run

# Run AI tools tests
npm run test:ai-tools

# Run integration tests (live APIs)
npm run test:live

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

---

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual tool handlers in isolation
**Mocking**: External APIs mocked
**Speed**: Fast (<1s per test)

#### Coverage Requirements

| Category | Target Coverage | Priority |
|----------|-----------------|----------|
| Property Search | 85% | High |
| Deal Analysis | 90% | High |
| Buyer Management | 80% | High |
| Skip Trace | 70% | Medium (mock) |
| Communication | 85% | High |
| Market Analysis | 80% | High |
| Predictive | 75% | Medium |

### 2. Integration Tests

**Purpose**: Test tool chains and API integrations
**Mocking**: No mocking (live APIs)
**Speed**: Slower (2-30s per test)
**Skip Conditions**: Missing API keys

#### Test Flows

| Flow | Tools | APIs |
|------|-------|------|
| Property Discovery | property-search → property-detail → market-analysis | Supabase, RentCast |
| Lead Generation | search → skip-trace → crm | Supabase |
| Deal Pipeline | deal-analysis → deal-pipeline → buyer-management | Supabase |
| Market Research | market-velocity → heat-mapping → census-geography | RentCast, Shovels, Census |
| Map Operations | map-tools → utility-tools | Mapbox |

### 3. Tool Selection Tests

**Purpose**: Verify AI selects correct tools for queries
**Location**: `src/test/ai-tools/tool-selection-precision.test.ts`

#### Test Categories

1. **Exact Match Tests**
   - "Search for properties" → `property_search.search`
   - "Analyze this deal" → `deal_analysis.analyze`

2. **Disambiguation Tests**
   - "Search" vs "Search buyers" vs "Search properties"
   - "Details" vs "Property details" vs "Deal details"

3. **Natural Language Variations**
   - "Find motivated sellers" → `predict.seller_motivation`
   - "What's the market like" → `market.get_statistics`

4. **Edge Cases**
   - Typos: "propertey" → `property_search.search`
   - Abbreviations: "DOM" → days on market tools
   - Jargon: "MAO" → `deal_analysis.calculate_mao`

### 4. Multi-Turn Conversation Tests

**Purpose**: Test context retention and tool chaining
**Location**: `src/test/ai-tools/multi-turn-conversation.test.ts`

#### Scenarios

1. **Property Analysis Flow**
   ```
   Turn 1: "Search for properties in Phoenix"
   Turn 2: "Tell me more about the first one"
   Turn 3: "What's the ARV?"
   Turn 4: "Calculate the MAO"
   ```

2. **Buyer Matching Flow**
   ```
   Turn 1: "I have a property at 123 Main St"
   Turn 2: "Find matching buyers"
   Turn 3: "Send info to the top match"
   ```

3. **Deal Pipeline Flow**
   ```
   Turn 1: "Show my active deals"
   Turn 2: "Move the Phoenix deal to negotiation"
   Turn 3: "Add a note about the seller's response"
   ```

---

## Test File Structure

```
src/test/
├── setup.ts                       # Base test setup
├── setup.integration.ts           # Integration test setup
├── ai-tools/
│   ├── README.md                  # Test documentation
│   ├── setup.ts                   # AI tools test setup
│   ├── seed-test-data.ts          # Database seeding
│   ├── single-turn-tools.test.ts  # Individual tool tests
│   ├── multi-turn-conversation.test.ts
│   ├── model-selection.test.ts
│   └── tool-selection-precision.test.ts
├── lib/
│   └── [module].test.ts           # Unit tests per module
└── api/
    └── [endpoint].test.ts         # API endpoint tests
```

---

## Environment Setup

### Required Environment Variables

```env
# Required for all tests
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_PROJECT_REF=xxx

# Required for AI tests
XAI_API_KEY=xai-...

# Optional - tests skip if missing
RENTCAST_API_KEY=...
SHOVELS_API_KEY=...
MAPBOX_ACCESS_TOKEN=pk.eyJ...

# Not yet integrated (skip trace)
SKIP_TRACE_API_KEY=...
```

### Database Seeding

```bash
# Seed test data before running integration tests
npx tsx src/test/ai-tools/seed-test-data.ts
```

---

## Test Patterns

### 1. Tool Handler Unit Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { propertySearchHandler } from '@/lib/ai/tools/categories/property-search';

describe('propertySearchHandler', () => {
  it('should search properties with valid filters', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: [{ id: '1', address: '123 Main St' }],
    };

    const result = await propertySearchHandler(
      { city: 'Phoenix', state: 'AZ' },
      { userId: 'test-user', supabase: mockSupabase }
    );

    expect(result.properties).toHaveLength(1);
    expect(mockSupabase.from).toHaveBeenCalledWith('properties');
  });

  it('should handle empty results', async () => {
    const result = await propertySearchHandler(
      { city: 'Nonexistent', state: 'XX' },
      { userId: 'test-user' }
    );

    expect(result.properties).toHaveLength(0);
  });
});
```

### 2. Tool Selection Test

```typescript
import { describe, it, expect } from 'vitest';
import { selectTool } from '@/lib/ai/tool-selector';

describe('Tool Selection', () => {
  it('should select property_search.search for property queries', async () => {
    const queries = [
      'Search for properties',
      'Find houses in Phoenix',
      'Show me listings under $200k',
    ];

    for (const query of queries) {
      const selected = await selectTool(query);
      expect(selected.id).toBe('property_search.search');
    }
  });

  it('should disambiguate between similar tools', async () => {
    const searchBuyers = await selectTool('Find cash buyers');
    expect(searchBuyers.id).toBe('buyer_management.search_buyers');

    const searchProperties = await selectTool('Find properties');
    expect(searchProperties.id).toBe('property_search.search');
  });
});
```

### 3. Integration Test

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { skipIfNoApi, createTestContext } from './setup';

describe('Market Analysis Integration', () => {
  beforeAll(() => {
    skipIfNoApi('rentcast');
  });

  it('should get real market data', async () => {
    const ctx = await createTestContext();

    const result = await getMarketStatistics(
      { zipCode: '85001' },
      ctx
    );

    expect(result.medianPrice).toBeGreaterThan(0);
    expect(result.avgDaysOnMarket).toBeDefined();
  });
});
```

### 4. Multi-Turn Test

```typescript
import { describe, it, expect } from 'vitest';
import { ConversationContext } from '@/lib/ai/conversation';

describe('Multi-Turn Conversation', () => {
  it('should retain context across turns', async () => {
    const conversation = new ConversationContext();

    // Turn 1
    const result1 = await conversation.process(
      'Search for properties in Phoenix'
    );
    expect(result1.toolCalled).toBe('property_search.search');

    // Turn 2 - should use context
    const result2 = await conversation.process(
      'What about the first one?'
    );
    expect(result2.toolCalled).toBe('property_search.get_details');
    expect(result2.input.propertyId).toBeDefined();
  });
});
```

---

## Model Selection Testing

### Test Matrix

| Query Type | Expected Model | Test File |
|------------|---------------|-----------|
| Complex Analysis | Reasoning (Opus) | model-selection.test.ts |
| Content Generation | Fast (Sonnet) | model-selection.test.ts |
| Simple Q&A | Standard (Haiku) | model-selection.test.ts |

### Test Cases

```typescript
describe('Model Selection', () => {
  it('should route complex analysis to Reasoning model', async () => {
    const queries = [
      'Analyze this deal comprehensively',
      'Evaluate the risk factors',
      'Compare multiple investment strategies',
    ];

    for (const query of queries) {
      const model = await selectModel(query);
      expect(model.tier).toBe('reasoning');
    }
  });
});
```

---

## Performance Testing

### Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| Tool Selection | <500ms | ~350ms |
| Property Search | <2s | ~1.5s |
| Market Analysis | <3s | ~2.5s |
| Deal Analysis | <2s | ~1.8s |

### Load Testing

```bash
# Run with k6 (if installed)
k6 run load-tests/ai-tools.js
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run

  ai-tools-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:ai-tools
    env:
      XAI_API_KEY: ${{ secrets.XAI_API_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      # ... other secrets
```

---

## Test Data Management

### Fixtures

```
src/test/fixtures/
├── properties.json      # Test property data
├── buyers.json          # Test buyer data
├── deals.json           # Test deal data
├── market-data.json     # Mock market data
└── api-responses/
    ├── rentcast/
    ├── shovels/
    └── mapbox/
```

### Database Seeding Script

```typescript
// src/test/ai-tools/seed-test-data.ts
async function seedTestData() {
  // Create test user
  const userId = await createTestUser();

  // Seed properties
  await seedProperties(userId, 50);

  // Seed buyers
  await seedBuyers(userId, 20);

  // Seed deals
  await seedDeals(userId, 10);

  // Seed leads
  await seedLeads(userId, 30);
}
```

---

## Coverage Reporting

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Thresholds

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```

---

## Troubleshooting

### Common Issues

1. **Tests Timing Out**
   - Increase timeout in vitest config
   - Check API rate limits
   - Verify network connectivity

2. **API Errors**
   - Verify environment variables
   - Check API key validity
   - Tests skip gracefully if API unavailable

3. **Database Errors**
   - Run seed script
   - Check Supabase connection
   - Verify RLS policies

### Debug Mode

```bash
# Run with verbose logging
DEBUG=true npm run test:ai-tools

# Run single test file
npx vitest run src/test/ai-tools/single-turn-tools.test.ts

# Run with watch mode
npx vitest src/test/ai-tools --watch
```

---

## Test Results

### Viewing Results

```bash
# Open HTML report
open ./test-results/ai-tools-report.html

# View coverage report
open ./coverage/index.html
```

---

## Adding New Tests

### Checklist for New Tools

1. [ ] Add unit test for handler
2. [ ] Add tool selection test
3. [ ] Add integration test (if uses external API)
4. [ ] Add multi-turn test (if part of workflow)
5. [ ] Update fixtures if needed
6. [ ] Verify coverage meets threshold

### Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { newToolHandler } from '@/lib/ai/tools/categories/new-tool';

describe('newToolHandler', () => {
  it('should handle valid input', async () => {
    const result = await newToolHandler(
      { /* valid input */ },
      { userId: 'test-user' }
    );

    expect(result).toBeDefined();
    // Add specific assertions
  });

  it('should validate input schema', async () => {
    await expect(
      newToolHandler({ /* invalid input */ }, { userId: 'test' })
    ).rejects.toThrow();
  });

  it('should handle errors gracefully', async () => {
    // Test error conditions
  });
});
```

---

*Document generated as part of Integration Audit Phase 5*
