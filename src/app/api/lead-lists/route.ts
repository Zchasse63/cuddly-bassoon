/**
 * Lead Lists API Routes
 * GET /api/lead-lists - List all lead lists
 * POST /api/lead-lists - Create a new lead list
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLeadListSchema } from '@/lib/crm';
import type { Json } from '@/types/database';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: lists, error } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list lead lists: ${error.message}`);
    }

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Error listing lead lists:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list lead lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = createLeadListSchema.parse(body);

    const { data, error } = await supabase
      .from('lead_lists')
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description,
        list_type: input.list_type,
        filter_criteria: input.filter_criteria as Json,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead list: ${error.message}`);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating lead list:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lead list' },
      { status: 500 }
    );
  }
}
