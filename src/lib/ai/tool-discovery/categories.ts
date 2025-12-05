/**
 * AI Tool Discovery Categories
 *
 * Category metadata for organizing tools in the discovery UI.
 * Categories are user-intent focused, not technical function focused.
 */

import { CategoryDefinition, DiscoveryCategory } from './types';

/**
 * Category definitions with display metadata
 */
export const categoryDefinitions: CategoryDefinition[] = [
  {
    id: 'property-search',
    displayName: 'Find Properties',
    description: 'Search for properties using natural language or filters',
    icon: 'Search',
    sortOrder: 1,
    color: 'text-blue-600',
  },
  {
    id: 'deal-analysis',
    displayName: 'Analyze Deals',
    description: 'Evaluate properties and calculate deal metrics',
    icon: 'Calculator',
    sortOrder: 2,
    color: 'text-green-600',
  },
  {
    id: 'buyer-intelligence',
    displayName: 'Buyers',
    description: 'Find and match cash buyers for your deals',
    icon: 'Users',
    sortOrder: 3,
    color: 'text-purple-600',
  },
  {
    id: 'market-research',
    displayName: 'Market Intel',
    description: 'Research market trends and conditions',
    icon: 'TrendingUp',
    sortOrder: 4,
    color: 'text-orange-600',
  },
  {
    id: 'valuation',
    displayName: 'Valuations',
    description: 'Get ARV estimates, comps, and pricing analysis',
    icon: 'DollarSign',
    sortOrder: 5,
    color: 'text-emerald-600',
  },
  {
    id: 'outreach',
    displayName: 'Outreach',
    description: 'Generate messages and manage communications',
    icon: 'MessageSquare',
    sortOrder: 6,
    color: 'text-pink-600',
  },
  {
    id: 'list-management',
    displayName: 'Lists',
    description: 'Create, manage, and organize property lists',
    icon: 'List',
    sortOrder: 7,
    color: 'text-indigo-600',
  },
  {
    id: 'pipeline',
    displayName: 'Pipeline',
    description: 'Manage deals through your sales pipeline',
    icon: 'GitBranch',
    sortOrder: 8,
    color: 'text-cyan-600',
  },
  {
    id: 'skip-tracing',
    displayName: 'Skip Tracing',
    description: 'Find owner contact information',
    icon: 'Phone',
    sortOrder: 9,
    color: 'text-yellow-600',
  },
  {
    id: 'documents',
    displayName: 'Documents',
    description: 'Generate contracts, reports, and documents',
    icon: 'FileText',
    sortOrder: 10,
    color: 'text-slate-600',
  },
  {
    id: 'automation',
    displayName: 'Automation',
    description: 'Set up automated workflows and alerts',
    icon: 'Zap',
    sortOrder: 11,
    color: 'text-amber-600',
  },
  {
    id: 'settings',
    displayName: 'Settings',
    description: 'Configure preferences and account settings',
    icon: 'Settings',
    sortOrder: 12,
    color: 'text-gray-600',
  },
  {
    id: 'help',
    displayName: 'Help',
    description: 'Get help with the platform',
    icon: 'HelpCircle',
    sortOrder: 13,
    color: 'text-gray-500',
  },
];

/**
 * Get category by ID
 */
export function getCategory(id: DiscoveryCategory): CategoryDefinition | undefined {
  return categoryDefinitions.find((cat) => cat.id === id);
}

/**
 * Get categories sorted by display order
 */
export function getSortedCategories(): CategoryDefinition[] {
  return [...categoryDefinitions].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get category color class
 */
export function getCategoryColor(id: DiscoveryCategory): string {
  return getCategory(id)?.color || 'text-gray-600';
}

/**
 * Get category icon name
 */
export function getCategoryIcon(id: DiscoveryCategory): string {
  return getCategory(id)?.icon || 'HelpCircle';
}
