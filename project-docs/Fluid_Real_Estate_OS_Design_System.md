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
  - **Pinned (Default):** Always visible, pushes content to the left
  - **Collapsed:** Minimizes to icon strip on right edge (click to expand)
  - **Mobile:** Full-screen sheet (slide-up from bottom)

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

---

## 7. Detailed Mockup Descriptions

These mockups are the **source of truth** for visual implementation. Each describes a complete screen state, including layout geometry, token usage, motion behavior, and AI integration points. Use these as acceptance criteria.

---

### 7.1 The "Discovery" Interface (Map + AI)

The primary workspace. This is where the user spends 80% of their time — scanning the map, filtering leads, and conversing with Scout.

#### Viewport Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────┐                                                         ┌──────────┐│
│  │ 🔍 │                                                         │  SCOUT   ││
│  ├────┤                        ┌─────────┐                      │──────────││
│  │ 📋 │                        │  42%    │                      │ "I found ││
│  ├────┤      ┌─────────┐       └─────────┘    ┌─────────┐       │ 14 props ││
│  │ 📣 │      │  67%    │                      │  28%    │       │ matching ││
│  ├────┤      └─────────┘  ╭─────────────────╮ └─────────┘       │ 'High    ││
│  │ ⚙️ │                   │   🔥 LENS 🔥    │                   │ Equity'" ││
│  │    │                   │   (Heat Map)    │                   │          ││
│  │    │                   ╰─────────────────╯                   │┌────────┐││
│  │    │                                                         ││Mini-   │││
│  │    │      ┌─────────┐       ┌─────────┐      ┌─────────┐     ││List    │││
│  │    │      │  55%    │       │  38%    │      │  71%    │     ││Widget  │││
│  └────┘      └─────────┘       └─────────┘      └─────────┘     │└────────┘││
│                                                                  └──────────┘│
│         ┌─────────────────────────────────────────────────────┐              │
│         │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │              │
│         │ │ Price <$300k ✕│ │  3+ Beds   ✕ │ │  High Equity │  │              │
│         │ └──────────────┘ └──────────────┘ └──────────────┘  │              │
│         └─────────────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────────────────┘
   Command Rail        The Map Canvas (Mapbox)           Scout Intelligence Rail
      (64px)              (flex-grow: 1)                       (350px)
```

#### Element Specifications

| Element | Token/Value | Notes |
|---------|-------------|-------|
| **Command Rail** | `width: 64px` collapsed, `surface-glass-base` | Icons: SF Symbols or Phosphor, stroke weight 1.5px |
| **Map Layer** | Mapbox Style: Custom "Muted Cityscape" | Desaturated palette: `hsl(220, 10%, 85%)` land, `hsl(210, 30%, 70%)` water |
| **Smart Markers** | `border-radius: 999px`, `padding: 6px 12px` | Color-coded by equity: `#FF3B30` (0-20%), `#FF9F0A` (20-50%), `#34C759` (50%+) |
| **AI Lens** | `border-radius: 50%`, `backdrop-filter: blur(2px)` | Contains `radial-gradient` heat overlay. Draggable. |
| **Scout Panel** | `width: 350px`, `surface-glass-base`, `glass-blur-md` | Floats over map edge (`position: absolute`, `right: 0`) |
| **Filter Pill Bar** | `surface-glass-high`, `border-radius: 999px` | Horizontally scrollable. Each pill has `✕` dismiss button. |

#### AI Behavior: The "Lens"

The Lens is a **spatial AI query tool**. When the user asks Scout a geographic question (e.g., "Show me cash-buyer activity"), Scout manifests a draggable circular overlay.

- **Visual:** A 200px diameter circle with a subtle glass distortion effect (`backdrop-filter: blur(2px) saturate(120%)`).
- **Inside the Lens:** A `radial-gradient` heat map renders based on the AI's analysis. Hot spots glow `#FF9F0A`.
- **Interaction:** User can drag the Lens to different neighborhoods. Scout re-calculates on `dragend`.

> **Implementation Hint:** Use `<canvas>` overlay for heat map rendering. Sync position with a Mapbox `Marker` for smooth panning.

#### Scout GenUI: The "Mini-List" Widget

When Scout finds matching properties, it doesn't just say "I found 14 properties." It renders an **actionable widget** inline.

```
┌─────────────────────────────────────┐
│  ☐ 123 Maple St — 67% Equity       │
│  ☐ 456 Oak Ave — 55% Equity        │
│  ☐ 789 Pine Rd — 42% Equity        │
│  ─────────────────────────────────  │
│  [ Select All ]    [ Add to List ▸ ]│
└─────────────────────────────────────┘
```

- **Tokens:** `surface-glass-high`, `border-radius: 16px`
- **Buttons:** Primary Action style (`#0071E3`)
- **Micro-interaction:** Checkboxes animate with spring physics on toggle.

---

### 7.2 The "Deep Dive" (Bento Detail View)

Triggered when the user clicks a Smart Marker. The entire interface morphs to focus on a single property while **preserving map context**.

#### The Transition Sequence

This is a **choreographed animation**, not a page change.

| Step | Duration | Action |
|------|----------|--------|
| 1 | 0ms | User clicks marker. Marker receives `selected` state (white fill, blue border). |
| 2 | 0–200ms | Map scales to `0.95` and blurs to `10px`. Scout panel slides right 50px (makes room). |
| 3 | 100–400ms | Bento Card expands from the marker's position using `layout` animation (Framer Motion). |
| 4 | 400ms+ | Card settles. Map remains visible through `surface-glass-base` card background. |

> **Implementation:** Use Framer Motion's `layoutId` to connect the marker thumbnail to the Bento Hero image for a seamless "Magic Move."

