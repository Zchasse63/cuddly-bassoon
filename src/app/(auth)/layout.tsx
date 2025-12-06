/**
 * Auth Route Group Layout
 * Force dynamic rendering to prevent SSR issues with auth pages
 */

export const dynamic = 'force-dynamic';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
