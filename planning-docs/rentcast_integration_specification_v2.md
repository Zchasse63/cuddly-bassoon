# RentCast API Integration Specification
## AI-First Real Estate Wholesaling Platform

**Version:** 1.0  
**Last Updated:** December 2, 2025  
**Status:** Technical Specification - Ready for Implementation

---

## Executive Summary

RentCast is the **primary data source** for the AI-First Real Estate Wholesaling Platform. This document provides complete schema documentation, feature mapping, and integration patterns to ensure we leverage 100% of RentCast's capabilities from day one.

### Why RentCast

| Factor | RentCast Advantage |
|--------|-------------------|
| **AI-Native** | MCP Server, LLMs.txt, designed for AI integration |
| **Wholesaler-Focused** | Same company as DealCheck (investor tool with 40+ rentals) |
| **No Contracts** | Transparent pricing, cancel anytime |
| **Complete Data** | Property + Owner + AVM + Rent + Market in single API |
| **Fresh Data** | 500K+ updates daily, individual records updated weekly |
| **Coverage** | 140M+ properties, 96% residential, all 50 states |

### Four Core Schemas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        RENTCAST DATA ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐   │
│   │  PROPERTY DATA  │    │   VALUATION     │    │  MARKET DATA    │   │
│   │    SCHEMA       │    │    SCHEMA       │    │    SCHEMA       │   │
│   │                 │    │                 │    │                 │   │
│   │ • 140M records  │    │ • Value (ARV)   │    │ • Zip-level     │   │
│   │ • Owner info    │    │ • Rent estimate │    │ • Historical    │   │
│   │ • Tax history   │    │ • 25 comps      │    │ • By property   │   │
│   │ • Sale history  │    │ • Correlation % │    │   type          │   │
│   │ • Features      │    │                 │    │ • By bedrooms   │   │
│   └────────┬────────┘    └────────┬────────┘    └────────┬────────┘   │
│            │                      │                      │             │
│            └──────────────────────┼──────────────────────┘             │
│                                   │                                     │
│                    ┌──────────────┴──────────────┐                     │
│                    │     LISTINGS SCHEMA         │                     │
│                    │                             │                     │
│                    │ • Active/Inactive sales     │                     │
│                    │ • Active/Inactive rentals   │                     │
│                    │ • Agent/Office info         │                     │
│                    │ • MLS data                  │                     │
│                    │ • Listing history           │                     │
│                    └─────────────────────────────┘                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Schema 1: Property Data (/properties)

### Overview

The Property Data schema is the foundation - containing 140M+ property records with comprehensive details about each property's physical attributes, ownership, tax history, and sale history.

### Endpoint

```
GET https://api.rentcast.io/v1/properties
GET https://api.rentcast.io/v1/properties/{id}
GET https://api.rentcast.io/v1/properties/random
```

### Complete Field Reference

#### Core Location Fields

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `id` | String | Unique RentCast identifier | Primary key for caching |
| `formattedAddress` | String | Full address (Street, City, State Zip) | Display, search |
| `addressLine1` | String | Street address | Mailing, display |
| `addressLine2` | String | Unit/Apt number | Multi-family identification |
| `city` | String | City name | Geographic filtering |
| `state` | String | 2-char abbreviation | Geographic filtering |
| `stateFips` | String | 2-digit state FIPS code | Data joining, census data |
| `zipCode` | String | 5-digit zip | Market analysis linking |
| `county` | String | County name | Tax jurisdiction |
| `countyFips` | String | 3-digit county FIPS | Data joining |
| `latitude` | Number | Geographic latitude | Map display, radius search |
| `longitude` | Number | Geographic longitude | Map display, radius search |

#### Property Attributes

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `propertyType` | String | Property classification | Filtering, analysis |
| `bedrooms` | Number | Bedroom count (0 = studio) | Filtering, rent comps |
| `bathrooms` | Number | Bathroom count | Filtering, rent comps |
| `squareFootage` | Number | Living area (sq ft) | Price/sqft calculations |
| `lotSize` | Number | Lot size (sq ft) | Land value analysis |
| `yearBuilt` | Number | Construction year | Age-based analysis |
| `assessorID` | String | County APN | Title research |
| `legalDescription` | String | Legal property description | Contract preparation |
| `subdivision` | String | Subdivision name | Neighborhood analysis |
| `zoning` | String | Zoning code | Use case validation |

#### Sale History

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `lastSaleDate` | ISO Date | Most recent sale date | Flip opportunity detection |
| `lastSalePrice` | Number | Most recent sale price | Equity calculation base |
| `history` | Object | All sale transactions | Appreciation analysis |
| `history[date].event` | String | Always "Sale" | Event classification |
| `history[date].date` | ISO Date | Transaction date | Timeline analysis |
| `history[date].price` | Number | Sale price | Price trend analysis |

#### HOA Information

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `hoa` | Object | HOA details container | - |
| `hoa.fee` | Number | Monthly HOA fee | Cash flow calculation |

#### Property Features (features object)

| Field | Type | Values | Platform Use |
|-------|------|--------|--------------|
| `architectureType` | String | Contemporary, Ranch, Colonial, etc. | Property profile |
| `cooling` | Boolean | true/false | Feature checklist |
| `coolingType` | String | Central, Window, Evaporative, etc. | Repair estimation |
| `exteriorType` | String | Brick, Vinyl, Wood, Stucco, etc. | Repair estimation |
| `fireplace` | Boolean | true/false | Feature amenity |
| `fireplaceType` | String | Masonry, Gas Log, Prefab, etc. | Feature detail |
| `floorCount` | Number | Number of stories | Property profile |
| `foundationType` | String | Slab, Crawl, Basement, etc. | Repair estimation |
| `garage` | Boolean | true/false | Feature amenity |
| `garageSpaces` | Number | Number of spaces | Feature detail |
| `garageType` | String | Attached, Detached, Carport | Feature detail |
| `heating` | Boolean | true/false | Feature checklist |
| `heatingType` | String | Forced Air, Radiant, Heat Pump | Repair estimation |
| `pool` | Boolean | true/false | Feature amenity (ARV impact) |
| `poolType` | String | In-Ground, Above-Ground, etc. | Feature detail |
| `roofType` | String | Asphalt, Tile, Metal, etc. | Repair estimation |
| `roomCount` | Number | Total interior rooms | Property profile |
| `unitCount` | Number | Units in building | Multi-family analysis |
| `viewType` | String | City, Water, Mountain, etc. | Premium value indicator |

#### Tax Assessment History (taxAssessments object)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `taxAssessments[year]` | Object | Assessment by year | - |
| `taxAssessments[year].year` | Number | Assessment year | Timeline |
| `taxAssessments[year].value` | Number | Total assessed value | Equity estimation |
| `taxAssessments[year].land` | Number | Land value only | Land/improvement split |
| `taxAssessments[year].improvements` | Number | Improvement value | Depreciation analysis |

#### Property Tax History (propertyTaxes object)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `propertyTaxes[year]` | Object | Taxes by year | - |
| `propertyTaxes[year].year` | Number | Tax year | Timeline |
| `propertyTaxes[year].total` | Number | Annual property tax | Cash flow calculation |

#### Owner Information (CRITICAL FOR WHOLESALING)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `owner` | Object | Owner details container | - |
| `owner.names` | Array[String] | Owner name(s) | Skip trace input, direct mail |
| `owner.type` | String | "Individual" or "Organization" | Lead scoring, LLC detection |
| `owner.mailingAddress` | Object | Owner's mailing address | Direct mail campaigns |
| `owner.mailingAddress.id` | String | Mailing address property ID | Absentee detection |
| `owner.mailingAddress.formattedAddress` | String | Full mailing address | Direct mail |
| `owner.mailingAddress.addressLine1` | String | Street address | Direct mail |
| `owner.mailingAddress.addressLine2` | String | Unit/Apt | Direct mail |
| `owner.mailingAddress.city` | String | City | Direct mail |
| `owner.mailingAddress.state` | String | State | Direct mail |
| `owner.mailingAddress.stateFips` | String | State FIPS | Data joining |
| `owner.mailingAddress.zipCode` | String | Zip code | Direct mail |
| `ownerOccupied` | Boolean | Owner lives at property | **Absentee owner detection** |

### Property Types (propertyType values)

| Value | Description | Wholesaler Interest |
|-------|-------------|---------------------|
| `Single Family` | Detached single-family home | **HIGH** - Primary target |
| `Condo` | Condominium unit | MEDIUM - HOA considerations |
| `Townhouse` | Attached townhome | MEDIUM - HOA considerations |
| `Multi-Family` | 2-4 unit building | **HIGH** - Cash flow plays |
| `Apartment` | 5+ unit building | HIGH - Larger deals |
| `Manufactured` | Mobile/manufactured home | MEDIUM - Specific markets |
| `Land` | Vacant land | MEDIUM - Development plays |

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `address` | String | Single property lookup | `5500 Grand Lake Dr, San Antonio, TX 78244` |
| `city` | String | City filter | `San Antonio` |
| `state` | String | 2-char state | `TX` |
| `zipCode` | String | 5-digit zip | `78244` |
| `latitude` | Number | Center point lat | `29.475962` |
| `longitude` | Number | Center point lng | `-98.351442` |
| `radius` | Number | Search radius (miles) | `5` |
| `propertyType` | String | Property type filter | `Single Family\|Condo` |
| `bedrooms` | String | Bedroom filter (range) | `2:4` or `3` |
| `bathrooms` | String | Bathroom filter (range) | `1:3` |
| `squareFootage` | String | Sqft filter (range) | `1000:2000` |
| `lotSize` | String | Lot sqft filter (range) | `5000:10000` |
| `yearBuilt` | String | Year built filter (range) | `1990:2010` |
| `saleDateRange` | String | Days since last sale | `180` or `180:365` |
| `limit` | Number | Results per page (max 500) | `100` |
| `offset` | Number | Pagination offset | `100` |
| `includeTotalCount` | Boolean | Return total count header | `true` |

---

## Schema 2: Property Valuation (/avm)

### Overview

The Valuation schema provides Automated Valuation Model (AVM) data for both property values (ARV) and rent estimates, along with up to 25 comparable properties.

### Endpoints

```
GET https://api.rentcast.io/v1/avm/value       # Property value estimate (ARV)
GET https://api.rentcast.io/v1/avm/rent/long-term  # Rent estimate
```

### Value Estimate Response Fields

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `price` | Number | Estimated market value (ARV) | **Deal analysis core** |
| `priceRangeLow` | Number | 85% confidence low bound | Conservative ARV |
| `priceRangeHigh` | Number | 85% confidence high bound | Aggressive ARV |

### Rent Estimate Response Fields

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `rent` | Number | Monthly rent estimate | **Cash flow analysis** |
| `rentRangeLow` | Number | 85% confidence low bound | Conservative rent |
| `rentRangeHigh` | Number | 85% confidence high bound | Market rate rent |

