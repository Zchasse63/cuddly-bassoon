---
slug: motivation-scoring-workflow
title: "Scoring Seller Motivation - Prioritization Workflow"
category: Platform Workflows
subcategory: Lead Analysis
tags: [workflow-motivation, workflow-scoring, tool-predictive, action-score, concept-motivation]
related_docs: [motivation-scoring-fundamentals, tool-predict-seller-motivation, interpreting-motivation-scores, tool-predict-batch-motivation]
difficulty_level: beginner
---

# Scoring Seller Motivation

## Overview

Motivation scoring helps you prioritize which property owners to contact first. The AI analyzes multiple signals to predict how likely an owner is to sell below market value.

## Understanding Motivation Scores

Scores range from 0-100:

| Score | Level | Meaning |
|-------|-------|---------|
| 80-100 | Very High | Likely highly motivated, contact immediately |
| 60-79 | High | Good opportunity, prioritize |
| 40-59 | Medium | Worth pursuing, may need nurturing |
| 20-39 | Low | Long-term prospect |
| 0-19 | Very Low | Unlikely to sell at discount |

## Scoring a Single Property

**Example prompts:**
- "What's the seller motivation for 123 Main Street, Miami FL?"
- "Score the motivation for this property"
- "Is the owner of [address] likely to sell?"

### What Gets Analyzed

The AI considers:
- **Ownership duration**: How long they've owned
- **Owner type**: Individual, LLC, trust, etc.
- **Absentee status**: Do they live elsewhere?
- **Equity position**: How much equity they have
- **Property condition**: Signs of distress
- **Tax situation**: Tax burden indicators
- **Permit activity**: Recent or abandoned projects

## Batch Scoring Multiple Properties

Score your entire pipeline at once.

**Example prompts:**
- "Score motivation for all my leads"
- "Batch score these 20 properties"
- "Compare motivation across my Miami leads"

### Batch Output

Returns for each property:
- Motivation score (0-100)
- Owner classification
- Top motivation factors
- Recommended action

## Understanding Owner Types

Different owner types have different motivation patterns:

### Individual Owners

| Signal | High Motivation | Low Motivation |
|--------|-----------------|----------------|
| Ownership | 15+ years | < 5 years |
| Occupancy | Absentee | Owner-occupied |
| Location | Out of state | Local |
| Age indicators | Senior | Young |

### Investor/LLC Owners

| Signal | High Motivation | Low Motivation |
|--------|-----------------|----------------|
| Ownership | < 5 years | 10+ years |
| Portfolio size | Shrinking | Growing |
| Property condition | Declining | Maintained |
| Permit activity | Abandoned | Active |

### Institutional Owners

| Signal | High Motivation | Low Motivation |
|--------|-----------------|----------------|
| Property type | Non-core | Core portfolio |
| Condition | REO, foreclosure | Performing |
| Timeline | Needs to dispose | No pressure |

## Key Motivation Signals

### High Motivation Indicators

**Financial Stress:**
- Tax liens on property
- Multiple mortgages
- Recent refinance (cash-out)

**Life Events:**
- Death in family (probate)
- Divorce (forced sale)
- Job loss (relocation)

**Property Issues:**
- Code violations
- Deferred maintenance
- Abandoned renovation

**Time Pressure:**
- Listed and expired
- FSBO fatigue
- Pre-foreclosure

### Low Motivation Indicators

- Recent purchase (< 2 years)
- Recent renovation (invested in property)
- Low LTV (no equity pressure)
- Owner-occupied primary residence
- No apparent distress signals

## Using Scores for Prioritization

### Daily Outreach Strategy

1. **Morning**: Call 80+ scores (hot leads)
2. **Midday**: Call 60-79 scores (warm leads)
3. **Afternoon**: Nurture 40-59 scores (drip campaigns)

### Campaign Targeting

| Campaign Type | Target Score |
|--------------|--------------|
| Cold call blitz | 80+ |
| Personalized letters | 60-79 |
| Generic postcards | 40-59 |
| Long-term drip | 20-39 |

## Improving Accuracy

### Provide More Data

The more information you provide, the more accurate the score:

**Basic (less accurate):**
"Score motivation for 123 Main Street"

**Detailed (more accurate):**
"Score motivation for 123 Main Street. Owner is John Smith, bought in 2010, lives in California, property tax delinquent."

### Combine with Market Data

Motivation alone doesn't make a deal:
- High motivation + high equity = Best opportunity
- High motivation + low equity = May not work
- Low motivation + high equity = Needs nurturing

## Related Workflows

- [Property Search](first-search-workflow)
- [CRM Pipeline](crm-pipeline-workflow)
- [Deal Analysis](deal-analysis-workflow)

## Related Documentation

- [Motivation Scoring Fundamentals](motivation-scoring-fundamentals)
- [Predict Seller Motivation Tool](tool-predict-seller-motivation)
- [Interpreting Motivation Scores](interpreting-motivation-scores)
