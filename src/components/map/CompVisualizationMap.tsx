'use client';

/**
 * CompVisualizationMap Component
 * Displays subject property with Census boundary polygons and scored comparables
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import Map, {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  MapRef,
} from 'react-map-gl/mapbox';
import { Star, Home, MapPin } from 'lucide-react';
import { MAPBOX_TOKEN, MAP_CONFIG } from '@/lib/map/config';
import {
  SubjectProperty,
  ScoredComparable,
  CompTier,
  CensusBoundaryFeature,
  COMP_TIER_COLORS,
  BOUNDARY_STYLES,
} from '@/types/comp-selection';

// ============================================
// Types
// ============================================

interface CompVisualizationMapProps {
  subject: SubjectProperty;
  comps: ScoredComparable[];
  blockGroupPolygon?: CensusBoundaryFeature | null;
  tractPolygon?: CensusBoundaryFeature | null;
  className?: string;
  height?: string | number;
  showLegend?: boolean;
  onCompClick?: (comp: ScoredComparable) => void;
  onSubjectClick?: () => void;
}

interface SelectedMarker {
  type: 'subject' | 'comp';
  data: SubjectProperty | ScoredComparable;
}

// ============================================
// Helper Functions
// ============================================

function getCompMarkerColor(tier: CompTier): string {
  return COMP_TIER_COLORS[tier];
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  }
  return `$${(price / 1000).toFixed(0)}K`;
}

function calculateBounds(
  subject: SubjectProperty,
  comps: ScoredComparable[]
): [[number, number], [number, number]] {
  const lngs = [subject.longitude, ...comps.map((c) => c.longitude)];
  const lats = [subject.latitude, ...comps.map((c) => c.latitude)];

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Add padding
  const lngPadding = (maxLng - minLng) * 0.15 || 0.01;
  const latPadding = (maxLat - minLat) * 0.15 || 0.01;

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ];
}

// ============================================
// Main Component
// ============================================

export function CompVisualizationMap({
  subject,
  comps,
  blockGroupPolygon,
  tractPolygon,
  className,
  height = 500,
  showLegend = true,
  onCompClick,
  onSubjectClick,
}: CompVisualizationMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Calculate initial bounds to fit all markers
  const bounds = calculateBounds(subject, comps);

  // Fit bounds on load
  const handleLoad = useCallback(() => {
    setMapLoaded(true);
    if (mapRef.current && comps.length > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [bounds, comps.length]);

  // Update bounds when data changes
  useEffect(() => {
    if (mapRef.current && mapLoaded && comps.length > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 500,
      });
    }
  }, [subject.id, comps.length, mapLoaded, bounds]);

  const handleSubjectClick = useCallback(() => {
    setSelectedMarker({ type: 'subject', data: subject });
    onSubjectClick?.();
  }, [subject, onSubjectClick]);

  const handleCompClick = useCallback(
    (comp: ScoredComparable) => {
      setSelectedMarker({ type: 'comp', data: comp });
      onCompClick?.(comp);
    },
    [onCompClick]
  );

  const handleClosePopup = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-muted-foreground">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: subject.longitude,
          latitude: subject.latitude,
          zoom: MAP_CONFIG.zoom.neighborhood,
        }}
        onLoad={handleLoad}
        mapStyle={MAP_CONFIG.styles.light}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Census Tract boundary (outer, lighter) */}
        {tractPolygon && (
          <Source
            id="tract-boundary"
            type="geojson"
            data={tractPolygon as unknown as GeoJSON.Feature}
          >
            <Layer
              id="tract-fill"
              type="fill"
              paint={{
                'fill-color': BOUNDARY_STYLES.tract.fillColor,
                'fill-opacity': BOUNDARY_STYLES.tract.fillOpacity,
              }}
            />
            <Layer
              id="tract-outline"
              type="line"
              paint={{
                'line-color': BOUNDARY_STYLES.tract.lineColor,
                'line-width': BOUNDARY_STYLES.tract.lineWidth,
                'line-dasharray': BOUNDARY_STYLES.tract.lineDasharray,
              }}
            />
          </Source>
        )}

        {/* Census Block Group boundary (inner, highlighted) */}
        {blockGroupPolygon && (
          <Source
            id="block-group-boundary"
            type="geojson"
            data={blockGroupPolygon as unknown as GeoJSON.Feature}
          >
            <Layer
              id="block-group-fill"
              type="fill"
              paint={{
                'fill-color': BOUNDARY_STYLES.blockGroup.fillColor,
                'fill-opacity': BOUNDARY_STYLES.blockGroup.fillOpacity,
              }}
            />
            <Layer
              id="block-group-outline"
              type="line"
              paint={{
                'line-color': BOUNDARY_STYLES.blockGroup.lineColor,
                'line-width': BOUNDARY_STYLES.blockGroup.lineWidth,
              }}
            />
          </Source>
        )}

        {/* Comp markers */}
        {comps.map((comp) => (
          <Marker
            key={comp.id}
            longitude={comp.longitude}
            latitude={comp.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleCompClick(comp);
            }}
          >
            <div
              className="cursor-pointer hover:scale-110 transition-transform"
              title={`Comp #${comp.rank}: ${comp.tier}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                style={{ backgroundColor: getCompMarkerColor(comp.tier) }}
              >
                <span className="text-white text-xs font-bold">{comp.rank}</span>
              </div>
            </div>
          </Marker>
        ))}

        {/* Subject property marker (star - rendered last to be on top) */}
        <Marker
          longitude={subject.longitude}
          latitude={subject.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleSubjectClick();
          }}
        >
          <div
            className="cursor-pointer hover:scale-110 transition-transform"
            title="Subject Property"
          >
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-white">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
        </Marker>

        {/* Popup for selected marker */}
        {selectedMarker && (
          <Popup
            longitude={
              selectedMarker.type === 'subject'
                ? (selectedMarker.data as SubjectProperty).longitude
                : (selectedMarker.data as ScoredComparable).longitude
            }
            latitude={
              selectedMarker.type === 'subject'
                ? (selectedMarker.data as SubjectProperty).latitude
                : (selectedMarker.data as ScoredComparable).latitude
            }
            anchor="bottom"
            offset={[0, -40]}
            onClose={handleClosePopup}
            closeOnClick={false}
            className="comp-map-popup"
          >
            {selectedMarker.type === 'subject' ? (
              <SubjectPopupContent subject={selectedMarker.data as SubjectProperty} />
            ) : (
              <CompPopupContent comp={selectedMarker.data as ScoredComparable} />
            )}
          </Popup>
        )}
      </Map>

      {/* Legend */}
      {showLegend && <CompMapLegend />}
    </div>
  );
}

// ============================================
// Popup Content Components
// ============================================

function SubjectPopupContent({ subject }: { subject: SubjectProperty }) {
  return (
    <div className="p-2 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 text-red-500 fill-red-500" />
        <span className="font-semibold text-sm">Subject Property</span>
      </div>
      <p className="text-xs text-gray-600 mb-1">{subject.address}</p>
      {subject.squareFootage && (
        <p className="text-xs text-gray-500">{subject.squareFootage.toLocaleString()} sqft</p>
      )}
      {subject.bedrooms !== undefined && subject.bathrooms !== undefined && (
        <p className="text-xs text-gray-500">
          {subject.bedrooms} bed / {subject.bathrooms} bath
        </p>
      )}
      {subject.blockGroupGeoid && (
        <p className="text-xs text-gray-400 mt-1">Block Group: {subject.blockGroupGeoid}</p>
      )}
    </div>
  );
}

function CompPopupContent({ comp }: { comp: ScoredComparable }) {
  return (
    <div className="p-2 min-w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4" style={{ color: getCompMarkerColor(comp.tier) }} />
          <span className="font-semibold text-sm">Comp #{comp.rank}</span>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full text-white capitalize"
          style={{ backgroundColor: getCompMarkerColor(comp.tier) }}
        >
          {comp.tier}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-1">{comp.formattedAddress}</p>

      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold">{formatPrice(comp.price)}</span>
        {comp.squareFootage && (
          <span className="text-xs text-gray-500">{comp.squareFootage.toLocaleString()} sqft</span>
        )}
      </div>

      {comp.bedrooms !== undefined && comp.bathrooms !== undefined && (
        <p className="text-xs text-gray-500 mb-1">
          {comp.bedrooms} bed / {comp.bathrooms} bath
        </p>
      )}

      <div className="border-t pt-1 mt-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Score:</span>
          <span className="font-medium">{(comp.score * 100).toFixed(0)}%</span>
        </div>
        {comp.distance !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Distance:</span>
            <span>{comp.distance.toFixed(2)} mi</span>
          </div>
        )}
        {comp.saleDate && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Sale Date:</span>
            <span>{new Date(comp.saleDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Match details */}
      <div className="border-t pt-1 mt-1 space-y-0.5">
        {comp.matchDetails.sameBlockGroup && (
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <MapPin className="w-3 h-3" />
            <span>Same Block Group</span>
          </div>
        )}
        {!comp.matchDetails.sameBlockGroup && comp.matchDetails.sameTract && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <MapPin className="w-3 h-3" />
            <span>Same Census Tract</span>
          </div>
        )}
        {comp.matchDetails.sameSubdivision && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Home className="w-3 h-3" />
            <span>Same Subdivision</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Legend Component
// ============================================

function CompMapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm z-10">
      <div className="font-semibold mb-2">Comp Quality</div>

      {/* Tier legend */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COMP_TIER_COLORS.excellent }}
          />
          <span className="text-xs">Excellent (Same BG + Subdivision)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COMP_TIER_COLORS.good }}
          />
          <span className="text-xs">Good (Same BG or Tract + Subdivision)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COMP_TIER_COLORS.acceptable }}
          />
          <span className="text-xs">Acceptable (Same Tract)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COMP_TIER_COLORS.marginal }}
          />
          <span className="text-xs">Marginal (Different Tract)</span>
        </div>
      </div>

      {/* Boundary legend */}
      <div className="border-t pt-2 space-y-1">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-1 rounded"
            style={{ backgroundColor: BOUNDARY_STYLES.blockGroup.lineColor }}
          />
          <span className="text-xs">Block Group</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-0.5 rounded border-dashed border"
            style={{ borderColor: BOUNDARY_STYLES.tract.lineColor }}
          />
          <span className="text-xs">Census Tract</span>
        </div>
      </div>

      {/* Subject marker */}
      <div className="border-t pt-2 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
            <Star className="w-2 h-2 text-white fill-white" />
          </div>
          <span className="text-xs">Subject Property</span>
        </div>
      </div>
    </div>
  );
}

export default CompVisualizationMap;
