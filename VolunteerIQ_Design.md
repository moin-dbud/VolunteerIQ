# VolunteerIQ — Design Description Document
**Version:** 1.0  
**Status:** Final — MVP Scope  
**Reference:** All visual decisions are derived from the approved UI mockups (6 screens)

---

## 1. Design Philosophy

VolunteerIQ's visual language is **dark command-center brutalism** — the aesthetic of a military operations room fused with a modern SaaS dashboard. Every design decision communicates urgency, authority, and precision. This is not a friendly community app; it is a **mission-critical tool** that happens to look exceptional.

The interface should feel like looking at a live situation room — dense with real information, nothing decorative that doesn't earn its place, but rich with visual hierarchy that guides the eye to what matters most in seconds.

**Three words that define every screen:** Urgent. Intelligent. Operational.

---

## 2. Color System

All colors are defined as CSS custom properties and must be used consistently across every component.

```css
:root {
  /* Backgrounds */
  --bg-base: #0a0a0f;          /* Page background — near black with blue undertone */
  --bg-surface: #111118;       /* Cards, panels, modals */
  --bg-elevated: #1a1a24;      /* Hover states, nested cards */
  --bg-sidebar: #0d0d14;       /* Left sidebar background */

  /* Brand / Primary Accent */
  --accent-primary: #9333ea;   /* Purple — primary CTA buttons, active nav items, key stats */
  --accent-primary-hover: #7c22d4;
  --accent-glow: rgba(147, 51, 234, 0.15); /* Used for card glow effects */

  /* Secondary Accent */
  --accent-secondary: #c026d3; /* Magenta/pink — "Pulse" word highlights, gradient ends */
  --accent-gradient: linear-gradient(135deg, #9333ea, #c026d3); /* Brand gradient */

  /* Urgency Colors */
  --urgency-high: #ef4444;     /* Red — high priority badges, urgent states */
  --urgency-medium: #f59e0b;   /* Amber — medium priority */
  --urgency-low: #6366f1;      /* Indigo — low priority */
  --urgency-urgent: #dc2626;   /* Deeper red — URGENT label only */

  /* Status Colors */
  --status-pending: #ef4444;   /* Red dot */
  --status-assigned: #f97316;  /* Orange dot */
  --status-completed: #22c55e; /* Green dot */

  /* Category Bar Colors */
  --cat-infrastructure: #9333ea; /* Purple */
  --cat-environment: #c026d3;    /* Magenta */
  --cat-public-safety: #ef4444;  /* Red */
  --cat-health: #8b5cf6;         /* Violet */

  /* Text */
  --text-primary: #ffffff;      /* Main body text, headings */
  --text-secondary: #a1a1aa;    /* Labels, subtitles, metadata */
  --text-muted: #52525b;        /* Placeholder text, disabled states */
  --text-accent: #9333ea;       /* Inline accent text (links, "Pulse" word) */

  /* Borders */
  --border-default: #27272a;    /* Card borders, dividers */
  --border-focus: #9333ea;      /* Input focus ring */
  --border-accent: rgba(147, 51, 234, 0.5); /* Glowing borders on featured cards */

  /* Overlays */
  --overlay-dark: rgba(0, 0, 0, 0.6);
}
```

