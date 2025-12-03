/**
 * Workflows API Routes
 * GET /api/workflows - List workflows
 * POST /api/workflows - Create workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkflowEngine } from '@/lib/automation/workflow-engine';
import { Workflow } from '@/lib/communication/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('active');
    const trigger_type = searchParams.get('trigger_type') as Workflow['trigger_type'] | null;

    const engine = new WorkflowEngine(supabase);
    const workflows = await engine.listWorkflows(user.id, {
      is_active: is_active ? is_active === 'true' : undefined,
      trigger_type: trigger_type || undefined,
    });

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('[API] Workflows list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger_type, trigger_config, conditions, actions, is_active } =
      body;

    // Validate required fields
    if (!name || !trigger_type || !actions || actions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, trigger_type, actions' },
        { status: 400 }
      );
    }

    const engine = new WorkflowEngine(supabase);
    const result = await engine.createWorkflow(user.id, {
      name,
      description,
      trigger_type,
      trigger_config,
      conditions,
      actions,
      is_active,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ workflow: result.data }, { status: 201 });
  } catch (error) {
    console.error('[API] Workflow create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