### Subject Property Fields (returned in both endpoints)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `subjectProperty.id` | String | Property ID | Cross-reference |
| `subjectProperty.formattedAddress` | String | Full address | Display |
| `subjectProperty.addressLine1` | String | Street | Display |
| `subjectProperty.addressLine2` | String | Unit | Display |
| `subjectProperty.city` | String | City | Display |
| `subjectProperty.state` | String | State | Display |
| `subjectProperty.stateFips` | String | State FIPS | Data join |
| `subjectProperty.zipCode` | String | Zip | Market link |
| `subjectProperty.county` | String | County | Display |
| `subjectProperty.countyFips` | String | County FIPS | Data join |
| `subjectProperty.latitude` | Number | Latitude | Map |
| `subjectProperty.longitude` | Number | Longitude | Map |
| `subjectProperty.propertyType` | String | Property type | Analysis |
| `subjectProperty.bedrooms` | Number | Bedrooms | Comp matching |
| `subjectProperty.bathrooms` | Number | Bathrooms | Comp matching |
| `subjectProperty.squareFootage` | Number | Living area | Price/sqft |
| `subjectProperty.lotSize` | Number | Lot size | Analysis |
| `subjectProperty.yearBuilt` | Number | Year built | Analysis |
| `subjectProperty.lastSaleDate` | ISO Date | Last sale | Equity calc |
| `subjectProperty.lastSalePrice` | Number | Last price | Equity calc |

### Comparable Properties Fields (up to 25 comps)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `comparables[].id` | String | Comp property ID | Cross-reference |
| `comparables[].formattedAddress` | String | Full address | Display |
| `comparables[].addressLine1` | String | Street | Display |
| `comparables[].addressLine2` | String | Unit | Display |
| `comparables[].city` | String | City | Display |
| `comparables[].state` | String | State | Display |
| `comparables[].stateFips` | String | State FIPS | Data join |
| `comparables[].zipCode` | String | Zip | Display |
| `comparables[].county` | String | County | Display |
| `comparables[].countyFips` | String | County FIPS | Data join |
| `comparables[].latitude` | Number | Latitude | Map display |
| `comparables[].longitude` | Number | Longitude | Map display |
| `comparables[].propertyType` | String | Property type | Comp quality |
| `comparables[].bedrooms` | Number | Bedrooms | Comp quality |
| `comparables[].bathrooms` | Number | Bathrooms | Comp quality |
| `comparables[].squareFootage` | Number | Living area | Price/sqft |
| `comparables[].lotSize` | Number | Lot size | Comp quality |
| `comparables[].yearBuilt` | Number | Year built | Comp quality |
| `comparables[].status` | String | "Active" or "Inactive" | Recency |
| `comparables[].price` | Number | Listed price/rent | Comp value |
| `comparables[].listingType` | String | Standard/Foreclosure/etc | **Distress indicator** |
| `comparables[].listedDate` | ISO Date | When listed | Recency |
| `comparables[].removedDate` | ISO Date | When removed (if inactive) | Market time |
| `comparables[].lastSeenDate` | ISO Date | Last seen active | Data freshness |
| `comparables[].daysOnMarket` | Number | Days active | Market velocity |
| `comparables[].distance` | Number | Miles from subject | Comp quality |
| `comparables[].daysOld` | Number | Days since last seen | Data freshness |
| `comparables[].correlation` | Number | 0-1 similarity score | **Comp quality rank** |

### Listing Types (comparables[].listingType)

| Value | Description | Wholesaler Signal |
|-------|-------------|-------------------|
| `Standard` | Normal market listing | Baseline comp |
| `New Construction` | Newly built | Premium ARV indicator |
| `Foreclosure` | Bank-owned/REO | **Distressed market** |
| `Short Sale` | Underwater sale | **Motivated seller market** |

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `address` | String | Subject property address | `5500 Grand Lake Dr, San Antonio, TX 78244` |
| `latitude` | Number | Subject property lat | `29.475962` |
| `longitude` | Number | Subject property lng | `-98.351442` |
| `propertyType` | String | Override property type | `Single Family` |
| `bedrooms` | Number | Override bedrooms | `3` |
| `bathrooms` | Number | Override bathrooms | `2` |
| `squareFootage` | Number | Override sqft | `1500` |
| `lookupSubjectAttributes` | Boolean | Auto-lookup attributes | `true` (default) |
| `maxRadius` | Number | Max comp distance (miles) | `5` |
| `daysOld` | Number | Max comp age (days) | `180` |
| `compCount` | Number | Number of comps (max 25) | `25` |

---

## Schema 3: Market Data (/markets)

### Overview

The Market Data schema provides aggregate statistics at the zip code level for both sale and rental markets, with historical trends dating back to April 2020 (rental) and January 2024 (sale).

### Endpoint

```
GET https://api.rentcast.io/v1/markets
```

### Top-Level Response Fields

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `zipCode` | String | Zip code ID | Primary key |
| `name` | String | Zip code name | Display |
| `saleData` | Object | Sale market statistics | Market analysis |
| `rentalData` | Object | Rental market statistics | Market analysis |

### Sale Data Statistics (saleData)

#### Current Statistics (Top Level)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `lastUpdatedDate` | ISO Date | Data freshness | Quality indicator |
| `averagePrice` | Number | Average sale price | Market benchmark |
| `medianPrice` | Number | Median sale price | Market benchmark |
| `minPrice` | Number | Lowest sale price | Market floor |
| `maxPrice` | Number | Highest sale price | Market ceiling |
| `averagePricePerSquareFoot` | Number | Avg $/sqft | **ARV validation** |
| `medianPricePerSquareFoot` | Number | Median $/sqft | ARV validation |
| `minPricePerSquareFoot` | Number | Min $/sqft | Bottom market |
| `maxPricePerSquareFoot` | Number | Max $/sqft | Top market |
| `averageSquareFootage` | Number | Avg home size | Market profile |
| `medianSquareFootage` | Number | Median home size | Market profile |
| `minSquareFootage` | Number | Smallest homes | Market profile |
| `maxSquareFootage` | Number | Largest homes | Market profile |
| `averageDaysOnMarket` | Number | Avg DOM | **Market velocity** |
| `medianDaysOnMarket` | Number | Median DOM | Market velocity |
| `minDaysOnMarket` | Number | Fastest sales | Hot market indicator |
| `maxDaysOnMarket` | Number | Slowest sales | Stale inventory |
| `newListings` | Number | New listings this month | Supply indicator |
| `totalListings` | Number | Total active listings | Inventory level |

#### By Property Type (saleData.dataByPropertyType[])

Same statistics fields as above, grouped by:
- `propertyType`: "Single Family", "Condo", "Townhouse", "Multi-Family", etc.

#### By Bedroom Count (saleData.dataByBedrooms[])

Same statistics fields as above, grouped by:
- `bedrooms`: 0 (studio), 1, 2, 3, 4, 5+

#### Historical Data (saleData.history)

```javascript
saleData.history: {
  "2024-01": { date: "2024-01-01", ...statistics, dataByPropertyType: [...], dataByBedrooms: [...] },
  "2024-02": { date: "2024-02-01", ...statistics, dataByPropertyType: [...], dataByBedrooms: [...] },
  // ... monthly data back to January 2024
}
```

### Rental Data Statistics (rentalData)

#### Current Statistics (Top Level)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `lastUpdatedDate` | ISO Date | Data freshness | Quality indicator |
| `averageRent` | Number | Average monthly rent | **Rent benchmark** |
| `medianRent` | Number | Median monthly rent | Rent benchmark |
| `minRent` | Number | Lowest rent | Market floor |
| `maxRent` | Number | Highest rent | Market ceiling |
| `averageRentPerSquareFoot` | Number | Avg rent/sqft | Rent validation |
| `medianRentPerSquareFoot` | Number | Median rent/sqft | Rent validation |
| `minRentPerSquareFoot` | Number | Min rent/sqft | Bottom market |
| `maxRentPerSquareFoot` | Number | Max rent/sqft | Top market |
| `averageSquareFootage` | Number | Avg rental size | Market profile |
| `medianSquareFootage` | Number | Median rental size | Market profile |
| `minSquareFootage` | Number | Smallest rentals | Market profile |
| `maxSquareFootage` | Number | Largest rentals | Market profile |
| `averageDaysOnMarket` | Number | Avg rental DOM | **Rental velocity** |
| `medianDaysOnMarket` | Number | Median rental DOM | Rental velocity |
| `minDaysOnMarket` | Number | Fastest rentals | Demand indicator |
| `maxDaysOnMarket` | Number | Slowest rentals | Oversupply indicator |
| `newListings` | Number | New rentals this month | Supply indicator |
| `totalListings` | Number | Total rental listings | Inventory level |

#### By Property Type (rentalData.dataByPropertyType[])

Same statistics fields as above, grouped by property type.

#### By Bedroom Count (rentalData.dataByBedrooms[])

Same statistics fields as above, grouped by bedroom count.

#### Historical Data (rentalData.history)

