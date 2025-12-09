import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Event types for analytics tracking
export type EventType =
  // Search & Discovery
  | 'property_search'
  | 'property_view'
  | 'property_save'
  | 'property_analyze'
  | 'filter_applied'
  | 'skip_trace_run'
  // Outreach
  | 'call_made'
  | 'call_completed'
  | 'sms_sent'
  | 'sms_received'
  | 'email_sent'
  | 'email_opened'
  | 'email_replied'
  | 'mail_sent'
  // Pipeline
  | 'lead_created'
  | 'lead_stage_changed'
  | 'appointment_set'
  | 'offer_made'
  | 'contract_signed'
  | 'deal_closed'
  // Financial
  | 'revenue_recorded'
  | 'expense_recorded';

// JSON-compatible type for Supabase
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface AnalyticsEventInput {
  event_type: EventType;
  event_data?: Record<string, JsonValue>;
  session_id?: string;
}

// Map event types to daily analytics fields
const eventToFieldMap: Record<EventType, string> = {
  property_search: 'searches',
  property_view: 'property_views',
  property_save: 'property_saves',
  property_analyze: 'property_analyses',
  filter_applied: 'searches',
  skip_trace_run: 'skip_traces',
  call_made: 'calls_made',
  call_completed: 'calls_connected',
  sms_sent: 'texts_sent',
  sms_received: 'texts_received',
  email_sent: 'emails_sent',
  email_opened: 'emails_opened',
  email_replied: 'emails_replied',
  mail_sent: 'mail_sent',
  lead_created: 'leads_created',
  lead_stage_changed: 'leads_contacted',
  appointment_set: 'appointments_set',
  offer_made: 'offers_made',
  contract_signed: 'contracts_signed',
  deal_closed: 'deals_closed',
  revenue_recorded: 'revenue',
  expense_recorded: 'expenses',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: AnalyticsEventInput = await request.json();
    const { event_type, event_data = {}, session_id } = body;

    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
    }

    // Insert event into analytics_events table
    const { error: eventError } = await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type,
      event_data,
      session_id,
    });

    if (eventError) {
      console.error('Error inserting analytics event:', eventError);
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
    }

    // Update daily aggregates
    const field = eventToFieldMap[event_type];
    if (field) {
      const increment =
        event_type === 'revenue_recorded' || event_type === 'expense_recorded'
          ? (event_data.amount as number) || 0
          : 1;

      const todayDate = new Date().toISOString().split('T')[0] ?? '';
      const { error: upsertError } = await supabase.rpc('upsert_daily_analytics', {
        p_user_id: user.id,
        p_date: todayDate,
        p_field: field,
        p_increment: increment,
      });

      if (upsertError) {
        console.error('Error updating daily analytics:', upsertError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET recent events for debugging/admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
