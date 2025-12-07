---
slug: interpreting-market-velocity
title: "Interpreting Market Velocity - Understanding Market Speed Metrics"
category: Data Interpretation
subcategory: Market Metrics
tags: [interpretation-velocity, concept-market-velocity, data-rentcast, action-analyze]
related_docs: [interpreting-price-trends, interpreting-market-health, rentcast-market-data]
difficulty_level: intermediate
---

# Interpreting Market Velocity

## What Market Velocity Tells You

Market velocity measures how quickly properties sell in an area. It's crucial for:
- Estimating exit timeline
- Pricing strategy
- Risk assessment
- Competition analysis

## Key Velocity Metrics

### Days on Market (DOM)

The average time from listing to sale.

| DOM Range | Market Type | Wholesale Implication |
|-----------|-------------|----------------------|
| < 15 days | Very Hot | Quick exits, competitive market |
| 15-30 days | Hot | Good velocity, fast turnarounds |
| 30-45 days | Warm | Normal timeline, standard approach |
| 45-60 days | Normal | Balanced market |
| 60-90 days | Cool | Slower exits, need better pricing |
| 90-120 days | Slow | Extended hold times |
| > 120 days | Very Slow | Difficult exit, high risk |

### Reading DOM Data
```
Average DOM: 28 days
Median DOM: 21 days
Hot DOM (top 25%): < 14 days
Slow DOM (bottom 25%): > 45 days
```

**Use median** when outliers are present (foreclosures skew average).

### Inventory Level

Total active listings in the market.

**Months of Supply Calculation:**
```
Months of Supply = Active Listings / Monthly Sales Rate

Example:
500 active listings / 100 monthly sales = 5 months supply
```

**Interpretation:**
| Months of Supply | Market Balance | Implication |
|------------------|----------------|-------------|
| < 2 months | Extreme seller's market | Bidding wars, fast sales |
| 2-3 months | Seller's market | Quick sales, strong prices |
| 3-5 months | Balanced market | Normal conditions |
| 5-7 months | Buyer's market | More inventory, negotiating room |
| > 7 months | Strong buyer's market | Slow sales, price pressure |

### Absorption Rate

How quickly inventory is being sold.

**Calculation:**
```
Absorption Rate = Properties Sold / Active Inventory × 100

Example:
75 sold last month / 500 active = 15% monthly absorption
```

**Interpretation:**
| Absorption | Market Speed | Strategy |
|------------|--------------|----------|
| > 25% | Very Fast | Act quickly, competitive |
| 15-25% | Fast | Good velocity |
| 10-15% | Normal | Standard approach |
| 5-10% | Slow | Patient approach needed |
| < 5% | Very Slow | Caution, deep discounts |

### Sale-to-List Ratio

Actual sale price compared to list price.

| Ratio | Meaning | Negotiation Room |
|-------|---------|------------------|
| > 100% | Selling above asking | Multiple offers, bidding up |
| 98-100% | Near full price | Limited room |
| 95-98% | Normal discount | Standard negotiation |
| 90-95% | Below asking | Good buyer leverage |
| < 90% | Well below | Distressed or slow market |

## Velocity Trends

### Improving Velocity (Market Heating)
Signs of heating market:
- DOM decreasing
- Inventory declining
- Absorption increasing
- Sale-to-list rising

**Strategy:** Act faster, be more competitive on pricing.

### Declining Velocity (Market Cooling)
Signs of cooling market:
- DOM increasing
- Inventory rising
- Absorption decreasing
- Sale-to-list falling

**Strategy:** Be more conservative, factor in extended timeline.

### Seasonal Velocity
| Season | Typical Velocity |
|--------|-----------------|
| Spring (Mar-May) | Fastest (peak season) |
| Summer (Jun-Aug) | Fast (family moves) |
| Fall (Sep-Nov) | Slowing |
| Winter (Dec-Feb) | Slowest |

**Tip:** Compare to same period last year, not adjacent months.

## Using Velocity for Deal Decisions

### Exit Timeline Planning

**Expected Sale Time:**
```
Conservative: Average DOM × 1.5
Realistic: Average DOM × 1.2
Optimistic: Average DOM
```

**Holding Cost Impact:**
```
Holding Costs = Monthly Costs × Expected Months

Example:
$1,500/month × 3 months (60 day DOM × 1.5) = $4,500
Factor into MAO calculation!
```

### Pricing Strategy by Velocity

| DOM | Pricing Strategy |
|-----|------------------|
| < 30 days | Price at ARV, may get full price |
| 30-60 days | Price 1-3% below for quick sale |
| 60-90 days | Price 3-5% below, expect negotiation |
| > 90 days | Price 5-10% below, be patient |

### Risk Assessment

**Low Velocity Risk Factors:**
- Longer holding time = more costs
- Market may decline during hold
- Harder to find buyer for assignment
- More competition from other inventory

**Risk Mitigation:**
- Require deeper discount (lower MAO)
- Have backup exit strategy
- Pre-identify buyer before closing
- Consider rental exit

## Velocity by Property Type

Different property types have different velocity:

| Property Type | Typical Velocity | Notes |
|---------------|-----------------|-------|
| Entry-level SFR | Fast | High buyer demand |
| Mid-market SFR | Normal | Largest buyer pool |
| Luxury/High-end | Slow | Limited buyer pool |
| Multi-family | Varies | Investor-dependent |
| Condos | Varies | HOA impacts velocity |
| Land | Very Slow | Specialized market |

## Velocity Anomalies

### Abnormally High DOM
May indicate:
- Overpriced property
- Property issues
- Seasonal slowdown
- Market-wide slowdown

**Action:** Investigate cause before assuming market condition.

### Abnormally Low DOM
May indicate:
- Underpriced properties
- Extreme demand
- Bidding wars
- Pocket listings

**Action:** Verify with recent actual sales, not just listings.

### Inventory Spike
May indicate:
- New development
- Investor exits
- Market top
- Seasonal pattern

**Action:** Check inventory composition and trend direction.

## Velocity in Your Analysis

### Quick Velocity Check
```
"What's the market velocity in [ZIP code]?"
```

Review:
- DOM vs your timeline needs
- Inventory trend
- Sale-to-list ratio
- Seasonal adjustment

### Factor into MAO
```
Hot Market (DOM < 30):
  MAO = ARV × 70% - Repairs - Fee

Normal Market (DOM 30-60):
  MAO = ARV × 68% - Repairs - Fee - Buffer

Slow Market (DOM > 60):
  MAO = ARV × 65% - Repairs - Fee - Buffer
```

### Document Velocity Assumptions
When presenting deals:
- Include current DOM
- Note inventory level
- State exit timeline assumption
- Identify velocity risks

## Related Documentation

- [Interpreting Price Trends](interpreting-price-trends)
- [Interpreting Market Health](interpreting-market-health)
- [RentCast Market Data](rentcast-market-data)
- [Market Research Workflow](market-research-workflow)
