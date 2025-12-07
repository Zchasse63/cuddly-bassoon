# RAG Improvements Implementation Plan

## Overview
Enhance the unified AI chat system with comprehensive RAG improvements including expanded knowledge base content, intelligent categorization, and multi-category retrieval for full contextual awareness.

## Improvements Summary
- **Phase 0A**: Expanded Knowledge Base - Add tool docs, data sources, platform workflows, data interpretation
- **Phase 0B**: Intelligent Categorization Strategy - Tags, related docs, cross-category linking
- **Phase 1**: Query Reformulation - Transform action queries into knowledge-seeking queries
- **Phase 2**: Tool-Aware RAG - Pre-associate tools with relevant KB categories
- **Phase 3**: Conversation Context - Accumulate concepts across multi-turn conversations
- **Phase 4**: Dynamic Re-Retrieval - Fetch additional context when tool results contain unexpected terms
- **Phase 5**: Multi-Category Retrieval - Ensure diverse, holistic context from multiple knowledge domains

---

## The Core Problem We're Solving

**Current retrieval:** Top 3 docs by similarity from any category
```
Query: "Calculate MAO for this property"
Current Result: 3 docs about 70% rule (all from Fundamentals)
```

**What we need:** Holistic context from multiple relevant domains
```
Query: "Calculate MAO for this property"
Better Result:
  - 1 doc: 70% rule formula (Fundamentals)
  - 1 doc: How to use calculate_mao tool (AI Tools)
  - 1 doc: What RentCast ARV means (Data Sources)
  - 1 doc: Deal pipeline after calculating offer (Platform Workflows)
```

---

## Complete Knowledge Base Category Structure

### Existing Categories (10)
1. **Fundamentals** - Core concepts (ARV, MAO, 70% rule, comps)
2. **Filter System** - Property filters (absentee, high equity, probate)
3. **Buyer Intelligence** - Cash buyers, investor criteria
4. **Market Analysis** - Market conditions, trends, indicators
5. **Deal Analysis** - Evaluating deals, due diligence
6. **Negotiations** - Offer strategies, objection handling
7. **Outreach & Communication** - Scripts, campaigns, follow-up
8. **Risk Factors** - Red flags, deal killers, warnings
9. **Legal & Compliance** - Contracts, disclosures, regulations
10. **Case Studies & Examples** - Real-world scenarios

### New Categories (4)
11. **AI Tools** - Documentation for all 212 platform tools
12. **Data Sources** - RentCast, Shovels, Census API documentation
13. **Platform Workflows** - How the platform works (CRM, pipeline, map, lists)
14. **Data Interpretation** - How to read and understand data/results

---

## Phase 0A: Expanded Knowledge Base Content

### Category 11: AI Tools (~50-60 docs)

**Purpose:** Teach the AI WHEN and HOW to use each tool

**Structure:**
```
knowledge-base/11-ai-tools/
├── _overview.md                    # Category introduction
├── tool-selection-guide.md         # When to use which tool type
├── deal-analysis/
│   ├── analyze-deal.md
│   ├── calculate-mao.md
│   ├── score-deal.md
│   └── _subcategory.md
├── property-search/
│   ├── natural-language-search.md
│   ├── filter-based-search.md
│   └── map-draw-search.md
├── buyer-management/
├── market-analysis/
├── crm-tools/
├── skip-trace/
├── notifications/
├── documents/
├── predictive/
└── batch-operations/
```

**Grouping Strategy:** Instead of 212 individual docs, group related tools:
- `deal-analysis-tools.md` covers analyze, calculate_mao, score (3 tools, 1 doc)
- `property-search-tools.md` covers search, get_details, similar (3 tools, 1 doc)

**Document Template:**
```yaml
---
slug: tool-deal-analysis-calculate-mao
title: Calculate MAO Tool - Maximum Allowable Offer Calculator
category: AI Tools
subcategory: Deal Analysis Tools
tags:
  - mao-calculation
  - offer-price
  - 70-percent-rule
  - deal-evaluation
  - tool-deal-analysis
related_docs:
  - arv-calculation-methods        # Fundamentals
  - rentcast-valuation-data        # Data Sources
  - deal-pipeline-workflow         # Platform Workflows
  - interpreting-arv-estimates     # Data Interpretation
difficulty_level: beginner
tool_ids: [deal_analysis.calculate_mao]
---
```

### Category 12: Data Sources (~10-12 docs)

**Purpose:** Help AI understand WHERE data comes from and what it means

