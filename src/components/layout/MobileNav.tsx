'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  Handshake,
  Users,
  MoreHorizontal,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

/**
 * Mobile Bottom Navigation
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 * Provides thumb-friendly navigation on mobile devices with:
 * - 5-tab bottom navigation bar
 * - Active state indicators
 * - Safe area padding for notched devices
 */

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'properties', label: 'Properties', icon: Building2, href: '/properties' },
  { id: 'pipeline', label: 'Pipeline', icon: Handshake, href: '/pipeline' },
  { id: 'buyers', label: 'Buyers', icon: Users, href: '/buyers' },
  { id: 'more', label: 'More', icon: MoreHorizontal, href: '#more' },
];

const moreMenuItems: NavItem[] = [
  { id: 'documents', label: 'Documents', icon: Building2, href: '/documents' },
  { id: 'settings', label: 'Settings', icon: Building2, href: '/settings' },
  { id: 'analytics', label: 'Analytics', icon: Building2, href: '/analytics' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleNavClick = useCallback(
    (item: NavItem) => {
      if (item.id === 'more') {
        setMoreOpen(true);
      } else {
        router.push(item.href);
      }
    },
    [router]
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <>
      <nav
        className={cn(
          'mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50',
          'glass-high border-t border-[var(--border-highlight)]',
          'shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Safe area padding for notched devices */}
        <div className="flex items-center justify-around h-16 px-2 pb-safe">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.id === 'more' ? moreOpen : isActive(item.href);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'mobile-nav-item flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] rounded-xl transition-all duration-200 touch-manipulation',
                  active
                    ? 'text-[var(--fluid-brand)] bg-[var(--fluid-brand)]/10'
                    : 'text-[var(--fluid-text-secondary)] hover:text-[var(--fluid-text-primary)] active:bg-[var(--surface-glass-subtle)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform',
                      active && 'stroke-[2.5px] scale-110'
                    )}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--fluid-danger)] text-[10px] font-medium text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>More Options</SheetTitle>
            <SheetDescription>Additional navigation options</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {moreMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setMoreOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Mobile Floating Action Button (FAB)
 *
 * Provides quick access to primary actions:
 * - Add new property/deal/buyer
 * - Open AI chat
 * - Quick search
 */

interface MobileFABAction {
  id: string;
  label: string;
  icon: typeof Plus;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'ai';
}

interface MobileFABProps {
  onAddProperty?: () => void;
  onAddDeal?: () => void;
  onAddBuyer?: () => void;
  onOpenChat?: () => void;
  onOpenSearch?: () => void;
}

export function MobileActionFAB({
  onAddProperty,
  onAddDeal,
  onAddBuyer,
  onOpenChat,
  onOpenSearch,
}: MobileFABProps) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  const actions: MobileFABAction[] = [];

  if (onOpenSearch) {
    actions.push({
      id: 'search',
      label: 'Search',
      icon: Search,
      onClick: onOpenSearch,
    });
  }

  if (onOpenChat) {
    actions.push({
      id: 'chat',
      label: 'AI Chat',
      icon: Sparkles,
      onClick: onOpenChat,
      variant: 'ai',
    });
  }

  if (onAddProperty) {
    actions.push({
      id: 'property',
      label: 'Add Property',
      icon: Building2,
      onClick: onAddProperty,
    });
  }

  if (onAddDeal) {
    actions.push({
      id: 'deal',
      label: 'Add Deal',
      icon: Handshake,
      onClick: onAddDeal,
    });
  }

  if (onAddBuyer) {
    actions.push({
      id: 'buyer',
      label: 'Add Buyer',
      icon: Users,
      onClick: onAddBuyer,
    });
  }

  if (!isMobile || actions.length === 0) return null;

  return (
    <>
      {/* Backdrop when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* FAB Container */}
      <div className="fixed right-4 bottom-20 z-50 flex flex-col-reverse items-end gap-3">
        {/* Action buttons (shown when expanded) */}
        {expanded &&
          actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="px-3 py-1.5 bg-background rounded-lg shadow-md text-sm font-medium">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  variant={action.variant === 'ai' ? 'default' : 'secondary'}
                  className={cn(
                    'h-12 w-12 rounded-full shadow-lg touch-manipulation',
                    action.variant === 'ai' && 'bg-brand-500 hover:bg-brand-600 text-white'
                  )}
                  onClick={() => {
                    action.onClick();
                    setExpanded(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </div>
            );
          })}

        {/* Main FAB button */}
        <Button
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-xl btn-gradient touch-manipulation',
            'transition-transform duration-200',
            expanded && 'rotate-45'
          )}
          onClick={() => setExpanded(!expanded)}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">{expanded ? 'Close menu' : 'Open quick actions'}</span>
        </Button>
      </div>
    </>
  );
}

/**
 * Mobile Header
 *
 * Compact header for mobile with:
 * - Menu toggle
 * - Page title
 * - Quick actions (search, AI)
 */

interface MobileHeaderProps {
  title?: string;
  onMenuToggle?: () => void;
  onSearch?: () => void;
  onChat?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function MobileHeader({
  title,
  onMenuToggle,
  onSearch,
  onChat,
  showBackButton,
  onBack,
}: MobileHeaderProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack, router]);

  if (!isMobile) return null;

  return (
    <header className="mobile-header sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Left section */}
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={handleBack} className="touch-manipulation">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="sr-only">Go back</span>
          </Button>
        ) : onMenuToggle ? (
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="touch-manipulation">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="sr-only">Open menu</span>
          </Button>
        ) : null}
        {title && <h1 className="text-lg font-semibold truncate">{title}</h1>}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {onSearch && (
          <Button variant="ghost" size="icon" onClick={onSearch} className="touch-manipulation">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}
        {onChat && (
          <Button variant="ghost" size="icon" onClick={onChat} className="touch-manipulation">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Open AI chat</span>
          </Button>
        )}
      </div>
    </header>
  );
}

/**
 * Mobile AI Chat Sheet
 *
 * Full-screen sheet for AI chat on mobile
 */

interface MobileChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function MobileChatSheet({ open, onOpenChange, children }: MobileChatSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>AI Assistant</SheetTitle>
          <SheetDescription>Chat with the AI assistant</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {/* Drag handle */}
          <div className="flex justify-center py-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          {/* Chat content */}
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
