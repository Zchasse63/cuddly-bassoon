'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * SplitViewLayout Component - Fluid OS Spatial Layout
 *
 * Source: Fluid_OS_Master_Plan.md & UI_UX_DESIGN_SYSTEM_v1.md
 *
 * SPATIAL OPERATING SYSTEM approach:
 * - Layer 0: Map as FULL background (not trapped in a box)
 * - Layer 1: Floating glass filter bar at top
 * - Layer 2: Floating glass list panel on right edge
 *
 * The map is the "world" - UI elements float over it with glass materials.
 *
 * Layout Structure (Z-Axis):
 * ```
 * ┌──────────────────────────────────────────────────┐
 * │  [Layer 0] Full-bleed Map (background)           │
 * │  ┌──────────────────────────────────────────┐    │
 * │  │ [Layer 1] Floating Glass Filter Bar       │    │
 * │  └──────────────────────────────────────────┘    │
 * │                                    ┌────────────┐│
 * │                                    │ [Layer 2]  ││
 * │                                    │ Glass List ││
 * │                                    │ Panel      ││
 * │                                    │            ││
 * │                                    └────────────┘│
 * └──────────────────────────────────────────────────┘
 * ```
 */

interface SplitViewLayoutProps {
  filterBar: ReactNode;
  mapPanel: ReactNode;
  listPanel: ReactNode;
  className?: string;
}

export function SplitViewLayout({
  filterBar,
  mapPanel,
  listPanel,
  className,
}: SplitViewLayoutProps) {
  return (
    <div className={cn('split-view-layout', 'relative h-full w-full overflow-hidden', className)}>
      {/* Layer 0: Map as full background */}
      <div className="absolute inset-0 z-0">{mapPanel}</div>

      {/* Layer 1: Floating Glass Filter Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="pointer-events-auto glass-card rounded-2xl shadow-lg">{filterBar}</div>
      </div>

      {/* Layer 2: Floating Glass Property List Panel */}
      <div
        className={cn(
          'absolute top-24 right-4 bottom-4 z-20',
          'w-[400px] pointer-events-auto',
          'glass-high rounded-2xl shadow-xl',
          'border border-white/20',
          'flex flex-col overflow-hidden',
          'transition-all duration-300 ease-spring-standard',
          // Subtle hover lift effect
          'hover:shadow-2xl hover:translate-y-[-2px]'
        )}
      >
        {listPanel}
      </div>
    </div>
  );
}

/**
 * Tablet Responsive Variant - Fluid OS
 *
 * Map as background, floating glass panels
 */

interface SplitViewLayoutTabletProps extends SplitViewLayoutProps {
  isListOpen: boolean;
  onToggleList: () => void;
}

export function SplitViewLayoutTablet({
  filterBar,
  mapPanel,
  listPanel,
  isListOpen,
  onToggleList,
  className,
}: SplitViewLayoutTabletProps) {
  return (
    <div
      className={cn(
        'split-view-layout-tablet',
        'relative h-screen w-full overflow-hidden',
        className
      )}
    >
      {/* Layer 0: Full-bleed Map */}
      <div className="absolute inset-0 z-0">{mapPanel}</div>

      {/* Layer 1: Floating Glass Filter Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3 pointer-events-none">
        <div className="pointer-events-auto glass-card rounded-2xl shadow-lg">{filterBar}</div>
      </div>

      {/* Layer 2: Slide-over Glass List Panel */}
      <div
        className={cn(
          'absolute top-20 right-0 bottom-0 z-20',
          'w-[380px]',
          'glass-high border-l border-white/20 shadow-2xl',
          'transform transition-transform duration-300 ease-spring-standard',
          'overflow-hidden flex flex-col',
          isListOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {listPanel}
      </div>

      {/* Toggle Button - Glass Pill */}
      <button
        onClick={onToggleList}
        className={cn(
          'absolute top-24 z-30',
          'px-4 py-2 rounded-full',
          'glass-high border border-white/20 shadow-lg',
          'text-sm font-medium',
          'hover:scale-105 active:scale-95',
          'transition-all duration-200 ease-spring-snappy',
          isListOpen ? 'right-[396px]' : 'right-4'
        )}
      >
        {isListOpen ? '← Hide' : 'Show List →'}
      </button>
    </div>
  );
}

/**
 * Mobile Responsive Variant - Fluid OS
 *
 * Map as base layer with floating glass elements
 */

interface SplitViewLayoutMobileProps extends SplitViewLayoutProps {
  activeTab: 'map' | 'list';
  onTabChange: (tab: 'map' | 'list') => void;
}

export function SplitViewLayoutMobile({
  filterBar,
  mapPanel,
  listPanel,
  activeTab,
  onTabChange,
  className,
}: SplitViewLayoutMobileProps) {
  return (
    <div
      className={cn(
        'split-view-layout-mobile',
        'relative h-screen w-full overflow-hidden',
        className
      )}
    >
      {/* Layer 0: Full-bleed Map (always rendered) */}
      <div className="absolute inset-0 z-0">{mapPanel}</div>

      {/* Layer 1: Floating Glass Filter Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 pointer-events-none">
        <div className="pointer-events-auto glass-card rounded-xl shadow-lg overflow-x-auto">
          {filterBar}
        </div>
      </div>

      {/* Layer 2: Glass Tab Navigation - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 pointer-events-none">
        <div className="pointer-events-auto glass-high rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => onTabChange('map')}
              className={cn(
                'flex-1 py-3 text-sm font-medium',
                'transition-all duration-200',
                activeTab === 'map'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              )}
            >
              Map
            </button>
            <button
              onClick={() => onTabChange('list')}
              className={cn(
                'flex-1 py-3 text-sm font-medium',
                'transition-all duration-200',
                activeTab === 'list'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Layer 3: List View Overlay (when active) */}
      <div
        className={cn(
          'absolute inset-x-0 top-16 bottom-20 z-15',
          'glass-high border-t border-white/20',
          'overflow-y-auto',
          'transition-all duration-300 ease-spring-standard',
          activeTab === 'list'
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        )}
      >
        {listPanel}
      </div>
    </div>
  );
}
