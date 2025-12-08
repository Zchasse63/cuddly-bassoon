# Fluid Real Estate OS: Design System & Implementation Guide

**Version:** 1.0  
**Target Audience:** Frontend Engineering, UI/UX Design, AI Code Generation Tools  
**Core Philosophy:** "Digital Physicality" — The interface should feel like a fluid, interactive material, not a static database.

---

## 1. Executive Design Philosophy (The "Why")

Before implementing tokens, the system must understand the three laws governing this universe. We are rejecting the standard "SaaS Dashboard" (rigid grids, opaque sidebars) in favor of Alan Dye's "Liquid" principles.

### 1.1 Law of Continuity (No Hard Cuts)

**The Problem:** Traditional dashboards use hard black lines to separate content (Map vs. List vs. Sidebar). This creates cognitive friction.

**The Solution:** We use light, depth, and blur to separate layers. The interface is a continuous surface. When a user opens a panel, it doesn't "pop" into existence; it slides in like a physical drawer, refracting the light of the content behind it.

> **Implementation Rule:** `backdrop-filter: blur()` is preferred over `background-color: solid`.

### 1.2 Law of Context Preservation (The "Glass" Principle)

**The Problem:** In Zillow or PropStream, opening a property detail page blocks the map. The user loses their sense of "where."

**The Solution:** The user must always see the map. Even when deep in analysis, the map remains visible through the translucent borders of the active card. This maintains spatial awareness.

> **Implementation Rule:** Modals are banned. Use Floating Panes and Slide-overs that cover maximum 40-50% of the viewport.

### 1.3 Law of Agentic Presence (Scout is a Co-Pilot, not a Tool)

**The Problem:** Chatbots are usually hidden in a small button in the corner.

**The Solution:** The AI (Scout) occupies a permanent vertical rail. It monitors the user's view and proactively offers tools. It is a "second pair of eyes."

---

## 2. Design Tokens (The Physics)

Copy these tokens into your CSS `:root` or Tailwind configuration. They define the "physics" of the world.

### 2.1 The "Liquid Glass" Material System

We do not use flat colors for containers. We use **Materials**.

| Token Name | Value (Light Mode) | Value (Dark Mode) | Purpose |
|------------|-------------------|-------------------|---------|
| `surface-glass-base` | `rgba(255, 255, 255, 0.65)` | `rgba(28, 28, 30, 0.60)` | Primary panels (Sidebar, Scout Pane). High transparency. |
| `surface-glass-high` | `rgba(255, 255, 255, 0.85)` | `rgba(44, 44, 46, 0.80)` | Active cards, Inputs, Bento Cells. Lower transparency. |
| `glass-blur-md` | `backdrop-filter: blur(20px)` | `backdrop-filter: blur(20px)` | Standard blur for panels. |
| `glass-blur-lg` | `backdrop-filter: blur(40px)` | `backdrop-filter: blur(40px)` | Heavy blur for backgrounds behind modals. |
| `border-highlight` | `rgba(255, 255, 255, 0.4)` | `rgba(255, 255, 255, 0.15)` | Top/Left borders (simulates light source). |
| `border-shadow` | `rgba(0, 0, 0, 0.05)` | `rgba(0, 0, 0, 0.3)` | Bottom/Right borders (simulates depth). |

> **Why this specific stack?** Standard opacity just looks washed out. By combining high blur (20px) with saturation boosting (`saturate(180%)`), we mimic Apple's visionOS "plimsoll" material, which feels premium and legible.

### 2.2 Color Palette: "Trust & Action"

We limit color usage to data points. The interface itself is neutral (glass).

| Purpose | Color | Usage |
|---------|-------|-------|
| **Primary Action** | `#0071E3` (Apple Blue) | Buttons, Selected States |
| **Success (Equity)** | `#34C759` | High Equity, Cash Flow positive |
| **Warning (Distress)** | `#FF9F0A` | Liens, Pre-foreclosure |
| **Danger (Risk)** | `#FF3B30` | Negative Equity, Auction scheduled |
| **Text Primary** | `#1D1D1F` (Light) / `#F5F5F7` (Dark) | Never pure black/white |

### 2.3 Typography & Metrics

- **Font:** Inter or San Francisco
- **Weights:** Regular (400), Medium (500), Semibold (600). No Bold (700) unless for giant KPI numbers.
- **Tabular Numbers:** `font-variant-numeric: tabular-nums`. Crucial for financial data lists so decimals align perfectly.

### 2.4 Radii & Shape

| Element | Value |
|---------|-------|
| Standard Radius | `16px` (Cards, Inputs) |
| Large Radius | `24px` (Floating Panels, Modals) |
| Pill Radius | `999px` (Buttons, Map Markers) |

**Geometry:** Always use Superellipse (Squircle) smoothing if supported by the platform (e.g., `corner-smoothing: 100%` in Figma).

---

## 3. Layout Architecture: The "Tri-Pane" Canvas

This structure replaces the "cramped 4-column layout." It is fluid and mode-aware.

### 3.1 Pane A: The Command Rail (Navigation)

- **Type:** Collapsible Sidebar
- **Dimensions:** Collapsed `64px`, Expanded `240px`
- **Behavior:**
  - Default state is collapsed to maximize map area.
  - **Hover Intent:** Hovering for >300ms expands the rail over the content (`z-index: 50`), blurring the map underneath. It does not push the content.
- **Visuals:** `surface-glass-base`. No visible border on the right; just a shadow.

### 3.2 Pane B: The Stage (Map & List)

- **Dimensions:** `flex-grow` (Takes remaining space)
- **Split View Logic:**
  - Uses `react-resizable-panels`
  - **Drag Handle:** A subtle 4px wide vertical line
  - **Snap Points:** Snaps to `0%` (List Only), `60%` (Split), `100%` (Map Only)

