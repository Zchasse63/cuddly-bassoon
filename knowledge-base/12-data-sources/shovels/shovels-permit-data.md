---
slug: shovels-permit-data
title: "Shovels Permit Data - Detailed Field Reference"
category: Data Sources
subcategory: Permit Data
tags: [data-shovels, data-source, permit-data, signal-permit, concept-repairs]
related_docs: [shovels-overview, repair-estimation-guide, interpreting-permit-activity, interpreting-permit-gaps]
difficulty_level: intermediate
---

# Shovels Permit Data - Detailed Field Reference

## Permit Record Structure

Each permit record contains detailed information about a construction project.

### Core Fields

| Field | Description | Use Case |
|-------|-------------|----------|
| `id` | Unique permit identifier | Reference and tracking |
| `number` | Official permit number | Cross-reference with jurisdiction |
| `description` | Free-text project description | Understanding scope |
| `jurisdiction` | Issuing authority | Local building department |
| `status` | Current permit status | Active, final, in_review, inactive |
| `property_type` | Residential or commercial | Filter by type |

### Financial Fields

| Field | Description | Typical Range |
|-------|-------------|---------------|
| `job_value` | Estimated project cost | $500 - $500,000+ |
| `fees` | Permit fees paid | $50 - $5,000+ |

**Using Job Value for Analysis:**
- Compare to typical ranges for permit type
- Higher job value = more significant work
- Very low job value may indicate underreporting

### Timeline Fields

| Field | Description | Format |
|-------|-------------|--------|
| `file_date` | Date permit filed | YYYY-MM-DD |
| `issue_date` | Date permit approved | YYYY-MM-DD |
| `final_date` | Date final inspection passed | YYYY-MM-DD |

**Calculated Durations:**
- `approval_duration`: Days from file to issue
- `construction_duration`: Days from issue to final

### Quality Metrics

| Field | Description | Good/Bad |
|-------|-------------|----------|
| `inspection_pass_rate` | % of inspections passed first try | >90% good, <80% concern |

### Tags (22 Standardized)

Permits are categorized with one or more tags:

**Structural Work:**
```
addition         - Room/space addition
adu              - Accessory Dwelling Unit
demolition       - Tear-down work
new_construction - Ground-up build
remodel          - General renovation
```

**Interior Systems:**
```
bathroom   - Bathroom work
kitchen    - Kitchen work
plumbing   - Plumbing systems
```

**HVAC/Mechanical:**
```
hvac       - Heating/cooling systems
heat_pump  - Heat pump installation
gas        - Gas line work
```

**Electrical:**
```
electrical      - General electrical
electric_meter  - Meter/panel upgrade
generator       - Backup generator
```

**Exterior/Other:**
```
roofing          - Roof work
pool_and_hot_tub - Pool/spa
grading          - Site work
fire_sprinkler   - Fire suppression
```

**Green/Energy:**
```
solar        - Solar panel installation
battery      - Battery storage
ev_charger   - EV charging station
water_heater - Water heater
```

## Interpreting Permit Combinations

### Renovation Indicators

| Permit Combination | Likely Scenario |
|--------------------|-----------------|
| kitchen + bathroom | Full interior refresh |
| hvac + electrical | System upgrades |
| roofing + solar | Roof replacement with solar add |
| addition + bathroom | Home expansion |
| remodel + plumbing + electrical | Comprehensive renovation |

### Distress Signals

| Pattern | Interpretation |
|---------|----------------|
| Filed > 1 year, no final | Stalled project |
| Multiple permits, low pass rate | Problem property |
| Permit withdrawn | Owner gave up |
| Demo permit only | Major issues |

### Opportunity Signals

| Pattern | Interpretation |
|---------|----------------|
| Recent final on kitchen/bath | Renovated, higher value |
| Solar installed | Lower utility costs, buyer appeal |
| ADU completed | Rental income potential |
| No permits (but old house) | Deferred maintenance = opportunity |

## Permit Status Definitions

### Active
Work is authorized and in progress. Property may have:
- Active construction
- Scheduled inspections
- Contractors on site

### Final
All work completed and approved. Property has:
- Passed final inspection
- Completed renovation
- Updated systems

### In Review
Permit application submitted, awaiting approval:
- Plans under review
- May need revisions
- Work not yet authorized

### Inactive
Permit no longer valid:
- Expired without completion
- Voluntarily withdrawn
- Superseded by new permit

## Searching Permits

### By Geographic Area
Search by geo_id for:
- ZIP code: `zip_12345`
- City: `city_abc123`
- County: `county_xyz789`

### By Date Range
- `permit_from`: Start date (YYYY-MM-DD)
- `permit_to`: End date (YYYY-MM-DD)

### By Criteria
Filter by:
- `status`: One or more status values
- `permit_tags`: One or more tag values
- `property_type`: residential or commercial
- `min_job_value`: Minimum project value
- `has_contractor`: Only permits with contractor info

## Related Documentation

- [Shovels API Overview](shovels-overview)
- [Repair Estimation Guide](repair-estimation-guide)
- [Interpreting Permit Activity](interpreting-permit-activity)
- [Interpreting Permit Gaps](interpreting-permit-gaps)
