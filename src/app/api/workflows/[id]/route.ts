/**
 * Workflow Detail API Routes
 * GET /api/workflows/[id] - Get workflow
 * PATCH /api/workflows/[id] - Update workflow
 * DELETE /api/workflows/[id] - Delete workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkflowEngine } from '@/lib/automation/workflow-engine';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const engine = new WorkflowEngine(supabase);
    const workflow = await engine.getWorkflow(user.id, id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('[API] Workflow get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const engine = new WorkflowEngine(supabase);

    const result = await engine.updateWorkflow(user.id, id, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ workflow: result.data });
  } catch (error) {
    console.error('[API] Workflow update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const engine = new WorkflowEngine(supabase);
    const success = await engine.deleteWorkflow(user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Workflow delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
