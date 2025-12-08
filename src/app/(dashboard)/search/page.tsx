import { redirect } from 'next/navigation';

/**
 * Standalone AI Search Page - DEPRECATED
 *
 * This page has been replaced by the floating AI chat dialog on the /properties page.
 * AI search is now integrated directly into the split-view property search experience.
 *
 * Redirecting to /properties...
 */

export default function SearchPage() {
  redirect('/properties');
}