```javascript
rentalData.history: {
  "2020-04": { date: "2020-04-01", ...statistics, dataByPropertyType: [...], dataByBedrooms: [...] },
  // ... monthly data back to April 2020 (5+ years of rental trends!)
}
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `zipCode` | String | 5-digit zip code | `78244` |
| `dataType` | String | Data to return | `All`, `Sale`, `Rental` |
| `historyRange` | Number | Months of history | `24` (default 12) |

---

## Schema 4: Property Listings (/listings)

### Overview

The Listings schema provides active and inactive sale and rental listings with comprehensive details including agent information, MLS data, and listing history.

### Endpoints

```
GET https://api.rentcast.io/v1/listings/sale             # Sale listings search
GET https://api.rentcast.io/v1/listings/sale/{id}        # Single sale listing
GET https://api.rentcast.io/v1/listings/rental/long-term # Rental listings search
GET https://api.rentcast.io/v1/listings/rental/long-term/{id}  # Single rental listing
```

### Listing Response Fields

#### Core Property Fields

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `id` | String | Listing ID | Primary key |
| `formattedAddress` | String | Full address | Display |
| `addressLine1` | String | Street | Display |
| `addressLine2` | String | Unit | Display |
| `city` | String | City | Filter |
| `state` | String | State | Filter |
| `stateFips` | String | State FIPS | Data join |
| `zipCode` | String | Zip | Filter, market link |
| `county` | String | County | Display |
| `countyFips` | String | County FIPS | Data join |
| `latitude` | Number | Latitude | Map |
| `longitude` | Number | Longitude | Map |
| `propertyType` | String | Property type | Filter |
| `bedrooms` | Number | Bedrooms | Filter |
| `bathrooms` | Number | Bathrooms | Filter |
| `squareFootage` | Number | Living area | Analysis |
| `lotSize` | Number | Lot size | Analysis |
| `yearBuilt` | Number | Year built | Analysis |

#### HOA Information

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `hoa` | Object | HOA container | - |
| `hoa.fee` | Number | Monthly HOA fee | Cash flow calc |

#### Listing Status Fields

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `status` | String | "Active" or "Inactive" | **Current availability** |
| `price` | Number | Listed price (sale) or rent (rental) | Analysis |
| `listingType` | String | Standard/Foreclosure/Short Sale/New | **Distress detection** |
| `listedDate` | ISO Date | When first listed | Time on market |
| `removedDate` | ISO Date | When removed (if inactive) | Sale timing |
| `createdDate` | ISO Date | When we first saw it | Data provenance |
| `lastSeenDate` | ISO Date | Last seen active | Data freshness |
| `daysOnMarket` | Number | Days listed | **Motivation indicator** |

#### MLS Information

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `mlsName` | String | MLS name | Data source |
| `mlsNumber` | String | MLS listing number | Cross-reference |

#### Agent Information (listingAgent)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `listingAgent.name` | String | Agent name | Contact |
| `listingAgent.phone` | String | Agent phone (10 digit) | Contact |
| `listingAgent.email` | String | Agent email | Contact |
| `listingAgent.website` | String | Agent website | Research |

#### Office/Broker Information (listingOffice)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `listingOffice.name` | String | Brokerage name | Research |
| `listingOffice.phone` | String | Office phone | Contact |
| `listingOffice.email` | String | Office email | Contact |
| `listingOffice.website` | String | Office website | Research |

#### Builder Information (New Construction Only)

| Field | Type | Description | Platform Use |
|-------|------|-------------|--------------|
| `builder.name` | String | Builder name | Research |
| `builder.development` | String | Development/community name | Research |
| `builder.phone` | String | Builder phone | Contact |
| `builder.website` | String | Builder website | Research |

#### Listing History (history)

```javascript
history: {
  "2024-06-24": {
    event: "Sale Listing" | "Rental Listing",
    price: 899000,
    listingType: "Standard",
    listedDate: "2024-06-24T00:00:00.000Z",
    removedDate: null,
    daysOnMarket: 99
  },
  "2024-03-15": {
    // Previous listing...
  }
}
```

### Listing Status Values

| Status | Description | Wholesaler Signal |
|--------|-------------|-------------------|
| `Active` | Currently on market | Available for offers |
| `Inactive` | No longer listed | Recently sold/rented |

### Listing Type Values

| Type | Description | Wholesaler Signal |
|------|-------------|-------------------|
| `Standard` | Normal listing | Baseline |
| `New Construction` | Newly built | Premium comps |
| `Foreclosure` | Bank-owned/REO | **HIGH MOTIVATION** |
| `Short Sale` | Underwater | **HIGH MOTIVATION** |

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `address` | String | Single listing lookup | `5500 Grand Lake Dr, San Antonio, TX` |
| `city` | String | City filter | `San Antonio` |
| `state` | String | State filter | `TX` |
| `zipCode` | String | Zip filter | `78244` |
| `latitude` | Number | Center lat | `29.475962` |
| `longitude` | Number | Center lng | `-98.351442` |
| `radius` | Number | Search radius (miles) | `5` |
| `propertyType` | String | Property type filter | `Single Family\|Condo` |
| `bedrooms` | String | Bedroom filter | `2:4` |
| `bathrooms` | String | Bathroom filter | `1:3` |
| `squareFootage` | String | Sqft filter | `1000:2000` |
| `lotSize` | String | Lot filter | `5000:10000` |
| `yearBuilt` | String | Year filter | `1990:2010` |
| `status` | String | Listing status | `Active` or `Inactive` |
| `price` / `rent` | String | Price/rent range | `100000:300000` |
| `daysOld` | Number | Max days since listed | `30` |
| `limit` | Number | Results per page | `100` |
| `offset` | Number | Pagination offset | `100` |

---

## Feature Mapping: Schema → Platform Capabilities

### Phase 1 MVP Features

| Feature | Primary Schema | Supporting Schemas | Key Fields |
|---------|---------------|-------------------|------------|
| **Property Search** | Property Data | - | All location + attribute fields |
| **ARV Calculation** | Valuation | Market Data | `price`, `priceRangeLow`, `priceRangeHigh` |
| **Owner Lookup** | Property Data | - | `owner.*`, `ownerOccupied` |
| **Absentee Detection** | Property Data | - | Compare `owner.mailingAddress` vs `formattedAddress` |
| **Basic Deal Analysis** | Valuation + Property | Market Data | AVM + `lastSalePrice` + `propertyTaxes` |

### Phase 2 Enhanced Features

| Feature | Primary Schema | Supporting Schemas | Key Fields |
|---------|---------------|-------------------|------------|
| **Rent Analysis** | Valuation (rent) | Market Data | `rent`, `rentRangeLow`, `rentRangeHigh` |
| **Cash Flow Calculator** | Valuation + Property | Market Data | `rent` - `propertyTaxes` - `hoa.fee` |
| **Comp Analysis** | Valuation | Listings | `comparables[]`, `correlation` |
| **Market Trends** | Market Data | - | `history`, `dataByPropertyType` |
| **Days on Market Analysis** | Listings + Market | - | `daysOnMarket`, `averageDaysOnMarket` |

### Phase 3 Advanced Features

| Feature | Primary Schema | Supporting Schemas | Key Fields |
|---------|---------------|-------------------|------------|
| **Distress Detection** | Listings | Property Data | `listingType` (Foreclosure/Short Sale) |
| **Equity Analysis** | Property + Valuation | - | `price` (AVM) vs `lastSalePrice` |
| **Tax Lien Indicators** | Property Data | - | `taxAssessments`, `propertyTaxes` trends |
| **Appreciation Analysis** | Market Data | Property | `history` (sale trends) |
| **Rental Market Velocity** | Market Data | Listings | `averageDaysOnMarket` (rental) |
| **LLC Owner Detection** | Property Data | - | `owner.type` = "Organization" |
| **Multi-Listing Detection** | Property Data | Listings | `owner.names` across properties |

### AI Analysis Features

| Feature | Data Sources | AI Application |
|---------|-------------|----------------|
| **Deal Score** | All 4 schemas | Weighted analysis of ARV, equity, motivation, market |
| **Market Narrative** | Market Data | Natural language market summary |
| **Comp Explanation** | Valuation | Explain why comps were selected |
| **Risk Assessment** | All schemas | Identify red flags, opportunities |
| **Investment Strategy Match** | All schemas | Match deal to user's criteria |

---

## Database Schema for RentCast Data Caching

### Supabase Tables

```sql
-- Core property records cache
CREATE TABLE properties (
  id TEXT PRIMARY KEY,  -- RentCast property ID
  formatted_address TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_fips TEXT,
  zip_code TEXT NOT NULL,
  county TEXT,
  county_fips TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_footage INTEGER,
  lot_size INTEGER,
  year_built INTEGER,
  assessor_id TEXT,
  legal_description TEXT,
  subdivision TEXT,
  zoning TEXT,
  last_sale_date TIMESTAMP,
  last_sale_price INTEGER,
  hoa_fee INTEGER,
  owner_occupied BOOLEAN,
  
  -- JSONB for nested/variable data
  features JSONB,  -- All features.* fields
  tax_assessments JSONB,  -- Year-keyed assessments
  property_taxes JSONB,  -- Year-keyed taxes
  sale_history JSONB,  -- Date-keyed sales
  owner_data JSONB,  -- Owner names, type, mailing address
  
  -- Cache management
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  
  -- Geospatial
  location GEOGRAPHY(POINT, 4326)
);

-- Indexes for property search
CREATE INDEX idx_properties_location ON properties USING GIST (location);
CREATE INDEX idx_properties_zip ON properties (zip_code);
CREATE INDEX idx_properties_city_state ON properties (city, state);
CREATE INDEX idx_properties_type ON properties (property_type);
CREATE INDEX idx_properties_beds_baths ON properties (bedrooms, bathrooms);
CREATE INDEX idx_properties_owner_occupied ON properties (owner_occupied);
CREATE INDEX idx_properties_last_sale ON properties (last_sale_date);

-- Valuation cache (separate due to different TTL)
CREATE TABLE valuations (
  id SERIAL PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id),
  valuation_type TEXT NOT NULL,  -- 'value' or 'rent'
  
  -- Value estimate fields
  estimate INTEGER NOT NULL,
  range_low INTEGER,
  range_high INTEGER,
  
  -- Subject property snapshot
  subject_property JSONB,
  
  -- Comparables (up to 25)
  comparables JSONB,
  comp_count INTEGER,
  
  -- Request parameters used
  request_params JSONB,
  
  -- Cache management (shorter TTL for AVMs)
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  
  UNIQUE(property_id, valuation_type)
);

CREATE INDEX idx_valuations_property ON valuations (property_id);
CREATE INDEX idx_valuations_type ON valuations (valuation_type);

-- Market data cache (by zip code)
CREATE TABLE market_data (
  zip_code TEXT PRIMARY KEY,
  name TEXT,
  
  -- Current sale statistics
  sale_data JSONB,  -- All saleData.* fields
  sale_last_updated TIMESTAMP,
  
  -- Current rental statistics
  rental_data JSONB,  -- All rentalData.* fields
  rental_last_updated TIMESTAMP,
  
  -- Historical data
  sale_history JSONB,  -- saleData.history
  rental_history JSONB,  -- rentalData.history
  
  -- Cache management (daily refresh for market data)
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 day'
);

-- Listings cache
CREATE TABLE listings (
  id TEXT PRIMARY KEY,  -- RentCast listing ID
  property_id TEXT,  -- May reference properties table
  listing_type_category TEXT NOT NULL,  -- 'sale' or 'rental'
  
  -- Address fields
  formatted_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- Property attributes
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_footage INTEGER,
  year_built INTEGER,
  hoa_fee INTEGER,
  
  -- Listing specifics
  status TEXT NOT NULL,  -- 'Active' or 'Inactive'
  price INTEGER NOT NULL,  -- price for sale, rent for rental
  listing_type TEXT,  -- 'Standard', 'Foreclosure', 'Short Sale', 'New Construction'
  listed_date TIMESTAMP,
  removed_date TIMESTAMP,
  created_date TIMESTAMP,
  last_seen_date TIMESTAMP,
  days_on_market INTEGER,
  
  -- MLS data
  mls_name TEXT,
  mls_number TEXT,
  
  -- Agent/Office/Builder (JSONB for flexibility)
  listing_agent JSONB,
  listing_office JSONB,
  builder JSONB,
  
  -- Listing history
  listing_history JSONB,
  
  -- Cache management
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '12 hours',
  
  -- Geospatial
  location GEOGRAPHY(POINT, 4326)
);

CREATE INDEX idx_listings_location ON listings USING GIST (location);
CREATE INDEX idx_listings_zip ON listings (zip_code);
CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_type ON listings (listing_type);
CREATE INDEX idx_listings_category ON listings (listing_type_category);
CREATE INDEX idx_listings_price ON listings (price);
CREATE INDEX idx_listings_dom ON listings (days_on_market);

-- API request logging for billing tracking
CREATE TABLE api_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  parameters JSONB,
  response_status INTEGER,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_requests_user ON api_requests (user_id);
