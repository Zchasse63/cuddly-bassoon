/**
 * Supabase client exports
 *
 * Usage:
 * - Client Components: import { createClient } from "@/lib/supabase/client"
 * - Server Components/Actions: import { createClient, createAdminClient } from "@/lib/supabase/server"
 */

// Re-export for convenience (though direct imports are recommended for tree-shaking)
export { createClient } from './client';
export { createClient as createServerClient, createAdminClient } from './server';
