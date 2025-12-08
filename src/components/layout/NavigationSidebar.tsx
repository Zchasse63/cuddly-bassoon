'use client';

import { useRef, useEffect } from 'react';
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
  Search,
  FileText,
  BarChart3,
  Bell,
  HelpCircle,
  List,
  Filter,
  Wrench,
  Command,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppShell } from './AppShell';

/**
 * Fluid Real Estate OS - Command Rail
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4 & 5
 *
 * Behavior:
 * - Default: Micro-collapsed (60px)
 * - Interaction: Hover intent expands to full (240px)
 * - Material: Glass Base
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
}

// Main navigation - primary workflows
const mainNavItems: NavItem[] = [
  { title: 'Properties', href: '/properties', icon: Building2 }, // Primary
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Inbox', href: '/inbox', icon: MessageSquare, badge: 2, badgeVariant: 'default' },
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
  const { setLeftCollapsed, leftCollapsed } = useAppShell();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userInitials = user.email?.slice(0, 2).toUpperCase() ?? 'U';

  // Expansion Logic (Hover Intent)
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    // 300ms delay before expanding to prevent accidental triggering
    hoverTimeoutRef.current = setTimeout(() => {
      setLeftCollapsed(false);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setLeftCollapsed(true);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header / Brand */}
      <div className="flex h-16 items-center px-3.5 border-b border-white/10 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg text-white shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!leftCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-base font-bold text-foreground whitespace-nowrap overflow-hidden"
              >
                Fluid OS
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Quick Search */}
      <div className="px-2 py-4 shrink-0">
        <button
          className={cn(
            'flex items-center gap-3 rounded-xl border border-transparent bg-white/50 dark:bg-black/20 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/10 hover:border-white/20 transition-all duration-200 group h-10 w-full overflow-hidden',
            leftCollapsed ? 'justify-center px-0' : 'px-3'
          )}
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <Search className="h-4 w-4 shrink-0 group-hover:text-primary transition-colors" />
          {!leftCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-between overflow-hidden"
            >
              <span className="text-sm">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded bg-background/50 px-1.5 py-0.5 text-[10px] font-medium opacity-50">
                <Command className="h-3 w-3" />K
              </kbd>
            </motion.div>
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-6">
        {/* Primary App Links */}
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group overflow-hidden',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'group-hover:text-foreground'
                    )}
                  />
                  {!leftCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 truncate"
                    >
                      {item.title}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                  {item.badge && (
                    <div
                      className={cn(
                        'absolute top-2.5 flex items-center justify-center',
                        leftCollapsed ? 'right-2' : 'right-3'
                      )}
                    >
                      {leftCollapsed ? (
                        <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                      ) : (
                        <Badge
                          variant={item.badgeVariant as any}
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Tools Section */}
        <div>
          {!leftCollapsed && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Tools
            </motion.h3>
          )}
          <ul className="space-y-1">
            {toolsGroup.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group overflow-hidden',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!leftCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="truncate"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-white/10 bg-white/5 dark:bg-black/5 shrink-0">
        <ul className="space-y-1 mb-2">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors group overflow-hidden"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!leftCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="truncate"
                  >
                    {item.title}
                  </motion.span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-3 w-full rounded-xl p-2 hover:bg-white/50 dark:hover:bg-black/20 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary',
                leftCollapsed ? 'justify-center' : 'justify-start'
              )}
            >
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white/20 dark:ring-white/10">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!leftCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col items-start overflow-hidden text-left"
                >
                  <span className="text-sm font-medium truncate w-32 block text-foreground">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-32 block">
                    Pro Plan
                  </span>
                </motion.div>
              )}
              {!leftCollapsed && (
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground opacity-50" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="right"
            className="w-56 glass-high"
            sideOffset={10}
          >
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <form action="/auth/signout" method="post" className="w-full">
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
