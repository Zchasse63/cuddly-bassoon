'use client';

/**
 * Smart Deal Form
 *
 * Enhanced deal form with:
 * - Inline MAO (Maximum Allowable Offer) calculator
 * - Auto-calculated profit estimation
 * - Smart defaults from property data
 * - Visual deal quality indicators
 * - Wholesaler fee calculations
 */

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  DollarSign,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEAL_STAGES, DealStage } from '@/lib/deals';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  property_address: z.string().min(1, 'Property address is required').max(500),
  stage: z.enum([
    'lead',
    'contacted',
    'appointment',
    'offer',
    'contract',
    'assigned',
    'closing',
    'closed',
    'lost',
  ]),
  seller_name: z.string().max(255).optional(),
  seller_phone: z.string().max(50).optional(),
  seller_email: z.string().email('Invalid email').optional().or(z.literal('')),
  asking_price: z.string().optional(),
  offer_price: z.string().optional(),
  estimated_arv: z.string().optional(),
  estimated_repairs: z.string().optional(),
  assignment_fee: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyData {
  address?: string;
  estimated_value?: number;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
}

interface SmartDealFormProps {
  onSubmit: (data: {
    property_address: string;
    stage: DealStage;
    seller_name?: string;
    seller_phone?: string;
    seller_email?: string;
    asking_price?: number;
    offer_price?: number;
    estimated_arv?: number;
    estimated_repairs?: number;
    assignment_fee?: number;
    notes?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<FormValues>;
  /** Pre-populate from property data */
  propertyData?: PropertyData;
}

const STAGE_OPTIONS = Object.entries(DEAL_STAGES).map(([value, config]) => ({
  value,
  label: config.label,
}));

// MAO Rule percentages (for reference)
const _MAO_PERCENTAGES = [0.65, 0.7, 0.75] as const;

interface DealMetrics {
  mao: number;
  potentialProfit: number;
  dealQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  profitMargin: number;
  equitySpread: number;
}

function calculateDealMetrics(
  arv: number | undefined,
  repairs: number | undefined,
  offerPrice: number | undefined,
  assignmentFee: number | undefined,
  maoPercentage: number = 0.7
): DealMetrics {
  if (!arv) {
    return {
      mao: 0,
      potentialProfit: 0,
      dealQuality: 'unknown',
      profitMargin: 0,
      equitySpread: 0,
    };
  }

  const repairsValue = repairs || 0;
  const mao = arv * maoPercentage - repairsValue;
  const offer = offerPrice || 0;
  const fee = assignmentFee || 10000; // Default $10k assignment fee

  // Equity spread = ARV - Offer - Repairs (buyer's potential profit)
  const equitySpread = arv - offer - repairsValue;

  // Wholesaler profit = Assignment fee
  const potentialProfit = fee;

  // Profit margin percentage
  const profitMargin = offer > 0 ? (equitySpread / offer) * 100 : 0;

  // Deal quality based on equity spread and MAO
  let dealQuality: DealMetrics['dealQuality'] = 'unknown';
  if (offer > 0 && arv > 0) {
    if (offer <= mao * 0.9) {
      dealQuality = 'excellent';
    } else if (offer <= mao) {
      dealQuality = 'good';
    } else if (offer <= mao * 1.1) {
      dealQuality = 'fair';
    } else {
      dealQuality = 'poor';
    }
  }

  return {
    mao,
    potentialProfit,
    dealQuality,
    profitMargin,
    equitySpread,
  };
}

const qualityColors = {
  excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  good: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  fair: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

const qualityLabels = {
  excellent: 'Excellent Deal',
  good: 'Good Deal',
  fair: 'Fair Deal',
  poor: 'Risky Deal',
  unknown: 'Enter ARV',
};

export function SmartDealForm({
  onSubmit,
  onCancel,
  isLoading,
  defaultValues,
  propertyData,
}: SmartDealFormProps) {
  const [maoPercentage, setMaoPercentage] = useState(0.7);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_address: defaultValues?.property_address || propertyData?.address || '',
      stage: defaultValues?.stage || 'lead',
      seller_name: defaultValues?.seller_name || propertyData?.owner_name || '',
      seller_phone: defaultValues?.seller_phone || propertyData?.owner_phone || '',
      seller_email: defaultValues?.seller_email || propertyData?.owner_email || '',
      asking_price: defaultValues?.asking_price || '',
      offer_price: defaultValues?.offer_price || '',
      estimated_arv:
        defaultValues?.estimated_arv || propertyData?.estimated_value?.toString() || '',
      estimated_repairs: defaultValues?.estimated_repairs || '',
      assignment_fee: defaultValues?.assignment_fee || '10000',
      notes: defaultValues?.notes || '',
    },
  });

  // Watch values for calculations
  const watchedValues = useWatch({
    control: form.control,
    name: ['estimated_arv', 'estimated_repairs', 'offer_price', 'assignment_fee'],
  });

  const [arv, repairs, offerPrice, assignmentFee] = watchedValues.map((v) =>
    v ? parseFloat(v) : undefined
  );

