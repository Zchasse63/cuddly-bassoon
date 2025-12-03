'use client';

import { toast as sonnerToast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const toast = ({
    title,
    description,
    variant = 'default',
    duration = 5000,
    action,
  }: ToastProps) => {
    const message = title ?? '';
    const options = {
      description,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    };

    if (variant === 'destructive') {
      sonnerToast.error(message, options);
    } else {
      sonnerToast.success(message, options);
    }
  };

  return { toast };
}

// For direct usage without hook
export { sonnerToast as toast };
