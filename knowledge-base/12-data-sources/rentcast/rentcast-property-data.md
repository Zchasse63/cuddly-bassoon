---
slug: rentcast-property-data
title: "RentCast Property Data - Complete Field Reference"
category: Data Sources
subcategory: Property Data
tags: [data-rentcast, data-source, property-data, concept-owner, concept-absentee]
related_docs: [rentcast-overview, first-search-workflow, tool-property-search-search, interpreting-property-metrics]
difficulty_level: intermediate
---

# RentCast Property Data - Complete Field Reference

## Property Record Structure

Every property record from RentCast includes comprehensive data across several categories.

## Core Property Fields

### Address Information

| Field | Description | Example |
|-------|-------------|---------|
| `formattedAddress` | Full formatted address | "123 Main St, Miami, FL 33139" |
| `addressLine1` | Street address | "123 Main St" |
| `addressLine2` | Unit/apt (if applicable) | "Unit 4B" |
| `city` | City name | "Miami" |
| `state` | State code | "FL" |
| `zipCode` | 5-digit ZIP | "33139" |
| `county` | County name | "Miami-Dade" |

### Geographic Coordinates

| Field | Description | Use Case |
|-------|-------------|----------|
| `latitude` | Latitude coordinate | Map display, distance calc |
| `longitude` | Longitude coordinate | Heat mapping, clustering |

## Property Characteristics

### Physical Attributes

| Field | Type | Description |
|-------|------|-------------|
| `propertyType` | String | Single Family, Multi-Family, Condo, Townhouse, Mobile, Land |
| `bedrooms` | Number | Bedroom count |
| `bathrooms` | Number | Bathroom count (can be decimal for half-baths) |
| `squareFootage` | Number | Living area in sq ft |
| `lotSize` | Number | Lot size in sq ft |
| `yearBuilt` | Number | Year of construction |
| `stories` | Number | Number of floors |

### Property Features

| Field | Type | Description |
|-------|------|-------------|
| `cooling` | Boolean | Has AC |
| `heating` | Boolean | Has heating system |
| `fireplace` | Boolean | Has fireplace |
| `pool` | Boolean | Has pool |
| `garage` | Boolean | Has garage |
| `garageSpaces` | Number | Garage capacity |

## Owner Information

### Owner Identity

| Field | Description | Motivation Impact |
|-------|-------------|-------------------|
| `ownerNames` | Array of owner names | Multiple owners may complicate decisions |
| `ownerType` | Individual, Company, Trust, Government, Bank | Different types have different motivations |
| `ownerOccupied` | Whether owner lives there | Non-occupied = absentee |

### Owner Types Explained

| Type | Description | Typical Motivation |
|------|-------------|-------------------|
| **Individual** | Person/family | Life events, retirement, divorce |
| **Company** | LLC, Corp | Business decisions, portfolio changes |
| **Trust** | Family/living trust | Estate planning, inheritance |
| **Government** | City/county/state | Tax foreclosure, surplus |
| **Bank** | Lender-owned (REO) | Need to liquidate |

### Mailing Address

| Field | Description | Significance |
|-------|-------------|--------------|
| `mailingAddress.addressLine1` | Where owner gets mail | Different from property = absentee |
| `mailingAddress.city` | Mailing city | Different state = out-of-state owner |
| `mailingAddress.state` | Mailing state | Key absentee indicator |
| `mailingAddress.zipCode` | Mailing ZIP | Distance calculation |

## Tax Assessment Data

### Assessment Values

| Field | Description | Use Case |
|-------|-------------|----------|
| `assessedValue` | County assessed value | Usually conservative |
| `marketValue` | Tax market value | County's estimate |
| `taxYear` | Year of assessment | Verify currency |
| `taxAmount` | Annual property tax | Carrying cost |

### Using Tax Data

**Equity Calculation:**
```
Rough Equity = Market Value - Estimated Mortgage
```

**Tax Burden Analysis:**
- High taxes on low-value property = stressed owner
- Recent assessment increase = potential catalyst

## Sales History

### Last Sale Information

| Field | Description | Significance |
|-------|-------------|--------------|
| `lastSaleDate` | Date of last transfer | Ownership duration |
| `lastSalePrice` | Price paid | Equity baseline |

### Calculating Ownership Duration

```
Ownership Months = (Today - Last Sale Date) / 30
```

**Motivation by Duration (Individual Owners):**
| Duration | Typical Motivation |
|----------|-------------------|
| 0-2 years | Low (recent buyer) |
| 2-5 years | Low-Medium |
| 5-10 years | Medium |
| 10-15 years | High |
| 15+ years | Very High |

## Legal Information

| Field | Description | Notes |
|-------|-------------|-------|
| `assessorID` | County parcel number | For public records |
| `legalDescription` | Legal parcel description | Title reference |
| `subdivision` | Subdivision name | Neighborhood identifier |
| `zoning` | Zoning code | Use restrictions |

## Key Derived Metrics

These aren't in the raw data but are calculated:

### Absentee Status

```
isAbsentee = Property Address ≠ Mailing Address
```

### Out-of-State Owner

```
isOutOfState = Property State ≠ Mailing State
```

### Estimated Equity

```
equityPercent = (MarketValue - EstimatedMortgage) / MarketValue × 100
```

### Distance to Owner

```
distanceToOwner = Distance(PropertyCoords, MailingCoords)
```

## Data Quality Notes

### Fields That May Be Missing

- `squareFootage` - Older properties may lack this
- `ownerType` - May default to "Unknown"
- `mailingAddress` - Some records lack this

### Data Freshness

| Data Type | Update Frequency |
|-----------|------------------|
| Property attributes | Weekly |
| Owner info | Weekly |
| Tax data | Annually |
| Sales history | Weekly |

## Related Documentation

- [RentCast Overview](rentcast-overview)
- [Property Search Workflow](first-search-workflow)
- [Interpreting Property Metrics](interpreting-property-metrics)
