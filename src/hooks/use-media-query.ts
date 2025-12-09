'use client';

import { useSyncExternalStore } from 'react';

/**
 * useMediaQuery Hook
 *
 * Listens to a CSS media query and returns whether it matches.
 * Uses useSyncExternalStore for proper SSR and hydration handling.
 *
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return false; // Default to false on server
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
