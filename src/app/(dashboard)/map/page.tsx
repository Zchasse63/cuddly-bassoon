import { redirect } from 'next/navigation';

/**
 * Standalone Map Page - DEPRECATED
 *
 * This page has been replaced by the unified split-view property search at /properties.
 * The map is now integrated into the left panel of the split-view layout.
 *
 * Redirecting to /properties...
 */

export default function MapPage() {
  redirect('/properties');
}
