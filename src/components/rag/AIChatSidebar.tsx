'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, PanelRightClose, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { AIContextBar, ContextBadge } from '@/components/ai/AIContextBar';
import { cn } from '@/lib/utils';

// Lazy load EnhancedChatInterface - heavy component with AI SDK
const EnhancedChatInterface = dynamic(
  () =>
    import('@/components/ai/EnhancedChatInterface').then((mod) => ({
      default: mod.EnhancedChatInterface,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

const AI_SIDEBAR_COOKIE = 'ai-sidebar-state';

/**
 * AI Chat Sidebar
 *
 * Per UI_UX_DESIGN_SYSTEM_v1.md:
 * - Width: 360px (not 380px)
 * - Persistent right sidebar on all pages
 * - AI is the primary interaction method
 */
interface AIChatSidebarProps {
  defaultOpen?: boolean;
}

export function AIChatSidebar({ defaultOpen = true }: AIChatSidebarProps) {
  const isMobile = useIsMobile();

  // Initialize state lazily from localStorage
  const [localIsOpen, setLocalIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AI_SIDEBAR_COOKIE);
      return saved !== null ? saved === 'true' : defaultOpen;
    }
    return defaultOpen;
  });

  // Use local state for sidebar management
  const isOpen = localIsOpen;
  const toggleSidebar = () => setLocalIsOpen((prev) => !prev);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(AI_SIDEBAR_COOKIE, String(isOpen));
  }, [isOpen]);

  // Mobile: Use Sheet (overlay)
  if (isMobile) {
    return (
      <>
        {/* Floating trigger button */}
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-50 size-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={toggleSidebar}
        >
          <MessageSquare className="size-6" />
        </Button>

        <Sheet open={isOpen} onOpenChange={toggleSidebar}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                AI Assistant
              </SheetTitle>
            </SheetHeader>
            <EnhancedChatInterface
              className="flex-1"
              persistKey="ai-chat-sidebar"
              placeholder="Ask me anything about your properties, deals, or buyers..."
              showOnboarding={false}
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Fluid OS Glass HUD - 360px width
  return (
    <aside
      className={cn(
        'w-[360px] flex-shrink-0',
        'glass-high border-l border-white/10',
        'flex flex-col h-full',
        'shadow-[-8px_0_32px_rgba(0,0,0,0.08)]'
      )}
    >
      {/* Header - Glass styling */}
      <div className="chat-header flex-shrink-0 glass-subtle border-b border-white/10">
        <div className="chat-header__title">
          <Sparkles className="size-5 text-primary" />
          <span className="font-semibold">Scout</span>
          <ContextBadge />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
          className="hover:bg-white/10 transition-colors"
        >
          <PanelRightClose className="size-5" />
        </Button>
      </div>

      {/* Context Bar - shows current entity and quick actions */}
      <AIContextBar className="border-b border-white/10" />

      {/* Chat interface - transparent background for glass effect */}
      <EnhancedChatInterface
        className="flex-1 min-h-0 overflow-hidden bg-transparent"
        persistKey="ai-chat-sidebar"
        placeholder="Ask Scout anything..."
        showOnboarding={false}
      />
    </aside>
  );
}
