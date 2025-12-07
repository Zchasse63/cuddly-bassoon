---
slug: shovels-contractor-data
title: "Shovels Contractor Data - Contractor Intelligence Reference"
category: Data Sources
subcategory: Permit Data
tags: [data-shovels, data-source, contractor-data, concept-repairs, signal-permit]
related_docs: [shovels-overview, repair-estimation-guide, tool-category-contractors]
difficulty_level: intermediate
---

# Shovels Contractor Data - Contractor Intelligence Reference

## Overview

Shovels provides contractor profiles derived from permit records, enabling you to evaluate contractors by their permit history, quality metrics, and specializations.

## Contractor Record Structure

### Identity Fields

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique contractor ID | "ctr_abc123" |
| `name` | Individual or DBA name | "John Smith" |
| `business_name` | Company name | "Smith Renovations LLC" |
| `license_number` | State license # | "CRC1234567" |
| `license_state` | State of licensure | "FL" |
| `website` | Company website | "smithrenovations.com" |

### Volume Metrics

| Field | Description | Significance |
|-------|-------------|--------------|
| `total_permits` | Lifetime permit count | Experience indicator |
| `lifetime_job_value` | Total $ of all projects | Scale of operations |

### Quality Metrics

| Field | Description | Good Range |
|-------|-------------|------------|
| `avg_inspection_pass_rate` | % inspections passed first time | > 90% = high quality |
| `avg_construction_duration` | Average days to complete | Lower = efficient |

### Specializations

| Field | Description | Example |
|-------|-------------|---------|
| `permit_tags` | Types of work they do | ["kitchen", "bathroom", "remodel"] |
| `property_types` | Property types served | ["residential", "commercial"] |

## Interpreting Contractor Quality

### Pass Rate Analysis

| Rate | Quality Level | Recommendation |
|------|---------------|----------------|
| 95%+ | Excellent | Highly reliable |
| 90-95% | Good | Recommended |
| 85-90% | Acceptable | Use with oversight |
| 80-85% | Below average | Verify recent work |
| < 80% | Poor | Avoid |

### Volume Analysis

| Total Permits | Experience Level | Notes |
|---------------|------------------|-------|
| 100+ | Very experienced | Established operation |
| 50-99 | Experienced | Solid track record |
| 20-49 | Moderate | Growing business |
| 10-19 | Limited | Verify quality |
| < 10 | New/Part-time | Higher risk |

### Lifetime Job Value Analysis

| Value | Scale | Typical Work |
|-------|-------|--------------|
| $5M+ | Large operation | Full renovations, commercial |
| $1M-$5M | Medium | Kitchen/bath remodels |
| $500K-$1M | Small | Targeted renovations |
| < $500K | Very small | Minor repairs, handyman |

## Contractor Specializations

### Common Permit Tags

**Structural Work Specialists:**
- `new_construction` - Ground-up builders
- `addition` - Home additions
- `adu` - Accessory dwelling units

**Interior Specialists:**
- `kitchen` - Kitchen remodels
- `bathroom` - Bathroom work
- `remodel` - General interior renovation

**System Specialists:**
- `hvac` - HVAC contractors
- `plumbing` - Plumbers
- `electrical` - Electricians
- `roofing` - Roofers

**Green/Energy Specialists:**
- `solar` - Solar installers
- `ev_charger` - EV charger installers

## Using Contractor Data

### For Repair Estimates

1. Find contractors who've done similar work in the area
2. Look at their average job values for similar permits
3. Use as baseline for repair estimates

### For Deal Analysis

**Good Signs (property had work done):**
- High pass rate contractor
- Recent permits completed
- Reasonable job values

**Warning Signs:**
- Low pass rate contractor did work
- Permits from unknown/unlicensed
- Unusually low job values (cut corners?)

### For Buyer Network

Cash buyers often want contractor recommendations:
- Match contractors to property type
- Filter by quality metrics
- Provide as value-add

## Searching Contractors

### By Location

```typescript
// Find contractors in a ZIP code
await shovels.searchContractors({
  geoId: 'zip_33139',
  permitTags: ['kitchen', 'bathroom']
});
```

### By Property Address

```typescript
// Find contractors who've worked on similar properties
await shovels.getContractorsNearAddress({
  address: '123 Main St',
  radiusMiles: 5
});
```

### By Permit Type

```typescript
// Find specialists
await shovels.searchContractors({
  permitTags: ['solar'],
  minPermits: 20,
  minPassRate: 90
});
```

## Contractor Red Flags

| Flag | Risk | Action |
|------|------|--------|
| No license number | May be unlicensed | Verify with state |
| Pass rate < 80% | Quality issues | Avoid |
| No recent permits | Inactive/out of business | Verify current status |
| Only very low value jobs | May lack capability | Match to project size |
| Single permit type only | Limited scope | Use for specialty only |

## Contractor Metrics by Trade

### Expected Pass Rates by Trade

| Trade | Expected Rate | Notes |
|-------|---------------|-------|
| Roofing | 95%+ | Straightforward inspections |
| HVAC | 92%+ | Technical but standard |
| Plumbing | 90%+ | Code-intensive |
| Electrical | 90%+ | Safety-critical |
| General remodel | 88%+ | Multiple systems |
| New construction | 85%+ | Complex, many inspections |

### Expected Duration by Project Type

| Project Type | Typical Duration |
|--------------|------------------|
| Water heater | 1-3 days |
| HVAC replacement | 3-5 days |
| Bathroom remodel | 2-4 weeks |
| Kitchen remodel | 4-8 weeks |
| Addition | 2-4 months |
| New construction | 4-12 months |

## Related Documentation

- [Shovels Overview](shovels-overview)
- [Repair Estimation Guide](repair-estimation-guide)
- [Contractor Tools](tool-category-contractors)
