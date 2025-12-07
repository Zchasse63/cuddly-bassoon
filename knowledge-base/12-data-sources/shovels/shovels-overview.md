---
slug: shovels-overview
title: "Shovels API - Construction Permit & Contractor Data"
category: Data Sources
subcategory: Permit Data
tags: [data-shovels, data-source, permit-data, contractor-data, concept-repairs, signal-permit]
related_docs: [repair-estimation-guide, interpreting-permit-activity, tool-category-permits, shovels-permit-data]
difficulty_level: intermediate
---

# Shovels API - Construction Permit & Contractor Data

## Overview

Shovels.ai provides construction permit data and contractor intelligence. This data reveals renovation history, active projects, and contractor performance - critical signals for wholesale deal analysis.

## Data Types Available

### 1. Construction Permits

Detailed permit records for residential and commercial properties.

**22 Standardized Permit Tags:**
- **Structural**: addition, adu, demolition, new_construction
- **Interior**: bathroom, kitchen, remodel
- **Mechanical**: hvac, heat_pump, plumbing, gas
- **Electrical**: electrical, electric_meter, generator
- **Exterior**: roofing, pool_and_hot_tub, grading
- **Green**: solar, battery, ev_charger, water_heater
- **Safety**: fire_sprinkler

**Permit Status Values:**
- `active` - Work in progress
- `final` - Completed with final inspection
- `in_review` - Awaiting approval
- `inactive` - Expired or withdrawn

**Key Permit Fields:**
- **job_value**: Estimated project cost
- **fees**: Permit fees paid
- **file_date**: When permit was filed
- **issue_date**: When work was authorized
- **final_date**: When completed
- **inspection_pass_rate**: Quality indicator
- **approval_duration**: Days from file to issue
- **construction_duration**: Days from issue to final

### 2. Contractor Records

Detailed contractor profiles with performance metrics.

**Key Fields:**
- **name/business_name**: Contractor identity
- **license_number/state**: Licensing info
- **total_permits**: Experience indicator
- **lifetime_job_value**: Volume of work
- **avg_inspection_pass_rate**: Quality score
- **avg_construction_duration**: Speed indicator
- **permit_tags**: Specializations

### 3. Geographic Metrics

Aggregated permit activity by area.

**Available Geographic Levels:**
- ZIP code
- City
- County
- Jurisdiction

**Metrics:**
- Total permits (all time and monthly)
- Average approval duration
- Average construction duration
- Average inspection pass rate
- Total permit value
- Active contractor count

## How Data is Used in the Platform

### For Renovation Assessment

**Recent Permits Indicate:**
- Property was recently renovated (less work needed)
- Current renovation in progress (owner is invested)
- ADU added (increased rental potential)

**No Permit History May Indicate:**
- Deferred maintenance (more work needed)
- Unpermitted work (title/insurance risk)
- Original condition (larger rehab opportunity)

### For Motivation Scoring

**High Motivation Signals:**
- Multiple permits filed then abandoned
- Permit filed but work never started
- Failed inspections (frustrated owner)

**Lower Motivation Signals:**
- Recently completed renovation
- Active permit with progress
- High inspection pass rate

### For Repair Estimation

Use permit job values to estimate renovation costs:

| Permit Type | Typical Job Value |
|-------------|-------------------|
| Kitchen Remodel | $20,000-$50,000 |
| Bathroom | $8,000-$25,000 |
| HVAC | $5,000-$15,000 |
| Roofing | $8,000-$25,000 |
| Solar | $15,000-$35,000 |
| ADU | $100,000-$200,000 |
| New Construction | $150,000-$400,000 |

### For Contractor Analysis

When evaluating repair estimates, check contractor:
- **Pass rate > 90%**: High quality work
- **Pass rate < 80%**: Quality concerns
- **High permit volume**: Experienced, likely reliable
- **Low permit volume**: Less established

## Understanding Permit Timelines

### Approval Duration Benchmarks

| Duration | Interpretation |
|----------|----------------|
| < 2 weeks | Simple permit, routine work |
| 2-4 weeks | Standard approval timeline |
| 4-8 weeks | Complex project or busy jurisdiction |
| > 8 weeks | Major project or approval challenges |

### Construction Duration Benchmarks

| Duration | Interpretation |
|----------|----------------|
| < 30 days | Minor work (bathroom, electrical) |
| 30-90 days | Medium project (kitchen, HVAC) |
| 90-180 days | Major renovation |
| > 180 days | Full rehab or addition |

## Red Flags in Permit Data

### For Properties
- **Permit filed > 1 year ago, still active**: Stalled project
- **Multiple failed inspections**: Quality issues
- **Demolition permit**: Major issues or tear-down
- **No permits but obvious renovations**: Unpermitted work risk

### For Contractors
- **Pass rate < 70%**: Quality concerns
- **License issues**: Verify current status
- **Very low job values**: May cut corners

## Related Documentation

- [Repair Estimation Guide](repair-estimation-guide)
- [Interpreting Permit Activity](interpreting-permit-activity)
- [Shovels Permit Data Details](shovels-permit-data)
- [Permit Tools Category](tool-category-permits)
