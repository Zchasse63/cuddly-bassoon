import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getUserVertical, setUserVertical, getUserEnabledVerticals } from '@/lib/verticals/vertical-service';
import { BUSINESS_VERTICALS } from '@/lib/verticals/types';

// ============================================
// Request Validation Schema
// ============================================

const SetVerticalSchema = z.object({
  vertical: z.enum(BUSINESS_VERTICALS),
});

// ============================================
// GET /api/verticals
// ============================================

export async function GET() {
  const startTime = Date.now();

  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's vertical preferences
    const activeVertical = await getUserVertical(user.id);
    const enabledVerticals = await getUserEnabledVerticals(user.id);

    return NextResponse.json({
      data: {
        activeVertical,
        enabledVerticals,
      },
      meta: { executionTimeMs: Date.now() - startTime },
    });
  } catch (error) {
    console.error('Get verticals error:', error);
    return NextResponse.json({ error: 'Failed to get verticals' }, { status: 500 });
  }
}

// ============================================
// POST /api/verticals
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = SetVerticalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { vertical } = parsed.data;

    // Set the user's active vertical
    await setUserVertical(user.id, vertical);

    return NextResponse.json({
      data: { success: true, vertical },
      meta: { executionTimeMs: Date.now() - startTime },
    });
  } catch (error) {
    console.error('Set vertical error:', error);
    return NextResponse.json({ error: 'Failed to set vertical' }, { status: 500 });
  }
}

