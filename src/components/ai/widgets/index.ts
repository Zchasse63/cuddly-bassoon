/**
 * GenUI Widget System
 *
 * Source: Fluid_OS_Master_Plan.md Phase 3.4
 *
 * AI-generated UI widgets for rich content in chat responses.
 */

// Base widget component
export { GenUIWidget, GenUIWidgetInline } from './GenUIWidget';
export type { GenUIWidgetProps } from './GenUIWidget';

// Property widgets
export { PropertyCardWidget, PropertyReference } from './PropertyCardWidget';
export type { PropertyCardWidgetData } from './PropertyCardWidget';

// Action widgets
export { ActionWidget, PrimaryAction } from './ActionWidget';
export type { ActionItem, ActionType } from './ActionWidget';

// Market stats widgets
export { MarketStatsWidget, InlineStat, ComparisonStat } from './MarketStatsWidget';
export type { MarketStatsWidgetData, MarketStat } from './MarketStatsWidget';
