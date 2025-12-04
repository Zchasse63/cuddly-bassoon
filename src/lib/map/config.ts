/**
 * Map Configuration
 * Central configuration for Mapbox GL and map components
 */

export const MAP_CONFIG = {
  // Default map center (US)
  defaultCenter: {
    longitude: -98.5795,
    latitude: 39.8283,
  },

  // Default zoom levels
  zoom: {
    default: 4,
    state: 6,
    city: 10,
    neighborhood: 13,
    property: 16,
    max: 20,
    min: 2,
  },

  // Clustering - optimized for performance
  clustering: {
    enabled: true,
    radius: 60,           // Slightly larger for better grouping
    maxZoom: 14,
    minPoints: 2,
    extent: 512,          // Tile extent for clustering
    nodeSize: 64,         // Size of the KD-tree leaf node
  },

  // Map styles
  styles: {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  },

  // Default style
  style: 'mapbox://styles/mapbox/light-v11',

  // Performance optimizations
  performance: {
    maxProperties: 5000,
    debounceMs: 300,
    // Dynamic loading thresholds
    loadingThresholds: {
      immediate: 100,     // Load immediately if under this count
      chunked: 1000,      // Load in chunks if under this count
      paginated: 5000,    // Paginate if over this count
    },
    // Tile caching
    tileCache: {
      maxSize: 100,       // Max tiles to cache
      ttl: 300000,        // 5 minutes TTL
    },
  },

  // Data-driven styling expressions
  expressions: {
    // Price-based marker sizing
    priceSize: [
      'interpolate', ['linear'], ['get', 'price'],
      0, 8,
      100000, 10,
      250000, 14,
      500000, 18,
      1000000, 24,
    ],
    // Motivation score color gradient
    motivationColor: [
      'interpolate', ['linear'], ['get', 'motivationScore'],
      0, '#22c55e',    // Green - low motivation
      50, '#eab308',   // Yellow - medium
      100, '#ef4444',  // Red - high motivation
    ],
    // Days on market opacity
    domOpacity: [
      'interpolate', ['linear'], ['get', 'daysOnMarket'],
      0, 0.4,
      30, 0.6,
      90, 0.8,
      180, 1.0,
    ],
  },

  // Route styling
  routeStyles: {
    default: {
      lineColor: '#3b82f6',
      lineWidth: 4,
      lineBorderColor: '#1e40af',
      lineBorderWidth: 1,
    },
    walking: {
      lineColor: '#22c55e',
      lineWidth: 3,
      lineDasharray: [2, 2],
    },
    driving: {
      lineColor: '#3b82f6',
      lineWidth: 4,
    },
  },

  // Legacy - kept for backwards compatibility
  maxProperties: 5000,
  debounceMs: 300,
} as const;

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export type MapStyle = keyof typeof MAP_CONFIG.styles;