CREATE INDEX idx_api_requests_date ON api_requests (created_at);
```

### Cache Strategy

| Data Type | TTL | Refresh Strategy |
|-----------|-----|------------------|
| Property Records | 7 days | On-demand refresh |
| Valuations (AVM) | 24 hours | Refresh on deal analysis |
| Market Data | 24 hours | Background daily job |
| Active Listings | 12 hours | Background refresh |
| Inactive Listings | 30 days | Archive after expiry |

---

## API Integration Patterns

### TypeScript Service Structure

```typescript
// src/services/rentcast/index.ts

export interface RentCastConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: number;  // requests per second
}

export class RentCastService {
  private config: RentCastConfig;
  private rateLimiter: RateLimiter;
  
  constructor(config: RentCastConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimit);
  }
  
  // Property Data
  async getProperty(address: string): Promise<PropertyRecord>;
  async searchProperties(params: PropertySearchParams): Promise<PaginatedResponse<PropertyRecord>>;
  async getPropertyById(id: string): Promise<PropertyRecord>;
  
  // Valuations
  async getValueEstimate(params: ValueEstimateParams): Promise<ValueEstimate>;
  async getRentEstimate(params: RentEstimateParams): Promise<RentEstimate>;
  
  // Market Data
  async getMarketData(zipCode: string, options?: MarketDataOptions): Promise<MarketData>;
  
  // Listings
  async searchSaleListings(params: ListingSearchParams): Promise<PaginatedResponse<Listing>>;
  async searchRentalListings(params: ListingSearchParams): Promise<PaginatedResponse<Listing>>;
  async getListingById(id: string, type: 'sale' | 'rental'): Promise<Listing>;
}
```

### Caching Middleware

```typescript
// src/services/rentcast/cache.ts

export class RentCastCache {
  private supabase: SupabaseClient;
  private redis: Redis;  // Upstash for hot data
  
  async getProperty(id: string): Promise<PropertyRecord | null> {
    // Check Redis first (hot cache)
    const cached = await this.redis.get(`property:${id}`);
    if (cached) return JSON.parse(cached);
    
    // Check Supabase (warm cache)
    const { data } = await this.supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (data) {
      // Populate Redis for next time
      await this.redis.setex(`property:${id}`, 3600, JSON.stringify(data));
      return data;
    }
    
    return null;
  }
  
  async setProperty(property: PropertyRecord): Promise<void> {
    // Write to both caches
    await Promise.all([
      this.redis.setex(`property:${property.id}`, 3600, JSON.stringify(property)),
      this.supabase.from('properties').upsert(property)
    ]);
  }
}
```

### Rate Limiting

```typescript
// src/services/rentcast/rate-limiter.ts

export class RateLimiter {
  private redis: Redis;
  private limit: number;  // 20 requests/second
  
  async acquire(): Promise<boolean> {
    const key = `rentcast:rate:${Math.floor(Date.now() / 1000)}`;
    const count = await this.redis.incr(key);
    
    if (count === 1) {
      await this.redis.expire(key, 2);  // 2 second window
    }
    
    if (count > this.limit) {
      // Wait and retry
      await this.delay(1000 / this.limit);
      return this.acquire();
    }
    
    return true;
  }
}
```

---

## Cost Estimation

### API Call Patterns (per user session)

| Action | API Calls | Frequency |
|--------|-----------|-----------|
| Property Search | 1-3 | Every search |
| Property Detail View | 1 (cached) | Per property |
| Deal Analysis | 2-3 (value + rent + market) | Per analysis |
| Comp Review | 0 (included in AVM) | Per analysis |
| Market Overview | 1 | Per zip code/day |

### Monthly Estimate (100 Active Users)

| Scenario | Searches/User/Day | Analyses/User/Day | Monthly Calls | Estimated Cost |
|----------|------------------|-------------------|---------------|----------------|
| Light Usage | 5 | 2 | ~50,000 | ~$50-150 |
| Medium Usage | 15 | 5 | ~150,000 | ~$150-400 |
| Heavy Usage | 30 | 10 | ~350,000 | ~$350-800 |

*Note: Aggressive caching can reduce actual API calls by 60-80%*

---

## Implementation Priority

### Sprint 1: Foundation
1. ✅ RentCast API service with rate limiting
2. ✅ Property search endpoint integration
3. ✅ Basic caching layer (Redis + Supabase)
4. ✅ Property detail view

### Sprint 2: Valuation
1. Value estimate (ARV) integration
2. Rent estimate integration
3. Comparables display
4. Deal analysis calculator

### Sprint 3: Market Intelligence
1. Market data integration
2. Historical trends
3. Market comparison views
4. AI market narrative

### Sprint 4: Listings & Advanced
1. Sale listings search
2. Rental listings search
3. Distress detection (Foreclosure/Short Sale)
4. Multi-property owner detection

---

## Appendix A: Property Type Reference

| propertyType Value | Description | Query Example |
|-------------------|-------------|---------------|
| `Single Family` | Detached single-family | `propertyType=Single Family` |
| `Condo` | Condominium | `propertyType=Condo` |
| `Townhouse` | Attached townhome | `propertyType=Townhouse` |
| `Multi-Family` | 2-4 units | `propertyType=Multi-Family` |
| `Apartment` | 5+ units | `propertyType=Apartment` |
| `Manufactured` | Mobile home | `propertyType=Manufactured` |
| `Land` | Vacant land | `propertyType=Land` |

Multiple: `propertyType=Single Family|Condo|Townhouse`

## Appendix B: Feature Type Enumerations

### Architecture Types
1.5 Story, 2+ Story, A-Frame, Apartment, Bi-Level, Bungalow, Cabin, Cape Cod, Chalet, Colonial, Colonial Revival, Condo, Condominium, Contemporary, Conventional, Cottage, Custom, Dome, Duplex, English, European, Farm House, French Provincial, Gambrel, Georgian, High Rise, Historical, Log Cabin, Low Rise, Mansion, Manufactured, Mediterranean, Mid Rise, Mobile Home, Modern, Modular, Multi-family, Multi-Unit Building, Other, Old Style, Prefab, Quadruplex, Raised Ranch, Rambler, Ranch, Ranch House, Row End or Row Middle, Rustic, Single Story, Southwestern, Spanish, Split Entry, Split Foyer, Split Level, Townhouse, Traditional, Triplex, Tudor, Two Family, Under Construction, Victorian

### Cooling Types
Central, Chilled Water, Commercial, Evaporative, Fan Cooling, Geo-Thermal, Other, Package, Partial, Refrigeration, Solar, Split System, Ventilation, Wall, Window

### Heating Types
Baseboard, Central, Coal, Convection, Electric, Floor, Floor Furnace, Forced Air, Forced Air Gas, Furnace, Gas, Gravity, Heat Pump, Hot Air, Hot Water, Oil, Other, Package, Partial, Propane, Radiant, Solar, Space, Steam, Stove, Vent, Wall, Warm Air, Zone

### Exterior Types
Adobe, Aluminum, Aluminum Lap, Aluminum Siding, Asbestos Shingle, Asphalt Shingle, Baked Enamel, Block, Board & Batten, Brick, Brick Veneer, Cinder Block, Combination, Composition, Concrete, Concrete Block, Frame, Frame Brick, Frame Siding, Glass, Log, Marble, Marblecrete, Masonite, Masonry, Metal, Metal Siding, Other, Plywood, Precast Concrete Panel, Protective, Ribbed, Ribbed Aluminum, Rock, Shake, Shingle, Shingle Siding, Siding, Single Wall, Steel Panel, Stone, Stone Veneer, Stucco, Tile, Veneer, Vinyl, Vinyl Siding, Wood, Wood Frame, Wood Shingle, Wood Siding

### Roof Types
Aluminum, Asbestos, Asphalt, Asphalt Shingle, Built-up, Cedar Shake, Clay Tile, Composition Shingle, Concrete, Concrete Tile, Fiberglass, Galvanized, Gambrel, Gravel, Metal, Other, Rock, Roll Composition, Roll Paper, Roll Tar & Gravel, Shake, Shingle, Slate, Slate Tile, Steel, Tar & Gravel, Tile, Wood, Wood Shake, Wood Shingle

### Foundation Types
Block, Block with Runner, Brick, Concrete, Concrete Block, Crawl, Crossed Walls, Footing, Girder, Masonry, Mat, Mud Sill, Other, Pier, Pile, Post & Beam, Raft, Raised, Retaining Wall, Slab, Stone, Wood

### Pool Types
Above-Ground Pool, Community Pool, Commercial Pool, Concrete, Enclosed Pool, Fiberglass, Gunite, Heated Pool, Hot Tub, In-Ground Pool, In-Ground Vinyl Pool, Indoor Pool, Municipal, Other, Plastic, Plastic Lined, Plastic w/ Vinyl Lining, Pool and Hot Tub, Public, Reinforced Concrete, Spa, Vinyl

### Garage Types
Attached, Basement, Built-in, Carport, Covered, Detached, Garage, Mixed, Other, Offsite, Open, Parking Lot, Parking Structure, Paved, Surfaced, Underground

### View Types
Airport, Average, Beach, Canal, City, Corner, Creek, Cul-de-sac, Excellent, Fair, Fairway, Flood Plain, Flood Zone, Freeway, Golf Course, Good, High Traffic Area, Lake, Major Street, Mountain, Ocean, Other, Park, Pond, River, School, Thoroughfare, Water, Waterfront

---

## Appendix C: API Response Headers

| Header | Description |
|--------|-------------|
| `X-Limit` | Limit value used in request |
| `X-Offset` | Offset value used in request |
| `X-Total-Count` | Total matching records (if `includeTotalCount=true`) |

---

# SECTION 2: BUYER INTELLIGENCE SYSTEM

## Overview

The Buyer Intelligence System leverages RentCast's property and transaction data to automatically identify, profile, and match cash buyers to wholesale deals. This is a **key differentiator** - no other platform builds buyer profiles from actual transaction data.

## The Strategy: Build a Buyer Database from Transaction Data

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BUYER INTELLIGENCE PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Step 1: DISCOVER                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Search properties by location                                    │  │
│   │ Filter: owner.type = "Organization"                              │  │
│   │ Filter: lastSaleDate within last 12-24 months                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│   Step 2: AGGREGATE                                                     │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Group properties by owner.names                                  │  │
│   │ Count: How many properties does each org own?                    │  │
│   │ Flag: Organizations with 2+ properties = ACTIVE BUYER            │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│   Step 3: ANALYZE                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ For each Active Buyer, calculate:                                │  │
│   │ • Buying locations (zip codes, counties)                         │  │
│   │ • Property types (SFH, Multi-Family, etc.)                       │  │
│   │ • Price range (min/max/avg purchase price)                       │  │
│   │ • Bedroom/bathroom preferences                                   │  │
│   │ • Square footage range                                           │  │
│   │ • Purchase frequency (deals per month/year)                      │  │
│   │ • Avg hold time (from history - flip vs hold)                    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│   Step 4: ENRICH (Skip Trace)                                          │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ Use owner.mailingAddress to find:                                │  │
│   │ • Phone numbers                                                  │  │
│   │ • Email addresses                                                │  │
│   │ • Key contacts at the organization                               │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│   Step 5: MATCH                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │ When user has a deal:                                            │  │
│   │ "3BR SFH in 78244, ARV $250K, asking $175K"                      │  │
│   │                                                                  │  │
│   │ Find buyers who have purchased:                                  │  │
│   │ • In 78244 or nearby zip codes                                   │  │
│   │ • SFH properties                                                 │  │
│   │ • In $150K-200K range                                            │  │
│   │ • Recently (last 6 months) = still active                        │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key RentCast Fields for Buyer Discovery

| Field | Location | Use for Buyer Intelligence |
|-------|----------|---------------------------|
| `owner.names` | Property Data | Buyer identification & grouping |
| `owner.type` | Property Data | "Organization" = likely investor |
| `owner.mailingAddress` | Property Data | Skip trace input, contact info |
| `ownerOccupied` | Property Data | false = investment property |
| `lastSaleDate` | Property Data | Purchase timing, activity level |
| `lastSalePrice` | Property Data | Price range preferences |
| `history` | Property Data | All transactions, hold times |
| `propertyType` | Property Data | Property type preferences |
| `bedrooms`, `bathrooms`, `squareFootage` | Property Data | Size preferences |
| `zipCode`, `city`, `county` | Property Data | Geographic preferences |

## Identifying Wholesale Transactions

While RentCast doesn't label transactions as "wholesale," we can **infer** them:

### Wholesale Transaction Indicators

```javascript
// Potential Wholesale Deal Detection
const wholesaleIndicators = {
  // 1. Quick flip - bought and sold within 30-90 days
  quickFlip: (history) => {
    const sales = Object.values(history);
    for (let i = 1; i < sales.length; i++) {
      const daysBetween = daysDiff(sales[i-1].date, sales[i].date);
      if (daysBetween < 90) return true;
    }
    return false;
  },
  
  // 2. Assignment (same-day or next-day resale)
  likelyAssignment: (history) => {
    const sales = Object.values(history);
    for (let i = 1; i < sales.length; i++) {
      const daysBetween = daysDiff(sales[i-1].date, sales[i].date);
      if (daysBetween <= 1) return true;
    }
    return false;
  },
  
  // 3. Below-market purchase
  belowMarket: (lastSalePrice, avmAtPurchase) => {
    return lastSalePrice < (avmAtPurchase * 0.75); // 25%+ below market
  },
  
  // 4. Buyer is known investor entity
  knownBuyer: (ownerName, buyerDatabase) => {
    return buyerDatabase.has(ownerName.toLowerCase());
  }
};
```

### Entity Naming Patterns (Likely Investors)

```javascript
const investorPatterns = [
  /LLC$/i,
  /LP$/i,
  /Inc\.?$/i,
  /Corp\.?$/i,
  /Trust$/i,
  /Holdings/i,
  /Investments/i,
  /Properties/i,
  /Capital/i,
  /Homes/i,
  /Realty/i,
  /Real Estate/i,
  /Acquisitions/i,
  /Group/i,
  /Partners/i,
  /Ventures/i,
  /Fund/i
];

