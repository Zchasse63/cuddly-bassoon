'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';

/**
 * LandingPageClient Component
 * 
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 11 (Page Templates)
 * 
 * Public landing page with auth modal instead of dedicated auth pages.
 * 
 * Features:
 * - Marketing/informational content
 * - Auth modal trigger buttons
 * - Redirect to /properties after successful auth
 */

export function LandingPageClient() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  const openLoginModal = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold">AI Real Estate Platform</span>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" onClick={openLoginModal}>
                Sign In
              </Button>
              <Button onClick={openSignupModal}>
                Get Started
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            AI-Powered Real Estate Wholesaling
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Leverage artificial intelligence to analyze properties, match buyers, and close deals
            faster than ever before.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="min-w-[150px]" onClick={openSignupModal}>
              Start Free
            </Button>
            <Button size="lg" variant="outline" className="min-w-[150px]" onClick={openLoginModal}>
              Sign In
            </Button>
          </div>
        </main>

        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AI Real Estate Platform. All rights reserved.
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </>
  );
}

