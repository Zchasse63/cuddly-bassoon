/**
 * Template Preview API Route
 * POST /api/templates/[id]/preview - Preview template with variables
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TemplateService } from '@/lib/communication/templates';
import { checkSensitivity } from '@/lib/communication/sensitivity-filter';

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
    const { variables } = body;

    const templateService = new TemplateService(supabase);
    const template = await templateService.getTemplate(user.id, id);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Validate variables
    const validation = templateService.validateVariables(template, variables || {});

    // Preview with provided or sample data
    const preview = templateService.previewTemplate(template, variables);

    // Check sensitivity of rendered content
    const sensitivityCheck = checkSensitivity(preview.body);

    return NextResponse.json({
      preview,
      validation,
      sensitivity: sensitivityCheck,
      variables_required: template.variables,
    });
  } catch (error) {
    console.error('[API] Template preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
