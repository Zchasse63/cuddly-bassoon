/**
 * AI Components
 *
 * Context-aware AI interface components per UI_UX_DESIGN_SYSTEM_v1.md
 * Includes Tool Discovery & Transparency System components.
 */

// Tool Discovery System
export { OnboardingModal } from './OnboardingModal';
export { AIToolPalette, useAIToolPalette } from './AIToolPalette';
export { EmptyChatState, SuggestedPrompts } from './EmptyChatState';
export {
  ToolTransparency,
  useToolTransparency,
  createToolCallRecord,
} from './ToolTransparency';
export { EnhancedChatInterface } from './EnhancedChatInterface';

// Existing AI Components
export { AIContextBar, ContextBadge } from './AIContextBar';
export { QuickActions, InlineQuickActions } from './QuickActions';
export { ProactiveInsights } from './ProactiveInsights';
