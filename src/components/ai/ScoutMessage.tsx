'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  User,
  FileText,
  ExternalLink,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  Home,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoutOrb } from './ScoutOrb';
import { springPresets } from '@/lib/animations';

// Message part types (from Vercel AI SDK)
export type MessagePart = { type: 'text'; text: string } | { type: 'step-start' } | ToolPart;

export interface ToolPart {
  type: string; // 'tool-{toolName}'
  toolCallId: string;
  toolName: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
}

/* PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
   TYPES
   PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP */

export interface ScoutMessageProps {
  role: 'user' | 'assistant';
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parts?: any[]; // Tool parts from AI SDK - using any for compatibility
  sources?: Array<{
    slug: string;
    title: string;
    category: string;
    relevance: number;
  }>;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  isCopied?: boolean;
  className?: string;
}

/* PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
   SOURCE CARD COMPONENT
   PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP */

function SourceCard({
  source,
}: {
  source: {
    slug: string;
    title: string;
    category: string;
    relevance: number;
  };
}) {
  return (
    <motion.a
      href={`/docs/${source.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg glass-subtle hover:glass-base transition-all text-sm group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.standard}
    >
      <FileText className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-foreground">{source.title}</p>
        <p className="text-xs text-muted-foreground truncate">{source.category}</p>
      </div>
      <Badge variant="secondary" className="shrink-0 text-xs">
        {Math.round(source.relevance * 100)}%
      </Badge>
      <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.a>
  );
}

/* PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
   TOOL RESULT COMPONENTS
   PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP */

interface PropertyResult {
  id?: string;
  address?: string;
  formattedAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  propertyType?: string;
  estimatedValue?: number;
  lastSalePrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
}

function PropertyCard({ property }: { property: PropertyResult }) {
  const address = property.address || property.formattedAddress || 'Unknown Address';
  const location = [property.city, property.state, property.zip || property.zipCode]
    .filter(Boolean)
    .join(', ');
  const value = property.estimatedValue || property.lastSalePrice;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg glass-subtle hover:glass-base transition-all">
      <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0">
        <Home className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{address}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {property.propertyType && (
            <Badge variant="secondary" className="text-xs">
              {property.propertyType.replace(/_/g, ' ')}
            </Badge>
          )}
          {value && (
            <span className="text-xs font-medium text-primary">${value.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolResultCard({ part }: { part: ToolPart }) {
  const toolName = part.toolName || part.type.replace('tool-', '');
  const displayName = toolName.replace(/_/g, ' ').replace(/\./g, ' › ');

  // Loading state
  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return (
      <motion.div
        className="flex items-center gap-2 p-3 rounded-lg glass-subtle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Running {displayName}...</span>
      </motion.div>
    );
  }

  // Error state
  if (part.state === 'output-error') {
    return (
      <motion.div
        className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className="size-4" />
        <span className="text-sm">{part.errorText || 'Tool execution failed'}</span>
      </motion.div>
    );
  }

  // Output available - render based on tool type
  if (part.state === 'output-available' && part.output) {
    const output = part.output as Record<string, unknown>;

    // Property search results
    if (toolName.includes('property') && toolName.includes('search')) {
      const properties = (output.properties || output.data || []) as PropertyResult[];
      const total = (output.total || properties.length) as number;

      if (properties.length === 0) {
        return (
          <motion.div
            className="p-3 rounded-lg glass-subtle text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            No properties found matching your criteria.
          </motion.div>
        );
      }

      return (
        <motion.div
          className="flex flex-col gap-2 max-w-full overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between px-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground truncate">
              Found {total} properties
            </span>
            <Badge variant="outline" className="text-xs shrink-0">
              {displayName}
            </Badge>
          </div>
          <div className="grid gap-2 max-h-[300px] overflow-y-auto overflow-x-hidden">
            {properties.slice(0, 5).map((property, idx) => (
              <PropertyCard key={property.id || idx} property={property} />
            ))}
          </div>
          {properties.length > 5 && (
            <p className="text-xs text-muted-foreground px-1">
              + {properties.length - 5} more properties
            </p>
          )}
        </motion.div>
      );
    }

    // Generic tool result - show clean summary (no raw JSON)
    // Extract meaningful info from the output
    const getResultSummary = (data: Record<string, unknown>): string => {
      // Check for common success indicators
      if (data.success === true) return 'Completed successfully';
      if (data.message && typeof data.message === 'string') return data.message;
      if (data.status && typeof data.status === 'string') return `Status: ${data.status}`;

      // Count items if it's a list
      if (Array.isArray(data.data)) return `Found ${data.data.length} items`;
      if (Array.isArray(data.results)) return `Found ${data.results.length} results`;
      if (Array.isArray(data.properties)) return `Found ${data.properties.length} properties`;
      if (Array.isArray(data.deals)) return `Found ${data.deals.length} deals`;
      if (Array.isArray(data.contacts)) return `Found ${data.contacts.length} contacts`;

      // Check for count fields
      if (typeof data.count === 'number') return `Found ${data.count} items`;
      if (typeof data.total === 'number') return `Found ${data.total} items`;

      // Default
      return 'Completed';
    };

    const summary = getResultSummary(output);

    return (
      <motion.div
        className="flex items-center gap-2 p-2 rounded-lg glass-subtle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Check className="size-4 text-green-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{displayName}</span>
          <span className="text-xs text-muted-foreground truncate block">{summary}</span>
        </div>
      </motion.div>
    );
  }

  return null;
}

/* PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
   ANIMATION VARIANTS
   PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP */

const messageVariants = {
  assistant: {
    hidden: {
      opacity: 0,
      x: -20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: springPresets.standard,
    },
  },
  user: {
    hidden: {
      opacity: 0,
      x: 20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: springPresets.standard,
    },
  },
};

/* PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
   MAIN COMPONENT
   PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP */

export const ScoutMessage = memo(function ScoutMessage({
  role,
  content,
  parts,
  sources,
  isStreaming = false,
  onCopy,
  isCopied = false,
  className,
}: ScoutMessageProps) {
  const isAssistant = role === 'assistant';

  // Extract tool parts for rendering
  const toolParts =
    parts?.filter(
      (p): p is ToolPart =>
        typeof p === 'object' &&
        p !== null &&
        'type' in p &&
        typeof p.type === 'string' &&
        p.type.startsWith('tool-')
    ) || [];

  return (
    <motion.div
      className={cn(
        'flex gap-3 w-full max-w-full overflow-hidden',
        isAssistant ? 'flex-row' : 'flex-row-reverse',
        className
      )}
      variants={isAssistant ? messageVariants.assistant : messageVariants.user}
      initial="hidden"
      animate="visible"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isAssistant ? (
          <ScoutOrb state={isStreaming ? 'thinking' : 'idle'} size="md" />
        ) : (
          <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground">
            <User className="size-4" />
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div
        className={cn(
          'flex flex-col gap-2 min-w-0 max-w-[calc(100%-3rem)]',
          isAssistant ? 'items-start' : 'items-end'
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 max-w-full overflow-hidden',
            isAssistant
              ? 'glass-card rounded-tl-sm'
              : 'bg-primary text-primary-foreground rounded-tr-sm'
          )}
        >
          {isAssistant ? (
            <div className="prose prose-sm dark:prose-invert max-w-full overflow-hidden break-words [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_code]:break-all [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full prose-code:glass-subtle prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-pre:glass-subtle prose-pre:border prose-pre:border-border/50">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm">{content}</p>
          )}
        </div>

        {/* Sources Section (Assistant Only) */}
        {isAssistant && sources && sources.length > 0 && (
          <motion.div
            className="flex flex-col gap-1.5 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.standard, delay: 0.2 }}
          >
            <p className="text-xs text-muted-foreground font-medium px-1">
              Sources ({sources.length}):
            </p>
            <div className="grid gap-1.5">
              {sources.slice(0, 3).map((source, idx) => (
                <SourceCard key={`${source.slug}-${idx}`} source={source} />
              ))}
            </div>
            {sources.length > 3 && (
              <p className="text-xs text-muted-foreground px-1">
                + {sources.length - 3} more source{sources.length - 3 > 1 ? 's' : ''}
              </p>
            )}
          </motion.div>
        )}

        {/* Tool Results (Assistant Only) - Generative UI */}
        {isAssistant && toolParts.length > 0 && (
          <motion.div
            className="flex flex-col gap-2 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.standard, delay: 0.15 }}
          >
            {toolParts.map((part, idx) => (
              <ToolResultCard key={part.toolCallId || idx} part={part} />
            ))}
          </motion.div>
        )}

        {/* Action Buttons (Assistant Only) */}
        {isAssistant && content && !isStreaming && (
          <motion.div
            className="flex items-center gap-2 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...springPresets.smooth, delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onCopy?.(content)}
            >
              {isCopied ? (
                <>
                  <Check className="size-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Streaming Indicator (Assistant Only) */}
        {isAssistant && isStreaming && (
          <motion.div
            className="flex items-center gap-2 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={springPresets.smooth}
          >
            <div className="flex gap-1">
              <motion.div
                className="size-1.5 rounded-full bg-primary"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="size-1.5 rounded-full bg-primary"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.2,
                }}
              />
              <motion.div
                className="size-1.5 rounded-full bg-primary"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.4,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">Scout is thinking...</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});
