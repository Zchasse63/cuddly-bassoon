'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, CreditCard, Bell, Shield, Users, Settings, UserCog } from 'lucide-react';

const settingsNav = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Subscription',
    href: '/settings/subscription',
    icon: CreditCard,
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
  },
  {
    title: 'Team',
    href: '/settings/team',
    icon: Users,
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: Settings,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: UserCog,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-4 mask-fade-right no-scrollbar">
      {settingsNav.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-surface-glass-base hover:bg-surface-glass-high hover:scale-105 text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