#### Bento Grid Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────────────────────────────┐  ┌────────────────────┐  │
│  │                                │  │   THE SPREAD       │  │
│  │                                │  │                    │  │
│  │      HERO IMAGE CAROUSEL       │  │   ARV    $450,000  │  │
│  │         (Street View ↻)        │  │ - Offer  $300,000  │  │
│  │                                │  │ ──────────────────  │  │
│  │                                │  │ = Gross  $150,000  │  │
│  │                                │  │        (Green, XL) │  │
│  ├────────────────────────────────┤  ├────────────────────┤  │
│  │ 🛏 3 bd  │ 🛁 2 ba  │ 📐 1,500 │  │  👤 OWNER INFO     │  │
│  │         VITALS STRIP           │  │  John Smith        │  │
│  ├────────────────────────────────┴──┤  "Absentee" badge  │  │
│  │                                   │  "Owned 12 yrs"    │  │
│  │  ┌─────────┐  ┌──────────────┐   ├────────────────────┤  │
│  │  │  COMPS  │  │  TAX HISTORY │   │  ┌──────────────┐  │  │
│  │  └─────────┘  └──────────────┘   │  │ 📞 CALL OWNER│  │  │
│  │                                   │  ├──────────────┤  │  │
│  │   (Tabbed content area)           │  │ 🔍 SKIP TRACE│  │  │
│  │                                   │  └──────────────┘  │  │
│  └───────────────────────────────────┴────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
              Bento Card (650px width, surface-glass-high)
                      Floats over blurred map
```

#### Cell Specifications

| Cell | Grid Position | Content | Interaction |
|------|---------------|---------|-------------|
| **Hero** | `col 1-2, row 1` | Image carousel + Street View toggle | Swipe horizontal. Pinch to zoom. |
| **The Spread** | `col 3, row 1` | Profit calculation in `#34C759` (Success) | Tap to see formula breakdown. |
| **Vitals** | `col 1-2, row 2` | Bed/Bath/SqFt as capsule badges | Static. |
| **Owner** | `col 3, row 2` | Owner name, tenure, status badges | **Expandable.** Tap to reveal phone/email. |
| **Comps/Tax** | `col 1-2, row 3` | Tabbed interface | Tabs use `underline` active state, not pills. |
| **Actions** | `col 3, row 3` | Primary action buttons | Full-width. Stacked. |

#### AI Contextual Awareness

Scout **monitors** the property you're viewing and proactively offers insights.

```
┌──────────────────────────────────────────────┐
│  🤖 SCOUT                                    │
│  ──────────────────────────────────────────  │
│                                              │
│  ⚠️ I noticed this property has a           │
│  **tax lien of $5,000**.                     │
│                                              │
│  I have deducted this from your suggested   │
│  Maximum Allowable Offer (MAO).              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Original MAO:     $312,000            │  │
│  │  Less Lien:       - $5,000             │  │
│  │  ─────────────────────────────         │  │
│  │  Adjusted MAO:     $307,000            │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [ Accept Adjustment ]   [ Override ▸ ]      │
│                                              │
└──────────────────────────────────────────────┘
```

- **Tokens:** Warning callout uses `#FF9F0A` left border.
- **Buttons:** Primary = Accept. Secondary/Ghost = Override.

#### "Generate Offer" Flow

When the user clicks "Generate Offer" in the Bento card:

1. **Haptic Feedback:** A subtle pulse (mobile) or button depress animation (desktop).
2. **Scout Thinking State:** The Scout panel shows a pulsing orb animation with text: "Drafting contract..."
3. **Document Generation:** A PDF contract is generated using the property data + user's default terms.
4. **Delivery Animation:** A miniature document icon "flies" from Scout into the "Documents" tab in the Bento card (or Command Rail). The Documents tab badge increments (`1` → `2`).
5. **Confirmation:** Scout says: "Contract ready. I've pre-filled the address, offer price, and your standard contingencies."

> **Motion Timing:** The "fly" animation uses `spring({ stiffness: 200, damping: 25 })`. Duration ~500ms. Path follows a Bezier curve.

---

### 7.3 The "Outreach" (CRM + Dialer)

The user shifts from research mode to action mode. This interface supports high-volume cold calling with AI-assisted live coaching.

#### Layout Transformation

The user drags the **vertical split handle** to the left. The map shrinks. The list grows.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────┐  ┌────────────────────────────────────────────────┐  ┌────────────┐ │
│  │ 🔍 │  │                                                │  │  MAP THUMB │ │
│  ├────┤  │  ADDRESS          │ STATUS    │ NEXT TASK     │  │   (150px)  │ │
│  │ 📋 │  │  ────────────────────────────────────────────  │  │            │ │
│  ├────┤  │  123 Maple St     │ 🟢 Hot    │ Call Today    │  └────────────┘ │
│  │ 📣 │  │  456 Oak Ave      │ 🟡 Warm   │ Follow-up Fri │                  │
│  ├────┤  │  789 Pine Rd      │ ⚪ New    │ First Contact │  ┌────────────┐ │
│  │ ⚙️ │  │  321 Elm Blvd ◀── │ 🔵 Active │ ON CALL       │  │   SCOUT    │ │
│  │    │  │  654 Cedar Ln     │ 🔴 Cold   │ Retry in 7d   │  │  ─────────  │ │
│  │    │  │                                                │  │            │ │
│  │    │  │  ─────────────────────────────────────────     │  │  LIVE      │ │
│  │    │  │  [ + Add Lead ]              Showing 5 of 142  │  │  ASSIST    │ │
│  └────┘  └────────────────────────────────────────────────┘  │  MODE      │ │
│                                                               │            │ │
│             THE LIST (flex-grow: 1)                          └────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### List Table Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Row Height** | `64px` | Comfortable for touch and mouse. |
| **Row Background** | `transparent` → `surface-glass-high` on hover | No zebra striping. |
| **Column Visibility** | Only 3 visible by default | "Details" expander reveals full data (Progressive Disclosure). |
| **Status Badges** | Colored dots + Labels | 🟢 Hot, 🟡 Warm, ⚪ New, 🔵 Active (on call), 🔴 Cold |
| **Active Row** | `border-left: 3px solid #0071E3` | The row currently being called. |

