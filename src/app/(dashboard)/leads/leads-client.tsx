'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Phone, MapPin, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead, LeadStatus } from '@/lib/crm/types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  engaged: 'bg-orange-100 text-orange-800',
  qualified: 'bg-purple-100 text-purple-800',
  offer_made: 'bg-indigo-100 text-indigo-800',
  negotiating: 'bg-pink-100 text-pink-800',
  under_contract: 'bg-cyan-100 text-cyan-800',
  closed: 'bg-green-100 text-green-800',
  lost: 'bg-gray-100 text-gray-800',
};

export function LeadsPageClient() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchLeads = async (filter: string) => {
    try {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') {
        params.set('status', filter);
      }
      const response = await fetch(`/api/leads?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      toast.error('Failed to load leads');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(statusFilter);
  }, [statusFilter]);

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.property_address?.toLowerCase().includes(query) ||
      lead.owner_name?.toLowerCase().includes(query) ||
      lead.owner_phone?.includes(query)
    );
  });

  const getMotivationColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-red-100 text-red-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage your lead pipeline.</p>
        </div>
        <Button onClick={() => router.push('/leads/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="offer_made">Offer Made</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="under_contract">Under Contract</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted" />
              <CardContent className="h-24 bg-muted/50" />
            </Card>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No leads found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/leads/${lead.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">
                    {lead.property_address || 'No Address'}
                  </CardTitle>
                  <Badge className={STATUS_COLORS[lead.status as LeadStatus]}>
                    {lead.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.owner_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{lead.owner_name}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {lead.owner_phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {lead.owner_phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {lead.source?.replace('_', ' ') || 'Unknown source'}
                  </div>
                  {lead.motivation_score && (
                    <Badge className={getMotivationColor(lead.motivation_score)}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {lead.motivation_score}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