const isLikelyInvestor = (ownerName, ownerType) => {
  if (ownerType === "Organization") return true;
  return investorPatterns.some(pattern => pattern.test(ownerName));
};
```

## Buyer Profile Data Structure

```typescript
interface BuyerProfile {
  // Identity
  id: string;
  name: string;
  nameNormalized: string;  // Lowercase, trimmed for matching
  type: "Organization" | "Individual";
  
  // Contact Info
  mailingAddress: Address;
  phone?: string;          // From skip trace
  email?: string;          // From skip trace
  contacts?: string[];     // Key people at organization
  
  // Portfolio Summary
  propertyCount: number;
  totalInvested: number;   // Sum of purchase prices
  
  // Buying Patterns
  markets: {
    zipCode: string;
    city: string;
    county: string;
    state: string;
    count: number;
  }[];
  
  propertyTypes: {
    type: string;
    count: number;
    avgPrice: number;
  }[];
  
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  
  bedroomPreference: {
    min: number;
    max: number;
    mostCommon: number;
  };
  
  sqftPreference: {
    min: number;
    max: number;
    avg: number;
  };
  
  // Activity Metrics
  firstPurchase: Date;
  lastPurchase: Date;
  purchaseFrequency: number;  // Deals per year
  avgHoldTime: number;        // Days (0-90 = flipper, 365+ = buy-and-hold)
  
  // Classification
  buyerType: "Flipper" | "Buy-and-Hold" | "Wholesaler" | "BRRRR" | "Unknown";
  confidenceScore: number;    // 0-1 confidence in classification
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastEnrichedAt?: Date;      // Last skip trace
}
```

## Buyer Matching Algorithm

```typescript
interface DealCriteria {
  zipCode: string;
  city: string;
  state: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  askingPrice: number;
  arv: number;
}

async function findMatchingBuyers(deal: DealCriteria): Promise<BuyerMatch[]> {
  const matches: BuyerMatch[] = [];
  
  for (const buyer of buyers) {
    let score = 0;
    const reasons: string[] = [];
    
    // Location match (most important)
    const buyerZips = buyer.markets.map(m => m.zipCode);
    if (buyerZips.includes(deal.zipCode)) {
      score += 30;
      reasons.push(`Buys in ${deal.zipCode}`);
    } else if (getNearbyZips(deal.zipCode).some(z => buyerZips.includes(z))) {
      score += 20;
      reasons.push("Buys in nearby zip codes");
    }
    
    // Property type match
    if (buyer.propertyTypes.some(pt => pt.type === deal.propertyType)) {
      score += 20;
      reasons.push(`Buys ${deal.propertyType}`);
    }
    
    // Price range match
    if (deal.askingPrice >= buyer.priceRange.min * 0.8 &&
        deal.askingPrice <= buyer.priceRange.max * 1.2) {
      score += 20;
      reasons.push(`Within price range ($${buyer.priceRange.min.toLocaleString()}-$${buyer.priceRange.max.toLocaleString()})`);
    }
    
    // Bedroom match
    if (deal.bedrooms >= buyer.bedroomPreference.min &&
        deal.bedrooms <= buyer.bedroomPreference.max) {
      score += 10;
      reasons.push(`${deal.bedrooms}BR matches preference`);
    }
    
    // Recent activity bonus
    const daysSinceLastPurchase = daysSince(buyer.lastPurchase);
    if (daysSinceLastPurchase < 30) {
      score += 15;
      reasons.push("Purchased in last 30 days");
    } else if (daysSinceLastPurchase < 90) {
      score += 10;
      reasons.push("Purchased in last 90 days");
    } else if (daysSinceLastPurchase < 180) {
      score += 5;
      reasons.push("Purchased in last 6 months");
    }
    
    // High volume bonus
    if (buyer.purchaseFrequency > 12) {
      score += 10;
      reasons.push(`High volume buyer (${buyer.purchaseFrequency} deals/year)`);
    }
    
    if (score >= 40) {  // Minimum threshold
      matches.push({
        buyer,
        score,
        reasons,
        matchQuality: score >= 70 ? "Hot" : score >= 55 ? "Good" : "Possible"
      });
    }
  }
  
  return matches.sort((a, b) => b.score - a.score);
}
```

## Database Schema: Buyers

```sql
-- Buyer profiles derived from property ownership data
CREATE TABLE buyers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  
  -- Contact info
  mailing_address JSONB,
  phone TEXT,
  email TEXT,
  contacts JSONB,
  
  -- Portfolio summary
  property_count INTEGER DEFAULT 0,
  total_invested BIGINT DEFAULT 0,
  
  -- Buying patterns (JSONB for flexibility)
  markets JSONB,
  property_types JSONB,
  price_range JSONB,
  bedroom_preference JSONB,
  sqft_preference JSONB,
  
  -- Activity metrics
  first_purchase DATE,
  last_purchase DATE,
  purchase_frequency DECIMAL(5,2),
  avg_hold_time INTEGER,
  
  -- Classification
  buyer_type TEXT,
  confidence_score DECIMAL(3,2),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_enriched_at TIMESTAMP,
  
  UNIQUE(name_normalized)
);

CREATE INDEX idx_buyers_markets ON buyers USING GIN (markets);
CREATE INDEX idx_buyers_property_types ON buyers USING GIN (property_types);
CREATE INDEX idx_buyers_last_purchase ON buyers (last_purchase DESC);
CREATE INDEX idx_buyers_type ON buyers (buyer_type);
CREATE INDEX idx_buyers_frequency ON buyers (purchase_frequency DESC);

-- Link table: buyers to properties they own
CREATE TABLE buyer_properties (
  buyer_id INTEGER REFERENCES buyers(id),
  property_id TEXT REFERENCES properties(id),
  purchase_date DATE,
  purchase_price INTEGER,
  sale_date DATE,
  sale_price INTEGER,
  is_current_owner BOOLEAN DEFAULT true,
  
  PRIMARY KEY (buyer_id, property_id)
);

CREATE INDEX idx_buyer_properties_buyer ON buyer_properties (buyer_id);
CREATE INDEX idx_buyer_properties_property ON buyer_properties (property_id);
CREATE INDEX idx_buyer_properties_current ON buyer_properties (is_current_owner);
```

## Buyer Discovery Queries

### Query 1: Find All Organization Owners in a Market

```bash
# Find all properties owned by organizations that sold recently
GET /v1/properties?city=Tampa&state=FL&saleDateRange=365&limit=500