#### Live Assist Mode (During Active Call)

When the user initiates a call, the Scout panel transforms into a real-time coaching interface.

```
┌────────────────────────────────────────────────┐
│  📞 LIVE ASSIST                     00:03:42  │
│  ────────────────────────────────────────────  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │              ╭──────────╮                │  │
│  │              │  👤 JS   │                │  │
│  │              │  ╭────╮  │                │  │
│  │              │  │ 🟢 │  │ ← Sentiment    │  │
│  │              │  ╰────╯  │   Aura         │  │
│  │              ╰──────────╯                │  │
│  │           John Smith (Seller)            │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  TRANSCRIPT                                    │
│  ──────────                                    │
│  YOU: "Hi John, I was calling about your      │
│        property on Elm Boulevard..."          │
│                                                │
│  JOHN: "Yeah, I got your letter. Look, this   │
│         is a probate situation and it's       │  ← Keyword detected!
│         complicated..."                        │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  💡 SUGGESTED RESPONSE                   │  │
│  │  ─────────────────────────────────────── │  │
│  │                                          │  │
│  │  "I understand probate is complex.       │  │
│  │   We work with a title company that      │  │
│  │   specializes in clearing these titles   │  │
│  │   at no cost to you."                    │  │
│  │                                          │  │
│  │  [ Copy ]            [ Dismiss ]         │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ──────────────────────────────────────────    │
│  [ 🔇 Mute ]  [ ⏸ Hold ]  [ 🔴 End Call ]     │
└────────────────────────────────────────────────┘
```

#### Live Assist Components

| Component | Behavior | Tokens |
|-----------|----------|--------|
| **Call Timer** | Counts up from 00:00:00. Top-right corner. | `font-variant-numeric: tabular-nums` |
| **Sentiment Aura** | A soft glow around the contact avatar. Animates color based on AI tone analysis. | Green `#34C759` (positive), Yellow `#FF9F0A` (neutral/hesitant), Red `#FF3B30` (tense/objection) |
| **Real-time Transcript** | Scrolling text. Auto-scrolls to bottom. Speaker labels differentiated by color. | YOU = `#0071E3`, THEM = `#1D1D1F` |
| **Suggestion Card** | Appears when Scout detects an objection keyword (e.g., "probate," "not interested," "too low"). | `surface-glass-high`, `border-left: 3px solid #34C759`, springs in with `scale` animation. |
| **Call Controls** | Mute, Hold, End Call. Large touch targets. | End Call = `#FF3B30` background. |

#### Objection Detection & Response Library

Scout maintains a library of common objections and empathetic responses. When a keyword is detected in the transcript, the matching handler appears.

| Trigger Keyword | Handler Title | Suggested Response |
|-----------------|---------------|-------------------|
| "probate" | Probate Objection | "I understand probate is complex. We work with a title company that specializes in clearing these titles at no cost to you." |
| "not interested" | Initial Resistance | "I completely understand. If I could just ask — is the timing not right, or is there something specific about the property situation?" |
| "too low" | Price Objection | "I hear you. Our offer is based on current market comps and repair estimates. Would it help if I walked you through how we arrived at that number?" |
| "need to think" | Stall Tactic | "Of course, it's a big decision. What questions can I answer right now to help you think it through?" |

> **Implementation:** Objection detection uses keyword matching + GPT classification. Responses are pre-written but can be customized per user in Settings.

#### Sentiment Analysis Algorithm

The aura color is determined by real-time speech analysis:

```
Sentiment Score: -1.0 (Hostile) ←──────────────→ +1.0 (Enthusiastic)

        🔴 Red         🟡 Yellow        🟢 Green
       -1.0 — -0.3    -0.3 — +0.3     +0.3 — +1.0

Factors:
  • Speaking pace (faster = stress)
  • Keyword valence ("problem" = negative, "sounds good" = positive)
  • Interruption frequency
  • Silence duration after user speaks (long pause = contemplation)
```

The aura color transitions smoothly using CSS `transition: background-color 1s ease` to avoid jarring flips during natural conversation fluctuation.

---

### 7.4 Implementation Checklist

Use this checklist when building the mockups:

- [ ] **Discovery Interface**
  - [ ] Command Rail with collapse/expand on hover intent (300ms delay)
  - [ ] Custom Mapbox style loaded from style URL
  - [ ] Smart Markers with equity-based color scale
  - [ ] AI Lens overlay with heat map rendering
  - [ ] Scout panel with GenUI widget support
  - [ ] Filter Pill Bar with horizontal scroll

- [ ] **Deep Dive Bento**
  - [ ] "Magic Move" transition from marker to card
  - [ ] Map blur + scale during focus mode
  - [ ] CSS Grid Bento layout with expansion support
  - [ ] Scout contextual awareness integration
  - [ ] "Generate Offer" with document fly animation

- [ ] **Outreach CRM**
  - [ ] Resizable split view with snap points
  - [ ] Data table with progressive disclosure
  - [ ] Live Assist mode with real-time transcript
  - [ ] Sentiment Analysis aura with smooth transitions
  - [ ] Objection Handler card with keyword triggers

---

## 8. System States (Loading, Error, Empty, Notifications)

All system states must embody the Fluid OS philosophy: they are not "error screens" — they are **moments of communication** with the user. Even waiting is an experience.

### 8.1 Loading States: The Glass Shimmer

We reject gray skeleton screens. Loading states use **glass shimmer** to maintain the premium feel.

#### Loading Principles

| Principle | Implementation |
|-----------|---------------|
| Maintain Layout | Skeleton matches exact content dimensions (prevents layout shift) |
| Glass Material | Skeleton uses `surface-glass-base` with animated shimmer |
| Progressive | Load critical content first, then enhance |
| Optimistic | Show cached data immediately, refresh in background |

