/**
 * Mapbox API Mocks
 * Mock responses for Mapbox geocoding, isochrone, and tilequery APIs
 */

import { vi } from 'vitest';

export const mockGeocodingResponse = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'place.123',
      type: 'Feature',
      place_type: ['place'],
      relevance: 1,
      properties: { accuracy: 'rooftop' },
      text: 'Miami',
      place_name: 'Miami, Florida, United States',
      center: [-80.1918, 25.7617],
      geometry: { type: 'Point', coordinates: [-80.1918, 25.7617] },
      context: [
        { id: 'region.456', text: 'Florida' },
        { id: 'country.789', text: 'United States' },
      ],
    },
  ],
};

export const mockIsochroneResponse = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { contour: 15, metric: 'time' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-80.25, 25.70],
          [-80.15, 25.70],
          [-80.15, 25.82],
          [-80.25, 25.82],
          [-80.25, 25.70],
        ]],
      },
    },
  ],
};

export const mockTilequeryResponse = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-80.1920, 25.7620] },
      properties: { name: 'Local Restaurant', category_en: 'restaurant' },
      tilequery: { distance: 150, layer: 'poi_label' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-80.1900, 25.7600] },
      properties: { name: 'Coffee Shop', category_en: 'cafe' },
      tilequery: { distance: 200, layer: 'poi_label' },
    },
  ],
};

export const mockReverseGeocodingResponse = {
  type: 'FeatureCollection',
  features: [
    {
      id: 'address.123',
      type: 'Feature',
      place_type: ['address'],
      relevance: 1,
      properties: {},
      text: '123 Main Street',
      place_name: '123 Main Street, Miami, Florida 33101, United States',
      center: [-80.1918, 25.7617],
      geometry: { type: 'Point', coordinates: [-80.1918, 25.7617] },
    },
  ],
};

/**
 * Mock fetch for Mapbox APIs
 */
export function mockMapboxApis() {
  return vi.fn().mockImplementation((url: string) => {
    const urlStr = url.toString();
    
    if (urlStr.includes('api.mapbox.com/geocoding')) {
      if (urlStr.includes('reverse')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReverseGeocodingResponse),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse),
      });
    }
    
    if (urlStr.includes('api.mapbox.com/isochrone')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockIsochroneResponse),
      });
    }
    
    if (urlStr.includes('api.mapbox.com/v4') && urlStr.includes('tilequery')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTilequeryResponse),
      });
    }
    
    // Default: pass through or error
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    });
  });
}

/**
 * Create a custom isochrone response
 */
export function createIsochroneResponse(minutes: number, coordinates: number[][]) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { contour: minutes, metric: 'time' },
        geometry: { type: 'Polygon', coordinates: [coordinates] },
      },
    ],
  };
}

/**
 * Create a custom POI response
 */
export function createPOIResponse(pois: Array<{
  name: string;
  category: string;
  lat: number;
  lng: number;
  distance: number;
}>) {
  return {
    type: 'FeatureCollection',
    features: pois.map(poi => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [poi.lng, poi.lat] },
      properties: { name: poi.name, category_en: poi.category },
      tilequery: { distance: poi.distance, layer: 'poi_label' },
    })),
  };
}

