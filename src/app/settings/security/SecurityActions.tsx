'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase/client';

interface SecurityActionsProps {
  userId: string;
  email: string;
}

export function SecurityActions({ email }: SecurityActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast({ title: 'Email sent', description: 'Check your email for the password reset link.' });
      setResetDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to send reset email', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      toast({ title: 'Signed out', description: 'You have been signed out from all devices.' });
      router.push('/login');
    } catch {
      toast({ title: 'Error', description: 'Failed to sign out', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Change Password</p>
          <p className="text-sm text-muted-foreground">Send a password reset email</p>
        </div>
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Reset Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                We&apos;ll send a password reset link to {email}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordReset} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Sign Out Everywhere</p>
          <p className="text-sm text-muted-foreground">Sign out from all devices</p>
        </div>
        <Dialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out All
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign Out Everywhere</DialogTitle>
              <DialogDescription>
                This will sign you out from all devices including this one.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSignOutDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSignOutAllDevices} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign Out All Devices
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