**Documents:**
```
knowledge-base/12-data-sources/
├── _overview.md                           # Data ecosystem overview
├── rentcast/
│   ├── rentcast-overview.md               # What RentCast provides
│   ├── rentcast-valuation-data.md         # AVM methodology, accuracy
│   ├── rentcast-property-data.md          # Property characteristics
│   ├── rentcast-market-data.md            # Market statistics
│   └── rentcast-limitations.md            # When to question values
├── shovels/
│   ├── shovels-overview.md                # What Shovels provides
│   ├── shovels-permit-data.md             # Permit types, meanings
│   ├── shovels-contractor-data.md         # Contractor info
│   └── shovels-vitality-scores.md         # Property activity indicators
├── census/
│   ├── census-overview.md                 # Geographic data
│   ├── census-boundaries.md               # Tracts, block groups
│   └── census-demographics.md             # Population, income data
└── data-freshness.md                      # How current is each source
```

**Example Document:**
```yaml
---
slug: rentcast-valuation-data
title: Understanding RentCast Valuation Data - AVM Accuracy and Limitations
category: Data Sources
subcategory: RentCast
tags:
  - rentcast
  - avm
  - property-valuation
  - arv
  - data-accuracy
  - automated-valuation
related_docs:
  - arv-calculation-methods        # Fundamentals
  - tool-property-valuation        # AI Tools
  - interpreting-arv-estimates     # Data Interpretation
difficulty_level: intermediate
---

# Understanding RentCast Valuation Data

## What is RentCast's AVM?
RentCast uses an Automated Valuation Model (AVM) that analyzes...

## Accuracy Expectations
- Typical variance: ±5-10% in stable markets
- Higher variance in: rural areas, unique properties, volatile markets

## When to Trust the AVM
- Standard SFR in suburban areas
- Recent comparable sales nearby
- Typical property characteristics

## When to Verify Manually
- Properties with significant deferred maintenance
- Unique architectural styles
- Limited comparable sales
- Major market shifts

## How This Affects Your MAO Calculation
If RentCast shows ARV of $300,000:
- Conservative estimate: $285,000 (5% discount)
- Use for MAO: ($285,000 × 0.70) - repairs - fee
```

### Category 13: Platform Workflows (~12-15 docs)

**Purpose:** Help AI guide users through YOUR specific platform

**Documents:**
```
knowledge-base/13-platform-workflows/
├── _overview.md                           # Platform introduction
├── getting-started/
│   ├── first-search.md                    # Running your first search
│   ├── understanding-results.md           # Reading search results
│   └── saving-properties.md               # Lists, favorites
├── crm-pipeline/
│   ├── lead-stages.md                     # Lead lifecycle
│   ├── deal-stages.md                     # Deal pipeline stages
│   ├── moving-deals.md                    # Stage transitions
│   └── activity-tracking.md               # Notes, calls, tasks
├── map-features/
│   ├── map-overview.md                    # Map interface
│   ├── draw-search-areas.md               # Drawing search polygons
│   ├── heat-maps.md                       # Understanding heat maps
│   └── drive-time-analysis.md             # Commute/isochrone
├── lists-filters/
│   ├── creating-filters.md                # Building filters
│   ├── saved-searches.md                  # Saving and reusing
│   ├── list-stacking.md                   # Combining lists
│   └── export-options.md                  # Exporting data
├── notifications/
│   ├── alert-setup.md                     # Setting up alerts
│   ├── sms-campaigns.md                   # SMS outreach
│   └── email-sequences.md                 # Email automation
└── integrations/
    └── calendar-crm-sync.md               # External integrations
```

### Category 14: Data Interpretation (~15-20 docs)

**Purpose:** Help AI EXPLAIN results and guide decision-making

**Documents:**
```
knowledge-base/14-data-interpretation/
├── _overview.md                           # How to read platform data
├── property-metrics/
│   ├── interpreting-arv-estimates.md      # What ARV values mean
│   ├── interpreting-equity-percentage.md  # High vs low equity
│   ├── interpreting-dom.md                # Days on market signals
│   ├── interpreting-motivation-scores.md  # Seller motivation
│   └── interpreting-deal-scores.md        # Deal quality ratings
├── market-indicators/
│   ├── interpreting-market-velocity.md    # Hot vs cold markets
│   ├── interpreting-absorption-rate.md    # Supply/demand
│   ├── interpreting-price-trends.md       # Appreciation/depreciation
│   └── interpreting-competition.md        # Investor activity
├── owner-signals/
│   ├── interpreting-absentee-status.md    # What absentee means
│   ├── interpreting-ownership-length.md   # Time-based motivation
│   ├── interpreting-portfolio-size.md     # Individual vs investor
│   └── interpreting-distress-indicators.md # Financial trouble signs
├── permit-signals/
│   ├── interpreting-permit-activity.md    # What permits indicate
│   ├── interpreting-permit-gaps.md        # Stalled projects
│   └── interpreting-contractor-history.md # Work quality signals
└── combined-analysis/
    ├── combining-multiple-signals.md      # Holistic analysis
    └── red-flag-combinations.md           # Warning patterns
```

