# AI-First Real Estate Wholesaling Platform
## Complete UI/UX Design System Specification

**Version:** 1.1
**Last Updated:** December 7, 2025
**Status:** Implementation Ready

### Changelog v1.1
- Added Split-View Layout Pattern for Property Search (Map Left, List Right)
- Added Floating AI Chat Dialog variant for map-centric pages
- Updated Section 3 (Layout System) with split-view specifications
- Updated Section 9 (AI Chat Interface) with floating dialog variant
- Updated Section 11 (Page Templates) with new Property Search layout
- Updated Section 14 (Responsive Design) with split-view breakpoints

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Design Tokens](#2-design-tokens)
3. [Layout System](#3-layout-system)
4. [Typography System](#4-typography-system)
5. [Color System](#5-color-system)
6. [Spacing & Sizing](#6-spacing--sizing)
7. [Component Library](#7-component-library)
8. [Navigation System](#8-navigation-system)
9. [AI Chat Interface](#9-ai-chat-interface)
10. [User Flows](#10-user-flows)
11. [Page Templates](#11-page-templates)
12. [Animation & Motion](#12-animation--motion)
13. [Accessibility Standards](#13-accessibility-standards)
14. [Responsive Design](#14-responsive-design)
15. [Dark Mode](#15-dark-mode)
16. [Iconography](#16-iconography)
17. [Data Visualization](#17-data-visualization)
18. [Form Design](#18-form-design)
19. [Feedback & States](#19-feedback--states)
20. [Implementation Guidelines](#20-implementation-guidelines)

---

## 1. Design Philosophy & Principles

### Core Design Vision

The platform should feel like it was designed by a team that studied **Apple** (clean typography, generous whitespace, subtle animations, premium feel), **Airbnb** (map-centric interface, card layouts, search experience), **Google** (Material design principles, search-first UX), **ChatGPT** (conversational UI, streaming responses), and **Claude** (artifact presentation, clean chat interface).

The goal is an "iPhone experience" — users should be able to open the platform and immediately understand how to use it without requiring extensive onboarding or tutorials.

### The Five Design Pillars

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DESIGN PILLARS                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. AI-NATIVE INTERFACE                                              │
│     ─────────────────────                                            │
│     • Natural language is the PRIMARY interaction method             │
│     • AI follows you through the system (persistent right sidebar)   │
│     • Traditional filters are progressive disclosure (hidden until   │
│       needed, revealed on demand)                                    │
│     • AI suggestions are proactive, not reactive                     │
│                                                                      │
│  2. VISUAL CLARITY                                                   │
│     ─────────────────                                                │
│     • Information hierarchy through typography weight & size         │
│     • Generous whitespace prevents cognitive overload                │
│     • Clear visual grouping through card-based layouts               │
│     • Consistent alignment grid system                               │
│                                                                      │
│  3. INTUITIVE NAVIGATION                                             │
│     ─────────────────────                                            │
│     • Predictable navigation patterns                                │
│     • Clear breadcrumbs and context awareness                        │
│     • Minimal clicks to accomplish tasks                             │
│     • Smart defaults reduce decision fatigue                         │
│                                                                      │
│  4. DELIGHTFUL INTERACTIONS                                          │
│     ────────────────────────                                         │
│     • Micro-animations provide feedback                              │
│     • Smooth transitions between states                              │
│     • Loading states that feel fast                                  │
│     • Success confirmations that celebrate achievement               │
│                                                                      │
│  5. PROFESSIONAL TRUST                                               │
│     ───────────────────                                              │
│     • Premium aesthetic builds confidence                            │
│     • Data accuracy emphasized through clean presentation            │
│     • Consistent visual language throughout                          │
│     • Financial-grade interface design                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Principles in Practice

| Principle | What It Means | How We Apply It |
|-----------|---------------|-----------------|
| **Simplicity** | Remove unnecessary complexity | One primary action per view, progressive disclosure for advanced features |
| **Consistency** | Same patterns everywhere | Unified component library, predictable behaviors |
| **Feedback** | Every action has a response | Loading states, success animations, error messages |
| **Efficiency** | Minimize time to value | AI-powered shortcuts, smart defaults, batch operations |
| **Forgiveness** | Safe to explore | Undo capabilities, confirmation dialogs for destructive actions |

---

## 2. Design Tokens

Design tokens are the atomic values that form the foundation of our visual design. They ensure consistency across all components and make theme updates efficient.

### Token Architecture

```typescript
// Design Token Structure
const designTokens = {
  // Naming Convention: [category]-[property]-[variant]-[state]
  // Examples: color-primary-500, spacing-lg, font-size-xl
  
  colors: { /* See Color System section */ },
  typography: { /* See Typography section */ },
  spacing: { /* See Spacing section */ },
  shadows: { /* See Elevation section */ },
  borders: { /* See Borders section */ },
  animations: { /* See Motion section */ },
  breakpoints: { /* See Responsive section */ },
};
```

### CSS Custom Properties (Root Variables)

```css
:root {
  /* ═══════════════════════════════════════════════════════════════════
     COLOR TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  
  /* Brand Primary - Purple/Indigo */
  --color-brand-50: #F0EEFF;
  --color-brand-100: #E0DDFF;
  --color-brand-200: #C4BFFF;
  --color-brand-300: #A59EFF;
  --color-brand-400: #8579FF;
  --color-brand-500: #7551FF;  /* Primary brand color */
  --color-brand-600: #422AFB;  /* Horizon UI brand */
  --color-brand-700: #3311DB;
  --color-brand-800: #2B0FB3;
  --color-brand-900: #1B0B6B;
  
  /* Secondary - Blue */
  --color-secondary-50: #EBF8FF;
  --color-secondary-100: #D1EEFC;
  --color-secondary-200: #A7D8F0;
  --color-secondary-300: #7CC4E4;
  --color-secondary-400: #55B4D9;
  --color-secondary-500: #3182CE;
  --color-secondary-600: #2B6CB0;
  --color-secondary-700: #2C5282;
  --color-secondary-800: #2A4365;
  --color-secondary-900: #1A365D;
  
  /* Neutrals - Gray Scale */
  --color-gray-50: #F7FAFC;
  --color-gray-100: #EDF2F7;
  --color-gray-200: #E2E8F0;
  --color-gray-300: #CBD5E0;
  --color-gray-400: #A0AEC0;
  --color-gray-500: #718096;
  --color-gray-600: #4A5568;
  --color-gray-700: #2D3748;
  --color-gray-800: #1A202C;
  --color-gray-900: #171923;
  
  /* Semantic Colors */
  --color-success-50: #F0FFF4;
  --color-success-500: #48BB78;
  --color-success-600: #38A169;
  
  --color-warning-50: #FFFBEB;
  --color-warning-500: #ECC94B;
  --color-warning-600: #D69E2E;
  
  --color-error-50: #FFF5F5;
  --color-error-500: #F56565;
  --color-error-600: #E53E3E;
  
  --color-info-50: #EBF8FF;
  --color-info-500: #4299E1;
  --color-info-600: #3182CE;
  
  /* ═══════════════════════════════════════════════════════════════════
     TYPOGRAPHY TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  
  /* Font Families */
  --font-family-primary: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-md: 1rem;        /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */
  --font-size-5xl: 3rem;       /* 48px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* ═══════════════════════════════════════════════════════════════════
     SPACING TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */
  
  /* ═══════════════════════════════════════════════════════════════════
     BORDER TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  
  --border-radius-none: 0;
  --border-radius-sm: 0.25rem;   /* 4px */
  --border-radius-md: 0.5rem;    /* 8px */
  --border-radius-lg: 0.75rem;   /* 12px */
  --border-radius-xl: 1rem;      /* 16px */
  --border-radius-2xl: 1.5rem;   /* 24px */
  --border-radius-full: 9999px;
  
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;
  
  /* ═══════════════════════════════════════════════════════════════════
     SHADOW TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  
  /* Colored Shadows (for brand elements) */
  --shadow-brand: 0 4px 14px rgba(117, 81, 255, 0.4);
  --shadow-brand-hover: 0 6px 20px rgba(117, 81, 255, 0.5);
  
  /* ═══════════════════════════════════════════════════════════════════
     TRANSITION TOKENS
     ═══════════════════════════════════════════════════════════════════ */
  
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
  --transition-slower: 500ms;
  
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* ═══════════════════════════════════════════════════════════════════
     Z-INDEX SCALE
     ═══════════════════════════════════════════════════════════════════ */
  
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-fixed: 1200;
  --z-modal-backdrop: 1300;
  --z-modal: 1400;
  --z-popover: 1500;
  --z-tooltip: 1600;
  --z-toast: 1700;
}
```

---

## 3. Layout System

### Master Layout Structure

The application follows a three-column layout with persistent navigation and AI assistant:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              APP SHELL                                       │
├────────────┬──────────────────────────────────────────────────┬─────────────┤
│            │                                                   │             │
│            │                                                   │             │
│  LEFT      │              MAIN CONTENT AREA                    │   RIGHT     │
│  SIDEBAR   │                                                   │   SIDEBAR   │
│            │  ┌─────────────────────────────────────────────┐  │             │
│  240px     │  │         Page Header / Breadcrumbs           │  │   360px     │
│  fixed     │  ├─────────────────────────────────────────────┤  │   fixed     │
│            │  │                                              │  │             │
│  • Logo    │  │                                              │  │  AI Chat   │
│  • Nav     │  │              Page Content                    │  │  Panel     │
│  • User    │  │                                              │  │             │
│            │  │                                              │  │  Always    │
│            │  │                                              │  │  visible,  │
│            │  │                                              │  │  collapse  │
│            │  │                                              │  │  toggle    │
│            │  │                                              │  │             │
│            │  └─────────────────────────────────────────────┘  │             │
│            │                                                   │             │
├────────────┴──────────────────────────────────────────────────┴─────────────┤
│                         Mobile: Bottom Navigation Bar                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Specifications

```typescript
const layoutConfig = {
  // Sidebar Dimensions
  leftSidebar: {
    width: '240px',
    collapsedWidth: '72px',    // Icon-only mode
    minWidth: '200px',
    maxWidth: '300px',
  },
  
  rightSidebar: {
    width: '360px',            // AI Chat panel
    collapsedWidth: '0px',     // Fully hidden when collapsed
    minWidth: '320px',
    maxWidth: '480px',
  },
  
  // Main Content
  mainContent: {
    maxWidth: '1440px',        // Maximum content width
    padding: '24px',           // Content padding
    gapFromSidebar: '0px',     // Flush with sidebars
  },
  
  // Container Widths
  containers: {
    narrow: '768px',           // For focused content (forms, articles)
    standard: '1024px',        // For most content
    wide: '1280px',            // For data-heavy views
    full: '100%',              // For maps, full-width content
  },
  
  // Grid System
  grid: {
    columns: 12,
    gutter: '24px',
    margin: '24px',
  },
};
```

### CSS Grid Implementation

```css
/* Main App Shell */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-left-width, 240px) 1fr var(--sidebar-right-width, 360px);
  grid-template-rows: 1fr;
  min-height: 100vh;
  transition: grid-template-columns var(--transition-normal) var(--ease-in-out);
}

/* When left sidebar is collapsed */
.app-shell.left-collapsed {
  --sidebar-left-width: 72px;
}

/* When right sidebar is collapsed */
.app-shell.right-collapsed {
  --sidebar-right-width: 0px;
}

/* Main Content Area */
.main-content {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-gray-50);
}

/* Content Container */
.content-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--spacing-6);
  width: 100%;
}

/* Page Grid */
.page-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-6);
}
```

### Split-View Layout Pattern (Property Search)

The Property Search page uses a specialized split-view layout with **map on the left** and **property list on the right**. This follows Zillow/Airbnb patterns validated by Baymard Institute UX research showing 95% user engagement with side-by-side map+list layouts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPLIT-VIEW LAYOUT (Property Search)                       │
├─────────────┬──────────────────────────────────────────────────────────────┤
│             │  ┌─────────── HORIZONTAL FILTER BAR ─────────────────────┐   │
│             │  │ [🔍 Search] [Beds ▼] [Price ▼] [More Filters ▼] [Sort]│   │
│  LEFT       │  └───────────────────────────────────────────────────────┘   │
│  SIDEBAR    ├────────────────────────────┬─────────────────────────────────┤
│             │                            │                                  │
│  240px      │     INTERACTIVE MAP        │      PROPERTY LIST              │
│  (Nav)      │     (flexible width)       │      (380px - 480px)            │
│             │                            │                                  │
│             │        📍                  │  ┌────────────────────────────┐ │
│             │    📍      📍              │  │  [Property Card 1]         │ │
│             │         📍                 │  │  3bd | 2ba | $285,000      │ │
│             │      📍       📍           │  └────────────────────────────┘ │
│             │              📍            │  ┌────────────────────────────┐ │
│             │        📍                  │  │  [Property Card 2]         │ │
│             │                            │  │  4bd | 3ba | $342,000      │ │
│             │    Map markers sync with   │  └────────────────────────────┘ │
│             │    list on hover/click     │  ┌────────────────────────────┐ │
│             │                            │  │  [Property Card 3]         │ │
│             │                            │  │  2bd | 1ba | $198,000      │ │
│             │                            │  └────────────────────────────┘ │
│             ├────────────────────────────┴─────────────────────────────────┤
│             │        ┌──────────────────────────────────────────────┐      │
│             │        │   💬  Ask AI about properties...    [Expand]  │      │
│             │        └──────────────────────────────────────────────┘      │
│             │                  FLOATING AI CHAT (bottom center)            │
└─────────────┴──────────────────────────────────────────────────────────────┘
```

### Split-View Layout Specifications

```typescript
const splitViewConfig = {
  // Container fills main content area (no right sidebar)
  container: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',  // filter bar, content, AI dialog
    height: '100%',
  },

  // Horizontal Filter Bar
  filterBar: {
    height: '56px',
    padding: '8px 16px',
    background: 'var(--surface-card)',
    borderBottom: '1px solid var(--color-gray-200)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  // Split Content Area
  splitContent: {
    display: 'grid',
    gridTemplateColumns: '1fr minmax(380px, 480px)',  // Map | List
    height: 'calc(100vh - 56px - 80px)',  // minus filter bar and AI dialog
    overflow: 'hidden',
  },

  // Map Panel (Left)
  mapPanel: {
    position: 'relative',
    minWidth: '400px',
    overflow: 'hidden',
  },

  // Property List Panel (Right)
  listPanel: {
    width: 'minmax(380px, 480px)',
    overflowY: 'auto',
    borderLeft: '1px solid var(--color-gray-200)',
    background: 'var(--surface-card)',
    padding: '16px',
  },

  // Floating AI Dialog Area
  aiDialogArea: {
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
  },
};
```

### Split-View CSS Implementation

```css
/* Split-View Layout for Property Search */
.split-view-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  overflow: hidden;
}

/* Horizontal Filter Bar */
.split-view__filter-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  height: 56px;
  padding: 0 var(--spacing-4);
  background: var(--surface-card);
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-bar__search {
  flex: 1;
  max-width: 400px;
}

.filter-bar__filters {
  display: flex;
  gap: var(--spacing-2);
}

.filter-bar__filter-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--surface-card);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-bar__filter-btn:hover {
  border-color: var(--color-gray-400);
  background: var(--color-gray-50);
}

.filter-bar__filter-btn.active {
  border-color: var(--color-brand-500);
  background: var(--color-brand-50);
  color: var(--color-brand-700);
}

/* Split Content Grid */
.split-view__content {
  display: grid;
  grid-template-columns: 1fr minmax(380px, 480px);
  overflow: hidden;
}

/* Map Panel (Left) */
.split-view__map {
  position: relative;
  min-width: 400px;
  background: var(--color-gray-100);
}

.split-view__map .mapboxgl-map {
  width: 100%;
  height: 100%;
}

/* Property List Panel (Right) */
.split-view__list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 1px solid var(--color-gray-200);
  background: var(--surface-card);
}

.split-view__list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-100);
  background: var(--surface-card);
  position: sticky;
  top: 0;
  z-index: 10;
}

.split-view__list-count {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.split-view__list-sort {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.split-view__list-items {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* Floating AI Dialog Area */
.split-view__ai-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-4);
  background: linear-gradient(to top, var(--surface-page), transparent);
  pointer-events: none;
}

.split-view__ai-area > * {
  pointer-events: auto;
}
```

### Map-List Synchronization

```typescript
const mapListSyncBehavior = {
  // When user hovers a property card
  onCardHover: {
    action: 'Highlight corresponding map marker',
    marker: {
      scale: 1.3,
      zIndex: 'bring to front',
      pulseAnimation: true,
    },
  },

  // When user clicks a map marker
  onMarkerClick: {
    action: 'Scroll list to corresponding property card',
    card: {
      scrollBehavior: 'smooth',
      highlightDuration: '2s',
      borderColor: 'var(--color-brand-500)',
    },
  },

  // When user pans/zooms the map
  onMapBoundsChange: {
    action: 'Filter list to show only visible properties',
    behavior: 'debounce 300ms',
    showCount: 'Update header with "X properties in view"',
  },

  // When user applies filters
  onFilterChange: {
    action: 'Update both map markers and list simultaneously',
    animation: 'fade out removed, fade in added',
  },
};
```

---

## 4. Typography System

### Font Stack

**Primary Font: DM Sans**
- Clean, geometric sans-serif
- Excellent readability at all sizes
- Modern without being trendy
- Available on Google Fonts

**Monospace Font: Fira Code / JetBrains Mono**
- For code, data, and numerical displays
- Clear distinction between similar characters

### Type Scale

```typescript
const typography = {
  // Display - For hero sections and major headings
  display: {
    '2xl': { size: '4.5rem', lineHeight: 1.1, weight: 700, tracking: '-0.02em' },  // 72px
    'xl': { size: '3.75rem', lineHeight: 1.1, weight: 700, tracking: '-0.02em' },  // 60px
    'lg': { size: '3rem', lineHeight: 1.1, weight: 700, tracking: '-0.02em' },     // 48px
  },
  
  // Headings - For page and section titles
  heading: {
    'h1': { size: '2.25rem', lineHeight: 1.25, weight: 700, tracking: '-0.01em' }, // 36px
    'h2': { size: '1.875rem', lineHeight: 1.3, weight: 600, tracking: '-0.01em' }, // 30px
    'h3': { size: '1.5rem', lineHeight: 1.35, weight: 600, tracking: '0' },        // 24px
    'h4': { size: '1.25rem', lineHeight: 1.4, weight: 600, tracking: '0' },        // 20px
    'h5': { size: '1.125rem', lineHeight: 1.45, weight: 600, tracking: '0' },      // 18px
    'h6': { size: '1rem', lineHeight: 1.5, weight: 600, tracking: '0' },           // 16px
  },
  
  // Body - For content text
  body: {
    'xl': { size: '1.25rem', lineHeight: 1.6, weight: 400 },   // 20px
    'lg': { size: '1.125rem', lineHeight: 1.6, weight: 400 },  // 18px
    'md': { size: '1rem', lineHeight: 1.6, weight: 400 },      // 16px - Default body
    'sm': { size: '0.875rem', lineHeight: 1.5, weight: 400 },  // 14px
    'xs': { size: '0.75rem', lineHeight: 1.5, weight: 400 },   // 12px
  },
  
  // Labels - For UI elements
  label: {
    'lg': { size: '0.875rem', lineHeight: 1.4, weight: 500, tracking: '0.01em' },
    'md': { size: '0.75rem', lineHeight: 1.4, weight: 500, tracking: '0.02em' },
    'sm': { size: '0.625rem', lineHeight: 1.4, weight: 500, tracking: '0.04em', transform: 'uppercase' },
  },
};
```

### Typography Components

```css
/* Headings */
.h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: -0.01em;
  color: var(--color-gray-900);
}

.h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--color-gray-900);
}

.h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.35;
  color: var(--color-gray-900);
}

/* Body Text */
.body-lg {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

.body-md {
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--color-gray-700);
}

.body-sm {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-gray-600);
}

/* Labels & Captions */
.label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  letter-spacing: 0.01em;
}

.caption {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  letter-spacing: 0.02em;
}

.overline {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-gray-500);
}
```

---

## 5. Color System

### Brand Color Palette (Horizon UI Inspired)

The primary color scheme uses a purple/indigo gradient that conveys innovation, trust, and professionalism in the real estate tech space.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRIMARY BRAND COLORS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Brand Purple Scale (Primary)                                                │
│  ═══════════════════════════                                                 │
│                                                                              │
│  50   ▓▓▓▓▓  #F0EEFF   Background, hover states                             │
│  100  ▓▓▓▓▓  #E0DDFF   Light backgrounds                                    │
│  200  ▓▓▓▓▓  #C4BFFF   Borders, dividers                                    │
│  300  ▓▓▓▓▓  #A59EFF   Icons (secondary)                                    │
│  400  ▓▓▓▓▓  #8579FF   Focus rings                                          │
│  500  ▓▓▓▓▓  #7551FF   Primary buttons, links ← MAIN BRAND COLOR            │
│  600  ▓▓▓▓▓  #422AFB   Hover states ← HORIZON UI BRAND                      │
│  700  ▓▓▓▓▓  #3311DB   Active states                                        │
│  800  ▓▓▓▓▓  #2B0FB3   Text on light backgrounds                            │
│  900  ▓▓▓▓▓  #1B0B6B   Headings, emphasis                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Secondary Blue Scale                                                        │
│  ═══════════════════════                                                     │
│                                                                              │
│  50   ▓▓▓▓▓  #EBF8FF   Backgrounds                                          │
│  100  ▓▓▓▓▓  #D1EEFC   Light backgrounds                                    │
│  200  ▓▓▓▓▓  #A7D8F0   Borders                                              │
│  300  ▓▓▓▓▓  #7CC4E4   Icons                                                │
│  400  ▓▓▓▓▓  #55B4D9   Focus rings                                          │
│  500  ▓▓▓▓▓  #3182CE   Secondary buttons, links                             │
│  600  ▓▓▓▓▓  #2B6CB0   Hover states                                         │
│  700  ▓▓▓▓▓  #2C5282   Active states                                        │
│  800  ▓▓▓▓▓  #2A4365   Text                                                 │
│  900  ▓▓▓▓▓  #1A365D   Headings                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Semantic Colors

```typescript
const semanticColors = {
  // Success - Green (for positive outcomes, completed deals)
  success: {
    50: '#F0FFF4',
    100: '#C6F6D5',
    200: '#9AE6B4',
    300: '#68D391',
    400: '#48BB78',
    500: '#38A169',  // Primary success
    600: '#2F855A',
    700: '#276749',
    800: '#22543D',
    900: '#1C4532',
  },
  
  // Warning - Amber (for attention needed)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Primary warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Error - Red (for errors, urgent issues)
  error: {
    50: '#FFF5F5',
    100: '#FED7D7',
    200: '#FEB2B2',
    300: '#FC8181',
    400: '#F56565',
    500: '#E53E3E',  // Primary error
    600: '#C53030',
    700: '#9B2C2C',
    800: '#822727',
    900: '#63171B',
  },
  
  // Info - Blue (for informational messages)
  info: {
    50: '#EBF8FF',
    100: '#BEE3F8',
    200: '#90CDF4',
    300: '#63B3ED',
    400: '#4299E1',
    500: '#3182CE',  // Primary info
    600: '#2B6CB0',
    700: '#2C5282',
    800: '#2A4365',
    900: '#1A365D',
  },
};
```

### Gradient System

```css
/* Primary Gradients */
.gradient-brand {
  background: linear-gradient(135deg, #7551FF 0%, #422AFB 100%);
}

.gradient-brand-soft {
  background: linear-gradient(135deg, #E0DDFF 0%, #C4BFFF 100%);
}

/* Accent Gradients */
.gradient-purple-blue {
  background: linear-gradient(135deg, #7551FF 0%, #3182CE 100%);
}

.gradient-cool {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Status Gradients (for progress indicators, gauges) */
.gradient-success {
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
}

.gradient-warning {
  background: linear-gradient(135deg, #ECC94B 0%, #D69E2E 100%);
}

.gradient-error {
  background: linear-gradient(135deg, #F56565 0%, #E53E3E 100%);
}

/* Credit Balance Card Gradient (from Horizon UI) */
.gradient-credit-card {
  background: linear-gradient(135deg, #868CFF 0%, #4318FF 100%);
}
```

### Surface Colors

```css
:root {
  /* Light Mode Surfaces */
  --surface-page: #F7FAFC;          /* Page background */
  --surface-card: #FFFFFF;          /* Card background */
  --surface-elevated: #FFFFFF;      /* Modals, dropdowns */
  --surface-overlay: rgba(0, 0, 0, 0.4);  /* Modal backdrop */
  
  /* Sidebar Surfaces */
  --surface-sidebar-left: #FFFFFF;
  --surface-sidebar-right: #FFFFFF;
  
  /* Interactive Surfaces */
  --surface-hover: #F7FAFC;
  --surface-active: #EDF2F7;
  --surface-selected: #F0EEFF;      /* Brand-tinted selection */
}
```

---

## 6. Spacing & Sizing

### Spacing Scale (8px Base)

Using an 8px base unit provides a harmonious visual rhythm:

```typescript
const spacing = {
  // Base unit: 8px
  0: '0px',
  0.5: '4px',    // Micro spacing (icon padding)
  1: '8px',      // Base unit
  1.5: '12px',   // Tight spacing
  2: '16px',     // Default component padding
  2.5: '20px',   // Input padding
  3: '24px',     // Card padding, section gaps
  4: '32px',     // Component gaps
  5: '40px',     // Section spacing
  6: '48px',     // Large section spacing
  8: '64px',     // Page sections
  10: '80px',    // Major sections
  12: '96px',    // Hero spacing
  16: '128px',   // Maximum vertical spacing
};

// Common Use Cases
const spacingUseCases = {
  // Component Internal
  buttonPaddingX: spacing[4],       // 32px
  buttonPaddingY: spacing[2],       // 16px
  inputPadding: spacing[3],         // 24px
  cardPadding: spacing[4],          // 32px
  
  // Component External
  componentGap: spacing[3],         // 24px
  sectionGap: spacing[6],           // 48px
  pageMargin: spacing[4],           // 32px
  
  // Typography
  paragraphSpacing: spacing[2],     // 16px
  headingMarginTop: spacing[5],     // 40px
  headingMarginBottom: spacing[2],  // 16px
};
```

### Sizing System

```css
/* Fixed Sizes */
:root {
  /* Icons */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;
  --icon-2xl: 40px;
  
  /* Avatars */
  --avatar-xs: 24px;
  --avatar-sm: 32px;
  --avatar-md: 40px;
  --avatar-lg: 48px;
  --avatar-xl: 64px;
  --avatar-2xl: 96px;
  
  /* Buttons */
  --button-height-xs: 28px;
  --button-height-sm: 32px;
  --button-height-md: 40px;
  --button-height-lg: 48px;
  --button-height-xl: 56px;
  
  /* Inputs */
  --input-height-sm: 32px;
  --input-height-md: 40px;
  --input-height-lg: 48px;
}
```

---

## 7. Component Library

### Component Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PRIMITIVES (Atomic)                                                         │
│  ───────────────────                                                         │
│  Button, Input, Select, Checkbox, Radio, Toggle, Slider, Badge, Avatar,     │
│  Icon, Tooltip, Spinner, Progress, Skeleton                                  │
│                                                                              │
│  COMPOSITES (Molecular)                                                      │
│  ──────────────────────                                                      │
│  Card, Form Field, Search Bar, Dropdown, Menu, Tabs, Modal, Toast,          │
│  Alert, Breadcrumb, Pagination, Table, Data Grid                             │
│                                                                              │
│  PATTERNS (Organism)                                                         │
│  ──────────────────                                                          │
│  Navigation Bar, Sidebar, Header, Footer, Property Card, Deal Card,         │
│  Filter Panel, Map View, Chat Interface, KPI Widget, Pipeline Board          │
│                                                                              │
│  TEMPLATES (Page-Level)                                                      │
│  ─────────────────────                                                       │
│  Dashboard, Property Search, Deal Detail, Buyer Profile, Market Analysis,   │
│  Settings, Authentication, Onboarding                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Button Component

```typescript
interface ButtonProps {
  variant: 'solid' | 'outline' | 'ghost' | 'link';
  colorScheme: 'brand' | 'gray' | 'success' | 'warning' | 'error';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

// Button Specifications
const buttonSpecs = {
  sizes: {
    xs: { height: '28px', fontSize: '12px', paddingX: '12px', iconSize: '14px' },
    sm: { height: '32px', fontSize: '14px', paddingX: '14px', iconSize: '16px' },
    md: { height: '40px', fontSize: '14px', paddingX: '16px', iconSize: '18px' },
    lg: { height: '48px', fontSize: '16px', paddingX: '24px', iconSize: '20px' },
    xl: { height: '56px', fontSize: '18px', paddingX: '32px', iconSize: '24px' },
  },
  
  variants: {
    solid: {
      brand: {
        default: { bg: 'brand.500', color: 'white' },
        hover: { bg: 'brand.600' },
        active: { bg: 'brand.700' },
        disabled: { bg: 'brand.200', color: 'brand.400' },
      },
    },
    outline: {
      brand: {
        default: { bg: 'transparent', border: 'brand.500', color: 'brand.500' },
        hover: { bg: 'brand.50' },
        active: { bg: 'brand.100' },
      },
    },
    ghost: {
      brand: {
        default: { bg: 'transparent', color: 'brand.500' },
        hover: { bg: 'brand.50' },
        active: { bg: 'brand.100' },
      },
    },
  },
  
  borderRadius: '8px',
  fontWeight: 600,
  transition: 'all 150ms ease-in-out',
};
```

```css
/* Button Base Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast) var(--ease-in-out);
  cursor: pointer;
  outline: none;
  border: 2px solid transparent;
}

.btn:focus-visible {
  box-shadow: 0 0 0 3px var(--color-brand-200);
}

/* Primary Button */
.btn-primary {
  background: var(--color-brand-500);
  color: white;
}

.btn-primary:hover {
  background: var(--color-brand-600);
  box-shadow: var(--shadow-brand);
}

.btn-primary:active {
  background: var(--color-brand-700);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  border-color: var(--color-gray-300);
  color: var(--color-gray-700);
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-brand-500);
}

.btn-ghost:hover {
  background: var(--color-brand-50);
}

/* Button Sizes */
.btn-sm { height: 32px; padding: 0 14px; font-size: 14px; }
.btn-md { height: 40px; padding: 0 16px; font-size: 14px; }
.btn-lg { height: 48px; padding: 0 24px; font-size: 16px; }
```

### Card Component

Cards are the primary container for content and follow Horizon UI's styling:

```typescript
interface CardProps {
  variant: 'elevated' | 'outline' | 'filled' | 'unstyled';
  padding: 'none' | 'sm' | 'md' | 'lg';
  isHoverable?: boolean;
  isClickable?: boolean;
}

const cardSpecs = {
  variants: {
    elevated: {
      background: 'white',
      boxShadow: 'var(--shadow-sm)',
      border: 'none',
      hoverShadow: 'var(--shadow-md)',
    },
    outline: {
      background: 'white',
      boxShadow: 'none',
      border: '1px solid var(--color-gray-200)',
    },
    filled: {
      background: 'var(--color-gray-50)',
      boxShadow: 'none',
      border: 'none',
    },
  },
  
  padding: {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px',
  },
  
  borderRadius: '16px',  // Rounded corners like Horizon UI
};
```

```css
/* Card Base */
.card {
  background: var(--surface-card);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
}

/* Elevated Card (Default) */
.card-elevated {
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal) var(--ease-in-out);
}

.card-elevated:hover {
  box-shadow: var(--shadow-md);
}

/* Card Header */
.card-header {
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-3);
  border-bottom: 1px solid var(--color-gray-100);
}

/* Card Body */
.card-body {
  padding: var(--spacing-4);
}

/* Card Footer */
.card-footer {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-100);
}
```

### Input Component

```css
/* Input Base */
.input {
  width: 100%;
  height: var(--input-height-md);
  padding: 0 var(--spacing-3);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  color: var(--color-gray-800);
  background: var(--surface-card);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast) var(--ease-in-out);
}

.input::placeholder {
  color: var(--color-gray-400);
}

.input:hover {
  border-color: var(--color-gray-300);
}

.input:focus {
  outline: none;
  border-color: var(--color-brand-500);
  box-shadow: 0 0 0 3px var(--color-brand-100);
}

.input:disabled {
  background: var(--color-gray-100);
  color: var(--color-gray-400);
  cursor: not-allowed;
}

/* Input with Icon */
.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  pointer-events: none;
}

.input-group .input {
  padding-left: var(--spacing-10);
}
```

### Property Card (Domain-Specific)

```typescript
interface PropertyCardProps {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    estimatedValue: number;
    equity: number;
    ownerName: string;
    thumbnail?: string;
    motivationScore: number;
    tags: string[];
  };
  onSelect?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
}
```

```css
/* Property Card */
.property-card {
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal) var(--ease-in-out);
  cursor: pointer;
}

.property-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.property-card.selected {
  border: 2px solid var(--color-brand-500);
  box-shadow: var(--shadow-brand);
}

/* Property Image */
.property-card__image {
  position: relative;
  aspect-ratio: 16/10;
  background: var(--color-gray-200);
  overflow: hidden;
}

.property-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Motivation Score Badge */
.property-card__score {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-brand-500);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
}

/* Property Content */
.property-card__content {
  padding: var(--spacing-3);
}

.property-card__address {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-1);
}

.property-card__location {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  margin-bottom: var(--spacing-2);
}

/* Property Stats */
.property-card__stats {
  display: flex;
  gap: var(--spacing-3);
  padding-top: var(--spacing-2);
  border-top: 1px solid var(--color-gray-100);
}

.property-card__stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* Property Tags */
.property-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}

.property-tag {
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background: var(--color-brand-50);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-full);
}
```

---

## 8. Navigation System

### Left Sidebar Navigation

The left sidebar follows Horizon UI's structure with collapsible navigation:

```typescript
interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  href: string;
  badge?: string | number;
  children?: NavItem[];
}

const navigationStructure: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    href: '/dashboard',
  },
  {
    id: 'search',
    label: 'Property Search',
    icon: 'search',
    href: '/search',
    badge: 'AI',
  },
  {
    id: 'deals',
    label: 'Deal Pipeline',
    icon: 'pipeline',
    href: '/deals',
    badge: 12,
  },
  {
    id: 'leads',
    label: 'Leads / CRM',
    icon: 'users',
    href: '/leads',
    children: [
      { id: 'all-leads', label: 'All Leads', icon: 'list', href: '/leads' },
      { id: 'hot-leads', label: 'Hot Leads', icon: 'fire', href: '/leads/hot' },
      { id: 'sequences', label: 'Sequences', icon: 'mail', href: '/leads/sequences' },
    ],
  },
  {
    id: 'buyers',
    label: 'Buyer Database',
    icon: 'briefcase',
    href: '/buyers',
  },
  {
    id: 'lists',
    label: 'Lead Lists',
    icon: 'folder',
    href: '/lists',
  },
  {
    id: 'filters',
    label: 'Smart Filters',
    icon: 'filter',
    href: '/filters',
  },
  {
    id: 'market',
    label: 'Market Analysis',
    icon: 'chart',
    href: '/market',
  },
  {
    id: 'map',
    label: 'Heat Map',
    icon: 'map',
    href: '/map',
  },
];

const secondaryNav: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
  { id: 'help', label: 'Help & Support', icon: 'help', href: '/help' },
];
```

### Sidebar CSS

```css
/* Left Sidebar */
.sidebar-left {
  width: 240px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-sidebar-left);
  border-right: 1px solid var(--color-gray-100);
  z-index: var(--z-fixed);
  transition: width var(--transition-normal) var(--ease-in-out);
}

