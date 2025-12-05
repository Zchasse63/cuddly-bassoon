/**
 * Property Detail API Route
 *
 * GET /api/properties/[id] - Get property details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PropertyService } from '@/lib/properties/property-service';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const propertyService = new PropertyService(supabase);
    const property = await propertyService.getProperty(id, user.id);

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get related deals
    const relatedDeals = await propertyService.getRelatedDeals(id, user.id);

    return NextResponse.json({
      property,
      relatedDeals,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}
