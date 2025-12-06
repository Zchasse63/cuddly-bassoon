'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Loader2, Building2, MapPin, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface OnboardingWizardProps {
  userId: string;
  email: string;
  initialData: {
    fullName: string;
    companyName: string;
    preferences: Record<string, unknown>;
  };
}

const steps = [
  { id: 'profile', title: 'Your Profile', icon: Building2, description: 'Tell us about yourself' },
  { id: 'markets', title: 'Markets', icon: MapPin, description: 'Select your target markets' },
  { id: 'welcome', title: 'Get Started', icon: Sparkles, description: "You're all set!" },
];

const defaultMarkets = [
  'Atlanta, GA',
  'Dallas, TX',
  'Houston, TX',
  'Phoenix, AZ',
  'Tampa, FL',
  'Charlotte, NC',
  'Nashville, TN',
  'Orlando, FL',
  'San Antonio, TX',
  'Jacksonville, FL',
];

export function OnboardingWizard({ initialData }: OnboardingWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    companyName: initialData.companyName,
    phone: '',
    selectedMarkets: [] as string[],
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!formData.fullName.trim()) {
        toast({
          title: 'Name required',
          description: 'Please enter your name',
          variant: 'destructive',
        });
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          company_name: formData.companyName,
          phone: formData.phone,
          preferences: { default_markets: formData.selectedMarkets },
          onboarding_completed: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      toast({ title: 'Welcome!', description: 'Your account is ready to use.' });
      router.push('/dashboard');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMarket = (market: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMarkets: prev.selectedMarkets.includes(market)
        ? prev.selectedMarkets.filter((m) => m !== market)
        : [...prev.selectedMarkets, market],
    }));
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="mb-4 flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
        <CardTitle className="mt-4">{steps[currentStep]?.title}</CardTitle>
        <CardDescription>{steps[currentStep]?.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="ABC Investments"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </>
        )}
        {currentStep === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select the markets you&apos;re interested in:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {defaultMarkets.map((market) => (
                <Button
                  key={market}
                  variant={formData.selectedMarkets.includes(market) ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start"
                  onClick={() => toggleMarket(market)}
                >
                  {formData.selectedMarkets.includes(market) && <Check className="mr-2 h-4 w-4" />}
                  {market}
                </Button>
              ))}
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                You&apos;re all set, {formData.fullName.split(' ')[0]}!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your account is ready. Start finding deals and connecting with buyers.
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-between pt-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button className="ml-auto" onClick={handleNext}>
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button className="ml-auto" onClick={handleComplete} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Go to Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
