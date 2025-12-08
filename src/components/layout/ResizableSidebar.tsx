'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ai-sidebar-width';
const MIN_WIDTH = 320;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 380;

interface ResizableSidebarProps {
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right';
}

export function ResizableSidebar({ 
  children, 
  className,
  side = 'right' 
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          return parsed;
        }
      }
    }
    return DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist width to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, width.toString());
    }
  }, [width]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newWidth: number;

    if (side === 'right') {
      // Resize from left edge of right sidebar
      newWidth = containerRect.right - e.clientX;
    } else {
      // Resize from right edge of left sidebar
      newWidth = e.clientX - containerRect.left;
    }

    // Clamp to min/max
    newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    setWidth(newWidth);
  }, [isResizing, side]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResize]);

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full flex', className)}
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-1 z-10 cursor-col-resize',
          'hover:bg-primary/30 transition-colors',
          isResizing && 'bg-primary/50',
          side === 'right' ? 'left-0' : 'right-0'
        )}
        onMouseDown={startResize}
      >
        {/* Visual indicator */}
        <div className={cn(
          'absolute top-1/2 -translate-y-1/2 w-1 h-8 rounded-full',
          'bg-muted-foreground/20',
          side === 'right' ? 'left-0' : 'right-0'
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