#### The Shimmer Effect

```css
.glass-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

#### Loading Component Specifications

| Component | Skeleton Treatment |
|-----------|-------------------|
| Property Card | Glass card with shimmer bands for image, text, badges |
| Deal Card | Glass outline with shimmer for checkbox, title, profit |
| KPI Card | Large shimmer block for number, small for label |
| Table Row | Alternating shimmer bands per column |
| Map | Muted gray map tiles load first, markers fade in |
| Chat Message | Scout avatar pulse + glass bubble shimmer |

#### Page-Level Loading Choreography

When navigating between pages, use a choreographed sequence:

```
1. [0ms]    Current page begins fade-out (opacity → 0.5)
2. [100ms]  Skeleton of new page fades in from bottom (translateY: 20px → 0)
3. [300ms]  Real content replaces skeleton with cross-fade
4. [400ms]  Scout panel shows contextual "I'm loading [X] properties..."
```

> **Implementation:** Use Framer Motion's `AnimatePresence` with `mode="wait"` and spring physics.

### 8.2 Error States: Graceful Recovery

Errors are not failures — they are opportunities for Scout to assist.

#### Error Severity Hierarchy

| Level | Visual Treatment | Scout Behavior |
|-------|-----------------|----------------|
| **Transient** (network hiccup) | Toast notification (bottom-right) | "Connection restored. Retrying..." |
| **Recoverable** (API 400) | Inline error banner within component | "That address wasn't found. Try a different search." |
| **Blocking** (auth expired) | Full-page takeover with glass overlay | "Your session expired. Let me help you sign back in." |
| **Critical** (server down) | Full-page with Scout animation | "Our servers are taking a break. I'll keep trying." |

#### Error Component Styling

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Inline Error Banner                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  ⚠️  [Warning Icon]                                    [✕ Close]││
│  │                                                                 ││
│  │  **We couldn't load the property details.**                     ││
│  │                                                                 ││
│  │  This might be because the address isn't in our database.       ││
│  │                                                                 ││
│  │  [🔄 Try Again]  [Ask Scout for help]                           ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  Material: `surface-glass-high` with `border-left: 4px #FF9F0A`     │
│  Animation: Slides down from top with spring overshoot              │
└─────────────────────────────────────────────────────────────────────┘
```

#### Error Color Mapping

| Error Type | Border Color | Icon | Background Tint |
|------------|--------------|------|-----------------|
| Warning | `#FF9F0A` | ⚠️ | `rgba(255, 159, 10, 0.05)` |
| Error | `#FF3B30` | ❌ | `rgba(255, 59, 48, 0.05)` |
| Info | `#0071E3` | ℹ️ | `rgba(0, 113, 227, 0.05)` |

### 8.3 Empty States: Guided Action

Empty states are not voids — they are **entry points** for the user journey.

#### Empty State Philosophy

1. **Never show a blank screen.** Always provide context and next steps.
2. **Scout offers help.** The AI suggests what to do.
3. **Visual warmth.** Use subtle illustrations, not stark emptiness.

#### Empty State Component Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                     [Subtle Illustration]                            │
│                         ╭───────╮                                    │
│                         │  🏠   │                                    │
│                         ╰───────╯                                    │
│                                                                      │
│              **No properties in this view**                          │
│                                                                      │
│    Your current filters aren't showing any results.                  │
│    Try expanding your search area or adjusting criteria.             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  💡 Scout suggests: "Search for properties with 40%+ equity    │ │
│  │     in Miami-Dade. I found 234 leads that match."              │ │
│  │                                                                 │ │
│  │  [Apply This Search]                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│            [Clear Filters]     [Search New Area]                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Feature-Specific Empty States

| Page | Empty Message | Scout Suggestion | Primary Action |
|------|---------------|------------------|----------------|
| Properties | "No properties match your filters" | "I can find high-equity homes nearby" | Apply Scout search |
| Deals | "Your pipeline is empty" | "Let's find your first deal together" | View Properties |
| Buyers | "No buyers yet" | "I can help import from CSV" | Add Buyer |
| Documents | "No documents" | "I can generate an offer letter" | Upload or Generate |
| Inbox | "No conversations" | "Ready when you make first contact" | View Leads |

### 8.4 Toast & Notification System

Toasts are **momentary glass cards** that confirm actions without interrupting flow.

#### Toast Positioning & Stacking

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                                                                      │
│                                                                      │
│                                                                      │
│                                                                      │
│                                                    ┌──────────────┐ │
│                                                    │ Toast 3      │ │
│                                                    └──────────────┘ │
│                                                    ┌──────────────┐ │
│                                                    │ Toast 2      │ │
│                                                    └──────────────┘ │
│                                                    ┌──────────────┐ │
│                                                    │ Toast 1      │ │
│                                                    └──────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Position: Bottom-right, 24px from edges
Stacking: Newest at bottom, max 3 visible
Animation: Slide in from right with spring; fade + shrink on dismiss
```

#### Toast Variants

| Type | Icon | Duration | Use Case |
|------|------|----------|----------|
| Success | ✓ (checkmark) | 3s | Property saved, Offer sent |
| Info | ℹ️ | 4s | Skip trace started, Sync in progress |
| Warning | ⚠️ | 5s | Low credits, Rate limit approaching |
| Error | ✕ | Persistent | API failed, Action required |
| Scout | 🤖 (orb) | 5s | AI completed task, Insight ready |

#### Toast Styling

```css
.toast-glass {
  background: var(--surface-glass-high);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-highlight);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  
  /* Entry animation */
  animation: toast-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

#### Scout-Specific Toasts

When Scout completes a background task, use a special toast:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  [Scout Orb Animation]  Skip trace complete!                   ││
│  │                         Found 38 of 42 contacts.               ││
│  │                         [View Results]                         ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘

