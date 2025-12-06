'use client';

/**
 * Tool Workflows Component
 *
 * Allows users to create, manage, and execute multi-step tool workflows
 */

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Save,
  X,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToolPreferences } from '@/hooks/useToolPreferences';
import { getIcon } from '@/lib/ai/icon-map';
import type { ToolWorkflow } from '@/types/tool-preferences';

interface ToolWorkflowsProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteWorkflow: (workflow: ToolWorkflow) => void;
}

interface WorkflowEditorProps {
  workflow?: ToolWorkflow;
  onSave: (
    workflow: Omit<ToolWorkflow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'use_count'>
  ) => void;
  onCancel: () => void;
}

// Mock tool data for workflow builder (in real app, would come from registry)
const AVAILABLE_TOOLS = [
  { slug: 'find-properties', displayName: 'Find Properties', icon: 'Search' },
  { slug: 'analyze-deal', displayName: 'Analyze Deal', icon: 'Calculator' },
  { slug: 'get-property-details', displayName: 'Get Property Details', icon: 'Home' },
  { slug: 'calculate-arv', displayName: 'Calculate ARV', icon: 'TrendingUp' },
  { slug: 'estimate-repairs', displayName: 'Estimate Repairs', icon: 'Wrench' },
  { slug: 'find-buyers', displayName: 'Find Buyers', icon: 'Users' },
  { slug: 'generate-marketing', displayName: 'Generate Marketing', icon: 'FileText' },
];

