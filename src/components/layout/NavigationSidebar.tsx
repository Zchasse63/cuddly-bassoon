'use client';

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
  Search,
  FileText,
  BarChart3,
  Bell,
  HelpCircle,
  List,
  Filter,
  TrendingUp,
  Map,
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
import { useAppShell } from './AppShell';

/**
 * Navigation items per UI_UX_DESIGN_SYSTEM_v1.md Section 5
 * 11 items total in the navigation hierarchy
 */
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Properties', href: '/properties', icon: Building2 },
  { title: 'Buyers', href: '/buyers', icon: Users },
  { title: 'Deals', href: '/deals', icon: Handshake, badge: 3, badgeVariant: 'default' },
  { title: 'Team', href: '/team', icon: Users },
  { title: 'Lists', href: '/lists', icon: List },
  { title: 'Filters', href: '/filters', icon: Filter },
  { title: 'Documents', href: '/documents', icon: FileText },
  { title: 'Analytics', href: '/analytics', icon: BarChart3 },
  { title: 'Market', href: '/market', icon: TrendingUp },
  { title: 'Map', href: '/map', icon: Map },
  { title: 'Search', href: '/search', icon: Search },
];

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
  const userInitials = user.email?.slice(0, 2).toUpperCase() ?? 'U';

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

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
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
