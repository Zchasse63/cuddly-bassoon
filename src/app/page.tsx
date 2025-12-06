import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

// Force dynamic rendering - this page uses auth
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold">AI Real Estate Platform</span>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
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
          <Link href="/signup">
            <Button size="lg" className="min-w-[150px]">
              Start Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="min-w-[150px]">
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AI Real Estate Platform. All rights reserved.
      </footer>
    </div>
  );
}