  // Calculate deal metrics
  const metrics = useMemo(() => {
    return calculateDealMetrics(arv, repairs, offerPrice, assignmentFee, maoPercentage);
  }, [arv, repairs, offerPrice, assignmentFee, maoPercentage]);

  // Auto-suggest offer price based on MAO
  const suggestOfferPrice = () => {
    if (metrics.mao > 0) {
      form.setValue('offer_price', Math.round(metrics.mao).toString());
    }
  };

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({
      property_address: data.property_address,
      stage: data.stage as DealStage,
      seller_name: data.seller_name || undefined,
      seller_phone: data.seller_phone || undefined,
      seller_email: data.seller_email || undefined,
      asking_price: data.asking_price ? parseFloat(data.asking_price) : undefined,
      offer_price: data.offer_price ? parseFloat(data.offer_price) : undefined,
      estimated_arv: data.estimated_arv ? parseFloat(data.estimated_arv) : undefined,
      estimated_repairs: data.estimated_repairs ? parseFloat(data.estimated_repairs) : undefined,
      assignment_fee: data.assignment_fee ? parseFloat(data.assignment_fee) : undefined,
      notes: data.notes || undefined,
    });
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Deal Calculator Card */}
          {(arv || repairs || offerPrice) && (
            <Card className="border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-4 w-4 text-brand-500" />
                  Deal Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* MAO Rule Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">MAO Rule</span>
                    <span className="font-medium">{Math.round(maoPercentage * 100)}% of ARV</span>
                  </div>
                  <Slider
                    value={[maoPercentage * 100]}
                    onValueChange={([v]) => setMaoPercentage(v / 100)}
                    min={60}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative (65%)</span>
                    <span>Standard (70%)</span>
                    <span>Aggressive (75%)</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* MAO */}
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Max Allowable Offer</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>MAO = (ARV × {Math.round(maoPercentage * 100)}%) - Repairs</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {metrics.mao > 0 ? formatCurrency(metrics.mao) : '--'}
                      </span>
                      {metrics.mao > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={suggestOfferPrice}
                        >
                          Use as Offer
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Deal Quality */}
                  <div className="rounded-lg border bg-background p-3">
                    <div className="text-sm text-muted-foreground">Deal Quality</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={cn('font-medium', qualityColors[metrics.dealQuality])}>
                        {metrics.dealQuality === 'excellent' && (
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        )}
                        {metrics.dealQuality === 'poor' && (
                          <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                        )}
                        {qualityLabels[metrics.dealQuality]}
                      </Badge>
                    </div>
                  </div>

                  {/* Equity Spread */}
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Equity Spread</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>ARV - Offer Price - Repairs</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          'text-lg font-bold',
                          metrics.equitySpread > 0 ? 'text-emerald-600' : 'text-red-600'
                        )}
                      >
                        {metrics.equitySpread !== 0 ? formatCurrency(metrics.equitySpread) : '--'}
                      </span>
                      {metrics.equitySpread > 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : metrics.equitySpread < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>

                  {/* Profit Margin */}
                  <div className="rounded-lg border bg-background p-3">
                    <div className="text-sm text-muted-foreground">Profit Margin</div>
                    <div className="mt-1">
                      <span
                        className={cn(
                          'text-lg font-bold',
                          metrics.profitMargin >= 20
                            ? 'text-emerald-600'
                            : metrics.profitMargin >= 10
                              ? 'text-amber-600'
                              : 'text-red-600'
                        )}
                      >
                        {metrics.profitMargin > 0 ? `${metrics.profitMargin.toFixed(1)}%` : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Smart Suggestions */}
                {metrics.dealQuality !== 'unknown' && (
                  <div className="flex items-start gap-2 rounded-lg bg-brand-100/50 dark:bg-brand-900/30 p-3 text-sm">
                    <Lightbulb className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <div>
                      {metrics.dealQuality === 'excellent' && (
                        <span>
                          Great deal! This property has strong margins. Consider moving quickly.
                        </span>
                      )}
                      {metrics.dealQuality === 'good' && (
                        <span>
                          Solid deal within MAO guidelines. Good opportunity for assignment.
                        </span>
                      )}
                      {metrics.dealQuality === 'fair' && (
                        <span>
                          This deal is slightly above MAO. Consider negotiating a lower price or
                          verify ARV.
                        </span>
                      )}
                      {metrics.dealQuality === 'poor' && (
                        <span>
                          Caution: Offer exceeds MAO significantly. High risk of loss. Recommend
                          renegotiating.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Property Address */}
          <FormField
            control={form.control}
            name="property_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Address *</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, State 12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stage */}
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seller Info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="seller_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seller_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="seller_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seller@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Financial Fields */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Deal Financials
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimated_arv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated ARV</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input type="number" placeholder="350000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>After Repair Value</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimated_repairs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Repairs</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input type="number" placeholder="50000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="asking_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asking Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input type="number" placeholder="250000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="offer_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Offer Price
                      {metrics.mao > 0 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          MAO: {formatCurrency(metrics.mao)}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input type="number" placeholder="200000" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignment_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Fee</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input type="number" placeholder="10000" className="pl-7" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Your wholesaler fee</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Additional notes about this deal..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Deal'}
            </Button>
          </div>
        </form>
      </Form>
    </TooltipProvider>
  );
}
