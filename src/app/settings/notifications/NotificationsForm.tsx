'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Bell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email_new_properties: boolean;
  email_buyer_matches: boolean;
  email_deal_updates: boolean;
  email_team_activity: boolean;
  email_marketing: boolean;
  push_enabled: boolean;
}

interface NotificationsFormProps {
  initialData: NotificationSettings;
}

const notificationOptions = [
  {
    key: 'email_new_properties',
    label: 'New Properties',
    description: 'Get notified when new properties match your criteria',
    category: 'email',
  },
  {
    key: 'email_buyer_matches',
    label: 'Buyer Matches',
    description: 'Notifications when buyers match your properties',
    category: 'email',
  },
  {
    key: 'email_deal_updates',
    label: 'Deal Updates',
    description: 'Updates on your active deals',
    category: 'email',
  },
  {
    key: 'email_team_activity',
    label: 'Team Activity',
    description: 'Activity from your team members',
    category: 'email',
  },
  {
    key: 'email_marketing',
    label: 'Marketing & Tips',
    description: 'Product updates and wholesaling tips',
    category: 'email',
  },
  {
    key: 'push_enabled',
    label: 'Push Notifications',
    description: 'Browser push notifications (coming soon)',
    category: 'push',
  },
] as const;

export function NotificationsForm({ initialData }: NotificationsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(initialData);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: { notifications: settings } }),
      });
      if (!response.ok) throw new Error('Failed to save');
      toast({ title: 'Saved', description: 'Notification preferences updated.' });
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save preferences', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const emailOptions = notificationOptions.filter((o) => o.category === 'email');
  const pushOptions = notificationOptions.filter((o) => o.category === 'push');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Notifications</CardTitle>
          </div>
          <CardDescription>Choose what emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {emailOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={option.key} className="text-sm font-medium">
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                id={option.key}
                checked={settings[option.key as keyof NotificationSettings]}
                onCheckedChange={() => handleToggle(option.key as keyof NotificationSettings)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>Browser and mobile notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pushOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={option.key} className="text-sm font-medium">
                  {option.label}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                id={option.key}
                checked={settings[option.key as keyof NotificationSettings]}
                onCheckedChange={() => handleToggle(option.key as keyof NotificationSettings)}
                disabled={option.key === 'push_enabled'}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
