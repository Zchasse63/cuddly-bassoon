'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Download, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

interface AccountActionsProps {
  action: 'export' | 'delete';
  userId: string;
  email?: string;
}

export function AccountActions({ action, email }: AccountActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');

  const handleExport = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual data export
      toast({
        title: 'Export started',
        description:
          "Your data export is being prepared. You will receive an email when it's ready.",
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to start export', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmEmail !== email) {
      toast({ title: 'Error', description: 'Email does not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Soft delete - mark account for deletion
      const response = await fetch('/api/user/delete', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to delete account');

      const supabase = createBrowserClient();
      await supabase.auth.signOut();

      toast({
        title: 'Account scheduled for deletion',
        description: 'Your account will be deleted within 30 days.',
      });
      router.push('/');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (action === 'export') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Download your data</p>
          <p className="text-sm text-muted-foreground">
            Get a copy of all your data in JSON format
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Data
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Delete Account</p>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all data
          </p>
        </div>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Your account will be scheduled for deletion.
              </DialogDescription>
            </DialogHeader>
            <Alert variant="destructive">
              <AlertDescription>
                All your data including properties, buyers, deals, and team memberships will be
                permanently deleted after a 30-day grace period.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm-email">
                Type your email to confirm: <strong>{email}</strong>
              </Label>
              <Input
                id="confirm-email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || confirmEmail !== email}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