.sidebar-left.collapsed {
  width: 72px;
}

/* Logo Section */
.sidebar-logo {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-100);
}

.sidebar-logo__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.sidebar-logo__text {
  margin-left: var(--spacing-3);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
  transition: opacity var(--transition-fast);
}

.sidebar-left.collapsed .sidebar-logo__text {
  opacity: 0;
  pointer-events: none;
}

/* Navigation List */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-3);
}

.sidebar-nav__section {
  margin-bottom: var(--spacing-4);
}

.sidebar-nav__section-title {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-400);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Nav Item */
.nav-item {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 var(--spacing-3);
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast) var(--ease-in-out);
  cursor: pointer;
  text-decoration: none;
}

.nav-item:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.nav-item.active {
  background: var(--color-brand-50);
  color: var(--color-brand-600);
}

.nav-item.active .nav-item__icon {
  color: var(--color-brand-500);
}

.nav-item__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--color-gray-400);
  transition: color var(--transition-fast);
}

.nav-item__label {
  margin-left: var(--spacing-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item__badge {
  margin-left: auto;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: var(--color-brand-500);
  color: white;
  border-radius: var(--border-radius-full);
}

/* Collapsed State */
.sidebar-left.collapsed .nav-item__label,
.sidebar-left.collapsed .nav-item__badge,
.sidebar-left.collapsed .sidebar-nav__section-title {
  opacity: 0;
  pointer-events: none;
}

.sidebar-left.collapsed .nav-item {
  justify-content: center;
  padding: 0;
}

/* User Profile Section */
.sidebar-user {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-gray-100);
}

.sidebar-user__avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  flex-shrink: 0;
}

