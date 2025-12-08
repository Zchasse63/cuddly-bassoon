/**
 * Property Detail Page
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md, Fluid_Real_Estate_OS_Design_System.md
 * Displays full property details with Bento Grid layout (Fluid OS)
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PropertyService } from '@/lib/properties/property-service';
import { PropertyDetailBento } from '@/components/property/PropertyDetailBento';
import { PropertyDetailSkeleton } from './property-detail-skeleton';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const propertyService = new PropertyService(supabase);
  const property = await propertyService.getProperty(id, user.id);

  if (!property) {
    notFound();
  }

  // Get related deals
  const relatedDeals = await propertyService.getRelatedDeals(id, user.id);

  return (
    <Suspense fallback={<PropertyDetailSkeleton />}>
      <PropertyDetailBento property={property} relatedDeals={relatedDeals} />
    </Suspense>
  );
}
