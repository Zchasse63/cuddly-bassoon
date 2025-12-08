'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, FileText, ExternalLink, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoutOrb } from './ScoutOrb';
import { springPresets, fadeUpVariants } from '@/lib/animations';

/* PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
   TYPES
   PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP */

export interface ScoutMessageProps {
  role: 'user' | 'assistant';
  content: string;
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
  sources,
  isStreaming = false,
  onCopy,
  isCopied = false,
  className,
}: ScoutMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <motion.div
      className={cn(
        'flex gap-3 w-full',
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
          'flex flex-col gap-2 max-w-[80%]',
          isAssistant ? 'items-start' : 'items-end'
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isAssistant
              ? 'glass-card rounded-tl-sm'
              : 'bg-primary text-primary-foreground rounded-tr-sm'
          )}
        >
          {isAssistant ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-code:glass-subtle prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-pre:glass-subtle prose-pre:border prose-pre:border-border/50">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{content}</p>
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
