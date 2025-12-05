'use client';

/**
 * Collapsible Component
 *
 * Uses Radix UI Collapsible primitive for accessible expand/collapse behavior
 */

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = CollapsiblePrimitive.Root;

const { CollapsibleTrigger, CollapsibleContent } = CollapsiblePrimitive;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
