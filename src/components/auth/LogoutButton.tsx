'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';

import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showConfirm?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  showConfirm = false,
  className,
  children,
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const result = await signOut();

    if (result.success) {
      router.push('/login');
      router.refresh();
    } else {
      // Fallback to form-based logout
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/auth/signout';
      document.body.appendChild(form);
      form.submit();
    }
  };

  const buttonContent = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4" />
      )}
      {children ?? (showIcon ? <span className="ml-2">Sign out</span> : 'Sign out')}
    </>
  );

  if (showConfirm) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={variant} size={size} className={className} disabled={loading}>
            {buttonContent}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account. Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      {buttonContent}
    </Button>
  );
}
