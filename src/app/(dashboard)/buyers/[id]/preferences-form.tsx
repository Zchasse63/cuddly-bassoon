'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { preferencesSchema, type PreferencesInput } from '@/lib/buyers/validation';
import type { BuyerPreferences } from '@/lib/buyers/types';

interface PreferencesFormProps {
  buyerId: string;
  preferences: BuyerPreferences | null | undefined;
}

const CONDITION_OPTIONS = [
  { value: 'turnkey', label: 'Turnkey (Move-in Ready)' },
  { value: 'light_rehab', label: 'Light Rehab ($0-25k)' },
  { value: 'moderate_rehab', label: 'Moderate Rehab ($25-75k)' },
  { value: 'heavy_rehab', label: 'Heavy Rehab ($75k+)' },
  { value: 'gut', label: 'Gut Renovation' },
];

export function PreferencesForm({ buyerId, preferences }: PreferencesFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      property_types: preferences?.property_types || [],
      price_range_min: preferences?.price_range_min || undefined,
      price_range_max: preferences?.price_range_max || undefined,
      bedroom_min: preferences?.bedroom_min || undefined,
      bedroom_max: preferences?.bedroom_max || undefined,
      condition_tolerance: preferences?.condition_tolerance || undefined,
      max_rehab_budget: preferences?.max_rehab_budget || undefined,
      preferred_roi_percent: preferences?.preferred_roi_percent || undefined,
    },
  });

  const handleSubmit = async (data: PreferencesInput) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/buyers/${buyerId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Buyer Preferences</CardTitle>
        <CardDescription>Define what properties this buyer is looking for.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_range_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_range_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="500000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bedrooms */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bedroom_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedroom_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Condition Tolerance */}
            <FormField
              control={form.control}
              name="condition_tolerance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition Tolerance</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition tolerance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONDITION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ROI */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_rehab_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Rehab Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferred_roi_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred ROI %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
