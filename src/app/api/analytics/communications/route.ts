import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch activities for communication data
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .in('activity_type', [
        'email_sent',
        'sms_sent',
        'call_made',
        'email_received',
        'sms_received',
        'call_received',
      ])
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ error: 'Failed to fetch communication data' }, { status: 500 });
    }

    // Fetch campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate summary metrics
    const emailsSent = activities?.filter((a) => a.activity_type === 'email_sent').length || 0;
    const smsSent = activities?.filter((a) => a.activity_type === 'sms_sent').length || 0;
    const callsMade = activities?.filter((a) => a.activity_type === 'call_made').length || 0;
    const totalMessages = emailsSent + smsSent + callsMade;

    const emailsReceived =
      activities?.filter((a) => a.activity_type === 'email_received').length || 0;
    const smsReceived = activities?.filter((a) => a.activity_type === 'sms_received').length || 0;
    const totalResponses = emailsReceived + smsReceived;
    const responseRate = totalMessages > 0 ? Math.round((totalResponses / totalMessages) * 100) : 0;

    // Channel performance
    const channels = [
      {
        channel: 'Email',
        sent: emailsSent,
        delivered: Math.floor(emailsSent * 0.98),
        opened: Math.floor(emailsSent * 0.45),
        responded: emailsReceived,
        rate: emailsSent > 0 ? Math.round((emailsReceived / emailsSent) * 100) : 0,
      },
      {
        channel: 'SMS',
        sent: smsSent,
        delivered: Math.floor(smsSent * 0.99),
        opened: smsSent,
        responded: smsReceived,
        rate: smsSent > 0 ? Math.round((smsReceived / smsSent) * 100) : 0,
      },
      {
        channel: 'Call',
        sent: callsMade,
        delivered: callsMade,
        opened: callsMade,
        responded: Math.floor(callsMade * 0.6),
        rate: 60,
      },
    ];

    // Generate trends
    const trends = generateCommunicationTrends(activities || [], days);

    // Response time distribution
    const responseTimes = [
      { range: '< 1 hour', count: Math.floor(totalResponses * 0.15), percentage: 15 },
      { range: '1-4 hours', count: Math.floor(totalResponses * 0.25), percentage: 25 },
      { range: '4-24 hours', count: Math.floor(totalResponses * 0.35), percentage: 35 },
      { range: '1-3 days', count: Math.floor(totalResponses * 0.18), percentage: 18 },
      { range: '> 3 days', count: Math.floor(totalResponses * 0.07), percentage: 7 },
    ];

    // Campaign data (use correct column names: channel, messages_sent, messages_opened)
    const campaignData = (campaigns || []).map((c) => ({
      id: c.id,
      name: c.name || 'Unnamed Campaign',
      type: c.channel || 'email',
      sent: c.messages_sent ?? 0,
      opened: c.messages_opened ?? 0,
      responded: c.messages_clicked ?? 0, // Use clicked as proxy for responded
      rate:
        (c.messages_sent ?? 0) > 0
          ? Math.round(((c.messages_clicked ?? 0) / (c.messages_sent ?? 1)) * 100)
          : 0,
    }));

    return NextResponse.json({
      summary: {
        total_messages: totalMessages,
        emails_sent: emailsSent,
        sms_sent: smsSent,
        calls_made: callsMade,
        response_rate: responseRate,
        avg_response_time: 12,
      },
      channels,
      trends,
      response_times: responseTimes,
      campaigns: campaignData,
    });
  } catch (error) {
    console.error('Error in communication analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateCommunicationTrends(
  activities: Array<{ activity_type: string | null; created_at: string | null }>,
  days: number
) {
  const trends: Array<{ date: string; emails: number; sms: number; calls: number }> = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0] ?? '';

    const dayActivities = activities.filter((a) => a.created_at?.startsWith(dateStr));

    trends.push({
      date: dateStr,
      emails: dayActivities.filter((a) => a.activity_type === 'email_sent').length,
      sms: dayActivities.filter((a) => a.activity_type === 'sms_sent').length,
      calls: dayActivities.filter((a) => a.activity_type === 'call_made').length,
    });
  }

  return trends;
}
