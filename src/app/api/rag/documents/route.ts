/**
 * RAG Documents API Endpoint
 * List and filter knowledge base documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = getSupabaseClient();

    let query = supabase
      .from('documents')
      .select('id, slug, title, category, tags, difficulty_level, created_at', { count: 'exact' })
      .eq('is_active', true)
      .order('category')
      .order('title')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    // Get unique categories for filtering
    const { data: categories } = await supabase
      .from('documents')
      .select('category')
      .eq('is_active', true);

    const uniqueCategories = [...new Set(categories?.map(c => c.category).filter(Boolean))].sort();

    return NextResponse.json({
      documents: data || [],
      total: count || 0,
      limit,
      offset,
      categories: uniqueCategories,
    });
  } catch (error) {
    console.error('Documents API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

