/**
 * Generate Florida ZCTA (ZIP Code Tabulation Areas) GeoJSON
 *
 * This script downloads real ZCTA boundary data from US Census TIGER/Line
 * and filters to Florida zip codes for use in the velocity polygon layer.
 *
 * Data source: Census Bureau TIGER/Line Shapefiles (2020)
 * Using a pre-processed GeoJSON from a public CDN for convenience.
 *
 * Usage: npx tsx scripts/generate-florida-zcta.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Zip codes we need for velocity data (Florida only)
const FLORIDA_ZIP_CODES = new Set([
  // Tampa area
  '33602',
  '33605',
  '33606',
  '33609',
  '33610',
  '33611',
  '33612',
  '33613',
  '33614',
  '33615',
  // Miami area
  '33125',
  '33130',
  '33131',
  '33132',
  '33133',
  // Orlando area
  '32801',
  '32803',
  '32806',
  '32819',
  '32822',
  // Jacksonville area
  '32202',
  '32204',
  '32207',
  '32210',
  '32216',
  // St. Petersburg area
  '33701',
  '33702',
  '33703',
  '33704',
  '33705',
]);

// Friendly names for zip codes
const ZIP_NAMES: Record<string, string> = {
  '33602': 'Tampa Downtown',
  '33605': 'Tampa Ybor City',
  '33606': 'Tampa Hyde Park',
  '33609': 'Tampa Westshore',
  '33610': 'Tampa East',
  '33611': 'Tampa South',
  '33612': 'Tampa North',
  '33613': 'Tampa University',
  '33614': 'Tampa Town N Country',
  '33615': 'Tampa Carrollwood',
  '33125': 'Miami Little Havana',
  '33130': 'Miami Downtown',
  '33131': 'Miami Brickell',
  '33132': 'Miami Arts District',
  '33133': 'Miami Coconut Grove',
  '32801': 'Orlando Downtown',
  '32803': 'Orlando Colonialtown',
  '32806': 'Orlando Delaney Park',
  '32819': 'Orlando Dr. Phillips',
  '32822': 'Orlando Airport',
  '32202': 'Jacksonville Downtown',
  '32204': 'Jacksonville Riverside',
  '32207': 'Jacksonville San Marco',
  '32210': 'Jacksonville Westside',
  '32216': 'Jacksonville Southside',
  '33701': 'St. Petersburg Downtown',
  '33702': 'St. Petersburg Northeast',
  '33703': 'St. Petersburg Snell Isle',
  '33704': 'St. Petersburg Euclid',
  '33705': 'St. Petersburg South',
};

interface ZCTAFeature {
  type: 'Feature';
  properties: {
    ZCTA5CE20?: string;
    ZCTA5CE10?: string;
    GEOID20?: string;
    GEOID10?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: ZCTAFeature[];
}

async function fetchZCTAData(): Promise<GeoJSONCollection> {
  // Using Census Bureau's Cartographic Boundary Files API
  // These are simplified boundaries suitable for visualization
  // Endpoint: https://tigerweb.geo.census.gov/arcgis/rest/services/

  // Alternative: Use a pre-built GeoJSON from OpenDataSoft
  // This contains all US ZCTAs with real boundaries
  const url =
    'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/fl_florida_zip_codes_geo.min.json';

  console.log('Fetching Florida ZCTA boundaries from OpenDataDE...');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ZCTA data: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GeoJSONCollection;
  console.log(`Fetched ${data.features.length} Florida zip code boundaries`);
  return data;
}

function simplifyCoordinates(coords: number[], precision: number = 5): number[] {
  return coords.map((c) => Number(c.toFixed(precision)));
}

function simplifyPolygon(coordinates: number[][][], precision: number = 5): number[][][] {
  return coordinates.map((ring) => ring.map((point) => simplifyCoordinates(point, precision)));
}

function simplifyMultiPolygon(coordinates: number[][][][], precision: number = 5): number[][][][] {
  return coordinates.map((polygon) => simplifyPolygon(polygon, precision));
}

async function generateGeoJSON() {
  const sourceData = await fetchZCTAData();

  // Filter to only Florida zip codes we need and simplify geometry
  const features = sourceData.features
    .filter((feature) => {
      // OpenDataDE uses ZCTA5CE10 property
      const zipCode =
        feature.properties.ZCTA5CE10 ||
        feature.properties.ZCTA5CE20 ||
        feature.properties.GEOID10 ||
        feature.properties.GEOID20 ||
        '';
      return FLORIDA_ZIP_CODES.has(zipCode);
    })
    .map((feature) => {
      const zipCode =
        feature.properties.ZCTA5CE10 ||
        feature.properties.ZCTA5CE20 ||
        feature.properties.GEOID10 ||
        feature.properties.GEOID20 ||
        '';

      // Simplify coordinates to reduce file size
      let simplifiedGeometry;
      if (feature.geometry.type === 'Polygon') {
        simplifiedGeometry = {
          type: 'Polygon' as const,
          coordinates: simplifyPolygon(feature.geometry.coordinates as number[][][]),
        };
      } else {
        simplifiedGeometry = {
          type: 'MultiPolygon' as const,
          coordinates: simplifyMultiPolygon(feature.geometry.coordinates as number[][][][]),
        };
      }

      return {
        type: 'Feature' as const,
        properties: {
          ZCTA5CE20: zipCode,
          NAME: ZIP_NAMES[zipCode] || `ZIP ${zipCode}`,
          STATEFP20: '12', // Florida FIPS code
        },
        geometry: simplifiedGeometry,
      };
    });

  console.log(`Filtered to ${features.length} zip codes matching our velocity data`);

  // If we didn't find all zip codes, log which ones are missing
  const foundZips = new Set(features.map((f) => f.properties.ZCTA5CE20));
  const missingZips = [...FLORIDA_ZIP_CODES].filter((z) => !foundZips.has(z));
  if (missingZips.length > 0) {
    console.log(`Missing zip codes (not in source data): ${missingZips.join(', ')}`);
  }

  const geojson = {
    type: 'FeatureCollection' as const,
    name: 'Florida_ZCTA_RealBoundaries',
    features,
  };

  return geojson;
}

// Main execution
(async () => {
  try {
    const geojson = await generateGeoJSON();
    const outputPath = path.join(process.cwd(), 'public/geo/florida-zcta.json');
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
    console.log(`Generated ${geojson.features.length} zip code polygons with real boundaries`);
    console.log(`Saved to: ${outputPath}`);

    // Log file size
    const stats = fs.statSync(outputPath);
    console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } catch (error) {
    console.error('Error generating ZCTA GeoJSON:', error);
    process.exit(1);
  }
})();
