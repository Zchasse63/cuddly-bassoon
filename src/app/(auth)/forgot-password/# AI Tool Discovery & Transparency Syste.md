# AI Tool Discovery & Transparency System
## Integration Specification

**Version:** 1.0  
**Last Updated:** December 5, 2025  
**Status:** Ready for Implementation

---

## Document Purpose

This document specifies the complete implementation of four interconnected features that help users discover, understand, and effectively utilize the platform's ~200 AI tools. The implementing AI should discover the existing codebase structure, routing patterns, component architecture, and integrate these features accordingly.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tool Registry Architecture](#2-tool-registry-architecture)
3. [Feature 1: Interactive Onboarding](#3-feature-1-interactive-onboarding)
4. [Feature 2: Tool Command Palette](#4-feature-2-tool-command-palette)
5. [Feature 3: Click-to-Insert](#5-feature-3-click-to-insert)
6. [Feature 4: Tool Transparency](#6-feature-4-tool-transparency)
7. [UI/UX Specifications](#7-uiux-specifications)
8. [State Management](#8-state-management)
9. [Keyboard & Accessibility](#9-keyboard--accessibility)
10. [Implementation Guidance](#10-implementation-guidance)

---

## 1. System Overview

### What We're Building

Four interconnected features that work together to help users understand and leverage the platform's AI capabilities:

| Feature | Purpose | User Benefit |
|---------|---------|--------------|
| **Interactive Onboarding** | First-run experience showing AI capabilities | Immediate understanding of what's possible |
| **Tool Command Palette** | Searchable, categorized tool browser | Discover tools and learn usage patterns |
| **Click-to-Insert** | One-click prompt population | Reduce friction, teach by example |
| **Tool Transparency** | Show which tools were used per response | Build trust, enable learning |

### Design Philosophy

- **Teach by doing** - Users learn by trying example prompts, not reading documentation
- **Progressive disclosure** - Simple surface, depth available when needed
- **Intent-based organization** - Tools organized by what users want to accomplish, not technical function names
- **Transparency builds trust** - Users should understand what the AI is doing behind the scenes

### Integration Approach

These features integrate primarily with the AI chat interface. The implementing AI should:

1. Discover the existing chat component architecture
2. Identify where chat messages are rendered and stored
3. Find the chat input component and its state management
4. Locate the existing tool definitions and their schemas
5. Integrate new components following established patterns

---

## 2. Tool Registry Architecture

### Central Tool Registry

Create a centralized registry that maps internal tool slugs to user-friendly metadata. This registry powers all four features.

```typescript
// Type Definitions

interface ToolDefinition {
  slug: string;                    // Internal tool identifier (e.g., "searchProperties")
  displayName: string;             // User-friendly name (e.g., "Natural Language Search")
  shortDescription: string;        // One-line description (max 80 chars)
  fullDescription: string;         // Detailed explanation for "Learn more"
  category: ToolCategory;          // Primary category
  subcategory?: string;            // Optional subcategory for large categories
  icon: string;                    // Lucide icon name (e.g., "Search", "Home", "TrendingUp")
  examples: ToolExample[];         // Example prompts (minimum 2, maximum 5)
  keywords: string[];              // Search keywords beyond the name
  isPrimary: boolean;              // Featured in onboarding/quick access
  isAdvanced: boolean;             // Hide from beginners, show in "All Tools"
  requiresContext?: ContextType[]; // What context this tool needs (property, deal, etc.)
}

interface ToolExample {
  prompt: string;                  // The example prompt text
  description?: string;            // Optional explanation of what this does
  resultPreview?: string;          // Optional preview of expected result type
}

type ToolCategory = 
  | "property-search"      // Finding properties
  | "deal-analysis"        // Analyzing deals and properties
  | "buyer-intelligence"   // Buyer discovery and matching
  | "market-research"      // Market data and trends
  | "valuation"            // ARV, comps, pricing
  | "outreach"             // Communication and follow-up
  | "list-management"      // Managing property lists
  | "pipeline"             // Deal pipeline operations
  | "skip-tracing"         // Contact information lookup
  | "documents"            // Document generation and management
  | "settings"             // User preferences and configuration
  | "help";                // Platform help and guidance

type ContextType = 
  | "property"             // Requires a property in context
  | "deal"                 // Requires a deal in context
  | "buyer"                // Requires a buyer in context
  | "list"                 // Requires a list in context
  | "none";                // No context required

// Category Metadata

interface CategoryDefinition {
  id: ToolCategory;
  displayName: string;
  description: string;
  icon: string;                    // Lucide icon name
  sortOrder: number;               // Display order in palette
  color: string;                   // Tailwind color class for accents
}

const categoryDefinitions: CategoryDefinition[] = [
  {
    id: "property-search",
    displayName: "Find Properties",
    description: "Search for properties using natural language or filters",
    icon: "Search",
    sortOrder: 1,
    color: "text-blue-600"
  },
  {
    id: "deal-analysis",
    displayName: "Analyze Deals",
    description: "Evaluate properties and calculate deal metrics",
    icon: "Calculator",
    sortOrder: 2,
    color: "text-green-600"
  },
  {
    id: "buyer-intelligence",
    displayName: "Buyers",
    description: "Find and match cash buyers for your deals",
    icon: "Users",
    sortOrder: 3,
    color: "text-purple-600"
  },
  {
    id: "market-research",
    displayName: "Market Intel",
    description: "Research market trends and conditions",
    icon: "TrendingUp",
    sortOrder: 4,
    color: "text-orange-600"
  },
  {
    id: "valuation",
    displayName: "Valuations",
    description: "Get ARV estimates, comps, and pricing analysis",
    icon: "DollarSign",
    sortOrder: 5,
    color: "text-emerald-600"
  },
  {
    id: "outreach",
    displayName: "Outreach",
    description: "Generate messages and manage communications",
    icon: "MessageSquare",
    sortOrder: 6,
    color: "text-pink-600"
  },
  {
    id: "list-management",
    displayName: "Lists",
    description: "Create, manage, and organize property lists",
    icon: "List",
    sortOrder: 7,
    color: "text-indigo-600"
  },
  {
    id: "pipeline",
    displayName: "Pipeline",
    description: "Manage deals through your sales pipeline",
    icon: "GitBranch",
    sortOrder: 8,
    color: "text-cyan-600"
  },
  {
    id: "skip-tracing",
    displayName: "Skip Tracing",
    description: "Find owner contact information",
    icon: "Phone",
    sortOrder: 9,
    color: "text-yellow-600"
  },
  {
    id: "documents",
    displayName: "Documents",
    description: "Generate contracts, reports, and documents",
    icon: "FileText",
    sortOrder: 10,
    color: "text-slate-600"
  },
  {
    id: "settings",
    displayName: "Settings",
    description: "Configure preferences and account settings",
    icon: "Settings",
    sortOrder: 11,
    color: "text-gray-600"
  },
  {
    id: "help",
    displayName: "Help",
    description: "Get help with the platform",
    icon: "HelpCircle",
    sortOrder: 12,
    color: "text-gray-500"
  }
];
```

### Example Tool Registry Entries

```typescript
// Example entries to demonstrate the pattern
// The implementing AI should create entries for all existing tools

const toolRegistry: ToolDefinition[] = [
  {
    slug: "searchProperties",
    displayName: "Natural Language Search",
    shortDescription: "Find properties by describing what you're looking for",
    fullDescription: "Search the property database using plain English. Describe the type of properties you want (location, bedrooms, price range, owner characteristics) and the AI will find matching results. Supports all standard filters plus contrarian filters like 'tired landlords' and 'underwater owners'.",
    category: "property-search",
    icon: "Search",
    examples: [
      {
        prompt: "Find 3 bed houses in Tampa with tired landlords under $200k",
        description: "Combines property specs with motivation filters",
        resultPreview: "Property list with equity and motivation scores"
      },
      {
        prompt: "High equity absentee owners in 33607",
        description: "Filter-focused search by zip code",
        resultPreview: "Properties with 50%+ equity, non-owner occupied"
      },
      {
        prompt: "Free and clear properties near downtown Orlando",
        description: "No mortgage properties in a specific area",
        resultPreview: "Properties with no outstanding loans"
      }
    ],
    keywords: ["find", "search", "properties", "houses", "filter", "landlord", "equity", "absentee"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["none"]
  },
  {
    slug: "analyzeProperty",
    displayName: "Deal Analysis",
    shortDescription: "Get complete analysis on any property",
    fullDescription: "Comprehensive deal analysis including ARV estimate, repair cost estimation, equity calculation, cash flow projections, and AI-powered deal scoring. The analysis considers comparable sales, market conditions, and your target profit margins.",
    category: "deal-analysis",
    icon: "Calculator",
    examples: [
      {
        prompt: "Analyze 123 Main St, Tampa FL",
        description: "Full deal analysis by address",
        resultPreview: "ARV, repair estimate, MAO, deal score"
      },
      {
        prompt: "Is this a good wholesale deal?",
        description: "When viewing a property, get a deal assessment",
        resultPreview: "Deal recommendation with reasoning"
      },
      {
        prompt: "Run the numbers on this property at $150k purchase price",
        description: "Analysis with custom purchase price",
        resultPreview: "Profit projections at specified price"
      }
    ],
    keywords: ["analyze", "analysis", "deal", "numbers", "arv", "profit", "evaluate"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["none", "property"]
  },
  {
    slug: "findBuyers",
    displayName: "Find Matching Buyers",
    shortDescription: "Discover cash buyers for a specific deal",
    fullDescription: "Search the buyer database to find investors whose buying criteria match your property. Results are ranked by match strength based on their historical purchase patterns, stated preferences, and recent activity in the area.",
    category: "buyer-intelligence",
    icon: "UserSearch",
    examples: [
      {
        prompt: "Who's buying 3 beds in this zip code?",
        description: "Find active buyers by property type and area",
        resultPreview: "Buyer list with match scores and contact info"
      },
      {
        prompt: "Find buyers for this property",
        description: "When viewing a property, find matching buyers",
        resultPreview: "Ranked buyer matches based on criteria"
      },
      {
        prompt: "Show me the most active cash buyers in Tampa",
        description: "Find high-volume investors in an area",
        resultPreview: "Buyers sorted by transaction volume"
      }
    ],
    keywords: ["buyers", "investors", "cash buyer", "match", "disposition", "assign"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["none", "property", "deal"]
  },
  {
    slug: "getMarketStats",
    displayName: "Market Overview",
    shortDescription: "Get market statistics and trends for an area",
    fullDescription: "Retrieve comprehensive market data including median prices, days on market, inventory levels, price trends, and the Market Velocity Index. Data is available at city, zip code, and neighborhood levels.",
    category: "market-research",
    icon: "TrendingUp",
    examples: [
      {
        prompt: "How's the Tampa market doing?",
        description: "General market health check",
        resultPreview: "Key metrics with trend indicators"
      },
      {
        prompt: "What's the median price in 33607?",
        description: "Specific metric for a zip code",
        resultPreview: "Median price with historical context"
      },
      {
        prompt: "Compare markets: Tampa vs Orlando for wholesaling",
        description: "Side-by-side market comparison",
        resultPreview: "Comparison table with key metrics"
      }
    ],
    keywords: ["market", "stats", "trends", "median", "prices", "inventory", "days on market"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["none"]
  },
  {
    slug: "pullComps",
    displayName: "Comparable Sales",
    shortDescription: "Find recent comparable sales for valuation",
    fullDescription: "Pull comparable sales within a specified radius of a subject property. Comps are filtered by property type, size, and recency. Each comp includes sale price, price per square foot, days on market, and an explanation of how it compares to the subject.",
    category: "valuation",
    icon: "Scale",
    examples: [
      {
        prompt: "Pull comps for 123 Main St",
        description: "Get comparable sales for a property",
        resultPreview: "Comp list with prices and adjustments"
      },
      {
        prompt: "Find similar sales within half a mile in the last 6 months",
        description: "Customized comp search",
        resultPreview: "Filtered comps with map view"
      },
      {
        prompt: "Why did you choose these comps?",
        description: "Get explanation of comp selection",
        resultPreview: "Reasoning for each comparable"
      }
    ],
    keywords: ["comps", "comparables", "sales", "arv", "value", "similar"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["none", "property"]
  },
  {
    slug: "explainFilter",
    displayName: "Filter Explanation",
    shortDescription: "Learn what a filter does and when to use it",
    fullDescription: "Get detailed explanations of any filter in the system, including what data it uses, why it indicates seller motivation, and strategies for using it effectively. Includes tips on combining filters for better results.",
    category: "help",
    icon: "HelpCircle",
    examples: [
      {
        prompt: "What is a tired landlord?",
        description: "Understand a specific filter",
        resultPreview: "Definition with usage strategies"
      },
      {
        prompt: "Explain the underwater landlord filter",
        description: "Learn about contrarian filters",
        resultPreview: "How it works and when to use it"
      },
      {
        prompt: "What filters should I use to find motivated sellers?",
        description: "Strategy guidance",
        resultPreview: "Recommended filter combinations"
      }
    ],
    keywords: ["filter", "explain", "what is", "how does", "definition", "strategy"],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ["none"]
  },
  {
    slug: "generateOutreach",
    displayName: "Generate Outreach Message",
    shortDescription: "Create personalized seller outreach messages",
    fullDescription: "Generate customized outreach messages (direct mail, SMS, email, voicemail scripts) based on property data and owner circumstances. Messages are personalized but never mention sensitive situations like divorce, foreclosure, or financial distress.",
    category: "outreach",
    icon: "Mail",
    examples: [
      {
        prompt: "Write a letter for this absentee owner",
        description: "Direct mail copy",
        resultPreview: "Personalized letter ready to send"
      },
      {
        prompt: "Create an SMS for a tired landlord",
        description: "Text message outreach",
        resultPreview: "Compliant, personalized SMS"
      },
      {
        prompt: "Write a voicemail script for this property",
        description: "Cold call voicemail",
        resultPreview: "Natural-sounding script"
      }
    ],
    keywords: ["outreach", "letter", "email", "sms", "text", "message", "script", "mail"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["property"]
  },
  {
    slug: "skipTrace",
    displayName: "Skip Trace Owner",
    shortDescription: "Get phone numbers and emails for property owners",
    fullDescription: "Look up contact information for property owners including phone numbers (mobile, landline), email addresses, and alternative contacts. Results include confidence scores and best time to call recommendations.",
    category: "skip-tracing",
    icon: "Phone",
    examples: [
      {
        prompt: "Get contact info for this owner",
        description: "Skip trace current property",
        resultPreview: "Phone numbers and emails with confidence scores"
      },
      {
        prompt: "Skip trace all properties in my list",
        description: "Bulk skip tracing",
        resultPreview: "Contact info for entire list"
      }
    ],
    keywords: ["skip", "trace", "phone", "email", "contact", "owner", "number"],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ["property", "list"]
  },
  {
    slug: "addToList",
    displayName: "Add to List",
    shortDescription: "Save properties to a list for later",
    fullDescription: "Add properties to new or existing lists for organization, marketing campaigns, or follow-up tracking. Lists can be tagged, shared with team members, and exported.",
    category: "list-management",
    icon: "ListPlus",
    examples: [
      {
        prompt: "Add this to my hot leads list",
        description: "Add current property to existing list",
        resultPreview: "Confirmation with list count"
      },
      {
        prompt: "Create a new list called 'Tampa Absentee'",
        description: "Create a new list",
        resultPreview: "New list created and ready"
      },
      {
        prompt: "Save these search results to a list",
        description: "Bulk add from search",
        resultPreview: "All results added to list"
      }
    ],
    keywords: ["list", "add", "save", "create", "organize"],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ["property", "none"]
  },
  {
    slug: "moveToPipeline",
    displayName: "Add to Pipeline",
    shortDescription: "Move a property into your deal pipeline",
    fullDescription: "Add a property to your deal pipeline at a specific stage. Track your deals from initial contact through closing with status updates, notes, and activity logging.",
    category: "pipeline",
    icon: "GitBranch",
    examples: [
      {
        prompt: "Add this to my pipeline",
        description: "Start tracking a deal",
        resultPreview: "Deal card created in pipeline"
      },
      {
        prompt: "Move this deal to 'Under Contract'",
        description: "Update deal stage",
        resultPreview: "Deal moved to new stage"
      },
      {
        prompt: "What's in my pipeline right now?",
        description: "View pipeline summary",
        resultPreview: "Pipeline overview by stage"
      }
    ],
    keywords: ["pipeline", "deal", "stage", "track", "under contract", "prospect"],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ["property", "deal", "none"]
  }
];
```

### Dynamic Tool Discovery

The tool registry should be dynamically populated from the existing tool definitions in the codebase. The implementing AI should:

1. **Locate existing tool definitions** - Find where AI tools are defined (likely using Vercel AI SDK's `tool()` function or similar)
2. **Extract tool metadata** - Get the slug, description, and parameters from each tool
3. **Create registry entries** - Generate ToolDefinition entries for each tool
4. **Store the registry** - Create the registry file that powers all four features

```typescript
// Utility to get tools by category
function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return toolRegistry
    .filter(tool => tool.category === category)
    .sort((a, b) => {
      // Primary tools first, then alphabetical
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
}

// Utility for fuzzy search
function searchTools(query: string): ToolDefinition[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return toolRegistry
    .filter(tool => {
      // Search across name, description, keywords, and example prompts
      const searchableText = [
        tool.displayName,
        tool.shortDescription,
        ...tool.keywords,
        ...tool.examples.map(e => e.prompt)
      ].join(' ').toLowerCase();
      
      return searchableText.includes(normalizedQuery);
    })
    .sort((a, b) => {
      // Prioritize matches in name over description over examples
      const aNameMatch = a.displayName.toLowerCase().includes(normalizedQuery);
      const bNameMatch = b.displayName.toLowerCase().includes(normalizedQuery);
      if (aNameMatch !== bNameMatch) return aNameMatch ? -1 : 1;
      
      // Then by primary status
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      
      return 0;
    });
}

// Get featured tools for onboarding
function getFeaturedTools(): ToolDefinition[] {
  return toolRegistry
    .filter(tool => tool.isPrimary && !tool.isAdvanced)
    .slice(0, 8); // Max 8 for onboarding
}
```

---

## 3. Feature 1: Interactive Onboarding

### Purpose

Show new users what the AI can do through interactive examples they can try immediately. This replaces traditional "click through slides" onboarding with learning by doing.

### Trigger Conditions

Display the onboarding modal when:

1. **First login** - User has never dismissed the onboarding
2. **User request** - User clicks "What can the AI do?" or similar help option
3. **Empty chat state** - Optionally show a simplified version when chat is empty

### Persistence

```typescript
interface OnboardingState {
  hasSeenOnboarding: boolean;
  onboardingDismissedAt: string | null;  // ISO timestamp
  onboardingVersion: number;             // Increment to re-show after major updates
}

// Store in user preferences in the database
// Current version: 1
```

### UI Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│     ✨ What can the AI help you with?                               │
│                                                                     │
│     the AI is your AI assistant for finding deals, analyzing        │
│     properties, and connecting with buyers. Try any of these:      │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │ 🏠 Find Deals           │  │ 📊 Analyze Properties   │          │
│  │                         │  │                         │          │
│  │ "Find 3 bed houses in   │  │ "Is 123 Main St,       │          │
│  │  Tampa with tired       │  │  Tampa a good deal?"   │          │
│  │  landlords under $200k" │  │                         │          │
│  │                         │  │                         │          │
│  │ [Try this →]            │  │ [Try this →]            │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │ 🎯 Find Buyers          │  │ 📈 Market Research      │          │
│  │                         │  │                         │          │
│  │ "Who's buying in        │  │ "How's the Tampa       │          │
│  │  this zip code?"        │  │  market doing?"        │          │
│  │                         │  │                         │          │
│  │ [Try this →]            │  │ [Try this →]            │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐          │
│  │ 💰 Get Valuations       │  │ ✉️ Generate Outreach    │          │
│  │                         │  │                         │          │
│  │ "Pull comps for this    │  │ "Write a letter for    │          │
│  │  property"              │  │  this absentee owner"  │          │
│  │                         │  │                         │          │
│  │ [Try this →]            │  │ [Try this →]            │          │
│  └─────────────────────────┘  └─────────────────────────┘          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💡 Pro tip: You can also type "/" in the chat to browse    │   │
│  │    all available tools, or press ⌘K anytime.               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│            [Browse all tools]        [Got it, let's go →]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Specifications

```typescript
interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryExample: (prompt: string) => void;  // Insert prompt into chat
  onOpenToolPalette: () => void;           // Open the command palette
}

interface OnboardingCardProps {
  icon: string;           // Lucide icon name
  title: string;          // Category name
  examplePrompt: string;  // The example to try
  onTry: () => void;      // Callback when clicked
}
```

### Behavior

1. **Modal appearance** - Fade in with subtle scale animation (200ms ease-out)
2. **Card hover** - Slight elevation increase, border color change to primary
3. **"Try this" click** - Close modal, insert prompt into chat input, focus chat input
4. **"Browse all tools"** - Close modal, open command palette
5. **"Got it, let's go"** - Close modal, mark onboarding as seen
6. **Backdrop click or Escape** - Close modal, mark onboarding as seen

### Empty State Integration

When the chat has no messages, show a simplified inline version:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ✨ What would you like to do?                   │
│                                                                     │
│     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│     │ 🏠 Find     │ │ 📊 Analyze  │ │ 🎯 Find     │ │ 📈 Market │  │
│     │   Deals    │ │   Deals    │ │   Buyers   │ │   Intel   │  │
│     └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘  │
│                                                                     │
│     Or just start typing what you need...                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Ask the AI anything...                              ⚡ ↵    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature 2: Tool Command Palette

### Purpose

A searchable, categorized browser for all ~200 tools. Users can discover tools, see usage examples, and insert prompts directly into chat.

### Trigger Methods

The command palette opens via three methods:

| Trigger | Action | Notes |
|---------|--------|-------|
| **Lightning bolt button** | Click ⚡ icon in chat input | Always visible in input area |
| **Forward slash** | Type `/` as first character in empty input | Inline trigger |
| **Keyboard shortcut** | Press `Cmd+K` (Mac) or `Ctrl+K` (Windows) | Global shortcut when chat is focused |

### UI Structure - Closed State

The chat input should include a lightning bolt button:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ⚡│ Ask the AI anything...                                  ↵  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

The ⚡ icon is a button that opens the command palette.
```

### UI Structure - Open State (Full Palette)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search tools...                                        ⌘K │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │  FIND PROPERTIES                                       ▾     │ │
│  │  ───────────────────────────────────────────────────────     │ │
│  │                                                               │ │
│  │  🏠 Natural Language Search                            →     │ │
│  │     "Find 3 bed houses in Tampa with tired landlords"        │ │
│  │                                                               │ │
│  │  🔍 Search by Filter                                   →     │ │
│  │     "High equity absentee owners in 33607"                   │ │
│  │                                                               │ │
│  │  📍 Search by Location                                 →     │ │
│  │     "Properties within 2 miles of downtown"                  │ │
│  │                                                               │ │
│  │                                                               │ │
│  │  ANALYZE DEALS                                         ▾     │ │
│  │  ───────────────────────────────────────────────────────     │ │
│  │                                                               │ │
│  │  📊 Deal Analysis                                      →     │ │
│  │     "Analyze 123 Main St, Tampa FL"                          │ │
│  │                                                               │ │
│  │  💰 Run Comps                                          →     │ │
│  │     "Pull comps for this property"                           │ │
│  │                                                               │ │
│  │  📈 Cash Flow Analysis                                 →     │ │
│  │     "What's the rental potential?"                           │ │
│  │                                                               │ │
│  │  [Show more categories...]                                   │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ↑↓ Navigate  ↵ Select  ⎋ Close                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Structure - Search Active

When user types in the search box:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔍 buyer                                                  ✕  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │  🎯 Find Matching Buyers                               →     │ │
│  │     "Who's buying in this zip code?"                         │ │
│  │     Buyers · Primary                                         │ │
│  │                                                               │ │
│  │  👥 Browse Buyer Database                              →     │ │
│  │     "Show me cash buyers in Tampa"                           │ │
│  │     Buyers                                                   │ │
│  │                                                               │ │
│  │  📊 Buyer Activity Report                              →     │ │
│  │     "What has this buyer purchased recently?"                │ │
│  │     Buyers · Advanced                                        │ │
│  │                                                               │ │
│  │  📧 Send to Buyers                                     →     │ │
│  │     "Blast this deal to matching buyers"                     │ │
│  │     Outreach                                                 │ │
│  │                                                               │ │
│  │  ───────────────────────────────────────────────────────     │ │
│  │  4 tools found                                               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Structure - Tool Expanded (Learn More)

When user clicks the arrow or presses right on a tool:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ← Back                                                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │  🎯 Find Matching Buyers                                     │ │
│  │  ─────────────────────────────────────────────────────────   │ │
│  │                                                               │ │
│  │  Search the buyer database to find investors whose buying    │ │
│  │  criteria match your property. Results are ranked by match   │ │
│  │  strength based on their historical purchase patterns,       │ │
│  │  stated preferences, and recent activity in the area.        │ │
│  │                                                               │ │
│  │  EXAMPLES                                                     │ │
│  │  ─────────────────────────────────────────────────────────   │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ "Who's buying 3 beds in this zip code?"                 │ │ │
│  │  │ Find active buyers by property type and area            │ │ │
│  │  │                                        [Insert ↵]       │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ "Find buyers for this property"                         │ │ │
│  │  │ When viewing a property, find matching buyers           │ │ │
│  │  │                                        [Insert ↵]       │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ "Show me the most active cash buyers in Tampa"          │ │ │
│  │  │ Find high-volume investors in an area                   │ │ │
│  │  │                                        [Insert ↵]       │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Specifications

```typescript
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertPrompt: (prompt: string) => void;
  initialQuery?: string;  // Pre-populate search (e.g., from "/" trigger)
}

interface CommandPaletteState {
  searchQuery: string;
  selectedIndex: number;           // Currently highlighted item
  expandedTool: string | null;     // Tool slug if viewing details
  visibleCategories: ToolCategory[];  // Which categories are expanded
}

interface ToolListItemProps {
  tool: ToolDefinition;
  isSelected: boolean;
  onSelect: () => void;         // Primary action (insert first example)
  onExpand: () => void;         // Show details
  showCategory?: boolean;        // Show category badge (in search results)
}

interface ToolDetailViewProps {
  tool: ToolDefinition;
  onBack: () => void;
  onInsertExample: (prompt: string) => void;
}
```

### Behavior Specifications

**Opening:**
- Lightning bolt click: Open palette, focus search input
- `/` in empty input: Open palette with "/" cleared, focus search input
- `Cmd+K`: Open palette, focus search input
- Animation: Fade in + slide up (150ms ease-out)

**Search:**
- Debounce: 100ms after keystroke
- Empty query: Show categorized browse view
- With query: Show flat search results
- Highlight matching text in results

**Navigation:**
- `↑` / `↓`: Move selection up/down
- `Enter` on category: Toggle expand/collapse
- `Enter` on tool: Insert first example prompt
- `→` on tool: Show tool detail view
- `←` in detail view: Go back to list
- `Escape`: Close palette (or go back if in detail view)

**Insertion:**
- Close palette
- Insert prompt text at cursor position in chat input
- Focus chat input
- Do NOT auto-submit (let user review/modify)

**Scrolling:**
- Virtual scroll for performance with 200+ tools
- Selected item always visible in viewport
- Smooth scroll to selected item

### Slash Command Inline Mode

When user types `/` as first character, show a compact inline dropdown instead of the full modal:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ /                                                             │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  🏠 Natural Language Search                                  │ │
│  │  📊 Deal Analysis                                            │ │
│  │  🎯 Find Matching Buyers                                     │ │
│  │  📈 Market Overview                                          │ │
│  │  💰 Comparable Sales                                         │ │
│  │  ─────────────────────────────────────────────────           │ │
│  │  Type to filter · ↑↓ select · ↵ use · ⎋ cancel               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Typing after `/` filters the list. Selecting a tool inserts its first example prompt.

---

## 5. Feature 3: Click-to-Insert

### Purpose

Allow users to populate the chat input with example prompts via a single click, reducing friction and teaching effective prompt patterns.

### Integration Points

Click-to-insert functionality is used in:

1. **Onboarding modal** - "Try this" buttons
2. **Command palette** - Tool items and example buttons
3. **Empty chat state** - Quick action cards
4. **Tool detail view** - Individual example buttons

### Behavior Specification

```typescript
interface InsertPromptOptions {
  prompt: string;
  shouldFocus?: boolean;      // Default: true
  shouldReplace?: boolean;    // Default: true (replace vs append)
  cursorPosition?: 'end' | 'select-all';  // Default: 'end'
}

function insertPromptToChat(options: InsertPromptOptions): void {
  // 1. Close any open modals/palettes
  // 2. Get reference to chat input element
  // 3. If shouldReplace, clear existing content
  // 4. Insert the prompt text
  // 5. If shouldFocus, focus the input
  // 6. Position cursor according to cursorPosition
  // 7. Trigger any necessary state updates
}
```

### Visual Feedback

When a prompt is inserted:

1. **Pulse animation** on chat input (subtle border glow, 300ms)
2. **Text appears** with a slight fade-in
3. **Cursor blinks** at end of inserted text

### Do NOT Auto-Submit

Critical: Never automatically send the message. Users should always have the opportunity to:
- Read what was inserted
- Modify the prompt if needed
- Press Enter to submit when ready

---

## 6. Feature 4: Tool Transparency

### Purpose

Show users which tools the AI used to generate each response, building trust and enabling learning about the platform's capabilities.

### Data Structure

```typescript
// Extend the existing chat message type
interface ChatMessageWithTools {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  
  // Tool transparency data
  toolCalls?: ToolCallRecord[];
}

interface ToolCallRecord {
  id: string;                  // Unique call ID
  toolSlug: string;            // Internal tool identifier
  displayName: string;         // User-friendly name from registry
  icon: string;                // Lucide icon name
  status: 'pending' | 'success' | 'error';
  startedAt: string;           // ISO timestamp
  completedAt?: string;        // ISO timestamp
  durationMs?: number;         // Execution time
  
  // Optional details (for expandable view)
  inputSummary?: string;       // Brief description of what was requested
  outputSummary?: string;      // Brief description of result
  resultCount?: number;        // For list-returning tools
  errorMessage?: string;       // If status is 'error'
}
```

### UI Structure - Collapsed (Default)

Below each AI response that used tools:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  🤖 I found 23 properties in Tampa matching your criteria.         │
│     Here are the top results based on equity and motivation...     │
│                                                                     │
│  [Property cards displayed here]                                    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ⚡ 3 tools used                                            ▸ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Structure - Expanded

When user clicks to expand:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  🤖 I found 23 properties in Tampa matching your criteria...       │
│                                                                     │
│  [Property cards displayed here]                                    │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ⚡ 3 tools used                                            ▾ │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │  ✓ 🔍 Property Search                              142ms    │ │
│  │      Searched Tampa, FL with tired landlord filter           │ │
│  │      → 23 properties found                                   │ │
│  │                                                               │ │
│  │  ✓ 💰 Equity Calculator                             38ms    │ │
│  │      Calculated equity for 23 properties                     │ │
│  │      → Applied to all results                                │ │
│  │                                                               │ │
│  │  ✓ 📊 Motivation Scorer                             67ms    │ │
│  │      Ranked properties by seller motivation                  │ │
│  │      → Sorted results by score                               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Specifications

```typescript
interface ToolTransparencyProps {
  toolCalls: ToolCallRecord[];
  defaultExpanded?: boolean;  // Default: false
}

interface ToolCallItemProps {
  call: ToolCallRecord;
  showDuration?: boolean;     // Default: true
}
```

### Status Indicators

| Status | Icon | Color | Description |
|--------|------|-------|-------------|
| `pending` | Spinner | gray | Tool is currently executing |
| `success` | ✓ | green | Tool completed successfully |
| `error` | ✕ | red | Tool encountered an error |

### Streaming Integration

During response streaming, show tools as they execute:

```
┌───────────────────────────────────────────────────────────────┐
│ ⚡ Working...                                                 │
├───────────────────────────────────────────────────────────────┤
│  ✓ 🔍 Property Search                              142ms    │
│  ⟳ 💰 Equity Calculator                                     │ (spinner)
└───────────────────────────────────────────────────────────────┘
```

### Behavior

- **Default state**: Collapsed, showing tool count only
- **Click to expand**: Shows full list with details
- **Click again**: Collapses back
- **Persist preference**: Remember last state per session (not per message)
- **During streaming**: Always expanded to show progress
- **After streaming**: Collapse to default state

### Empty State

If a response used no tools (pure conversation), don't show the transparency component at all.

---

## 7. UI/UX Specifications

### Color Palette

Use the existing design system colors. Key assignments:

| Element | Color Token | Usage |
|---------|-------------|-------|
| Primary buttons | `primary-600` | Insert buttons, CTAs |
| Tool icons | Category-specific | See categoryDefinitions |
| Success status | `green-600` | Completed tool calls |
| Error status | `red-600` | Failed tool calls |
| Pending status | `gray-400` | In-progress indicators |
| Backgrounds | `white` / `gray-50` | Cards and modals |
| Borders | `gray-200` | Dividers and outlines |
| Text primary | `gray-900` | Main text |
| Text secondary | `gray-500` | Descriptions, hints |

### Typography

| Element | Style |
|---------|-------|
| Modal titles | DM Sans, 20px, semibold |
| Category headers | DM Sans, 14px, semibold, uppercase, letter-spacing 0.05em |
| Tool names | DM Sans, 15px, medium |
| Tool descriptions | DM Sans, 14px, regular, gray-500 |
| Example prompts | DM Sans, 14px, regular, monospace background hint |
| Keyboard hints | DM Sans, 12px, regular, gray-400 |

### Spacing

| Context | Value |
|---------|-------|
| Modal padding | 24px |
| Card padding | 16px |
| Between cards | 12px |
| Between sections | 24px |
| Icon to text | 12px |
| Inline elements | 8px |

### Animations

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Modal appear | 200ms | ease-out | Open modal |
| Modal dismiss | 150ms | ease-in | Close modal |
| Card hover | 150ms | ease | Mouse enter |
| List item select | 100ms | ease | Keyboard/click |
| Expand/collapse | 200ms | ease-in-out | Toggle |
| Pulse highlight | 300ms | ease-out | Prompt insert |
| Spinner | 1000ms | linear, infinite | Loading state |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (1024px+) | Full modals with padding |
| Tablet (768-1023px) | Full-width modals, same content |
| Mobile (<768px) | Bottom sheet style for palette |

### Icons

Use Lucide icons exclusively. Key icons:

| Element | Icon |
|---------|------|
| Lightning bolt trigger | `Zap` |
| Search | `Search` |
| Close/clear | `X` |
| Expand | `ChevronRight` |
| Collapse | `ChevronDown` |
| Back | `ArrowLeft` |
| Success | `Check` |
| Error | `X` (in circle) |
| Loading | `Loader2` (animated) |
| Insert | `CornerDownLeft` |

---

## 8. State Management

### Local State

```typescript
// Onboarding state
interface OnboardingStore {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// Command palette state
interface CommandPaletteStore {
  isOpen: boolean;
  searchQuery: string;
  selectedIndex: number;
  expandedTool: string | null;
  
  open: (initialQuery?: string) => void;
  close: () => void;
  setSearchQuery: (query: string) => void;
  moveSelection: (direction: 'up' | 'down') => void;
  selectCurrent: () => void;
  expandTool: (slug: string) => void;
  collapseDetail: () => void;
}

// Tool transparency state (per message)
interface ToolTransparencyState {
  expandedMessageIds: Set<string>;  // Which messages have expanded tool view
  toggleExpanded: (messageId: string) => void;
}
```

### Persisted State

```typescript
// Store in user preferences (database)
interface UserOnboardingPreferences {
  hasSeenOnboarding: boolean;
  onboardingDismissedAt: string | null;
  onboardingVersion: number;
  
  // Optional future preferences
  defaultToolTransparencyExpanded?: boolean;
}
```

### Chat Input Integration

The chat input needs to expose:

```typescript
interface ChatInputRef {
  insertText: (text: string, options?: InsertOptions) => void;
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

interface InsertOptions {
  replace?: boolean;      // Replace existing content
  cursorPosition?: 'end' | 'start' | 'select-all';
}
```

---

## 9. Keyboard & Accessibility

### Keyboard Shortcuts

| Shortcut | Context | Action |
|----------|---------|--------|
| `Cmd+K` / `Ctrl+K` | Chat focused | Open command palette |
| `/` | Empty chat input | Open inline command palette |
| `Escape` | Palette open | Close palette (or go back) |
| `↑` / `↓` | Palette open | Navigate items |
| `Enter` | Palette open | Select/insert current item |
| `→` | Palette, item focused | Show tool detail |
| `←` | Palette, detail view | Go back to list |
| `Tab` | Modal/palette open | Navigate focusable elements |

### ARIA Attributes

```html
<!-- Command Palette -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-label="Search tools"
>
  <input 
    role="combobox"
    aria-expanded="true"
    aria-controls="tool-listbox"
    aria-activedescendant="tool-item-{selectedId}"
  />
  <ul 
    id="tool-listbox"
    role="listbox"
    aria-label="Available tools"
  >
    <li 
      id="tool-item-{id}"
      role="option"
      aria-selected="{isSelected}"
    >
      ...
    </li>
  </ul>
</div>

<!-- Tool Transparency -->
<div 
  aria-expanded="{isExpanded}"
  aria-label="Tools used for this response"
>
  <button aria-controls="tool-list-{messageId}">
    {toolCount} tools used
  </button>
  <ul id="tool-list-{messageId}">
    ...
  </ul>
</div>
```

### Focus Management

1. **Modal open**: Focus search input immediately
2. **Modal close**: Return focus to chat input
3. **Insert prompt**: Focus chat input after insertion
4. **Navigation**: Arrow keys don't move focus, they move selection
5. **Tab key**: Moves through interactive elements in logical order

### Screen Reader Announcements

- Announce when palette opens/closes
- Announce number of search results
- Announce selected item changes
- Announce when prompt is inserted

---

## 10. Implementation Guidance

### Discovery Phase

Before implementing, the AI should:

1. **Find the chat interface components**
   - Locate the main chat container
   - Identify the chat input component
   - Find where messages are rendered
   - Understand the message data structure

2. **Find the AI tool definitions**
   - Locate where tools are defined (Vercel AI SDK patterns)
   - Extract tool slugs and descriptions
   - Understand how tool calls are recorded in messages

3. **Understand state management patterns**
   - Identify how the app manages global state
   - Find where user preferences are stored
   - Understand how modals are typically implemented

4. **Review design system**
   - Find existing color tokens
   - Locate typography definitions
   - Identify existing modal/dialog patterns
   - Find existing animation patterns

### Implementation Order

Build in this order to ensure dependencies are satisfied:

1. **Tool Registry** (no dependencies)
   - Create registry types
   - Build initial registry from existing tools
   - Implement search/filter utilities

2. **Click-to-Insert Utility** (depends on chat input ref)
   - Create the insertion function
   - Add ref to chat input if needed
   - Test in isolation

3. **Tool Transparency** (depends on registry, message structure)
   - Extend message type if needed
   - Create collapsed view component
   - Create expanded view component
   - Integrate with message rendering

4. **Command Palette** (depends on registry, click-to-insert)
   - Create palette modal component
   - Implement search functionality
   - Add keyboard navigation
   - Implement all three triggers

5. **Onboarding** (depends on registry, click-to-insert, palette)
   - Create onboarding modal
   - Add persistence logic
   - Create empty state variant
   - Integrate with first-login flow

### File Organization

Suggested structure (adapt to existing patterns):

```
components/
├── ai/
│   ├── ToolRegistry.ts          # Registry data and utilities
│   ├── CommandPalette/
│   │   ├── CommandPalette.tsx   # Main modal component
│   │   ├── ToolListItem.tsx     # Individual tool in list
│   │   ├── ToolDetailView.tsx   # Expanded tool view
│   │   ├── CategoryHeader.tsx   # Category section header
│   │   └── InlinePalette.tsx    # Slash-triggered dropdown
│   ├── ToolTransparency/
│   │   ├── ToolTransparency.tsx # Container component
│   │   ├── ToolCallItem.tsx     # Individual tool call
│   │   └── StatusIndicator.tsx  # Success/error/pending
│   ├── Onboarding/
│   │   ├── OnboardingModal.tsx  # First-run modal
│   │   ├── OnboardingCard.tsx   # Category card
│   │   └── EmptyChatState.tsx   # Inline suggestions
│   └── hooks/
│       ├── useCommandPalette.ts # Palette state/actions
│       ├── useToolSearch.ts     # Search functionality
│       └── useOnboarding.ts     # Onboarding state
```

### Testing Checklist

**Command Palette:**
- [ ] Opens with ⚡ button click
- [ ] Opens with Cmd+K / Ctrl+K
- [ ] Opens with `/` in empty input
- [ ] Search filters tools correctly
- [ ] Keyboard navigation works
- [ ] Tool detail view opens with → key
- [ ] Back navigation works with ← key
- [ ] Insert populates chat input
- [ ] Modal closes after insert
- [ ] Focus returns to chat input

**Tool Transparency:**
- [ ] Shows "X tools used" after AI response
- [ ] Expands/collapses on click
- [ ] Shows correct tool names and icons
- [ ] Shows execution time
- [ ] Shows streaming status during generation
- [ ] Handles error states

**Onboarding:**
- [ ] Shows on first login
- [ ] Doesn't show on subsequent logins
- [ ] "Try this" inserts prompt
- [ ] "Browse all tools" opens palette
- [ ] Dismissal is persisted
- [ ] Can be re-triggered from help menu

**Click-to-Insert:**
- [ ] Inserts text into chat input
- [ ] Focuses chat input after insert
- [ ] Does NOT auto-submit
- [ ] Works from all trigger points
- [ ] Visual feedback appears

### Performance Considerations

- **Tool registry**: Load once, memoize search results
- **Command palette**: Use virtual scrolling for 200+ items
- **Search**: Debounce at 100ms, cancel on close
- **Icons**: Use icon components, not inline SVGs
- **Animations**: Use CSS transforms, not layout properties

---

## Appendix A: Example Tool Categories Mapping

This table helps map common tool types to categories:

| Tool Pattern | Category |
|--------------|----------|
| `search*`, `find*`, `list*` + Properties | property-search |
| `analyze*`, `evaluate*`, `score*` | deal-analysis |
| `*buyer*`, `match*` | buyer-intelligence |
| `market*`, `trend*`, `stats*` | market-research |
| `comp*`, `arv*`, `value*`, `price*` | valuation |
| `generate*`, `write*`, `draft*` + Communication | outreach |
| `*list*` (non-property), `save*`, `organize*` | list-management |
| `pipeline*`, `stage*`, `status*` | pipeline |
| `skip*`, `contact*`, `phone*`, `email*` | skip-tracing |
| `document*`, `report*`, `export*` | documents |
| `setting*`, `preference*`, `configure*` | settings |
| `help*`, `explain*`, `how*` | help |

---

## Appendix B: Example Prompts Per Category

For building out the registry, here are additional example prompts:

### Property Search
- "Show me duplexes in Tampa under $300k"
- "Find properties with code violations"
- "Vacant houses in 33607 with 60%+ equity"
- "Recently inherited properties in Hillsborough County"
- "Properties with expired listings from the past 6 months"

### Deal Analysis
- "What's the max I should offer on this?"
- "Calculate the 70% rule for this property"
- "What's my potential assignment fee?"
- "Compare this deal to my average closed deal"
- "Show me the risk factors for this property"

### Buyer Intelligence
- "Which buyers bought similar properties last month?"
- "Find hedge fund buyers in this market"
- "Who paid the highest price per sqft in this area?"
- "Show me buyers who haven't bought in 60 days"
- "Match this deal to my VIP buyer list"

### Market Research
- "What's the average days on market here?"
- "Is this a buyer's or seller's market?"
- "Show price trends for the last 12 months"
- "What's the foreclosure rate in this zip?"
- "Compare Tampa vs St. Pete for investment"

### Valuation
- "Get ARV using sold comps only"
- "What would this rent for?"
- "Estimate repair costs for this property"
- "What's the price per square foot here?"
- "Show me the equity position"

### Outreach
- "Write a follow-up email for a warm lead"
- "Create a voicemail script for this owner"
- "Generate a direct mail letter"
- "Write an SMS for a probate lead"
- "Create a personalized offer letter"

---

## Appendix C: Error Handling

### Tool Transparency Errors

When a tool fails, show:

```
┌───────────────────────────────────────────────────────────────┐
│  ✕ 🔍 Property Search                              Error    │
│      Failed to retrieve properties                          │
│      → Retrying may help                                    │
└───────────────────────────────────────────────────────────────┘
```

### Registry Load Failure

If registry fails to load:

```typescript
// Fallback behavior
const fallbackTools: ToolDefinition[] = [
  {
    slug: "fallback",
    displayName: "Ask the AI Anything",
    shortDescription: "Type your question naturally",
    // ... minimal fallback
  }
];
```

---

