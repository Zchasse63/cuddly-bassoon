'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Phone, Mail, Building2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { BuyerForm } from '@/components/buyers';
import { PreferencesForm } from './preferences-form';
import { CommunicationTab } from './communication-tab';
import type { BuyerWithDetails } from '@/lib/buyers/types';

interface BuyerDetailClientProps {
  initialBuyer: BuyerWithDetails;
}

const TIER_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-gray-100 text-gray-800',
};

export function BuyerDetailClient({ initialBuyer }: BuyerDetailClientProps) {
  const [buyer, setBuyer] = useState(initialBuyer);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (data: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      const { buyer: updated } = await res.json();
      setBuyer({ ...buyer, ...updated });
      toast.success('Buyer updated');
      setIsEditOpen(false);
    } catch {
      toast.error('Failed to update buyer');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/buyers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{buyer.name}</h1>
              {buyer.tier && <Badge className={TIER_COLORS[buyer.tier]}>Tier {buyer.tier}</Badge>}
            </div>
            {buyer.company_name && (
              <p className="text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {buyer.company_name}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="matches">Matched Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {buyer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${buyer.phone}`} className="hover:underline">
                      {buyer.phone}
                    </a>
                  </div>
                )}
                {buyer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${buyer.email}`} className="hover:underline">
                      {buyer.email}
                    </a>
                  </div>
                )}
                {!buyer.phone && !buyer.email && (
                  <p className="text-sm text-muted-foreground">No contact info</p>
                )}
              </CardContent>
            </Card>

            {/* Status & Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">{buyer.status || 'Unknown'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{buyer.buyer_type || 'Unknown'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transactions</span>
                  <span>{buyer.transactionCount || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {buyer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{buyer.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesForm buyerId={buyer.id} preferences={buyer.preferences} />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab transactions={buyer.transactions || []} />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationTab
            buyerId={buyer.id}
            buyerEmail={buyer.email || undefined}
            buyerPhone={buyer.phone || undefined}
          />
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Matched deals will appear here once matching algorithm is implemented.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Buyer</DialogTitle>
          </DialogHeader>
          <BuyerForm
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            isLoading={isSaving}
            defaultValues={{
              name: buyer.name,
              company_name: buyer.company_name || '',
              email: buyer.email || '',
              phone: buyer.phone || '',
              buyer_type: buyer.buyer_type || undefined,
              status: buyer.status || 'active',
              notes: buyer.notes || '',
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionsTab({ transactions }: { transactions: BuyerWithDetails['transactions'] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No transaction history. Import transactions to track buyer activity.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{tx.property_address || 'Unknown Address'}</p>
                <p className="text-sm text-muted-foreground">
                  {tx.transaction_type === 'purchase' ? 'Purchased' : 'Sold'} on{' '}
                  {tx.purchase_date || tx.sale_date || 'Unknown date'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${(tx.purchase_price || tx.sale_price || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
