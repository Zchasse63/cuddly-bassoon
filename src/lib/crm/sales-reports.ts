/**
 * Sales Intelligence Reports
 * Generation of caller briefings, property analysis, and negotiation guides
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { SalesReport, CreateSalesReportInput, ReportType } from './types';
import { LeadWithDetails } from './types';
import { DealWithDetails } from '../deals/types';
import { getMotivationLevel } from './lead-workflow';

export interface CallerBriefingContent {
  property_address: string;
  owner_name?: string;
  motivation_level: string;
  key_points: string[];
  suggested_opening: string;
  objection_handlers: Record<string, string>;
  next_steps: string[];
}

export interface PropertyAnalysisContent {
  property_address: string;
  estimated_arv: number;
  estimated_repairs: number;
  max_offer: number;
  comparable_sales: Array<{ address: string; price: number; date: string }>;
  market_trends: string[];
  investment_summary: string;
}

export interface NegotiationGuideContent {
  deal_summary: string;
  seller_profile: string;
  price_anchors: {
    opening: number;
    target: number;
    maximum: number;
    walkAway: number;
  };
  negotiation_tactics: string[];
  common_objections: Record<string, string>;
  closing_techniques: string[];
}

/**
 * Generate caller briefing for a lead
 */
export function generateCallerBriefing(lead: LeadWithDetails): CallerBriefingContent {
  const motivationLevel = getMotivationLevel(lead.motivation_score || 50);

  const keyPoints: string[] = [];
  if (lead.source) keyPoints.push(`Source: ${lead.source.replace('_', ' ')}`);
  if (lead.motivation_score)
    keyPoints.push(`Motivation: ${lead.motivation_score}/100 (${motivationLevel})`);
  if (lead.total_contacts) keyPoints.push(`Previous contacts: ${lead.total_contacts}`);
  if (lead.last_contact_date) {
    const days = Math.floor(
      (Date.now() - new Date(lead.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    keyPoints.push(`Last contact: ${days} days ago`);
  }

  const suggestedOpening =
    motivationLevel === 'hot'
      ? `Hi ${lead.owner_name || 'there'}, I'm calling about the property at ${lead.property_address}. I understand you might be looking to sell - I'd love to make you a fair cash offer today.`
      : `Hi ${lead.owner_name || 'there'}, this is [Name] calling about your property at ${lead.property_address}. Do you have a moment to chat about your plans for the property?`;

  const objectionHandlers: Record<string, string> = {
    'Not interested':
      "I completely understand. Before I let you go, may I ask - is it the timing that's not right, or is there something specific about selling that concerns you?",
    'Want market value':
      'I hear you. Let me share how our process works - we buy properties as-is, cover all closing costs, and can close in as little as 7 days. When you factor in those savings, our offers are very competitive.',
    'Need to think about it':
      "Absolutely, take your time. What information would be helpful for you to make a decision? I'm happy to send over a written offer for you to review.",
    'Already have an agent':
      "That's great you're working with a professional. I work with many agents - would you like me to reach out to them directly about a potential cash offer?",
  };

  return {
    property_address: lead.property_address,
    owner_name: lead.owner_name || undefined,
    motivation_level: motivationLevel,
    key_points: keyPoints,
    suggested_opening: suggestedOpening,
    objection_handlers: objectionHandlers,
    next_steps: [
      'Confirm property ownership and interest level',
      'Understand timeline and motivation',
      'Schedule property viewing if interested',
      'Prepare initial offer range',
    ],
  };
}

/**
 * Generate property analysis report
 */
export function generatePropertyAnalysis(
  deal: DealWithDetails,
  comparables: Array<{ address: string; price: number; date: string }> = []
): PropertyAnalysisContent {
  const arv = deal.estimated_arv || 0;
  const repairs = deal.estimated_repairs || 0;
  const maxOffer = Math.round(arv * 0.7 - repairs);

  return {
    property_address: deal.property_address,
    estimated_arv: arv,
    estimated_repairs: repairs,
    max_offer: maxOffer,
    comparable_sales: comparables,
    market_trends: [
      'Market data would be populated from external sources',
      'Comparable sales analysis pending',
    ],
    investment_summary: `Property at ${deal.property_address} with ARV of $${arv.toLocaleString()} and estimated repairs of $${repairs.toLocaleString()}. Maximum recommended offer: $${maxOffer.toLocaleString()} using 70% rule.`,
  };
}

/**
 * Generate negotiation guide
 */
export function generateNegotiationGuide(
  deal: DealWithDetails,
  strategy: { optimal: number; target: number; maximum: number; walkAway: number }
): NegotiationGuideContent {
  return {
    deal_summary: `${deal.property_address} - Currently in ${deal.stage} stage`,
    seller_profile: deal.seller_name ? `Seller: ${deal.seller_name}` : 'Seller information pending',
    price_anchors: {
      opening: strategy.optimal,
      target: strategy.target,
      maximum: strategy.maximum,
      walkAway: strategy.walkAway,
    },
    negotiation_tactics: [
      'Start with optimal price and justify with repair estimates',
      'If counter-offered, move incrementally (5-10k at a time)',
      'Emphasize speed and certainty of close',
      'Offer flexible closing date as a concession instead of price',
    ],
    common_objections: {
      'Price too low': 'Walk through the repair costs and comparable sales',
      'Need more time': 'Offer to keep the offer open for 7 days',
      'Other offers': "Ask for the opportunity to match - we're serious buyers",
    },
    closing_techniques: [
      'Would a 14-day close work for your timeline?',
      'What if we could cover all your closing costs?',
      'If we can agree on price today, I can have the contract ready by tomorrow',
    ],
  };
}

export class SalesReportService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async saveReport(userId: string, input: CreateSalesReportInput): Promise<SalesReport> {
    const title = input.title || `${input.report_type.replace('_', ' ')} Report`;
    const { data, error } = await this.supabase
      .from('sales_reports')
      .insert({
        user_id: userId,
        deal_id: input.deal_id,
        lead_id: input.lead_id,
        report_type: input.report_type,
        title: title,
        content:
          input.content as Database['public']['Tables']['sales_reports']['Insert']['content'],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save report: ${error.message}`);
    }

    return data as SalesReport;
  }

  async getReports(userId: string, type?: ReportType, limit = 20): Promise<SalesReport[]> {
    let query = this.supabase
      .from('sales_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('report_type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get reports: ${error.message}`);
    }

    return (data || []) as SalesReport[];
  }
}
