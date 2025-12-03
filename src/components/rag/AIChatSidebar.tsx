'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, PanelRightClose, PanelRightOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatInterface } from './ChatInterface';

const AI_SIDEBAR_COOKIE = 'ai-sidebar-state';
const AI_SIDEBAR_WIDTH = '380px';

interface AIChatSidebarProps {
  defaultOpen?: boolean;
}

export function AIChatSidebar({ defaultOpen = true }: AIChatSidebarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMounted, setIsMounted] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(AI_SIDEBAR_COOKIE);
    if (saved !== null) {
      setIsOpen(saved === 'true');
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(AI_SIDEBAR_COOKIE, String(isOpen));
    }
  }, [isOpen, isMounted]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Mobile: Use Sheet (overlay)
  if (isMobile) {
    return (
      <>
        {/* Floating trigger button */}
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-50 size-14 rounded-full shadow-lg"
          onClick={toggleSidebar}
        >
          <MessageSquare className="size-6" />
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                AI Assistant
              </SheetTitle>
            </SheetHeader>
            <ChatInterface
              className="flex-1"
              persistKey="ai-chat-sidebar"
              placeholder="Ask me anything..."
            />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Fixed right sidebar
  return (
    <>
      {/* Collapsed state: Floating button */}
      {!isOpen && (
        <Button
          size="icon"
          variant="outline"
          className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-md"
          onClick={toggleSidebar}
        >
          <MessageSquare className="size-5" />
        </Button>
      )}

      {/* Expanded sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-30 flex flex-col border-l bg-background transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ width: AI_SIDEBAR_WIDTH }}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <Button size="icon" variant="ghost" onClick={toggleSidebar}>
            {isOpen ? <PanelRightClose className="size-5" /> : <PanelRightOpen className="size-5" />}
          </Button>
        </div>

        {/* Chat interface */}
        <ChatInterface
          className="flex-1 min-h-0"
          persistKey="ai-chat-sidebar"
          placeholder="Ask me anything..."
        />
      </div>

      {/* Spacer to push main content left when sidebar is open */}
      <div
        className={cn(
          'shrink-0 transition-[width] duration-300 ease-in-out',
          isOpen ? 'w-[380px]' : 'w-0'
        )}
      />
    </>
  );
}

