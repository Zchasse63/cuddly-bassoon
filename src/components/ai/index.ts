/**
 * AI Components
 *
 * Context-aware AI interface components per UI_UX_DESIGN_SYSTEM_v1.md
 */

// Main AI Chat Sidebar
export { ScoutPane } from './ScoutPane';

// Tool Discovery System
export { OnboardingModal } from './OnboardingModal';
export { AIToolPalette, useAIToolPalette } from './AIToolPalette';
export { EmptyChatState, SuggestedPrompts } from './EmptyChatState';
export { ToolTransparency, useToolTransparency, createToolCallRecord } from './ToolTransparency';

// AI Components
export { AIContextBar, ContextBadge } from './AIContextBar';
export { QuickActions, InlineQuickActions } from './QuickActions';
export { ProactiveInsights } from './ProactiveInsights';

// Scout AI Components
export { ScoutOrb } from './ScoutOrb';
export { ScoutMessage } from './ScoutMessage';
export type { ScoutMessageProps } from './ScoutMessage';
