'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * AppShell - Three-column CSS Grid layout
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 3
 *
 * Layout: [Left Sidebar (240px)] [Main Content (1fr)] [Right Sidebar (360px)]
 */

interface AppShellContextValue {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeftCollapsed: (collapsed: boolean) => void;
  setRightCollapsed: (collapsed: boolean) => void;
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
  const [leftCollapsed, setLeftCollapsed] = useState(defaultLeftCollapsed);
  const [rightCollapsed, setRightCollapsed] = useState(defaultRightCollapsed);

  const toggleLeft = useCallback(() => setLeftCollapsed((prev) => !prev), []);
  const toggleRight = useCallback(() => setRightCollapsed((prev) => !prev), []);

  return (
    <AppShellContext.Provider
      value={{
        leftCollapsed,
        rightCollapsed,
        toggleLeft,
        toggleRight,
        setLeftCollapsed,
        setRightCollapsed,
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
  const { leftCollapsed, rightCollapsed } = useAppShell();

  return (
    <div
      className={cn(
        'app-shell',
        leftCollapsed && 'left-collapsed',
        rightCollapsed && 'right-collapsed',
        className
      )}
    >
      {/* Left Sidebar */}
      {leftSidebar && <aside className="sidebar-left">{leftSidebar}</aside>}

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Right Sidebar (AI Chat) */}
      {rightSidebar && <aside className="sidebar-right">{rightSidebar}</aside>}
    </div>
  );
}

// CSS to add to globals.css or a separate layout.css
export const appShellStyles = `
/* App Shell - Three Column CSS Grid Layout */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-left-width) 1fr var(--sidebar-right-width);
  grid-template-rows: 1fr;
  min-height: 100vh;
  transition: grid-template-columns var(--transition-normal) var(--ease-in-out);
}

/* Collapsed states */
.app-shell.left-collapsed {
  grid-template-columns: var(--sidebar-left-collapsed-width) 1fr var(--sidebar-right-width);
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
  border-left: 1px solid var(--border);
  background: var(--background);
}

/* Main content area */
.main-content {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-gray-50, #F7FAFC);
}

.dark .main-content {
  background: var(--color-gray-900, #171923);
}
`;
