/**
 * Workflow Executions API Route
 * GET /api/workflows/[id]/executions - Get workflow execution history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { WorkflowEngine } from '@/lib/automation/workflow-engine';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Verify workflow belongs to user
    const engine = new WorkflowEngine(supabase);
    const workflow = await engine.getWorkflow(user.id, id);

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Get executions
    const executions = await engine.getExecutionHistory(id, limit);

    return NextResponse.json({ executions });
  } catch (error) {
    console.error('[API] Workflow executions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
