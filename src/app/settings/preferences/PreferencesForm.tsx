'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import type { UserPreferencesData } from '@/lib/user';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PreferencesFormProps {
  preferences: UserPreferencesData;
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    theme: preferences.theme ?? 'system',
    default_view: preferences.default_view ?? 'list',
    timezone: preferences.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    date_format: preferences.date_format ?? 'MM/DD/YYYY',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to update preferences');
      }

      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Theme</Label>
        <Select
          value={formData.theme}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, theme: value as 'light' | 'dark' | 'system' }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Default View</Label>
        <Select
          value={formData.default_view}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, default_view: value as 'list' | 'grid' | 'map' }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">List</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="map">Map</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date Format</Label>
        <Select
          value={formData.date_format}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, date_format: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </form>
  );
}
