'use client';

/**
 * Template Editor Component
 * Create and edit message templates with variable insertion and live preview
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Mail,
  Plus,
  Eye,
  Save,
  AlertTriangle,
  CheckCircle,
  Variable,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Template,
  MessageChannel,
  TemplateType,
  SensitivityLevel,
} from '@/lib/communication/types';

// Available template variables
const TEMPLATE_VARIABLES = [
  { name: 'owner_name', description: 'Property owner name' },
  { name: 'property_address', description: 'Property address' },
  { name: 'property_city', description: 'Property city' },
  { name: 'property_state', description: 'Property state' },
  { name: 'offer_amount', description: 'Offer amount' },
  { name: 'buyer_name', description: 'Buyer name' },
  { name: 'deal_arv', description: 'After repair value' },
  { name: 'deal_profit', description: 'Estimated profit' },
  { name: 'user_name', description: 'Your name' },
  { name: 'user_phone', description: 'Your phone number' },
  { name: 'user_company', description: 'Your company name' },
];

interface TemplateEditorProps {
  template?: Template;
  onSave?: (template: Partial<Template>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function TemplateEditor({ template, onSave, onCancel, className }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState(template?.category || '');
  const [channel, setChannel] = useState<MessageChannel>(template?.channel || 'sms');
  const [templateType, setTemplateType] = useState<TemplateType>(
    template?.template_type || 'outreach'
  );
  const [subjectTemplate, setSubjectTemplate] = useState(template?.subject_template || '');
  const [bodyTemplate, setBodyTemplate] = useState(template?.body_template || '');
  const [sensitivityLevel, setSensitivityLevel] = useState<SensitivityLevel>(
    template?.sensitivity_level || 'safe'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Extract variables from template
  const extractedVariables = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(bodyTemplate)) !== null) {
      if (match[1]) matches.add(match[1]);
    }
    while ((match = regex.exec(subjectTemplate)) !== null) {
      if (match[1]) matches.add(match[1]);
    }
    return Array.from(matches);
  }, [bodyTemplate, subjectTemplate]);

  // Sample data for preview
  const sampleData = useMemo(
    () => ({
      owner_name: 'John Smith',
      property_address: '123 Main St',
      property_city: 'Austin',
      property_state: 'TX',
      offer_amount: '$150,000',
      buyer_name: 'Jane Investor',
      deal_arv: '$250,000',
      deal_profit: '$35,000',
      user_name: 'Your Name',
      user_phone: '(555) 123-4567',
      user_company: 'Your Company',
    }),
    []
  );

  // Render preview with sample data
  const renderPreview = useCallback(
    (text: string) => {
      return text.replace(/\{\{(\w+)\}\}/g, (_, varName: string) => {
        return (sampleData as Record<string, string>)[varName] || `{{${varName}}}`;
      });
    },
    [sampleData]
  );

  const insertVariable = (varName: string) => {
    const insertion = `{{${varName}}}`;
    setBodyTemplate((prev) => prev + insertion);
  };

  const handleSave = async () => {
    if (!name || !bodyTemplate) return;
    setIsSaving(true);
    try {
      await onSave?.({
        name,
        category,
        channel,
        template_type: templateType,
        subject_template: subjectTemplate,
        body_template: bodyTemplate,
        sensitivity_level: sensitivityLevel,
        variables: extractedVariables,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getChannelIcon = (ch: MessageChannel) => {
    return ch === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>{template ? 'Edit Template' : 'Create Template'}</CardTitle>
          <CardDescription>
            Create reusable message templates with dynamic variables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Initial Outreach"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., seller_outreach"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
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

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={templateType}
                onValueChange={(v) => setTemplateType(v as TemplateType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outreach">Outreach</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="buyer_blast">Buyer Blast</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sensitivity</Label>
              <Select
                value={sensitivityLevel}
                onValueChange={(v) => setSensitivityLevel(v as SensitivityLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Safe
                    </span>
                  </SelectItem>
                  <SelectItem value="caution">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> Caution
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Template Content */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-1" /> Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-4">
              {channel === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={subjectTemplate}
                    onChange={(e) => setSubjectTemplate(e.target.value)}
                    placeholder="e.g., Quick question about {{property_address}}"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="body">Message Body</Label>
                <Textarea
                  id="body"
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  placeholder="Type your message here. Use {{variable_name}} for dynamic content."
                  rows={8}
                />
              </div>

              {/* Variable Insertion */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Variable className="h-4 w-4" /> Insert Variable
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <Button
                      key={v.name}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(v.name)}
                      title={v.description}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Detected Variables */}
              {extractedVariables.length > 0 && (
                <div className="space-y-2">
                  <Label>Variables in Template</Label>
                  <div className="flex flex-wrap gap-2">
                    {extractedVariables.map((v) => (
                      <Badge key={v} variant="secondary">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getChannelIcon(channel)}
                    <span className="font-medium">{channel.toUpperCase()} Preview</span>
                  </div>

                  {channel === 'email' && subjectTemplate && (
                    <div className="mb-4">
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="font-medium">{renderPreview(subjectTemplate)}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-muted-foreground">Message</Label>
                    <div className="mt-1 p-4 bg-background rounded-lg border whitespace-pre-wrap">
                      {renderPreview(bodyTemplate) || 'Your message will appear here...'}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    * Preview uses sample data. Actual values will be filled when sending.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving || !name || !bodyTemplate}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemplateEditor;
