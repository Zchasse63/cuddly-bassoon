'use client';

/**
 * Global Providers
 *
 * Client-side providers that need to wrap the entire app
 */

import { ReactNode } from 'react';
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette';
import { BreadcrumbProvider } from '@/components/ui/breadcrumbs';

interface GlobalProvidersProps {
  children: ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  const { open, setOpen } = useCommandPalette();

  return (
    <BreadcrumbProvider>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </BreadcrumbProvider>
  );
}
