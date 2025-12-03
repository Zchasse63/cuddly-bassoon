/**
 * Template Management Service
 * Handles template CRUD operations and variable substitution
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  TemplateVariables,
  MessageChannel,
} from './types';

// ============================================================================
// Template Service Class
// ============================================================================

export class TemplateService {
  constructor(private supabase: SupabaseClient<Database>) {}

  // ==========================================================================
  // CRUD Operations
  // ==========================================================================

  /**
   * Create a new template
   */
  async createTemplate(
    userId: string,
    input: CreateTemplateInput
  ): Promise<{ data: Template | null; error: string | null }> {
    // Extract variables from template
    const variables = this.extractVariables(input.body_template);
    if (input.subject_template) {
      variables.push(...this.extractVariables(input.subject_template));
    }
    const uniqueVariables = [...new Set(variables)];

    const { data, error } = await this.supabase
      .from('templates')
      .insert({
        user_id: userId,
        name: input.name,
        category: input.category,
        channel: input.channel,
        template_type: input.template_type || 'outreach',
        subject_template: input.subject_template,
        body_template: input.body_template,
        variables: uniqueVariables,
        sensitivity_level: input.sensitivity_level || 'safe',
        forbidden_topics: input.forbidden_topics || [],
        approval_required: input.approval_required || false,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[TemplateService] Create error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Template, error: null };
  }

  /**
   * Get template by ID
   */
  async getTemplate(userId: string, templateId: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[TemplateService] Get error:', error);
      return null;
    }

    return data as Template;
  }

  /**
   * List templates with optional filters
   */
  async listTemplates(
    userId: string,
    options?: {
      channel?: MessageChannel;
      category?: string;
      template_type?: string;
      is_active?: boolean;
      search?: string;
    }
  ): Promise<Template[]> {
    let query = this.supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.channel) {
      query = query.eq('channel', options.channel);
    }
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.template_type) {
      query = query.eq('template_type', options.template_type);
    }
    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }
    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[TemplateService] List error:', error);
      return [];
    }

    return data as Template[];
  }

  /**
   * Update a template
   */
  async updateTemplate(
    userId: string,
    templateId: string,
    input: UpdateTemplateInput
  ): Promise<{ data: Template | null; error: string | null }> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.channel !== undefined) updateData.channel = input.channel;
    if (input.template_type !== undefined) updateData.template_type = input.template_type;
    if (input.subject_template !== undefined) updateData.subject_template = input.subject_template;
    if (input.body_template !== undefined) {
      updateData.body_template = input.body_template;
      // Re-extract variables
      const variables = this.extractVariables(input.body_template);
      if (input.subject_template) {
        variables.push(...this.extractVariables(input.subject_template));
      }
      updateData.variables = [...new Set(variables)];
    }
    if (input.sensitivity_level !== undefined)
      updateData.sensitivity_level = input.sensitivity_level;
    if (input.forbidden_topics !== undefined) updateData.forbidden_topics = input.forbidden_topics;
    if (input.approval_required !== undefined)
      updateData.approval_required = input.approval_required;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    const { data, error } = await this.supabase
      .from('templates')
      .update(updateData)
      .eq('id', templateId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Template, error: null };
  }

  /**
   * Delete a template
   */
  async deleteTemplate(userId: string, templateId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) {
      console.error('[TemplateService] Delete error:', error);
      return false;
    }

    return true;
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(
    userId: string,
    templateId: string,
    newName?: string
  ): Promise<{ data: Template | null; error: string | null }> {
    const original = await this.getTemplate(userId, templateId);
    if (!original) {
      return { data: null, error: 'Template not found' };
    }

    return this.createTemplate(userId, {
      name: newName || `${original.name} (Copy)`,
      category: original.category || undefined,
      channel: original.channel,
      template_type: original.template_type,
      subject_template: original.subject_template || undefined,
      body_template: original.body_template,
      sensitivity_level: original.sensitivity_level,
      forbidden_topics: original.forbidden_topics,
      approval_required: original.approval_required,
    });
  }

  // ==========================================================================
  // Variable Extraction & Rendering
  // ==========================================================================

  /**
   * Extract variable names from template string
   * Variables are in format {{variable_name}}
   */
  extractVariables(template: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      if (match[1]) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Render a template with variables
   */
  renderTemplate(template: string, variables: TemplateVariables): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Render a full template (subject + body)
   */
  renderFullTemplate(
    template: Template,
    variables: TemplateVariables
  ): { subject?: string; body: string } {
    return {
      subject: template.subject_template
        ? this.renderTemplate(template.subject_template, variables)
        : undefined,
      body: this.renderTemplate(template.body_template, variables),
    };
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(
    template: Template,
    variables: TemplateVariables
  ): { valid: boolean; missing: string[] } {
    const missing = template.variables.filter(
      (v) => variables[v] === undefined || variables[v] === ''
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Preview a template with sample data
   */
  previewTemplate(
    template: Template,
    sampleData?: TemplateVariables
  ): { subject?: string; body: string } {
    const defaultSampleData: TemplateVariables = {
      seller_name: 'John Smith',
      property_address: '123 Main St, Anytown, USA',
      offer_amount: '$150,000',
      buyer_name: 'Jane Doe',
      user_name: 'Your Name',
      user_phone: '(555) 123-4567',
      user_email: 'you@example.com',
      company_name: 'Your Company',
    };

    const mergedData = { ...defaultSampleData, ...sampleData };
    return this.renderFullTemplate(template, mergedData);
  }

  // ==========================================================================
  // Template Categories
  // ==========================================================================

  /**
   * Get all unique categories for user's templates
   */
  async getCategories(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('category')
      .eq('user_id', userId)
      .not('category', 'is', null);

    if (error) {
      return [];
    }

    const categories = data.map((t) => t.category).filter((c): c is string => c !== null);
    return [...new Set(categories)];
  }
}

// ============================================================================
// Default Templates
// ============================================================================

export const DEFAULT_TEMPLATES: Omit<CreateTemplateInput, 'channel'>[] = [
  {
    name: 'Initial Outreach - Seller',
    category: 'Seller Outreach',
    template_type: 'outreach',
    body_template: `Hi {{seller_name}},

I noticed your property at {{property_address}} and wanted to reach out. I'm a local real estate investor and I'm interested in making you a fair cash offer.

Would you be open to a quick conversation about selling?

Best,
{{user_name}}
{{user_phone}}`,
    sensitivity_level: 'safe',
  },
  {
    name: 'Follow Up - No Response',
    category: 'Follow Up',
    template_type: 'follow_up',
    body_template: `Hi {{seller_name}},

I reached out a few days ago about your property at {{property_address}}. I understand you're busy, but I wanted to follow up in case my message got lost.

I'm still interested in discussing a potential offer. No pressure - just let me know if you'd like to chat.

{{user_name}}`,
    sensitivity_level: 'safe',
  },
  {
    name: 'Cash Offer Presentation',
    category: 'Offers',
    template_type: 'offer',
    body_template: `Hi {{seller_name}},

Thank you for speaking with me about {{property_address}}. As promised, I'd like to present my cash offer:

Offer Amount: {{offer_amount}}

This is a no-obligation offer. We can close on your timeline and I'll cover all closing costs.

Let me know if you'd like to discuss further.

{{user_name}}
{{user_phone}}`,
    sensitivity_level: 'safe',
  },
  {
    name: 'Buyer Blast - New Deal',
    category: 'Buyer Outreach',
    template_type: 'blast',
    subject_template: 'New Investment Opportunity: {{property_address}}',
    body_template: `Hi {{buyer_name}},

I have a new deal that matches your criteria:

Property: {{property_address}}
Asking Price: {{offer_amount}}

This won't last long. Reply if you're interested in more details.

{{user_name}}
{{company_name}}`,
    sensitivity_level: 'safe',
  },
];

// ============================================================================
// Factory Function
// ============================================================================

export function createTemplateService(supabase: SupabaseClient<Database>): TemplateService {
  return new TemplateService(supabase);
}
