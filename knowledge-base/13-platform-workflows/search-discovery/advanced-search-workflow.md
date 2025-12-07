---
slug: advanced-search-workflow
title: "Advanced Search Patterns - Complex Multi-Filter Searches"
category: Platform Workflows
subcategory: Search & Discovery
tags: [workflow-search, workflow-advanced, tool-property-search, action-search, tool-advanced-search]
related_docs: [first-search-workflow, geographic-search-workflow, batch-search-workflow]
difficulty_level: intermediate
---

# Advanced Search Patterns

## Overview

Master complex search strategies using multiple filters, boolean logic, and advanced criteria to find highly targeted investment opportunities.

## Multi-Filter Search Strategies

### Combining Motivation Indicators

Stack multiple motivation signals for highest-probability leads.

**Triple Threat Search:**
```
"Find properties in [location] where:
- Owner is absentee AND
- Equity is above 50% AND
- Ownership duration is 10+ years"
```

**Distressed Signal Stack:**
```
"Find properties with:
- Out-of-state owner AND
- No recent permits (5+ years) AND
- Tax delinquency indicators AND
- Pre-1990 construction"
```

### Property + Motivation Combinations

**The Fix & Flip Sweet Spot:**
```
"Find 3-4 bedroom single-family homes in [ZIP]
- Built 1970-2000
- 1,500-2,500 sqft
- Absentee owner
- Equity above 40%
- Under $250,000 estimated value"
```

**The Rental Acquisition:**
```
"Find multi-family properties (2-4 units) in [city]
- Current landlord (tenant-occupied)
- Owner has multiple properties
- Owned 5+ years
- Price under $500,000"
```

## Boolean Search Logic

### AND Logic (Narrows Results)
All conditions must be true.

**Example:**
"Properties that are BOTH absentee owner AND high equity"
→ Only properties meeting both criteria

### OR Logic (Expands Results)
Any condition can be true.

**Example:**
"Properties that are absentee owner OR out-of-state owner"
→ Properties meeting either criterion

### NOT Logic (Excludes Results)
Exclude specific conditions.

**Example:**
"Absentee owner properties NOT owned by corporations"
→ Only individual absentee owners

### Combined Logic

**Complex Example:**
```
"Find properties where:
(Absentee owner OR Out-of-state owner) AND
(High equity OR Long ownership) AND
NOT (Bank owned OR Government owned)"
```

## Geographic Filter Strategies

### Radius Search
```
"Find properties within 2 miles of [address]
with absentee owners"
```

### Multi-ZIP Search
```
"Search ZIP codes 33139, 33140, and 33141
for high-equity single-family homes"
```

### County-Wide with Exclusions
```
"Find properties in Miami-Dade County
excluding Miami Beach and Coral Gables"
```

### Neighborhood Targeting
```
"Find properties in the Wynwood and Little Havana
neighborhoods of Miami"
```

## Price-Based Strategies

### Below Market Value Detection
```
"Find properties where:
- Estimated value is $200,000+
- Last sale was under $150,000
- Sold more than 3 years ago"
```

### Equity Sweet Spot
```
"Find properties with:
- Estimated value between $150,000 and $300,000
- Equity between 40% and 70%
- Not free and clear (has mortgage)"
```

### Price Per Square Foot Anomalies
```
"Find properties where price per sqft
is 20%+ below area median"
```

## Owner-Based Strategies

### Corporate Owner Exits
```
"Find LLC-owned properties in [area]
with permits but no recent activity
owned 3-7 years"
```

### Estate/Inheritance Leads
```
"Find properties with:
- Owner name includes 'Trust' or 'Estate'
- Owned 15+ years
- Out-of-area mailing address"
```

### Tired Landlord Identification
```
"Find properties where owner:
- Has 3+ other properties
- Has rental permits
- Owns for 10+ years
- Lives out of state"
```

## Time-Based Filters

### Ownership Duration
```
"Find properties owned:
- Less than 2 years (accidental landlord)
- 2-5 years (emerging equity)
- 5-10 years (mature equity)
- 10+ years (maximum equity)"
```

### Market Listing History
```
"Find properties that:
- Were listed in last 12 months
- Did not sell (expired/canceled listing)"
```

### Permit Timeline
```
"Find properties with permits:
- Issued more than 6 months ago
- Not yet finalized (stalled project)"
```

## Advanced Filter Combinations

### The Goldilocks Search
Properties that hit the sweet spot:
```
"Find properties in [location] where:
- Price: $150K-$250K (affordable)
- Beds: 3-4 (family-friendly)
- Built: 1970-2000 (established, not ancient)
- SqFt: 1,200-2,000 (adequate size)
- Equity: 40-70% (motivated, not free-clear)
- Ownership: 5-15 years (ready to move)"
```

### The Hidden Gem Search
Properties others might miss:
```
"Find properties where:
- No MLS listing history
- Absentee owner
- No mortgage (free and clear)
- Built before 1990
- In improving neighborhoods"
```

### The Quick Flip Search
Properties for fast turnaround:
```
"Find properties where:
- Currently vacant (no tenant issues)
- Cosmetic repairs only (permits recent)
- Strong rental market (backup exit)
- Under median price for area"
```

## Search Optimization Tips

### Performance Tips
1. Start with location (fastest filter)
2. Add property type next
3. Add price range
4. Then add motivation filters
5. Fine-tune with specific criteria

### Result Management
- Target 20-50 results for manual review
- Too many results? Add filters
- Too few results? Remove filters
- Zero results? Broaden geography or criteria

### Iterative Refinement
```
Search 1: Miami absentee owners → 2,500 results
Search 2: + High equity → 800 results
Search 3: + 3+ bedrooms → 350 results
Search 4: + Under $300k → 125 results
Search 5: + Built after 1970 → 75 results ✓
```

## Sample Advanced Searches

### Wholesale Lead Generator
```
"Find single-family homes in [market] where:
- Absentee owner (any distance)
- Equity above 40%
- Owned 7+ years
- No corporate owner
- Value under $350,000
- Not listed on MLS currently"
```

### Cash Buyer Inventory Match
```
"Find properties matching buyer criteria:
- 3+ bedrooms, 2+ bathrooms
- Within 10 miles of [location]
- ARV under $250,000
- Needs cosmetic work only
- Available for quick close"
```

### Market Opportunity Scan
```
"Find properties in [ZIP codes] with:
- Any motivation indicator
- Price below area median
- Rising neighborhood indicators
- Sort by motivation score descending"
```

## Related Documentation

- [First Property Search](first-search-workflow)
- [Geographic Search](geographic-search-workflow)
- [Batch Property Search](batch-search-workflow)
- [Property Search Tools](tool-category-property-search)