**Example Document:**
```yaml
---
slug: interpreting-motivation-scores
title: Understanding Seller Motivation Scores - What the Numbers Mean
category: Data Interpretation
subcategory: Property Metrics
tags:
  - motivation-score
  - seller-motivation
  - lead-prioritization
  - signal-interpretation
related_docs:
  - motivated-seller-indicators    # Fundamentals
  - tool-predict-seller-motivation # AI Tools
  - rentcast-property-data         # Data Sources
  - lead-stages                    # Platform Workflows
difficulty_level: intermediate
---

# Understanding Seller Motivation Scores

## Score Ranges
| Score | Meaning | Action |
|-------|---------|--------|
| 80-100 | High motivation - multiple strong signals | Priority outreach |
| 60-79 | Moderate motivation - some positive signals | Standard follow-up |
| 40-59 | Low motivation - few indicators | Nurture campaign |
| 0-39 | Minimal motivation | Low priority |

## What Contributes to the Score
- Ownership duration (longer = higher for individuals, lower for investors)
- Equity position (high equity = more flexibility)
- Property condition signals (permits, maintenance)
- Life event indicators (inheritance, divorce records)
- Market pressure (foreclosure, tax liens)

## Score vs Reality
The score is a PROBABILITY indicator, not a guarantee:
- Score 85 doesn't mean "definitely will sell"
- Score 35 doesn't mean "definitely won't sell"
- Use as prioritization, not elimination

## When Scores Mislead
- New inheritance (no history yet)
- Recent job relocation (not in data)
- Family circumstances (private)
```

---

## Phase 0B: Intelligent Categorization Strategy

### The Tagging Taxonomy

**Tag Prefixes for Cross-Category Discovery:**
```
concept-*     : Domain concepts (concept-arv, concept-mao, concept-equity)
tool-*        : Related tools (tool-deal-analysis, tool-property-search)
data-*        : Data sources (data-rentcast, data-shovels, data-census)
workflow-*    : Platform workflows (workflow-pipeline, workflow-crm)
signal-*      : Interpretation signals (signal-motivation, signal-distress)
action-*      : User actions (action-search, action-offer, action-negotiate)
```

**Example Tag Matrix:**
| Document | Tags |
|----------|------|
| 70% Rule (Fundamentals) | `concept-mao`, `concept-arv`, `tool-deal-analysis`, `action-offer` |
| Calculate MAO Tool (AI Tools) | `tool-deal-analysis`, `concept-mao`, `action-offer`, `data-rentcast` |
| RentCast Valuation (Data Sources) | `data-rentcast`, `concept-arv`, `tool-property-valuation` |
| Deal Pipeline (Platform Workflows) | `workflow-pipeline`, `action-offer`, `tool-deal-create` |
| Interpreting ARV (Data Interpretation) | `signal-valuation`, `data-rentcast`, `concept-arv` |

### Related Documents Strategy

**Every document MUST have related_docs from multiple categories:**
```yaml
related_docs:
  - <fundamentals-doc>         # Domain knowledge
  - <ai-tools-doc>             # How to do it in platform
  - <data-sources-doc>         # Where data comes from
  - <platform-workflows-doc>   # How to proceed
  - <data-interpretation-doc>  # How to understand results
```

**This creates a knowledge graph** where any entry point leads to holistic understanding.

### Slug Naming Convention

```
# By Category
fundamentals:        70-percent-rule, arv-calculation-methods
filters:             filter-high-equity, filter-absentee-owner
ai-tools:            tool-deal-analysis-calculate-mao, tool-property-search
data-sources:        rentcast-valuation-data, shovels-permit-data
platform-workflows:  workflow-deal-pipeline, workflow-map-search
data-interpretation: interpret-motivation-score, interpret-arv-estimate
```

---

## Phase 5: Multi-Category Retrieval Strategy

### The Problem with Simple Top-N
```
searchDocuments("calculate MAO", { limit: 5 })
→ Returns 5 docs from Fundamentals (highest similarity)
→ Misses tool docs, data docs, workflow docs
```

### New Retrieval Algorithm

**Category-Diverse Retrieval:**
```typescript
interface DiverseRetrievalOptions {
  query: string;
  totalLimit: number;           // Total docs to return (e.g., 6)
  minCategories: number;        // Minimum category diversity (e.g., 3)
  categoryWeights?: Record<string, number>;  // Priority weights
  requiredCategories?: string[]; // Always include these
}

async function diverseRAGRetrieval(options: DiverseRetrievalOptions): Promise<SearchResult[]> {
  // 1. Identify relevant categories for this query
  const relevantCategories = identifyRelevantCategories(options.query);

  // 2. For each relevant category, get top matches
  const categoryResults = await Promise.all(
    relevantCategories.map(cat =>
      searchDocuments(options.query, {
        categories: [cat],
        limit: 3  // Top 3 per category
      })
    )
  );

  // 3. Interleave results to ensure diversity
  // Take 1 from each category in round-robin until limit reached
  const diverseResults = interleaveByCategory(categoryResults, options.totalLimit);

  // 4. Ensure minimum category representation
  return ensureMinCategoryDiversity(diverseResults, options.minCategories);
}
```

