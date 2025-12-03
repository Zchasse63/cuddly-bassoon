import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, CreditCard, Bell, Shield, Users, Settings, UserCog } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings and preferences',
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsNav = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Your personal information',
  },
  {
    title: 'Subscription',
    href: '/settings/subscription',
    icon: CreditCard,
    description: 'Manage your plan and billing',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email and push preferences',
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Password and two-factor auth',
  },
  {
    title: 'Team',
    href: '/settings/team',
    icon: Users,
    description: 'Manage team members',
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: Settings,
    description: 'App customization',
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: UserCog,
    description: 'Account management',
  },
];

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Settings Navigation */}
        <aside className="lg:w-64">
          <nav className="flex flex-col space-y-1">
            {settingsNav.map((item) => (
              <SettingsNavItem key={item.href} {...item} />
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

interface SettingsNavItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function SettingsNavItem({ title, href, icon: Icon, description }: SettingsNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4" />
      <div className="flex-1">
        <span className="font-medium">{title}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
