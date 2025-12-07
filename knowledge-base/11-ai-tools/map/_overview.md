---
slug: tool-category-map
title: "Map & Geographic Tools - Complete Reference"
category: AI Tools
subcategory: Geographic Analysis
tags: [tool-census, tool-geography, tool-geocode, tool-block_group, tool-tract, tool-micro-territory, tool-map, data-census, tool-boundary, tool-polygon]
related_docs: [census-overview, heat-map-workflow]
difficulty_level: beginner
---
# Map & Geographic Tools

## Overview

Tools for map-based analysis, heat mapping, and geographic intelligence.

**Total Tools**: 11

## Available Tools


### Get Census Geography

**ID**: `census.get_geography`

Retrieve Census geographic identifiers (Block Group, Tract, County, State) for a property based on coordinates. Use this when you need to identify a property


### Get Census Boundary Polygon

**ID**: `census.get_boundary_polygon`

Retrieve the GeoJSON polygon boundary for a Census geography to display on a map. Requires a GEOID from get_census_geography. Use this when the user asks to 


### Classify Comp Geography

**ID**: `census.classify_comp_geography`

Determine the geographic relationship between a subject property and a comparable property. Returns a tier (excellent/good/acceptable/marginal) and explanation. Use this when the user asks 


### Batch Geocode Comps

**ID**: `census.batch_geocode_comps`

Geocode multiple comparable properties to their Census geographies in a single operation. Use this when analyzing multiple comps, after receiving comps from RentCast valuation API, or when the user asks to 


### Get Census Boundary by Point

**ID**: `census.get_boundary_by_point`

Retrieve Census boundary polygon(s) that contain a specific point. This is a convenience tool that combines geocoding and boundary retrieval in one step. Use when you have coordinates and want to immediately visualize the surrounding Census geography.


### Draw Search Area

**ID**: `map.draw_search_area`

Create a search area on the map by defining a center point and radius, or drawing a polygon. Returns the bounds and property count within the area.


### Compare Areas

**ID**: `map.compare_areas`

Compare multiple geographic areas based on real estate metrics like average price, days on market, inventory levels, and appreciation rates.


### Show Commute Time

**ID**: `map.show_commute_time`

Display isochrone (travel time) polygons on the map showing areas reachable within a specified time using Mapbox Isochrone API.


### Toggle Map Style

**ID**: `map.toggle_style`

Switch between different map visual styles: streets, satellite, satellite-streets, light, or dark mode.


### Spatial Query

**ID**: `map.spatial_query`

Query points of interest (POIs) near a location using Mapbox Tilequery API. Find schools, restaurants, shops, and other amenities.


### Compare Neighborhoods

**ID**: `map.compare_neighborhoods`

Compare multiple neighborhoods based on livability factors like schools, walkability, transit access, and amenities using POI density analysis.


## Common Use Cases

- Create heat maps
- Analyze areas
- Route planning

## Related Documentation

- [census-overview](census-overview)
- [heat-map-workflow](heat-map-workflow)
