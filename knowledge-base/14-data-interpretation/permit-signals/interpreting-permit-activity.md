---
slug: interpreting-permit-activity
title: "Interpreting Permit Activity - Construction Signals for Deal Analysis"
category: Data Interpretation
subcategory: Permit Signals
tags: [interpretation-permits, signal-permit, data-shovels, concept-repairs]
related_docs: [shovels-overview, shovels-permit-data, repair-estimation-guide, interpreting-permit-gaps]
difficulty_level: intermediate
---

# Interpreting Permit Activity

## Why Permits Matter

Permit data reveals crucial information about properties:
- Recent renovation history
- Current project status
- Owner investment level
- Potential repair needs
- Motivation indicators

## Reading Permit Records

### Key Fields to Analyze

| Field | What It Tells You |
|-------|-------------------|
| `status` | Current state of project |
| `tags` | Type of work done |
| `job_value` | Project investment |
| `file_date` | When started |
| `final_date` | When completed |
| `inspection_pass_rate` | Quality indicator |

### Status Interpretation

| Status | Meaning | Deal Implications |
|--------|---------|-------------------|
| `final` | Work completed, passed inspection | Property improved |
| `active` | Work in progress | Owner invested, may not sell |
| `in_review` | Awaiting approval | Project planned |
| `inactive` | Expired or withdrawn | Possible distress signal |

## Permit Patterns

### Positive Patterns (Recent Renovation)

**Pattern**: Multiple final permits in past 2 years

**What it means:**
- Property recently improved
- Higher value than similar unrenovated properties
- Owner invested significantly
- Less work needed for flip

**Deal impact:**
- Adjust ARV upward
- Reduce repair estimate
- Owner may be less motivated (recent investment)

### Distress Patterns (Abandoned Projects)

**Pattern**: Active permit filed 1+ year ago, no progress

**What it means:**
- Project started but stalled
- Owner may have run out of money
- Property may be in poor condition
- High motivation signal

**Deal impact:**
- Lower ARV (unfinished work)
- Higher repair estimate
- Strong motivation indicator (+15-20 points)

### Flip Pattern (Quick Turnaround)

**Pattern**: Multiple permits filed shortly after purchase

**What it means:**
- Investor purchased and renovated
- Professional flip
- Property brought to market condition

**Deal impact:**
- Higher ARV (retail ready)
- Limited additional work needed
- May be listed at retail price

### Landlord Pattern (Minimal Permits)

**Pattern**: Few or no permits over long ownership

**What it means:**
- Deferred maintenance likely
- Property may need updates
- Owner not investing in property

**Deal impact:**
- Lower current value
- Higher repair estimate
- May indicate tired landlord

## Permit Types and Values

### Renovation Indicators

| Permit Tag | Typical Value | What It Means |
|------------|---------------|---------------|
| `kitchen` | $20K-50K | Major value-add work |
| `bathroom` | $8K-25K | Common update |
| `remodel` | $15K-75K | General renovation |
| `addition` | $50K-150K | Square footage added |
| `adu` | $100K-200K | Rental unit added |

### System Updates

| Permit Tag | Typical Value | What It Means |
|------------|---------------|---------------|
| `hvac` | $5K-15K | HVAC replacement |
| `electrical` | $3K-15K | Electrical work |
| `plumbing` | $3K-12K | Plumbing work |
| `roofing` | $8K-25K | Roof replacement |

### Value-Add Features

| Permit Tag | Typical Value | What It Means |
|------------|---------------|---------------|
| `solar` | $15K-35K | Energy improvement |
| `pool_and_hot_tub` | $25K-75K | Amenity added |
| `ev_charger` | $1K-5K | Modern feature |

## Quality Indicators

### Inspection Pass Rate

| Rate | Interpretation | Quality Level |
|------|----------------|---------------|
| 95%+ | Excellent workmanship | High quality |
| 85-94% | Good workmanship | Standard |
| 75-84% | Some issues | Monitor quality |
| Below 75% | Quality concerns | Verify completion |

### Construction Duration

| Duration vs. Typical | Interpretation |
|---------------------|----------------|
| Faster | Efficient work, pro contractor |
| On track | Normal project |
| Slower | Delays, issues possible |
| Much slower (2x+) | Red flag, investigate |

## Using Permits in Deal Analysis

### Adjusting Repair Estimates

**If recent permits for:**
- HVAC: Don't include HVAC in repairs
- Roof: Don't include roof in repairs
- Kitchen/bath: Reduce interior estimate

**If no permits and old house:**
- Add HVAC contingency ($8K-15K)
- Add electrical update ($5K-10K)
- Add plumbing contingency ($5K-10K)

### Adjusting Motivation Score

| Permit Pattern | Score Adjustment |
|----------------|------------------|
| Abandoned project | +15-20 |
| Recent completion | -10-15 |
| Major system update needed | +5-10 |
| No permits, old house | +5 |

## Red Flags

### Permit Warning Signs

| Signal | Risk | Action |
|--------|------|--------|
| Demo permit only | Major issues | Investigate thoroughly |
| Many failed inspections | Quality problems | Get inspection |
| Unpermitted additions visible | Legal issues | Verify with city |
| Active permit, owner selling | Project distress | Understand why |

### Missing Permits

If a property shows obvious renovations but no permits:
- May be unpermitted work
- Insurance/lending issues possible
- Could require bringing up to code
- Factor into repair estimate

## Related Documentation

- [Shovels API Overview](shovels-overview)
- [Permit Data Details](shovels-permit-data)
- [Repair Estimation Guide](repair-estimation-guide)
- [Interpreting Permit Gaps](interpreting-permit-gaps)
