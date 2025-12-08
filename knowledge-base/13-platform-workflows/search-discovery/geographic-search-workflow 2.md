---
slug: geographic-search-workflow
title: "Geographic Search - Map-Based Property Discovery"
category: Platform Workflows
subcategory: Search & Discovery
tags: [workflow-search, workflow-map, tool-map, tool-property-search, action-search]
related_docs: [map-search-workflow, heat-map-workflow, drive-time-workflow]
difficulty_level: intermediate
---

# Geographic Search Workflow

## Overview

Use geographic and map-based tools to discover properties by location, visualize market data, and identify investment opportunities within specific areas.

## Basic Geographic Searches

### Search by City
```
"Find investment properties in Tampa, FL"
"Show absentee owner properties in Phoenix"
```

### Search by ZIP Code
```
"Search ZIP code 33139 for high-equity properties"
"Find properties in 30318 and 30309"
```

### Search by County
```
"Find properties in Miami-Dade County"
"Search Harris County, TX for absentee owners"
```

### Search by Address Radius
```
"Find properties within 1 mile of 123 Main St, Miami"
"Show all absentee properties within 3 miles of downtown Tampa"
```

## Map-Based Discovery

### Drawing Search Areas

**Draw a polygon:**
```
"Draw a search area on the map around the Wynwood neighborhood"
"Let me draw a custom boundary for my search"
```

**Rectangle selection:**
```
"Search this rectangular area for properties"
"Find properties within these map bounds"
```

### Point-and-Click Search
```
"Search around this location on the map"
"Find properties near where I clicked"
```

## Drive Time Analysis (Isochrones)

### Basic Drive Time Search
```
"Find properties within a 15-minute drive of [address]"
"Show all absentee properties within 20 minutes of downtown"
```

### Commute-Based Search
```
"Find properties within 30 minutes drive of [workplace address]
during morning rush hour"
```

### Multi-Point Drive Time
```
"Find properties within 20 minutes of both downtown and the airport"
```

### Drive Time Factors
| Time | Typical Radius |
|------|----------------|
| 5 min | 1-3 miles (urban) |
| 10 min | 3-5 miles |
| 15 min | 5-8 miles |
| 20 min | 8-12 miles |
| 30 min | 15-25 miles |

Note: Actual distances vary by traffic, road types, and time of day.

## Heat Map Visualization

### Market Activity Heat Maps
```
"Show a heat map of recent sales in [area]"
"Visualize price trends on the map"
```

### Motivation Heat Maps
```
"Show concentration of absentee owners on the map"
"Heat map of high-equity properties"
```

### Permit Activity Heat Maps
```
"Show areas with high renovation activity"
"Visualize permit density on the map"
```

### Interpreting Heat Maps
| Color | Meaning | Strategy |
|-------|---------|----------|
| Hot (Red) | High activity/concentration | More competition, faster market |
| Warm (Yellow) | Moderate activity | Balanced opportunity |
| Cool (Blue) | Low activity | Less competition, slower market |

## Multi-Location Searches

### Compare Neighborhoods
```
"Compare properties in Wynwood vs Little Havana vs Coconut Grove"
"Show side-by-side analysis of these three ZIP codes"
```

### Batch ZIP Code Search
```
"Search these ZIP codes: 33139, 33140, 33141, 33142
for absentee owners with high equity"
```

### Regional Sweep
```
"Search all ZIP codes within Miami-Dade County
for properties matching my buyer's criteria"
```

## Layered Geographic Analysis

### Stack Multiple Layers
```
"Show me:
1. All absentee owner properties (markers)
2. Recent sales heat map (overlay)
3. Permit activity heat map (second overlay)
in the Wynwood area"
```

### Filter by Layer
```
"From the map, filter to show only properties where:
- Located in the high-activity zone
- Absentee owner
- Under $300,000"
```

## Neighborhood Boundary Searches

### Official Neighborhoods
```
"Search the Midtown neighborhood of Atlanta"
"Find properties in Boston's South End"
```

### School District Search
```
"Find properties in the [school district] boundaries"
"Search areas zoned for [specific school]"
```

### Custom Boundary Definition
```
"Define a search area bounded by:
- North: 36th Street
- South: 20th Street
- East: Biscayne Blvd
- West: I-95"
```

## Distance and Proximity Filters

### Distance from Point
```
"Find properties within 0.5 miles of [metro station]"
"Show properties within 1 mile of [shopping center]"
```

### Distance from Multiple Points
```
"Find properties within 1 mile of any of these locations:
[address 1], [address 2], [address 3]"
```

### Exclude by Distance
```
"Find properties in [ZIP] but more than 0.5 miles from the highway"
```

## Market Boundary Analysis

### ZIP Code Statistics
```
"Show statistics for each ZIP code in my search:
- Median price
- Days on market
- Inventory level
- Price trend"
```

### Boundary Comparison
```
"Compare the market metrics across these neighborhoods:
[list neighborhoods]"
```

## Practical Geographic Strategies

### The Expansion Strategy
Start tight, expand outward:
```
1. Search 0.5 mile radius → Review results
2. Expand to 1 mile → Review new results
3. Expand to 2 miles → Review new results
4. Continue until you have enough leads
```

### The Segmentation Strategy
Divide and conquer:
```
1. Get all properties in county
2. Segment by ZIP code
3. Analyze each ZIP separately
4. Prioritize best-performing ZIPs
```

### The Hot Spot Strategy
Find active areas:
```
1. Generate sales heat map
2. Identify hot spots
3. Search hot spots for motivation indicators
4. Target high-activity + high-motivation intersection
```

## Tips for Geographic Searches

### Performance
- Smaller areas search faster
- Add non-geographic filters to reduce results
- Use saved map views for repeat searches

### Accuracy
- Verify addresses fall within intended area
- Check boundary edges for misses
- Consider properties just outside your boundary

### Market Coverage
- Don't over-focus on one area
- Search multiple neighborhoods
- Include emerging areas, not just established

## Related Documentation

- [Map-Based Search](map-search-workflow)
- [Heat Map Analysis](heat-map-workflow)
- [Drive Time Analysis](drive-time-workflow)
- [Map Tools Reference](tool-category-map)
