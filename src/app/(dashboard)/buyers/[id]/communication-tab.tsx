'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Phone, MessageSquare, Send, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Message, CommunicationStats, MessageChannel } from '@/lib/buyers';

interface CommunicationTabProps {
  buyerId: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export function CommunicationTab({ buyerId, buyerEmail, buyerPhone }: CommunicationTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [msgsRes, statsRes] = await Promise.all([
        fetch(`/api/buyers/${buyerId}/messages`),
        fetch(`/api/buyers/${buyerId}/messages/stats`),
      ]);

      if (msgsRes.ok) {
        const data = await msgsRes.json();
        setMessages(data.messages || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load communication data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSend = async () => {
    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`/api/buyers/${buyerId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, subject, body }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      toast.success('Message sent');
      setSubject('');
      setBody('');
      loadData();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.emailCount}</div>
              <div className="text-sm text-muted-foreground">Emails</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.smsCount}</div>
              <div className="text-sm text-muted-foreground">SMS</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {stats.averageResponseTime ? `${stats.averageResponseTime.toFixed(1)}h` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {buyerPhone && (
            <Button variant="outline" asChild>
              <a href={`tel:${buyerPhone}`}>
                <Phone className="h-4 w-4 mr-2" /> Call
              </a>
            </Button>
          )}
          {buyerEmail && (
            <Button variant="outline" asChild>
              <a href={`mailto:${buyerEmail}`}>
                <Mail className="h-4 w-4 mr-2" /> Email
              </a>
            </Button>
          )}
          {buyerPhone && (
            <Button variant="outline" asChild>
              <a href={`sms:${buyerPhone}`}>
                <MessageSquare className="h-4 w-4 mr-2" /> SMS
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Compose Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
          {channel === 'email' && (
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          )}
          <Textarea
            placeholder="Message..."
            value={body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSend} disabled={isSending}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border ${
                    msg.direction === 'outbound' ? 'bg-primary/5 ml-8' : 'bg-muted mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getChannelIcon(msg.channel)}
                    <Badge variant="outline" className="text-xs">
                      {msg.direction === 'outbound' ? 'Sent' : 'Received'}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  {msg.subject && <div className="font-medium text-sm">{msg.subject}</div>}
                  <div className="text-sm mt-1">{msg.body}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
