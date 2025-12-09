import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Leads - Redirecting',
};

/**
 * Legacy /leads route - redirects to unified /pipeline
 * The leads and deals functionality has been consolidated into a single Pipeline view.
 * Filter by early stages (lead, contacted) to see what was previously called "leads".
 */
export default function LeadsPage() {
  redirect('/pipeline?stage=lead,contacted');
}
