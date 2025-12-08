'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav, MobileActionFAB, MobileChatSheet } from './MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/animations';

/**
 * Fluid Real Estate OS - AppShell (Tri-Pane Layout)
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 3 & 4
 *
 * Architecture:
 * 1. Command Rail (Left): 60px/240px glass rail
 * 2. Canvas (Center): Main workspace
 * 3. Scout Pane (Right): 320px persistent AI sidebar
 *
 * Philosophy: "Liquid Glass" - Layout floats on a blurred background
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
  scoutVisible: boolean;
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
  defaultLeftCollapsed = true, // Default to collapsed command rail
  defaultRightCollapsed = false,
}: AppShellProviderProps) {
  const isMobile = useIsMobile();
  const [leftCollapsed, setLeftCollapsed] = useState(defaultLeftCollapsed);
  const [rightCollapsed, setRightCollapsed] = useState(defaultRightCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

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
        isMobile,
        mobileMenuOpen,
        setMobileMenuOpen,
        mobileChatOpen,
        setMobileChatOpen,
        scoutVisible: !rightCollapsed && !isMobile,
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
  const { leftCollapsed, isMobile, mobileChatOpen, setMobileChatOpen, scoutVisible } =
    useAppShell();

  // Mobile layout - Bottom Navigation Paradigm
  if (isMobile) {
    return (
      <div className={cn('app-shell-mobile min-h-[100dvh] bg-background', className)}>
        {/* Main Content with bottom padding for nav */}
        <main className="main-content-mobile flex-1 pb-20 overflow-y-auto overscroll-y-contain">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Glass) */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MobileBottomNav />
        </div>

        {/* Mobile FAB for quick actions (Scout trigger) */}
        <MobileActionFAB
          onOpenChat={() => setMobileChatOpen(true)}
          onAddProperty={() => router.push('/properties/new')}
        />

        {/* Mobile Scout Sheet (Slide Up) */}
        <AnimatePresence>
          {mobileChatOpen && rightSidebar && (
            <MobileChatSheet open={mobileChatOpen} onOpenChange={setMobileChatOpen}>
              {rightSidebar}
            </MobileChatSheet>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop Layout - Liquid Glass Tri-Pane
  return (
    <div
      className={cn(
        'app-shell layer-base min-h-screen overflow-hidden bg-background',
        // Grid setup defined in CSS for performance, classes toggle state
        leftCollapsed ? 'left-collapsed' : 'left-expanded',
        !scoutVisible ? 'right-collapsed' : 'right-expanded',
        className
      )}
      style={
        {
          '--sidebar-left-width': '240px',
          '--sidebar-left-collapsed-width': '60px',
          '--sidebar-right-width': '320px',
        } as React.CSSProperties
      }
    >
      {/* 1. Command Rail (Left) */}
      {leftSidebar && (
        <aside
          className={cn(
            'sidebar-left glass-base transition-all duration-300 ease-spring-standard',
            leftCollapsed ? 'w-[60px]' : 'w-[240px]'
          )}
        >
          {leftSidebar}
        </aside>
      )}

      {/* 2. Canvas (Center) */}
      <main className="main-content flex-1 relative overflow-hidden bg-gray-50/50 dark:bg-gray-900/50">
        {/* Background decorative elements could go here */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50 bg-noise" />

        {/* Actual page content */}
        <div className="relative z-10 w-full h-full overflow-y-auto">{children}</div>
      </main>

      {/* 3. Scout Pane (Right) */}
      <AnimatePresence mode="wait">
        {scoutVisible && rightSidebar && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={springPresets.standard}
            className="sidebar-right w-[320px] glass-high border-l border-white/20 shadow-2xl z-20"
          >
            {rightSidebar}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
