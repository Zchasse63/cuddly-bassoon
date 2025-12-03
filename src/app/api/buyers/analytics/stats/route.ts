import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get buyer statistics
    const { data: buyers, error } = await supabase
      .from('buyers')
      .select('id, status, tier, buyer_type')
      .eq('user_id', user.id);

    if (error) throw error;

    const stats = {
      totalBuyers: buyers?.length || 0,
      activeBuyers: buyers?.filter(b => b.status === 'active').length || 0,
      qualifiedBuyers: buyers?.filter(b => b.status === 'qualified').length || 0,
      tierACount: buyers?.filter(b => b.tier === 'A').length || 0,
      tierBCount: buyers?.filter(b => b.tier === 'B').length || 0,
      tierCCount: buyers?.filter(b => b.tier === 'C').length || 0,
      buyersByType: (buyers || []).reduce((acc, b) => {
        const type = b.buyer_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching buyer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