**Color Usage Rules:**
- `--bg-base` is the only color used as the page/body background. Never use a lighter color for the main background.
- `--accent-gradient` is used only on primary CTA buttons and the "Create Account" button. Not on regular action buttons.
- The word "Pulse" and "Operational Issue" in hero headlines always use `--accent-secondary` (#c026d3), not purple.
- Use `--accent-primary` (#9333ea) for all other interactive accent elements.
- Never use white or light backgrounds anywhere — this is a pure dark theme.

---

## 3. Typography

### 3.1 Font Stack
```css
/* Display / Headings */
font-family: 'Space Grotesk', 'Syne', sans-serif;

/* Body / UI */
font-family: 'DM Sans', 'Inter', sans-serif;

/* Monospace / Stats / Labels */
font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
```

Import via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Role | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Hero H1 | Space Grotesk | 48px / 3rem | 700 | Dashboard and page hero headlines |
| Page H2 | Space Grotesk | 32px / 2rem | 600 | Section titles |
| Card Title | Space Grotesk | 20px / 1.25rem | 600 | Card headers |
| Body | DM Sans | 14px / 0.875rem | 400 | Descriptions, form labels |
| Body Large | DM Sans | 16px / 1rem | 400 | Table content, card body |
| Stat Number | JetBrains Mono | 36px / 2.25rem | 500 | Dashboard KPI numbers (1,284 etc.) |
| Small Label | DM Sans | 11px / 0.6875rem | 500 | Uppercase tracking labels ("OPERATIONAL OVERVIEW") |
| Badge Text | DM Sans | 11px / 0.6875rem | 600 | Priority and status badges |
| Nav Link | DM Sans | 14px / 0.875rem | 500 | Sidebar and top nav links |

### 3.3 Text Treatment Rules
- Hero headline structure: bold word in `--text-primary` + ONE accent word in `--accent-secondary`
  - Example: `Real-time <span style="color: var(--accent-secondary)">Pulse</span> of Community Impact`
- Section labels (like "OPERATIONAL OVERVIEW", "ACTION REQUIRED") must be: uppercase, letter-spacing: 0.15em, font-size 11px, color `--text-secondary`
- Stat numbers (1,284 / 318 / 42) use JetBrains Mono, no letter spacing
- Table column headers: uppercase, 11px, letter-spacing 0.1em, color `--text-muted`

---

## 4. Layout System

### 4.1 App Shell Structure
```
┌─────────────────────────────────────────────────────────┐
│                    TOP NAVBAR (64px)                     │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │         MAIN CONTENT AREA                │
│  (220px)     │         (flex-1, scrollable)             │
│  fixed       │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

- **Top Navbar height:** 64px, `position: sticky`, `top: 0`, `z-index: 50`
- **Sidebar width:** 220px, `position: fixed`, `left: 0`, `top: 64px`, full height minus navbar
- **Main content:** `margin-left: 220px`, `padding: 32px 40px`, scrollable

### 4.2 Grid
- Dashboard uses a 12-column CSS Grid for content areas
- Stat cards: 4 equal columns (`grid-template-columns: repeat(4, 1fr)`, gap 16px)
- Dashboard bottom: 5/12 left (Impact Distribution) + 7/12 right (Recent Submissions)
- Cards always use `border-radius: 12px`
- Card internal padding: 24px

### 4.3 Spacing Scale (use Tailwind's default 4px base)
- XS: 4px | SM: 8px | MD: 16px | LG: 24px | XL: 32px | 2XL: 48px

---

## 5. Component Specifications

### 5.1 Sidebar
```
Background: var(--bg-sidebar)
Width: 220px
Border-right: 1px solid var(--border-default)
Padding: 24px 16px

Logo area:
  - Purple square icon (28x28px, rounded-md, gradient background)
  - "VolunteerIQ" text: Space Grotesk, 16px, weight 700, white
  - "COMMAND CENTER" label: DM Sans, 10px, uppercase, letter-spacing 0.15em, --text-muted

Nav Items:
  - Height: 40px
  - Padding: 0 12px
  - Border-radius: 8px
  - Icon: 18px, Lucide icon, --text-secondary color
  - Label: DM Sans 14px, weight 500, --text-secondary
  - Hover: background var(--bg-elevated), icon and text color --text-primary
  - Active: background rgba(147,51,234,0.15), left border 3px solid --accent-primary,
            icon and text color --accent-primary

URGENT BROADCAST Button (sidebar bottom):
  - Background: var(--accent-primary)
  - Width: 100%
  - Height: 36px
  - Border-radius: 8px
  - Font: DM Sans, 12px, weight 600, uppercase, letter-spacing 0.1em
  - Text: white
  - Hover: background var(--accent-primary-hover)
```

### 5.2 Top Navbar
```
Background: var(--bg-sidebar) with backdrop-blur(12px)
Border-bottom: 1px solid var(--border-default)
Height: 64px
Padding: 0 32px
Display: flex, align-items: center, justify-content: space-between

Left: VolunteerIQ wordmark (Space Grotesk, 18px, weight 700, white)

Center nav links (coordinator only):
  - DM Sans, 14px, weight 500, --text-secondary
  - Active link: --text-primary + 2px bottom border --accent-primary
  - Hover: --text-primary

Right:
  - Search bar: 240px wide, bg var(--bg-elevated), border var(--border-default),
    rounded-full, 36px height, placeholder --text-muted, icon left
  - Bell icon: 20px, --text-secondary, hover --text-primary
  - Settings icon: 20px, --text-secondary, hover --text-primary
  - Avatar: 36px circle, bg var(--accent-primary), initials in white, DM Sans 14px
```

### 5.3 Stat Cards (Dashboard)
```
Background: var(--bg-surface)
Border: 1px solid var(--border-default)
Border-radius: 12px
Padding: 24px
Height: 100px

Layout:
  - Top row: icon (left) + trend badge (right, optional)
  - Bottom: label (TOTAL ISSUES) above, value number below

Icon: 28x28px container, rounded-md
  Card 1 (Total Issues): bg rgba(147,51,234,0.15), purple bar chart icon
  Card 2 (Pending): bg rgba(239,68,68,0.15), red warning diamond icon
  Card 3 (Assigned): bg rgba(147,51,234,0.15), purple people icon
  Card 4 (Completed): bg rgba(34,197,94,0.15), green checkmark icon

Label: DM Sans, 11px, uppercase, letter-spacing 0.1em, --text-muted
Value: JetBrains Mono, 32px, weight 500
  Card 1: --text-primary
  Card 2: --urgency-high (#ef4444)
  Card 3: --accent-primary (#9333ea)
  Card 4: --text-primary

Trend badge (+12%): DM Sans, 11px, weight 600, green, top-right corner
URGENT badge: DM Sans, 11px, bg #dc2626, text white, rounded-sm, top-right
```

### 5.4 Priority Badges
```
All badges: DM Sans, 11px, weight 600, uppercase, letter-spacing 0.05em
Padding: 3px 8px, border-radius: 4px

HIGH: background rgba(239,68,68,0.2), text #ef4444, border 1px solid rgba(239,68,68,0.4)
MEDIUM: background rgba(147,51,234,0.2), text #9333ea, border 1px solid rgba(147,51,234,0.4)
LOW: background rgba(63,63,70,0.6), text #a1a1aa, border 1px solid #3f3f46
URGENT: background #dc2626, text #ffffff (solid fill — most severe)
```

### 5.5 Status Badges
```
Display: flex, align-items: center, gap: 6px
Dot: 8px circle
Text: DM Sans, 12px, weight 500, uppercase, letter-spacing 0.05em

PENDING: dot --status-pending, text --status-pending
ASSIGNED: dot --status-assigned, text --status-assigned
COMPLETED: dot --status-completed, text --status-completed
```

### 5.6 Form Inputs
```
Background: var(--bg-elevated)
Border: 1px solid var(--border-default)
Border-radius: 8px
Height: 44px (text inputs), auto (textarea)
Padding: 0 12px 0 40px (with icon) or 0 12px (without icon)
Font: DM Sans, 14px, --text-primary
Placeholder color: --text-muted

Focus state:
  Border: 1px solid var(--accent-primary)
  Box-shadow: 0 0 0 3px var(--accent-glow)
  Outline: none

Icon (left inside input): 16px, Lucide, --text-muted color, positioned absolute

Dropdown (select):
  Same as text input
  Chevron icon right side (Lucide ChevronDown, --text-muted)
  Custom styled — no browser default appearance

Textarea:
  Min-height: 140px
  Resize: vertical only
  Same border and focus styles

Radio buttons (Urgency Level):
  Custom styled circles: 16px diameter
  Default: border 2px solid --border-default, bg transparent
  Selected: border 2px solid --accent-primary, inner dot 8px --accent-primary
  Label: DM Sans 14px, --text-secondary

Checkbox (Specializations):
  Custom styled: 18px square, border-radius 4px
  Default: border 2px solid --border-default, bg transparent
  Checked: bg --accent-primary, white checkmark icon inside
```

### 5.7 Buttons
```
Primary Button (filled purple):
  Background: var(--accent-primary)
  Text: white, DM Sans, 14px, weight 600
  Padding: 10px 20px
  Border-radius: 8px
  Border: none
  Hover: background var(--accent-primary-hover), transform: translateY(-1px)
  Active: transform: translateY(0)
  Transition: all 0.15s ease

Gradient Button (Create Account, Upgrade Workspace):
  Background: var(--accent-gradient)
  Text: white, DM Sans, 14px, weight 700
  Height: 48px (full-width CTAs)
  Border-radius: 10px
  Hover: opacity 0.9, box-shadow: 0 4px 20px rgba(147,51,234,0.4)

Ghost Button (Cancel, I'm Available, Export View):
  Background: transparent
  Border: 1px solid var(--border-default)
  Text: --text-secondary, DM Sans, 14px, weight 500
  Padding: 10px 20px
  Border-radius: 8px
  Hover: border-color --accent-primary, text --text-primary

Dispatch Request Button:
  Background: var(--bg-elevated)
  Border: 1px solid var(--border-default)
  Text: --text-primary, DM Sans, 14px, weight 500
  Full width within its container
  Hover: border-color --accent-primary

Focus Hotspots Button (Map):
  Background: var(--accent-gradient)
  Text: white, DM Sans, 13px, weight 600
  Padding: 10px 20px
  Border-radius: 8px
```

### 5.8 Table (Recent Submissions)
```
Container: bg var(--bg-surface), border-radius 12px, overflow hidden

Header row:
  Background: var(--bg-elevated)
  Border-bottom: 1px solid var(--border-default)
  Column labels: DM Sans, 11px, uppercase, letter-spacing 0.1em, --text-muted
  Padding: 12px 20px

Data rows:
  Padding: 16px 20px
  Border-bottom: 1px solid var(--border-default)
  Hover: background var(--bg-elevated)
  Cursor: pointer (rows are clickable)
  Transition: background 0.15s

Issue Title cell:
  Primary text: DM Sans, 14px, weight 500, --text-primary
  Location subtext: DM Sans, 12px, --text-muted, with 📍 icon

Last row: no border-bottom
```

### 5.9 Mission Cards (Volunteer Portal)
```
Container: bg var(--bg-surface), border-radius 12px, overflow hidden
Border: 1px solid var(--border-default)
Margin-bottom: 12px

Left accent border by urgency:
  URGENT missions: 4px solid --urgency-high on left edge
  MATCHING SKILLS: 4px solid --accent-primary on left edge
  RECOMMENDED: no left border

Image area: 100x90px, object-fit cover, rounded left
Content area: padding 16px
  Urgency/type badge + time info row (same line)
  Mission title: Space Grotesk, 16px, weight 600
  Description: DM Sans, 13px, --text-secondary, max 2 lines
  Skill tags: pill-shaped, bg var(--bg-elevated), text --text-secondary, 11px, padding 3px 10px
  Action button: right-aligned or full-width
```

### 5.10 Gemini Intelligence Report Card (AI Insights)
```
Container: bg var(--bg-surface), border-radius 16px
Border: 1px solid var(--border-accent)
Box-shadow: 0 0 30px var(--accent-glow)
Left border: 4px solid gradient (accent-primary to accent-secondary)
Padding: 28px

Header: sparkle/gemini icon (20px, purple) + "Gemini Intelligence Report" (Space Grotesk, 18px)
Decorative sparkle icons: top-right area, --text-muted, large (40px)

Progress bar:
  Track: var(--bg-elevated), height 4px, border-radius 2px, full width
  Fill: var(--accent-primary), width driven by accuracy percentage
  Label left: DM Sans, 12px, --text-muted
  Label right: DM Sans, 12px, weight 600, --accent-primary
```

### 5.11 Network Health Card (AI Insights Sidebar)
```
Background: var(--bg-surface)
Border: 1px solid var(--border-default)
Border-radius: 12px
Padding: 20px

Title: "NETWORK HEALTH" — DM Sans, 11px, uppercase, letter-spacing 0.15em, --text-muted

Each row:
  Display: flex, justify-content: space-between
  Indicator dot: 8px circle (green for active, purple for online, red for critical)
  Label: DM Sans, 14px, --text-secondary
  Value: DM Sans, 14px, weight 600, --text-primary (or "Online" in green, "12 Critical" in red)
  Divider: 1px solid var(--border-default) between rows
```

### 5.12 Map Popup Card
```
Background: var(--bg-surface)
Border: 1px solid var(--border-default)
Border-radius: 12px
Width: 280px
Padding: 20px
Box-shadow: 0 20px 40px rgba(0,0,0,0.5)

Priority label: same as Priority Badge spec (URGENT variant)
Close button: X icon, top-right, --text-muted, hover --text-primary
Title: Space Grotesk, 18px, weight 700
Description: DM Sans, 13px, --text-secondary
Location section: bg var(--bg-elevated), rounded-8, padding 12px, 📍 icon + address
Assign Volunteer button: full width, gradient background
```

### 5.13 Map Filter Panel
```
Background: rgba(13,13,20,0.85)
Backdrop-filter: blur(12px)
Width: 280px
Height: calc(100vh - 64px)
Position: absolute, left 0, overflow-y: auto
Padding: 20px
Border-right: 1px solid var(--border-default)

Section labels: DM Sans, 11px, uppercase, letter-spacing 0.15em, --text-muted, margin-bottom 12px

Category filter pills:
  Default: bg var(--bg-elevated), border var(--border-default), text --text-secondary
  Active: bg rgba(147,51,234,0.2), border --accent-primary, text --accent-primary
  Count badge: right-aligned, DM Sans, 12px, weight 600, --text-primary

Urgency pills (smaller):
  With colored left dot + label + optional checkmark for "All"
```

---

## 6. Map Styling

### 6.1 Google Maps Dark Style
Apply this style JSON to the Google Maps instance:
```json
[
  { "elementType": "geometry", "stylers": [{ "color": "#1a1a2e" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0d0d14" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#52525b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f1729" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#13131f" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1e1e2e" }] }
]
```

### 6.2 Map Pins
- High urgency: `#ef4444` circular pin with category icon inside (white)
- Medium urgency: `#f59e0b` circular pin
- Low urgency: `#6366f1` circular pin
- Pin size: 40px diameter
- Selected pin: 50px diameter with outer glow ring (5px, matching urgency color at 40% opacity)

---

## 7. Micro-interactions & Motion

### 7.1 Page Transitions
- Use `opacity: 0 → 1` + `translateY(8px → 0)` on page mount
- Duration: 300ms, easing: ease-out
- Stagger children: 50ms delay increments

### 7.2 Stat Cards
- On mount: count animates from 0 to final value over 800ms (use requestAnimationFrame counter)
- Easing: ease-out cubic

### 7.3 Hover States
- All interactive cards: `transform: translateY(-2px)`, `box-shadow: 0 8px 24px rgba(0,0,0,0.3)`
- Transition: 0.2s ease
- All buttons: 0.15s ease transitions on background, transform, box-shadow

### 7.4 Map Pins
- Pins drop in with a bounce animation on mount (CSS keyframe, 400ms, bounce easing)
- Popup card: scale from 0.95 → 1.0, opacity 0 → 1, 200ms ease

### 7.5 Progress Bar (AI Insights)
- On mount: width animates from 0% to target value over 1200ms, ease-out

### 7.6 Loading States
- Skeleton loaders for data-fetching areas: use animated `background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-surface) 50%, var(--bg-elevated) 75%)` moving shimmer
- Spinner: 24px circle, border 2px solid rgba(255,255,255,0.1), border-top-color --accent-primary, rotating

### 7.7 Toast Notifications
- Position: bottom-right, `margin: 16px`
- Background: var(--bg-elevated), border 1px solid --border-default, border-radius 10px
- Success toast: left border 4px solid --status-completed
- Info toast: left border 4px solid --accent-primary
- Slide in from right, auto-dismiss after 4 seconds
- DM Sans, 14px, --text-primary

---

## 8. Signup Page Specific Design

### 8.1 Split Layout
```
Left panel: 55% width, bg var(--bg-base)
Right panel: 45% width, bg var(--bg-surface), border-left 1px solid var(--border-default)
Min-height: 100vh
```

### 8.2 Left Panel Background
- Subtle animated radial gradient mesh behind content
- Gradient: `radial-gradient(ellipse at 20% 50%, rgba(147,51,234,0.08) 0%, transparent 60%),
             radial-gradient(ellipse at 80% 20%, rgba(192,38,211,0.06) 0%, transparent 50%)`
- Optional: grid dot pattern overlay at 3% opacity

### 8.3 Feature Pills (Left Panel)
```
Each pill: border 1px solid var(--border-default), bg rgba(255,255,255,0.03)
Border-radius: 12px, padding: 16px 20px
Width: calc(50% - 8px), displayed side by side

Icon row: Lucide icon (16px, --accent-primary) + label (DM Sans, 11px, uppercase, --accent-primary)
Body: DM Sans, 13px, --text-secondary, margin-top 6px
```

### 8.4 Right Panel (Form)
```
Padding: 48px
Display: flex, flex-direction: column, justify-content: center, min-height: 100vh

"Signup" title: Space Grotesk, 32px, weight 700, --text-primary
Subtitle: DM Sans, 14px, --text-secondary
Gap between title and form: 32px
Gap between form fields: 16px
```

---

## 9. Responsive Behavior (MVP Minimum)

- **Minimum supported viewport:** 1280px wide
- Below 1280px: show a centered message "VolunteerIQ Command Center is optimized for desktop. Please use a screen width of 1280px or larger."
- Sidebar collapses to icon-only at exactly 1280px (optional)
- No mobile or tablet layouts required for MVP

---

## 10. Iconography

All icons use **Lucide React** library exclusively. No mixing of icon libraries.

| UI Element | Lucide Icon |
|---|---|
| Dashboard nav | `LayoutDashboard` |
| Report Issue nav | `AlertTriangle` |
| Volunteer Portal nav | `Users` |
| AI Insights nav | `Brain` |
| Map View nav | `Map` |
| Search | `Search` |
| Notifications | `Bell` |
| Settings | `Settings` |
| Location pin | `MapPin` |
| Urgency | `AlertCircle` |
| Category | `Tag` |
| Description | `FileText` |
| Medical | `Stethoscope` |
| Food | `Utensils` |
| Logistics | `Truck` |
| Teaching | `GraduationCap` |
| Completed | `CheckCircle2` |
| Sparkle/AI | `Sparkles` |
| Dispatch | `Send` |
| Close | `X` |
| Chevron | `ChevronDown` |
| External link | `ExternalLink` |
| Edit | `Pencil` |
| Rocket | `Rocket` |
| Shield | `ShieldCheck` |
| Clock | `Clock` |

---

## 11. Empty States

Every data-dependent section must show an empty state when no data exists:

```
Container: centered, padding 48px
Icon: Lucide icon (48px, --text-muted, opacity 0.4)
Title: Space Grotesk, 18px, --text-muted
Subtext: DM Sans, 14px, --text-muted, max-width 280px, text-align center

Examples:
- No issues: AlertTriangle icon, "No issues reported yet", "Reports will appear here once submitted."
- No volunteers: Users icon, "No volunteers yet", "Volunteers appear after signing up."
- No missions: Map icon, "No missions available", "Check back soon for matching opportunities."
```

---

## 12. Do's and Don'ts

**DO:**
- Use `var()` CSS custom properties for every color value — no hardcoded hex in component styles
- Use Space Grotesk for all headings and JetBrains Mono for all numerical statistics
- Maintain the dark base everywhere — every new component defaults to dark
- Add hover transitions on every interactive element
- Use Lucide icons exclusively

**DON'T:**
- Don't use white or light-mode backgrounds anywhere, on any component
- Don't use Inter or Roboto as the primary font
- Don't use solid fills for the map background — always dark-styled Google Maps
- Don't add any rounded corners larger than `border-radius: 16px` on any component
- Don't use emojis as UI icons — use Lucide only
- Don't add any decorative illustrations or images that aren't functional (no hero illustrations)
- Don't use animation durations longer than 1.5 seconds for any UI motion
