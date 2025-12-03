/**
 * Leads API Routes
 * GET /api/leads - List leads with filters
 * POST /api/leads - Create a new lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeadService, createLeadSchema, leadListFiltersSchema } from '@/lib/crm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = leadListFiltersSchema.parse({
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      min_motivation: searchParams.get('min_motivation')
        ? Number(searchParams.get('min_motivation'))
        : undefined,
      max_motivation: searchParams.get('max_motivation')
        ? Number(searchParams.get('max_motivation'))
        : undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 25,
    });

    const service = new LeadService(supabase);
    const { leads, total } = await service.listLeads(user.id, filters, filters.page, filters.limit);

    return NextResponse.json({
      leads,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    console.error('Error listing leads:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list leads' },
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
    const input = createLeadSchema.parse(body);

    const service = new LeadService(supabase);
    const lead = await service.createLead(user.id, input);

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lead' },
      { status: 500 }
    );
  }
}
