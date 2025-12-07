---
slug: rentcast-overview
title: "RentCast API - Complete Data Source Reference"
category: Data Sources
subcategory: Property Data
tags: [data-rentcast, data-source, property-data, valuation, market-data, concept-arv]
related_docs: [arv-calculation-methods, deal-analysis-framework, tool-deal-analysis-analyze, rentcast-valuation-data, rentcast-property-data]
difficulty_level: intermediate
---

# RentCast API - Complete Data Source Reference

## Overview

RentCast is the primary data source for property records, valuations, rent estimates, and market analytics in this platform. With access to 140M+ property records nationwide, RentCast provides the foundation for deal analysis, ARV calculations, and market intelligence.

## Data Types Available

### 1. Property Records
Comprehensive property data including physical characteristics, ownership information, and tax assessments.

**Key Fields:**
- **Property Info**: Address, bedrooms, bathrooms, square footage, lot size, year built
- **Owner Info**: Owner names, mailing address, owner type (Individual, Company, Trust, Government, Bank)
- **Tax Assessment**: Assessed value, market value, tax year, tax amount
- **Features**: Cooling, heating, fireplace, pool, garage, garage spaces, stories
- **Sales History**: Last sale date, last sale price

### 2. Property Valuations (AVM)
Automated Valuation Model estimates with confidence scores and comparable sales.

**Key Fields:**
- **Estimated Value**: Primary AVM estimate
- **Price Range**: Low and high estimates (confidence interval)
- **Price Per Square Foot**: For comparative analysis
- **Confidence Score**: 0-100 indicating estimate reliability
- **Comparables**: List of similar recently sold properties

### 3. Rent Estimates
Rental value estimates for buy-and-hold investor analysis.

**Key Fields:**
- **Rent Estimate**: Monthly rent AVM
- **Rent Range**: Low and high monthly estimates
- **Rent Per Square Foot**: For comparative analysis
- **Rental Comparables**: Similar rental listings

### 4. Market Data
Aggregated market statistics by ZIP code, city, or county.

**Key Fields:**
- **Median Sale Price**: Current median for area
- **Median List Price**: Active listing median
- **Median Rent**: Monthly rental median
- **Days on Market**: Average DOM
- **Inventory**: Active listing count
- **Year-Over-Year Change**: Price trend indicator
- **Sale-to-List Ratio**: Market competitiveness indicator

### 5. Listing Data
Active, pending, and sold listing information.

**Key Fields:**
- **Listing Status**: Active, Pending, Sold, Expired, Withdrawn
- **List Price**: Current asking price
- **Days on Market**: Time since listing
- **Price History**: All price changes
- **Listing Agent**: Contact info for agent/office
- **MLS Number**: Listing identifier

## How Data is Used in the Platform

### For Deal Analysis
- **ARV Calculation**: RentCast AVM provides the After Repair Value baseline
- **Comparable Sales**: Supports the 70% rule and MAO calculations
- **Market Velocity**: Days on market helps predict time to close

### For Property Search
- **Owner Information**: Identifies absentee owners and owner types
- **Sales History**: Calculates ownership duration for motivation scoring
- **Tax Data**: Used for equity calculations

### For Motivation Scoring
- **Ownership Duration**: Longer ownership often indicates more equity
- **Owner Type**: Different owner types have different motivation patterns
- **Absentee Status**: Out-of-area owners often more motivated

### For Market Analysis
- **Price Trends**: Year-over-year changes indicate market direction
- **Days on Market**: Low DOM = hot market, high DOM = buyer's market
- **Inventory Levels**: Supply indicator for negotiation strategy

## Understanding RentCast Confidence Scores

RentCast valuations include a confidence score (0-100) that indicates estimate reliability:

| Score Range | Interpretation | Action |
|-------------|----------------|--------|
| 80-100 | High confidence | Use for deal analysis |
| 60-79 | Moderate confidence | Verify with additional comps |
| 40-59 | Low confidence | Request contractor estimate |
| Below 40 | Very low confidence | Do not rely on AVM |

**Factors affecting confidence:**
- Number of recent comparable sales
- Similarity of comparables to subject
- Recency of sales data
- Property uniqueness

## Data Refresh Rates

| Data Type | Update Frequency |
|-----------|------------------|
| Property Records | Weekly |
| Tax Assessments | Annually |
| Valuations | Monthly |
| Market Data | Monthly |
| Active Listings | Daily |
| Sold Listings | Weekly |

## Related Documentation

- [Understanding ARV Calculations](arv-calculation-methods)
- [Deal Analysis Framework](deal-analysis-framework)
- [Analyze Deal Tool](tool-deal-analysis-analyze)
- [RentCast Valuation Data](rentcast-valuation-data)
- [Interpreting Property Metrics](interpreting-property-metrics)
