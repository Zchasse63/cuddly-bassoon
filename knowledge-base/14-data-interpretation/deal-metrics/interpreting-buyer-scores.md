---
slug: interpreting-buyer-scores
title: "Interpreting Buyer Match Scores - Understanding Property-Buyer Fit"
category: Data Interpretation
subcategory: Deal Metrics
tags: [interpretation-buyer-score, concept-buyer, action-match, tool-buyer-management]
related_docs: [interpreting-deal-scores, buyer-management-workflow, buyer-match-workflow]
difficulty_level: intermediate
---

# Interpreting Buyer Match Scores

## What Buyer Match Scores Tell You

Buyer match scores indicate how well a property fits a buyer's stated criteria. High match scores mean faster assignments and happier buyers.

## Match Score Components

### Typical Match Report
```
Property: 123 Main St, Miami FL
Matched Buyer: ABC Investments

Match Score: 85/100

Criteria Match:
- Location: 100% (in target ZIP)
- Price: 90% (slightly above max, 5%)
- Property type: 100% (SFR, preferred)
- Bedrooms: 100% (3BR, within range)
- Condition: 80% (rehab needed, buyer prefers turnkey)
- ARV: 70% (below typical buyer range)
```

### Component Breakdown

| Component | Weight | Description |
|-----------|--------|-------------|
| Location | 30% | Target area match |
| Price | 25% | Within buyer's range |
| Property type | 15% | SFR, multi, etc. |
| Size/beds/baths | 15% | Physical characteristics |
| Condition | 10% | Rehab level match |
| Other criteria | 5% | Pool, garage, etc. |

## Score Interpretation

### Match Score Ranges

| Score | Match Quality | Expected Response |
|-------|---------------|-------------------|
| 90-100 | Perfect match | Immediate interest |
| 80-89 | Excellent match | Strong interest |
| 70-79 | Good match | Interested, may negotiate |
| 60-69 | Acceptable match | Conditional interest |
| 50-59 | Partial match | May pass or lowball |
| < 50 | Poor match | Likely not interested |

### Priority by Score
```
First contact: Score 85+
Second tier: Score 70-84
Third tier: Score 60-69
Don't waste time: Score < 60
```

## Component Analysis

### Location Match

**100% Match:**
- Property in buyer's #1 target area
- Exact ZIP code match
- Within stated radius

**Partial Match (50-99%):**
- Adjacent to target area
- Same city, different neighborhood
- Within expanded radius

**Low Match (< 50%):**
- Different city
- Outside buyer's market
- Wrong region

### Price Match

| Price vs Max | Match % | Likelihood |
|--------------|---------|------------|
| > 10% under max | 100% | Strong interest |
| At max | 90% | Good fit |
| 5-10% over max | 70% | May stretch |
| 10-20% over max | 50% | Unlikely |
| > 20% over max | 0% | Don't send |

### Property Type Match

| Type Match | Score |
|------------|-------|
| Exact match (e.g., SFR to SFR buyer) | 100% |
| Close match (e.g., duplex to multi buyer) | 80% |
| Partial (e.g., condo to SFR buyer) | 40% |
| Wrong type (e.g., land to SFR buyer) | 0% |

### Condition Match

| Buyer Preference | Property Condition | Match |
|------------------|-------------------|-------|
| Heavy rehab | Heavy rehab | 100% |
| Heavy rehab | Light rehab | 70% |
| Turnkey | Turnkey | 100% |
| Turnkey | Heavy rehab | 30% |

## Using Match Scores

### Selecting Buyers to Contact

**For a property:**
```
1. Sort all buyers by match score
2. Filter to score > 70
3. Consider relationship strength
4. Start with highest matches
```

**Contact Order:**
```
1st: Perfect matches (90+) who are active
2nd: Excellent matches (80-89)
3rd: Good matches (70-79) with stretch potential
```

### Presenting Deals

**High Match (85+):**
```
"I have a property that's a perfect fit for your criteria.
[Send detailed package]
[Expect quick response]"
```

**Good Match (70-84):**
```
"This property matches most of your criteria with a few differences.
[Highlight matches]
[Explain differences]
[Ask if they'd consider]"
```

**Partial Match (60-69):**
```
"This is slightly outside your usual criteria, but the numbers are strong.
[Focus on opportunity]
[Ask if criteria are flexible]"
```

## Multiple Buyer Analysis

### Buyer Competition Analysis
```
Property 123 Main St:

Buyer A: 92% match - Primary contact
Buyer B: 88% match - Second option
Buyer C: 75% match - Backup
Buyer D: 65% match - Only if others pass

Strategy: Send to A first with 24hr exclusive,
then B if no response, then broadcast to C & D
```

### Buyer Response Patterns

Track match score vs actual interest:
```
Buyer A:
- Average sent match score: 82%
- Properties they pursued: avg 87%
- Deals closed: avg match 91%

Insight: Buyer A only closes on excellent matches
→ Don't send anything below 85%
```

## Score Calibration

### Adjusting for Buyer Behavior

**Active Buyer (closes frequently):**
- Lower score threshold (65+)
- Responds to more properties
- Worth sending near-matches

**Selective Buyer (rarely closes):**
- Higher score threshold (80+)
- Only perfect matches
- Don't waste their time

**New Buyer (unknown pattern):**
- Start with high matches (75+)
- Track response pattern
- Adjust over time

### Buyer Criteria Accuracy

Sometimes stated criteria don't match actual behavior:
```
Stated: "I buy 3-4 BR homes under $200K"
Actual: Closed on 5BR for $240K

Action: Expand criteria match to include actual behavior
```

## Match Score vs Deal Quality

### When to Override Match Score

**High match, bad deal:**
- Property fits criteria but is overpriced
- Don't send bad deals to good buyers
- Protects your reputation

**Lower match, great deal:**
- Property slightly outside criteria but huge margin
- Ask buyer if they'd consider
- Highlight the opportunity

### Combined Score
```
Send Score = (Match Score × 0.6) + (Deal Score × 0.4)

Property A: Match 90, Deal 70 → Send 82
Property B: Match 75, Deal 90 → Send 81

Both worth sending, different strengths
```

## Building Match History

### Track All Matches
```
For each buyer, record:
- Properties sent
- Match scores
- Buyer response
- Final outcome

Use to refine:
- Actual criteria (vs stated)
- Response patterns
- Close rates by match score
```

### Improve Future Matching
```
Analysis: Buyer X closes 80% of 90+ matches, 20% of 75-89, 0% of <75

Action: Only send 85+ matches to Buyer X
Result: Higher close rate, better relationship
```

## Related Documentation

- [Interpreting Deal Scores](interpreting-deal-scores)
- [Buyer Management Workflow](buyer-management-workflow)
- [Buyer Match Reports](buyer-match-workflow)
- [Buyer Management Tools](tool-category-buyer-management)
