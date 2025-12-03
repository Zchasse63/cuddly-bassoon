'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { BuyerForm, BuyerList } from '@/components/buyers';
import type { BuyerWithDetails, BuyerListFilters } from '@/lib/buyers/types';
import type { CreateBuyerInput } from '@/lib/buyers/validation';

export function BuyersPageClient() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<BuyerWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState<BuyerListFilters>({});
  const [total, setTotal] = useState(0);

  const fetchBuyers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.type) params.set('type', filters.type);
      if (filters.tier) params.set('tier', filters.tier);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/buyers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch buyers');
      const data = await res.json();
      setBuyers(data.buyers);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load buyers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const handleCreateBuyer = async (data: CreateBuyerInput) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create buyer');
      toast.success('Buyer created successfully');
      setIsDialogOpen(false);
      fetchBuyers();
    } catch (error) {
      toast.error('Failed to create buyer');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBuyer = async (buyer: BuyerWithDetails) => {
    if (!confirm(`Delete ${buyer.name}?`)) return;
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete buyer');
      toast.success('Buyer deleted');
      fetchBuyers();
    } catch (error) {
      toast.error('Failed to delete buyer');
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
          <p className="text-muted-foreground">
            Manage your buyer network and preferences. {total > 0 && `${total} buyer${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Buyer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search buyers..."
              className="pl-9"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v as BuyerListFilters['status'] })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.tier || 'all'}
          onValueChange={(v) => setFilters({ ...filters, tier: v === 'all' ? undefined : v as BuyerListFilters['tier'] })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="A">Tier A</SelectItem>
            <SelectItem value="B">Tier B</SelectItem>
            <SelectItem value="C">Tier C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buyers List */}
      {buyers.length === 0 && !isLoading ? (
        <EmptyState onAdd={() => setIsDialogOpen(true)} />
      ) : (
        <BuyerList
          buyers={buyers}
          isLoading={isLoading}
          onEdit={(buyer) => router.push(`/buyers/${buyer.id}`)}
          onDelete={handleDeleteBuyer}
          onClick={handleBuyerClick}
        />
      )}

      {/* Add Buyer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Buyer</DialogTitle>
            <DialogDescription>Add a buyer to your network for deal matching.</DialogDescription>
          </DialogHeader>
          <BuyerForm
            onSubmit={handleCreateBuyer}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>No Buyers Yet</CardTitle>
        <CardDescription>Build your cash buyer network to match with properties.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Add buyers with their criteria (location, price range, property types) and let AI
          automatically match them with suitable properties.
        </p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Buyer
        </Button>
      </CardContent>
    </Card>
  );
}
