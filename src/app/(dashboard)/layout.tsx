import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { AppShell, AppShellProvider } from '@/components/layout/AppShell';
import { NavigationSidebar } from '@/components/layout/NavigationSidebar';
import { ViewContextProvider } from '@/contexts/ViewContext';
import { GlobalProviders } from '@/components/layout/GlobalProviders';
import { AIChatSidebarWrapper } from './ai-chat-wrapper';

// Force dynamic rendering - this layout uses auth
export const dynamic = 'force-dynamic';

/**
 * Dashboard Layout
 *
 * Uses AppShell for three-column CSS Grid layout per UI_UX_DESIGN_SYSTEM_v1.md:
 * - Left Sidebar: 240px (navigation)
 * - Main Content: flexible (1fr)
 * - Right Sidebar: 360px (AI Chat)
 *
 * ViewContextProvider enables AI context awareness across all pages.
 * GlobalProviders includes Command Palette (Cmd+K) and Breadcrumb context.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <ViewContextProvider>
      <GlobalProviders>
        <AppShellProvider>
          <AppShell
            leftSidebar={<NavigationSidebar user={user} />}
            rightSidebar={<AIChatSidebarWrapper />}
          >
            <div className="page-content">{children}</div>
          </AppShell>
        </AppShellProvider>
      </GlobalProviders>
    </ViewContextProvider>
  );
}
