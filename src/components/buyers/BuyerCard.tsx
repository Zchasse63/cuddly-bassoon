'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Building2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BuyerWithDetails } from '@/lib/buyers/types';

interface BuyerCardProps {
  buyer: BuyerWithDetails;
  onEdit?: (buyer: BuyerWithDetails) => void;
  onDelete?: (buyer: BuyerWithDetails) => void;
  onClick?: (buyer: BuyerWithDetails) => void;
}

const TIER_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  B: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  C: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  unqualified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const BUYER_TYPE_LABELS: Record<string, string> = {
  flipper: 'Flipper',
  landlord: 'Buy & Hold',
  wholesaler: 'Wholesaler',
  developer: 'Developer',
  other: 'Other',
};

export function BuyerCard({ buyer, onEdit, onDelete, onClick }: BuyerCardProps) {
  const handleCardClick = () => {
    onClick?.(buyer);
  };

  return (
    <Card 
      className="hover:border-primary/50 cursor-pointer transition-colors"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{buyer.name}</h3>
            {buyer.tier && (
              <Badge className={TIER_COLORS[buyer.tier]} variant="secondary">
                Tier {buyer.tier}
              </Badge>
            )}
          </div>
          {buyer.company_name && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {buyer.company_name}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(buyer); }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(buyer); }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {buyer.status && (
            <Badge className={STATUS_COLORS[buyer.status]} variant="secondary">
              {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
            </Badge>
          )}
          {buyer.buyer_type && (
            <Badge variant="outline">
              {BUYER_TYPE_LABELS[buyer.buyer_type] || buyer.buyer_type}
            </Badge>
          )}
        </div>

        <div className="space-y-1 text-sm">
          {buyer.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{buyer.phone}</span>
            </div>
          )}
          {buyer.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{buyer.email}</span>
            </div>
          )}
        </div>

        {(buyer.transactionCount || 0) > 0 && (
          <div className="pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {buyer.transactionCount} transaction{buyer.transactionCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