.sidebar-user__info {
  margin-left: var(--spacing-3);
  overflow: hidden;
}

.sidebar-user__name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user__role {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}
```

### Breadcrumbs

```css
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

.breadcrumb-item a {
  color: var(--color-gray-500);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.breadcrumb-item a:hover {
  color: var(--color-brand-500);
}

.breadcrumb-item.current {
  color: var(--color-gray-800);
  font-weight: var(--font-weight-medium);
}

.breadcrumb-separator {
  color: var(--color-gray-300);
}
```

---

## 9. AI Chat Interface

The persistent AI chat lives in the right sidebar and follows the user throughout the platform.

### Chat Panel Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          AI CHAT PANEL (360px)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  HEADER                                                                │  │
│  │  ╔═══════════════════════════════════════════════════════════════════╗│  │
│  │  ║  🤖 AI Assistant              [Context: Dashboard]     [−] [×]   ║│  │
│  │  ╚═══════════════════════════════════════════════════════════════════╝│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  CONTEXT BAR (Current page awareness)                                 │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  📍 Viewing: Property at 123 Main St, Tampa FL                  │ │  │
│  │  │     ┌──────────┐ ┌──────────┐ ┌──────────┐                     │ │  │
│  │  │     │ Analyze  │ │ Add Deal │ │ Find Comp│                     │ │  │
│  │  │     └──────────┘ └──────────┘ └──────────┘                     │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  MESSAGE AREA (Scrollable)                                            │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │ USER MESSAGE                                                    │ │  │
│  │  │ ┌───────────────────────────────────────────────────────────┐  │ │  │
│  │  │ │ What's the estimated ARV for this property?               │  │ │  │
│  │  │ └───────────────────────────────────────────────────────────┘  │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │ AI RESPONSE                                                     │ │  │
│  │  │ ┌───────────────────────────────────────────────────────────┐  │ │  │
│  │  │ │ 🤖 Based on my analysis of 6 comparable sales...          │  │ │  │
│  │  │ │                                                           │  │ │  │
│  │  │ │ **Estimated ARV: $285,000 - $305,000**                    │  │ │  │
│  │  │ │                                                           │  │ │  │
│  │  │ │ Key comparables:                                          │  │ │  │
│  │  │ │ • 127 Oak St - $289,000 (0.3 mi)                         │  │ │  │
│  │  │ │ • 456 Pine Ave - $302,000 (0.5 mi)                       │  │ │  │
│  │  │ │                                                           │  │ │  │
│  │  │ │ [View Full Analysis →]                                    │  │ │  │
│  │  │ └───────────────────────────────────────────────────────────┘  │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  INPUT AREA (Fixed bottom)                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  [💬 Ask AI anything about this property...              ] [➤] │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                       │  │
│  │  Quick Actions: [📊 Analyze] [🔍 Search] [📝 Notes] [📞 Contact]     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Chat Panel CSS

```css
/* Right Sidebar - AI Chat Panel */
.sidebar-right {
  width: 360px;
  height: 100vh;
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-sidebar-right);
  border-left: 1px solid var(--color-gray-100);
  z-index: var(--z-fixed);
  transition: transform var(--transition-normal) var(--ease-in-out);
}

