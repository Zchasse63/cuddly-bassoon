---
slug: comps-analysis-workflow
title: "Comparable Sales Analysis - Finding and Adjusting Comps"
category: Platform Workflows
subcategory: Deal Analysis
tags: [workflow-deal-analysis, workflow-comps, tool-deal-analysis, action-analyze, concept-arv, data-rentcast]
related_docs: [complete-deal-analysis-workflow, interpreting-arv-estimates, rentcast-valuation-data]
difficulty_level: intermediate
---

# Comparable Sales Analysis Workflow

## Overview

Comparable sales (comps) are the foundation of accurate ARV estimates. This workflow teaches you to find, evaluate, and adjust comps for reliable property valuations.

## Step 1: Request Comparable Sales

### Basic Comp Request
```
"Show comparable sales for [address]"
"Find comps for 123 Main St, Miami FL"
```

### Specific Comp Parameters
```
"Find comparable sales for [address]:
- Within 0.5 miles
- Sold in last 6 months
- Similar size (1,500-2,000 sqft)
- 3-4 bedrooms"
```

## Step 2: Evaluate Comp Quality

### The SALT Method
Score each comp on four factors:

| Factor | Criteria | Weight |
|--------|----------|--------|
| **S**ize | Within ±20% sqft | 25% |
| **A**ge | Within ±15 years | 20% |
| **L**ocation | Within 0.5-2 miles | 30% |
| **T**ime | Sold within 6 months | 25% |

### Comp Quality Ratings

**A-Grade Comp (Best):**
- Same subdivision/neighborhood
- Sold within 3 months
- Nearly identical specs
- Similar condition

**B-Grade Comp (Good):**
- Same ZIP code
- Sold within 6 months
- Similar specs (±10%)
- Comparable condition

**C-Grade Comp (Acceptable):**
- Adjacent ZIP code
- Sold within 12 months
- Similar specs (±20%)
- Condition adjustment needed

**D-Grade Comp (Use with Caution):**
- Different neighborhood
- Sold over 12 months ago
- Significant spec differences
- Major condition differences

## Step 3: Analyze Comp Details

### Request Detailed Comp Information
```
"Show detailed information for each comparable sale"
```

### Key Comp Data Points
| Field | What to Compare |
|-------|-----------------|
| Sale Price | Baseline value |
| Price/SqFt | Normalized comparison |
| Beds/Baths | Room count match |
| Square Feet | Size comparison |
| Year Built | Age comparison |
| Lot Size | Land value factor |
| Days on Market | Market demand |
| Sale Date | Recency |
| Condition | Quality match |

## Step 4: Make Comp Adjustments

### Standard Adjustment Framework

**Size Adjustments:**
```
Price Difference = (Subject SqFt - Comp SqFt) × Market $/SqFt

Example:
Subject: 1,800 sqft
Comp: 1,600 sqft
Market rate: $150/sqft
Adjustment: (1,800 - 1,600) × $150 = +$30,000
```

**Bedroom Adjustments:**
```
Per bedroom: $5,000 - $15,000 (market dependent)

Subject: 4 bedrooms
Comp: 3 bedrooms
Adjustment: +$10,000
```

**Bathroom Adjustments:**
```
Full bath: $5,000 - $12,000
Half bath: $2,500 - $6,000

Subject: 2.5 baths
Comp: 2 baths
Adjustment: +$4,000 (half bath)
```

**Feature Adjustments:**
| Feature | Typical Adjustment |
|---------|-------------------|
| Garage (2-car) | +$15,000 - $25,000 |
| Pool | +$10,000 - $30,000 |
| Updated Kitchen | +$10,000 - $25,000 |
| Renovated Baths | +$5,000 - $15,000 |
| Fireplace | +$2,000 - $5,000 |

**Time Adjustments:**
```
Monthly appreciation rate × months since sale

Market appreciation: 0.5%/month
Comp sold 4 months ago
Comp price: $250,000
Adjustment: $250,000 × 0.5% × 4 = +$5,000
```

**Condition Adjustments:**
| Condition Gap | Adjustment |
|---------------|------------|
| Minor difference | ±5% |
| Moderate difference | ±10-15% |
| Major difference | ±15-25% |

## Step 5: Calculate Adjusted Values

### Request Adjusted Comp Values
```
"Adjust all comps to match the subject property specifications"
```

### Adjustment Worksheet Example

```
Subject Property: 123 Main St
- 4 bed, 2 bath, 1,800 sqft, 2-car garage, no pool

Comp 1: 456 Oak Ave - Sold $275,000
- 3 bed (+$10,000)
- 2 bath ($0)
- 1,650 sqft (+$22,500)
- 2-car garage ($0)
- Has pool (-$15,000)
Adjusted Value: $292,500

Comp 2: 789 Pine Rd - Sold $265,000
- 4 bed ($0)
- 2.5 bath (-$4,000)
- 1,750 sqft (+$7,500)
- 1-car garage (+$8,000)
- No pool ($0)
Adjusted Value: $276,500

Comp 3: 321 Elm St - Sold $280,000
- 4 bed ($0)
- 2 bath ($0)
- 1,900 sqft (-$15,000)
- 2-car garage ($0)
- No pool ($0)
Adjusted Value: $265,000
```

## Step 6: Determine Final ARV

### Calculate Weighted Average
```
"What's the ARV based on these adjusted comps?"
```

**Weighting by Quality:**
| Comp | Adjusted Value | Quality Grade | Weight |
|------|----------------|---------------|--------|
| Comp 1 | $292,500 | B+ | 35% |
| Comp 2 | $276,500 | B | 30% |
| Comp 3 | $265,000 | B- | 20% |
| AVM | $280,000 | - | 15% |

**Weighted ARV:**
```
($292,500 × 0.35) + ($276,500 × 0.30) +
($265,000 × 0.20) + ($280,000 × 0.15) = $279,575

Rounded ARV: $280,000
```

## Special Comp Situations

### Few Comps Available
```
"Expand comp search to 1 mile radius and 12 months"
"Include pending sales and active listings"
```

### No Similar Comps
```
"Find any recent sales in the same subdivision"
"Show sales for similar lot sizes regardless of home size"
"Calculate value using price per square foot method"
```

### Unique Property
```
"This property has unique features. What comparable
data points can we use for valuation?"
```

### REO/Foreclosure Comps
```
"Exclude distressed sales from comps"
"Show only arms-length transactions"
```

## Comp Analysis Best Practices

### Do:
- Use at least 3-5 comps when possible
- Prefer most recent sales
- Verify sale type (arms-length vs distressed)
- Account for market trends
- Document your adjustments

### Don't:
- Use comps from different market segments
- Over-adjust (net adjustments > 25% = weak comp)
- Ignore condition differences
- Use listed prices as sold prices
- Cherry-pick only highest comps

## Comp Report Generation
```
"Generate a comp analysis report for [address] including:
- Subject property details
- All comparable sales with photos
- Adjustment breakdown for each
- Final ARV conclusion with confidence level"
```

## Related Documentation

- [Complete Deal Analysis](complete-deal-analysis-workflow)
- [Interpreting ARV Estimates](interpreting-arv-estimates)
- [RentCast Valuation Data](rentcast-valuation-data)
- [Deal Analysis Tools](tool-category-deal-analysis)
