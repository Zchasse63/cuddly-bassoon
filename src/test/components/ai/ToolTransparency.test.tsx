/**
 * ToolTransparency Component Tests
 *
 * Tests for the AI tool transparency display component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolTransparency } from '@/components/ai/ToolTransparency';
import type { ToolCallRecord } from '@/lib/ai/tool-discovery/types';

// Mock the tool discovery functions
vi.mock('@/lib/ai/tool-discovery', () => ({
  getToolDisplayName: (slug: string) => slug.replace(/_/g, ' ').replace(/\./g, ' - '),
  getToolIcon: () => 'Zap',
}));

vi.mock('@/lib/ai/icon-map', () => ({
  renderIcon: () => <span data-testid="tool-icon">Icon</span>,
}));

const mockToolCalls: ToolCallRecord[] = [
  {
    id: 'call-1',
    toolSlug: 'property_search.search_properties',
    displayName: 'Property Search',
    status: 'success',
    startTime: Date.now() - 1500,
    endTime: Date.now(),
    duration: 1500,
    icon: 'Search',
  },
  {
    id: 'call-2',
    toolSlug: 'market_analysis.get_market_stats',
    displayName: 'Market Analysis',
    status: 'success',
    startTime: Date.now() - 800,
    endTime: Date.now(),
    duration: 800,
    icon: 'TrendingUp',
  },
];

const pendingToolCall: ToolCallRecord = {
  id: 'call-pending',
  toolSlug: 'property_valuation.calculate_arv',
  displayName: 'Property Valuation',
  status: 'pending',
  startTime: Date.now(),
  icon: 'DollarSign',
};

const errorToolCall: ToolCallRecord = {
  id: 'call-error',
  toolSlug: 'external_api.get_data',
  displayName: 'External API',
  status: 'error',
  startTime: Date.now() - 5000,
  endTime: Date.now(),
  duration: 5000,
  error: 'API rate limit exceeded',
  icon: 'AlertCircle',
};

describe('ToolTransparency', () => {
  it('renders nothing when no tool calls provided', () => {
    const { container } = render(<ToolTransparency toolCalls={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders tool calls summary', () => {
    render(<ToolTransparency toolCalls={mockToolCalls} />);

    // Should show "Tools used" text
    expect(screen.getByText(/tools used/i)).toBeInTheDocument();
  });

  it('expands to show tool details when clicked', async () => {
    render(<ToolTransparency toolCalls={mockToolCalls} />);

    // Find and click the expand button
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    // Should show tool names
    expect(screen.getByText('Property Search')).toBeInTheDocument();
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
  });

  it('starts expanded when defaultExpanded is true', () => {
    render(<ToolTransparency toolCalls={mockToolCalls} defaultExpanded />);

    // Tool names should be visible immediately
    expect(screen.getByText('Property Search')).toBeInTheDocument();
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
  });

  it('shows pending indicator for in-progress tool calls', () => {
    render(<ToolTransparency toolCalls={[pendingToolCall]} defaultExpanded />);

    // Should show loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error indicator for failed tool calls', () => {
    render(<ToolTransparency toolCalls={[errorToolCall]} defaultExpanded />);

    // Should show error styling (red color)
    const errorIndicator = document.querySelector('.text-red-600');
    expect(errorIndicator).toBeInTheDocument();
  });

  it('shows streaming state when isStreaming is true', () => {
    render(<ToolTransparency toolCalls={mockToolCalls} isStreaming />);

    // Component should render with streaming indicator
    expect(screen.getByText(/tools used/i)).toBeInTheDocument();
  });

  it('displays tool count correctly', () => {
    render(<ToolTransparency toolCalls={mockToolCalls} />);

    // Should show "2 tools" or similar
    const text = screen.getByText(/2/);
    expect(text).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ToolTransparency toolCalls={mockToolCalls} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ToolTransparency Integration', () => {
  it('handles mixed status tool calls', () => {
    const mixedCalls = [
      ...mockToolCalls,
      pendingToolCall,
      errorToolCall,
    ];

    render(<ToolTransparency toolCalls={mixedCalls} defaultExpanded />);

    // Should show all tools
    expect(screen.getByText('Property Search')).toBeInTheDocument();
    expect(screen.getByText('Market Analysis')).toBeInTheDocument();
    expect(screen.getByText('Property Valuation')).toBeInTheDocument();
    expect(screen.getByText('External API')).toBeInTheDocument();
  });

  it('toggles expansion state on click', () => {
    render(<ToolTransparency toolCalls={mockToolCalls} />);

    const button = screen.getByRole('button');

    // Initially collapsed - tool names not visible
    expect(screen.queryByText('Property Search')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(button);
    expect(screen.getByText('Property Search')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(button);
    expect(screen.queryByText('Property Search')).not.toBeInTheDocument();
  });
});
