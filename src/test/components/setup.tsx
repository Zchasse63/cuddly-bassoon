/**
 * Component Test Setup
 *
 * Configures jsdom environment and mocks for React component testing.
 * Uses @testing-library/react and @testing-library/jest-dom.
 */

import React from 'react';
import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js image component - use createElement to avoid JSX in mock factory
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) =>
    React.createElement('img', { ...props, 'data-testid': 'next-image' }),
}));

// Mock Next.js link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}));

// Note: mapbox-gl and react-map-gl are mocked via aliases in vitest.component.config.ts
// This avoids module resolution issues with those packages

// Mock tool discovery functions used by ToolTransparency
vi.mock('@/lib/ai/tool-discovery', () => ({
  getToolDisplayName: (slug: string) => slug.replace(/_/g, ' ').replace(/\./g, ' - '),
  getToolIcon: () => 'Zap',
}));

vi.mock('@/lib/ai/icon-map', () => ({
  renderIcon: () => React.createElement('span', { 'data-testid': 'tool-icon' }, 'Icon'),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  global.fetch = originalFetch;
});
