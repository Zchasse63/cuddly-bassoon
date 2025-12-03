'use client';

import { Search, BarChart3, FileText, Phone, Plus, Sparkles, Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useViewContextSafe, type ViewType } from '@/contexts/ViewContext';

/**
 * Quick Actions Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 8
 *
 * Context-aware action buttons displayed at the bottom of the AI chat.
 * Actions change based on the current page/entity context.
 */

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

const QUICK_ACTIONS_BY_VIEW: Record<ViewType, QuickAction[]> = {
  dashboard: [
    {
      id: 'analyze',
      label: 'Analyze',
      icon: BarChart3,
      prompt: 'Analyze my current pipeline and give me insights',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      prompt: 'Help me find properties matching my criteria',
    },
    { id: 'notes', label: 'Notes', icon: FileText, prompt: 'Show me my recent notes and tasks' },
  ],
  properties: [
    {
      id: 'search',
      label: 'AI Search',
      icon: Sparkles,
      prompt: 'Help me find properties with specific criteria',
    },
    {
      id: 'analyze',
      label: 'Analyze',
      icon: BarChart3,
      prompt: 'Analyze the properties in my current view',
    },
    { id: 'add', label: 'Add', icon: Plus, prompt: 'Help me add a new property' },
  ],
  'property-detail': [
    {
      id: 'analyze',
      label: 'Analyze',
      icon: BarChart3,
      prompt: 'Analyze this property for a potential deal',
    },
    {
      id: 'search',
      label: 'Comps',
      icon: Search,
      prompt: 'Find comparable properties for this address',
    },
    { id: 'notes', label: 'Notes', icon: FileText, prompt: 'Add notes about this property' },
    {
      id: 'contact',
      label: 'Contact',
      icon: Phone,
      prompt: 'Help me draft outreach for this property owner',
    },
  ],
  buyers: [
    {
      id: 'search',
      label: 'Find',
      icon: Search,
      prompt: 'Help me find buyers matching specific criteria',
    },
    { id: 'match', label: 'Match', icon: Users, prompt: 'Match buyers to my available properties' },
    { id: 'add', label: 'Add', icon: Plus, prompt: 'Help me add a new buyer' },
  ],
  'buyer-detail': [
    {
      id: 'match',
      label: 'Match',
      icon: Building2,
      prompt: "Find properties matching this buyer's criteria",
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Phone,
      prompt: 'Help me draft a message to this buyer',
    },
    { id: 'notes', label: 'Notes', icon: FileText, prompt: 'Add notes about this buyer' },
  ],
  deals: [
    { id: 'analyze', label: 'Analyze', icon: BarChart3, prompt: 'Analyze my deal pipeline' },
    { id: 'add', label: 'Add Deal', icon: Plus, prompt: 'Help me create a new deal' },
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my deals' },
  ],
  'deal-detail': [
    {
      id: 'analyze',
      label: 'Analyze',
      icon: BarChart3,
      prompt: 'Analyze this deal and provide recommendations',
    },
    {
      id: 'docs',
      label: 'Docs',
      icon: FileText,
      prompt: 'Help me generate documents for this deal',
    },
    { id: 'contact', label: 'Contact', icon: Phone, prompt: 'Draft communication for this deal' },
  ],
  documents: [
    {
      id: 'generate',
      label: 'Generate',
      icon: Sparkles,
      prompt: 'Help me generate a new document',
    },
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my documents' },
  ],
  analytics: [
    { id: 'report', label: 'Report', icon: FileText, prompt: 'Generate a performance report' },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      prompt: 'Give me insights about my business',
    },
  ],
  search: [
    { id: 'refine', label: 'Refine', icon: Sparkles, prompt: 'Help me refine my search criteria' },
    { id: 'save', label: 'Save', icon: Plus, prompt: 'Save this search for later' },
  ],
  settings: [],
  notifications: [],
  help: [
    { id: 'docs', label: 'Docs', icon: FileText, prompt: 'Show me the documentation' },
    { id: 'support', label: 'Support', icon: Phone, prompt: 'I need help with something' },
  ],
  team: [
    { id: 'analyze', label: 'Analyze', icon: BarChart3, prompt: 'Analyze team performance' },
    { id: 'add', label: 'Add Member', icon: Plus, prompt: 'Help me add a new team member' },
  ],
  lists: [
    { id: 'create', label: 'Create', icon: Plus, prompt: 'Help me create a new list' },
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my lists' },
  ],
  filters: [
    { id: 'create', label: 'Create', icon: Plus, prompt: 'Help me create a new filter' },
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my saved filters' },
  ],
  market: [
    { id: 'analyze', label: 'Analyze', icon: BarChart3, prompt: 'Analyze market trends' },
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search market data' },
  ],
  map: [
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search properties on the map' },
    { id: 'analyze', label: 'Analyze', icon: BarChart3, prompt: 'Analyze this area' },
  ],
  leads: [
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my leads' },
    { id: 'analyze', label: 'Analyze', icon: BarChart3, prompt: 'Analyze lead quality' },
    { id: 'add', label: 'Add', icon: Plus, prompt: 'Help me add a new lead' },
  ],
  'analytics-buyers': [
    { id: 'report', label: 'Report', icon: FileText, prompt: 'Generate a buyer analytics report' },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      prompt: 'Give me insights about buyer behavior',
    },
  ],
  'analytics-communications': [
    { id: 'report', label: 'Report', icon: FileText, prompt: 'Generate a communications report' },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      prompt: 'Analyze my communication effectiveness',
    },
  ],
  'analytics-deals': [
    { id: 'report', label: 'Report', icon: FileText, prompt: 'Generate a deals analytics report' },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      prompt: 'Give me insights about deal performance',
    },
  ],
  'analytics-heatmap': [
    { id: 'analyze', label: 'Analyze', icon: BarChart3, prompt: 'Analyze this geographic area' },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      prompt: 'Search for opportunities in this area',
    },
  ],
  'analytics-markets': [
    { id: 'report', label: 'Report', icon: FileText, prompt: 'Generate a market analysis report' },
    { id: 'insights', label: 'Insights', icon: Sparkles, prompt: 'Give me market insights' },
  ],
  'analytics-reports': [
    { id: 'generate', label: 'Generate', icon: Sparkles, prompt: 'Generate a new report' },
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my reports' },
  ],
  inbox: [
    { id: 'search', label: 'Search', icon: Search, prompt: 'Search my messages' },
    { id: 'compose', label: 'Compose', icon: Plus, prompt: 'Help me compose a message' },
  ],
  onboarding: [
    { id: 'help', label: 'Help', icon: Sparkles, prompt: 'Help me get started with the platform' },
    { id: 'guide', label: 'Guide', icon: FileText, prompt: 'Show me a quick start guide' },
  ],
};

interface QuickActionsProps {
  className?: string;
  onActionClick?: (prompt: string) => void;
}

export function QuickActions({ className, onActionClick }: QuickActionsProps) {
  const viewContext = useViewContextSafe();
  const currentView = viewContext?.currentView || 'dashboard';
  const actions = QUICK_ACTIONS_BY_VIEW[currentView] || [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={cn('quick-actions', className)}>
      <span className="quick-actions__label">Quick Actions:</span>
      <div className="quick-actions__buttons">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            className="quick-actions__button"
            onClick={() => onActionClick?.(action.prompt)}
          >
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Inline Quick Actions for the input area
 */
interface InlineQuickActionsProps {
  onActionClick?: (prompt: string) => void;
}

export function InlineQuickActions({ onActionClick }: InlineQuickActionsProps) {
  const viewContext = useViewContextSafe();
  const currentView = viewContext?.currentView || 'dashboard';
  const actions = QUICK_ACTIONS_BY_VIEW[currentView]?.slice(0, 4) || [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 px-3 pb-2">
      {actions.map((action) => (
        <button
          key={action.id}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          onClick={() => onActionClick?.(action.prompt)}
        >
          <action.icon className="h-3 w-3" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
