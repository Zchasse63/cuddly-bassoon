'use client';

import { HelpCircle, Book, MessageSquare, Video, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePageContext } from '@/hooks/usePageContext';

/**
 * Help Page - Help and support resources
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 5
 */
export default function HelpPage() {
  usePageContext('help');

  const resources = [
    {
      icon: Book,
      title: 'Documentation',
      description: 'Learn how to use all features of the platform',
      action: 'View Docs',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides and walkthroughs',
      action: 'Watch Now',
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Ask our AI for help with any question',
      action: 'Ask AI',
    },
    {
      icon: HelpCircle,
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: 'Contact Us',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Help & Support</h1>
          <p className="page-description">Get help with using the platform</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
        {resources.map((resource) => (
          <Card key={resource.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <resource.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {resource.action}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 max-w-4xl">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              q: 'How do I add a new property?',
              a: 'Navigate to Properties and click "Add Property" or ask the AI assistant.',
            },
            {
              q: 'How do I calculate MAO?',
              a: 'Use the deal analyzer or ask the AI to calculate Maximum Allowable Offer.',
            },
            {
              q: 'How do I export my data?',
              a: 'Go to Settings > Data Export to download your properties and deals.',
            },
          ].map((faq, i) => (
            <div key={i} className="border-b pb-4 last:border-0">
              <h4 className="font-medium mb-1">{faq.q}</h4>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
