# Feature Design Specifications
## Mapping the Fluid Real Estate OS Design System to Platform Features

---

**Version:** 1.0  
**Created:** December 7, 2025  
**Purpose:** Implementation guide mapping design principles to each feature  
**Companion Documents:**  
- [Fluid Real Estate OS Design System](./Fluid_Real_Estate_OS_Design_System.md) — The source of truth  
- [Design Philosophy Research](./Design_Philosophy_Research.md) — Theoretical foundations

---

## Table of Contents

1. [Platform Architecture Overview](#1-platform-architecture-overview)
2. [Global Design Patterns](#2-global-design-patterns)
3. [Feature Specifications](#3-feature-specifications)
4. [Component Migration Guide](#4-component-migration-guide)
5. [Implementation Phases](#5-implementation-phases)

---

## 1. Platform Architecture Overview

### 1.1 Current Feature Inventory

Based on codebase analysis, the platform contains the following features:

#### Primary Navigation (Main Workflow)

| Route | Feature | Current State | Priority |
|-------|---------|---------------|----------|
| `/properties` | Property Search (Split-View) | Has split-view layout | P1 |
| `/dashboard` | Main Dashboard | Basic implementation | P2 |
| `/deals` | Deals Pipeline (Kanban) | Has KanbanBoard, DealCard components | P1 |
| `/buyers` | Buyer Management | Has profiles with matching | P2 |
| `/analytics` | Analytics Dashboard | Multiple sub-routes (buyers, deals, heatmap, markets, comms, reports) | P2 |

#### Tools (Secondary Features)

| Route | Feature | Current State | Priority |
|-------|---------|---------------|----------|
| `/lists` | Saved Lists | Basic implementation | P3 |
| `/filters` | Saved Filters | Basic implementation | P3 |
| `/documents` | Document Management | Basic implementation | P3 |
| `/team` | Team Management | Basic implementation | P3 |

#### Utility Navigation

| Route | Feature | Current State | Priority |
|-------|---------|---------------|----------|
| `/notifications` | Notifications Center | Basic implementation | P3 |
| `/help` | Help Center | Has sub-routes | P3 |
| `/settings` | Settings | Has 15 sub-routes | P3 |
| `/inbox` | Communications Inbox | Has email/sms handling | P2 |
| `/leads` | Lead Management | Has lead views | P2 |
| `/map` | Full Map View | Standalone map page | P1 |
| `/market` | Market Intelligence | Market data views | P2 |
| `/search` | Search Results | Search page | P2 |

### 1.2 Current Component Architecture

#### Layout Components (`/src/components/layout/`)

| Component | Description | Fluid Transformation |
|-----------|-------------|---------------------|
| `AppShell.tsx` | Three-column CSS Grid layout | → Convert to Liquid Glass Tri-Pane |
| `NavigationSidebar.tsx` | 240px collapsible sidebar | → Convert to Command Rail (60px/240px) |
| `SplitViewLayout.tsx` | Map/List split view | → Add gesture-based mode switching |
| `MobileNav.tsx` | Bottom navigation | → Mobile chat sheet (slide-up) |
| `ResizableSidebar.tsx` | Resizable panels | → Add snap points (0%, 60%, 100%) |

#### AI Components (`/src/components/ai/`)

| Component | Description | Fluid Transformation |
|-----------|-------------|---------------------|
| `EnhancedChatInterface.tsx` | Main chat UI | → Scout persona styling, GenUI widgets |
| `FloatingAIDialog.tsx` | Floating chat | **DEPRECATED** — Use `EnhancedChatInterface` only |
| `AIToolPalette.tsx` | Tool selection | → Pill-style tool chips |
| `ProactiveInsights.tsx` | AI suggestions | → Bento-style insight cards |
| `QuickActions.tsx` | Action buttons | → Spring-animated actions |
| `ToolTransparency.tsx` | AI explanations | → Citation system |
| `EmptyChatState.tsx` | Empty state | → Scout orb animation |

#### Map Components (`/src/components/map/`)

| Component | Description | Fluid Transformation |
|-----------|-------------|---------------------|
| `MapContainer.tsx` | Map wrapper | → Muted Cityscape style |
| `PropertyMarker.tsx` | Map pins | → Smart Marker data pills |
| `PropertyMarkers.tsx` | Marker layer | → Equity-based coloring |
| `HeatMapRenderer.tsx` | Heat overlays | → AI Lens integration |
| `PropertyPopup.tsx` | Pin popups | → Glassmorphic popover |
| `CompVisualizationMap.tsx` | Comp display | → Bidirectional highlighting |

#### Deals Components (`/src/components/deals/`)

| Component | Description | Fluid Transformation |
|-----------|-------------|---------------------|
| `KanbanBoard.tsx` | Pipeline Kanban | → Glass columns, spring drag |
| `DealCard.tsx` | Deal summary | → Bento micro-card |
| `StagePipeline.tsx` | Stage display | → Pill-style stage indicators |
| `ActivityTimeline.tsx` | Activity log | → Animated timeline |
| `SmartDealForm.tsx` | Deal form | → Progressive disclosure |

---

## 2. Global Design Patterns

### 2.1 The Tri-Pane Layout System

All pages share the `AppShell` layout. Apply these transformations:

```
BEFORE (Current):
┌─────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)     │     MAIN CONTENT      │   AI CHAT (360px)       │
│  ─────────────────   │     ─────────────     │   ───────────────       │
│  Solid background    │     Gray background   │   Card-style panel      │
│  Hard border-right   │     Standard cards    │   Hard border-left      │
└─────────────────────────────────────────────────────────────────────────┘

AFTER (Fluid):
┌─────────────────────────────────────────────────────────────────────────┐
│  COMMAND RAIL (60px) │     CANVAS            │   SCOUT PANE (320px)    │
│  ─────────────────   │     ──────────        │   ──────────────        │
│  Glass background    │     Full map/content  │   Liquid Glass overlay  │
│  Hover expands 240px │     Mode-adaptive     │   Floats over content   │
│  Specular highlight  │     Spring animations │   Context-aware         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 The Command Rail Transformation

**Current State:** `NavigationSidebar.tsx` is 240px fixed with collapse to 72px icon mode.

**Fluid Transformation:**

| Property | Current | Fluid |
|----------|---------|-------|
| Default Width | 240px | 60px (icons only) |
| Expanded Width | 240px | 240px (on hover/pin) |
| Expansion Trigger | Click toggle | Hover intent (300ms delay) |
| Expansion Behavior | Layout reflow | Floats over content with blur |
| Background | Solid `var(--sidebar)` | `surface-glass-base` + blur |
| Border | `1px solid var(--border)` | Shadow only, no hard line |
| Animation | `transition` | Spring physics |

### 2.3 Scout AI Panel Patterns

The AI chat panel (`EnhancedChatInterface.tsx`) appears across all pages. Apply these patterns:

#### Scout Visual Identity

| Element | Specification |
|---------|---------------|
| Header | "Scout" with pulsing geometric orb |
| Orb States | Blue = Thinking, Green = Success, Amber = Clarification |
| Chat Bubbles | User = Right/Primary, Scout = Left/Glass |
| GenUI Widgets | Draggable, pinnable mini-components |

#### Context Awareness Points

| Context | Source | Display |
|---------|--------|---------|
| Current Page | `ViewContextProvider` | "You're viewing: Deals Pipeline" |
| Viewport (Map) | Map bounds | "450 properties visible in Little Havana" |
| Selection | Selected items | "3 properties selected" |
| Active Filters | Filter state | Shows filter chips |

### 2.4 Filter Pills (Replacing Sidebar Filters)

All filter UIs should convert from sidebar trees to horizontal pill bars:

```
BEFORE:
┌────────────────────┐
│ FILTERS            │
│ ────────────────   │
│ ▼ Property Type    │
│   ☑ Single Family  │
│   ☐ Multi-Family   │
│   ☐ Condo          │
│ ▼ Bedrooms         │
│   ☐ 1+             │
│   ☑ 2+             │
│   ☐ 3+             │
│ ▼ Price Range      │
│   Min: [       ]   │
│   Max: [       ]   │
└────────────────────┘

AFTER:
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌─────────┐ ┌───────────────┐ ┌────────────────────┐│
│ │ Single-Family│ │ 2+ Beds │ │ $200k - $400k │ │ + More Filters ▾   ││
│ │      ✕       │ │    ✕    │ │       ✕       │ │                    ││
│ └──────────────┘ └─────────┘ └───────────────┘ └────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Horizontal scrollable container
- Each filter is a glass pill with dismiss button
- "More Filters" opens a popover, not a sidebar
- AI can generate filters conversationally

---

## 3. Feature Specifications

### 3.1 Properties / Property Search (`/properties`)

**Current State:** Split-view layout with map and list (`split-view-client.tsx`)

**Layout Mode:** Split Canvas (60% Map / 40% List)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ COMMAND RAIL │               CANVAS                     │ SCOUT PANE   │
│    (60px)    │ ┌─────────────────────────────────────┐  │   (320px)    │
│              │ │ [🔍 Address] [Price ▾] [Beds ▾] [+] │  │              │
│  ╭───╮       │ └─────────────────────────────────────┘  │  "I found    │
│  │ 🏠 │       │ ┌────────────────────┬────────────────┐  │  24 high-    │
│  ├───┤       │ │                    │                │  │  equity      │
│  │ 📊 │       │ │   INTERACTIVE      │  PROPERTY      │  │  properties  │
│  ├───┤       │ │      MAP           │    LIST        │  │  in this     │
│  │ 🤝 │       │ │                    │                │  │  view"       │
│  ├───┤       │ │   [Smart Markers]  │  [Property     │  │              │
│  │ 👥 │       │ │   [AI Lens]        │   Cards]       │  │  ┌────────┐  │
│  ├───┤       │ │   [Heat Overlay]   │  [Infinite     │  │  │Mini    │  │
│  │ 📈 │       │ │                    │   Scroll]      │  │  │List    │  │
│  ╰───╯       │ │                    │                │  │  │Widget  │  │
│              │ └────────────────────┴────────────────┘  │  └────────┘  │
│              │          ◀──── Draggable ────▶           │              │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Component Transformations

| Component | Current | Fluid |
|-----------|---------|-------|
| Map Markers | Standard pins | Smart Markers (capsule pills showing equity %) |
| Property Cards | Standard card | Glass card with hover → map ping |
| Filter Sidebar | Vertical tree | Horizontal pills |
| Split Divider | Basic resize | Gesture-based with snap points |
| Map Style | Default Mapbox | Muted Cityscape (desaturated) |

#### Smart Marker Specifications

```
    ┌──────────────┐
    │   67% ▲      │    ← Equity percentage
    └──────────────┘
         │
    Capsule shape (squircle)
    
Color Scale:
  0-20% equity:  #FF3B30 (Danger Red)
  20-50% equity: #FF9F0A (Warning Amber)  
  50%+ equity:   #34C759 (Success Green)
  
States:
  Default:  Solid fill
  Hovered:  Scale 1.1x, elevated shadow
  Selected: White fill, primary border
  Visited:  Outlined (not filled)
```

#### Bidirectional Sync Behavior

| User Action | Response |
|-------------|----------|
| Hover property card | "Ping" animation on map marker (ripple effect) |
| Click map marker | List scrolls to card, card highlights with glass tint |
| Pan/zoom map | List filters to visible properties only |
| Apply filter | Both map and list update with spring animation |

---

### 3.2 Property Detail (`/properties/[id]`)

**Current State:** Standard detail page  
**Fluid Transformation:** Bento Grid layout (replaces scroll-of-death)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌──────────────────────────────────┐  ┌──────────────────────────┐ │
│  │                                  │  │      THE SPREAD          │ │
│  │         HERO IMAGE               │  │                          │ │
│  │          CAROUSEL                │  │    ARV     $450,000      │ │
│  │                                  │  │  - Offer   $300,000      │ │
│  │     [◀]   📷   [▶]               │  │  ─────────────────       │ │
│  │     [Street View Toggle]         │  │  = Gross   $150,000      │ │
│  │                                  │  │          (Green, XL)     │ │
│  ├──────────────────────────────────┤  ├──────────────────────────┤ │
│  │ 🛏️ 3  │ 🛁 2  │ 📐 1,800 sqft    │  │  👤 OWNER INFO  [▾]      │ │
│  │         VITALS STRIP             │  │  John Smith              │ │
│  ├──────────────────────────────────┤  │  ┌────────────────────┐  │ │
│  │                                  │  │  │ "Absentee" badge   │  │ │
│  │   ┌─────────┐   ┌─────────────┐  │  │  │ "Owned 12 years"   │  │ │
│  │   │ COMPS   │   │ TAX HISTORY │  │  │  └────────────────────┘  │ │
│  │   └─────────┘   └─────────────┘  │  ├──────────────────────────┤ │
│  │                                  │  │  ┌────────────────────┐  │ │
│  │   (Tabbed content - expandable)  │  │  │  📞 CALL OWNER     │  │ │
│  │                                  │  │  ├────────────────────┤  │ │
│  │                                  │  │  │  🔍 SKIP TRACE     │  │ │
│  │                                  │  │  ├────────────────────┤  │ │
│  │                                  │  │  │  📝 MAKE OFFER     │  │ │
│  │                                  │  │  └────────────────────┘  │ │
│  └──────────────────────────────────┴──┴──────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                    Bento Card (Liquid Glass Material)
```

#### Progressive Disclosure

| Initial View | Expanded (On Click) |
|--------------|---------------------|
| Owner Name, Tenure | Phone numbers, emails, mailing address |
| "3 Comps Available" | Full CMA table with map overlay |
| "Tax History" label | Year-by-year tax breakdown |
| Equity percentage | Full mortgage details, lien info |

#### Scout Integration

Scout monitors the property and proactively offers:
- "This property has a $5,000 tax lien. I've adjusted your MAO."
- "Based on 4 recent comps, I estimate ARV at $450k (±5%)"
- "The owner has lived here 12 years—considering life events."

---

### 3.3 Deals Pipeline (`/deals`)

**Current State:** Has `KanbanBoard.tsx`, `DealCard.tsx`, `StagePipeline.tsx`  
**Fluid Transformation:** Glass Kanban with spring drag physics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ COMMAND RAIL │               KANBAN CANVAS                │ SCOUT PANE │
│              │ ┌────────────────────────────────────────┐ │            │
│              │ │ Pipeline Value: $2.4M │ 12 Active Deals│ │ "3 deals  │
│              │ └────────────────────────────────────────┘ │  stalled   │
│              │ ┌──────────┐ ┌──────────┐ ┌──────────┐     │  in        │
│              │ │NEW LEADS │ │CONTACTED │ │OFFER SENT│...  │  'Offer   │
│              │ │ (6)      │ │ (3)      │ │ (2)      │     │  Sent'"   │
│              │ ├──────────┤ ├──────────┤ ├──────────┤     │            │
│              │ │┌────────┐│ │┌────────┐│ │┌────────┐│     │ Suggested: │
│              │ ││Deal 1  ││ ││Deal 4  ││ ││Deal 7  ││     │ "Follow up │
│              │ ││$45k    ││ ││$62k    ││ ││$38k    ││     │  on 123    │
│              │ │└────────┘│ │└────────┘│ │└────────┘│     │  Main St"  │
│              │ │┌────────┐│ │┌────────┐│ │          │     │            │
│              │ ││Deal 2  ││ ││Deal 5  ││ │          │     │            │
│              │ │└────────┘│ │└────────┘│ │          │     │            │
│              │ └──────────┘ └──────────┘ └──────────┘     │            │
│              │   Glass Columns with Spring Drag           │            │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Kanban Column Styling

| Element | Specification |
|---------|---------------|
| Column Background | `surface-glass-base` with subtle blur |
| Column Header | Stage name + count badge |
| Drop Zone | Glows primary color on drag over |
| Card | Glass card with spring hover |

#### Deal Card Micro-Interactions

| Interaction | Animation |
|-------------|-----------|
| Drag Start | Card lifts (scale 1.02, shadow increase) |
| Drag Over Column | Column glows, destination preview |
| Drop | Spring settle with overshoot |
| Stage Change | Card "flies" to new column |
| Success | Confetti micro-burst |

---

### 3.4 Buyers (`/buyers`)

**Layout Mode:** Split View (Buyer List / Buyer Detail)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ COMMAND RAIL │  BUYER LIST        │  BUYER DETAIL        │ SCOUT PANE │
│              │ ┌────────────────┐ │ ┌────────────────────┐│            │
│              │ │ 🔍 Search      │ │ │ John Smith         ││ "3 matches │
│              │ └────────────────┘ │ │ Cash Buyer         ││  for this  │
│              │ ┌────────────────┐ │ │                    ││  buyer"    │
│              │ │ John Smith ▶   │ │ │ PREFERENCES        ││            │
│              │ │ Cash | $300k   │ │ │ ────────────       ││ ┌────────┐ │
│              │ ├────────────────┤ │ │ • Single Family    ││ │Match   │ │
│              │ │ Jane Doe       │ │ │ • 3+ beds          ││ │Widget  │ │
│              │ │ Financed       │ │ │ • Miami-Dade       ││ └────────┘ │
│              │ ├────────────────┤ │ │                    ││            │
│              │ │ Bob Wilson     │ │ │ TRANSACTION HISTORY││            │
│              │ │ Cash | $500k   │ │ │ ────────────────   ││            │
│              │ └────────────────┘ │ │ • 12 purchases     ││            │
│              │                    │ │ • Avg: $285k       ││            │
│              │                    │ └────────────────────┘│            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Analytics (`/analytics`)

**Layout Mode:** Bento Grid Dashboard

**Sub-Routes:**
- `/analytics` - Overview
- `/analytics/buyers` - Buyer analytics
- `/analytics/communications` - Communication metrics
- `/analytics/deals` - Deal performance
- `/analytics/heatmap` - Geographic heat maps
- `/analytics/markets` - Market trends
- `/analytics/reports` - Custom reports

```
┌─────────────────────────────────────────────────────────────────────────┐
│ COMMAND RAIL │               BENTO DASHBOARD               │ SCOUT     │
│              │ ┌──────────────────┬───────────────────────┐│ "Your     │
│              │ │ DEALS THIS MONTH │   PIPELINE VALUE      ││ close     │
│              │ │      12          │     $2.4M             ││ rate is   │
│              │ │   ▲ +3 vs last   │   ▲ +$400k            ││ 15% above │
│              │ ├──────────────────┼───────────────────────┤│ average"  │
│              │ │                  │                       ││            │
│              │ │   DEAL VELOCITY  │  TERRITORY HEAT MAP   ││            │
│              │ │    [Chart]       │     [Mini Map]        ││            │
│              │ │                  │                       ││            │
│              │ ├──────────────────┴───────────────────────┤│            │
│              │ │                                          ││            │
│              │ │           TOP PERFORMING MARKETS          ││            │
│              │ │        [Ranked List with Sparklines]      ││            │
│              │ │                                          ││            │
│              │ └──────────────────────────────────────────┘│            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3.6 Inbox / Communications (`/inbox`)

**Layout Mode:** Three-Column (Threads / Conversation / Scout)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RAIL │  THREAD LIST      │     CONVERSATION       │ SCOUT (LIVE ASSIST)│
│      │ ┌────────────────┐│ ┌──────────────────────┐│ ┌────────────────┐ │
│      │ │ John S. (SMS)  ││ │ You: "Hi John..."    ││ │  SENTIMENT     │ │
│      │ │ "Interested.." ◀│ │ John: "Yes, I'm..."  ││ │    🟢          │ │
│      │ ├────────────────┤│ │ You: "Great! When.."││ │  (Positive)    │ │
│      │ │ Jane D. (Email)││ │ John: "This is a    ││ │                │ │
│      │ │ "RE: Property" ││ │        probate..."  ◀│ │ ┌────────────┐ │ │
│      │ ├────────────────┤│ └──────────────────────┘│ │ SUGGESTED   │ │ │
│      │ │ Bob W. (Call)  ││ ┌──────────────────────┐│ │ RESPONSE    │ │ │
│      │ │ Missed 2:30pm  ││ │ [Type message...]    ││ │ "I understand│ │ │
│      │ └────────────────┘│ └──────────────────────┘│ │ probate..."  │ │ │
│      │                   │                         │ └────────────┘ │ │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Live Assist Features

| Feature | Specification |
|---------|---------------|
| Sentiment Aura | Green/Yellow/Red glow around contact avatar |
| Real-time Transcript | Scrolling text during calls |
| Objection Detection | Keyword triggers (probate, not interested, too low) |
| Suggested Responses | Pre-written empathetic handlers |

---

## 4. Component Migration Guide

### 4.1 Priority 1 Components (Foundation)

| Component | File | Transformation | Effort |
|-----------|------|----------------|--------|
| AppShell | `layout/AppShell.tsx` | Liquid Glass materials, spring animations | 2 days |
| NavigationSidebar | `layout/NavigationSidebar.tsx` | Command Rail behavior | 2 days |
| PropertyMarker | `map/PropertyMarker.tsx` | Smart Marker capsule pills | 1 day |
| Card | `ui/card.tsx` | Glass material, squircle radius | 0.5 days |
| Button | `ui/button.tsx` | Spring hover, squircle | 0.5 days |

### 4.2 Priority 2 Components (Features)

| Component | File | Transformation | Effort |
|-----------|------|----------------|--------|
| KanbanBoard | `deals/KanbanBoard.tsx` | Glass columns, spring drag | 2 days |
| DealCard | `deals/DealCard.tsx` | Bento micro-card | 1 day |
| EnhancedChatInterface | `ai/EnhancedChatInterface.tsx` | Scout persona, GenUI | 3 days |
| PropertyPopup | `map/PropertyPopup.tsx` | Glass popover | 0.5 days |
| FilterBar | (new) | Horizontal pills | 1 day |

### 4.3 Priority 3 Components (Polish)

| Component | File | Transformation | Effort |
|-----------|------|----------------|--------|
| Badge | `ui/badge.tsx` | Pill squircle | 0.5 days |
| Tabs | `ui/tabs.tsx` | Glass pills | 0.5 days |
| Input | `ui/input.tsx` | Specular focus | 0.5 days |
| EmptyChatState | `ai/EmptyChatState.tsx` | Scout orb animation | 1 day |
| ActivityTimeline | `deals/ActivityTimeline.tsx` | Animated timeline | 1 day |

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Establish the visual foundation

- [ ] Create CSS tokens for Liquid Glass materials
- [ ] Implement squircle utility class (`corner-smoothing`)
- [ ] Create spring animation primitives (Framer Motion config)
- [ ] Transform `AppShell.tsx` to floating glass layout
- [ ] Transform `NavigationSidebar.tsx` to Command Rail
- [ ] Update `globals.css` with new token system

**Deliverable:** Core layout matches Fluid design system

### Phase 2: Map Experience (Week 3)

**Goal:** Transform the primary map/search experience

- [ ] Convert `PropertyMarker.tsx` to Smart Markers
- [ ] Implement equity-based color scale
- [ ] Add bidirectional map/list syncing
- [ ] Create horizontal filter pill bar
- [ ] Update split-view gesture controls
- [ ] Apply Muted Cityscape map style

**Deliverable:** Property search matches Discovery mockup

### Phase 3: Scout AI Panel (Week 4)

**Goal:** Transform AI experience to Scout persona

- [ ] Create Scout visual identity (orb, colors)
- [ ] Update `EnhancedChatInterface.tsx` with glass styling
- [ ] Implement context awareness displays
- [ ] Build GenUI widget system
- [ ] Add confidence/transparency decorations
- [ ] Create Live Assist mode for calls

**Deliverable:** AI panel matches Scout Intelligence Rail mockup

### Phase 4: Deal Pipeline (Week 5)

**Goal:** Transform Kanban to glass design

- [ ] Update `KanbanBoard.tsx` with glass columns
- [ ] Add spring drag physics
- [ ] Transform `DealCard.tsx` to Bento micro-cards
- [ ] Implement stage transition animations
- [ ] Add success micro-interactions

**Deliverable:** Deals pipeline matches glass Kanban vision

### Phase 5: Property Detail (Week 6)

**Goal:** Replace scroll-of-death with Bento

- [ ] Create Bento grid layout for property detail
- [ ] Implement progressive disclosure blocks
- [ ] Add Magic Move transition from list
- [ ] Integrate Scout contextual insights
- [ ] Build "Generate Offer" flow animation

**Deliverable:** Property detail matches Deep Dive mockup

### Phase 6: Polish & Refinement (Week 7-8)

**Goal:** System-wide consistency and polish

- [ ] Apply glass materials to all remaining components
- [ ] Add micro-interactions throughout
- [ ] Implement dark mode refinements
- [ ] Conduct accessibility audit
- [ ] Performance optimization
- [ ] Documentation update

**Deliverable:** Complete Fluid Real Estate OS experience

---

## Appendix: Token Quick Reference

### Glass Materials

```css
--surface-glass-base: rgba(255, 255, 255, 0.65); /* panels */
--surface-glass-high: rgba(255, 255, 255, 0.85); /* cards */
--glass-blur-md: blur(20px) saturate(180%);
--glass-blur-lg: blur(40px) saturate(180%);
```

### Equity Color Scale

```css
--equity-low: #FF3B30;    /* 0-20% */
--equity-mid: #FF9F0A;    /* 20-50% */
--equity-high: #34C759;   /* 50%+ */
```

### Spring Configurations

```typescript
// Quick, snappy
const buttonSpring = { mass: 0.5, stiffness: 400, damping: 25 };

// Panel transitions
const panelSpring = { mass: 1, stiffness: 300, damping: 30 };

// Celebrations
const successSpring = { mass: 0.8, stiffness: 350, damping: 15 };
```

---

## 6. Additional Feature Specifications

### 6.1 Settings Pages (`/settings/*`)

**Current State:** 15 sub-routes with basic form layouts  
**Fluid Transformation:** Glass panels with horizontal tab navigation

#### Settings Routes

| Route | Content | Fluid Components |
|-------|---------|------------------|
| `/settings/profile` | User profile | Glass form, avatar upload |
| `/settings/billing` | Plan & payment | KPI cards for usage |
| `/settings/team` | Team management | Member cards with roles |
| `/settings/notifications` | Preferences | Toggle rows with spring |
| `/settings/integrations` | Connected apps | Integration cards |
| `/settings/api` | Developer keys | Masked input fields |
| `/settings/scout` | AI preferences | Tone selector, voice options |
| `/settings/appearance` | Theme/density | Visual theme picker |

#### Layout Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│ COMMAND RAIL │                    SETTINGS                              │
│              │ ┌────────────────────────────────────────────────────────┐│
│              │ │ [Profile] [Billing] [Team] [Notifications] [Scout]    ││
│              │ └────────────────────────────────────────────────────────┘│
│              │ ┌────────────────────────────────────────────────────────┐│
│              │ │                                                        ││
│              │ │  ┌───────────────────────────────────────────────────┐││
│              │ │  │ Display Name                                      │││
│              │ │  │ ┌───────────────────────────────────────────────┐ │││
│              │ │  │ │ Zach Smith                              [Edit]│ │││
│              │ │  │ └───────────────────────────────────────────────┘ │││
│              │ │  │ This name appears on offers and communications.   │││
│              │ │  └───────────────────────────────────────────────────┘││
│              │ │                                                        ││
│              │ │  ┌───────────────────────────────────────────────────┐││
│              │ │  │ Email Notifications              [━━━●━━━] ON     │││
│              │ │  │ Receive alerts when Scout finds matching leads    │││
│              │ │  └───────────────────────────────────────────────────┘││
│              │ │                                                        ││
│              │ │  Glass panels with spring-animated toggles            ││
│              │ │  No Scout panel on Settings pages                     ││
│              │ └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Authentication Pages (`/login`, `/signup`, `/forgot-password`)

**Current State:** Basic auth forms  
**Fluid Transformation:** Glass modal on blurred map background

#### Auth Layout

| Element | Specification |
|---------|---------------|
| Background | Blurred property map preview (`glass-blur-lg`) |
| Card | `surface-glass-high`, max-width 400px, centered |
| Border Radius | 24px (large radius) |
| Inputs | Glass base, floating labels on focus |
| Errors | Red left-border, shake animation |
| Social Buttons | Glass outline with icon |

#### Input States

```
DEFAULT:     ┌─────────────────────────────────────┐
             │ Email address                       │
             └─────────────────────────────────────┘

FOCUSED:     Email address
             ┌─────────────────────────────────────┐
             │ user@example.com                    │  ← Blue glow ring
             └─────────────────────────────────────┘

ERROR:       Email address
          ▌  ┌─────────────────────────────────────┐
          ▌  │ invalidemail                        │  ← Red left border
          ▌  └─────────────────────────────────────┘
             Please enter a valid email address
```

---

### 6.3 Onboarding Flow

**Current State:** Has `OnboardingModal.tsx` with step-based wizard  
**Fluid Transformation:** Scout-led progressive onboarding

#### Onboarding Components

| Component | File | Transformation |
|-----------|------|----------------|
| OnboardingModal | `ai/OnboardingModal.tsx` | Glass modal with Scout orb |
| Tooltip | (new) | Floating glass tooltips |
| Progress | (new) | Glass dots indicator |
| Spotlight | (new) | Element highlight overlay |

#### Onboarding Steps

```
STEP 1: Meet Scout
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│    ┌─────────────────────────────────────────────────────────────────┐  │
│    │                                                                  │  │
│    │       [Scout Orb - Animated Pulse]                               │  │
│    │                                                                  │  │
│    │            **Hi! I'm Scout, your AI co-pilot.**                  │  │
│    │                                                                  │  │
│    │   I'll help you find motivated sellers, analyze deals,          │  │
│    │   skip trace owners, draft offers, and close faster.            │  │
│    │                                                                  │  │
│    │       [Let's go →]               [Maybe later]                   │  │
│    │                                                                  │  │
│    │                    ○ ○ ○ ○ (1 of 4)                              │  │
│    │                                                                  │  │
│    └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   Background: glass-blur-lg over map                                     │
│   Modal: surface-glass-high, 500px max-width                            │
└─────────────────────────────────────────────────────────────────────────┘

STEP 2: Search Filter (Contextual Tooltip)
                                     ┌──────────────────────────────────┐
                                     │ 💡 Type a city or ZIP to start  │
                                     │    finding high-equity leads.   │
┌──────────────────────────────────┐ │                                  │
│ 🔍 Search for properties...      │◀│ [Got it!]                        │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

---

### 6.4 System States Components

**Current State:** Has skeleton loaders and empty states  
**Fluid Transformation:** Glass shimmer and Scout-integrated states

#### Loading States

| Current Component | Fluid Enhancement |
|-------------------|-------------------|
| `skeleton-loaders.tsx` | Glass shimmer effect with wave animation |
| `skeleton.tsx` | Inherit glass material tokens |
| `property-detail-skeleton.tsx` | Match Bento grid structure |

#### Empty States

| Current Component | Scout Integration |
|-------------------|-------------------|
| `empty-state.tsx` | Scout suggestion box with glass styling |
| `EmptyChatState.tsx` | Animated Scout orb greeting |
| `PropertiesEmptyState` | "I can find leads nearby" prompt |
| `DealsEmptyState` | "Let's find your first deal" prompt |
| `BuyersEmptyState` | "Import from CSV" suggestion |
| `DocumentsEmptyState` | "Generate offer letter" suggestion |

#### Toast Notifications

| Current Component | Fluid Enhancement |
|-------------------|-------------------|
| `sonner.tsx` | Glass material, spring entry |
| `use-toast.ts` | Scout toast variant with orb icon |

---

### 6.5 Analytics Dashboard (`/analytics/*`)

**Current State:** Multiple analytics sub-routes  
**Fluid Transformation:** Bento grid with glass chart containers

#### Sub-Route Specifications

| Route | Chart Types | Scout Integration |
|-------|-------------|-------------------|
| `/analytics` | KPI cards, line chart | "Your close rate is up 15%" |
| `/analytics/deals` | Funnel, bar chart | "3 deals stalling in Offer stage" |
| `/analytics/buyers` | Pie chart, table | "Top buyer: John Smith (12 purchases)" |
| `/analytics/heatmap` | Geographic heat | "Miami-Dade showing high activity" |
| `/analytics/markets` | Trend lines | "Market cooling in Broward" |
| `/analytics/communications` | Response rate | "SMS has 3x higher response" |
| `/analytics/reports` | Export builder | "Generate weekly summary" |

#### Chart Container Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Deal Velocity                                [📅 This Month ▾]    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │              ○━━━━━━○                                              │ │
│  │        ○━━━━━╯      ╲                                              │ │
│  │  ○━━━━╯              ○        [Chart Content]                      │ │
│  │                                                                    │ │
│  │  ─────────────────────────────────────────────────────────────    │ │
│  │  Jan    Feb    Mar    Apr    May    Jun                           │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ● This Month (12)    ● Last Month (8)    ● Average (10)          │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Material: surface-glass-high                                           │
│  Tooltips: Glass popovers with value + date                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Complete Component Inventory

### 7.1 UI Components (`/src/components/ui/`)

| Component | Current | Fluid Status | Effort |
|-----------|---------|--------------|--------|
| `alert-dialog.tsx` | Standard | → Glass overlay | 1h |
| `alert.tsx` | Standard | → Glass with border accent | 1h |
| `avatar.tsx` | Standard | → Squircle with ring | 0.5h |
| `badge.tsx` | Standard | → Pill squircle | 0.5h |
| `breadcrumbs.tsx` | Standard | → Glass pills | 1h |
| `button.tsx` | Standard | → Spring hover, squircle | 1h |
| `card.tsx` | Standard | → Glass material | 1h |
| `checkbox.tsx` | Standard | → Spring toggle | 0.5h |
| `command-palette.tsx` | Implemented | → Glass styling, spring | 2h |
| `dialog.tsx` | Standard | → Glass modal | 1h |
| `dropdown-menu.tsx` | Standard | → Glass popover | 1h |
| `empty-state.tsx` | Implemented | → Scout integration | 2h |
| `form.tsx` | Standard | → Glass inputs | 1h |
| `input.tsx` | Standard | → Glass, floating label | 1h |
| `kpi-card.tsx` | Implemented | → Glass Bento cell | 1h |
| `popover.tsx` | Standard | → Glass overlay | 1h |
| `progress.tsx` | Standard | → Glass bar | 0.5h |
| `scroll-area.tsx` | Standard | → Subtle glass scrollbar | 0.5h |
| `select.tsx` | Standard | → Glass dropdown | 1h |
| `sheet.tsx` | Standard | → Glass slide-over | 1h |
| `skeleton-loaders.tsx` | Implemented | → Glass shimmer | 2h |
| `skeleton.tsx` | Basic | → Glass base | 0.5h |
| `slider.tsx` | Standard | → Glass track | 0.5h |
| `sonner.tsx` | Toast lib | → Glass toast | 1h |
| `switch.tsx` | Standard | → Spring toggle | 0.5h |
| `table.tsx` | Standard | → Glass rows | 1h |
| `tabs.tsx` | Standard | → Glass pills | 1h |
| `textarea.tsx` | Standard | → Glass input | 0.5h |
| `tooltip.tsx` | Standard | → Glass popover | 0.5h |

**Total UI Component Effort:** ~24 hours (3 days)

### 7.2 Full Implementation Timeline

| Week | Focus | Components | Deliverables |
|------|-------|------------|--------------|
| **1** | Foundation | AppShell, tokens, springs | Core layout system |
| **2** | Navigation | Command Rail, bottom nav, keyboard | Navigation complete |
| **3** | Map | Smart Markers, filter pills, sync | Property search |
| **4** | Scout | Chat interface, GenUI, context | AI panel complete |
| **5** | Deals | Kanban, cards, drag physics | Pipeline complete |
| **6** | Detail | Bento grid, disclosure, Magic Move | Property detail |
| **7** | States | Loading, error, empty, toast | System states |
| **8** | Polish | Auth, onboarding, settings, a11y | Full application |

---

## Cross-References

For detailed specifications on the following topics, see the expanded [Fluid Real Estate OS Design System](./Fluid_Real_Estate_OS_Design_System.md):

| Topic | Design System Section |
|-------|----------------------|
| Loading States (Glass Shimmer) | Section 8.1 |
| Error States (Graceful Recovery) | Section 8.2 |
| Empty States (Guided Action) | Section 8.3 |
| Toast & Notifications | Section 8.4 |
| Keyboard Navigation Map | Section 9.1 |
| Focus Management | Section 9.2 |
| Screen Reader Labels | Section 9.3 |
| Reduced Motion | Section 9.4 |
| Responsive Breakpoints | Section 10.1 |
| Layout Transformations | Section 10.2 |
| Touch Gesture Equivalents | Section 10.3 |
| Mobile Components | Section 10.4 |
| Authentication UI | Section 11 |
| Onboarding Flow | Section 12 |
| Data Visualization | Section 13 |
| Settings Pages | Section 14 |
| Print Styles | Section 15 |
| Implementation Priority Matrix | Section 16 |
| Copy-Paste Tokens | Section 17 |

---

**Document Version:** 2.0  
**Last Updated:** December 7, 2025  
**Author:** Design System Team  
**Status:** Complete Feature Specifications