.sidebar-right.collapsed {
  transform: translateX(100%);
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-100);
  background: var(--surface-card);
}

.chat-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
}

.chat-header__icon {
  width: 24px;
  height: 24px;
  color: var(--color-brand-500);
}

.chat-header__context {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  padding: 2px 8px;
  background: var(--color-gray-100);
  border-radius: var(--border-radius-full);
}

.chat-header__actions {
  display: flex;
  gap: var(--spacing-1);
}

/* Context Bar */
.chat-context {
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-brand-50);
  border-bottom: 1px solid var(--color-brand-100);
}

.chat-context__current {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-brand-700);
  margin-bottom: var(--spacing-2);
}

.chat-context__actions {
  display: flex;
  gap: var(--spacing-2);
}

.chat-context__action {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-brand-600);
  background: white;
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-context__action:hover {
  background: var(--color-brand-100);
}

/* Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

/* Message Bubbles */
.chat-message {
  max-width: 95%;
  animation: messageIn var(--transition-normal) var(--ease-out);
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message--user {
  align-self: flex-end;
}

.chat-message--ai {
  align-self: flex-start;
}

.chat-message__content {
  padding: var(--spacing-3);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.chat-message--user .chat-message__content {
  background: var(--color-brand-500);
  color: white;
  border-bottom-right-radius: var(--border-radius-sm);
}

.chat-message--ai .chat-message__content {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
  border-bottom-left-radius: var(--border-radius-sm);
}

/* AI Typing Indicator */
.chat-typing {
  display: flex;
  gap: 4px;
  padding: var(--spacing-3);
}

.chat-typing__dot {
  width: 8px;
  height: 8px;
  background: var(--color-gray-400);
  border-radius: var(--border-radius-full);
  animation: typingBounce 1.4s infinite;
}

.chat-typing__dot:nth-child(2) { animation-delay: 0.2s; }
.chat-typing__dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

/* Input Area */
.chat-input-area {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-gray-100);
  background: var(--surface-card);
}

.chat-input-wrapper {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-xl);
  transition: all var(--transition-fast);
}

.chat-input-wrapper:focus-within {
  border-color: var(--color-brand-500);
  box-shadow: 0 0 0 3px var(--color-brand-100);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-gray-800);
  outline: none;
  resize: none;
}

.chat-send-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-500);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-send-btn:hover {
  background: var(--color-brand-600);
}

.chat-send-btn:disabled {
  background: var(--color-gray-300);
  cursor: not-allowed;
}

