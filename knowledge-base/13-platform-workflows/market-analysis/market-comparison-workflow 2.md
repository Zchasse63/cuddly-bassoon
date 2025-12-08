---
slug: market-comparison-workflow
title: "Market Comparison - Comparing Multiple Investment Markets"
category: Platform Workflows
subcategory: Market Analysis
tags: [workflow-market-analysis, workflow-comparison, tool-market-analysis, action-analyze, concept-market]
related_docs: [market-research-workflow, neighborhood-analysis-workflow, rentcast-market-data]
difficulty_level: intermediate
---

# Market Comparison Workflow

## Overview

Choosing between multiple markets requires systematic comparison. This workflow helps you evaluate and rank markets for investment potential.

## Step 1: Define Comparison Criteria

### Select Markets to Compare
```
"Compare these markets for wholesale investment:
- Miami, FL
- Tampa, FL
- Orlando, FL
- Jacksonville, FL"
```

### Choose Comparison Metrics
```
"Compare markets on:
- Median price and trend
- Days on market
- Population growth
- Absentee owner percentage
- Average equity levels"
```

## Step 2: Get Side-by-Side Data

### Request Comparison Table
```
"Show a side-by-side comparison of [markets] with all key metrics"
```

### Standard Comparison Metrics
| Metric | Category | Why It Matters |
|--------|----------|----------------|
| Median Price | Price | Entry point |
| YoY Price Change | Trend | Direction |
| Days on Market | Velocity | Exit speed |
| Inventory | Supply | Competition |
| Population Growth | Demographics | Demand |
| Median Income | Demographics | Buying power |
| Absentee % | Opportunity | Lead pool |
| Equity Levels | Opportunity | Motivated sellers |

## Step 3: Score Each Market

### Request Market Scores
```
"Score each market from 1-10 on:
- Investment potential
- Competition level
- Risk level
- Ease of entry"
```

### Weighted Scoring Example
```
| Factor | Weight | Miami | Tampa | Orlando | Jax |
|--------|--------|-------|-------|---------|-----|
| Price Growth | 20% | 8 | 7 | 7 | 6 |
| Market Speed | 25% | 7 | 8 | 8 | 7 |
| Opportunity | 25% | 7 | 8 | 7 | 8 |
| Competition | 15% | 5 | 7 | 7 | 8 |
| Risk Level | 15% | 6 | 7 | 7 | 8 |
| **Total** | **100%** | **6.7** | **7.5** | **7.2** | **7.4** |
```

## Step 4: Analyze Price Points

### Compare Price Distributions
```
"Show price distribution comparison for these markets:
- Entry level (< $150K)
- Mid market ($150K-$300K)
- Upper market (> $300K)"
```

### Price Point Strategy
| Your Capital | Target Market |
|--------------|---------------|
| Limited (< $100K deals) | Jacksonville, smaller markets |
| Moderate ($100-200K) | Tampa, Orlando |
| Strong (> $200K) | Miami, premium markets |

## Step 5: Compare Market Velocity

### Velocity Comparison
```
"Compare market velocity across all markets:
- Average DOM
- Inventory months
- Sale-to-list ratio
- Absorption rate"
```

### Velocity Decision Matrix
| If You Need... | Choose Market With... |
|----------------|----------------------|
| Quick exits | Lowest DOM |
| Negotiating room | Higher inventory |
| Volume deals | Fastest absorption |
| Margin deals | More supply |

## Step 6: Assess Opportunity Density

### Compare Lead Availability
```
"Compare motivation signals across markets:
- Total absentee properties
- High equity count
- Long-term owner count
- Properties meeting my criteria"
```

### Calculate Opportunity Density
```
Opportunity Density = Qualified Leads / Total Properties

Miami: 5,000 / 50,000 = 10%
Tampa: 4,500 / 35,000 = 12.8%
Orlando: 4,000 / 40,000 = 10%
Jacksonville: 3,500 / 25,000 = 14%

Higher density = more opportunities per search
```

## Step 7: Compare Competition

### Competition Analysis
```
"Compare investor competition in each market:
- Cash buyer percentage
- Active wholesalers
- Flip activity volume"
```

### Competition vs Opportunity Trade-off
| Market Type | Competition | Opportunity | Strategy |
|-------------|-------------|-------------|----------|
| Hot market | High | High | Speed, networking |
| Emerging | Low | Moderate | First mover advantage |
| Mature | Moderate | Moderate | Differentiation |
| Declining | Low | Low | Avoid or special strategy |

## Step 8: Risk Comparison

### Compare Risk Factors
```
"Compare risk levels across markets:
- Economic diversity
- Employment stability
- Price volatility
- Market fundamentals"
```

### Risk Assessment Matrix
| Risk Factor | Low Risk | Moderate | High Risk |
|-------------|----------|----------|-----------|
| Economic base | Diversified | Mixed | Single industry |
| Population | Growing | Stable | Declining |
| Price trend | Steady growth | Flat | Volatile/declining |
| Investor exits | Easy | Moderate | Difficult |

## Step 9: Calculate ROI Potential

### Compare Potential Returns
```
"Calculate typical wholesale deal ROI for each market:
- Average purchase price
- Average wholesale fee
- Deals per month potential
- Annual ROI estimate"
```

### ROI Comparison
```
| Market | Avg Deal | Fee | Deals/Mo | Monthly ROI |
|--------|----------|-----|----------|-------------|
| Miami | $180K | $12K | 2 | $24,000 |
| Tampa | $140K | $10K | 3 | $30,000 |
| Orlando | $160K | $10K | 2 | $20,000 |
| Jax | $120K | $8K | 4 | $32,000 |
```

## Step 10: Make Market Selection

### Request Recommendation
```
"Based on all factors, rank these markets and recommend
which to enter first and why"
```

### Selection Framework
```
1. Primary Market: Highest weighted score
   - Focus most resources
   - Build deepest network

2. Secondary Market: Second highest score
   - Diversification
   - Expansion opportunity

3. Watch Markets: Others with potential
   - Monitor for changes
   - Future expansion
```

## Comparison Report Template

### Generate Comprehensive Comparison
```
"Generate a market comparison report for [markets] including:
- Side-by-side metrics table
- Scored comparison matrix
- Strengths/weaknesses analysis
- Risk assessment
- Final rankings with rationale
- Market entry recommendations"
```

## Quick Market Comparison

For rapid comparison:
```
"Quick compare [Market A] vs [Market B]:
Top 5 metrics only, with winner for each"
```

**Output:**
```
| Metric | Market A | Market B | Winner |
|--------|----------|----------|--------|
| Price Trend | +8% | +5% | A |
| DOM | 35 days | 28 days | B |
| Absentee % | 28% | 32% | B |
| Competition | High | Moderate | B |
| Entry Cost | $180K avg | $140K avg | B |

Overall: Market B (4-1)
```

## Related Documentation

- [Market Research](market-research-workflow)
- [Neighborhood Analysis](neighborhood-analysis-workflow)
- [RentCast Market Data](rentcast-market-data)
- [Market Analysis Tools](tool-category-market-analysis)
