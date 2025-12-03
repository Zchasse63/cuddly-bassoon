/**
 * Communication Types for Phase 9
 * Types for messages, templates, campaigns, workflows, and notification services
 */

// ============================================================================
// Channel & Status Types
// ============================================================================

export type MessageChannel = 'sms' | 'email' | 'voicemail' | 'in_app';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'opened'
  | 'clicked'
  | 'spam'
  | 'unsubscribed';

export type TemplateType =
  | 'outreach'
  | 'follow_up'
  | 'offer'
  | 'blast'
  | 'notification'
  | 'transactional';
export type SensitivityLevel = 'safe' | 'caution' | 'forbidden';

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'completed'
  | 'paused'
  | 'cancelled';

export type WorkflowTriggerType =
  | 'lead_status_change'
  | 'deal_stage_change'
  | 'time_based'
  | 'property_match'
  | 'inbound_message'
  | 'form_submission'
  | 'manual';

export type WorkflowExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type NotificationType =
  | 'new_message'
  | 'delivery_failure'
  | 'campaign_complete'
  | 'response_received'
  | 'deal_update'
  | 'lead_update'
  | 'buyer_match'
  | 'workflow_triggered'
  | 'system'
  | 'reminder';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  user_id: string;
  deal_id?: string | null;
  buyer_id?: string | null;
  lead_id?: string | null;
  thread_id?: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  recipient?: string | null;
  sender?: string | null;
  subject?: string | null;
  body: string;
  status: MessageStatus;
  external_id?: string | null;
  voicemail_url?: string | null;
  transcription?: string | null;
  sensitivity_flags?: string[];
  is_read: boolean;
  read_at?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SendSMSInput {
  to: string;
  body: string;
  deal_id?: string;
  buyer_id?: string;
  lead_id?: string;
  template_id?: string;
  variables?: Record<string, string>;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  html_body?: string;
  deal_id?: string;
  buyer_id?: string;
  lead_id?: string;
  template_id?: string;
  variables?: Record<string, string>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  type: string;
}

export interface SendMessageResult {
  success: boolean;
  message_id?: string;
  external_id?: string;
  error?: string;
  queued?: boolean;
}

// ============================================================================
// Template Types
// ============================================================================

export interface Template {
  id: string;
  user_id: string;
  name: string;
  category?: string | null;
  channel: MessageChannel;
  template_type: TemplateType;
  subject_template?: string | null;
  body_template: string;
  variables: string[];
  sensitivity_level: SensitivityLevel;
  forbidden_topics: string[];
  approval_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  category?: string;
  channel: MessageChannel;
  template_type?: TemplateType;
  subject_template?: string;
  body_template: string;
  variables?: string[];
  sensitivity_level?: SensitivityLevel;
  forbidden_topics?: string[];
  approval_required?: boolean;
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  is_active?: boolean;
}

// Variable context for template rendering
export interface TemplateVariables {
  seller_name?: string;
  property_address?: string;
  offer_amount?: string | number;
  buyer_name?: string;
  user_name?: string;
  user_phone?: string;
  user_email?: string;
  company_name?: string;
  [key: string]: string | number | undefined;
}

