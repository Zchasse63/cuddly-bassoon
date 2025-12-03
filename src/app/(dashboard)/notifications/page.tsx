'use client';

import { Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Notifications Page - User notifications
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function NotificationsPage() {
  usePageContext('notifications');

  const notifications = [
    {
      id: 1,
      title: 'New property match',
      description: '3 properties match your saved filter "Distressed in 32801"',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Deal status updated',
      description: 'Deal #1234 moved to "Under Contract"',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      title: 'Buyer interested',
      description: 'John Smith expressed interest in 123 Main St',
      time: '1 day ago',
      read: true,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">Stay updated on your deals and properties</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        {notifications.map((notification) => (
          <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{notification.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
