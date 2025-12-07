---
slug: rentcast-market-data
title: "RentCast Market Data - Market Statistics Reference"
category: Data Sources
subcategory: Property Data
tags: [data-rentcast, data-source, market-data, concept-market-velocity, action-analyze]
related_docs: [rentcast-overview, market-analysis-fundamentals, interpreting-market-velocity, interpreting-price-trends]
difficulty_level: intermediate
---

# RentCast Market Data - Market Statistics Reference

## Overview

RentCast provides aggregated market statistics by geographic area, enabling market analysis and trend identification for wholesale deal evaluation.

## Available Market Metrics

### Price Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `medianSalePrice` | Median of recent sales | Market baseline |
| `medianListPrice` | Median of active listings | Current asking prices |
| `pricePerSquareFoot` | Median $/sqft for sales | Per-unit comparison |
| `yearOverYearChange` | % price change vs last year | Market direction |

### Rental Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `medianRent` | Median monthly rent | Rental market strength |
| `rentPerSquareFoot` | Monthly rent per sqft | Rental comparison |

### Market Velocity

| Metric | Description | Interpretation |
|--------|-------------|----------------|
| `daysOnMarket` | Average DOM for sold properties | Market speed |
| `inventory` | Count of active listings | Supply level |
| `saleToListRatio` | Sale price / List price | Negotiation room |

## Understanding Days on Market (DOM)

| DOM Range | Market Type | Wholesale Implication |
|-----------|-------------|----------------------|
| < 15 days | Very hot | Quick exits, competition high |
| 15-30 days | Hot | Good market, quick sales |
| 30-60 days | Normal | Standard timeline |
| 60-90 days | Slow | More negotiation leverage |
| > 90 days | Very slow | Difficult exits, deep discounts |

## Understanding Sale-to-List Ratio

| Ratio | Meaning | Strategy |
|-------|---------|----------|
| > 100% | Selling above ask | Seller's market, less discount |
| 95-100% | Near asking | Normal negotiation |
| 90-95% | Below asking | Buyer's market, more discount |
| < 90% | Well below | Distressed market, big discounts |

## Understanding Inventory

### Months of Supply

```
Months of Supply = Active Listings / Monthly Sales
```

| Supply | Market Type | Implication |
|--------|-------------|-------------|
| < 3 months | Seller's market | Properties sell fast |
| 3-6 months | Balanced | Normal conditions |
| > 6 months | Buyer's market | Slower sales, more inventory |

## Year-Over-Year Change

### Price Trend Analysis

| YoY Change | Trend | Strategy |
|------------|-------|----------|
| > +10% | Strong appreciation | Confident ARV, quick flips |
| +5% to +10% | Healthy growth | Standard approach |
| 0% to +5% | Stable | Conservative ARV |
| -5% to 0% | Softening | Lower ARV, caution |
| < -5% | Declining | High caution, bigger spreads |

## Monthly Data Trends

RentCast provides historical monthly data including:

```
monthlyData: [
  { month: "2024-01", medianSalePrice: 280000, medianRent: 1850, inventory: 145 },
  { month: "2024-02", medianSalePrice: 285000, medianRent: 1875, inventory: 138 },
  ...
]
```

### Using Monthly Data

**Trend Analysis:**
- 3+ months of consistent direction = confirmed trend
- Seasonal patterns (spring/summer typically stronger)
- Compare to same month last year for YoY

**Seasonality Factors:**
| Season | Typical Pattern |
|--------|-----------------|
| Spring (Mar-May) | Peak activity, higher prices |
| Summer (Jun-Aug) | Strong activity, family moves |
| Fall (Sep-Nov) | Slowing activity |
| Winter (Dec-Feb) | Lowest activity, motivated sellers |

## Geographic Levels

Market data available at multiple levels:

| Level | Best For |
|-------|----------|
| ZIP Code | Micro-market analysis |
| City | Market comparison |
| County | Regional trends |
| Metro Area | Broad market view |

### ZIP Code Analysis

Most granular, best for:
- Neighborhood-level pricing
- Local competition assessment
- Specific buyer targeting

### City-Level Analysis

Good for:
- Market-to-market comparison
- Investment area selection
- General pricing strategy

## Using Market Data for Deals

### ARV Confidence

Adjust ARV confidence based on market data:

| Factor | Adjustment |
|--------|------------|
| High DOM (>60) | Lower confidence, use range low |
| Low inventory | Higher confidence, strong demand |
| Declining YoY | Lower ARV by decline % |
| Rising YoY | Can be confident in ARV |

### Exit Timeline Planning

```
Expected Days to Sell = Average DOM × 1.2 (safety buffer)
```

### Negotiation Strategy

| Market Condition | Offer Strategy |
|------------------|----------------|
| Hot market (low DOM, low inventory) | Closer to MAO |
| Normal market | Standard MAO |
| Slow market | Below MAO possible |

## API Access Patterns

### Querying Market Data

```typescript
// By ZIP code
await rentcast.getMarketData({ zipCode: '33139' });

// By city
await rentcast.getMarketData({ city: 'Miami', state: 'FL' });
```

### Data Caching

Market data updates monthly - cache appropriately:
- Cache for 24 hours minimum
- Refresh weekly for active markets
- Monthly refresh acceptable for planning

## Related Documentation

- [RentCast Overview](rentcast-overview)
- [Market Analysis Fundamentals](market-analysis-fundamentals)
- [Interpreting Market Velocity](interpreting-market-velocity)
- [Interpreting Price Trends](interpreting-price-trends)
