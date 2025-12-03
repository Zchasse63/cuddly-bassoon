'use client';

/**
 * Campaign Creator Component
 * Create new buyer blast campaigns with recipient selection
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Mail, Users, FileText, Send, Save, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageChannel, Template } from '@/lib/communication/types';

interface CampaignCreatorProps {
  templates?: Template[];
  onSave?: (campaign: CampaignFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  channel: MessageChannel;
  template_id?: string;
  custom_message?: string;
  custom_subject?: string;
  recipient_filter: {
    buyer_criteria?: string;
    property_types?: string[];
    min_budget?: number;
    max_budget?: number;
    locations?: string[];
  };
  schedule_at?: string;
}

export function CampaignCreator({
  templates = [],
  onSave,
  onCancel,
  className,
}: CampaignCreatorProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    channel: 'sms',
    recipient_filter: {},
  });
  const [useTemplate, setUseTemplate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateFormData = (updates: Partial<CampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsSaving(true);
    try {
      await onSave?.(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = templates.filter((t) => t.channel === formData.channel);

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Create Campaign</CardTitle>
          <CardDescription>Send bulk messages to your buyer list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="e.g., New Property Alert"
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={formData.channel}
                onValueChange={(v) =>
                  updateFormData({ channel: v as MessageChannel, template_id: undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> SMS
                    </span>
                  </SelectItem>
                  <SelectItem value="email">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Describe this campaign..."
              rows={2}
            />
          </div>

          {/* Message Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={useTemplate ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseTemplate(true)}
              >
                <FileText className="h-4 w-4 mr-1" /> Use Template
              </Button>
              <Button
                variant={!useTemplate ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseTemplate(false)}
              >
                <MessageSquare className="h-4 w-4 mr-1" /> Custom Message
              </Button>
            </div>

            {useTemplate ? (
              <div className="space-y-2">
                <Label>Select Template</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(v) => updateFormData({ template_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.channel === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={formData.custom_subject || ''}
                      onChange={(e) => updateFormData({ custom_subject: e.target.value })}
                      placeholder="Email subject..."
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.custom_message || ''}
                    onChange={(e) => updateFormData({ custom_message: e.target.value })}
                    placeholder="Type your message..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recipient Filters */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Recipient Filters
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyer-criteria">Buyer Criteria</Label>
                <Input
                  id="buyer-criteria"
                  value={formData.recipient_filter.buyer_criteria || ''}
                  onChange={(e) =>
                    updateFormData({
                      recipient_filter: {
                        ...formData.recipient_filter,
                        buyer_criteria: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., cash_buyer, active"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locations">Locations</Label>
                <Input
                  id="locations"
                  value={formData.recipient_filter.locations?.join(', ') || ''}
                  onChange={(e) =>
                    updateFormData({
                      recipient_filter: {
                        ...formData.recipient_filter,
                        locations: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g., Austin, Dallas"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-budget">Min Budget</Label>
                <Input
                  id="min-budget"
                  type="number"
                  value={formData.recipient_filter.min_budget || ''}
                  onChange={(e) =>
                    updateFormData({
                      recipient_filter: {
                        ...formData.recipient_filter,
                        min_budget: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="$0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-budget">Max Budget</Label>
                <Input
                  id="max-budget"
                  type="number"
                  value={formData.recipient_filter.max_budget || ''}
                  onChange={(e) =>
                    updateFormData({
                      recipient_filter: {
                        ...formData.recipient_filter,
                        max_budget: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Schedule (Optional)
            </Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={formData.schedule_at || ''}
              onChange={(e) => updateFormData({ schedule_at: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Leave empty to save as draft</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button variant="outline" onClick={handleSave} disabled={isSaving || !formData.name}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name}>
              <Send className="h-4 w-4 mr-2" />
              {isSaving ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignCreator;
