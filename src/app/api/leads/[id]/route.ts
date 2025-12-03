/**
 * Lead Detail API Routes
 * GET /api/leads/[id] - Get lead details
 * PATCH /api/leads/[id] - Update lead
 * DELETE /api/leads/[id] - Delete lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LeadService, updateLeadSchema, createContactHistorySchema } from '@/lib/crm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new LeadService(supabase);
    const lead = await service.getLead(id, user.id);

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error getting lead:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = updateLeadSchema.parse(body);

    const service = new LeadService(supabase);
    const lead = await service.updateLead(id, user.id, input);

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('leads').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete lead: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

// POST /api/leads/[id]/contact - Log contact with lead
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = createContactHistorySchema.parse(body);

    const service = new LeadService(supabase);
    const contact = await service.logContact(id, user.id, input);

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error logging contact:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to log contact' },
      { status: 500 }
    );
  }
}
