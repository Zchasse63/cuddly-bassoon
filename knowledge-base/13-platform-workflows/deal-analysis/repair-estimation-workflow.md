---
slug: repair-estimation-workflow
title: "Repair Estimation - Estimating Renovation Costs"
category: Platform Workflows
subcategory: Deal Analysis
tags: [workflow-deal-analysis, workflow-repairs, tool-deal-analysis, concept-repairs, data-shovels, signal-permit]
related_docs: [complete-deal-analysis-workflow, shovels-permit-data, shovels-contractor-data]
difficulty_level: intermediate
---

# Repair Estimation Workflow

## Overview

Accurate repair estimates are critical for wholesale deals. Underestimate and your buyer loses money. Overestimate and you lose deals. This workflow teaches systematic repair cost estimation.

## Step 1: Gather Property Intelligence

### Get Property Basics
```
"Get property details for [address] including year built and features"
```

**Key factors affecting repairs:**
| Factor | Impact |
|--------|--------|
| Year Built | Older = more likely deferred maintenance |
| Last Remodel | Recent = fewer repairs |
| Square Footage | More sqft = higher repair costs |
| Stories | Multi-story = more complexity |

### Check Permit History
```
"Show all permits for [address]"
```

**Interpret permit data:**
| Recent Permit | Implication | Repair Adjustment |
|---------------|-------------|-------------------|
| Roof (< 10 yr) | Roof likely good | Skip roof budget |
| HVAC (< 15 yr) | System updated | Skip HVAC budget |
| Kitchen (< 10 yr) | Kitchen updated | Reduce kitchen budget |
| Plumbing (< 10 yr) | Systems updated | Reduce plumbing |
| Electrical upgrade | Wiring updated | Reduce electrical |
| None (old home) | All systems original | Budget all categories |

## Step 2: Determine Renovation Level

### Renovation Level Categories

**Level 1: Cosmetic/Light ($5-20K)**
```
- Paint interior/exterior
- Flooring replacement (LVP/carpet)
- Light fixture updates
- Hardware replacement
- Basic landscaping
- Professional cleaning
```

**Level 2: Moderate ($20-60K)**
```
All of Level 1, plus:
- Kitchen cabinet refinishing/replacement
- Countertop replacement
- Appliance replacement
- Bathroom updates (fixtures, vanity)
- One major system repair
- Minor roof/HVAC repairs
```

**Level 3: Heavy ($60-120K)**
```
All of Level 2, plus:
- Full kitchen remodel
- Full bathroom remodel(s)
- HVAC replacement
- Roof replacement
- Window replacement
- Some structural work
```

**Level 4: Gut Rehab ($120K+)**
```
Complete renovation including:
- All systems replaced
- Structural repairs
- Layout changes
- Foundation work
- Complete exterior renovation
```

### Request Repair Estimate
```
"Estimate repair costs for [address] assuming [level] renovation"
```

## Step 3: Build Detailed Estimate

### Request Category Breakdown
```
"Break down repair estimates by category for [address]"
```

### Standard Repair Categories

**Exterior:**
| Item | Light | Moderate | Heavy |
|------|-------|----------|-------|
| Roof | $0 | $2-5K patch | $8-15K replace |
| Siding | $0-1K | $2-5K | $8-15K |
| Windows | $0 | $2-5K | $8-20K |
| Doors | $0-500 | $1-3K | $3-8K |
| Landscaping | $500-2K | $2-5K | $5-10K |
| Driveway | $0 | $1-3K | $3-8K |

**Interior:**
| Item | Light | Moderate | Heavy |
|------|-------|----------|-------|
| Paint | $2-4K | $3-6K | $5-10K |
| Flooring | $2-5K | $5-10K | $10-20K |
| Kitchen | $0-2K | $5-20K | $20-50K |
| Bathrooms | $0-2K | $3-10K | $10-25K |
| Lighting | $500-1K | $1-3K | $3-6K |
| Doors/Trim | $0-500 | $1-3K | $3-8K |

