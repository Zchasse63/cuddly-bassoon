'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BusinessVertical, VERTICAL_CONFIGS, BUSINESS_VERTICALS } from '@/lib/verticals/types';

interface VerticalSelectorProps {
  className?: string;
}

/**
 * VerticalSelector - Dropdown for selecting business vertical
 * Uses TanStack Query for data fetching and mutations
 */
export function VerticalSelector({ className }: VerticalSelectorProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: verticalData } = useQuery({
    queryKey: ['user-vertical'],
    queryFn: async () => {
      const res = await fetch('/api/verticals');
      if (!res.ok) throw new Error('Failed to fetch verticals');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (vertical: BusinessVertical) => {
      const res = await fetch('/api/verticals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vertical }),
      });
      if (!res.ok) throw new Error('Failed to set vertical');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-vertical'] });
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      setIsOpen(false);
    },
  });

  const activeVertical = (verticalData?.data?.activeVertical || 'wholesaling') as BusinessVertical;
  const enabledVerticals = (verticalData?.data?.enabledVerticals || BUSINESS_VERTICALS) as BusinessVertical[];
  const activeConfig = VERTICAL_CONFIGS[activeVertical];

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted/50 transition-colors"
        style={{ borderColor: activeConfig.color }}
      >
        <span className="text-lg">{activeConfig.icon}</span>
        <span className="font-medium">{activeConfig.name}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-popover rounded-lg shadow-lg border z-50">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-3 py-2">Select Business Vertical</p>
            {enabledVerticals.map((verticalId) => {
              const config = VERTICAL_CONFIGS[verticalId];
              const isActive = verticalId === activeVertical;

              return (
                <button
                  key={verticalId}
                  onClick={() => mutation.mutate(verticalId)}
                  disabled={mutation.isPending}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors',
                    isActive ? 'bg-primary/10' : 'hover:bg-muted/50',
                    mutation.isPending && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className="text-xl">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{config.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                  </div>
                  {isActive && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

