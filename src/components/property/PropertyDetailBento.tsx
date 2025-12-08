'use client';

/**
 * PropertyDetailBento - Bento Grid Property Detail View
 * 
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Replaces the traditional scroll-of-death with a non-linear scanning layout
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BentoGrid } from '@/components/property/bento';
import type { PropertyWithDetails } from '@/lib/properties/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface PropertyDetailBentoProps {
  property: PropertyWithDetails;
  relatedDeals?: Array<{
    id: string;
    stage: string | null;
    status: string | null;
    createdAt: string;
  }>;
}

export function PropertyDetailBento({ property, relatedDeals: _relatedDeals }: PropertyDetailBentoProps) {
  const router = useRouter();
  const [isSkipTracing, setIsSkipTracing] = useState(false);
  const [showCreateDealDialog, setShowCreateDealDialog] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  const handleCall = () => {
    const phone = property.ownerDetails?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const handleSkipTrace = async () => {
    setIsSkipTracing(true);
    try {
      // TODO: Implement skip trace API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Skip trace completed');
    } catch (error) {
      console.error('Skip trace error:', error);
      toast.error('Skip trace failed');
    } finally {
      setIsSkipTracing(false);
    }
  };

  const handleCreateDeal = async () => {
    setIsCreatingDeal(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_address: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
          property_id: property.id,
          stage: 'lead',
          seller_name: property.ownerName,
          asking_price: property.estimatedValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to create deal');

      const { deal } = await response.json();
      toast.success('Deal created successfully');
      setShowCreateDealDialog(false);
      router.push(`/deals/${deal.id}`);
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal');
    } finally {
      setIsCreatingDeal(false);
    }
  };

  const handleGenerateOffer = () => {
    // TODO: Implement offer generation
    toast.info('Offer generation coming soon');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[var(--surface-base)]"
    >
      {/* Back Navigation */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()} 
          className="gap-2 text-[var(--fluid-text-secondary)] hover:text-[var(--fluid-text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Bento Grid Layout */}
      <div className="px-4 pb-8">
        <BentoGrid
          property={property}
          onCall={handleCall}
          onSkipTrace={handleSkipTrace}
          onCreateDeal={() => setShowCreateDealDialog(true)}
          onGenerateOffer={handleGenerateOffer}
          isSkipTracing={isSkipTracing}
        />
      </div>

      {/* Create Deal Dialog */}
      <Dialog open={showCreateDealDialog} onOpenChange={setShowCreateDealDialog}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>
              Add this property to your deal pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-[var(--fluid-text-secondary)]">
              Property: <span className="font-medium text-[var(--fluid-text-primary)]">{property.address}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeal} disabled={isCreatingDeal}>
              {isCreatingDeal ? 'Creating...' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