Orb: Animated pulse matching Scout's panel orb
Background: Subtle gradient from primary blue to panel color
```

---

## 9. Accessibility & Keyboard Navigation

Accessibility is not an afterthought — it is **baked into the Fluid physics**. Every spring animation, every glass panel, every Scout interaction must work for all users.

### 9.1 Keyboard Navigation Map

| Key | Action |
|-----|--------|
| `⌘ + K` | Open Command Palette |
| `⌘ + /` | Focus Scout chat input |
| `⌘ + \` | Toggle Scout panel (expand/collapse) |
| `⌘ + B` | Toggle Command Rail (left sidebar) |
| `⌘ + 1-5` | Quick nav: Properties, Deals, Buyers, Analytics, Inbox |
| `Escape` | Close active modal/popover, clear selection |
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous element |
| `Enter` | Activate focused element |
| `Space` | Toggle checkboxes, expand collapsibles |
| `Arrow Keys` | Navigate within lists, grids, tables |
| `⌘ + Enter` | Submit form, send message |

### 9.2 Focus Management

The focus ring must be visible and follow the Fluid aesthetic:

```css
:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--background),
    0 0 0 4px var(--color-primary);
  border-radius: inherit;
}

/* For glass elements, use glowing ring */
.glass-element:focus-visible {
  box-shadow:
    0 0 0 2px rgba(0, 113, 227, 0.5),
    0 0 20px rgba(0, 113, 227, 0.3);
}
```

#### Focus Order (Per Page)

1. **Command Rail** (collapsed: skip; expanded: nav items)
2. **Filter Pills** (horizontal traverse)
3. **Main Content** (map markers → list items OR table rows)
4. **Scout Panel** (chat input → message actions)

### 9.3 Screen Reader Considerations

| Element | ARIA Label | Live Region |
|---------|------------|-------------|
| Map | "Interactive property map with [X] properties" | — |
| Smart Marker | "[Address], [Price], [Equity]% equity" | — |
| Scout Panel | "Scout AI assistant" | `aria-live="polite"` for new messages |
| Toast | "[Type]: [Message]" | `aria-live="assertive"` |
| Kanban Column | "[Stage name], [X] deals" | — |
| Loading Skeleton | "Loading [component name]" | — |

### 9.4 Reduced Motion Support

For users with `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Keep essential state changes visible */
  .toast-glass {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

> **Critical:** Spring physics animations use Framer Motion's built-in reduced motion detection. Ensure `useReducedMotion()` is respected.

### 9.5 Color Contrast & Legibility

| Element | Minimum Contrast | Achieved |
|---------|-----------------|----------|
| Text on glass | 4.5:1 (WCAG AA) | 5.2:1 ✓ |
| Text on primary button | 4.5:1 | 8.1:1 ✓ |
| Error text | 4.5:1 | 6.3:1 ✓ |
| Muted text | 3.0:1 (Large text) | 4.1:1 ✓ |

---

## 10. Responsive Design & Breakpoints

The Tri-Pane layout transforms across devices while maintaining the Fluid philosophy.

### 10.1 Breakpoint Definitions

| Name | Width | Layout Behavior |
|------|-------|-----------------|
| `xs` (Mobile Portrait) | `< 480px` | Single column, bottom nav, Scout as sheet |
| `sm` (Mobile Landscape) | `480px - 767px` | Single column, wider cards |
| `md` (Tablet) | `768px - 1023px` | Two-pane (Rail + Canvas), Scout collapsed |
| `lg` (Small Desktop) | `1024px - 1439px` | Tri-Pane, Scout 320px |
| `xl` (Large Desktop) | `≥ 1440px` | Tri-Pane, Scout 400px, expanded features |

### 10.2 Layout Transformations

```
DESKTOP (≥1024px):
┌────────┬─────────────────────────────────┬─────────────┐
│ Rail   │ Canvas (Map + List)             │ Scout Panel │
│ 64px   │ flex-grow                       │ 320-400px   │
└────────┴─────────────────────────────────┴─────────────┘

TABLET (768px - 1023px):
┌────────┬─────────────────────────────────────────────────┐
│ Rail   │ Canvas (Map or List, toggleable)               │
│ 64px   │                                                 │
├────────┴─────────────────────────────────────────────────┤
│                   Scout Collapsed → [💬]                  │
└──────────────────────────────────────────────────────────┘

MOBILE (< 768px):
┌──────────────────────────────────────────────────────────┐
│ [Header: Logo + Burger Menu]                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              Canvas (Full Screen)                        │
│                                                          │
│              [Toggle: Map / List]                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ [🏠] [🤝] [👥] [📊] [💬]                                 │
│           Bottom Navigation Bar                          │
└──────────────────────────────────────────────────────────┘
```

### 10.3 Touch Gesture Equivalents

| Mouse Behavior | Touch Equivalent |
|----------------|------------------|
| Hover on Command Rail | Tap hamburger to open full navigation |
| Hover on map marker | Tap marker to show popup |
| Drag to resize split view | Swipe on handle; snap to nearest point |
| Right-click context menu | Long press (300ms) |
| Keyboard shortcuts | Use Command Palette via FAB |

### 10.4 Mobile-Specific Components

#### Bottom Navigation Bar

```
┌──────────────────────────────────────────────────────────┐
│  🏠         🤝         👥         📊         💬         │
│ Properties  Deals    Buyers   Analytics   Scout        │
│                                                          │
│  Active state: Filled icon, Primary color               │
│  Inactive: Outlined icon, Muted color                   │
│  Background: surface-glass-base + blur                  │
└──────────────────────────────────────────────────────────┘
```

#### Scout Sheet (Mobile)

When tapping the Scout icon on mobile:

1. Sheet slides up from bottom (80% viewport height)
2. Uses `surface-glass-high` with heavy blur (40px)
3. Drag handle at top for dismiss gesture
4. Chat input fixed at bottom with safe area inset

### 10.5 CSS Grid Responsive Implementation

```css
.app-shell {
  display: grid;
  height: 100vh;
  overflow: hidden;
}

/* Mobile */
@media (max-width: 767px) {
  .app-shell {
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 1fr;
  }
  .command-rail { display: none; }
  .scout-panel { display: none; /* Use sheet instead */ }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .app-shell {
    grid-template-columns: 64px 1fr;
  }
  .scout-panel { 
    position: fixed;
    bottom: 16px;
    right: 16px;
    /* Floating collapsed orb */
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .app-shell {
    grid-template-columns: var(--rail-width, 64px) 1fr var(--scout-width, 320px);
  }
}
```

---

## 11. Authentication UI

Authentication screens are the **first impression** of the Fluid experience. They must feel premium and welcoming.

### 11.1 Login Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│         [Blurred Hero Background: Property Map Preview]             │
│                                                                      │
│                    ╭─────────────────────────────╮                   │
│                    │                             │                   │
│                    │   ┌───────────────────────┐ │                   │
│                    │   │      🏠 REI Platform  │ │                   │
│                    │   └───────────────────────┘ │                   │
│                    │                             │                   │
│                    │   **Welcome back**          │                   │
│                    │   Sign in to your account   │                   │
│                    │                             │                   │
│                    │   ┌───────────────────────┐ │                   │
│                    │   │ Email                 │ │                   │
│                    │   └───────────────────────┘ │                   │
│                    │   ┌───────────────────────┐ │                   │
│                    │   │ Password          👁️  │ │                   │
│                    │   └───────────────────────┘ │                   │
│                    │                             │                   │
│                    │   [Forgot password?]        │                   │
│                    │                             │                   │
│                    │   ┌───────────────────────┐ │                   │
│                    │   │     Sign In           │ │                   │
│                    │   └───────────────────────┘ │                   │
│                    │                             │                   │
│                    │   ━━━━━━━ or ━━━━━━━       │                   │
│                    │                             │                   │
│                    │   [G] Continue with Google  │                   │
│                    │                             │                   │
│                    │   Don't have an account?    │                   │
│                    │   [Sign up]                 │                   │
│                    │                             │                   │
│                    ╰─────────────────────────────╯                   │
│                                                                      │
│                    Card: surface-glass-high                          │
│                    Max-width: 400px, centered                        │
│                    Border-radius: 24px                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.2 Auth Input States

| State | Visual Treatment |
|-------|-----------------|
| Default | `surface-glass-base`, placeholder visible |
| Focused | Blue glow ring, label floats above |
| Filled | Label remains floating, content visible |
| Error | Red border-left (4px), error message below |
| Success | Green checkmark icon on right |

### 11.3 Auth Error Handling

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                    │
│   ⚠️ Invalid email or password.                                    │
│   Please check your credentials and try again.                     │
│   [Forgot password?]                                               │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘

Position: Above the form, below title
Background: rgba(255, 59, 48, 0.08)
Border: 1px solid rgba(255, 59, 48, 0.3)
Animation: Shake effect (translateX ±5px) on error
```

### 11.4 Password Requirements Indicator

```
Password Strength:
━━━━━ ━━━━━ ━━━━━ ━━━━━

Weak        Medium       Strong      Very Strong
(Red)       (Orange)     (Yellow)    (Green)

Checklist (appears on focus):
✓ At least 8 characters
✕ Contains a number
✕ Contains uppercase
✕ Contains special character
```

---

## 12. Onboarding Flow

First-time users are introduced to Scout and the platform through a **progressive, glass-modal wizard**.

### 12.1 Onboarding Philosophy

1. **Scout-led:** The AI introduces itself and the platform
2. **Actionable:** Each step ends with the user doing something
3. **Skippable:** Never trap the user; always offer "Skip for now"
4. **Contextual:** Steps appear where relevant, not all upfront

### 12.2 Onboarding Modal (First Login)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│     ╭───────────────────────────────────────────────────────────╮   │
│     │                                                           │   │
│     │  [Scout Orb Animation - Pulsing]                          │   │
│     │                                                           │   │
│     │       **Hi! I'm Scout, your AI co-pilot.**                │   │
│     │                                                           │   │
│     │  I'll help you find motivated sellers, analyze deals,     │   │
│     │  skip trace owners, draft offers, and close faster.       │   │
│     │                                                           │   │
│     │  Ready to find your first deal?                           │   │
│     │                                                           │   │
│     │  [Let's go →]                           [Maybe later]     │   │
│     │                                                           │   │
│     ╰───────────────────────────────────────────────────────────╯   │
│                                                                      │
│  Background: Full-screen blur (glass-blur-lg on map)                 │
│  Modal: surface-glass-high, centered, max-width 500px               │
│  Progress: Dots at bottom showing 1 of 4 steps                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 12.3 Onboarding Steps

| Step | Content | User Action |
|------|---------|-------------|
| 1 | "Meet Scout" | Click continue |
| 2 | "Your first search" | Type a city/ZIP into the filter |
| 3 | "Explore a property" | Click on a map marker |
| 4 | "Ask Scout anything" | Type a question in the chat |

### 12.4 Contextual Tooltips (Post-Onboarding)

After the initial wizard, use floating tooltips for feature discovery:

```
                    ┌───────────────────────────────────┐
                    │ 💡 Pro tip: Drag this divider to │
                    │    expand the map full-screen.   │
                    │                                   │
                    │ [Got it]              [Show more] │
                    └───────────────────────────────────┘
                                    ▼
  ──────────────────────────────────[Handle]────────────────────────
```

- **Trigger:** First time user interacts with element
- **Dismiss:** Click "Got it" or interact with element
- **Position:** Adjacent to element, arrow pointing to it
- **Material:** `surface-glass-high` with blue accent border

---

## 13. Data Visualization (Charts & Graphs)

Analytics pages present data through **glass charts** that feel integrated with the Fluid aesthetic.

### 13.1 Chart Color Palette

| Purpose | Color | HEX |
|---------|-------|-----|
| Primary Data | Apple Blue | `#0071E3` |
| Secondary Data | Soft Blue | `#5AC8FA` |
| Positive Trend | Success Green | `#34C759` |
| Negative Trend | Danger Red | `#FF3B30` |
| Neutral | Gray | `#8E8E93` |
| Grid Lines | Ultra Light | `rgba(0,0,0,0.05)` |
| Axis Labels | Gray 500 | `#718096` |

### 13.2 Chart Types & Styling

#### Line Chart (Trends)

```
    ^
    │                    ○━━━━━━○
    │              ○━━━━━╯
    │        ○━━━━━╯
    │  ○━━━━╯
    │
    └────────────────────────────────────>
      Jan   Feb   Mar   Apr   May   Jun

Line: 2px stroke, rounded caps, gradient fill below
Points: 8px circles, glass fill, hover expands to 12px
Tooltip: Glass card with value + date
Grid: Horizontal only, dashed, ultra-light
```

#### Bar Chart (Comparisons)

```
    │
 40 │  ┌───┐
    │  │   │      ┌───┐
 30 │  │   │      │   │      ┌───┐
    │  │   │      │   │      │   │
 20 │  │   │  ┌───┤   │      │   │
    │  │   │  │   │   │  ┌───┤   │
    │  │   │  │   │   │  │   │   │
    └──┴───┴──┴───┴───┴──┴───┴───┴───────
        Q1     Q2     Q3     Q4

Bars: Rounded tops (8px radius), equity color scale
Spacing: 50% bar width between groups
Labels: Centered below bars
```

#### Pie/Donut Chart (Distribution)

```
         ╭─────────────╮
       ╱    ╱╲         ╲
      │    ╱  ╲  35%    │
      │   ╱ 25%╲        │
      │   ╲    ╱        │
      │    ╲  ╱   40%   │
       ╲    ╲╱         ╱
         ╰─────────────╯

Center: Total value or category label
Segments: 2px white gaps between
Hover: Segment lifts 4px with shadow
Legend: Pills below chart
```

### 13.3 Chart Container Component

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Chart Card                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Deal Velocity                              [📅 This Month ▾]   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │                    [Chart Content]                              ││
│  │                                                                 ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ ● This Month (12)   ● Last Month (8)   ● Avg (10)              ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  Material: surface-glass-high                                        │
│  Header: Title + Date selector                                       │
│  Footer: Legend as pills                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 13.4 Chart Tooltips

```css
.chart-tooltip {
  background: var(--surface-glass-high);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-highlight);
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.chart-tooltip-title {
  font-size: 12px;
  color: var(--text-muted);
}

.chart-tooltip-value {
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
```

---

## 14. Settings Pages

Settings are organized into **logical groups** with a consistent glass panel layout.

### 14.1 Settings Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMMAND RAIL │            SETTINGS CONTENT            │ (No Scout) │
├──────────────┼────────────────────────────────────────┼────────────┤
│              │ ┌────────────────────────────────────┐ │            │
│              │ │ SETTINGS                            │ │            │
│              │ ├────────────────────────────────────┤ │            │
│              │ │                                     │ │            │
│              │ │ [Profile]  [Billing]  [Team]  ...  │ │            │
│              │ │                                     │ │            │
│              │ └────────────────────────────────────┘ │            │
│              │ ┌────────────────────────────────────┐ │            │
│              │ │                                     │ │            │
│              │ │        [Settings Content]           │ │            │
│              │ │                                     │ │            │
│              │ └────────────────────────────────────┘ │            │
└──────────────┴────────────────────────────────────────┴────────────┘

Note: Scout panel is hidden on Settings pages (not contextually relevant).
Navigation: Horizontal tabs within settings, not sidebar.
```

### 14.2 Settings Categories

| Category | Contents |
|----------|----------|
| **Profile** | Name, email, avatar, password change |
| **Billing** | Plan details, payment method, usage |
| **Team** | Members, roles, invites |
| **Notifications** | Email/push preferences per action type |
| **Integrations** | Connected apps (Twilio, Mailgun, etc.) |
| **API Keys** | Developer access tokens |
| **Scout Preferences** | AI tone, auto-suggestions, voice |
| **Appearance** | Theme (Light/Dark/System), density |

### 14.3 Settings Form Patterns

#### Toggle Row

```
┌─────────────────────────────────────────────────────────────────────┐
│  Email notifications for new leads                     [━━━●━━━]   │
│  Receive an email when Scout finds matching properties    ON       │
└─────────────────────────────────────────────────────────────────────┘

Toggle: Pill-shaped track with circular knob
ON state: Primary blue track, white knob
OFF state: Gray track, white knob
Animation: Knob slides with spring physics
```

#### Input Row

```
┌─────────────────────────────────────────────────────────────────────┐
│  Display Name                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ John Smith                                                [Edit]││
│  └─────────────────────────────────────────────────────────────────┘│
│  This name appears on offers and communications.                    │
└─────────────────────────────────────────────────────────────────────┘
```

#### Danger Zone

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️ **Danger Zone**                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  **Delete Account**                                                  │
│  Permanently delete your account and all data.                       │
│  This action cannot be undone.                                       │
│                                                                      │
│  [🗑️ Delete My Account]                                             │
│                                                                      │
│  Border: 1px solid #FF3B30                                          │
│  Button: Red background, requires confirmation modal                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 15. Print Styles & Document Generation

Contracts, offers, and reports need print-optimized styles.

### 15.1 Print Mode Philosophy

1. **Remove interactivity:** No buttons, no navigation
2. **Optimize for paper:** White background, black text
3. **Page breaks:** Logical grouping per page
4. **Headers/Footers:** Company logo, date, page numbers

### 15.2 Print CSS

```css
@media print {
  /* Hide interactive elements */
  .command-rail,
  .scout-panel,
  .toast,
  .filter-pills,
  button:not(.print-visible),
  .no-print {
    display: none !important;
  }
  
  /* Reset glass to solid white */
  .glass-element {
    background: white !important;
    backdrop-filter: none !important;
    border: 1px solid #e0e0e0 !important;
  }
  
  /* Ensure full width */
  .main-content {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Page break control */
  .bento-card {
    page-break-inside: avoid;
  }
  
  .page-break-before {
    page-break-before: always;
  }
  
  /* Document header */
  .print-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  
  /* Page numbers */
  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    text-align: center;
    font-size: 10pt;
  }
}
```

### 15.3 Generated Document Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]                          Offer Letter | Dec 7, 2025         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PROPERTY: 123 Main Street, Miami, FL 33130                          │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Dear John Smith,                                                    │
│                                                                      │
│  I am writing to express interest in purchasing your property...    │
│                                                                      │
│  OFFER DETAILS                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Purchase Price:             $285,000                            ││
│  │ Earnest Money:              $5,000                              ││
│  │ Closing Timeline:           30 days                             ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│  [Signature Block]                                                   │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                           Page 1 of 1                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 16. Implementation Priority Matrix

This matrix guides the order of implementation based on impact and effort.

### 16.1 Priority Levels

| Priority | Definition | Timeline |
|----------|------------|----------|
| **P0** | Core functionality, blocks other work | Week 1-2 |
| **P1** | High-impact user-facing features | Week 3-4 |
| **P2** | Important polish and completeness | Week 5-6 |
| **P3** | Nice-to-have enhancements | Week 7-8 |

### 16.2 Implementation Checklist (Complete)

#### P0: Foundation (Week 1-2)

- [x] CSS tokens for Liquid Glass materials
- [x] Squircle utility class
- [x] Spring animation primitives (Framer Motion config)
- [x] AppShell Tri-Pane layout
- [x] Command Rail with hover expansion
- [x] Scout panel persistent sidebar
- [x] Focus visible styles
- [x] Keyboard shortcut system (Basic Command+K trigger implemented)

#### P1: Core Components (Week 3-4)

- [x] Smart Markers with equity colors
- [x] Property Card (list view)
- [x] Bento Property Detail
- [x] Filter Pills horizontal bar
- [x] Toast notification system
- [x] Loading skeletons (glass shimmer)
- [x] Empty states with Scout suggestions
- [x] Error states (inline + full-page)

#### P2: Feature Pages (Week 5-6)

- [x] Authentication UI (login, signup, forgot password)
- [x] Onboarding wizard (modal + tooltips)
- [x] Kanban (glass columns, spring drag)
- [x] Analytics charts (glass containers, tooltips)
- [x] Settings pages (all categories)
- [x] Inbox/CRM with Live Assist sentiment

#### P3: Polish & Edge Cases (Week 7-8)

- [ ] Print styles
- [ ] Reduced motion support
- [ ] Screen reader optimization
- [ ] Mobile responsive testing
- [ ] Dark mode refinements
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 17. Appendix: Quick Reference

### 17.1 Glass Material Tokens (Copy-Paste)

```css
:root {
  /* Materials */
  --surface-glass-base: rgba(255, 255, 255, 0.65);
  --surface-glass-high: rgba(255, 255, 255, 0.85);
  --glass-blur-md: blur(20px) saturate(180%);
  --glass-blur-lg: blur(40px) saturate(180%);
  --border-highlight: rgba(255, 255, 255, 0.4);
  --border-shadow: rgba(0, 0, 0, 0.05);
  
  /* Dark Mode Overrides */
  --surface-glass-base-dark: rgba(28, 28, 30, 0.60);
  --surface-glass-high-dark: rgba(44, 44, 46, 0.80);
  --border-highlight-dark: rgba(255, 255, 255, 0.15);
  --border-shadow-dark: rgba(0, 0, 0, 0.3);
  
  /* Colors */
  --color-primary: #0071E3;
  --color-success: #34C759;
  --color-warning: #FF9F0A;
  --color-danger: #FF3B30;
  --color-text-primary: #1D1D1F;
  --color-text-muted: #8E8E93;
  
  /* Radii */
  --radius-standard: 16px;
  --radius-large: 24px;
  --radius-pill: 999px;
  
  /* Breakpoints */
  --bp-xs: 480px;
  --bp-sm: 767px;
  --bp-md: 1023px;
  --bp-lg: 1439px;
}
```

### 17.2 Spring Animation Presets

```typescript
export const springPresets = {
  // Quick, snappy for buttons/icons
  snappy: { mass: 0.5, stiffness: 400, damping: 25 },
  
  // Standard for panels/cards
  standard: { mass: 1, stiffness: 300, damping: 30 },
  
  // Bouncy for celebrations
  bouncy: { mass: 0.8, stiffness: 350, damping: 15 },
  
  // Gentle for large surfaces
  gentle: { mass: 1.2, stiffness: 250, damping: 35 },
  
  // Eased for drag/resize
  drag: { mass: 0.6, stiffness: 200, damping: 20 },
};
```

### 17.3 Component Naming Convention

| Pattern | Example | Usage |
|---------|---------|-------|
| `[Entity]Card` | `PropertyCard`, `DealCard` | List item cards |
| `[Entity]Bento` | `PropertyBento` | Detail view grids |
| `[Action]Button` | `SaveButton`, `CallButton` | Action triggers |
| `[Feature]Empty` | `DealsEmpty`, `PropertiesEmpty` | Empty states |
| `[Feature]Skeleton` | `PropertyCardSkeleton` | Loading states |
| `Glass[Component]` | `GlassPanel`, `GlassTooltip` | Glass-styled variants |

---

**Document Version:** 2.0  
**Last Updated:** December 7, 2025  
**Author:** Design System Team  
**Status:** Complete Specification