> **Why:** Allows "Driving for Dollars" mode (100% map) and "Cold Call" mode (100% list) without changing pages.

### 3.3 Pane C: The Scout Intelligence Rail (AI)

- **Dimensions:** Fixed width `320px` or `400px`
- **Behavior:**
  - **Pinned:** Pushes content to the left (for heavy research)
  - **Floating:** Overlays content with glass effect (for quick questions)
  - **Hidden:** Slides completely off-screen

---

## 4. Component Deep Dives

### 4.1 The "Smart Marker" (Map Pins)

We replace generic "teardrops" with data-rich Pills.

- **Shape:** Capsule (Squircle)
- **States:**
  - **Default:** Shows Price (e.g., "$350k")
  - **Hover:** Scales 1.1x. Background turns to Primary Action color.
  - **Selected:** Turns white with a thick Blue border.
- **Context Logic:**
  - **Equity Mode:** Marker shows "40%" (Equity %). Color scale: Red (0%) to Green (100%).
  - **Status Mode:** Marker shows Icon (e.g., Gavel for Foreclosure).

> **Why:** Wholesalers need to scan equity and price geographically. A simple dot is not enough.

### 4.2 The "Bento" Property Detail View

This is the most critical component. It replaces the "scroll of death" detail page.

- **Container:** A grid container using `surface-glass-high`
- **The Grid Layout (CSS Grid):**
  - **Cell 1 (Hero):** Carousel of images. Street View toggle.
  - **Cell 2 (The Spread):** Most Important. Large green text: Estimated Profit. Formula: `ARV - (Ask + Repairs)`.
  - **Cell 3 (Vitals):** Beds/Baths/SqFt pills.
  - **Cell 4 (Owner):** Owner Name, "Absentee" badge, "Owned 12y" badge.
  - **Cell 5 (Actions):** Giant "Call Owner" and "Skip Trace" buttons.
- **Progressive Disclosure:**
  - Each cell has a small "expand" icon.
  - Clicking "Owner" expands that cell to reveal phone numbers and emails, pushing other cells down via Masonry layout.

> **Why:** Bento grids allow non-linear scanning. Users look at "Profit" first, then "Owner," then "Photos." Linear lists force a specific reading order.

### 4.3 The Property Card (List View)

- **Layout:** Horizontal flex
- **Visuals:**
  - `surface-glass-base`
  - No visible border. Separation is handled by `margin-bottom: 8px`.
- **Content:**
  - **Left:** Thumbnail (Square, 80px)
  - **Middle:** Address (Bold), Subtext: "3bd/2ba • 1,500 sqft"
  - **Right:** Equity % (Badge), MLS Status (Badge)
- **Micro-Interaction:** Hovering the card triggers a "Ping" animation on the corresponding Map Marker (connecting the list to the map).

### 4.4 The "Scout" Interface (AI)

- **Header:** "Scout" branding with a pulsing abstract orb (representing "alive" state)
- **Chat Bubbles:**
  - **User:** Right aligned, Blue bubble
  - **Scout:** Left aligned, Glass bubble
- **GenUI Widgets:**
  - Scout does not just reply with text.
  - **Example:** User asks "Comps?" → Scout returns a React Component (Mini Table of 3 comps) embedded in the chat stream.
  - **Draggable:** User can drag this Mini Table out of the chat and pin it to the Dashboard.

---

## 5. Interaction Design (Motion Physics)

We use **Spring Physics** instead of linear easing for all interactions to simulate weight.

### 5.1 The "Magic Move"

- **Trigger:** Clicking a property in the List
- **Effect:** The thumbnail image in the list lifts up, expands, and moves to become the Hero Image in the Detail View. The text floats to its new position.

> **Why:** It connects the list item to the detail view, confirming they are the same object.

### 5.2 The "Satisfying Save"

- **Trigger:** Clicking the "Heart/Save" icon
- **Effect:**
  1. Scale down to 0.8x (Anticipation)
  2. Scale up to 1.2x (Overshoot)
  3. Emit particle burst (Confetti) in Gold color
  4. Settle at 1.0x

> **Why:** Wholesaling is a grind. Give the user a dopamine reward for finding a lead.

### 5.3 Filter "Pills" (No Sidebars)

- **Location:** Floating horizontally at the top-center of the Map
- **Visual:** Horizontal scroll container. Glass pills.
- **Behavior:** Clicking a filter (e.g., "Price") expands a small glass popover attached to the pill. It does NOT open a sidebar.

---

## 6. Technical Implementation Prompts

Use these prompts when directing the AI coding tool to ensure adherence to the system.

### Prompt for Setup

```
"Initialize a Next.js project using Tailwind CSS. Define a glass utility class that uses
backdrop-filter: blur(20px) saturate(180%), a white background with 65% opacity, and a
1px border of white with 40% opacity. Use 'Inter' font. Set up a CSS grid layout with
a collapsible sidebar on the left, a main canvas in the center, and a fixed AI panel
on the right."
```

### Prompt for Bento Card

```
"Create a 'PropertyBentoCard' component. Use CSS Grid with 3 columns. The first cell
should span 2 columns and 2 rows (Hero Image). The top-right cell should be 'Profit
Calculation' with green text. Use the glass utility for the background. Add a 'layout'
prop from Framer Motion to enable expansion animations when a cell is clicked."
```

### Prompt for Map Markers

```
"Create a Mapbox marker component. It should look like a capsule (pill shape). It takes
a 'price' and 'equity' prop. If equity > 50%, color the border green. On hover, scale
the marker to 1.1 using a spring animation { stiffness: 300, damping: 20 }."
```

