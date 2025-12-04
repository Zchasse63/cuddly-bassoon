# AI Tools Testing Suite

Comprehensive testing suite for AI tool selection, model routing, and conversation handling.

## Quick Start

```bash
# Run all AI tools tests
npm run test:ai-tools

# Run specific test file
npx vitest run src/test/ai-tools/single-turn-tools.test.ts

# Run with verbose output
npx vitest run src/test/ai-tools --reporter=verbose
```

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with:

```env
# Required - Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional - External APIs (tests will skip if not available)
MAPBOX_ACCESS_TOKEN=pk.eyJ...
SHOVELS_API_KEY=...
RENTCAST_API_KEY=...
```

### Database Seeding

Before running tests, seed the database with test data:

```bash
npx tsx src/test/ai-tools/seed-test-data.ts
```

## Test Files

| File | Description |
|------|-------------|
| `single-turn-tools.test.ts` | Tool selection accuracy, input validation, error handling |
| `multi-turn-conversation.test.ts` | Context retention, tool chaining, refinement handling |
| `model-selection.test.ts` | Model routing (Opus/Sonnet/Haiku) based on task complexity |
| `tool-selection-precision.test.ts` | Exact match, disambiguation, natural language variations |

## Test Categories

### Single-Turn Tests
- Tool registry validation
- Tool selection accuracy (property, buyer, deal, skip trace, map)
- Input validation (schema enforcement)
- Tool execution (direct execution tests)
- Category-specific tests

### Multi-Turn Tests
- Context retention across turns
- Tool chaining (search → detail → analysis)
- Refinement handling (user corrections)
- Complex workflows (full deal workflow)
- Conversation recovery (ambiguous requests, topic switches)

### Model Selection Tests
- Direct category routing (no API)
- Routing options (forceModel, preferSpeed, preferQuality)
- Task classification (uses Claude API)
- Model tier distribution validation

### Tool Selection Precision Tests
- Exact match tests
- Disambiguation tests (search vs detail, list vs match)
- Negative tests (should NOT select certain tools)
- Compound query tests
- Natural language variations
- Context-dependent selection
- Edge cases (typos, abbreviations, jargon)

## API Usage

Tests use **REAL APIs** by default:
- ✅ Claude API (Anthropic)
- ✅ Supabase (database)
- ✅ Mapbox (geocoding, isochrones)
- ✅ Shovels (permits, contractors)
- ✅ RentCast (property valuation)
- ⚠️ Skip Trace (MOCKED - no live API available)

## Model Selection Strategy

The test suite uses a **deliberate model selection strategy**:

| Test File | Model Used | Reason |
|-----------|------------|--------|
| `model-selection.test.ts` | Opus/Sonnet/Haiku | Explicitly tests routing logic |
| `single-turn-tools.test.ts` | Sonnet | Tool selection tests |
| `multi-turn-conversation.test.ts` | Sonnet | Context retention tests |
| `tool-selection-precision.test.ts` | Sonnet | Precision tests |

**Why Sonnet for most tests?**
- Balance between speed and capability
- Cost-effective for high-volume testing
- Sufficient for tool selection accuracy
- Model routing is tested separately in `model-selection.test.ts`

**The routing logic** (`src/lib/ai/router.ts`) routes tasks as:
- **Opus (High)**: Complex analysis, deal evaluation, property analysis
- **Sonnet (Medium)**: Content generation, buyer matching, offer letters
- **Haiku (Low)**: Simple Q&A, intent classification, data extraction

## Configuration

The test suite uses a custom Vitest config at `vitest.ai-tools.config.ts`:

- **Timeout**: 180 seconds per test (API calls can be slow)
- **Execution**: Sequential (avoids rate limiting)
- **Reporter**: HTML report at `./test-results/ai-tools-report.html`

## Running Specific Tests

```bash
# Run only tool selection tests
npx vitest run src/test/ai-tools/single-turn-tools.test.ts -t "Tool Selection"

# Run only model routing tests
npx vitest run src/test/ai-tools/model-selection.test.ts -t "Direct Category"

# Run with watch mode
npx vitest src/test/ai-tools --watch
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `vitest.ai-tools.config.ts`
- Check API rate limits

### API Errors
- Verify environment variables are set
- Check API key validity
- Tests will skip if API is unavailable

### Database Errors
- Run seed script: `npx tsx src/test/ai-tools/seed-test-data.ts`
- Check Supabase connection

## Test Results

After running tests, view the HTML report:
```bash
open ./test-results/ai-tools-report.html
```

## Adding New Tests

1. Import test utilities from `./setup`
2. Use `skipIfNoApi('service')` for API-dependent tests
3. Use `trackApiCall('service', tokens)` for tracking
4. Use `createTestContext()` for tool execution context

