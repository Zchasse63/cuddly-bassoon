import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent messages as activity
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, created_at, direction, channel, buyers(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const activities = (messages || []).map(msg => ({
      id: msg.id,
      buyerName: (msg.buyers as { name: string } | null)?.name || 'Unknown',
      action: `${msg.direction === 'outbound' ? 'Sent' : 'Received'} ${msg.channel}`,
      timestamp: msg.created_at,
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

