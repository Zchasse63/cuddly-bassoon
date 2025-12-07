---
slug: rentcast-valuation-data
title: "RentCast Valuation Data - Understanding AVM Estimates"
category: Data Sources
subcategory: Property Data
tags: [data-rentcast, data-source, valuation, concept-arv, concept-mao, tool-deal-analysis]
related_docs: [arv-calculation-methods, maximum-allowable-offer-formula, rentcast-overview, interpreting-arv-estimates]
difficulty_level: intermediate
---

# RentCast Valuation Data

## What is AVM (Automated Valuation Model)?

RentCast's AVM provides instant property valuations using machine learning models trained on millions of sales transactions. This estimate serves as the foundation for ARV calculations in wholesale deal analysis.

## Valuation Data Structure

When you request a property valuation, RentCast returns:

```
{
  price: 285000,           // Primary estimate
  priceRangeLow: 265000,   // Conservative estimate
  priceRangeHigh: 305000,  // Optimistic estimate
  pricePerSquareFoot: 185, // For comparison
  confidence: 82,          // Reliability score
  comparables: [...]       // Supporting sales
}
```

## Using Valuations for Wholesale Analysis

### As ARV (After Repair Value)

For properties needing renovation, the RentCast AVM represents the potential value **after repairs**. Use this for:

1. **70% Rule Calculation**: ARV × 70% - Repairs - Fee = MAO
2. **Deal Scoring**: Higher ARV = larger potential spread
3. **Buyer Pricing**: What to advertise to cash buyers

### Adjusting for Condition

RentCast AVM assumes average condition. Adjust for:

| Condition | Adjustment |
|-----------|------------|
| Excellent | +5-10% |
| Good | No adjustment |
| Fair | -5-10% |
| Poor (needs full rehab) | -10-15% |

### Using Price Range

The price range (low to high) indicates market uncertainty:

- **Narrow range** (±5%): Reliable estimate, use confidently
- **Medium range** (±10%): Moderate uncertainty, verify with comps
- **Wide range** (±15%+): High uncertainty, get multiple opinions

## Understanding Comparables

Each valuation includes comparable properties used in the estimate:

### Comp Quality Indicators

| Factor | Ideal | Acceptable | Poor |
|--------|-------|------------|------|
| Distance | < 0.5 mi | 0.5-1 mi | > 1 mi |
| Age | < 90 days | 90-180 days | > 180 days |
| Size Match | ±10% sqft | ±20% sqft | > 20% sqft |
| Beds/Baths | Same | ±1 | > 1 diff |

### Reading Comp Data

Each comparable includes:
- **formattedAddress**: Location for verification
- **price**: What it sold for
- **squareFootage**: For $/sqft comparison
- **bedrooms/bathrooms**: For apples-to-apples comparison
- **distance**: Miles from subject
- **saleDate**: Recency of data
- **correlation**: How similar to subject (higher = better)

## Best Practices

### Always Verify High-Value Estimates
If RentCast shows ARV > $500K, verify with:
- Active listings in the area
- Recent MLS sold data
- Local agent opinion

### Use Multiple Comps for Final ARV
Don't rely solely on AVM. The platform combines:
1. RentCast AVM estimate
2. Comparable sales analysis
3. Market trend adjustments

### Watch for Outliers
If one comp is significantly different from others:
- It may have been a distressed sale
- It may have unique features
- Consider excluding from analysis

## Related Tools

- **Analyze Deal**: Uses valuation for complete deal analysis
- **Calculate MAO**: Uses ARV for maximum offer calculation
- **Search Properties**: Includes estimated values in results

## Related Documentation

- [ARV Calculation Methods](arv-calculation-methods)
- [Maximum Allowable Offer Formula](maximum-allowable-offer-formula)
- [Interpreting ARV Estimates](interpreting-arv-estimates)
