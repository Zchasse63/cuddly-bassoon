/**
 * Buyer Qualification Workflow
 * Manages qualification stages and transitions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { QualificationStage, BuyerStatus } from './types';

// Qualification stage definitions
export const QUALIFICATION_STAGES: {
  stage: QualificationStage;
  label: string;
  description: string;
  actions: string[];
}[] = [
  {
    stage: 'new',
    label: 'New',
    description: 'Buyer has been added but not yet contacted',
    actions: ['Make initial contact', 'Verify contact information'],
  },
  {
    stage: 'contacted',
    label: 'Contacted',
    description: 'Initial conversation has taken place',
    actions: ['Request proof of funds', 'Discuss buying criteria'],
  },
  {
    stage: 'pof_received',
    label: 'POF Received',
    description: 'Proof of funds document has been received',
    actions: ['Verify POF validity', 'Review buying power'],
  },
  {
    stage: 'verified',
    label: 'Verified',
    description: 'Buyer is verified and ready to transact',
    actions: ['Send matching deals', 'Schedule property viewings'],
  },
  {
    stage: 'qualified',
    label: 'Qualified',
    description: 'Buyer has completed at least one transaction',
    actions: ['Maintain relationship', 'Priority deal notifications'],
  },
];

// Valid stage transitions
const VALID_TRANSITIONS: Record<QualificationStage, QualificationStage[]> = {
  new: ['contacted'],
  contacted: ['pof_received', 'new'],
  pof_received: ['verified', 'contacted'],
  verified: ['qualified', 'pof_received'],
  qualified: ['verified'], // Can be demoted if issues arise
};

export interface QualificationQuestions {
  propertiesLastYear?: number;
  paymentMethod?: 'cash' | 'financing' | 'both';
  averageTimeline?: string;
  typicalDealSize?: number;
}

export class QualificationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get current qualification stage from buyer status
   */
  getStageFromStatus(status: BuyerStatus | null): QualificationStage {
    switch (status) {
      case 'qualified':
        return 'qualified';
      case 'active':
        return 'verified';
      case 'inactive':
        return 'new';
      case 'unqualified':
        return 'new';
      default:
        return 'new';
    }
  }

  /**
   * Get buyer status from qualification stage
   */
  getStatusFromStage(stage: QualificationStage): BuyerStatus {
    switch (stage) {
      case 'qualified':
        return 'qualified';
      case 'verified':
        return 'active';
      case 'pof_received':
        return 'active';
      case 'contacted':
        return 'active';
      case 'new':
      default:
        return 'inactive';
    }
  }

  /**
   * Check if a stage transition is valid
   */
  canTransition(from: QualificationStage, to: QualificationStage): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Get the next possible stages
   */
  getNextStages(current: QualificationStage): QualificationStage[] {
    return VALID_TRANSITIONS[current] || [];
  }

  /**
   * Get stage info
   */
  getStageInfo(stage: QualificationStage) {
    return QUALIFICATION_STAGES.find((s) => s.stage === stage);
  }

  /**
   * Update buyer qualification stage
   */
  async updateStage(
    buyerId: string,
    userId: string,
    newStage: QualificationStage
  ): Promise<void> {
    const newStatus = this.getStatusFromStage(newStage);

    const { error } = await this.supabase
      .from('buyers')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', buyerId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update qualification stage: ${error.message}`);
    }
  }

  /**
   * Get qualification progress percentage
   */
  getProgress(stage: QualificationStage): number {
    const stageIndex = QUALIFICATION_STAGES.findIndex((s) => s.stage === stage);
    if (stageIndex === -1) return 0;
    return ((stageIndex + 1) / QUALIFICATION_STAGES.length) * 100;
  }

  /**
   * Check if buyer needs attention based on stage
   */
  needsAttention(stage: QualificationStage, lastContactDate?: Date): boolean {
    if (stage === 'new' || stage === 'contacted') {
      // Needs follow-up if no contact in 7 days
      if (!lastContactDate) return true;
      const daysSinceContact = Math.floor(
        (Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceContact > 7;
    }
    return false;
  }
}

export function getQualificationStages() {
  return QUALIFICATION_STAGES;
}

