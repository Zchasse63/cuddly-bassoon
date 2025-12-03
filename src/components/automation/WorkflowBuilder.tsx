'use client';

/**
 * Workflow Builder Component
 * Visual workflow creation with triggers, conditions, and actions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Plus,
  Trash2,
  MessageSquare,
  Mail,
  Clock,
  Filter,
  Save,
  Play,
  Pause,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowCondition,
} from '@/lib/communication/types';

// Trigger type options
const TRIGGER_TYPES: { value: WorkflowTrigger['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'lead_status_change', label: 'Lead Status Change', icon: <Zap className="h-4 w-4" /> },
  { value: 'deal_stage_change', label: 'Deal Stage Change', icon: <Zap className="h-4 w-4" /> },
  { value: 'time_based', label: 'Time Based', icon: <Clock className="h-4 w-4" /> },
  { value: 'property_match', label: 'Property Match', icon: <Filter className="h-4 w-4" /> },
  {
    value: 'inbound_message',
    label: 'Inbound Message',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  { value: 'form_submission', label: 'Form Submission', icon: <Zap className="h-4 w-4" /> },
  { value: 'manual', label: 'Manual Trigger', icon: <Play className="h-4 w-4" /> },
];

// Action type options
const ACTION_TYPES: { value: WorkflowAction['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'send_sms', label: 'Send SMS', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'send_email', label: 'Send Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'delay', label: 'Wait/Delay', icon: <Clock className="h-4 w-4" /> },
  {
    value: 'update_lead_status',
    label: 'Update Lead Status',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    value: 'update_deal_stage',
    label: 'Update Deal Stage',
    icon: <Settings className="h-4 w-4" />,
  },
  { value: 'create_task', label: 'Create Task', icon: <Plus className="h-4 w-4" /> },
  { value: 'notify_user', label: 'Notify User', icon: <Zap className="h-4 w-4" /> },
  { value: 'assign_to_user', label: 'Assign to User', icon: <Zap className="h-4 w-4" /> },
  { value: 'add_to_list', label: 'Add to List', icon: <Plus className="h-4 w-4" /> },
];

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave?: (workflow: Partial<Workflow>) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function WorkflowBuilder({ workflow, onSave, onCancel, className }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [trigger, setTrigger] = useState<WorkflowTrigger>(
    workflow
      ? { type: workflow.trigger_type, config: workflow.trigger_config }
      : { type: 'lead_status_change', config: {} }
  );
  const [conditions, setConditions] = useState<WorkflowCondition[]>(workflow?.conditions || []);
  const [actions, setActions] = useState<WorkflowAction[]>(workflow?.actions || []);
  const [isActive, setIsActive] = useState(workflow?.is_active ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    setConditions(conditions.map((c, i) => (i === index ? { ...c, ...updates } : c)));
  };

  const addAction = (type: WorkflowAction['type']) => {
    const newAction: WorkflowAction = {
      type,
      config: {},
      order: actions.length,
    };
    setActions([...actions, newAction]);
    setExpandedAction(actions.length);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    setActions(actions.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  };

  const moveAction = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= actions.length) return;
    const newActions = [...actions];
    const temp = newActions[index]!;
    newActions[index] = newActions[newIndex]!;
    newActions[newIndex] = temp;
    newActions.forEach((a, i) => (a.order = i));
    setActions(newActions);
  };

  const handleSave = async () => {
    if (!name || !trigger.type || actions.length === 0) return;
    setIsSaving(true);
    try {
      await onSave?.({
        name,
        description,
        trigger_type: trigger.type,
        trigger_config: trigger.config,
        conditions,
        actions,
        is_active: isActive,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getActionLabel = (type: WorkflowAction['type']) => {
    return ACTION_TYPES.find((a) => a.value === type)?.label || type;
  };

  const getActionIcon = (type: WorkflowAction['type']) => {
    return ACTION_TYPES.find((a) => a.value === type)?.icon || <Zap className="h-4 w-4" />;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>{workflow ? 'Edit Workflow' : 'Create Workflow'}</CardTitle>
          <CardDescription>
            Build automated workflows triggered by events in your pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., New Lead Follow-up"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsActive(true)}
                >
                  <Play className="h-4 w-4 mr-1" /> Active
                </Button>
                <Button
                  variant={!isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsActive(false)}
                >
                  <Pause className="h-4 w-4 mr-1" /> Paused
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Trigger
          </CardTitle>
          <CardDescription>When should this workflow run?</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={trigger.type}
            onValueChange={(v) => setTrigger({ type: v as WorkflowTrigger['type'], config: {} })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a trigger" />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2">
                    {t.icon} {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Trigger-specific config */}
          {trigger.type === 'lead_status_change' && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Status</Label>
                <Input
                  value={trigger.config.from_status || ''}
                  onChange={(e) =>
                    setTrigger({
                      ...trigger,
                      config: { ...trigger.config, from_status: e.target.value },
                    })
                  }
                  placeholder="Any"
                />
              </div>
              <div className="space-y-2">
                <Label>To Status</Label>
                <Input
                  value={trigger.config.to_status || ''}
                  onChange={(e) =>
                    setTrigger({
                      ...trigger,
                      config: { ...trigger.config, to_status: e.target.value },
                    })
                  }
                  placeholder="e.g., contacted"
                />
              </div>
            </div>
          )}

          {trigger.type === 'time_based' && (
            <div className="mt-4 space-y-2">
              <Label>Schedule (Cron Expression)</Label>
              <Input
                value={trigger.config.schedule || ''}
                onChange={(e) =>
                  setTrigger({
                    ...trigger,
                    config: { ...trigger.config, schedule: e.target.value },
                  })
                }
                placeholder="e.g., 0 9 * * 1-5 (9am weekdays)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Conditions
              </CardTitle>
              <CardDescription>Optional filters to narrow when workflow runs</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-1" /> Add Condition
            </Button>
          </div>
        </CardHeader>
        {conditions.length > 0 && (
          <CardContent className="space-y-3">
            {conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  placeholder="Field"
                  className="flex-1"
                />
                <Select
                  value={condition.operator}
                  onValueChange={(v) =>
                    updateCondition(index, { operator: v as WorkflowCondition['operator'] })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={condition.value as string}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon-sm" onClick={() => removeCondition(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                Actions
              </CardTitle>
              <CardDescription>What should happen when triggered?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.map((action, index) => (
            <div key={index} className="border rounded-lg">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedAction(expandedAction === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  {getActionIcon(action.type)}
                  <span className="font-medium">{getActionLabel(action.type)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveAction(index, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveAction(index, 'down');
                    }}
                    disabled={index === actions.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAction(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {expandedAction === index && (
                <div className="p-3 border-t bg-muted/30 space-y-3">
                  {(action.type === 'send_sms' || action.type === 'send_email') && (
                    <>
                      <div className="space-y-2">
                        <Label>Template ID</Label>
                        <Input
                          value={action.config.template_id || ''}
                          onChange={(e) =>
                            updateAction(index, {
                              config: { ...action.config, template_id: e.target.value },
                            })
                          }
                          placeholder="Select or enter template ID"
                        />
                      </div>
                    </>
                  )}
                  {action.type === 'delay' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          type="number"
                          value={action.config.delay_minutes || ''}
                          onChange={(e) =>
                            updateAction(index, {
                              config: { ...action.config, delay_minutes: parseInt(e.target.value) },
                            })
                          }
                          placeholder="60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select
                          value={action.config.delay_unit || 'minutes'}
                          onValueChange={(v) =>
                            updateAction(index, {
                              config: {
                                ...action.config,
                                delay_unit: v as 'minutes' | 'hours' | 'days',
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {ACTION_TYPES.map((actionType) => (
              <Button
                key={actionType.value}
                variant="outline"
                size="sm"
                onClick={() => addAction(actionType.value)}
              >
                {actionType.icon}
                <span className="ml-1">{actionType.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving || !name || actions.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Workflow'}
        </Button>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
