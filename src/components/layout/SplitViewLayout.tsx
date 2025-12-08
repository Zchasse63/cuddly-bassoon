'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * SplitViewLayout Component
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 3 (Layout System) & Section 11 (Page Templates)
 * 
 * Main container for split-view property search layout:
 * - Row 1: Horizontal filter bar (auto height)
 * - Row 2: Split content - Map (left) + List (right)
 * - Floating AI dialog positioned at bottom center (rendered separately)
 * 
 * Layout Structure:
 * ```
 * ┌─────────────────────────────────────────┐
 * │  Horizontal Filter Bar                  │
 * ├──────────────────┬──────────────────────┤
 * │                  │                      │
 * │  Map Panel       │  Property List Panel │
 * │  (1fr)           │  (380-480px)         │
 * │                  │                      │
 * └──────────────────┴──────────────────────┘
 * ```
 * 
 * Responsive Breakpoints:
 * - Desktop (1280px+): Side-by-side map + list
 * - Tablet (768-1023px): Slide-over list panel
 * - Mobile (<768px): Tab navigation between map/list
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
    <div
      className={cn(
        'split-view-layout',
        'h-full flex flex-col overflow-hidden',
        'bg-muted/30',
        className
      )}
    >
      {/* Row 1: Filter Bar */}
      <div className="split-view-layout__filter-bar flex-shrink-0 bg-background border-b shadow-sm">
        {filterBar}
      </div>

      {/* Row 2: Split Content (Map + List) */}
      <div className="split-view-layout__content flex-1 min-h-0 grid grid-cols-[1fr_400px] gap-4 p-4 overflow-hidden">
        {/* Left: Map Panel */}
        <div className="split-view-layout__map relative overflow-hidden rounded-xl border bg-card shadow-sm">
          {mapPanel}
        </div>

        {/* Right: Property List Panel */}
        <div className="split-view-layout__list rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
          {listPanel}
        </div>
      </div>
    </div>
  );
}

/**
 * Tablet Responsive Variant
 * 
 * For tablet breakpoint (768-1023px), list becomes a slide-over panel.
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
        'h-screen flex flex-col',
        'bg-background',
        className
      )}
    >
      {/* Filter Bar */}
      <div className="flex-shrink-0">
        {filterBar}
      </div>

      {/* Content: Full-width map with slide-over list */}
      <div className="flex-1 min-h-0 relative">
        {/* Map (full width) */}
        <div className="absolute inset-0">
          {mapPanel}
        </div>

        {/* Slide-over List Panel */}
        <div
          className={cn(
            'absolute top-0 right-0 bottom-0',
            'w-[380px] bg-card border-l shadow-lg',
            'transform transition-transform duration-300',
            'overflow-y-auto',
            isListOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {listPanel}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggleList}
          className={cn(
            'absolute top-4 right-4 z-10',
            'px-4 py-2 rounded-lg',
            'bg-background border shadow-md',
            'hover:bg-accent transition-colors'
          )}
        >
          {isListOpen ? 'Hide List' : 'Show List'}
        </button>
      </div>
    </div>
  );
}

/**
 * Mobile Responsive Variant
 * 
 * For mobile breakpoint (<768px), use tab navigation between map and list.
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
        'h-screen flex flex-col',
        'bg-background',
        className
      )}
    >
      {/* Filter Bar (scrollable) */}
      <div className="flex-shrink-0 overflow-x-auto">
        {filterBar}
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 flex border-b">
        <button
          onClick={() => onTabChange('map')}
          className={cn(
            'flex-1 py-3 text-sm font-medium',
            'transition-colors',
            activeTab === 'map'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Map
        </button>
        <button
          onClick={() => onTabChange('list')}
          className={cn(
            'flex-1 py-3 text-sm font-medium',
            'transition-colors',
            activeTab === 'list'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          List
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        {/* Map View */}
        <div className={cn('absolute inset-0', activeTab !== 'map' && 'hidden')}>
          {mapPanel}
        </div>

        {/* List View */}
        <div className={cn('absolute inset-0 overflow-y-auto', activeTab !== 'list' && 'hidden')}>
          {listPanel}
        </div>
      </div>
    </div>
  );
}

