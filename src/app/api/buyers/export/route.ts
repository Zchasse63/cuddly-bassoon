import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'buyers';

    if (type === 'buyers') {
      const { data: buyers, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      // Convert to CSV
      const headers = ['Name', 'Company', 'Email', 'Phone', 'Type', 'Status', 'Tier', 'Created'];
      const rows = (buyers || []).map(b => [
        b.name,
        b.company_name || '',
        b.email || '',
        b.phone || '',
        b.buyer_type || '',
        b.status || '',
        b.tier || '',
        b.created_at || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="buyers-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    if (type === 'transactions') {
      const { data: transactions, error } = await supabase
        .from('buyer_transactions')
        .select('*, buyers!inner(name, user_id)')
        .eq('buyers.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = ['Buyer', 'Address', 'Type', 'Purchase Price', 'Sale Price', 'Purchase Date', 'Sale Date'];
      const rows = (transactions || []).map(tx => [
        (tx.buyers as { name: string })?.name || '',
        tx.property_address || '',
        tx.transaction_type || '',
        tx.purchase_price?.toString() || '',
        tx.sale_price?.toString() || '',
        tx.purchase_date || '',
        tx.sale_date || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting:', error);
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}

