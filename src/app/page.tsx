import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LandingPageClient } from './landing-client';

// Force dynamic rendering - this page uses auth
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to /properties (new default landing)
  if (user) {
    redirect('/properties');
  }

  return <LandingPageClient />;
}
