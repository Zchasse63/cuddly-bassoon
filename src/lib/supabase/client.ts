import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses the publishable key (new API key format) which is safe to expose in the browser.
 */
export function createClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// Alias for compatibility with existing imports
export { createClient as createBrowserClient };
