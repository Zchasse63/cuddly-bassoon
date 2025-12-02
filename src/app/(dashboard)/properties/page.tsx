import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Properties',
};

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your property leads and listings.</p>
        </div>
        <Button>Add Property</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Properties Yet</CardTitle>
          <CardDescription>
            Add your first property to start analyzing deals with AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Properties will appear here once added. Each property will be automatically analyzed for
            ARV, repair costs, and potential profit margins.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