# Filter in application code:
# results.filter(p => p.owner?.type === "Organization")
```

### Query 2: Build Buyer Portfolio

```typescript
async function buildBuyerPortfolio(buyerName: string, state: string): Promise<PropertyRecord[]> {
  // Search for all properties owned by this entity
  // Note: RentCast doesn't have owner name search, so we:
  // 1. Cache all properties we discover
  // 2. Index by owner name in our database
  // 3. Query our cache
  
  const properties = await supabase
    .from('properties')
    .select('*')
    .contains('owner_data', { names: [buyerName] })
    .eq('state', state);
    
  return properties.data;
}
```

---

# SECTION 3: FILTER SYSTEM

## Overview

The Filter System provides three tiers of pre-built filters:
1. **Standard Filters** - Industry-standard filters (table stakes)
2. **Enhanced Filters** - Standard filters with unique improvements
3. **Contrarian Filters** - Exclusive filters targeting underserved opportunities

## The Problem: Filter Saturation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THE FILTER SATURATION PROBLEM                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Property hits "Absentee + High Equity + 10yr Ownership"               │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  DAY 1: Property appears in filters                             │  │
│   │  ├── PropStream users: 50+ pull this list                       │  │
│   │  ├── BatchLeads users: 30+ pull this list                       │  │
│   │  ├── ListSource users: 20+ pull this list                       │  │
│   │  └── Other platforms: 50+ more                                  │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  WEEK 1: Owner receives                                         │  │
│   │  ├── 15-30 phone calls                                          │  │
│   │  ├── 20-40 text messages                                        │  │
│   │  ├── 10-20 direct mail pieces                                   │  │
│   │  ├── 5-10 door knocks                                           │  │
│   │  └── Countless voicemails                                       │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  RESULT:                                                        │  │
│   │  ├── Owner is annoyed/hostile                                   │  │
│   │  ├── Conversion rate: <0.5%                                     │  │
│   │  ├── First caller rarely wins (owner comparison shops)          │  │
│   │  └── Race to bottom for wholesalers                             │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   OUR SOLUTION: Contrarian filters find motivated sellers              │
│   who AREN'T being bombarded by everyone else                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tier 1: Standard Filters (Industry Baseline)

These are table-stakes filters that every competitor offers. We must have them.

| Filter | Description | RentCast Detection | Competition Level |
|--------|-------------|-------------------|-------------------|
| **Absentee Owner** | Mailing ≠ Property address | `ownerOccupied = false` | 🔴 Very High |
| **High Equity (50%+)** | Significant owner equity | AVM vs estimated mortgage | 🔴 Very High |
| **Free & Clear** | No mortgage | Tax records, long ownership | 🔴 Very High |
| **Pre-Foreclosure** | NOD filed | External data source needed | 🔴 Very High |
| **Tax Delinquent** | Behind on property taxes | External data source needed | 🔴 Very High |
| **Probate** | Estate property | External data source needed | 🟡 High |
| **Divorce** | Divorcing owners | External data source needed | 🟡 High |
| **Tired Landlord** | 10+ year ownership | `lastSaleDate` > 10 years ago | 🔴 Very High |
| **Out-of-State Owner** | Mailing in different state | `owner.mailingAddress.state` ≠ `state` | 🟡 High |
| **Senior Owner** | Age 65+ | External data source needed | 🟡 High |
| **Failed Listing** | Expired/Withdrawn MLS | `listing.status = Inactive` + no sale | 🟡 High |
| **Code Violations** | Municipal violations | External data source needed | 🟢 Medium |
| **Inherited** | Recent inheritance | Ownership change without sale | 🟡 High |
| **Vacant** | Property unoccupied | External data (utilities, mail) | 🔴 Very High |

---

## Tier 2: Enhanced Filters (Standard with Unique Twists)

Same base concept as standard filters, but with intelligent enhancements.

### 2.1 Absentee Owner - ENHANCED

**Standard**: `mailingAddress ≠ propertyAddress`

**Our Enhancements**:

| Enhancement | Detection | Why It's Better |
|-------------|-----------|-----------------|
| **New Absentee** | `ownerOccupied` changed to false within 12 months | Life change just happened, more motivated |
| **Distance Score** | Calculate miles between mailing and property | 500+ miles = harder to manage = more motivated |
| **Multi-Property Absentee** | Owner has 2-5 rentals | Sweet spot: annoying enough, not professional |
| **Declining Rental Market Absentee** | Market data shows rent dropping | May want out before it gets worse |

```typescript
interface EnhancedAbsenteeFilter {
  base: { ownerOccupied: false };
  enhancements: {
    newAbsentee?: { becameAbsenteeMonths: { max: 12 } };
    distantOwner?: { ownerDistanceMiles: { min: 500 } };
    multiProperty?: { ownerPropertyCount: { min: 2, max: 5 } };
    decliningMarket?: { rentGrowth6Month: { max: 0 } };
  };
}
```

### 2.2 High Equity - ENHANCED

**Standard**: `equity > 50%`

**Our Enhancements**:

| Enhancement | Detection | Why It's Better |
|-------------|-----------|-----------------|
| **Equity Velocity** | Slow appreciation rate | Owner not benefiting from holding |
| **Equity vs Rent Ratio** | (Rent × 12) / Equity < 5% | Poor return on equity, may liquidate |
| **Equity Trap** | High equity + old systems | Can't easily refi, stuck |
| **Equity Sweet Spot** | 30-50% equity | Not on "high equity" lists, less competition |

```typescript
interface EnhancedEquityFilter {
  standard: { equityPercent: { min: 50 } };
  enhanced: {
    equityVelocity?: { appreciationRate1Year: { max: 3 } };
    poorReturn?: { equityYield: { max: 5 } };  // (rent*12)/equity
    equityTrap?: { 
      equityPercent: { min: 40 },
      yearBuilt: { max: 1990 },
      features: { roofAge: { min: 15 } }
    };
    sweetSpot?: { equityPercent: { min: 30, max: 50 } };
  };
}
```

### 2.3 Tired Landlord - ENHANCED

**Standard**: `ownership > 10 years`

**Our Enhancements**:

| Enhancement | Detection | Why It's Better |
|-------------|-----------|-----------------|
| **Accidental Landlord** | Was owner-occupied, now absentee | Never intended to be landlord |
| **Management Burden Score** | Old property + distant + multi-unit | Compound frustration factors |
| **Portfolio Reduction Signal** | Owner sold other properties recently | Winding down portfolio |
| **Negative Cash Flow Zone** | Taxes/insurance rising > rent growth | Losing money over time |

```typescript
interface EnhancedTiredLandlordFilter {
  standard: { ownershipYears: { min: 10 } };
  enhanced: {
    accidentalLandlord?: { 
      previouslyOwnerOccupied: true,
      currentlyAbsentee: true 
    };
    managementBurden?: {
      score: { min: 70 }  // Calculated from multiple factors
    };
    portfolioReduction?: {
      ownerSoldPropertiesLast12Months: { min: 1 }
    };
    negativeCashFlow?: {
      estimatedMonthlyCashFlow: { max: 0 }
    };
  };
}
```

### 2.4 Failed Listing - ENHANCED

**Standard**: Expired/withdrawn MLS listing

**Our Enhancements**:

| Enhancement | Detection | Why It's Better |
|-------------|-----------|-----------------|
| **Multiple Failures** | 2-3 listing attempts | Pattern of wanting to sell |
| **Price Drop Before Fail** | Reduced >15% before delisting | Was willing to negotiate |
| **Recent Failure** | Within 6 months | Still motivated |
| **Long DOM Before Fail** | 90+ days before withdrawal | Exhausted all options |

```typescript
interface EnhancedFailedListingFilter {
  standard: { 
    listingHistory: { hasFailedListing: true }
  };
  enhanced: {
    multipleFailures?: { failedListingCount: { min: 2 } };
    priceDropped?: { priceReductionPercent: { min: 15 } };
    recentFailure?: { lastFailedListingMonths: { max: 6 } };
    longDOM?: { daysOnMarketBeforeFail: { min: 90 } };
  };
}
```

---

## Tier 3: Contrarian Filters (Our Secret Sauce)

These filters target motivated sellers who are NOT being bombarded by competitors.

### 3.1 🔥 "The Almost Sold" Filter

**Theory**: Properties that were listed but didn't sell have motivated owners who couldn't execute.

```typescript
interface AlmostSoldFilter {
  slug: "almost-sold";
  name: "Almost Sold";
  category: "contrarian";
  
  detection: {
    // Listing history shows listed → removed without sale
    listingHistory: {
      wasListed: true,
      wasSold: false,
      removedWithinMonths: 12
    };
    // Still same owner
    ownerChanged: false;
  };
  
  scoring: {
    failedAttempts: { 1: 20, 2: 40, "3+": 60 };
    priceReduced: { ">15%": 15 };
    domBeforeDelist: { ">90days": 10 };
    recency: { "<6months": 25 };
  };
  
  whyContrarian: [
    "These owners WANT to sell (proved by listing)",
    "Traditional market failed them",
    "NOT on standard motivated seller lists",
    "May accept creative terms or lower price",
    "Tired of the process, want simple solution"
  ];
}
```

### 3.2 🔥 "The Quiet Equity Builder" Filter

**Theory**: Owners who recently paid off their mortgage often sell within 12-18 months.

```typescript
interface QuietEquityBuilderFilter {
  slug: "quiet-equity-builder";
  name: "Quiet Equity Builder";
  category: "contrarian";
  
  detection: {
    // No recent sale (still same owner)
    recentSale: false;
    // Became free & clear recently
    becameFreeAndClear: { withinMonths: 18 };
    // Long ownership suggests payoff, not inheritance
    ownershipYears: { min: 10 };
  };
  
  whyContrarian: [
    "Not on 'free & clear' lists (those are stale)",
    "RECENT payoff = life event happening NOW",
    "May be preparing to sell, downsize, relocate",
    "Not yet on market = no competition",
    "Often seniors planning estate simplification"
  ];
  
  timingAdvantage: {
    payoffEvent: "Month 0",
    gettingOrganized: "Months 1-6",
    consideringOptions: "Months 6-12",
    traditionalListing: "Months 12-18",
    ourContact: "Months 1-6 (before everyone else)"
  };
}
```

### 3.3 🔥 "The Shrinking Landlord" Filter

**Theory**: Investors actively reducing their portfolio are highly motivated on remaining properties.

```typescript
interface ShrinkingLandlordFilter {
  slug: "shrinking-landlord";
  name: "Shrinking Portfolio";
  category: "contrarian";
  
  detection: {
    // Owner is organization/investor
    ownerType: "Organization";
    // Portfolio has decreased
    portfolioChange12Months: { max: -1 };  // Sold at least 1
    // Still owns properties
    currentPropertyCount: { min: 1 };
  };
  
  signals: {
    "Had 10 → now 6": "actively divesting",
    "Selling specific areas": "exiting that market",
    "Selling specific types": "strategy shift",
    "Multiple sales short time": "liquidation mode"
  };
  
  whyContrarian: [
    "Nobody tracks investor PORTFOLIO CHANGES",
    "Remaining properties likely next to sell",
    "Owner has recent sale experience",
    "May prefer off-market for tax timing",
    "Institutional investors have quarterly pressures"
  ];
}
```

### 3.4 🔥 "The Underwater Landlord" Filter

**Theory**: Properties bought at market peaks with negative cash flow are bleeding money monthly.

```typescript
interface UnderwaterLandlordFilter {
  slug: "underwater-landlord";
  name: "Underwater Landlord";
  category: "contrarian";
  
  detection: {
    // Purchased at peak
    purchaseDate: { years: [2021, 2022, 2006, 2007] };
    // Minimal or negative equity
    equityPercent: { max: 10 };
    // Negative cash flow
    estimatedMonthlyCashFlow: { max: -200 };
  };
  
  cashFlowCalculation: {
    monthlyLoss: "Estimated PITI - Market Rent",
    piti: "(Purchase × 0.8 × rate/12) + (Taxes/12) + Insurance + HOA",
    marketRent: "RentCast AVM rent estimate",
    threshold: "Loss > $200/month = HIGHLY MOTIVATED"
  };
  
