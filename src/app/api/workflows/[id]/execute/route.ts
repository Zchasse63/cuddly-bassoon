/**
 * Workflow Execute API Route
 * POST /api/workflows/[id]/execute - Manually execute a workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkflowEngine } from '@/lib/automation/workflow-engine';
import { WorkflowExecutor } from '@/lib/automation/workflow-executor';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { trigger_data } = body;

    // Get workflow
    const engine = new WorkflowEngine(supabase);
    const workflow = await engine.getWorkflow(user.id, id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (!workflow.is_active) {
      return NextResponse.json({ error: 'Workflow is not active' }, { status: 400 });
    }

    // Execute workflow
    const executor = new WorkflowExecutor(supabase);
    const result = await executor.executeWorkflow(user.id, workflow, trigger_data || {});

    return NextResponse.json({
      success: result.success,
      execution_id: result.executionId,
      error: result.error,
    });
  } catch (error) {
    console.error('[API] Workflow execute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
