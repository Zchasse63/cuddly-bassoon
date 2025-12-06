import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fira_Code } from 'next/font/google';

import { ClientToaster } from '@/components/providers/client-toaster';

import './globals.css';

// Force dynamic rendering for the entire app to prevent Next.js 16 prerendering issues
export const dynamic = 'force-dynamic';

/**
 * DM Sans - Primary font (per UI_UX_DESIGN_SYSTEM_v1.md)
 * Clean, geometric sans-serif optimized for digital interfaces
 */
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

/**
 * Fira Code - Monospace font for code snippets
 */
const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: {
    default: 'AI Real Estate Platform',
    template: '%s | AI Real Estate Platform',
  },
  description:
    'AI-First Real Estate Wholesaling Platform for intelligent property analysis and deal management',
  keywords: ['real estate', 'wholesaling', 'AI', 'property analysis', 'deals'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#7551FF' }, // Brand purple
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${firaCode.variable} font-sans antialiased`}>
        {children}
        <ClientToaster />
      </body>
    </html>
  );
}