  whyContrarian: [
    "LOW equity = filtered OUT by high-equity lists",
    "But bleeding cash monthly",
    "Not on distress lists yet (not delinquent... yet)",
    "May accept creative solutions (subject-to)",
    "Grateful for any exit that stops the bleeding"
  ];
}
```

### 3.5 🔥 "The Orphan Property" Filter

**Theory**: Properties with data anomalies are overlooked by automated systems.

```typescript
interface OrphanPropertyFilter {
  slug: "orphan-property";
  name: "Orphan Property";
  category: "contrarian";
  
  detection: {
    // Data quality issues
    dataAnomalies: {
      addressFormat: "unusual",      // "123 Main St Rear"
      missingFields: ["bedrooms", "bathrooms", "squareFootage"],
      propertyTypeMismatch: true,    // Zoning doesn't match type
      sparseHistory: true            // Very old, little data
    };
  };
  
  whyContrarian: [
    "Automated systems SKIP these properties",
    "Other wholesalers never see them",
    "Often long-term owners (data entry was manual)",
    "May have significant equity",
    "ZERO competition from tech-enabled competitors"
  ];
  
  examples: [
    "'123 Main St Rear' → skipped due to address format",
    "Properties with bedrooms=null → filtered out",
    "Zoning='Agricultural' in suburban area → misclassified",
    "Properties at exact zip boundaries → often missed"
  ];
}
```

### 3.6 🔥 "The Life Stage Transition" Filter

**Theory**: Owners showing signs of major life transitions through property patterns.

```typescript
interface LifeStageTransitionFilter {
  slug: "life-stage-transition";
  name: "Life Stage Transition";
  category: "contrarian";
  
  subFilters: {
    emptyNester: {
      detection: {
        bedrooms: { min: 4 },
        squareFootage: { min: 2500 },
        ownershipYears: { min: 15 },
        ownerOccupied: true,
        schoolDistrict: "highly-rated"
      };
      signal: "Kids left, house too big"
    };
    
    preRetirement: {
      detection: {
        ownershipYears: { min: 20 },
        equityPercent: { min: 80 },
        highCostArea: true,
        propertyTaxBurden: "high"
      };
      signal: "Could arbitrage to lower cost area"
    };
    
    inheritedBurden: {
      detection: {
        ownerNameChanged: true,
        noSaleRecord: true,
        newOwnerAbsentee: true
      };
      signal: "Inherited, doesn't want to manage"
    };
  };
  
  whyContrarian: [
    "Life stage data is expensive/hard to get",
    "We INFER it from property patterns",
    "Owner-occupied = usually filtered OUT",
    "But life transitions = motivation",
    "Approaching BEFORE they list"
  ];
}
```

### 3.7 🔥 "The Negative Momentum" Filter

**Theory**: Properties in areas with declining metrics where owners might want to exit.

```typescript
interface NegativeMomentumFilter {
  slug: "negative-momentum";
  name: "Negative Momentum Market";
  category: "contrarian";
  
  detection: {
    // Market trending down
    marketTrends: {
      rentGrowth6Month: { max: 0 },
      daysOnMarketTrend: "increasing",
      totalListingsTrend: "increasing",
      pricePerSqftTrend: "declining"
    };
    // Owner has equity to exit
    equityPercent: { min: 30 };
    // Window closing
    ownershipYears: { min: 3 };
  };
  
  whyContrarian: [
    "Most filters look at PROPERTY, not MARKET TREND",
    "Owners in declining markets are nervous",
    "But not yet desperate (so not hostile)",
    "We position as 'helping them time exit'",
    "Data-driven conversation starter"
  ];
  
  conversationAngle: `
    "Your property is worth $X today. Over the last 6 months,
     similar properties in [zip] have dropped 5%. Based on
     market trends, the window to maximize your equity is now."
  `;
}
```

### 3.8 🔥 "The Tax Squeeze" Filter

**Theory**: Properties where tax assessments rising faster than values squeeze owner economics.

```typescript
interface TaxSqueezeFilter {
  slug: "tax-squeeze";
  name: "Tax Squeeze";
  category: "contrarian";
  
  detection: {
    // Tax assessment spiked
    taxAssessmentGrowth2Year: { min: 15 };
    // But value didn't keep pace
    avmGrowth2Year: { max: 5 };
    // Especially painful for rentals
    ownerOccupied: false;
    // In market with flat rents
    rentGrowth2Year: { max: 5 };
  };
  
  example: {
    "2022 Assessment": "$180,000 | Tax: $4,500",
    "2024 Assessment": "$240,000 | Tax: $6,000",
    "Increase": "33% in 2 years",
    "Rent Increase": "5%",
    "Result": "Losing $1,500/year more than expected"
  };
  
  whyContrarian: [
    "Tax assessment data is PUBLIC but underused",
    "Nobody else tracks assessment TRENDS",
    "Owner feels the pain every tax bill",
    "Creates urgency without 'distress' label",
    "Easy conversation starter"
  ];
}
```

### 3.9 🔥 "The Competitor Exit" Filter

**Theory**: When institutional investors exit a market, individual investors often follow.

```typescript
interface CompetitorExitFilter {
  slug: "competitor-exit";
  name: "Institutional Exit Signal";
  category: "contrarian";
  
  detection: {
    // Track large portfolio owners
    institutionalActivity: {
      portfolioSize: { min: 50 },
      salesVelocity: "accelerating",
      netChange: "negative"
    };
    // Flag properties in same area
    sameZipAsInstitutionalSales: true;
    // Individual owners who might follow
    ownerType: "Individual";
  };
  
  signals: {
    "Opendoor/Offerpad exiting": "market concern",
    "Major REIT selling off": "institutional concern",
    "Local investment groups liquidating": "local issues"
  };
  
  whyContrarian: [
    "We see institutional behavior before individuals",
    "Can warn smaller investors 'smart money leaving'",
    "Creates urgency without being pushy",
    "Positions us as informed market experts"
  ];
}
```

### 3.10 🔥 "The FSBO Fatigue" Filter

**Theory**: Owners who tried to sell themselves and failed are motivated but exhausted.

```typescript
interface FSBOFatigueFilter {
  slug: "fsbo-fatigue";
  name: "FSBO Fatigue";
  category: "contrarian";
  
  detection: {
    // Listed as FSBO (no agent in listing data)
    listingHistory: {
      wasFSBO: true,
      wasSold: false,
      ownerStillOwns: true
    };
    // Recent attempt
    lastFSBOAttempt: { withinMonths: 6 };
  };
  
  additionalSignals: {
    multipleFSBOAttempts: "extra frustrated",
    priceDropsDuringFSBO: "was willing to negotiate",
    longDOMBeforeGivingUp: "exhausted all options"
  };
  
  whyContrarian: [
    "FSBO sellers rejected traditional agents",
    "But also failed on their own",
    "Open to alternative solutions",
    "Want control but also results",
    "Wholesale offer = control + certainty + speed"
  ];
  
