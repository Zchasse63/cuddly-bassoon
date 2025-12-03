'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
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
import { DEAL_STAGES, DealStage } from '@/lib/deals';

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
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DealFormProps {
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
    notes?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  defaultValues?: Partial<FormValues>;
}

const STAGE_OPTIONS = Object.entries(DEAL_STAGES).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function DealForm({ onSubmit, onCancel, isLoading, defaultValues }: DealFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      property_address: defaultValues?.property_address || '',
      stage: defaultValues?.stage || 'lead',
      seller_name: defaultValues?.seller_name || '',
      seller_phone: defaultValues?.seller_phone || '',
      seller_email: defaultValues?.seller_email || '',
      asking_price: defaultValues?.asking_price || '',
      offer_price: defaultValues?.offer_price || '',
      estimated_arv: defaultValues?.estimated_arv || '',
      estimated_repairs: defaultValues?.estimated_repairs || '',
      notes: defaultValues?.notes || '',
    },
  });

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
      notes: data.notes || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="asking_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asking Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="250000" {...field} />
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
                <FormLabel>Offer Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="200000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimated_arv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated ARV</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="350000" {...field} />
                </FormControl>
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
                  <Input type="number" placeholder="50000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
  );
}
