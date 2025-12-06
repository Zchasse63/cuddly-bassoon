/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';

/**
 * Client-side only Toaster wrapper
 * Prevents SSR issues with sonner's context
 */
export function ClientToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Toaster position="top-right" richColors closeButton />;
}
