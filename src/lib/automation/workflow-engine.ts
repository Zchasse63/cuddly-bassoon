/**
 * Workflow Automation Engine
 * Handles workflow CRUD, trigger evaluation, and execution orchestration
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  Workflow,
  CreateWorkflowInput,
  WorkflowExecution,
  WorkflowTriggerType,
  WorkflowCondition,
  WorkflowExecutionLog,
} from '@/lib/communication/types';

type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
type WorkflowExecutionInsert = Database['public']['Tables']['workflow_executions']['Insert'];

// ============================================================================
// Workflow Service Class
// ============================================================================

export class WorkflowEngine {
  constructor(private supabase: SupabaseClient<Database>) {}

  // ==========================================================================
  // Workflow CRUD
  // ==========================================================================

  /**
   * Create a new workflow
   */
  async createWorkflow(
    userId: string,
    input: CreateWorkflowInput
  ): Promise<{ data: Workflow | null; error: string | null }> {
    const insertData: WorkflowInsert = {
      user_id: userId,
      name: input.name,
      description: input.description,
      trigger_type: input.trigger_type,
      trigger_config:
        input.trigger_config as unknown as Database['public']['Tables']['workflows']['Insert']['trigger_config'],
      conditions: (input.conditions ||
        []) as unknown as Database['public']['Tables']['workflows']['Insert']['conditions'],
      actions:
        input.actions as unknown as Database['public']['Tables']['workflows']['Insert']['actions'],
      is_active: input.is_active ?? true,
    };

    const { data, error } = await this.supabase
      .from('workflows')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[WorkflowEngine] Create error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as unknown as Workflow, error: null };
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(userId: string, workflowId: string): Promise<Workflow | null> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data as unknown as Workflow;
  }

  /**
   * List workflows
   */
  async listWorkflows(
    userId: string,
    options?: {
      trigger_type?: WorkflowTriggerType;
      is_active?: boolean;
    }
  ): Promise<Workflow[]> {
    let query = this.supabase
      .from('workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.trigger_type) {
      query = query.eq('trigger_type', options.trigger_type);
    }
    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data as unknown as Workflow[];
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    userId: string,
    workflowId: string,
    updates: Partial<CreateWorkflowInput> & { is_active?: boolean }
  ): Promise<{ data: Workflow | null; error: string | null }> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.trigger_type !== undefined) updateData.trigger_type = updates.trigger_type;
    if (updates.trigger_config !== undefined) updateData.trigger_config = updates.trigger_config;
    if (updates.conditions !== undefined) updateData.conditions = updates.conditions;
    if (updates.actions !== undefined) updateData.actions = updates.actions;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

    const { data, error } = await this.supabase
      .from('workflows')
      .update(updateData)
      .eq('id', workflowId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as unknown as Workflow, error: null };
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(userId: string, workflowId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Toggle workflow active status
   */
  async toggleWorkflow(userId: string, workflowId: string): Promise<boolean> {
    const workflow = await this.getWorkflow(userId, workflowId);
    if (!workflow) return false;

    const { error } = await this.supabase
      .from('workflows')
      .update({ is_active: !workflow.is_active, updated_at: new Date().toISOString() })
      .eq('id', workflowId)
      .eq('user_id', userId);

    return !error;
  }

  // ==========================================================================
  // Trigger Evaluation
  // ==========================================================================

  /**
   * Find workflows that match a trigger event
   */
  async findMatchingWorkflows(
    userId: string,
    triggerType: WorkflowTriggerType,
    triggerData: Record<string, unknown>
  ): Promise<Workflow[]> {
    const workflows = await this.listWorkflows(userId, {
      trigger_type: triggerType,
      is_active: true,
    });

    return workflows.filter((workflow) => this.evaluateTrigger(workflow, triggerData));
  }

  /**
   * Evaluate if a workflow's trigger matches the event data
   */
  private evaluateTrigger(workflow: Workflow, triggerData: Record<string, unknown>): boolean {
    const config = workflow.trigger_config;

    switch (workflow.trigger_type) {
      case 'lead_status_change':
        if (config.from_status && triggerData.from_status !== config.from_status) {
          return false;
        }
        if (config.to_status && triggerData.to_status !== config.to_status) {
          return false;
        }
        return true;

      case 'deal_stage_change':
        if (config.from_stage && triggerData.from_stage !== config.from_stage) {
          return false;
        }
        if (config.to_stage && triggerData.to_stage !== config.to_stage) {
          return false;
        }
        return true;

      case 'inbound_message':
        if (config.channel && triggerData.channel !== config.channel) {
          return false;
        }
        if (config.keywords && config.keywords.length > 0) {
          const body = String(triggerData.body || '').toLowerCase();
          return config.keywords.some((kw: string) => body.includes(kw.toLowerCase()));
        }
        return true;

      case 'property_match':
        // Property matching would require more complex logic
        return true;

      case 'manual':
        return true;

      default:
        return true;
    }
  }

  /**
   * Evaluate workflow conditions against context data
   */
  evaluateConditions(conditions: WorkflowCondition[], context: Record<string, unknown>): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    let result = true;
    let currentLogic: 'and' | 'or' = 'and';

    for (const condition of conditions) {
      const fieldValue = context[condition.field];
      const conditionResult = this.evaluateCondition(condition, fieldValue);

      if (currentLogic === 'and') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentLogic = condition.logic || 'and';
    }

    return result;
  }

  private evaluateCondition(condition: WorkflowCondition, fieldValue: unknown): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      default:
        return false;
    }
  }

  // ==========================================================================
  // Execution Management
  // ==========================================================================

  /**
   * Create a new workflow execution record
   */
  async createExecution(
    workflowId: string,
    triggerData: Record<string, unknown>,
    actionsTotal: number
  ): Promise<WorkflowExecution | null> {
    const insertData: WorkflowExecutionInsert = {
      workflow_id: workflowId,
      trigger_data:
        triggerData as unknown as Database['public']['Tables']['workflow_executions']['Insert']['trigger_data'],
      status: 'pending',
      actions_total: actionsTotal,
      actions_completed: 0,
      execution_log:
        [] as unknown as Database['public']['Tables']['workflow_executions']['Insert']['execution_log'],
    };

    const { data, error } = await this.supabase
      .from('workflow_executions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[WorkflowEngine] Create execution error:', error);
      return null;
    }

    return data as unknown as WorkflowExecution;
  }

  /**
   * Update execution status
   */
  async updateExecution(
    executionId: string,
    updates: {
      status?: WorkflowExecution['status'];
      actions_completed?: number;
      error_message?: string;
      execution_log?: WorkflowExecutionLog[];
    }
  ): Promise<void> {
    const updateData: Record<string, unknown> = {};

    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === 'completed' || updates.status === 'failed') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (updates.actions_completed !== undefined) {
      updateData.actions_completed = updates.actions_completed;
    }
    if (updates.error_message !== undefined) {
      updateData.error_message = updates.error_message;
    }
    if (updates.execution_log !== undefined) {
      updateData.execution_log = updates.execution_log;
    }

    await this.supabase.from('workflow_executions').update(updateData).eq('id', executionId);
  }

  /**
   * Get execution history for a workflow
   */
  async getExecutionHistory(workflowId: string, limit: number = 20): Promise<WorkflowExecution[]> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data as unknown as WorkflowExecution[];
  }

  /**
   * Increment workflow execution count
   */
  async incrementExecutionCount(workflowId: string): Promise<void> {
    // Get current count and increment
    const { data: workflow } = await this.supabase
      .from('workflows')
      .select('execution_count')
      .eq('id', workflowId)
      .single();

    const currentCount = workflow?.execution_count ?? 0;

    await this.supabase
      .from('workflows')
      .update({
        execution_count: currentCount + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq('id', workflowId);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createWorkflowEngine(supabase: SupabaseClient<Database>): WorkflowEngine {
  return new WorkflowEngine(supabase);
}
