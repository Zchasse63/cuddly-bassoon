---
slug: deal-analysis-workflow
title: "Deal Analysis Basics - Getting Started with Analysis"
category: Platform Workflows
subcategory: Getting Started
tags: [workflow-deal-analysis, workflow-getting-started, tool-deal-analysis, action-analyze, concept-arv, concept-mao]
related_docs: [complete-deal-analysis-workflow, mao-calculation-workflow, interpreting-arv-estimates]
difficulty_level: beginner
---

# Deal Analysis Basics

## Overview

This workflow guides you through analyzing a potential wholesale deal using the platform's AI tools. Learn to evaluate properties quickly to determine if they're worth pursuing.

## Step 1: Get Property Details

Start with basic property information.

**Example prompts:**
- "Analyze the property at 123 Main St, Miami, FL"
- "Get details for [address]"
- "Show me information about this property"

**What you'll receive:**
- Property characteristics (beds, baths, sqft, year built)
- Owner information
- Tax assessment data
- Last sale information

## Step 2: Get Value Estimates

Understand the property's current and potential value.

**Example prompts:**
- "What's the estimated value of 123 Main St?"
- "Get an ARV estimate for this property"
- "Show me comparable sales"

**Key metrics to review:**
| Metric | What It Means |
|--------|---------------|
| AVM Value | Current estimated market value |
| ARV | After Repair Value (for rehab properties) |
| Price Range | Low to high value estimates |
| Confidence | How reliable the estimate is |

## Step 3: Assess Repair Needs

Estimate what repairs might cost.

**Example prompts:**
- "Estimate repair costs for this property"
- "What renovations might this property need?"
- "Check permit history for 123 Main St"

**Using permit history:**
- Recent roof permit → Roof likely good
- No permits in 20 years → May need updates
- Incomplete permits → Potential issues

## Step 4: Calculate MAO

Determine your Maximum Allowable Offer.

**Example prompts:**
- "Calculate MAO for this property"
- "What should I offer for 123 Main St?"
- "Run the numbers on this deal"

**The 70% Rule:**
```
MAO = ARV × 70% - Repairs - Wholesale Fee
```

**Example:**
```
ARV: $200,000
MAO = $200,000 × 0.70 - $30,000 repairs - $10,000 fee
MAO = $140,000 - $30,000 - $10,000
MAO = $100,000
```

## Step 5: Evaluate the Opportunity

Determine if this deal is worth pursuing.

**Good deal indicators:**
- Asking price below MAO
- High motivation score
- Clear exit strategy
- Strong market (low DOM)

**Red flags:**
- Asking price above ARV
- Title issues indicated
- Low market confidence
- Very long days on market

## Quick Analysis Checklist

Use this checklist for rapid deal evaluation:

```
□ Property condition assessment
□ ARV from AVM + comps verification
□ Repair cost estimate
□ MAO calculation
□ Seller motivation score
□ Market velocity check
□ Potential buyers identified
```

## Example Complete Analysis

**Prompt:**
"Do a complete deal analysis for 456 Oak Ave, Tampa, FL"

**AI will provide:**
1. Property details and characteristics
2. Owner information and absentee status
3. AVM value and confidence
4. Comparable sales summary
5. Repair estimate based on age/condition
6. MAO calculation
7. Seller motivation score
8. Market statistics
9. Deal recommendation

## When to Dig Deeper

**Proceed to full analysis when:**
- Asking price is near or below MAO
- Motivation score is 60+
- ARV confidence is high
- Market conditions are favorable

**Move on when:**
- Asking price is 20%+ above MAO
- Very low motivation indicators
- Major title or structural concerns
- Market is declining

## Common Questions

**Q: How accurate is the ARV?**
A: Check the confidence score. Above 80% is reliable. Below 70%, verify with manual comp analysis.

**Q: What if repair costs are uncertain?**
A: Add a contingency buffer (10-20%) or get contractor estimate before finalizing offer.

**Q: Should I analyze every property?**
A: No. Use filters to find likely candidates first, then analyze the best 10-20%.

## Next Steps

After basic analysis:
- [Complete Deal Analysis](complete-deal-analysis-workflow) - Full in-depth process
- [Comparable Sales Analysis](comps-analysis-workflow) - Verify ARV
- [Repair Estimation](repair-estimation-workflow) - Detailed repair costs

## Related Documentation

- [MAO Calculation Workflow](mao-calculation-workflow)
- [Interpreting ARV Estimates](interpreting-arv-estimates)
- [Deal Analysis Tools](tool-category-deal-analysis)
