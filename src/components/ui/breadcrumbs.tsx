'use client';

/**
 * Breadcrumbs Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 8
 * Route-aware navigation context
 */

import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  /** Custom label mappings for route segments */
  customLabels?: Record<string, string>;
}

// Default route segment to label mappings
const defaultRouteLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  buyers: 'Buyers',
  deals: 'Deals',
  analytics: 'Analytics',
  settings: 'Settings',
  team: 'Team',
  lists: 'Lists',
  filters: 'Filters',
  documents: 'Documents',
  market: 'Market',
  map: 'Map',
  search: 'Search',
  notifications: 'Notifications',
  help: 'Help',
  inbox: 'Inbox',
  leads: 'Leads',
  profile: 'Profile',
  account: 'Account',
  security: 'Security',
  preferences: 'Preferences',
  subscription: 'Subscription',
  communications: 'Communications',
  markets: 'Markets',
  reports: 'Reports',
  heatmap: 'Heatmap',
  new: 'New',
};

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  customLabels = {},
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = useMemo(() => {
    if (items) return items;

    const segments = pathname.split('/').filter(Boolean);
    const allLabels = { ...defaultRouteLabels, ...customLabels };

    const generatedItems: BreadcrumbItem[] = [];

    segments.forEach((segment, index) => {
      // Skip dashboard group segment
      if (segment === '(dashboard)') return;

      // Check if this is a dynamic segment (UUID or ID)
      const isId = /^[0-9a-f-]{36}$|^\d+$/.test(segment);

      if (isId) {
        // For IDs, we'll use a generic label - this would be enhanced with actual data
        generatedItems.push({
          label: 'Details',
          href: '/' + segments.slice(0, index + 1).join('/'),
        });
      } else {
        const label = allLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        generatedItems.push({
          label,
          href: '/' + segments.slice(0, index + 1).join('/'),
        });
      }
    });

    return generatedItems;
  }, [items, pathname, customLabels]);

  // Don't render if only home or empty
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center space-x-1 text-sm">
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <Fragment key={item.href || index}>
              <li className="flex items-center text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="flex items-center">
                {isLast ? (
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumb context for dynamic labels
 * Allows pages to set custom labels for their breadcrumb items
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface BreadcrumbContextValue {
  dynamicLabels: Record<string, string>;
  setLabel: (path: string, label: string) => void;
  clearLabel: (path: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>({});

  const setLabel = useCallback((path: string, label: string) => {
    setDynamicLabels((prev) => ({ ...prev, [path]: label }));
  }, []);

  const clearLabel = useCallback((path: string) => {
    setDynamicLabels((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ dynamicLabels, setLabel, clearLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbLabel(path: string, label: string) {
  const context = useContext(BreadcrumbContext);

  // Set label on mount, clear on unmount
  useState(() => {
    if (context) {
      context.setLabel(path, label);
    }
    return () => {
      if (context) {
        context.clearLabel(path);
      }
    };
  });
}

/**
 * Enhanced Breadcrumbs that uses context for dynamic labels
 */
export function DynamicBreadcrumbs(props: Omit<BreadcrumbsProps, 'customLabels'>) {
  const context = useContext(BreadcrumbContext);
  return <Breadcrumbs {...props} customLabels={context?.dynamicLabels} />;
}
