/**
 * Templates API Routes
 * GET /api/templates - List templates
 * POST /api/templates - Create template
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TemplateService } from '@/lib/communication/templates';
import { MessageChannel, TemplateType, SensitivityLevel } from '@/lib/communication/types';

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
    const channel = searchParams.get('channel') as MessageChannel | null;
    const category = searchParams.get('category');
    const template_type = searchParams.get('type') as TemplateType | null;
    const is_active = searchParams.get('active');
    const search = searchParams.get('search');

    const templateService = new TemplateService(supabase);
    const templates = await templateService.listTemplates(user.id, {
      channel: channel || undefined,
      category: category || undefined,
      template_type: template_type || undefined,
      is_active: is_active ? is_active === 'true' : undefined,
      search: search || undefined,
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('[API] Templates list error:', error);
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
    const {
      name,
      category,
      channel,
      template_type,
      subject_template,
      body_template,
      sensitivity_level,
      forbidden_topics,
      approval_required,
    } = body;

    // Validate required fields
    if (!name || !channel || !body_template) {
      return NextResponse.json(
        { error: 'Missing required fields: name, channel, body_template' },
        { status: 400 }
      );
    }

    // Validate channel
    if (!['sms', 'email', 'voicemail', 'in_app'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
    }

    const templateService = new TemplateService(supabase);
    const result = await templateService.createTemplate(user.id, {
      name,
      category,
      channel: channel as MessageChannel,
      template_type: template_type as TemplateType,
      subject_template,
      body_template,
      sensitivity_level: sensitivity_level as SensitivityLevel,
      forbidden_topics,
      approval_required,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ template: result.data }, { status: 201 });
  } catch (error) {
    console.error('[API] Template create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
