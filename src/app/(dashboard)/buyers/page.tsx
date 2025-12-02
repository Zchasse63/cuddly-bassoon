import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Buyers',
};

export default function BuyersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyers</h1>
          <p className="text-muted-foreground">Manage your buyer network and preferences.</p>
        </div>
        <Button>Add Buyer</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Buyers Yet</CardTitle>
          <CardDescription>Build your cash buyer network to match with properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add buyers with their criteria (location, price range, property types) and let AI
            automatically match them with suitable properties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
