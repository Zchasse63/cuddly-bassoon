/**
 * Global Search API
 *
 * Searches across properties, deals, and buyers for command palette
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: unknown[] = [];

    // Search properties
    if (type === 'all' || type === 'properties') {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, address, city, state, zip, estimated_value')
        .or(`address.ilike.%${query}%,city.ilike.%${query}%,owner_name.ilike.%${query}%`)
        .limit(limit);

      if (properties) {
        results.push(
          ...properties.map((p) => ({
            ...p,
            _type: 'property',
          }))
        );
      }
    }

    // Search deals
    if (type === 'all' || type === 'deals') {
      const { data: deals } = await supabase
        .from('deals')
        .select('id, property_address, stage, status, seller_name')
        .eq('user_id', user.id)
        .or(`property_address.ilike.%${query}%,seller_name.ilike.%${query}%`)
        .limit(limit);

      if (deals) {
        results.push(
          ...deals.map((d) => ({
            ...d,
            _type: 'deal',
          }))
        );
      }
    }

    // Search buyers
    if (type === 'all' || type === 'buyers') {
      const { data: buyers } = await supabase
        .from('buyers')
        .select('id, name, company_name, email, phone, tier, status')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,company_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (buyers) {
        results.push(
          ...buyers.map((b) => ({
            ...b,
            _type: 'buyer',
          }))
        );
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