### Retrieval Configuration by Query Type

| Query Type | Categories to Pull | Docs per Category |
|------------|-------------------|-------------------|
| "How do I..." (action) | AI Tools (2), Platform Workflows (2), Fundamentals (1) | 5 total |
| "What is..." (concept) | Fundamentals (2), Data Interpretation (2), AI Tools (1) | 5 total |
| "Why is the score..." (interpretation) | Data Interpretation (2), Data Sources (1), Fundamentals (1) | 4 total |
| Tool likely (MAO, search) | AI Tools (2), Fundamentals (1), Data Sources (1), Platform Workflows (1) | 5 total |

### Implementation in route.ts

```typescript
// Determine query intent
const queryIntent = classifyQueryIntent(userQuery); // 'action' | 'concept' | 'interpretation' | 'tool'

// Get category configuration for this intent
const categoryConfig = getCategoryConfig(queryIntent);

// Fetch with diversity
const ragResult = await diverseRAGRetrieval({
  query: reformulated.knowledgeQuery,
  totalLimit: 6,
  minCategories: 3,
  categoryWeights: categoryConfig.weights,
  requiredCategories: categoryConfig.required,
});
```

---

## Updated Implementation Order

### Phase 0A: Content Creation (Foundation)
1. Create knowledge base directory structure for new categories
2. Write Data Sources documentation (~10-12 docs)
3. Write Platform Workflows documentation (~12-15 docs)
4. Write Data Interpretation documentation (~15-20 docs)
5. Create `scripts/generate-tool-docs.ts` for AI Tools
6. Generate AI Tools documentation (~50-60 grouped docs)
7. Run ingestion for all new content

### Phase 0B: Categorization & Linking
1. Define complete tag taxonomy
2. Add tags to ALL existing documents (backfill)
3. Add related_docs cross-links to ALL documents
4. Verify link integrity (no broken related_docs)
5. Test sample queries for category diversity

### Phase 1-4: RAG Improvements (as before)
- Query Reformulation
- Tool-Aware RAG
- Conversation Context
- Dynamic Re-Retrieval

### Phase 5: Multi-Category Retrieval
1. Modify `src/lib/rag/search.ts` for diverse retrieval
2. Add category identification logic
3. Implement interleaving algorithm
4. Add configuration by query type
5. Update route.ts integration

---

## Document Count Summary

| Category | Est. Docs | Purpose |
|----------|-----------|---------|
| Existing (1-10) | ~60 | Domain knowledge |
| 11. AI Tools | ~50-60 | Tool documentation |
| 12. Data Sources | ~10-12 | API/data understanding |
| 13. Platform Workflows | ~12-15 | How platform works |
| 14. Data Interpretation | ~15-20 | Reading results |
| **Total** | **~150-170** | Complete knowledge base |

---

## Files Summary

### New Knowledge Base Directories
```
knowledge-base/
├── 11-ai-tools/
├── 12-data-sources/
├── 13-platform-workflows/
└── 14-data-interpretation/
```

### New Scripts
- `scripts/generate-tool-docs.ts` - Generate tool documentation
- `scripts/add-related-docs.ts` - Backfill related_docs links
- `scripts/validate-knowledge-base.ts` - Verify link integrity

### New RAG Modules
- `src/lib/rag/query-reformulator.ts`
- `src/lib/rag/tool-rag-hints.ts`
- `src/lib/rag/conversation-context.ts`
- `src/lib/rag/dynamic-retrieval.ts`
- `src/lib/rag/diverse-retrieval.ts` - Multi-category retrieval

### Modified Files
- `src/app/api/ai/chat/route.ts` - Main integration
- `src/lib/rag/search.ts` - Add diverse retrieval
- `src/lib/rag/index.ts` - Export new modules
- `src/lib/cache/redis.ts` - Session cache prefix

---

## Success Metrics

### Retrieval Quality
- Every query returns docs from ≥3 different categories
- Tool-related queries always include AI Tools doc
- Data questions always include Data Sources doc

### User Experience
- AI can explain WHERE data comes from
- AI can guide users through platform workflows
- AI provides holistic context, not just definitions

### Performance
- Total retrieval latency <500ms
- Category-diverse retrieval <100ms additional overhead
