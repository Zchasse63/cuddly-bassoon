import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get transactions for metrics
    const { data: transactions, error: txError } = await supabase
      .from('buyer_transactions')
      .select('*, buyers!inner(user_id)')
      .eq('buyers.user_id', user.id);

    if (txError) throw txError;

    // Get messages for response time calculation
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id);

    if (msgError) throw msgError;

    // Calculate metrics
    const txList = transactions || [];
    const totalVolume = txList.reduce((sum, tx) => {
      return sum + (tx.purchase_price || tx.sale_price || 0);
    }, 0);

    const avgTransactionValue = txList.length > 0 ? totalVolume / txList.length : 0;

    // Calculate average response time from messages
    let avgResponseTime = 0;
    const msgList = messages || [];
    const outbound = msgList.filter(m => m.direction === 'outbound');
    const inbound = msgList.filter(m => m.direction === 'inbound');
    
    if (outbound.length > 0 && inbound.length > 0) {
      const responseTimes: number[] = [];
      for (const out of outbound) {
        const outTime = new Date(out.created_at || 0).getTime();
        const nextIn = inbound.find(
          i => new Date(i.created_at || 0).getTime() > outTime
        );
        if (nextIn) {
          const inTime = new Date(nextIn.created_at || 0).getTime();
          responseTimes.push((inTime - outTime) / (1000 * 60 * 60));
        }
      }
      if (responseTimes.length > 0) {
        avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }
    }

    // Deal acceptance rate (simplified - based on completed transactions)
    const completedTx = txList.filter(tx => tx.transaction_type === 'purchase');
    const dealAcceptanceRate = txList.length > 0 
      ? (completedTx.length / txList.length) * 100 
      : 0;

    const metrics = {
      averageResponseTime: avgResponseTime,
      dealAcceptanceRate,
      averageTransactionValue: avgTransactionValue,
      totalClosedVolume: totalVolume,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching buyer metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