/* Quick Actions */
.chat-quick-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.chat-quick-action {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  background: transparent;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chat-quick-action:hover {
  background: var(--color-gray-100);
  border-color: var(--color-gray-300);
}
```

### Floating AI Chat Dialog (Map-Centric Pages)

For pages where the map is the primary focus (Property Search), the AI chat appears as a **floating dialog** at the bottom center instead of a sidebar. This maximizes map and list real estate while keeping AI accessible.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLOATING AI CHAT DIALOG                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COLLAPSED STATE (Default)                                                   │
│  ═════════════════════════                                                   │
│                                                                              │
│          ┌────────────────────────────────────────────────────┐             │
│          │  ✨  Ask AI about properties...           [Expand] │             │
│          └────────────────────────────────────────────────────┘             │
│                          ▲                                                   │
│                     Bottom center of viewport                                │
│                     Width: 480px (desktop), 90% (mobile)                     │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EXPANDED STATE (On click or keyboard shortcut)                             │
│  ═══════════════════════════════════════════════                             │
│                                                                              │
│          ┌────────────────────────────────────────────────────┐             │
│          │  ╔════════════════════════════════════════════════╗│             │
│          │  ║  ✨ AI Assistant                    [−] [×]    ║│             │
│          │  ╠════════════════════════════════════════════════╣│             │
│          │  ║                                                 ║│             │
│          │  ║  [Message history scrollable area]             ║│             │
│          │  ║                                                 ║│             │
│          │  ║  ┌─────────────────────────────────────────┐   ║│             │
│          │  ║  │ AI: I found 47 properties matching...   │   ║│             │
│          │  ║  └─────────────────────────────────────────┘   ║│             │
│          │  ║                                                 ║│             │
│          │  ╠════════════════════════════════════════════════╣│             │
│          │  ║  [💬 Type your message...              ] [➤]   ║│             │
│          │  ╚════════════════════════════════════════════════╝│             │
│          └────────────────────────────────────────────────────┘             │
│                          ▲                                                   │
│                     Expanded: 600px wide, 400px tall (max 60vh)             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Floating Dialog Specifications

```typescript
const floatingAIDialogConfig = {
  // Positioning
  position: {
    placement: 'bottom-center',
    marginBottom: '24px',
    zIndex: 'var(--z-popover)',  // Above content, below modals
  },

  // Collapsed State (Trigger)
  collapsed: {
    width: '480px',
    height: '48px',
    borderRadius: '24px',  // Pill shape
    background: 'var(--surface-card)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--color-gray-200)',
  },

  // Expanded State (Dialog)
  expanded: {
    width: '600px',
    minHeight: '300px',
    maxHeight: '60vh',
    borderRadius: '16px',
    background: 'var(--surface-card)',
    boxShadow: 'var(--shadow-2xl)',
    animation: 'dialogExpand 200ms var(--ease-out)',
  },

  // Responsive
  mobile: {
    width: '90vw',
    maxWidth: '100%',
    marginBottom: '16px',
  },

  // Keyboard Shortcuts
  shortcuts: {
    toggle: 'Cmd+/',  // Toggle open/close
    focus: 'Cmd+K',   // Focus input
    escape: 'Escape', // Close dialog
  },
};
```

### Floating Dialog CSS

```css
/* Floating AI Dialog Container */
.floating-ai-dialog {
  position: fixed;
  bottom: var(--spacing-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-popover);
  transition: all var(--transition-normal) var(--ease-out);
}

/* Collapsed State (Trigger Button) */
.floating-ai-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 480px;
  height: 48px;
  padding: 0 var(--spacing-4);
  background: var(--surface-card);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-full);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.floating-ai-trigger:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shadow-xl), 0 0 0 3px var(--color-brand-100);
}

.floating-ai-trigger__icon {
  width: 20px;
  height: 20px;
  color: var(--color-brand-500);
}

.floating-ai-trigger__placeholder {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  text-align: left;
}

.floating-ai-trigger__expand {
  font-size: var(--font-size-xs);
  color: var(--color-gray-400);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-md);
}

/* Expanded State (Dialog) */
.floating-ai-content {
  width: 600px;
  max-height: 60vh;
  background: var(--surface-card);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-2xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: dialogExpand var(--transition-normal) var(--ease-out);
}

@keyframes dialogExpand {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Dialog Header */
.floating-ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-100);
}

.floating-ai-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
}

.floating-ai-header__actions {
  display: flex;
  gap: var(--spacing-1);
}

.floating-ai-header__btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--color-gray-500);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.floating-ai-header__btn:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

/* Dialog Messages Area */
.floating-ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
  min-height: 200px;
  max-height: calc(60vh - 120px);
}

/* Dialog Input Area */
.floating-ai-input-area {
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .floating-ai-trigger {
    width: 90vw;
    max-width: 400px;
  }

  .floating-ai-content {
    width: 95vw;
    max-width: 100%;
    max-height: 70vh;
  }

  .floating-ai-dialog {
    bottom: var(--spacing-4);
  }
}
```

### AI Chat Positioning Strategy

The AI chat component adapts its position based on the current page context:

```typescript
type AIPosition = 'sidebar' | 'floating';

const aiPositionByRoute: Record<string, AIPosition> = {
  // Floating dialog for map-centric pages
  '/properties': 'floating',  // Split-view property search
  '/search': 'floating',      // If combined with map

  // Sidebar for all other pages
  '/dashboard': 'sidebar',
  '/deals': 'sidebar',
  '/buyers': 'sidebar',
  '/analytics': 'sidebar',
  '/settings': 'sidebar',
  '/property/:id': 'sidebar', // Property detail pages
};

// AppShell conditionally renders based on route
const useAIPosition = (): AIPosition => {
  const pathname = usePathname();
  return aiPositionByRoute[pathname] || 'sidebar';
};
```

---

## 10. User Flows

### Core User Journeys

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRIMARY USER FLOWS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FLOW 1: PROPERTY DISCOVERY                                                  │
│  ═══════════════════════════                                                 │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  Enter  │───▶│  AI     │───▶│  View   │───▶│  Select │───▶│  Add to │   │
│  │  Query  │    │ Parses  │    │ Results │    │Property │    │  List   │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │                                             │              │        │
│       │     "3 bed homes in Tampa,                  │              │        │
│       │      tired landlords, 50%+ equity"          │              │        │
│       │                                             ▼              ▼        │
│       │                                        ┌─────────┐    ┌─────────┐   │
│       │                                        │  Deep   │    │ Skip    │   │
│       │                                        │Analysis │    │ Trace   │   │
│       │                                        └─────────┘    └─────────┘   │
│       │                                                                      │
│       └─────────────────────────────────────────────────────────────────────│
│         Alternative: Traditional filters (progressive disclosure)            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FLOW 2: DEAL ANALYSIS                                                       │
│  ═════════════════════                                                       │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  View   │───▶│ Request │───▶│  AI     │───▶│  Review │───▶│ Create  │   │
│  │Property │    │Analysis │    │Generates│    │ Numbers │    │  Deal   │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│                      │                              │              │        │
│                      │                              ▼              ▼        │
│                      │                         ┌─────────┐    ┌─────────┐   │
│                      │                         │  Adjust │    │   Add   │   │
│                      │                         │  Comps  │    │   to    │   │
│                      │                         │  (ARV)  │    │Pipeline │   │
│                      │                         └─────────┘    └─────────┘   │
│                      │                                                       │
│                      └──────── Ask AI: "What's the max offer for 20% profit?"│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FLOW 3: LEAD OUTREACH (CRM)                                                │
│  ═══════════════════════════                                                │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │ Select  │───▶│  Skip   │───▶│ Generate│───▶│ Review  │───▶│  Send   │   │
│  │  Leads  │    │ Trace   │    │ Outreach│    │  Draft  │    │Campaign │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│       │              │              │              │              │         │
│       │              │              │              │              ▼         │
│       │              ▼              ▼              │         ┌─────────┐   │
│       │         ┌─────────┐   ┌─────────┐         │         │ Track   │   │
│       │         │ Contact │   │   AI    │         │         │Response │   │
│       │         │  Info   │   │Drafts   │         │         │  Rate   │   │
│       │         │Retrieved│   │Messages │         │         └─────────┘   │
│       │         └─────────┘   └─────────┘         │                        │
│       │                                           │                        │
│       └────────────── Batch operations supported ─┘                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FLOW 4: BUYER MATCHING                                                      │
│  ═══════════════════════                                                    │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │
│  │  Deal   │───▶│   AI    │───▶│  View   │───▶│ Contact │───▶│ Assign  │   │
│  │  Ready  │    │ Matches │    │ Buyers  │    │  Buyer  │    │ to Deal │   │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘   │
│                      │              │                              │        │
│                      │              ▼                              ▼        │
│                      │         ┌─────────┐                    ┌─────────┐   │
│                      │         │  Match  │                    │  Track  │   │
│                      │         │  Score  │                    │ Buyer   │   │
│                      │         │ Ranking │                    │Interest │   │
│                      │         └─────────┘                    └─────────┘   │
│                      │                                                       │
│                      └──── "Find buyers who have purchased 3+ similar props  │
│                             in this zip code in the last 6 months"           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Interaction Patterns

```typescript
const interactionPatterns = {
  // Natural Language Primary
  primarySearch: {
    method: 'AI Chat',
    examples: [
      'Find me 3 bed houses in Tampa with equity over 50%',
      'Show properties with absentee owners in 33609',
      'Find tired landlords with properties built before 1980',
    ],
  },
  
  // Progressive Disclosure for Advanced Users
  advancedFilters: {
    method: 'Filter Panel (revealed on demand)',
    trigger: 'Click "Show Filters" or toggle button',
    behavior: 'Panel slides in with traditional filter options',
  },
  
  // Context-Aware AI Actions
  contextualAI: {
    behavior: 'AI sidebar shows relevant actions based on current page',
    examples: {
      propertyDetail: ['Analyze Deal', 'Find Comps', 'Generate Outreach'],
      searchResults: ['Add to List', 'Bulk Skip Trace', 'Export'],
      dealPipeline: ['Update Status', 'Add Notes', 'Find Buyer'],
    },
  },
  
  // Quick Actions
  shortcuts: {
    cmdK: 'Open AI command palette',
    cmdF: 'Focus search (natural language)',
    cmdS: 'Save current view/list',
    escape: 'Close modals/panels',
  },
};
```

---

## 11. Page Templates

### Dashboard Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD                                          │
├────────────┬──────────────────────────────────────────────────┬─────────────┤
│            │                                                   │             │
│  SIDEBAR   │  ┌──────────── HEADER ─────────────────────────┐  │  AI CHAT   │
│  [Nav]     │  │  Dashboard                           ⚙️ 🔔 👤 │  │  PANEL    │
│            │  └─────────────────────────────────────────────┘  │             │
│            │                                                   │  ┌────────┐│
│            │  ┌─────── KPI CARDS ROW ───────────────────────┐  │  │Context ││
│            │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐     │  │  │Property││
│            │  │ │Active    │ │ Leads    │ │ Pipeline │     │  │  │in view ││
│            │  │ │Deals     │ │ Today    │ │ Value    │     │  │  └────────┘│
│            │  │ │  12      │ │   47     │ │ $425K    │     │  │             │
│            │  │ │ +3 🔼    │ │  +12 🔼  │ │ +15% 🔼  │     │  │  Messages  │
│            │  │ └──────────┘ └──────────┘ └──────────┘     │  │             │
│            │  └─────────────────────────────────────────────┘  │             │
│            │                                                   │             │
│            │  ┌──────── MAIN CONTENT GRID ──────────────────┐  │             │
│            │  │                                              │  │             │
│            │  │  ┌─────────────────┐ ┌─────────────────┐    │  │             │
│            │  │  │                 │ │                 │    │  │             │
│            │  │  │  Revenue Chart  │ │ Pipeline Status │    │  │             │
│            │  │  │  (Area Graph)   │ │ (Donut Chart)   │    │  │             │
│            │  │  │                 │ │                 │    │  │             │
│            │  │  └─────────────────┘ └─────────────────┘    │  │             │
│            │  │                                              │  │             │
│            │  │  ┌─────────────────┐ ┌─────────────────┐    │  │  ┌────────┐│
│            │  │  │                 │ │                 │    │  │  │ Input  ││
│            │  │  │  Recent Leads   │ │ Hot Properties  │    │  │  │        ││
│            │  │  │  (Table)        │ │ (Card Grid)     │    │  │  │ Quick  ││
│            │  │  │                 │ │                 │    │  │  │Actions ││
│            │  │  └─────────────────┘ └─────────────────┘    │  │  └────────┘│
│            │  │                                              │  │             │
│            │  └──────────────────────────────────────────────┘  │             │
│            │                                                   │             │
└────────────┴──────────────────────────────────────────────────┴─────────────┘
```

