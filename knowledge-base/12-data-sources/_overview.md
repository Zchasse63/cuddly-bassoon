---
slug: data-sources-overview
title: "Data Sources - Complete API Reference Guide"
category: Data Sources
subcategory: Overview
tags: [data-source, data-rentcast, data-shovels, data-census, overview]
related_docs: [rentcast-overview, shovels-overview, census-overview]
difficulty_level: beginner
---

# Data Sources Overview

## Platform Data Sources

This platform integrates three primary data sources to provide comprehensive real estate intelligence for wholesale deal analysis.

## RentCast (Property & Valuation Data)

**Coverage:** 140M+ property records nationwide

| Data Type | Use Case |
|-----------|----------|
| [Property Records](rentcast-property-data) | Owner info, characteristics, tax data |
| [Valuations (AVM)](rentcast-valuation-data) | ARV estimates, comparable sales |
| [Market Data](rentcast-market-data) | Market trends, velocity metrics |
| Rent Estimates | Rental income analysis |
| Listings | Active/sold MLS listings |

**Key Documentation:**
- [RentCast Overview](rentcast-overview)
- [Property Data Reference](rentcast-property-data)
- [Valuation Data Reference](rentcast-valuation-data)
- [Market Data Reference](rentcast-market-data)

## Shovels (Permit & Contractor Data)

**Coverage:** Nationwide construction permit data

| Data Type | Use Case |
|-----------|----------|
| [Permit Records](shovels-permit-data) | Renovation history, active projects |
| [Contractor Data](shovels-contractor-data) | Contractor quality, specializations |
| Geographic Metrics | Area permit activity |

**Key Documentation:**
- [Shovels Overview](shovels-overview)
- [Permit Data Reference](shovels-permit-data)
- [Contractor Data Reference](shovels-contractor-data)

## Census (Demographics & Boundaries)

**Coverage:** All US geographic areas

| Data Type | Use Case |
|-----------|----------|
| [Demographics](census-demographics) | Population, income, housing stats |
| Geographic Boundaries | Tract, block group, ZIP boundaries |

**Key Documentation:**
- [Census Overview](census-overview)
- [Demographics Reference](census-demographics)

## How Data Sources Work Together

### For Deal Analysis

```
RentCast AVM → ARV Estimate
RentCast Property → Owner/Equity Info
Shovels Permits → Condition Assessment
Census Data → Market Context
```

### For Motivation Scoring

```
RentCast Property → Ownership Duration, Absentee Status
RentCast Tax → Tax Burden Analysis
Shovels Permits → Abandoned Projects
Census → Demographic Signals
```

### For Market Analysis

```
RentCast Market → Price Trends, Velocity
Census Demographics → Population Trends
Shovels Permits → Development Activity
```

## Data Freshness Summary

| Source | Data Type | Update Frequency |
|--------|-----------|------------------|
| RentCast | Property records | Weekly |
| RentCast | Valuations | Monthly |
| RentCast | Market data | Monthly |
| Shovels | Permits | Daily-Weekly |
| Shovels | Contractors | Weekly |
| Census | ACS Data | Annual |
| Census | Boundaries | Decennial |

## Related Documentation

- [Interpreting ARV Estimates](interpreting-arv-estimates)
- [Interpreting Permit Activity](interpreting-permit-activity)
- [Combining Multiple Signals](combining-multiple-signals)
