'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StagePipeline, ActivityTimeline } from '@/components/deals';
import { DealWithDetails, DealActivity, DealStage, DEAL_STAGES, ActivityType } from '@/lib/deals';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DealDetailClientProps {
  deal: DealWithDetails;
  activities: DealActivity[];
}

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export function DealDetailClient({ deal, activities }: DealDetailClientProps) {
  const router = useRouter();
  const [, setIsUpdating] = useState(false);
  const stageConfig = DEAL_STAGES[deal.stage as DealStage];

  const handleStageChange = async (newStage: DealStage) => {
    if (newStage === deal.stage) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stage');
      }

      toast.success('Stage updated successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update stage');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddActivity = async (type: ActivityType, description: string) => {
    const response = await fetch(`/api/deals/${deal.id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: type, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to add activity');
    }

    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    const response = await fetch(`/api/deals/${deal.id}`, { method: 'DELETE' });
    if (response.ok) {
      toast.success('Opportunity deleted');
      router.push('/pipeline');
    } else {
      toast.error('Failed to delete opportunity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pipeline">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{deal.property_address}</h1>
              <Badge className={stageConfig.color}>{stageConfig.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created{' '}
              {deal.created_at &&
                formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
              {deal.days_in_stage !== undefined &&
                ` · ${deal.days_in_stage} days in ${stageConfig.label}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Stage Pipeline */}
      <Card>
        <CardContent className="pt-6">
          <StagePipeline currentStage={deal.stage as DealStage} onStageClick={handleStageChange} />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={User} label="Seller" value={deal.seller_name} />
                <InfoRow icon={Phone} label="Phone" value={deal.seller_phone} />
                <InfoRow icon={Mail} label="Email" value={deal.seller_email} />
                <InfoRow icon={MapPin} label="Property" value={deal.property?.address} />
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FinancialCard label="Asking" value={deal.asking_price} />
                <FinancialCard label="Offer" value={deal.offer_price} />
                <FinancialCard label="Contract" value={deal.contract_price} highlight />
                <FinancialCard label="Est. ARV" value={deal.estimated_arv} />
                <FinancialCard label="Est. Repairs" value={deal.estimated_repairs} />
                <FinancialCard label="Assignment Fee" value={deal.assignment_fee} highlight />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={activities} onAddActivity={handleAddActivity} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

function FinancialCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: number | null;
  highlight?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-primary/10' : 'bg-muted/50'}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? 'text-primary' : ''}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
