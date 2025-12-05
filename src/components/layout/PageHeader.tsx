'use client';

/**
 * Page Header Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 * Consistent header with breadcrumbs and optional actions
 */

import { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Custom breadcrumb items */
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
  }>;
  /** Hide breadcrumbs */
  hideBreadcrumbs?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  breadcrumbItems,
  hideBreadcrumbs = false,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {!hideBreadcrumbs && <Breadcrumbs items={breadcrumbItems} className="mb-4" />}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
}
