import { NextResponse } from 'next/server';
import { getUsageTracker } from '@/lib/rentcast';

// ============================================
// GET /api/rentcast/usage
// ============================================

export async function GET() {
  try {
    const tracker = getUsageTracker();
    const metrics = await tracker.getMetrics();

    return NextResponse.json({
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Usage metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve usage metrics' },
      { status: 500 }
    );
  }
}

