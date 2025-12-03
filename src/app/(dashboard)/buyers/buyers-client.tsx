'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BuyerList, BuyerForm } from '@/components/buyers';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { BuyerWithDetails } from '@/lib/buyers/types';

export function BuyersPageClient() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const response = await fetch('/api/buyers');
      if (!response.ok) throw new Error('Failed to fetch buyers');
      const data = await response.json();
      setBuyers(data.buyers || []);
    } catch (error) {
      toast.error('Failed to load buyers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBuyer = async (
    data: Parameters<typeof BuyerForm>[0]['onSubmit'] extends (d: infer T) => unknown ? T : never
  ) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create buyer');
      }

      toast.success('Buyer created successfully');
      setIsCreateOpen(false);
      fetchBuyers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create buyer');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBuyerClick = (buyer: BuyerWithDetails) => {
    router.push(`/buyers/${buyer.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyers</h1>
          <p className="text-muted-foreground">Manage your buyer network.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Buyer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Buyer</DialogTitle>
            </DialogHeader>
            <BuyerForm
              onSubmit={handleCreateBuyer}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BuyerList buyers={buyers} isLoading={isLoading} onClick={handleBuyerClick} />
    </div>
  );
}
