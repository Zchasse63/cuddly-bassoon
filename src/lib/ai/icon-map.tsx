/**
 * Shared icon mapping for AI tool components
 *
 * Centralized icon mapping to avoid duplication across AIToolPalette,
 * ToolTransparency, and OnboardingModal components.
 */

import {
  Search,
  Calculator,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  GitBranch,
  Phone,
  FileText,
  Settings,
  HelpCircle,
  List,
  Zap,
  Sparkles,
  Home,
  Star,
  Scale,
  Mail,
  Target,
  UserCheck,
  MapPin,
  Bell,
  Bookmark,
  StickyNote,
  Hammer,
  Gauge,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  UserSearch,
  Wrench,
  AlertTriangle,
  Activity,
  Map,
  Flame,
  Upload,
} from 'lucide-react';

/**
 * Map of icon names to their Lucide React components.
 * Add new icons here - they will be available in all AI tool components.
 */
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Calculator,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  GitBranch,
  Phone,
  FileText,
  Settings,
  HelpCircle,
  List,
  Zap,
  Sparkles,
  Home,
  Star,
  Scale,
  Mail,
  Target,
  UserCheck,
  MapPin,
  Bell,
  Bookmark,
  StickyNote,
  Hammer,
  Gauge,
  GitCompare,
  BarChart3,
  FileSpreadsheet,
  UserSearch,
  Wrench,
  AlertTriangle,
  Activity,
  Map,
  Flame,
  Upload,
};

/**
 * Get an icon component by name with a fallback.
 * @param iconName - Name of the icon (e.g., 'Search', 'Calculator')
 * @param fallback - Fallback icon component (default: Wrench)
 * @returns The icon component
 *
 * NOTE: This function returns a component type. To avoid React's
 * "cannot create components during render" error, either:
 * 1. Use the returned component with createElement: React.createElement(getIcon('Search'), { className: '...' })
 * 2. Use renderIcon() helper which returns JSX directly
 * 3. Memoize the icon lookup outside the render function
 */
export function getIcon(
  iconName: string,
  fallback: React.ComponentType<{ className?: string }> = Wrench
): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || fallback;
}

/**
 * Render an icon directly as a React element.
 * Use this in render functions to avoid "cannot create components during render" errors.
 * @param iconName - Name of the icon
 * @param className - CSS class name for the icon
 * @param fallback - Fallback icon component
 * @returns React element
 */
export function renderIcon(
  iconName: string,
  className?: string,
  fallback: React.ComponentType<{ className?: string }> = Wrench
): React.ReactElement {
  const IconComponent = iconMap[iconName] || fallback;
  return <IconComponent className={className} />;
}