function WorkflowEditor({ workflow, onSave, onCancel }: WorkflowEditorProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [description, setDescription] = useState(workflow?.description || '');
  const [selectedTools, setSelectedTools] = useState<string[]>(workflow?.tool_slugs || []);
  const [stepPrompts, setStepPrompts] = useState<Record<string, string>>(
    (workflow?.step_prompts as Record<string, string>) || {}
  );

  const handleAddTool = (toolSlug: string) => {
    if (!selectedTools.includes(toolSlug)) {
      setSelectedTools([...selectedTools, toolSlug]);
    }
  };

  const handleRemoveTool = (index: number) => {
    setSelectedTools(selectedTools.filter((_, i) => i !== index));
    // Clean up step prompt for removed tool
    const removed = selectedTools[index];
    if (removed && stepPrompts[removed]) {
      const { [removed]: _, ...rest } = stepPrompts;
      setStepPrompts(rest);
    }
  };

  const handleStepPromptChange = (toolSlug: string, prompt: string) => {
    setStepPrompts({ ...stepPrompts, [toolSlug]: prompt });
  };

  const handleSave = () => {
    if (name.trim() && selectedTools.length >= 2) {
      onSave({
        name: name.trim(),
        description: description.trim() || null,
        tool_slugs: selectedTools,
        step_prompts: stepPrompts,
        is_public: false, // User workflows are private by default
        last_used_at: null,
      });
    }
  };

  const isValid = name.trim() && selectedTools.length >= 2;

  return (
    <div className="space-y-4">
      {/* Workflow Name & Description */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="workflow-name">Workflow Name *</Label>
          <Input
            id="workflow-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Deal Analysis Pipeline"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="workflow-description">Description</Label>
          <Input
            id="workflow-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Find properties, analyze deals, and generate reports"
            className="mt-1"
          />
        </div>
      </div>

      {/* Selected Tools (Workflow Steps) */}
      <div>
        <Label>Workflow Steps ({selectedTools.length})</Label>
        {selectedTools.length > 0 ? (
          <div className="mt-2 space-y-2">
            {selectedTools.map((toolSlug, index) => {
              const tool = AVAILABLE_TOOLS.find((t) => t.slug === toolSlug);
              if (!tool) return null;
              const Icon = getIcon(tool.icon);

              return (
                <div key={`${toolSlug}-${index}`} className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] px-1.5">
                      Step {index + 1}
                    </Badge>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm flex-1">{tool.displayName}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRemoveTool(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    value={stepPrompts[toolSlug] || ''}
                    onChange={(e) => handleStepPromptChange(toolSlug, e.target.value)}
                    placeholder={`Optional: Custom prompt for ${tool.displayName}`}
                    className="text-xs h-8"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Select at least 2 tools to create a workflow
          </p>
        )}
      </div>

      {/* Available Tools */}
      <div>
        <Label>Add Tools</Label>
        <ScrollArea className="h-40 mt-2 border rounded-lg p-2">
          <div className="space-y-1">
            {AVAILABLE_TOOLS.map((tool) => {
              const Icon = getIcon(tool.icon);
              const isSelected = selectedTools.includes(tool.slug);

              return (
                <button
                  key={tool.slug}
                  onClick={() => handleAddTool(tool.slug)}
                  disabled={isSelected}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                    isSelected
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'hover:bg-accent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{tool.displayName}</span>
                  {isSelected && (
                    <Badge variant="secondary" className="text-[10px] px-1">
                      Added
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isValid}>
          <Save className="h-4 w-4 mr-1" />
          Save Workflow
        </Button>
      </div>
    </div>
  );
}

function WorkflowListItem({
  workflow,
  onExecute,
  onEdit,
  onDelete,
}: {
  workflow: ToolWorkflow;
  onExecute: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border rounded-lg p-3 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <WorkflowIcon className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm">{workflow.name}</h3>
            {(workflow.use_count ?? 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1">
                {workflow.use_count} uses
              </Badge>
            )}
          </div>
          {workflow.description && (
            <p className="text-xs text-muted-foreground">{workflow.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onEdit}
            title="Edit workflow"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Delete workflow"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto">
        {workflow.tool_slugs.map((toolSlug, index) => {
          const tool = AVAILABLE_TOOLS.find((t) => t.slug === toolSlug);
          if (!tool) return null;
          const Icon = getIcon(tool.icon);

          return (
            <div key={`${toolSlug}-${index}`} className="flex items-center gap-1 flex-shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                <Icon className="h-3 w-3" />
                <span>{tool.displayName}</span>
              </div>
              {index < workflow.tool_slugs.length - 1 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <Button size="sm" onClick={onExecute} className="w-full h-8">
        <Play className="h-3 w-3 mr-1" />
        Execute Workflow
      </Button>
    </div>
  );
}

export function ToolWorkflows({ isOpen, onClose, onExecuteWorkflow }: ToolWorkflowsProps) {
  const preferences = useToolPreferences();
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ToolWorkflow | null>(null);

  const handleCreateWorkflow = useCallback(
    async (
      workflowData: Omit<ToolWorkflow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'use_count'>
    ) => {
      await preferences.createWorkflow({
        name: workflowData.name,
        description: workflowData.description ?? undefined,
        tool_slugs: workflowData.tool_slugs,
        step_prompts: workflowData.step_prompts as Record<string, string> | undefined,
        is_public: workflowData.is_public ?? undefined,
      });
      setIsCreating(false);
    },
    [preferences]
  );

  const handleUpdateWorkflow = useCallback(
    async (
      workflowData: Omit<ToolWorkflow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'use_count'>
    ) => {
      if (editingWorkflow) {
        await preferences.updateWorkflow(editingWorkflow.id, {
          name: workflowData.name,
          description: workflowData.description ?? undefined,
          tool_slugs: workflowData.tool_slugs,
          step_prompts: workflowData.step_prompts as Record<string, string> | undefined,
          is_public: workflowData.is_public ?? undefined,
        });
        setEditingWorkflow(null);
      }
    },
    [preferences, editingWorkflow]
  );

  const handleDeleteWorkflow = useCallback(
    async (workflowId: string) => {
      if (confirm('Are you sure you want to delete this workflow?')) {
        await preferences.deleteWorkflow(workflowId);
      }
    },
    [preferences]
  );

  const handleExecuteWorkflow = useCallback(
    (workflow: ToolWorkflow) => {
      onExecuteWorkflow(workflow);
      onClose();
    },
    [onExecuteWorkflow, onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WorkflowIcon className="h-5 w-5 text-primary" />
            Tool Workflows
          </DialogTitle>
          <DialogDescription>
            Create multi-step workflows to automate common tasks
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isCreating || editingWorkflow ? (
            <WorkflowEditor
              workflow={editingWorkflow || undefined}
              onSave={editingWorkflow ? handleUpdateWorkflow : handleCreateWorkflow}
              onCancel={() => {
                setIsCreating(false);
                setEditingWorkflow(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Create New Button */}
              <Button onClick={() => setIsCreating(true)} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create New Workflow
              </Button>

              {/* Workflows List */}
              {preferences.workflows.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <WorkflowIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No workflows yet</p>
                  <p className="text-sm mt-1">Create your first workflow to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preferences.workflows.map((workflow) => (
                    <WorkflowListItem
                      key={workflow.id}
                      workflow={workflow}
                      onExecute={() => handleExecuteWorkflow(workflow)}
                      onEdit={() => setEditingWorkflow(workflow)}
                      onDelete={() => handleDeleteWorkflow(workflow.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