  approach: `
    "I see you tried selling yourself at [address].
     You clearly didn't want to pay agent fees.
     What if I could make you an offer with no fees,
     close in 2 weeks, and you never deal with
     showings or repairs?"
  `;
}
```

---

## Filter Priority Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FILTER PRIORITY MATRIX                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    MOTIVATION LEVEL                                     │
│                    Low ─────────────────────── High                     │
│                                                                         │
│   High   │ Long-term        │ Tax Squeeze      │ Almost Sold    │      │
│   Equity │ Owner-Occupied   │ Empty Nester     │ FSBO Fatigue   │      │
│          │ ███ SATURATED    │ ▓▓▓ MODERATE     │ ░░░ WE OWN     │      │
│   ───────┼──────────────────┼──────────────────┼────────────────│      │
│   Medium │ Absentee Owner   │ Shrinking        │ Quiet Equity   │      │
│   Equity │ Out-of-State     │ Landlord         │ Builder        │      │
│          │ ███ SATURATED    │ Portfolio        │ ░░░ WE OWN     │      │
│   ───────┼──────────────────┼──────────────────┼────────────────│      │
│   Low    │ (Not viable)     │ Negative         │ Underwater     │      │
│   Equity │                  │ Momentum         │ Landlord       │      │
│          │                  │ ▓▓▓ MODERATE     │ ░░░ WE OWN     │      │
│                                                                         │
│   LEGEND:                                                               │
│   ███ = Everyone uses (high competition)                                │
│   ▓▓▓ = Some platforms use (moderate competition)                       │
│   ░░░ = We own this (low/no competition)                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Filter Database Schema

```sql
-- Pre-built filter definitions
CREATE TABLE filter_templates (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,  -- 'standard', 'enhanced', 'contrarian'
  tier TEXT NOT NULL,      -- 'free', 'pro', 'enterprise'
  
  -- Filter criteria
  criteria JSONB NOT NULL,
  
  -- Scoring weights
  motivation_score_formula JSONB,
  
  -- UI metadata
  icon TEXT,
  color TEXT,
  sort_order INTEGER,
  
  -- Feature flags
  is_premium BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  times_used INTEGER DEFAULT 0,
  avg_results_count DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed standard filters
INSERT INTO filter_templates (slug, name, description, category, tier, criteria, icon, sort_order) VALUES
-- Standard Filters
('absentee-owner', 'Absentee Owner', 'Owner mailing address differs from property', 'standard', 'free', 
 '{"ownerOccupied": false}', 'home-off', 1),
('high-equity', 'High Equity (50%+)', 'Properties with significant owner equity', 'standard', 'free',
 '{"equityPercent": {"min": 50}}', 'trending-up', 2),
('free-and-clear', 'Free & Clear', 'No mortgage on property', 'standard', 'free',
 '{"mortgageBalance": 0}', 'check-circle', 3),
('tired-landlord', 'Tired Landlord', 'Ownership 10+ years', 'standard', 'free',
 '{"ownershipYears": {"min": 10}}', 'clock', 4),
('out-of-state', 'Out of State Owner', 'Owner lives in different state', 'standard', 'free',
 '{"ownerStateDifferent": true}', 'map-pin', 5),
('failed-listing', 'Failed Listing', 'Was listed but did not sell', 'standard', 'free',
 '{"hadFailedListing": true}', 'x-circle', 6),

-- Enhanced Filters
('new-absentee', 'New Absentee (12mo)', 'Recently became absentee owner', 'enhanced', 'pro',
 '{"ownerOccupied": false, "becameAbsenteeMonths": {"max": 12}}', 'user-minus', 10),
('distant-owner', 'Distant Owner (500mi+)', 'Owner more than 500 miles from property', 'enhanced', 'pro',
 '{"ownerOccupied": false, "ownerDistanceMiles": {"min": 500}}', 'navigation', 11),
('multi-property-absentee', 'Multi-Property Absentee', 'Absentee owner with 2-5 properties', 'enhanced', 'pro',
 '{"ownerOccupied": false, "ownerPropertyCount": {"min": 2, "max": 5}}', 'layers', 12),
('equity-sweet-spot', 'Equity Sweet Spot', '30-50% equity (less competition)', 'enhanced', 'pro',
 '{"equityPercent": {"min": 30, "max": 50}}', 'target', 13),
('accidental-landlord', 'Accidental Landlord', 'Was owner-occupied, now rental', 'enhanced', 'pro',
 '{"wasOwnerOccupied": true, "nowAbsentee": true}', 'shuffle', 14),

-- Contrarian Filters
('almost-sold', 'Almost Sold', 'Listed but failed to sell', 'contrarian', 'pro',
 '{"listingHistory": {"status": "failed", "monthsAgo": {"max": 12}}}', 'rotate-ccw', 20),
('shrinking-landlord', 'Shrinking Portfolio', 'Investor actively selling off properties', 'contrarian', 'pro',
 '{"ownerType": "Organization", "portfolioChange12m": {"max": -1}}', 'trending-down', 21),
('underwater-landlord', 'Underwater Landlord', 'Negative monthly cash flow', 'contrarian', 'pro',
 '{"ownerOccupied": false, "estimatedMonthlyCashFlow": {"max": -200}}', 'droplet', 22),
('tax-squeeze', 'Tax Squeeze', 'Assessment rising faster than value', 'contrarian', 'pro',
 '{"taxGrowth2yr": {"min": 15}, "valueGrowth2yr": {"max": 5}}', 'receipt', 23),
('quiet-equity-builder', 'Quiet Equity Builder', 'Recently paid off mortgage', 'contrarian', 'pro',
 '{"becameFreeAndClearMonths": {"max": 18}}', 'unlock', 24),
('negative-momentum', 'Negative Momentum', 'In declining market area', 'contrarian', 'pro',
 '{"marketRentGrowth6m": {"max": 0}, "equityPercent": {"min": 30}}', 'arrow-down-right', 25),
('fsbo-fatigue', 'FSBO Fatigue', 'Failed For Sale By Owner attempt', 'contrarian', 'pro',
 '{"hadFSBO": true, "fsboFailed": true, "fsboMonthsAgo": {"max": 6}}', 'user-x', 26),
('life-stage-transition', 'Life Stage Transition', 'Signs of major life change', 'contrarian', 'enterprise',
 '{"lifeStageSignals": true}', 'repeat', 27),
('orphan-property', 'Orphan Property', 'Data anomalies, often overlooked', 'contrarian', 'enterprise',
 '{"hasDataAnomalies": true}', 'help-circle', 28),
('competitor-exit', 'Institutional Exit', 'Smart money leaving the area', 'contrarian', 'enterprise',
 '{"institutionalExitSignal": true}', 'log-out', 29);

-- User saved filter combinations
CREATE TABLE user_saved_filters (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Filter combination
  template_slugs TEXT[],
  custom_criteria JSONB,
  
  -- Geographic scope
  geographic_scope JSONB,
  
  -- Notification settings
  notify_new_matches BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'daily',
  notification_channels TEXT[] DEFAULT ARRAY['push', 'email'],
  
  -- Usage stats
  times_run INTEGER DEFAULT 0,
  last_run_at TIMESTAMP,
  last_result_count INTEGER,
  
  -- Metadata
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_filters_user ON user_saved_filters(user_id);
CREATE INDEX idx_user_filters_favorite ON user_saved_filters(user_id, is_favorite);

-- Filter execution history
CREATE TABLE filter_executions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filter_template_id INTEGER REFERENCES filter_templates(id),
  saved_filter_id INTEGER REFERENCES user_saved_filters(id),
  
  -- Execution details
  criteria_used JSONB NOT NULL,
  geographic_scope JSONB,
  
  -- Results
  result_count INTEGER,
  execution_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_filter_executions_user ON filter_executions(user_id);
CREATE INDEX idx_filter_executions_template ON filter_executions(filter_template_id);
```

---

## AI Integration: Natural Language to Filters

Users can describe what they want naturally, and AI maps to appropriate filters:

### Intent Recognition

```typescript
const filterIntentMapping = {
  // Standard filter intents
  "absentee": ["absentee-owner"],
  "out of state": ["out-of-state"],
  "high equity": ["high-equity"],
  "free and clear": ["free-and-clear"],
  "tired landlord": ["tired-landlord"],
  "long time owner": ["tired-landlord"],
  "expired listing": ["failed-listing"],
  
  // Enhanced filter intents
  "just became absentee": ["new-absentee"],
  "far away owner": ["distant-owner"],
  "multiple properties": ["multi-property-absentee"],
  "accidental landlord": ["accidental-landlord"],
  
  // Contrarian filter intents
  "tried to sell": ["almost-sold"],
  "couldn't sell": ["almost-sold"],
  "selling their portfolio": ["shrinking-landlord"],
  "losing money": ["underwater-landlord"],
  "negative cash flow": ["underwater-landlord"],
  "taxes went up": ["tax-squeeze"],
  "paid off mortgage": ["quiet-equity-builder"],
  "declining area": ["negative-momentum"],
  "tried fsbo": ["fsbo-fatigue"],
  "sold by owner": ["fsbo-fatigue"],
  
  // Meta intents
  "less competition": ["equity-sweet-spot", "almost-sold", "underwater-landlord"],
  "nobody calling": ["orphan-property", "quiet-equity-builder"],
  "unique leads": ["contrarian-all"],
  "motivated seller": ["almost-sold", "underwater-landlord", "fsbo-fatigue"]
};
```

### AI Filter Recommendation Prompt

```typescript
const filterRecommendationPrompt = `
You are an AI assistant for a real estate wholesaling platform. Your job is to 
understand what the user is looking for and recommend the best filters to find 
motivated sellers.

AVAILABLE FILTER CATEGORIES:

STANDARD FILTERS (Industry baseline - high competition):
- absentee-owner: Owner doesn't live at property
- high-equity: 50%+ equity in property
- free-and-clear: No mortgage
- tired-landlord: 10+ years ownership
- out-of-state: Owner in different state
- failed-listing: Listed but didn't sell

ENHANCED FILTERS (Our improvements - moderate competition):
- new-absentee: Became absentee in last 12 months
- distant-owner: Owner 500+ miles away
- multi-property-absentee: Owns 2-5 rentals
- equity-sweet-spot: 30-50% equity (less targeted)
- accidental-landlord: Was owner-occupied, now rental

CONTRARIAN FILTERS (Our secret sauce - low competition):
- almost-sold: Tried to sell, failed
- shrinking-landlord: Investor reducing portfolio
- underwater-landlord: Negative cash flow
- tax-squeeze: Tax assessment outpacing value
- quiet-equity-builder: Recently paid off mortgage
- negative-momentum: In declining market
- fsbo-fatigue: Failed FSBO attempt
- life-stage-transition: Signs of major life change
- orphan-property: Data anomalies (overlooked)
- competitor-exit: Institutional investors leaving

When the user describes what they're looking for:
1. Identify which filters match their intent
2. Recommend contrarian filters when they mention "competition", "unique", etc.
3. Suggest filter combinations for best results
4. Explain WHY each filter helps find motivated sellers

USER INPUT: {userQuery}

Respond with:
1. Recommended filters (list)
2. Why these filters match their needs
3. Expected competition level
4. Suggested combinations
`;
```

### Example AI Conversations

```
USER: "I want to find sellers that aren't getting called by everyone else"

AI: I recommend our Contrarian Filter bundle:

🎯 PRIMARY RECOMMENDATIONS:
• "Almost Sold" - Owners who listed but couldn't sell. They want to sell but the 
  traditional market failed them. Very few competitors target these.
  
• "Underwater Landlord" - Properties with negative cash flow. These owners are 
  bleeding money monthly but don't show up on "distress" lists yet.
  
• "Quiet Equity Builder" - Owners who recently paid off their mortgage. They're 
  planning something (downsizing, selling) but haven't listed yet.

📊 COMPETITION LEVEL: Low
Most platforms filter FOR high equity, so "underwater" owners get ignored. 
And "almost sold" isn't even a standard filter category.

💡 SUGGESTED COMBINATION:
Stack "Almost Sold" + "Tax Squeeze" for owners who both failed to sell AND 
are feeling the pressure of rising taxes. Double motivation, minimal competition.

Want me to run this search in a specific area?
```

```
USER: "Find me absentee owners in Tampa"

AI: I'll search for absentee owners in Tampa. But let me suggest some 
enhancements to reduce your competition:

📋 BASIC SEARCH:
• Absentee Owner in Tampa, FL

🚀 ENHANCED OPTIONS (Recommended):
• "New Absentee" - Owners who JUST became absentee in the last 12 months. 
  Something changed in their life recently. More motivated.
  
• "Distant Owner" - Specifically owners 500+ miles from Tampa. 
  Harder to manage = more motivated to sell.
  
• "Multi-Property Absentee" - Owners with 2-5 Tampa rentals. 
  They're not professional investors but have enough to be overwhelmed.

Which approach would you like?
1. Basic absentee (highest volume, most competition)
2. New absentee only (moderate volume, less competition)
3. All enhanced absentee filters (lower volume, much less competition)
```

---

## Filter Execution Service

```typescript
interface FilterService {
  // Execute a single filter template
  executeFilter(
    templateSlug: string,
    geographicScope: GeographicScope,
    options?: FilterOptions
  ): Promise<FilterResult>;
  
  // Execute multiple filters (AND logic)
  executeFilterStack(
    templateSlugs: string[],
    geographicScope: GeographicScope,
    options?: FilterOptions
  ): Promise<FilterResult>;
  
  // Execute user's saved filter
  executeSavedFilter(
    savedFilterId: number,
    options?: FilterOptions
  ): Promise<FilterResult>;
  
  // Get filter recommendations from AI
  getAIFilterRecommendations(
    userQuery: string,
    userPreferences?: UserPreferences
  ): Promise<FilterRecommendation[]>;
  
  // Convert natural language to filter criteria
  parseNaturalLanguageFilter(
    query: string
  ): Promise<ParsedFilterCriteria>;
}

interface FilterResult {
  properties: PropertyRecord[];
  totalCount: number;
  filtersApplied: string[];
  criteriaUsed: Record<string, any>;
  executionTimeMs: number;
  competitionScore: number;  // 0-100, lower = less competition
}

interface GeographicScope {
  type: "city" | "zip" | "county" | "radius" | "polygon";
  city?: string;
  state?: string;
  zipCodes?: string[];
  county?: string;
  center?: { lat: number; lng: number };
  radiusMiles?: number;
  polygon?: { lat: number; lng: number }[];
}
```

---

## Notification System Integration

Filters integrate with the notification system for automated alerts:

```typescript
interface FilterNotificationConfig {
  savedFilterId: number;
  
  // Trigger conditions
  triggerOn: {
    newMatches: boolean;      // New properties match filter
    priceChanges: boolean;    // Existing matches change price
    statusChanges: boolean;   // Existing matches change status
  };
  
  // Frequency
  frequency: "instant" | "hourly" | "daily" | "weekly";
  
  // Channels
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  
  // Limits
  maxNotificationsPerDay: number;
  quietHoursStart?: string;  // "22:00"
  quietHoursEnd?: string;    // "08:00"
}
```

---

*Document prepared for AI-First Real Estate Wholesaling Platform*
*RentCast API Version: Current as of December 2025*
*Next Review: Upon RentCast API updates*