### Property Search Page (v1.1 - Split-View with Floating AI)

**Key Changes in v1.1:**
- Map positioned on LEFT (was right) for primary focus
- Property list on RIGHT (scrollable cards)
- NO right AI sidebar (uses floating dialog instead)
- Horizontal filter bar replaces vertical sidebar filters
- Floating AI chat dialog at bottom center

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROPERTY SEARCH (Split-View Layout)                       │
├─────────────┬───────────────────────────────────────────────────────────────┤
│             │  ┌─────────────── HORIZONTAL FILTER BAR ─────────────────────┐│
│  LEFT NAV   │  │ 🔍 [Tampa, FL       ] [Beds▼] [Price▼] [Equity▼] [+More] ││
│  SIDEBAR    │  │                                          [Sort▼] [127 ✓] ││
│  (240px)    │  └───────────────────────────────────────────────────────────┘│
│             ├────────────────────────────────┬──────────────────────────────┤
│             │                                │                              │
│  Dashboard  │       INTERACTIVE MAP          │      PROPERTY LIST          │
│  Properties │       (flexible width)         │      (380-480px)            │
│  Deals      │                                │                              │
│  Buyers     │                                │  ┌────────────────────────┐ │
│  Analytics  │        📍                      │  │ 🏠 123 Oak Street      │ │
│  ...        │    📍      📍                  │  │ Tampa, FL 33609        │ │
│             │         📍                     │  │ 3bd · 2ba · 1,850 sqft │ │
│             │      📍       📍               │  │ $285,000 · 62% equity  │ │
│             │              📍                │  │ [Hot Lead] [Skip Trace]│ │
│             │        📍                      │  └────────────────────────┘ │
│             │                                │  ┌────────────────────────┐ │
│             │  ┌────────────────────────┐    │  │ 🏠 456 Pine Avenue     │ │
│             │  │ Cluster: 12 properties │    │  │ Tampa, FL 33610        │ │
│             │  └────────────────────────┘    │  │ 4bd · 3ba · 2,200 sqft │ │
│             │                                │  │ $342,000 · 55% equity  │ │
│             │  Map syncs with list:          │  │ [Absentee] [Long Own]  │ │
│             │  • Hover card → highlight pin  │  └────────────────────────┘ │
│             │  • Click pin → scroll to card  │  ┌────────────────────────┐ │
│             │  • Pan/zoom → filter list      │  │ 🏠 789 Maple Drive     │ │
│             │                                │  │ ...                    │ │
│             │                                │  └────────────────────────┘ │
│             │                                │                              │
│             ├────────────────────────────────┴──────────────────────────────┤
│             │                                                               │
│             │        ┌─────────────────────────────────────────────┐        │
│             │        │  ✨ Ask AI about properties...     [Expand] │        │
│             │        └─────────────────────────────────────────────┘        │
│             │                  FLOATING AI DIALOG (bottom center)           │
│             │                                                               │
└─────────────┴───────────────────────────────────────────────────────────────┘
```

**Layout Rationale (Baymard UX Research):**
- 95% of users engage with map in split-view layouts
- Map on LEFT provides primary visual anchor for spatial browsing
- Property list on RIGHT allows natural left-to-right scanning (map → details)
- Floating AI avoids taking real estate from map or list
- Horizontal filters prevent sidebar crowding (Baymard pitfall #2)

**Interaction Behaviors:**
1. **Map-List Sync**: Hovering a property card highlights its map marker with pulse animation
2. **Marker Click**: Clicking a map marker smooth-scrolls the list to that property card
3. **Map Pan/Zoom**: Filtering the list to show only properties visible in current map bounds
4. **Card Actions**: Each card has quick action buttons (Skip Trace, Add to Deal, etc.)
5. **AI Dialog**: Expands upward into a 600x400px dialog for AI conversations

### Property Detail Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROPERTY DETAIL                                      │
├────────────┬──────────────────────────────────────────────────┬─────────────┤
│            │                                                   │             │
│  SIDEBAR   │  ┌─ BREADCRUMBS ───────────────────────────────┐  │  AI CHAT   │
│            │  │  Search > Tampa 33609 > 123 Main Street      │  │             │
│            │  └─────────────────────────────────────────────┘  │  ┌────────┐│
│            │                                                   │  │📍 123  ││
│            │  ┌──────────── PROPERTY HEADER ────────────────┐  │  │Main St ││
│            │  │                                              │  │  └────────┘│
│            │  │  ┌───────────────────┐  123 Main Street      │  │             │
│            │  │  │                   │  Tampa, FL 33609      │  │  Quick:    │
│            │  │  │   [PROPERTY       │                       │  │  [Analyze]│
│            │  │  │    IMAGE]         │  3 🛏️  2 🛁  1,850 sqft│  │  [Add Deal]│
│            │  │  │                   │  Built 1985           │  │  [Skip    ]│
│            │  │  └───────────────────┘                       │  │  [Trace   ]│
│            │  │                                              │  │             │
│            │  │  [📸 Gallery] [🗺️ Map] [📊 Analysis]        │  │             │
│            │  └──────────────────────────────────────────────┘  │             │
│            │                                                   │  ───────────│
│            │  ┌──────── TABS CONTENT ───────────────────────┐  │             │
│            │  │                                              │  │  AI says:  │
│            │  │  [Overview] [Valuation] [Comps] [History]   │  │  "This prop│
│            │  │  ─────────────────────────────────────────   │  │  shows     │
│            │  │                                              │  │  strong    │
│            │  │  ┌─────────────┐ ┌─────────────┐            │  │  motivated │
│            │  │  │ OWNER INFO  │ │ VALUATION   │            │  │  seller    │
│            │  │  │             │ │             │            │  │  signals..." │
│            │  │  │ John Smith  │ │ Est: $285K  │            │  │             │
│            │  │  │ Out of State│ │ Equity: 62% │            │  │             │
│            │  │  │ Owned 15yr  │ │ Rent: $1,850│            │  │  ┌────────┐│
│            │  │  └─────────────┘ └─────────────┘            │  │  │ Input  ││
│            │  │                                              │  │  └────────┘│
│            │  │  ┌─────────────────────────────────────────┐ │  │             │
│            │  │  │ MOTIVATION INDICATORS                   │ │  │             │
│            │  │  │ ✅ Absentee Owner   ✅ High Equity      │ │  │             │
│            │  │  │ ✅ Long Ownership   ⬜ Tax Delinquent   │ │  │             │
│            │  │  └─────────────────────────────────────────┘ │  │             │
│            │  │                                              │  │             │
│            │  └──────────────────────────────────────────────┘  │             │
│            │                                                   │             │
└────────────┴──────────────────────────────────────────────────┴─────────────┘
```

---

## 12. Animation & Motion

### Animation Principles

Following Apple's approach to motion design:

```typescript
const motionPrinciples = {
  // 1. Purposeful Motion
  purpose: 'Animations should guide attention, provide feedback, and show relationships',
  
  // 2. Natural Timing
  timing: {
    instant: '0ms',      // Hover states, focus rings
    fast: '150ms',       // Button clicks, toggles
    normal: '250ms',     // Panels, cards, transitions
    slow: '350ms',       // Modals, page transitions
    slower: '500ms',     // Complex animations, loading states
  },
  
  // 3. Easing Functions
  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',        // Enter animations
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',         // Exit animations
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',    // State changes
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy effects
  },
  
  // 4. Reduce Motion Support
  a11y: 'Always respect prefers-reduced-motion media query',
};
```

### Animation Library

```css
/* ═══════════════════════════════════════════════════════════════════
   MICRO-INTERACTIONS
   ═══════════════════════════════════════════════════════════════════ */

/* Button Press Effect */
.btn:active {
  transform: scale(0.98);
}

/* Card Hover Lift */
.card-hoverable {
  transition: transform var(--transition-normal) var(--ease-out),
              box-shadow var(--transition-normal) var(--ease-out);
}

.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Link Underline Animation */
.link-animated {
  position: relative;
}

.link-animated::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-brand-500);
  transition: width var(--transition-normal) var(--ease-out);
}

.link-animated:hover::after {
  width: 100%;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT ANIMATIONS
   ═══════════════════════════════════════════════════════════════════ */

/* Modal Enter */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: modalEnter var(--transition-normal) var(--ease-out) forwards;
}

/* Modal Exit */
@keyframes modalExit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.modal-exit {
  animation: modalExit var(--transition-fast) var(--ease-in) forwards;
}

/* Slide In from Right (Sidebar) */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.slide-in-right {
  animation: slideInRight var(--transition-normal) var(--ease-out) forwards;
}

/* Fade In Up (Page Content) */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp var(--transition-slow) var(--ease-out) forwards;
}

/* Stagger Children */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp var(--transition-slow) var(--ease-out) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }

/* Skeleton Loading */
@keyframes skeleton {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-100) 25%,
    var(--color-gray-200) 50%,
    var(--color-gray-100) 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
  border-radius: var(--border-radius-md);
}

/* Pulse (for loading indicators) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* Spin (for loading spinners) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* ═══════════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 13. Accessibility Standards

### WCAG 2.1 AA Compliance

```typescript
const accessibilityStandards = {
  // Color Contrast Requirements
  contrast: {
    normalText: '4.5:1',    // Minimum for body text
    largeText: '3:1',       // Minimum for 18px+ or 14px+ bold
    uiComponents: '3:1',    // Minimum for interactive elements
  },
  
  // Focus Management
  focus: {
    visible: 'All interactive elements must have visible focus states',
    order: 'Tab order must follow logical reading order',
    trap: 'Modal dialogs must trap focus within',
  },
  
  // Screen Reader Support
  aria: {
    landmarks: 'Use semantic HTML5 with ARIA landmarks',
    labels: 'All interactive elements must have accessible names',
    live: 'Dynamic content changes must be announced',
  },
  
  // Keyboard Navigation
  keyboard: {
    allActions: 'All functionality must be keyboard accessible',
    shortcuts: 'Document all keyboard shortcuts',
    escape: 'Escape key should close modals/popups',
  },
};
```

### Accessibility Implementation

```css
/* Focus Styles */
:focus-visible {
  outline: 3px solid var(--color-brand-400);
  outline-offset: 2px;
}

