'use client';

/**
 * Tool Transparency Component
 *
 * Shows users which AI tools were used to generate each response.
 * Builds trust and enables learning about the platform's capabilities.
 */

import { useState, useCallback, useMemo } from 'react';
import { Zap, ChevronDown, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getToolDisplayName, getToolIcon } from '@/lib/ai/tool-discovery';
import { renderIcon } from '@/lib/ai/icon-map';
import type { ToolCallRecord } from '@/lib/ai/tool-discovery/types';

interface ToolTransparencyProps {
  /** Tool calls made during the response */
  toolCalls: ToolCallRecord[];
  /** Whether to start expanded (default: false) */
  defaultExpanded?: boolean;
  /** Whether currently streaming (show pending state) */
  isStreaming?: boolean;
  /** Optional class name */
  className?: string;
}

interface ToolCallItemProps {
  call: ToolCallRecord;
  showDuration?: boolean;
}

/**
 * Status indicator component
 */
function StatusIndicator({ status }: { status: ToolCallRecord['status'] }) {
  switch (status) {
    case 'pending':
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />;
    case 'success':
      return <Check className="h-3.5 w-3.5 text-green-600" />;
    case 'error':
      return <X className="h-3.5 w-3.5 text-red-600" />;
    default:
      return null;
  }
}

/**
 * Individual tool call display
 */
function ToolCallItem({ call, showDuration = true }: ToolCallItemProps) {
  const displayName = call.displayName || getToolDisplayName(call.toolSlug);
  const iconName = call.icon || getToolIcon(call.toolSlug);

  return (
    <div className="flex items-start gap-2 py-1.5">
      <StatusIndicator status={call.status} />
      <div
        className={cn(
          'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
          call.status === 'error' ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
        )}
      >
        {renderIcon(iconName, 'h-3 w-3')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {showDuration && call.durationMs !== undefined && (
            <span className="text-xs text-muted-foreground">{call.durationMs}ms</span>
          )}
        </div>
        {call.inputSummary && (
          <p className="text-xs text-muted-foreground truncate">{call.inputSummary}</p>
        )}
        {call.outputSummary && (
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-0.5">
            <ChevronRight className="h-3 w-3" />
            {call.outputSummary}
          </p>
        )}
        {call.status === 'error' && call.errorMessage && (
          <p className="text-xs text-red-600 mt-0.5">{call.errorMessage}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Main Tool Transparency Component
 */
export function ToolTransparency({
  toolCalls,
  defaultExpanded = false,
  isStreaming = false,
  className,
}: ToolTransparencyProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isStreaming);

  // Auto-expand while streaming
  const shouldExpand = isExpanded || isStreaming;

  // Count tools by status
  const stats = useMemo(() => {
    return {
      total: toolCalls.length,
      pending: toolCalls.filter((t) => t.status === 'pending').length,
      success: toolCalls.filter((t) => t.status === 'success').length,
      error: toolCalls.filter((t) => t.status === 'error').length,
    };
  }, [toolCalls]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Don't render if no tools were used
  if (toolCalls.length === 0 && !isStreaming) {
    return null;
  }

  // Show loading state when streaming starts but no tools yet
  if (toolCalls.length === 0 && isStreaming) {
    return (
      <div className={cn('mt-2', className)}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Working...
        </div>
      </div>
    );
  }

  return (
    <div className={cn('mt-2', className)}>
      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {isStreaming && stats.pending > 0 ? (
                <span className="flex items-center gap-2">
                  Working...
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </span>
              ) : (
                `${stats.total} tool${stats.total !== 1 ? 's' : ''} used`
              )}
            </span>
            {stats.error > 0 && (
              <span className="text-xs text-red-600">({stats.error} failed)</span>
            )}
          </div>
          {shouldExpand ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Expanded Content */}
        {shouldExpand && (
          <div className="border-t px-3 py-2 space-y-1">
            {toolCalls.map((call) => (
              <ToolCallItem key={call.id} call={call} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Create a tool call record from a tool execution
 * Utility for converting internal tool data to display format
 */
export function createToolCallRecord(
  id: string,
  toolSlug: string,
  status: ToolCallRecord['status'],
  options?: {
    startedAt?: Date;
    completedAt?: Date;
    inputSummary?: string;
    outputSummary?: string;
    resultCount?: number;
    errorMessage?: string;
  }
): ToolCallRecord {
  const startedAt = options?.startedAt || new Date();
  const completedAt = options?.completedAt;
  const durationMs = completedAt ? completedAt.getTime() - startedAt.getTime() : undefined;

  return {
    id,
    toolSlug,
    displayName: getToolDisplayName(toolSlug),
    icon: getToolIcon(toolSlug),
    status,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt?.toISOString(),
    durationMs,
    inputSummary: options?.inputSummary,
    outputSummary: options?.outputSummary,
    resultCount: options?.resultCount,
    errorMessage: options?.errorMessage,
  };
}

/**
 * Hook for tracking tool calls during a conversation
 */
export function useToolTransparency() {
  const [toolCalls, setToolCalls] = useState<ToolCallRecord[]>([]);

  const addToolCall = useCallback((call: ToolCallRecord) => {
    setToolCalls((prev) => [...prev, call]);
  }, []);

  const updateToolCall = useCallback((id: string, updates: Partial<ToolCallRecord>) => {
    setToolCalls((prev) => prev.map((call) => (call.id === id ? { ...call, ...updates } : call)));
  }, []);

  const clearToolCalls = useCallback(() => {
    setToolCalls([]);
  }, []);

  const startToolCall = useCallback(
    (id: string, toolSlug: string, inputSummary?: string) => {
      addToolCall(
        createToolCallRecord(id, toolSlug, 'pending', {
          startedAt: new Date(),
          inputSummary,
        })
      );
    },
    [addToolCall]
  );

  const completeToolCall = useCallback(
    (
      id: string,
      success: boolean,
      options?: { outputSummary?: string; resultCount?: number; errorMessage?: string }
    ) => {
      const completedAt = new Date();
      setToolCalls((prev) =>
        prev.map((call) => {
          if (call.id !== id) return call;
          // Compute duration from startedAt
          const startedAtTime = call.startedAt
            ? new Date(call.startedAt).getTime()
            : completedAt.getTime();
          const durationMs = completedAt.getTime() - startedAtTime;
          return {
            ...call,
            status: success ? 'success' : 'error',
            completedAt: completedAt.toISOString(),
            durationMs,
            outputSummary: options?.outputSummary,
            resultCount: options?.resultCount,
            errorMessage: options?.errorMessage,
          };
        })
      );
    },
    []
  );

  return {
    toolCalls,
    addToolCall,
    updateToolCall,
    clearToolCalls,
    startToolCall,
    completeToolCall,
  };
}
