---
slug: heat-map-workflow
title: "Heat Map Analysis - Visualizing Market Activity Patterns"
category: Platform Workflows
subcategory: Map & Visualization
tags: [workflow-map, workflow-analysis, tool-map, action-visualize, action-analyze]
related_docs: [map-search-workflow, drive-time-workflow, market-research-workflow]
difficulty_level: intermediate
---

# Heat Map Analysis Workflow

## Overview

Heat maps visualize data density and patterns across geographic areas, helping you identify hot spots for investment activity, motivation signals, and market trends.

## Types of Heat Maps

### Sales Activity Heat Map
```
"Show a heat map of recent sales in [area]"
```
- Red = High sales volume
- Yellow = Moderate activity
- Blue/Green = Low activity

**Use case:** Find active markets with buyer demand

### Price Heat Map
```
"Show a price heat map for [area]"
```
- Red = Highest prices
- Yellow = Mid-range prices
- Blue = Lower prices

**Use case:** Identify price boundaries and opportunities

### Motivation Heat Map
```
"Show motivation score heat map for [area]"
```
- Red = High concentration of motivated sellers
- Yellow = Moderate motivation
- Blue = Low motivation

**Use case:** Target areas with highest opportunity density

### Permit Activity Heat Map
```
"Show renovation activity heat map for [area]"
```
- Red = Heavy renovation activity
- Yellow = Moderate renovation
- Blue = Low activity

**Use case:** Identify revitalizing neighborhoods

## Creating Heat Maps

### Basic Heat Map Request
```
"Create a heat map of [metric] in [location]"
```

### Customize Heat Map
```
"Create a heat map showing:
- Metric: Absentee owner concentration
- Area: Miami-Dade County
- Time period: Last 12 months
- Zoom level: ZIP code granularity"
```

### Layer Multiple Heat Maps
```
"Overlay these heat maps:
1. Sales activity (primary)
2. Motivation scores (secondary)
Show where they overlap"
```

## Interpreting Heat Maps

### Reading the Gradient
| Color | Intensity | Meaning |
|-------|-----------|---------|
| Dark Red | Highest | Peak concentration |
| Red | High | Strong activity |
| Orange | Moderate-High | Above average |
| Yellow | Moderate | Average |
| Light Blue | Moderate-Low | Below average |
| Blue | Low | Limited activity |
| Dark Blue | Lowest | Minimal activity |

### Pattern Recognition

**Hot Spots (Concentrated Red):**
- High activity areas
- May indicate competition
- Or strong market demand

**Cold Spots (Blue Areas):**
- Less activity
- Potential opportunity
- Or challenging market

**Gradients (Color Transitions):**
- Market boundaries
- Neighborhood transitions
- Price point changes

## Heat Map Analysis Strategies

### Finding Opportunity Zones

```
"Show me areas where:
- High motivation scores (red)
- But low competition/sales activity (blue)"
```

This reveals underserved areas with motivated sellers.

### Identifying Hot Markets

```
"Find areas with:
- High sales velocity (red)
- Rising prices (red on price trend map)
- Strong permit activity (red)"
```

These are strong flip markets.

### Detecting Emerging Areas

```
"Show areas where:
- Permit activity is increasing (warming)
- But prices are still moderate (yellow/green)
- And owner turnover is rising"
```

These may be gentrifying areas with opportunity.

## Comparative Heat Map Analysis

### Before/After Comparison
```
"Compare heat maps:
- Sales activity last year vs this year
- Show areas that heated up or cooled down"
```

### Multi-Metric Overlay
```
"Create a composite heat map combining:
- 40% weight: Absentee owner density
- 30% weight: High equity concentration
- 30% weight: Long ownership duration"
```

## Heat Map Filtering

### Focus on Specific Criteria
```
"Show heat map only for:
- Single family homes
- Value $150K-$300K
- 3+ bedrooms"
```

### Exclude Areas
```
"Heat map excluding:
- New construction areas
- HOA communities
- Commercial zones"
```

## Actionable Heat Map Workflows

### Market Entry Analysis
```
1. Generate sales activity heat map for county
2. Identify 3-5 hot spot areas
3. Generate motivation heat map for same area
4. Find overlap zones (active + motivated)
5. Drill down into top 3 zones
```

### Lead Prioritization
```
1. Map all leads by location
2. Overlay motivation heat map
3. Properties in hot zones = higher priority
4. Properties in cold zones = lower priority
```

### Driving Route Optimization
```
1. Generate heat map of target properties
2. Identify clusters of hot spots
3. Plan driving route through hot zones
4. Allocate time proportional to heat intensity
```

## Heat Map Export and Reporting

### Export Heat Map
```
"Export this heat map as:
- Image for presentation
- Data for analysis
- Interactive link for sharing"
```

### Include in Reports
```
"Add this heat map to my market report for [area]"
```

### Share with Team
```
"Share this heat map view with my team
with annotation: [your notes]"
```

## Heat Map Tips

### Best Practices
- Use appropriate zoom level for your analysis
- Combine with property markers for detail
- Update regularly as data changes
- Compare time periods for trends

### Common Mistakes
- Too zoomed out = miss neighborhood details
- Too zoomed in = miss patterns
- Single metric only = incomplete picture
- Ignoring gradients = missing transitions

### Performance
- Large areas may take longer to render
- Simpler metrics load faster
- Use filters to reduce data volume

## Sample Heat Map Analyses

### "Where should I focus in Miami?"
```
1. Sales heat map → Shows South Beach, Wynwood hot
2. Motivation heat map → Shows Little Havana, Liberty City high
3. Overlay → Wynwood has both sales AND motivation
4. Action → Target Wynwood for quick deals
```

### "Is this neighborhood improving?"
```
1. Permit heat map (2 years ago) → Cool/moderate
2. Permit heat map (current) → Warming significantly
3. Price trend map → Gradual increase
4. Conclusion → Yes, area is improving
```

## Related Documentation

- [Map-Based Search](map-search-workflow)
- [Drive Time Analysis](drive-time-workflow)
- [Market Research](market-research-workflow)
- [Map Tools Reference](tool-category-map)