/* Skip to Content Link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-brand-600);
  color: white;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--border-radius-md);
  z-index: var(--z-tooltip);
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: var(--spacing-2);
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid currentColor;
  }
  
  .card {
    border: 2px solid var(--color-gray-800);
  }
}
```

### ARIA Patterns

```html
<!-- Modal Dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
  <h2 id="modal-title">Add to List</h2>
  <p id="modal-desc">Select a list to add this property to.</p>
  <!-- Content -->
</div>

<!-- Navigation -->
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
    <li><a href="/search">Property Search</a></li>
  </ul>
</nav>

<!-- Live Region for AI Messages -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- AI responses announced here -->
</div>

<!-- Loading State -->
<div role="status" aria-live="polite">
  <span class="sr-only">Loading properties...</span>
  <div class="spinner" aria-hidden="true"></div>
</div>
```

---

## 14. Responsive Design

### Breakpoint System

```typescript
const breakpoints = {
  // Mobile-first breakpoints
  xs: '320px',   // Small phones
  sm: '480px',   // Large phones
  md: '768px',   // Tablets portrait
  lg: '1024px',  // Tablets landscape, small desktops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
  
  // Layout-specific
  sidebarCollapse: '1024px',     // When to collapse left sidebar
  chatPanelCollapse: '1280px',   // When to hide right chat panel
};
```

### Responsive Layout Behavior

```css
/* ═══════════════════════════════════════════════════════════════════
   DESKTOP (1280px+) - Full Three-Column Layout
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 1280px) {
  .app-shell {
    grid-template-columns: 240px 1fr 360px;
  }
  
  .sidebar-left,
  .sidebar-right {
    display: flex;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   LARGE TABLET / SMALL DESKTOP (1024px - 1279px)
   - Right sidebar becomes floating toggle
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 1024px) and (max-width: 1279px) {
  .app-shell {
    grid-template-columns: 240px 1fr;
  }
  
  .sidebar-right {
    position: fixed;
    right: 0;
    top: 0;
    transform: translateX(100%);
    box-shadow: var(--shadow-2xl);
  }
  
  .sidebar-right.open {
    transform: translateX(0);
  }
  
  .chat-toggle-fab {
    display: flex;
    position: fixed;
    bottom: var(--spacing-6);
    right: var(--spacing-6);
    width: 56px;
    height: 56px;
    background: var(--gradient-brand);
    border-radius: var(--border-radius-full);
    box-shadow: var(--shadow-brand);
    z-index: var(--z-fixed);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   TABLET (768px - 1023px) - Collapsed left sidebar
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 768px) and (max-width: 1023px) {
  .app-shell {
    grid-template-columns: 72px 1fr;
  }
  
  .sidebar-left {
    width: 72px;
  }
  
  .sidebar-left .nav-item__label,
  .sidebar-left .sidebar-logo__text,
  .sidebar-left .sidebar-user__info {
    display: none;
  }
  
  .sidebar-right {
    position: fixed;
    transform: translateX(100%);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MOBILE (< 768px) - Bottom navigation
   ═══════════════════════════════════════════════════════════════════ */
@media (max-width: 767px) {
  .app-shell {
    grid-template-columns: 1fr;
    padding-bottom: 64px; /* Space for bottom nav */
  }
  
  .sidebar-left {
    display: none;
  }
  
  .sidebar-right {
    position: fixed;
    width: 100%;
    height: 100%;
    transform: translateY(100%);
  }
  
  .sidebar-right.open {
    transform: translateY(0);
  }
  
  /* Mobile Bottom Navigation */
  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: var(--surface-card);
    border-top: 1px solid var(--color-gray-200);
    z-index: var(--z-fixed);
  }
  
  .mobile-nav__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-1);
    color: var(--color-gray-500);
    font-size: var(--font-size-xs);
  }
  
  .mobile-nav__item.active {
    color: var(--color-brand-500);
  }
}
```

### Split-View Responsive Behavior (Property Search)

The split-view layout (map left, list right) has specific responsive breakpoints:

```css
/* ═══════════════════════════════════════════════════════════════════
   SPLIT-VIEW: DESKTOP (1280px+) - Full side-by-side layout
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 1280px) {
  .split-view__content {
    grid-template-columns: 1fr minmax(380px, 480px);
  }

  .split-view__map {
    min-width: 500px;
  }

  .split-view__list {
    width: 100%;
    max-width: 480px;
  }

  .floating-ai-dialog {
    width: 600px;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SPLIT-VIEW: LARGE TABLET (1024px - 1279px) - Narrower list panel
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 1024px) and (max-width: 1279px) {
  .split-view__content {
    grid-template-columns: 1fr 340px;
  }

  .split-view__list {
    max-width: 340px;
  }

  /* Compact property cards */
  .property-card--split-view {
    padding: var(--spacing-3);
  }

  .property-card__image {
    height: 120px;
  }

  .floating-ai-dialog {
    width: 480px;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SPLIT-VIEW: TABLET (768px - 1023px) - Toggle between map and list
   ═══════════════════════════════════════════════════════════════════ */
@media (min-width: 768px) and (max-width: 1023px) {
  .split-view__content {
    grid-template-columns: 1fr;
    position: relative;
  }

  /* Map takes full width */
  .split-view__map {
    width: 100%;
    height: 100%;
  }

  /* List becomes a slide-over panel from right */
  .split-view__list {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 360px;
    transform: translateX(100%);
    transition: transform var(--transition-normal) var(--ease-out);
    box-shadow: var(--shadow-2xl);
    z-index: 50;
  }

  .split-view__list.open {
    transform: translateX(0);
  }

  /* Toggle button for list panel */
  .split-view__list-toggle {
    display: flex;
    position: absolute;
    right: var(--spacing-4);
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: 48px;
    background: var(--surface-card);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--border-radius-full);
    box-shadow: var(--shadow-lg);
    align-items: center;
    justify-content: center;
    z-index: 40;
  }

  .split-view__list-toggle.list-open {
    right: calc(360px + var(--spacing-4));
  }

  .floating-ai-dialog {
    width: 90vw;
    max-width: 400px;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SPLIT-VIEW: MOBILE (< 768px) - Stacked with tab navigation
   ═══════════════════════════════════════════════════════════════════ */
@media (max-width: 767px) {
  .split-view-layout {
    grid-template-rows: auto auto 1fr auto;
  }

  /* View toggle tabs */
  .split-view__tabs {
    display: flex;
    height: 44px;
    background: var(--surface-card);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .split-view__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-600);
    border-bottom: 2px solid transparent;
    transition: all var(--transition-fast);
  }

  .split-view__tab.active {
    color: var(--color-brand-600);
    border-bottom-color: var(--color-brand-500);
  }

  /* Content area shows one view at a time */
  .split-view__content {
    grid-template-columns: 1fr;
    overflow: hidden;
  }

  .split-view__map,
  .split-view__list {
    width: 100%;
    height: 100%;
  }

  /* Hide inactive view */
  .split-view__map.hidden,
  .split-view__list.hidden {
    display: none;
  }

  /* Filter bar becomes scrollable */
  .split-view__filter-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .split-view__filter-bar::-webkit-scrollbar {
    display: none;
  }

  .filter-bar__filters {
    flex-wrap: nowrap;
    min-width: max-content;
  }

  /* Floating AI dialog - full width */
  .floating-ai-dialog {
    width: calc(100% - var(--spacing-8));
    max-width: none;
    bottom: calc(64px + var(--spacing-4)); /* Above mobile nav */
  }

  .floating-ai-content {
    width: 100%;
    max-height: 50vh;
  }
}
```

### Split-View Mobile Interaction Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOBILE SPLIT-VIEW (< 768px)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  🔍 [Tampa, FL] [Beds▼] [Price▼] [More▼]  ← Horizontal scroll       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │    [🗺️ Map]              [📋 List (47)]                             │    │
│  │    ═══════                                                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                      │    │
│  │                                                                      │    │
│  │                    ACTIVE VIEW (Map or List)                         │    │
│  │                                                                      │    │
│  │                    Swipe left/right to switch                        │    │
│  │                                                                      │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ✨ Ask AI about properties...                            [Expand]  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  [🏠]      [🔍]      [💼]      [📊]      [⚙️]                       │    │
│  │  Home     Search    Deals   Analytics  Settings                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Dark Mode

### Dark Mode Color Tokens

```css
/* Dark Mode Variables */
[data-theme="dark"] {
  /* Surfaces */
  --surface-page: #0B1437;
  --surface-card: #111C44;
  --surface-elevated: #1B254B;
  --surface-overlay: rgba(0, 0, 0, 0.6);
  --surface-sidebar-left: #111C44;
  --surface-sidebar-right: #111C44;
  
  /* Text */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A3AED0;
  --color-text-muted: #707EAE;
  
  /* Borders */
  --color-border: #2D3A5F;
  --color-border-light: #1B254B;
  
  /* Gray Scale (Inverted) */
  --color-gray-50: #1B254B;
  --color-gray-100: #2D3A5F;
  --color-gray-200: #3D4F7A;
  --color-gray-300: #5C6F9B;
  --color-gray-400: #707EAE;
  --color-gray-500: #A3AED0;
  --color-gray-600: #CBD5E0;
  --color-gray-700: #E2E8F0;
  --color-gray-800: #F7FAFC;
  --color-gray-900: #FFFFFF;
  
  /* Brand Colors (Slightly Adjusted for Dark) */
  --color-brand-50: #1B254B;
  --color-brand-100: #2D3A6F;
  --color-brand-500: #7551FF;
  --color-brand-600: #8B6DFF;
  
  /* Shadows (Dark Mode) */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-brand: 0 4px 14px rgba(117, 81, 255, 0.3);
}
```

### Dark Mode Implementation

```typescript
// Theme Toggle Hook
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  
  return { theme, toggle };
};
```

---

## 16. Iconography

### Icon System

We use Lucide Icons (open source, React-friendly) as the primary icon library.

```typescript
const iconUsage = {
  // Navigation Icons
  navigation: {
    home: 'Home',
    search: 'Search',
    building: 'Building2',
    users: 'Users',
    folder: 'Folder',
    filter: 'Filter',
    map: 'Map',
    barChart: 'BarChart3',
    settings: 'Settings',
    help: 'HelpCircle',
  },
  
  // Action Icons
  actions: {
    add: 'Plus',
    edit: 'Pencil',
    delete: 'Trash2',
    save: 'Save',
    close: 'X',
    menu: 'Menu',
    more: 'MoreVertical',
    expand: 'ChevronDown',
    collapse: 'ChevronUp',
    external: 'ExternalLink',
  },
  
  // Status Icons
  status: {
    success: 'CheckCircle',
    warning: 'AlertTriangle',
    error: 'XCircle',
    info: 'Info',
    loading: 'Loader2',
  },
  
  // Property Icons
  property: {
    bed: 'Bed',
    bath: 'Bath',
    sqft: 'Square',
    year: 'Calendar',
    owner: 'User',
    phone: 'Phone',
    email: 'Mail',
    location: 'MapPin',
  },
};
```

### Icon Sizing

```css
.icon-xs { width: 12px; height: 12px; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 20px; height: 20px; }
.icon-lg { width: 24px; height: 24px; }
.icon-xl { width: 32px; height: 32px; }
.icon-2xl { width: 40px; height: 40px; }

