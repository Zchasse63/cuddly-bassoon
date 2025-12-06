'use client';

/**
 * Property Detail Client Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 * Full property detail view with tabs, actions, and AI integration
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePageContext } from '@/hooks/usePageContext';
import type { PropertyWithDetails } from '@/lib/properties/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Briefcase,
  TrendingUp,
  FileText,
  Users,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Home,
  Percent,
  Clock,
  AlertCircle,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { MotivationScoreCard } from '@/components/motivation';
import { useMotivationScore } from '@/hooks/useMotivationScore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PropertyDetailClientProps {
  property: PropertyWithDetails;
  relatedDeals: Array<{
    id: string;
    stage: string | null;
    status: string | null;
    createdAt: string;
  }>;
}

export function PropertyDetailClient({ property, relatedDeals }: PropertyDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDealDialog, setShowCreateDealDialog] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  // Fetch motivation score
  const {
    data: motivationData,
    isLoading: motivationLoading,
    refetch: refetchMotivation,
  } = useMotivationScore({
    propertyId: property.id,
    scoreType: 'both', // Get both standard and DealFlow IQ
    enabled: true,
  });

  // Set page context for AI awareness
  usePageContext('property-detail', {
    entity: {
      type: 'property',
      id: property.id,
      name: property.address,
      metadata: {
        city: property.city,
        state: property.state,
        value: property.estimatedValue,
        equity: property.equityPercent,
      },
    },
  });

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const getEquityBadgeVariant = (equity: number | null | undefined) => {
    if (!equity) return 'secondary';
    if (equity >= 50) return 'success';
    if (equity >= 30) return 'warning';
    return 'secondary';
  };

  return (
    <div className="page-container">
      {/* Back Navigation */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Property Hero */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Home className="h-4 w-4" />
            <span className="text-sm">Property Details</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-sm">{property.propertyType || 'Residential'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{property.address}</h1>
          <p className="text-lg text-muted-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {property.city}, {property.state} {property.zip}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCreateDealDialog(true)} className="gap-2">
            <Briefcase className="h-4 w-4" />
            Add to Deal
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </Button>
          <Button variant="outline" className="gap-2">
            <Phone className="h-4 w-4" />
            Skip Trace
          </Button>
        </div>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Est. Value
            </div>
            <div className="text-xl font-bold">{formatCurrency(property.estimatedValue)}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Percent className="h-4 w-4" />
              Equity
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {property.equityPercent ? `${property.equityPercent.toFixed(0)}%` : 'N/A'}
              </span>
              <Badge variant={getEquityBadgeVariant(property.equityPercent)}>
                {property.equityPercent && property.equityPercent >= 50 ? 'High' : 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Bed className="h-4 w-4" />
              Beds
            </div>
            <div className="text-xl font-bold">{property.bedrooms || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Bath className="h-4 w-4" />
              Baths
            </div>
            <div className="text-xl font-bold">{property.bathrooms || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Ruler className="h-4 w-4" />
              Sq Ft
            </div>
            <div className="text-xl font-bold">
              {property.squareFootage?.toLocaleString() || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Year Built
            </div>
            <div className="text-xl font-bold">{property.yearBuilt || 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="comps">Comps</TabsTrigger>
          <TabsTrigger value="permits">Permits</TabsTrigger>
          <TabsTrigger value="owner">Owner</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Motivation Score Card - Full Width */}
          {(motivationData || motivationLoading) && (
            <div className="mb-6">
              {motivationLoading ? (
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-brand-500" />
                      Seller Motivation Analysis
                    </CardTitle>
                    <CardDescription>Analyzing seller motivation signals...</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse space-y-4">
                      <div className="h-12 bg-muted rounded-md w-1/3" />
                      <div className="h-20 bg-muted rounded-md" />
                      <div className="h-16 bg-muted rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ) : motivationData ? (
                <MotivationScoreCard
                  score={motivationData.standardScore.score}
                  confidence={motivationData.standardScore.confidence}
                  factors={motivationData.standardScore.factors}
                  recommendation={motivationData.standardScore.recommendation}
                  ownerClassification={motivationData.ownerClassification}
                  modelUsed={motivationData.standardScore.modelUsed}
                  riskFactors={motivationData.standardScore.riskFactors}
                  dealFlowIQ={motivationData.dealFlowIQ}
                  onRefresh={refetchMotivation}
                  isLoading={motivationLoading}
                />
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Details */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-brand-500" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Property Type</div>
                    <div className="font-medium">{property.propertyType || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lot Size</div>
                    <div className="font-medium">
                      {property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Price / Sq Ft</div>
                    <div className="font-medium">
                      {property.pricePerSqft ? `$${property.pricePerSqft}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Listing Status</div>
                    <div className="font-medium capitalize">
                      {property.listingStatus || 'Off Market'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Days on Market</div>
                    <div className="font-medium">{property.daysOnMarket || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Rent Estimate</div>
                    <div className="font-medium">{formatCurrency(property.rentEstimate)}/mo</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-brand-500" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Estimated Value</span>
                    <span className="font-bold">{formatCurrency(property.estimatedValue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Mortgage Balance</span>
                    <span className="font-medium">{formatCurrency(property.mortgageBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Estimated Equity</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(property.estimatedEquity)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Last Sale Price</span>
                    <span className="font-medium">{formatCurrency(property.lastSalePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Last Sale Date</span>
                    <span className="font-medium">{formatDate(property.lastSaleDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Related Deals */}
          {relatedDeals.length > 0 && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand-500" />
                  Related Deals
                </CardTitle>
                <CardDescription>Existing deals for this property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize">
                          {deal.stage}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Created {formatDate(deal.createdAt)}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matched Buyers */}
          {property.matchedBuyers && property.matchedBuyers.length > 0 && (
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-500" />
                  Matched Buyers
                </CardTitle>
                <CardDescription>
                  Buyers that match this property based on their preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.matchedBuyers.map((buyer) => (
                    <div
                      key={buyer.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center font-semibold',
                            buyer.tier === 'A'
                              ? 'bg-green-100 text-green-700'
                              : buyer.tier === 'B'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                          )}
                        >
                          {buyer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {buyer.name}
                            {buyer.tier && (
                              <Badge variant="outline" className="text-xs">
                                Tier {buyer.tier}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {buyer.matchReasons.slice(0, 2).join(' • ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-brand-500">{buyer.matchScore}%</div>
                          <div className="text-xs text-muted-foreground">match</div>
                        </div>
                        <div className="flex gap-1">
                          {buyer.phone && (
                            <Button variant="ghost" size="icon-sm" asChild>
                              <a href={`tel:${buyer.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {buyer.email && (
                            <Button variant="ghost" size="icon-sm" asChild>
                              <a href={`mailto:${buyer.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Valuation Tab */}
        <TabsContent value="valuation" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-500" />
                Valuation Analysis
              </CardTitle>
              <CardDescription>Automated valuation model (AVM) estimates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Current Value</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(property.estimatedValue)}
                  </div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">After Repair Value (ARV)</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(
                      property.estimatedValue
                        ? Math.round(property.estimatedValue * 1.2)
                        : undefined
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Estimated +20%</div>
                </div>
                <div className="text-center p-6 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Max Offer (70% Rule)</div>
                  <div className="text-3xl font-bold text-brand-600">
                    {formatCurrency(
                      property.estimatedValue
                        ? Math.round(property.estimatedValue * 1.2 * 0.7 - 25000)
                        : undefined
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">ARV × 70% - $25k repairs</div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Value Indicators</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">High Equity</div>
                      <div className="text-sm text-muted-foreground">
                        {property.equityPercent?.toFixed(0)}% equity
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="font-medium">Long-term Owner</div>
                      <div className="text-sm text-muted-foreground">
                        {property.ownershipMonths
                          ? `${Math.floor(property.ownershipMonths / 12)} years`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comps Tab */}
        <TabsContent value="comps" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-500" />
                Comparable Sales
              </CardTitle>
              <CardDescription>Recent sales in the area</CardDescription>
            </CardHeader>
            <CardContent>
              {property.comps && property.comps.length > 0 ? (
                <div className="space-y-4">
                  {property.comps.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{comp.address}</div>
                        <div className="text-sm text-muted-foreground">
                          {comp.city}, {comp.state} {comp.zip}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>{comp.bedrooms} bed</span>
                          <span>{comp.bathrooms} bath</span>
                          <span>{comp.squareFootage?.toLocaleString()} sqft</span>
                          <span>Built {comp.yearBuilt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(comp.salePrice)}</div>
                        <div className="text-sm text-muted-foreground">
                          Sold {formatDate(comp.saleDate)}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          {comp.similarityScore}% similar
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comparable sales found in this area</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permits Tab */}
        <TabsContent value="permits" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" />
                Permit History
              </CardTitle>
              <CardDescription>Building permits and inspection history</CardDescription>
            </CardHeader>
            <CardContent>
              {property.permits && property.permits.length > 0 ? (
                <div className="space-y-4">
                  {property.permits.map((permit) => (
                    <div key={permit.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          permit.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : permit.status === 'active'
                              ? 'bg-blue-100 text-blue-600'
                              : permit.status === 'expired'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {permit.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : permit.status === 'expired' ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{permit.type}</span>
                          <Badge
                            variant={
                              permit.status === 'completed'
                                ? 'success'
                                : permit.status === 'expired'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="capitalize"
                          >
                            {permit.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {permit.description || `Permit #${permit.permitNumber}`}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Issued: {formatDate(permit.issuedDate)}</span>
                          {permit.jobValue && <span>Value: {formatCurrency(permit.jobValue)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No permit history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner Tab */}
        <TabsContent value="owner" className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-500" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Owner Name</div>
                    <div className="font-medium text-lg">{property.ownerName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Owner Type</div>
                    <div className="font-medium capitalize">{property.ownerType || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ownership Duration</div>
                    <div className="font-medium">
                      {property.ownershipMonths
                        ? `${Math.floor(property.ownershipMonths / 12)} years, ${property.ownershipMonths % 12} months`
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Mailing Address</div>
                    <div className="font-medium">
                      {property.mailingAddress ? (
                        <>
                          {property.mailingAddress}
                          <br />
                          {property.mailingCity}, {property.mailingState} {property.mailingZip}
                        </>
                      ) : (
                        'Same as property'
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Owner Status</div>
                    <Badge variant={property.isOwnerOccupied ? 'success' : 'secondary'}>
                      {property.isOwnerOccupied ? 'Owner Occupied' : 'Absentee Owner'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Skip Trace Owner
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Send Mail
                </Button>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Public Records
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Deal Dialog */}
      <Dialog open={showCreateDealDialog} onOpenChange={setShowCreateDealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Deal from Property</DialogTitle>
            <DialogDescription>Create a new deal for {property.address}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium">{property.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{property.ownerName || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Value</span>
                <span className="font-medium">{formatCurrency(property.estimatedValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Stage</span>
                <Badge variant="secondary">Lead</Badge>
              </div>
            </div>
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
    </div>
  );
}
