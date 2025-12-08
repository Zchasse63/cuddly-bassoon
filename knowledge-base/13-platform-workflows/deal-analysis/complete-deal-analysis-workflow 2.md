---
slug: complete-deal-analysis-workflow
title: "Complete Deal Analysis - Full In-Depth Analysis Process"
category: Platform Workflows
subcategory: Deal Analysis
tags: [workflow-deal-analysis, workflow-advanced, tool-deal-analysis, action-analyze, concept-arv, concept-mao]
related_docs: [deal-analysis-workflow, comps-analysis-workflow, repair-estimation-workflow]
difficulty_level: intermediate
---

# Complete Deal Analysis Workflow

## Overview

This comprehensive workflow walks through every step of analyzing a potential wholesale deal, from initial property lookup through final deal recommendation.

## Phase 1: Property Intelligence Gathering

### Step 1.1: Get Property Details
```
"Get complete property details for [address]"
```

**Review these fields:**
- Property type and characteristics
- Lot size and year built
- Legal description and zoning
- Any special features

### Step 1.2: Get Owner Information
```
"Who owns [address]? Get full owner details"
```

**Analyze owner profile:**
| Factor | What to Note |
|--------|-------------|
| Owner type | Individual, LLC, Trust, Bank |
| Ownership duration | Years owned |
| Mailing address | Same as property? |
| Multiple properties? | Portfolio owner? |

### Step 1.3: Get Tax and Assessment Data
```
"Show tax assessment for [address]"
```

**Key tax metrics:**
- Assessed value vs market value
- Annual tax amount
- Any delinquencies
- Recent assessment changes

## Phase 2: Value Analysis

### Step 2.1: Get AVM Estimate
```
"What's the estimated value of [address]?"
```

**Review:**
- Primary estimate
- Price range (low to high)
- Confidence score
- Date of estimate

### Step 2.2: Pull Comparable Sales
```
"Show comparable sales for [address]"
```

**Evaluate each comp:**
```
Comp Quality Checklist:
□ Within 0.5 miles (urban) / 2 miles (suburban)
□ Sold within 6 months
□ Similar size (±20% sqft)
□ Similar beds/baths (±1)
□ Similar age (±15 years)
□ Similar condition
```

### Step 2.3: Verify ARV
```
"What's a realistic ARV for [address] after light renovation?"
```

**ARV Decision Matrix:**
| AVM Confidence | Comps Quality | ARV Approach |
|----------------|---------------|--------------|
| High (85%+) | Good (3+ quality comps) | Use AVM with confidence |
| High | Poor | Investigate comp shortage |
| Low | Good | Weight comps more heavily |
| Low | Poor | Requires manual analysis |

### Step 2.4: Document Value Conclusion
```
"Based on comps and AVM, what's the supportable ARV?"
```

**Value Summary:**
```
AVM Estimate: $285,000 (confidence: 87%)
Comp Range: $270,000 - $295,000
Adjusted ARV: $280,000 (conservative)
```

## Phase 3: Condition Assessment

### Step 3.1: Check Permit History
```
"Show all permits for [address]"
```

**Analyze permit status:**
| Recent Permits | Implication |
|----------------|-------------|
| Roof (< 10 years) | Roof likely good |
| HVAC (< 15 years) | System updated |
| Major remodel | Property updated |
| None on old home | Deferred maintenance |

### Step 3.2: Check for Active/Incomplete Permits
```
"Are there any open or incomplete permits?"
```

**Red flags:**
- Permits issued but not finalized
- Failed inspections
- Expired permits

### Step 3.3: Estimate Repair Costs
```
"Estimate repair costs for [address] assuming
the property needs [cosmetic/moderate/full] renovation"
```

**Repair Categories:**
| Category | Light | Moderate | Heavy |
|----------|-------|----------|-------|
| Cosmetic | $5-15K | $15-30K | $30-50K |
| Kitchen | $0 | $15-25K | $25-50K |
| Bathrooms | $0-5K | $10-20K | $20-40K |
| Systems | $0 | $5-15K | $15-30K |
| Structural | $0 | $0-10K | $10-50K |
| **Total** | **$5-20K** | **$45-100K** | **$100K+** |

### Step 3.4: Verify with Contractor Data
```
"What do similar renovations cost in this ZIP code?"
```

