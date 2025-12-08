'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { EnhancedChatInterface } from '@/components/ai/EnhancedChatInterface';

/**
 * FloatingAIDialog Component
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 9 (AI Chat Interface)
 * 
 * Floating AI chat dialog for map-centric pages (e.g., /properties split-view).
 * Two states:
 * - Collapsed: Pill-shaped trigger button at bottom center
 * - Expanded: 600x400px dialog with chat interface
 * 
 * Keyboard shortcuts:
 * - Cmd+/ or Cmd+K: Toggle dialog
 * - Escape: Close dialog
 */

interface FloatingAIDialogProps {
  className?: string;
  defaultOpen?: boolean;
}

export function FloatingAIDialog({ className, defaultOpen = false }: FloatingAIDialogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+/ or Cmd+K to toggle
      if ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.key === 'k')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleDialog = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* Collapsed State: Pill Trigger Button */}
      {!isOpen && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
            'animate-in fade-in slide-in-from-bottom-4 duration-300',
            className
          )}
        >
          <Button
            size="lg"
            onClick={toggleDialog}
            className={cn(
              'rounded-full px-6 py-3 h-auto',
              'bg-primary hover:bg-primary/90',
              'shadow-lg hover:shadow-xl',
              'transition-all duration-200',
              'flex items-center gap-2'
            )}
          >
            <Sparkles className="size-5" />
            <span className="font-medium">Ask AI</span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      )}

      {/* Expanded State: Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            'fixed bottom-6 left-1/2 -translate-x-1/2',
            'w-[600px] h-[400px]',
            'p-0 gap-0',
            'flex flex-col',
            'animate-in fade-in slide-in-from-bottom-4 duration-300',
            // Remove default dialog positioning
            'top-auto translate-y-0'
          )}
          // Prevent default close on outside click for better UX
          onPointerDownOutside={() => {
            // Allow closing by clicking outside
            setIsOpen(false);
          }}
        >
          {/* Accessible title for screen readers */}
          <DialogTitle className="sr-only">AI Assistant</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-70">
                <span className="text-xs">ESC</span>
              </kbd>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <EnhancedChatInterface
              className="h-full"
              persistKey="floating-ai-dialog"
              placeholder="Ask about properties on the map..."
              showOnboarding={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

