/**
 * Census Geocode API Route
 * GET /api/census/geocode - Geocode coordinates to Census geography
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCensusGeography, batchCensusGeocode } from '@/lib/census/geocoder';

// ============================================
// Request Validation
// ============================================

const SingleGeocodeSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

const BatchGeocodeSchema = z.object({
  coordinates: z
    .array(
      z.object({
        id: z.string(),
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
      })
    )
    .max(100), // Limit batch size
});

// ============================================
// GET - Single coordinate geocode
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {
      latitude: searchParams.get('latitude') || searchParams.get('lat'),
      longitude: searchParams.get('longitude') || searchParams.get('lng'),
    };

    // Validate parameters
    const parsed = SingleGeocodeSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { latitude, longitude } = parsed.data;

    // Get Census geography
    const geography = await getCensusGeography(latitude, longitude);

    if (!geography) {
      return NextResponse.json(
        {
          error: 'No Census geography found for coordinates',
          details:
            'The coordinates may be outside the US, in water, or in an area without Census data',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        coordinates: { latitude, longitude },
        geography,
      },
    });
  } catch (error) {
    console.error('Census geocode error:', error);
    return NextResponse.json(
      {
        error: 'Failed to geocode coordinates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Batch geocode multiple coordinates
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate body
    const parsed = BatchGeocodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { coordinates } = parsed.data;

    if (coordinates.length === 0) {
      return NextResponse.json(
        {
          error: 'No coordinates provided',
        },
        { status: 400 }
      );
    }

    // Transform coordinates for batch geocoding
    const coordsForGeocode = coordinates.map((c) => ({
      id: c.id,
      lat: c.latitude,
      lng: c.longitude,
    }));

    // Batch geocode
    const { results, errors } = await batchCensusGeocode(coordsForGeocode);

    // Transform results to JSON-serializable format
    const resultsObj: Record<string, unknown> = {};
    results.forEach((value, key) => {
      resultsObj[key] = value;
    });

    return NextResponse.json({
      success: true,
      data: {
        total: coordinates.length,
        successful: results.size,
        failed: errors.length,
        results: resultsObj,
        errors,
      },
    });
  } catch (error) {
    console.error('Census batch geocode error:', error);
    return NextResponse.json(
      {
        error: 'Failed to batch geocode coordinates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
