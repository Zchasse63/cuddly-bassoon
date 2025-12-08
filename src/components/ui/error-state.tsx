'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  code?: string;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
  details?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while processing your request.',
  code,
  onRetry,
  onHome,
  className,
  details,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 min-h-[400px]',
        'glass-card border-destructive/20 bg-destructive/5',
        className
      )}
    >
      {/* Icon */}
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 ring-1 ring-destructive/30 text-destructive shadow-lg shadow-destructive/10 group-hover:scale-105 transition-transform duration-300">
          <AlertTriangle className="h-10 w-10 opacity-90" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">{description}</p>

      {/* Error Code/Details */}
      {(code || details) && (
        <div className="w-full max-w-md mb-8">
          <div className="rounded-xl glass-subtle border border-destructive/20 p-4 text-left overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive/50" />
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-bold text-destructive uppercase tracking-wide">
                Error Diagnostics
              </span>
              {code && (
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] border-destructive/30 text-destructive"
                >
                  {code}
                </Badge>
              )}
            </div>
            {details && (
              <code className="text-xs font-mono text-muted-foreground block bg-black/5 dark:bg-black/20 p-2 rounded border border-border/10 overflow-x-auto">
                {details}
              </code>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="gap-2 shadow-lg shadow-destructive/20 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        {onHome && (
          <Button
            variant="outline"
            onClick={onHome}
            className="gap-2 rounded-full px-6 border-border/50 hover:bg-muted/50"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        )}
      </div>
    </div>
  );
}
