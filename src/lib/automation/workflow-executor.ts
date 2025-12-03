/**
 * Workflow Executor
 * Executes workflow actions in sequence with error handling and logging
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  Workflow,
  WorkflowAction,
  WorkflowExecution,
  WorkflowExecutionLog,
} from '@/lib/communication/types';
import { WorkflowEngine } from './workflow-engine';
import { CommunicationService } from '@/lib/communication';

// ============================================================================
// Types
// ============================================================================

export interface ExecutionContext {
  userId: string;
  workflow: Workflow;
  execution: WorkflowExecution;
  triggerData: Record<string, unknown>;
  variables: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// Workflow Executor Class
// ============================================================================

export class WorkflowExecutor {
  private engine: WorkflowEngine;
  private commService: CommunicationService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.engine = new WorkflowEngine(supabase);
    this.commService = new CommunicationService(supabase);
  }

  // ==========================================================================
  // Main Execution
  // ==========================================================================

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    userId: string,
    workflow: Workflow,
    triggerData: Record<string, unknown>
  ): Promise<{ success: boolean; executionId?: string; error?: string }> {
    // Check conditions
    if (!this.engine.evaluateConditions(workflow.conditions, triggerData)) {
      return { success: false, error: 'Conditions not met' };
    }

    // Create execution record
    const execution = await this.engine.createExecution(
      workflow.id,
      triggerData,
      workflow.actions.length
    );

    if (!execution) {
      return { success: false, error: 'Failed to create execution record' };
    }

    // Build execution context
    const context: ExecutionContext = {
      userId,
      workflow,
      execution,
      triggerData,
      variables: { ...triggerData },
    };

    // Update status to running
    await this.engine.updateExecution(execution.id, { status: 'running' });

    // Execute actions
    const executionLog: WorkflowExecutionLog[] = [];
    let actionsCompleted = 0;
    let hasError = false;

    // Sort actions by order
    const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

    for (let i = 0; i < sortedActions.length; i++) {
      const action = sortedActions[i]!;
      const logEntry: WorkflowExecutionLog = {
        action_index: i,
        action_type: action.type,
        status: 'running',
        started_at: new Date().toISOString(),
      };

      try {
        // Handle delay action
        if (action.type === 'delay') {
          const delayMinutes = action.config.delay_minutes || 1;
          await this.delay(delayMinutes * 60 * 1000);
          logEntry.status = 'completed';
          logEntry.completed_at = new Date().toISOString();
          actionsCompleted++;
        } else {
          // Execute action
          const result = await this.executeAction(action, context);

          if (result.success) {
            logEntry.status = 'completed';
            logEntry.result = result.data;
            actionsCompleted++;

            // Store result in variables for subsequent actions
            if (result.data) {
              context.variables = { ...context.variables, ...result.data };
            }
          } else {
            logEntry.status = 'failed';
            logEntry.error = result.error;
            hasError = true;
          }

          logEntry.completed_at = new Date().toISOString();
        }
      } catch (error) {
        logEntry.status = 'failed';
        logEntry.error = error instanceof Error ? error.message : 'Unknown error';
        logEntry.completed_at = new Date().toISOString();
        hasError = true;
      }

      executionLog.push(logEntry);

      // Update execution progress
      await this.engine.updateExecution(execution.id, {
        actions_completed: actionsCompleted,
        execution_log: executionLog,
      });

      // Stop on error (could be configurable)
      if (hasError) {
        break;
      }
    }

    // Finalize execution
    const finalStatus = hasError ? 'failed' : 'completed';
    await this.engine.updateExecution(execution.id, {
      status: finalStatus,
      error_message: hasError ? executionLog.find((l) => l.error)?.error : undefined,
    });

    // Increment workflow execution count
    await this.engine.incrementExecutionCount(workflow.id);

    return {
      success: !hasError,
      executionId: execution.id,
      error: hasError ? 'One or more actions failed' : undefined,
    };
  }

  // ==========================================================================
  // Action Execution
  // ==========================================================================

  /**
   * Execute a single action
   */
  private async executeAction(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    switch (action.type) {
      case 'send_sms':
        return this.executeSendSMS(action, context);
      case 'send_email':
        return this.executeSendEmail(action, context);
      case 'create_task':
        return this.executeCreateTask(action, context);
      case 'update_lead_status':
        return this.executeUpdateLeadStatus(action, context);
      case 'update_deal_stage':
        return this.executeUpdateDealStage(action, context);
      case 'notify_user':
        return this.executeNotifyUser(action, context);
      case 'assign_to_user':
        return this.executeAssignToUser(action, context);
      case 'add_to_list':
        return this.executeAddToList(action, context);
      default:
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  }

  /**
   * Send SMS action
   */
  private async executeSendSMS(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const recipient = context.variables.phone || context.variables.recipient_phone;
    if (!recipient) {
      return { success: false, error: 'No recipient phone number' };
    }

    const body = action.config.custom_message || 'Automated message from workflow';

    const result = await this.commService.sendSMS(context.userId, {
      to: String(recipient),
      body,
      lead_id: context.variables.lead_id as string | undefined,
      deal_id: context.variables.deal_id as string | undefined,
    });

    return {
      success: result.success,
      data: result.success ? { message_id: result.message_id } : undefined,
      error: result.error,
    };
  }

  /**
   * Send email action
   */
  private async executeSendEmail(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const recipient = context.variables.email || context.variables.recipient_email;
    if (!recipient) {
      return { success: false, error: 'No recipient email' };
    }

    const body = action.config.custom_message || 'Automated message from workflow';
    const subject = 'Notification from Real Estate Platform';

    const result = await this.commService.sendEmail(context.userId, {
      to: String(recipient),
      subject,
      body,
      lead_id: context.variables.lead_id as string | undefined,
      deal_id: context.variables.deal_id as string | undefined,
    });

    return {
      success: result.success,
      data: result.success ? { message_id: result.message_id } : undefined,
      error: result.error,
    };
  }

  /**
   * Create task action
   */
  private async executeCreateTask(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (action.config.due_in_days || 1));

    const { data, error } = await this.supabase
      .from('tasks')
      .insert({
        user_id: context.userId,
        title: action.config.task_title || 'Workflow Task',
        description: action.config.task_description,
        due_date: dueDate.toISOString(),
        status: 'pending',
        priority: action.config.priority || 'medium',
        lead_id: context.variables.lead_id as string | undefined,
        deal_id: context.variables.deal_id as string | undefined,
        workflow_id: context.workflow.id,
        workflow_execution_id: context.execution.id,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { task_id: data.id } };
  }

  /**
   * Update lead status action
   */
  private async executeUpdateLeadStatus(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const leadId = context.variables.lead_id as string | undefined;
    if (!leadId) {
      return { success: false, error: 'No lead ID in context' };
    }

    const { error } = await this.supabase
      .from('leads')
      .update({ status: action.config.new_status })
      .eq('id', leadId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { new_status: action.config.new_status } };
  }

  /**
   * Update deal stage action
   */
  private async executeUpdateDealStage(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const dealId = context.variables.deal_id as string | undefined;
    if (!dealId) {
      return { success: false, error: 'No deal ID in context' };
    }

    const { error } = await this.supabase
      .from('deals')
      .update({ stage: action.config.new_stage })
      .eq('id', dealId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { new_stage: action.config.new_stage } };
  }

  /**
   * Notify user action
   */
  private async executeNotifyUser(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const { error } = await this.supabase.from('notifications').insert({
      user_id: context.userId,
      type: action.config.notification_type || 'workflow_triggered',
      title: `Workflow: ${context.workflow.name}`,
      message: action.config.notification_message || 'Workflow action completed',
      entity_type: 'workflow',
      entity_id: context.workflow.id,
      priority: 'normal',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Assign to user action
   */
  private async executeAssignToUser(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const assignTo = action.config.assign_to;
    if (!assignTo) {
      return { success: false, error: 'No assignee specified' };
    }

    const leadId = context.variables.lead_id as string | undefined;
    const dealId = context.variables.deal_id as string | undefined;

    // Try to assign lead or deal
    if (leadId) {
      await this.supabase.from('leads').update({ assigned_to: assignTo }).eq('id', leadId);
    }

    if (dealId) {
      await this.supabase.from('deals').update({ assigned_to: assignTo }).eq('id', dealId);
    }

    return { success: true, data: { assigned_to: assignTo } };
  }

  /**
   * Add to list action
   */
  private async executeAddToList(
    action: WorkflowAction,
    context: ExecutionContext
  ): Promise<ActionResult> {
    const listId = action.config.list_id;
    const leadId = context.variables.lead_id as string | undefined;

    if (!listId) {
      return { success: false, error: 'No list ID specified' };
    }

    if (!leadId) {
      return { success: false, error: 'No lead ID in context' };
    }

    const { error } = await this.supabase.from('lead_list_members').insert({
      lead_id: leadId,
      lead_list_id: listId,
      added_by: context.userId,
    });

    if (error) {
      // Ignore duplicate key errors (already in list)
      if (error.code === '23505') {
        return { success: true, data: { already_in_list: true } };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: { list_id: listId, lead_id: leadId } };
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Trigger Handler
// ============================================================================

/**
 * Handle a trigger event and execute matching workflows
 */
export async function handleTrigger(
  supabase: SupabaseClient<Database>,
  userId: string,
  triggerType: Workflow['trigger_type'],
  triggerData: Record<string, unknown>
): Promise<{ executed: number; errors: string[] }> {
  const engine = new WorkflowEngine(supabase);
  const executor = new WorkflowExecutor(supabase);

  const matchingWorkflows = await engine.findMatchingWorkflows(userId, triggerType, triggerData);

  const errors: string[] = [];
  let executed = 0;

  for (const workflow of matchingWorkflows) {
    const result = await executor.executeWorkflow(userId, workflow, triggerData);
    if (result.success) {
      executed++;
    } else if (result.error) {
      errors.push(`${workflow.name}: ${result.error}`);
    }
  }

  return { executed, errors };
}

// ============================================================================
// Factory Function
// ============================================================================

export function createWorkflowExecutor(supabase: SupabaseClient<Database>): WorkflowExecutor {
  return new WorkflowExecutor(supabase);
}