// ============================================================================
// Campaign Types
// ============================================================================

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  deal_id?: string | null;
  template_id?: string | null;
  channel: 'sms' | 'email';
  recipient_criteria: CampaignRecipientCriteria;
  status: CampaignStatus;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  messages_total: number;
  messages_sent: number;
  messages_delivered: number;
  messages_opened: number;
  messages_clicked: number;
  messages_failed: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipientCriteria {
  buyer_ids?: string[];
  buyer_filters?: {
    min_budget?: number;
    max_budget?: number;
    property_types?: string[];
    markets?: string[];
    is_verified?: boolean;
  };
  lead_ids?: string[];
  list_id?: string;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  deal_id?: string;
  template_id: string;
  channel: 'sms' | 'email';
  recipient_criteria: CampaignRecipientCriteria;
  scheduled_at?: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  trigger_type: WorkflowTriggerType;
  trigger_config: WorkflowTriggerConfig;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTriggerConfig {
  // For lead_status_change
  from_status?: string;
  to_status?: string;
  // For deal_stage_change
  from_stage?: string;
  to_stage?: string;
  // For time_based
  schedule?: string; // cron expression
  timezone?: string;
  // For property_match
  property_criteria?: Record<string, unknown>;
  // For inbound_message
  channel?: MessageChannel;
  keywords?: string[];
}

export interface WorkflowTrigger {
  type: WorkflowTriggerType;
  config: WorkflowTriggerConfig;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
  logic?: 'and' | 'or';
}

export type WorkflowActionType =
  | 'send_sms'
  | 'send_email'
  | 'create_task'
  | 'update_lead_status'
  | 'update_deal_stage'
  | 'assign_to_user'
  | 'add_to_list'
  | 'notify_user'
  | 'delay';

export interface WorkflowAction {
  type: WorkflowActionType;
  config: WorkflowActionConfig;
  order: number;
}

export interface WorkflowActionConfig {
  // For send_sms / send_email
  template_id?: string;
  custom_message?: string;
  // For create_task
  task_title?: string;
  task_description?: string;
  due_in_days?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  // For update_lead_status
  new_status?: string;
  // For update_deal_stage
  new_stage?: string;
  // For assign_to_user
  assign_to?: string;
  // For add_to_list
  list_id?: string;
  // For notify_user
  notification_type?: NotificationType;
  notification_message?: string;
  // For delay
  delay_minutes?: number;
  delay_unit?: 'minutes' | 'hours' | 'days';
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  trigger_type: WorkflowTriggerType;
  trigger_config: WorkflowTriggerConfig;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  is_active?: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_data: Record<string, unknown>;
  status: WorkflowExecutionStatus;
  actions_completed: number;
  actions_total: number;
  started_at: string;
  completed_at?: string | null;
  error_message?: string | null;
  execution_log: WorkflowExecutionLog[];
  created_at: string;
}

export interface WorkflowExecutionLog {
  action_index: number;
  action_type: WorkflowActionType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  result?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  link?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string | null;
  dismissed_at?: string | null;
  snoozed_until?: string | null;
  created_at: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  entity_type?: string;
  entity_id?: string;
  priority?: NotificationPriority;
}

// ============================================================================
// Service Status Types
// ============================================================================

export interface CommunicationServiceStatus {
  twilio: ServiceStatus;
  sendgrid: ServiceStatus;
}

export interface ServiceStatus {
  configured: boolean;
  available: boolean;
  error?: string;
}

// ============================================================================
// Sensitivity Filter Types
// ============================================================================

export interface SensitivityCheckResult {
  is_safe: boolean;
  sensitivity_level: SensitivityLevel;
  detected_topics: DetectedTopic[];
  suggestions?: string[];
}

export interface DetectedTopic {
  topic: string;
  category: SensitivityCategory;
  matched_text: string;
  position: { start: number; end: number };
}

export type SensitivityCategory =
  | 'divorce'
  | 'foreclosure'
  | 'death_probate'
  | 'health'
  | 'legal'
  | 'financial_distress';

// ============================================================================
// Conversation Thread Types
// ============================================================================

export interface ConversationThread {
  thread_id: string;
  contact_identifier: string;
  contact_name?: string;
  channels: MessageChannel[];
  message_count: number;
  unread_count: number;
  last_message: Message;
  messages: Message[];
  deal_id?: string;
  lead_id?: string;
  buyer_id?: string;
}

export interface InboxFilters {
  channel?: MessageChannel;
  status?: MessageStatus;
  is_read?: boolean;
  deal_id?: string;
  lead_id?: string;
  buyer_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Opt-Out Types
// ============================================================================

export interface OptOut {
  id: string;
  user_id: string;
  contact_identifier: string;
  channel: 'sms' | 'email' | 'all';
  reason?: string | null;
  opted_out_at: string;
}
