---
slug: mao-calculation-workflow
title: "MAO Calculation - Maximum Allowable Offer Process"
category: Platform Workflows
subcategory: Deal Analysis
tags: [workflow-deal-analysis, workflow-mao, tool-deal-analysis, concept-mao, concept-arv, action-calculate]
related_docs: [complete-deal-analysis-workflow, deal-analysis-workflow, interpreting-arv-estimates]
difficulty_level: intermediate
---

# MAO Calculation Workflow

## Overview

MAO (Maximum Allowable Offer) is the highest price you can pay for a property while still making your required profit. This workflow covers MAO calculation methods and when to use each.

## The 70% Rule (Standard)

### Basic Formula
```
MAO = ARV × 70% - Repairs - Wholesale Fee
```

### Example Calculation
```
"Calculate MAO for a property with:
- ARV: $250,000
- Estimated repairs: $30,000
- My wholesale fee: $10,000"
```

**Calculation:**
```
$250,000 × 0.70 = $175,000
$175,000 - $30,000 = $145,000
$145,000 - $10,000 = $135,000

MAO: $135,000
```

### Why 70%?
The 30% discount covers:
- Buyer's profit margin (15-20%)
- Holding costs (5-8%)
- Financing costs (3-5%)
- Transaction costs (2-4%)

## Variable Percentage Method

### When to Adjust the Percentage

**Use 65% When:**
- Slow market (DOM > 60 days)
- Uncertain repairs
- Complex property
- Skeptical about ARV
- Rural or limited buyer pool

**Use 70% When:**
- Normal market conditions
- Standard property type
- Confident in ARV
- Typical repair scope

**Use 75% When:**
- Hot market (DOM < 30 days)
- Minimal repairs needed
- Very confident ARV
- Strong buyer demand
- Multiple exit strategies

### Request Variable Calculation
```
"Calculate MAO at 65%, 70%, and 75% for this property"
```

**Output:**
| Percentage | MAO |
|------------|-----|
| 65% | $122,500 |
| 70% | $135,000 |
| 75% | $147,500 |

## Assignment Fee Strategies

### Standard Fee
```
Wholesale fee: $5,000 - $15,000
Typical: $10,000
```

### Percentage-Based Fee
```
Fee = ARV × 2-5%
$250,000 × 4% = $10,000
```

### Sliding Scale Fee
```
ARV < $100K: $5,000 fee
ARV $100K-$200K: $7,500 fee
ARV $200K-$300K: $10,000 fee
ARV $300K-$500K: $15,000 fee
ARV > $500K: 3-5% of ARV
```

### Request MAO with Fee Options
```
"Calculate MAO with different fee levels:
- Minimum fee ($5,000)
- Standard fee ($10,000)
- Premium fee ($15,000)"
```

## Reverse MAO Calculation

### When You Know the Asking Price
```
"The seller is asking $150,000. What ARV would I need
to make this deal work with $35,000 in repairs?"
```

**Reverse calculation:**
```
Purchase: $150,000
Repairs: $35,000
Wholesale Fee: $10,000
Total Cost: $195,000

Required ARV = $195,000 / 0.70 = $278,571
Round up: ARV needs to be ~$280,000
```

### When You Know the ARV
```
"ARV is $200,000. What's my maximum purchase price
if repairs are $25,000?"
```

## MAO for Different Exit Strategies

### Fix & Flip Buyer (Standard)
```
MAO = ARV × 70% - Repairs - Fee
```

### Buy & Hold/Rental Buyer
Rental investors may pay more:
```
MAO = ARV × 75-80% - Repairs - Fee
```
They value cash flow over immediate equity.

### Turnkey Buyer
For retail-ready properties:
```
MAO = ARV × 80-85% - Fee
```
No repair deduction since property is ready.

### Retail Buyer Exit
If selling to homeowner:
```
MAO = ARV × 85-90% - Repairs - Costs
```
No wholesale fee, but add agent commission.

### Request Multiple Exit MAOs
```
"Calculate MAO for flip buyer, rental investor, and retail exit"
```

## Sensitivity Analysis

### Test Different Scenarios
```
"Show MAO sensitivity for this deal:
- ARV scenarios: $230K, $250K, $270K
- Repair scenarios: $20K, $35K, $50K"
```

**Sensitivity Matrix:**
| ARV/Repairs | $20K | $35K | $50K |
|-------------|------|------|------|
| $230K | $131K | $116K | $101K |
| $250K | $145K | $130K | $115K |
| $270K | $159K | $144K | $129K |

### Break-Even Analysis
```
"At what asking price does this deal stop working?"
```

## MAO Negotiation Range

### Creating Offer Range
```
Opening Offer: MAO - 10-15%
Walk-Away: MAO
Stretch (if needed): MAO + 5%
```

**Example:**
```
MAO: $135,000
Opening: $115,000 - $121,500
Walk-away: $135,000
Absolute max: $141,750
```

### Request Negotiation Strategy
```
"Create an offer strategy with opening offer and walk-away for [address]"
```

## Quick MAO Checks

### Is This Property Worth Analyzing?
```
Quick Check: Asking Price < ARV × 65%

ARV: $200,000
Quick threshold: $130,000

Asking $125,000? → Worth full analysis
Asking $165,000? → Likely not a deal
```

### Rule of Thumb Reality Check
```
For every $100K in ARV:
- 70% rule allows ~$70K purchase (no repairs)
- With $20K repairs → ~$50K purchase
- With your $10K fee → ~$40K purchase

$200K ARV property with $25K repairs:
≈ $80K room for purchase + fee
```

## Common MAO Mistakes

### Overestimating ARV
```
Problem: Using highest comp, not realistic average
Fix: Use conservative, supportable ARV
```

### Underestimating Repairs
```
Problem: Missing hidden costs
Fix: Add 15-20% contingency to all estimates
```

### Ignoring Market Conditions
```
Problem: Using 70% in all markets
Fix: Adjust percentage for market velocity
```

### Forgetting Costs
```
Common forgotten costs:
- Holding costs during assignment
- Double close fees (if applicable)
- Marketing/finder's fees
- Earnest money cost
```

## MAO Documentation

### Generate MAO Report
```
"Generate MAO calculation report for [address] including:
- ARV justification
- Repair estimate breakdown
- MAO calculation steps
- Sensitivity analysis
- Recommended offer range"
```

### Share with Buyer
```
"Create a deal package showing MAO calculation for my buyer"
```

## Related Documentation

- [Complete Deal Analysis](complete-deal-analysis-workflow)
- [Deal Analysis Basics](deal-analysis-workflow)
- [Interpreting ARV Estimates](interpreting-arv-estimates)
- [Deal Analysis Tools](tool-category-deal-analysis)
