import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Deals',
};

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Track your deals from lead to close.</p>
        </div>
        <Button>Create Deal</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Active Deals</CardTitle>
          <CardDescription>Create your first deal to start tracking the pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Deals connect properties with buyers. Track status, communications, and documents all in
            one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