**Systems:**
| Item | Light | Moderate | Heavy |
|------|-------|----------|-------|
| HVAC | $0 | $1-5K repair | $6-12K replace |
| Plumbing | $0-500 | $1-5K | $5-15K |
| Electrical | $0-500 | $1-3K | $5-15K |
| Water Heater | $0 | $800-1.5K | $800-1.5K |

**Foundation/Structural:**
| Item | Light | Moderate | Heavy |
|------|-------|----------|-------|
| Foundation | $0 | $0-5K | $5-30K |
| Framing | $0 | $0-2K | $5-20K |

## Step 4: Validate with Market Data

### Check Local Contractor Costs
```
"What do similar renovations cost in [ZIP code] based on permit data?"
```

### Review Recent Permit Values
```
"Show recent kitchen and bathroom permit values in this area"
```

### Adjust for Market
| Market Type | Adjustment |
|-------------|------------|
| High cost (CA, NY, etc.) | +25-50% |
| Medium cost | Baseline |
| Low cost (midwest, rural) | -15-25% |

## Step 5: Add Contingency and Soft Costs

### Contingency Buffer
| Renovation Level | Contingency |
|------------------|-------------|
| Light (known scope) | 10% |
| Moderate | 15% |
| Heavy | 20% |
| Gut Rehab | 25-30% |

### Soft Costs to Include
| Cost | Typical Range |
|------|---------------|
| Permits | 1-3% of job |
| Dumpsters | $500-1,500 |
| Utilities during rehab | $200-500/month |
| Insurance | $500-1,500 |
| Property taxes | Prorated |
| Holding costs | Finance dependent |

### Calculate Total
```
"Calculate total repair budget including contingency and soft costs"
```

**Formula:**
```
Total = Base Repairs + Contingency + Soft Costs

Example:
Base repairs: $45,000
Contingency (15%): $6,750
Soft costs: $3,000
Total: $54,750 → Round to $55,000
```

## Step 6: Compare Renovation Levels

### Request Comparison
```
"Show repair cost comparison for light vs moderate vs heavy renovation for [address]"
```

### ROI Analysis
```
| Renovation | Cost | ARV | Profit* |
|------------|------|-----|---------|
| Light ($15K) | $100K all-in | $130K | $30K |
| Moderate ($45K) | $130K all-in | $165K | $35K |
| Heavy ($80K) | $165K all-in | $200K | $35K |

*Assuming $85K purchase price
Recommendation: Light renovation (highest ROI)
```

## Red Flags That Increase Costs

### Structural Issues
```
"Check for any structural concerns at [address]"
```
- Foundation cracks ($$$$)
- Roof sagging ($$$)
- Water damage ($$-$$$$)
- Termite damage ($$-$$$)

### System End-of-Life
- HVAC 20+ years old
- Water heater 15+ years old
- Roof 25+ years old
- Electrical panel needs upgrade

### Code Compliance
- Unpermitted additions
- Non-conforming work
- Safety violations
- Required upgrades when selling

## Quick Estimation Method

For rapid estimates when detailed analysis isn't possible:

### Per Square Foot Method
| Renovation Level | Cost/SqFt |
|------------------|-----------|
| Light | $10-20 |
| Moderate | $25-45 |
| Heavy | $50-80 |
| Gut Rehab | $80-150 |

**Example:**
```
1,800 sqft home, moderate renovation
1,800 × $35/sqft = $63,000
Add 15% contingency = $72,450
Round: $75,000 budget
```

## Repair Estimate Report
```
"Generate a repair estimate report for [address] including:
- Property condition assessment
- Itemized repair list by category
- Cost estimates for each item
- Recommended contingency
- Total repair budget
- Confidence level"
```

## Related Documentation

- [Complete Deal Analysis](complete-deal-analysis-workflow)
- [Shovels Permit Data](shovels-permit-data)
- [Contractor Data Reference](shovels-contractor-data)
- [Interpreting Permit Activity](interpreting-permit-activity)
