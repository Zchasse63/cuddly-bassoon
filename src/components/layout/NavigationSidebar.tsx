'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  Building2,
  Users,
  Handshake,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Search,
  FileText,
  BarChart3,
  Bell,
  HelpCircle,
  List,
  Filter,
  Map,
  Wrench,
  Command,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppShell } from './AppShell';

/**
 * Navigation items organized into groups per UI_UX_DESIGN_SYSTEM_v1.md Section 5
 * Reduced cognitive load with grouped categories
 */
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Main navigation - primary workflows
// Properties is now the primary entry point (split-view with map + list)
const mainNavItems: NavItem[] = [
  { title: 'Properties', href: '/properties', icon: Building2 }, // Primary - split-view search
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Deals', href: '/deals', icon: Handshake, badge: 3, badgeVariant: 'default' },
  { title: 'Buyers', href: '/buyers', icon: Users },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
];

// Tools group - secondary features
const toolsGroup: NavGroup = {
  title: 'Tools',
  icon: Wrench,
  items: [
    { title: 'Saved Lists', href: '/lists', icon: List },
    { title: 'Saved Filters', href: '/filters', icon: Filter },
    { title: 'Documents', href: '/documents', icon: FileText },
    { title: 'Team', href: '/team', icon: Users },
  ],
  defaultOpen: false,
};

const bottomNavItems: NavItem[] = [
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: 5,
    badgeVariant: 'destructive',
  },
  { title: 'Help', href: '/help', icon: HelpCircle },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface NavigationSidebarProps {
  user: User;
}

export function NavigationSidebar({ user }: NavigationSidebarProps) {
  const pathname = usePathname();
  const { leftCollapsed, toggleLeft } = useAppShell();
  const [toolsOpen, setToolsOpen] = useState(toolsGroup.defaultOpen);
  const userInitials = user.email?.slice(0, 2).toUpperCase() ?? 'U';

  // Check if any tools item is active
  const isToolsActive = toolsGroup.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          {!leftCollapsed && <span className="text-lg font-semibold">REI Platform</span>}
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleLeft} className="h-8 w-8">
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', leftCollapsed && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Quick Search Hint */}
      {!leftCollapsed && (
        <div className="px-3 py-2">
          <button
            className="flex w-full items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => {
              // Trigger command palette
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Quick search...</span>
            <kbd className="flex items-center gap-0.5 rounded bg-background px-1.5 py-0.5 text-xs border">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Primary Navigation Items */}
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'nav-item',
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!leftCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || 'secondary'}
                          className="nav-badge h-5 min-w-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {leftCollapsed && item.badge && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Tools Group - Collapsible */}
        {!leftCollapsed && (
          <Collapsible
            open={toolsOpen || isToolsActive}
            onOpenChange={setToolsOpen}
            className="mt-4"
          >
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isToolsActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Wrench className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">Tools</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    (toolsOpen || isToolsActive) && 'rotate-180'
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1 ml-4 space-y-1 border-l pl-4">
                {toolsGroup.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Collapsed Tools - Show as single icon */}
        {leftCollapsed && (
          <div className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center justify-center rounded-lg p-2 transition-colors',
                    isToolsActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Wrench className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                {toolsGroup.items.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-2">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'nav-item relative',
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!leftCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || 'secondary'}
                          className="nav-badge h-5 min-w-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {leftCollapsed && item.badge && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Menu */}
      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent',
                leftCollapsed && 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!leftCollapsed && (
                <div className="flex-1 text-left text-sm">
                  <p className="font-medium truncate">{user.email}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action="/auth/signout" method="post">
                <button type="submit" className="flex w-full items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
