'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, PanelRightClose, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { EnhancedChatInterface } from '@/components/ai/EnhancedChatInterface';
import { AIContextBar, ContextBadge } from '@/components/ai/AIContextBar';
import { ResizableSidebar } from '@/components/layout/ResizableSidebar';

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

  // Desktop: Integrated with AppShell grid layout with resizable sidebar
  return (
    <ResizableSidebar side="right" className="border-l bg-background">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="chat-header flex-shrink-0">
          <div className="chat-header__title">
            <Sparkles className="size-5 text-primary" />
            <span>AI Assistant</span>
            <ContextBadge />
          </div>
          <Button size="icon" variant="ghost" onClick={toggleSidebar}>
            <PanelRightClose className="size-5" />
          </Button>
        </div>

        {/* Context Bar - shows current entity and quick actions */}
        <AIContextBar />

        {/* Chat interface */}
        <EnhancedChatInterface
          className="flex-1 min-h-0 overflow-hidden"
          persistKey="ai-chat-sidebar"
          placeholder="Ask me anything about your properties, deals, or buyers..."
          showOnboarding={false}
        />
      </div>
    </ResizableSidebar>
  );
}
