import { Suspense } from 'react';
import { Metadata } from 'next';
import { Check, Zap } from 'lucide-react';

import { getCurrentUserProfile, SUBSCRIPTION_LIMITS } from '@/lib/user';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Manage your subscription and billing',
};

const plans = [
  {
    name: 'Free',
    tier: 'free' as const,
    price: '$0',
    description: 'Get started with basic features',
    features: ['100 API calls/month', '1 team member', '3 saved searches', 'Basic property data'],
  },
  {
    name: 'Pro',
    tier: 'pro' as const,
    price: '$99',
    period: '/month',
    description: 'For serious wholesalers',
    features: [
      '5,000 API calls/month',
      '5 team members',
      '25 saved searches',
      'AI-powered features',
      'Advanced analytics',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    tier: 'enterprise' as const,
    price: 'Custom',
    description: 'For teams and agencies',
    features: [
      'Unlimited API calls',
      'Unlimited team members',
      'Unlimited saved searches',
      'All AI features',
      'Custom integrations',
      'Dedicated support',
    ],
  },
];

async function SubscriptionContent() {
  const { data: profile, error } = await getCurrentUserProfile();
  if (error || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load subscription: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const currentTier = profile.subscription_tier;
  const limits = SUBSCRIPTION_LIMITS[currentTier];
  const usagePercent =
    limits.api_calls > 0
      ? Math.min(100, ((limits.api_calls - profile.api_calls_remaining) / limits.api_calls) * 100)
      : 0;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold capitalize">{currentTier} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {profile.subscription_status === 'active' ? 'Active' : profile.subscription_status}
              </p>
            </div>
            <Badge variant={currentTier === 'enterprise' ? 'default' : 'secondary'}>
              {currentTier.toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>API Calls Used</span>
              <span>
                {limits.api_calls > 0
                  ? `${limits.api_calls - profile.api_calls_remaining} / ${limits.api_calls}`
                  : 'Unlimited'}
              </span>
            </div>
            {limits.api_calls > 0 && <Progress value={usagePercent} className="h-2" />}
            {profile.api_calls_reset_date && (
              <p className="text-xs text-muted-foreground">
                Resets on {new Date(profile.api_calls_reset_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.tier} className={plan.popular ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && <Badge className="bg-primary">Popular</Badge>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.tier === currentTier ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : plan.tier === 'enterprise' ? (
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                ) : (
                  <Button className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    {plan.tier === 'pro' ? 'Upgrade to Pro' : 'Downgrade'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-20" />
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionSkeleton />}>
      <SubscriptionContent />
    </Suspense>
  );
}
