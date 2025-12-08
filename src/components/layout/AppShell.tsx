'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav, MobileActionFAB, MobileChatSheet } from './MobileNav';

/**
 * AppShell - Three-column CSS Grid layout (Desktop) / Single column (Mobile)
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 3
 *
 * Desktop Layout: [Left Sidebar (240px)] [Main Content (1fr)] [Right Sidebar (360px)]
 * Mobile Layout: Full-width content with bottom navigation
 *
 * AI Positioning Strategy (v1.1):
 * - /properties: Floating AI dialog (bottom center)
 * - All other pages: Right sidebar (360px)
 */

interface AppShellContextValue {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeftCollapsed: (collapsed: boolean) => void;
  setRightCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  mobileChatOpen: boolean;
  setMobileChatOpen: (open: boolean) => void;
  /** Whether AI should be rendered as floating dialog (true) or sidebar (false) */
  useFloatingAI: boolean;
}

/**
 * Determine if current route should use floating AI dialog
 *
 * UPDATED: All pages now use persistent AI sidebar for consistency.
 * The floating dialog pattern is deprecated in favor of always-visible chat.
 */
function shouldUseFloatingAI(_pathname: string): boolean {
  // All pages now use persistent sidebar, no floating AI
  return false;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within an AppShellProvider');
  }
  return context;
}

interface AppShellProviderProps {
  children: ReactNode;
  defaultLeftCollapsed?: boolean;
  defaultRightCollapsed?: boolean;
}

export function AppShellProvider({
  children,
  defaultLeftCollapsed = false,
  defaultRightCollapsed = false,
}: AppShellProviderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [leftCollapsed, setLeftCollapsed] = useState(defaultLeftCollapsed);
  const [rightCollapsed, setRightCollapsed] = useState(defaultRightCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const toggleLeft = useCallback(() => setLeftCollapsed((prev) => !prev), []);
  const toggleRight = useCallback(() => setRightCollapsed((prev) => !prev), []);

  // Determine AI positioning based on current route
  const useFloatingAI = shouldUseFloatingAI(pathname);

  return (
    <AppShellContext.Provider
      value={{
        leftCollapsed,
        rightCollapsed,
        toggleLeft,
        toggleRight,
        setLeftCollapsed,
        setRightCollapsed,
        isMobile,
        mobileMenuOpen,
        setMobileMenuOpen,
        mobileChatOpen,
        setMobileChatOpen,
        useFloatingAI,
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
}

interface AppShellProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  className?: string;
}

export function AppShell({ children, leftSidebar, rightSidebar, className }: AppShellProps) {
  const router = useRouter();
  const {
    leftCollapsed,
    rightCollapsed,
    isMobile,
    mobileChatOpen,
    setMobileChatOpen,
    useFloatingAI,
  } = useAppShell();

  // Mobile layout
  if (isMobile) {
    return (
      <div className={cn('app-shell-mobile min-h-screen bg-background', className)}>
        {/* Main Content with bottom padding for nav */}
        <main className="main-content-mobile pb-20">{children}</main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Mobile FAB for quick actions */}
        <MobileActionFAB
          onOpenChat={() => setMobileChatOpen(true)}
          onAddProperty={() => {
            // Navigate to add property - can be customized per page
            router.push('/properties/new');
          }}
        />

        {/* Mobile Chat Sheet */}
        {rightSidebar && (
          <MobileChatSheet open={mobileChatOpen} onOpenChange={setMobileChatOpen}>
            {rightSidebar}
          </MobileChatSheet>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div
      className={cn(
        'app-shell',
        leftCollapsed && 'left-collapsed',
        rightCollapsed && 'right-collapsed',
        useFloatingAI && 'floating-ai', // Add class when using floating AI
        className
      )}
    >
      {/* Left Sidebar */}
      {leftSidebar && <aside className="sidebar-left">{leftSidebar}</aside>}

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Right Sidebar (AI Chat) - Only render if NOT using floating AI */}
      {rightSidebar && !useFloatingAI && (
        <aside className="sidebar-right">{rightSidebar}</aside>
      )}
    </div>
  );
}

// CSS to add to globals.css or a separate layout.css
export const appShellStyles = `
/* App Shell - Three Column CSS Grid Layout */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-left-width) 1fr auto;
  grid-template-rows: 100vh;
  height: 100vh;
  overflow: hidden;
  transition: grid-template-columns var(--transition-normal) var(--ease-in-out);
}

/* Floating AI mode - no right sidebar */
.app-shell.floating-ai {
  grid-template-columns: var(--sidebar-left-width) 1fr;
}

.app-shell.floating-ai.left-collapsed {
  grid-template-columns: var(--sidebar-left-collapsed-width) 1fr;
}

/* Collapsed states */
.app-shell.left-collapsed {
  grid-template-columns: var(--sidebar-left-collapsed-width) 1fr auto;
}

.app-shell.right-collapsed {
  grid-template-columns: var(--sidebar-left-width) 1fr 0px;
}

.app-shell.left-collapsed.right-collapsed {
  grid-template-columns: var(--sidebar-left-collapsed-width) 1fr 0px;
}

/* Sidebar containers */
.sidebar-left {
  position: relative;
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid var(--border);
  background: var(--sidebar);
}

.sidebar-right {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--background);
}

/* Main content area - no scroll, children handle their own scrolling */
.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-gray-50, #F7FAFC);
}

.dark .main-content {
  background: var(--color-gray-900, #171923);
}
`;
