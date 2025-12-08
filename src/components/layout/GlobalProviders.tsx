'use client';

/**
 * Global Providers
 *
 * Client-side providers that need to wrap the entire app
 */

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette';
import { BreadcrumbProvider } from '@/components/ui/breadcrumbs';

interface GlobalProvidersProps {
  children: ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  const { open, setOpen } = useCommandPalette();

  // Create QueryClient instance (stable across re-renders)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BreadcrumbProvider>
        {children}
        <CommandPalette open={open} onOpenChange={setOpen} />
      </BreadcrumbProvider>
    </QueryClientProvider>
  );
}