/* Icon in Button */
.btn .icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Icon Colors */
.icon-primary { color: var(--color-brand-500); }
.icon-secondary { color: var(--color-gray-500); }
.icon-success { color: var(--color-success-500); }
.icon-warning { color: var(--color-warning-500); }
.icon-error { color: var(--color-error-500); }
```

---

## 17. Data Visualization

### Chart Design System

Following Horizon UI's chart aesthetic:

```typescript
const chartTheme = {
  // Color Palette for Charts
  colors: {
    primary: ['#7551FF', '#4318FF', '#868CFF'],
    secondary: ['#3182CE', '#2B6CB0', '#4299E1'],
    categorical: [
      '#7551FF',  // Brand Purple
      '#3182CE',  // Blue
      '#48BB78',  // Green
      '#ECC94B',  // Yellow
      '#F56565',  // Red
      '#9F7AEA',  // Purple Light
      '#38B2AC',  // Teal
    ],
  },
  
  // Grid & Axis
  grid: {
    stroke: 'var(--color-gray-100)',
    strokeDasharray: '3 3',
  },
  
  axis: {
    stroke: 'var(--color-gray-200)',
    tick: {
      fill: 'var(--color-gray-500)',
      fontSize: 12,
    },
    label: {
      fill: 'var(--color-gray-600)',
      fontSize: 12,
      fontWeight: 500,
    },
  },
  
  // Tooltip
  tooltip: {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    padding: '12px',
    fontSize: '14px',
  },
  
  // Legend
  legend: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-gray-600)',
  },
};
```

### Chart Components

```css
/* Chart Card Container */
.chart-card {
  background: var(--surface-card);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}

.chart-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.chart-card__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
}

.chart-card__value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
}

.chart-card__change {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.chart-card__change.positive {
  color: var(--color-success-500);
}

.chart-card__change.negative {
  color: var(--color-error-500);
}

/* KPI Mini Card */
.kpi-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--surface-card);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
}

.kpi-card__icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-brand-50);
  border-radius: var(--border-radius-lg);
}

.kpi-card__icon .icon {
  width: 24px;
  height: 24px;
  color: var(--color-brand-500);
}

.kpi-card__content {
  flex: 1;
}

.kpi-card__value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
}

.kpi-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}
```

---

## 18. Form Design

### Form Layout Patterns

```css
/* Form Container */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

/* Form Section */
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-section__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-gray-200);
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-field__label.required::after {
  content: ' *';
  color: var(--color-error-500);
}

.form-field__hint {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.form-field__error {
  font-size: var(--font-size-xs);
  color: var(--color-error-500);
}

/* Form Row (Horizontal Fields) */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-gray-200);
}
```

### Input States

```css
/* Input Error State */
.input.error {
  border-color: var(--color-error-500);
}

.input.error:focus {
  box-shadow: 0 0 0 3px var(--color-error-100);
}

/* Input Success State */
.input.success {
  border-color: var(--color-success-500);
}

/* Select Component */
.select {
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: var(--spacing-10);
}

/* Checkbox & Radio */
.checkbox,
.radio {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
}

.checkbox__input,
.radio__input {
  width: 20px;
  height: 20px;
  accent-color: var(--color-brand-500);
}

/* Toggle Switch */
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--color-gray-300);
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.toggle.active {
  background: var(--color-brand-500);
}

.toggle__handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--border-radius-full);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.toggle.active .toggle__handle {
  transform: translateX(20px);
}
```

---

## 19. Feedback & States

### Loading States

```css
/* Full Page Loading */
.page-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-4);
}

.page-loader__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-brand-500);
  border-radius: var(--border-radius-full);
  animation: spin 1s linear infinite;
}

.page-loader__text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

/* Skeleton Loaders */
.skeleton-text {
  height: 16px;
  border-radius: var(--border-radius-sm);
}

.skeleton-title {
  height: 24px;
  width: 60%;
  border-radius: var(--border-radius-sm);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
}

.skeleton-card {
  aspect-ratio: 16/10;
  border-radius: var(--border-radius-xl);
}
```

### Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12) var(--spacing-6);
  text-align: center;
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  color: var(--color-gray-300);
  margin-bottom: var(--spacing-4);
}

.empty-state__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-2);
}

.empty-state__description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  max-width: 400px;
  margin-bottom: var(--spacing-4);
}
```

### Toast Notifications

```css
/* Toast Container */
.toast-container {
  position: fixed;
  top: var(--spacing-6);
  right: var(--spacing-6);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* Toast */
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--surface-elevated);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 320px;
  max-width: 480px;
  animation: toastIn var(--transition-normal) var(--ease-out);
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast--success .toast__icon { color: var(--color-success-500); }
.toast--warning .toast__icon { color: var(--color-warning-500); }
.toast--error .toast__icon { color: var(--color-error-500); }
.toast--info .toast__icon { color: var(--color-info-500); }

.toast__content {
  flex: 1;
}

.toast__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-1);
}

.toast__message {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.toast__close {
  color: var(--color-gray-400);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.toast__close:hover {
  color: var(--color-gray-600);
}
```

---

## 20. Implementation Guidelines

### Component Development Checklist

```typescript
const componentChecklist = {
  functionality: [
    '☐ All interactive states work (hover, focus, active, disabled)',
    '☐ Keyboard navigation works correctly',
    '☐ Touch targets are at least 44x44px on mobile',
    '☐ Loading states are implemented',
    '☐ Error states are implemented',
  ],
  
  accessibility: [
    '☐ Semantic HTML is used',
    '☐ ARIA labels are provided where needed',
    '☐ Color contrast meets WCAG AA (4.5:1)',
    '☐ Focus states are visible',
    '☐ Screen reader testing completed',
  ],
  
  responsiveness: [
    '☐ Works on mobile (320px+)',
    '☐ Works on tablet (768px+)',
    '☐ Works on desktop (1280px+)',
    '☐ Reduced motion preference respected',
  ],
  
  performance: [
    '☐ CSS animations use transform/opacity',
    '☐ Images are optimized and lazy loaded',
    '☐ Component renders under 16ms',
  ],
  
  darkMode: [
    '☐ All colors use CSS custom properties',
    '☐ Dark mode tested',
    '☐ No hardcoded colors',
  ],
};
```

### File Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   │
│   ├── layout/                # Layout components
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   ├── MainContent/
│   │   └── ChatPanel/
│   │
│   ├── domain/                # Domain-specific components
│   │   ├── PropertyCard/
│   │   ├── DealCard/
│   │   ├── BuyerCard/
│   │   └── ...
│   │
│   └── patterns/              # Reusable patterns
│       ├── SearchBar/
│       ├── FilterPanel/
│       └── DataTable/
│
├── styles/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── typography.css
│   │   ├── spacing.css
│   │   └── animations.css
│   │
│   ├── base/
│   │   ├── reset.css
│   │   ├── global.css
│   │   └── utilities.css
│   │
│   └── themes/
│       ├── light.css
│       └── dark.css
│
└── hooks/
    ├── useTheme.ts
    ├── useMediaQuery.ts
    └── useReducedMotion.ts
```

### Naming Conventions

```typescript
const namingConventions = {
  // CSS Classes (BEM-inspired)
  css: {
    block: 'property-card',
    element: 'property-card__header',
    modifier: 'property-card--featured',
    state: 'is-active, is-loading, is-disabled',
  },
  
  // CSS Custom Properties
  tokens: {
    color: '--color-{category}-{shade}',      // --color-brand-500
    spacing: '--spacing-{size}',              // --spacing-4
    font: '--font-{property}-{variant}',      // --font-size-lg
    shadow: '--shadow-{size}',                // --shadow-md
  },
  
  // Component Props
  props: {
    variant: 'solid | outline | ghost',
    size: 'xs | sm | md | lg | xl',
    colorScheme: 'brand | gray | success | warning | error',
  },
  
  // File Names
  files: {
    component: 'PascalCase.tsx',              // PropertyCard.tsx
    styles: 'PascalCase.styles.ts',           // PropertyCard.styles.ts
    types: 'PascalCase.types.ts',             // PropertyCard.types.ts
    hooks: 'camelCase.ts',                    // usePropertySearch.ts
    utils: 'camelCase.ts',                    // formatCurrency.ts
  },
};
```

---

## Appendix A: Horizon UI Component Reference

The following Horizon UI components should be referenced or adapted:

| Horizon Component | Our Usage |
|-------------------|-----------|
| Mini Statistics Card | KPI cards on dashboard |
| Revenue Chart (Area) | Pipeline value chart |
| Daily Traffic Bar | Activity metrics |
| Project Status (Donut) | Deal pipeline status |
| Complex Table | Property lists, lead tables |
| NFT Card | Adapt for Property Card |
| Recent Transactions | Recent activity feed |
| Check Table | Lead selection tables |
| Credit Balance Card | User subscription status |

**Resources:**
- Horizon UI Components: https://horizon-ui.com/components
- Horizon UI Documentation: https://horizon-ui.com/documentation
- Horizon UI Figma: https://www.figma.com/community/file/1098131983383434513

---

## Appendix B: Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Set up design tokens (CSS variables)
2. Implement typography system
3. Create base components (Button, Input, Card)
4. Build layout shell (sidebars, main content)

### Phase 2: Navigation & Chat (Week 3-4)
1. Complete left sidebar navigation
2. Implement right sidebar AI chat panel
3. Add responsive behavior
4. Create breadcrumb system

### Phase 3: Domain Components (Week 5-6)
1. Property Card component
2. Search interface
3. Filter panel
4. Map integration layout

### Phase 4: Pages & Flows (Week 7-8)
1. Dashboard page
2. Property search page
3. Property detail page
4. Deal pipeline page

### Phase 5: Polish (Week 9-10)
1. Animation refinement
2. Dark mode completion
3. Accessibility audit
4. Performance optimization

---

**Document End**
*This design system specification is intended to be implementation-ready. All values are definitive and should be used exactly as specified.*