## Phase 4: Motivation Analysis

### Step 4.1: Score Seller Motivation
```
"Calculate motivation score for [address] owner"
```

**Motivation Components:**
| Signal | Weight | Score |
|--------|--------|-------|
| Absentee owner | 20% | 0-100 |
| Ownership duration | 15% | 0-100 |
| Equity level | 20% | 0-100 |
| Out-of-state | 15% | 0-100 |
| Tax situation | 10% | 0-100 |
| Permit issues | 10% | 0-100 |
| Market signals | 10% | 0-100 |

### Step 4.2: Check for Distress Signals
```
"Check for any distress indicators on [address]"
```

**Distress signals to check:**
- Pre-foreclosure status
- Tax liens
- Code violations
- Expired listings
- Multiple failed sales

### Step 4.3: Research Listing History
```
"Show MLS listing history for [address]"
```

**Listing analysis:**
| History | Implication |
|---------|-------------|
| Never listed | True off-market opportunity |
| Expired listing | Motivated, tried to sell |
| Price reductions | Increasing motivation |
| Multiple expirations | Very motivated/problem property |

## Phase 5: Market Context

### Step 5.1: Get Market Statistics
```
"Show market statistics for [ZIP code]"
```

**Key market metrics:**
- Median price and trend
- Days on market
- Inventory level
- Sale-to-list ratio

### Step 5.2: Assess Exit Strategy
```
"How quickly could I sell this property? What's the exit strategy?"
```

**Exit Analysis:**
| DOM | Market | Strategy |
|-----|--------|----------|
| < 30 days | Hot | Quick flip viable |
| 30-60 days | Normal | Standard timeline |
| > 60 days | Slow | Longer hold, need discount |

### Step 5.3: Identify Buyer Pool
```
"Who would buy this property? Match to my buyer list"
```

**Buyer matching:**
- Fix & flip investors
- Rental investors
- Retail buyers (if move-in ready)

## Phase 6: Deal Math

### Step 6.1: Calculate MAO
```
"Calculate MAO for [address]"
```

**70% Rule Calculation:**
```
ARV: $280,000
× 70% = $196,000
- Repairs: $35,000
- Wholesale Fee: $10,000
= MAO: $151,000
```

### Step 6.2: Validate with Alternative Methods
```
"What's the MAO using different scenarios?"
```

**Sensitivity Analysis:**
| Scenario | ARV | Repairs | MAO |
|----------|-----|---------|-----|
| Conservative | $270K | $45K | $134K |
| Base Case | $280K | $35K | $151K |
| Optimistic | $295K | $30K | $167K |

### Step 6.3: Assess Deal Viability
```
"Is this a viable deal? What's the potential profit?"
```

**Deal Scorecard:**
```
Asking Price: $165,000
Base Case MAO: $151,000
Gap: -$14,000 (9% above MAO)

Verdict: Negotiation needed
Target Offer: $145,000-$151,000
```

## Phase 7: Final Recommendation

### Step 7.1: Generate Deal Summary
```
"Generate a complete deal summary for [address]"
```

### Step 7.2: Identify Risks
```
"What are the risks with this deal?"
```

**Risk Categories:**
- Title/legal risks
- Condition risks
- Market risks
- Seller reliability

### Step 7.3: Get Action Recommendation
```
"Should I pursue this deal? What's the recommended action?"
```

**Decision Framework:**
| Score | Recommendation |
|-------|----------------|
| 80-100 | Strong Buy - Make offer |
| 60-79 | Conditional - Negotiate aggressively |
| 40-59 | Weak - Only if price drops significantly |
| < 40 | Pass - Not a deal |

## Quick Analysis Template

For rapid deal assessment:
```
"Quick deal analysis for [address]:
1. Property basics
2. ARV estimate
3. Repair estimate
4. MAO calculation
5. Motivation score
6. Go/No-Go recommendation"
```

## Related Documentation

- [Deal Analysis Basics](deal-analysis-workflow)
- [Comparable Sales Analysis](comps-analysis-workflow)
- [Repair Estimation](repair-estimation-workflow)
- [MAO Calculation](mao-calculation-workflow)
- [Interpreting ARV Estimates](interpreting-arv-estimates)
