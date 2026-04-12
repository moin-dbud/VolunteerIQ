# VolunteerIQ — Product Requirements Document (MVP)
**Version:** 1.0  
**Status:** Final — MVP Scope  
**Project:** Google Solution Challenge 2026  
**Team:** DeepCraft  

---

## 1. Product Overview

### 1.1 Problem Statement
NGOs and community organizations collect critical data through scattered, unstructured sources — WhatsApp messages, paper forms, verbal field reports. This data is siloed, untracked, and unactionable. Coordinators manually attempt to match volunteers to needs, causing delays, duplication, and volunteer burnout. Urgent community issues — medical emergencies, food shortages, infrastructure failures — are overlooked or responded to too late.

### 1.2 Solution Statement
VolunteerIQ is a web-based command center for NGOs. It digitizes issue intake through structured forms, centralizes all data into a unified real-time dashboard, and uses AI (Gemini) to automatically categorize issues, assign urgency levels, and intelligently match the right volunteer to the right task based on skill, proximity, and availability. The result: faster community response, zero-waste volunteer deployment, and measurable impact visibility.

### 1.3 Target Users
| User Type | Description | Primary Goal |
|---|---|---|
| NGO Coordinator / Admin | Manages operations, assigns volunteers, reviews AI suggestions | Monitor, triage, dispatch |
| Volunteer | Field responder with specific skills and location | Find and accept relevant missions |

### 1.4 MVP Scope
The MVP includes 6 pages: Signup, Dashboard, Report Issue, Volunteer Portal, AI Insights, and Map View. No mobile app. No payment system. No third-party NGO API integrations. Gemini AI is used for categorization, prioritization, and volunteer matching only.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Firebase Firestore |
| Authentication | Firebase Auth (Email/Password) |
| AI | Google Gemini API (gemini-1.5-flash) |
| Maps | Google Maps JavaScript API |
| Hosting | Vercel |
| Icons | Lucide React |

---

## 3. Authentication & User Roles

### 3.1 Signup
- Fields: Full Name, Email, Primary Role (dropdown: "NGO Coordinator" or "Volunteer"), Password
- Firebase Auth creates user account
- Role is stored in Firestore under `/users/{uid}` as `role: "coordinator"` or `role: "volunteer"`
- On account creation, redirect: Coordinator → `/dashboard`, Volunteer → `/volunteer`

### 3.2 Login
- Email + Password via Firebase Auth
- Role-based redirect on successful login
- Persistent session via Firebase Auth state

### 3.3 Route Protection
- All pages except `/signup` and `/login` require authentication
- Coordinators can access all 6 pages
- Volunteers can only access `/volunteer` and `/report`
- Unauthorized route access redirects to `/login`

---

## 4. Pages & Feature Requirements

---

### 4.1 Page: Signup (`/signup`)

**Layout:** Split-screen. Left panel = branding + value props. Right panel = signup form.

**Left Panel Content:**
- VolunteerIQ logo (top left)
- Headline: "Join the **Pulse** of Community Impact" ("Pulse" styled in purple/accent color)
- Subtext: "Unite with a global network of changemakers. Our AI-driven command center helps you deploy resources exactly where they're needed most."
- Two feature pills at the bottom:
  - ⚡ REAL-TIME — "Instant response protocols for local and global crises."
  - 🔮 AI INSIGHTS — "Predictive modeling for community volunteer needs."
- Background: Subtle animated gradient or grid texture

**Right Panel — Form:**
- Title: "Signup" + subtitle: "Create your command center account to get started."
- Fields (in order):
  1. FULL NAME — placeholder: "Enter your full name"
  2. EMAIL ADDRESS — placeholder: "name@example.com"
  3. PRIMARY ROLE — dropdown: "Select your role" (options: NGO Coordinator, Volunteer)
  4. PASSWORD — placeholder: "Create a strong password" + show/hide toggle eye icon
- CTA Button: "Create Account" (full width, purple background)
- Footer link: "Already have an account? **Login**"
- Fine print: "BY JOINING, YOU AGREE TO OUR TERMS OF SERVICE & PRIVACY POLICY"

**Validation:**
- All fields required
- Email format validation
- Password minimum 8 characters
- Show inline error messages below each field

**Firebase Action:**
- `createUserWithEmailAndPassword(auth, email, password)`
- On success: write `{ name, email, role, createdAt, uid }` to Firestore `/users/{uid}`
- Set `availabilityStatus: "available"` for volunteers by default

---

### 4.2 Page: Dashboard (`/dashboard`) — Coordinator Only

**Purpose:** Single-screen operational overview. All data pulled from Firestore in real-time.

**Top Section — Page Header:**
- Label (small caps): "OPERATIONAL OVERVIEW"
- Headline: "Real-time **Pulse** of Community Impact" ("Pulse" in accent color)

**Section A — Stat Cards (4 cards, horizontal row):**

| Card | Label | Value Source | Icon | Special |
|---|---|---|---|---|
| 1 | TOTAL ISSUES | Count of all docs in `/issues` | Bar chart icon | Shows "+12%" badge (mock trend) |
| 2 | PENDING ACTION | Count of issues where `status == "pending"` | Warning diamond icon | Shows "URGENT" red badge if >30 |
| 3 | CURRENTLY ASSIGNED | Count of issues where `status == "assigned"` | People icon | Purple value color |
| 4 | COMPLETED TASKS | Count of issues where `status == "completed"` | Checkmark icon | White value color |

**Section B — Impact Distribution (left column):**
- Title: "Impact Distribution" + subtitle: "Issues segmented by category"
- Horizontal bar chart showing 4 categories with percentages:
  - Infrastructure
  - Environment
  - Public Safety
  - Health & Welfare
- Each bar is a different accent color (purple, magenta/pink, red, orange-purple)
- Percentages calculated live from Firestore issue counts
- Below chart: "ACTIVE VOLUNTEERS" label + count of users with `role == "volunteer"` + "Pulse Active" badge + 3 volunteer avatar thumbnails (pull from latest 3 volunteer Firestore records)

**Section C — Recent Submissions (right column):**
- Title: "Recent Submissions" + "View All Issues" link (links to a filtered list view — can be same page scrolled or modal)
- Table with columns: ISSUE TITLE / PRIORITY / CATEGORY / STATUS
- Shows last 8 issues from Firestore ordered by `createdAt` descending
- PRIORITY badges: HIGH (red), MEDIUM (purple), LOW (dark)
- STATUS badges: PENDING (red dot), ASSIGNED (orange dot), COMPLETED (green dot)
- Each row is clickable — opens an issue detail modal with full info + assign volunteer option

**Section D — Active Incident Map (below Section C):**
- Title: "Active Incident Map" + subtitle: "Real-time heat visualization of reports"
- Google Maps embed showing the city view
- Drop pins on map for each issue using `location` field from Firestore
- Pin color = urgency level (red = high, yellow = medium, blue = low)
- "Expand Interactive Map" button → navigates to `/map`

**Sidebar (left, fixed):**
- VolunteerIQ logo + "COMMAND CENTER" label
- Nav links: Dashboard (active), Report Issue, Volunteer Portal, AI Insights, Map View
- "URGENT BROADCAST" button at bottom (opens a modal with a text input to send a broadcast notification string — stored in Firestore `/broadcasts` collection)

**Top Navbar:**
- VolunteerIQ text logo (left)
- Nav links: Dashboard, Report, Volunteer, AI Insights (right-aligned)
- Global search bar (UI only — not functional in MVP, placeholder)
- Bell icon (notifications — UI only in MVP)
- Settings icon (UI only)
- User avatar circle (initials of logged-in user)

---

### 4.3 Page: Report Issue (`/report`) — Both Roles

**Purpose:** Structured form for logging a community issue. On submission, triggers Gemini AI triage.

**Page Header:**
- Small label: "ACTION REQUIRED"
- Headline: "Report **Operational Issue**" ("Operational Issue" in accent/purple color)
- Subtext: "Provide detailed information about the crisis or logistical barrier. Your submission triggers the AI triage system for immediate resource allocation."

**Form (single card, rounded, dark border):**
- Row 1 (2 cols):
  - PROBLEM TITLE — text input — placeholder: "Brief summary of the situation"
  - CATEGORY — dropdown — options: Infrastructure, Environment, Public Safety, Health & Welfare, Emergency Response, Other
- Row 2 (2 cols):
  - INCIDENT LOCATION — text input — placeholder: "Enter coordinates or address"
  - URGENCY LEVEL — radio group: Low / Medium / High
- Row 3 (full width):
  - DETAILED DESCRIPTION — textarea (5 rows) — placeholder: "Elaborate on the specific needs, number of affected individuals, and current status..."
- Form Footer:
  - Info pill: ℹ️ "Submission will be broadcasted to nearby verified responders."
  - CANCEL button (ghost) + REPORT ISSUE button (filled purple)

**On Form Submit:**
1. Validate all fields are filled
2. Send `{ title, category, location, urgency, description, reportedBy: uid, createdAt, status: "pending" }` to Firestore `/issues`
3. Call Gemini API with the issue details (see Section 5 for AI spec)
4. Gemini returns `{ suggestedCategory, suggestedPriority, bestVolunteerMatchUid }` 
5. Update the Firestore issue document with Gemini's analysis fields
6. Show success toast: "Issue reported. AI triage in progress."
7. Redirect to `/dashboard`

**Below Form — Three Feature Cards (horizontal):**
| Icon | Title | Description |
|---|---|---|
| ⚡ | Instant Triage | AI analysis prioritizes submissions based on keywords and location proximity. |
| 🛡️ | Verified Only | Issues are routed only to vetted NGO personnel and government agents. |
| 🕐 | Live Tracking | Monitor resolution status in real-time through your personal dashboard. |

**Sidebar:** Same as Dashboard sidebar. URGENT BROADCAST button visible.

---

### 4.4 Page: Volunteer Portal (`/volunteer`) — Both Roles

**Purpose:** For volunteers to manage their profile and view/accept AI-matched missions. For coordinators, shows full volunteer list and profile manager.

**When accessed by a Volunteer (own profile view):**

**Header area:**
- Cover banner (dark gradient area at top)
- Avatar image (placeholder icon or initial circle)
- Name (from Firestore)
- Location (city, state — from profile)
- "ACTIVE RESPONDER" status badge (green)
- Edit Profile button (opens inline edit mode)

**Left Panel — Complete Profile Card:**
- Title: "Complete Profile"
- Subtext: "Unlock more critical tasks by finalizing your volunteer credentials."
- Fields: EMAIL ADDRESS (pre-filled, editable), PHONE (editable text input)
- "Update Information" button (saves to Firestore `/users/{uid}`)
- Purple left-border accent on this card

**Left Panel — Specializations Card (below):**
- Title: "Specializations" + shield icon
- 4 checkbox items with icons:
  - 🏥 Medical Response
  - 🚛 Logistics & Supply
  - 🎓 Teaching & Mentorship
  - 🍽️ Food Preparation
- "VIEW ALL 12 SKILLS ∨" expandable link (on click, shows 8 more generic skill options)
- Checked skills are saved to `skills[]` array in Firestore `/users/{uid}`

**Right Panel — Available Missions:**
- Title: "Available Missions"
- Subtitle: "Real-time opportunities matching your profile in **[City]**" (city in purple/accent)
- Toggle: List View | Map View (Map View links to `/map`)
- Mission cards (pull from Firestore `/issues` where `status == "pending"` ordered by relevance):
  - Each card shows: thumbnail image area (category icon), urgency badge (URGENT/MATCHING SKILLS/RECOMMENDED), timing info, mission title, description (truncated), skill tags, action button
  - URGENT missions: red left border, "Apply for Task" CTA (purple)
  - MATCHING SKILLS missions: purple left border, "I'm Available" CTA (ghost)
  - RECOMMENDED missions: no border, "I'm Available" CTA (ghost)
- On "Apply for Task" / "I'm Available" click: update issue `status` to "assigned", set `assignedTo: uid` in Firestore. Show toast "You've been assigned to this mission."

**Mission Matching Logic (frontend):**
- Pull volunteer's `skills[]` from Firestore
- Pull all `pending` issues
- Sort: issues where `suggestedCategory` overlaps with volunteer's skills appear first
- Secondary sort: issues with `urgency == "high"` float to top

**When accessed by a Coordinator:**
- Shows a searchable list of all volunteers (from Firestore `/users` where `role == "volunteer"`)
- Each row: avatar, name, location, skills tags, availability status, "View Profile" button
- Clicking "View Profile" opens a drawer/modal with the volunteer's full profile and their assigned missions

---

### 4.5 Page: AI Insights (`/ai-insights`) — Coordinator Only

**Purpose:** Shows Gemini AI's live analysis, recommendations, and predictive intelligence for the current most critical issue.

**Page Header:**
- Small label: "PREDICTIVE INTELLIGENCE ENGINE"
- Headline: "Gemini AI Insights: **Smart Resource Allocation**" (second line in muted/gray color)

**Main Card — Gemini Intelligence Report:**
- Header: Gemini logo/sparkle icon + "Gemini Intelligence Report"
- Left section:
  - SUGGESTED PRIORITY — badge (Urgent/High/Medium/Low based on Gemini response)
  - Reason text: "due to high volume in [area]"
  - SUGGESTED CATEGORY — bold text (e.g., "Emergency Response")
- Right section — BEST VOLUNTEER MATCH:
  - Volunteer avatar + name + skill label + distance ("2km away")
  - "Dispatch Request" button — on click: updates the issue's `status` to "assigned", sets `assignedTo` to the matched volunteer's uid, shows success toast
- Bottom: "Real-time Data Synthesis..." label + purple progress bar + "94% Accuracy" label (static mock for MVP)
- Left border: purple/gradient accent

**Bottom Row — Two Cards:**
1. **Impact Forecast (left):**
   - Header: bar chart icon + "Impact Forecast" + "LIVE" badge
   - Text: "Estimated recovery time in [area] reduced by [X] hours with suggested deployment."
   - Bar chart: 5 bars showing increasing response efficiency (use mock data for MVP, static chart)

2. **Sentiment Analysis (right):**
   - Header: question circle icon + "Sentiment Analysis" + "GPT-4V" badge (relabeled to "Gemini" in implementation)
   - Text: "Community feedback trending positive in areas with [volunteer type] presence."
   - Score display: large number (e.g., "8.4") + "Average Satisfaction Index score"

**Right Sidebar — Three Sections:**
1. **Network Health:**
   - Title: "NETWORK HEALTH" (small caps)
   - Row: 🟢 Active Volunteers — count from Firestore
   - Row: 🟣 AI Nodes — "Online" (static)
   - Row: 🔴 Open Tickets — count of issues where `status == "pending"` + "Critical" label

2. **Active Map Thumbnail:**
   - Small dark map thumbnail
   - "ACTIVE MAP" label + location name (e.g., "Sector 4 Surveillance")
   - External link icon → links to `/map`

3. **AI Assistant Pro (upgrade card):**
   - Rocket icon + "AI Assistant Pro"
   - Text: "Unlock advanced multi-modal analysis for disaster zone imagery and drone feeds."
   - "Upgrade Workspace" button (full width, pink/purple gradient) — non-functional in MVP, shows "Coming Soon" toast

**Data Flow for AI Insights Page:**
- On page load: pull the latest unresolved `high` urgency issue from Firestore
- Pull all volunteer users from Firestore
- Send to Gemini: issue details + list of volunteers with their skills and locations
- Gemini returns: `{ suggestedPriority, suggestedCategory, bestVolunteerMatchUid, forecastText, sentimentText }`
- Render response in the page cards
- Cache Gemini response for 60 seconds to avoid redundant API calls

---

### 4.6 Page: Map View (`/map`) — Coordinator Only

**Purpose:** Geographic visualization of all active incidents. Coordinators can filter, inspect, and assign volunteers directly from the map.

**Layout:** Full-screen map with overlaid left panel and bottom bar.

**Left Panel (fixed, scrollable):**

Section 1 — Map Explorer:
- Title: "Map Explorer" (in accent/purple color)
- Search input with 🔍 icon — placeholder: "Search address..." (Google Places Autocomplete)

Section 2 — Filter Categories:
- Label: "FILTER CATEGORIES" (small caps)
- 4 filter pills with issue counts (live from Firestore):
  - 🏥 Health & Med — count badge
  - 🍽️ Food Supply — count badge
  - 🏠 Shelter — count badge
  - ⚡ Infrastructure — count badge
- Active filter = highlighted/filled pill
- Multiple filters can be active simultaneously

Section 3 — Urgency Level:
- Label: "URGENCY LEVEL" (small caps)
- Pills: 🔴 High, 🟡 Medium, 🟣 Low, ✓ All
- Default: All selected

Section 4 — Live Volunteers:
- Label: "LIVE VOLUNTEERS" (small caps)
- Scrollable list of volunteers with `availabilityStatus == "available"`
- Each item: avatar + name + skill subtitle + distance to nearest incident

**Map Area (center/right, full remaining width):**
- Google Maps JavaScript API
- Map style: dark mode (use Google Maps dark style JSON)
- Drop pins for each issue from Firestore:
  - Pin color: red = high urgency, yellow = medium, blue = low
  - Pin icon = category icon overlaid
- On pin click: popup card appears over map with:
  - "URGENT PRIORITY" / priority label badge
  - Issue title (bold)
  - Issue description (2 lines)
  - LOCATION section: 📍 + address string
  - "Assign Volunteer" button (pink/purple, full width) — opens a modal to select a volunteer from available list and assigns them (updates Firestore)

**Right Controls (floating, right edge):**
- 🎯 Re-center button
- ➕ Zoom in
- ➖ Zoom out
- 🗂️ Layer toggle (UI only — not functional in MVP)

**Bottom Status Bar (fixed):**
- 🔴 pulsing dot + "X ACTIVE EMERGENCIES" (count of high urgency pending issues)
- 👥 "X Volunteers Online" (count of available volunteers)
- "Export View" button (ghost — downloads a CSV of current filtered issues from Firestore)
- "Focus Hotspots" button (purple — auto-pans and zooms map to the area with the most incident pins)

---

## 5. AI Integration Specification (Gemini)

### 5.1 Gemini API Usage Points

**Point A — Issue Triage (triggered on Report Issue form submit):**

Prompt template:
```
You are an AI triage system for an NGO command center.

An issue has been reported with these details:
- Title: {title}
- Category selected by reporter: {category}
- Location: {location}
- Urgency selected by reporter: {urgency}
- Description: {description}

Based on this information:
1. Confirm or correct the category. Options: Infrastructure, Environment, Public Safety, Health & Welfare, Emergency Response.
2. Confirm or escalate the urgency. Options: low, medium, high, urgent.
3. Provide a 1-sentence reason for your urgency decision.

Respond ONLY in this JSON format:
{
  "suggestedCategory": "",
  "suggestedPriority": "",
  "priorityReason": ""
}
```

**Point B — Volunteer Matching (triggered on AI Insights page load):**

Prompt template:
```
You are a volunteer dispatch AI for an NGO command center.

The most critical unresolved issue is:
- Title: {title}
- Category: {suggestedCategory}
- Location: {location}
- Priority: {suggestedPriority}
- Description: {description}

Available volunteers:
{volunteersJSON} 
(array of { uid, name, skills[], location })

Task:
1. Select the single best volunteer match based on skills and proximity.
2. Generate a 1-sentence impact forecast for resolving this issue with suggested volunteer.
3. Generate a 1-sentence community sentiment observation.

Respond ONLY in this JSON format:
{
  "bestVolunteerMatchUid": "",
  "bestVolunteerMatchName": "",
  "bestVolunteerMatchSkill": "",
  "forecastText": "",
  "sentimentText": "",
  "satisfactionScore": 0.0
}
```

### 5.2 Error Handling for AI
- If Gemini API returns an error or invalid JSON: fall back to reporter's original category and urgency values
- Show no error to the user — fail silently and use reporter-provided values
- Log errors to browser console only

### 5.3 API Key Security
- Gemini API key stored in `.env.local` as `GEMINI_API_KEY`
- All Gemini calls made from Next.js API routes (server-side), never from client
- API routes: `POST /api/triage` and `POST /api/insights`

---

## 6. Firestore Data Schema

### Collection: `/users/{uid}`
```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "role": "coordinator | volunteer",
  "phone": "string",
  "location": "string",
  "skills": ["Medical Response", "Food Preparation"],
  "availabilityStatus": "available | busy | offline",
  "createdAt": "timestamp"
}
```

### Collection: `/issues/{issueId}`
```json
{
  "issueId": "string (auto-id)",
  "title": "string",
  "category": "string",
  "location": "string",
  "coordinates": { "lat": 0.0, "lng": 0.0 },
  "urgency": "low | medium | high",
  "description": "string",
  "status": "pending | assigned | completed",
  "reportedBy": "uid",
  "assignedTo": "uid | null",
  "suggestedCategory": "string (Gemini output)",
  "suggestedPriority": "string (Gemini output)",
  "priorityReason": "string (Gemini output)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: `/broadcasts/{broadcastId}`
```json
{
  "message": "string",
  "sentBy": "uid",
  "sentAt": "timestamp"
}
```

---

## 7. Navigation & Routing

| Route | Page | Access |
|---|---|---|
| `/` | Redirect to `/login` | Public |
| `/login` | Login page | Public |
| `/signup` | Signup page | Public |
| `/dashboard` | Dashboard | Coordinator only |
| `/report` | Report Issue | Both roles |
| `/volunteer` | Volunteer Portal | Both roles |
| `/ai-insights` | AI Insights | Coordinator only |
| `/map` | Map View | Coordinator only |

---

## 8. Non-Functional Requirements

- **Performance:** Dashboard stat cards load within 2 seconds of page mount using Firestore real-time listeners (`onSnapshot`)
- **Real-time updates:** Dashboard and Map View use Firestore `onSnapshot` for live data. No manual refresh needed.
- **Responsiveness:** All pages must be functional on screens 1280px and above. Mobile optimization is out of MVP scope.
- **Security:** Firestore rules must restrict: volunteers can only read/write their own `/users/{uid}` doc. Only coordinators can write to `/issues` status field.
- **Error states:** All data-fetching components must handle and display empty states (no issues yet, no volunteers yet)

---

## 9. Out of MVP Scope (Future Versions)
- Mobile app (Flutter)
- SMS/WhatsApp integration for issue intake
- Real-time push notifications (browser notifications)
- Multi-language support
- Offline mode / PWA
- Advanced analytics and reporting exports (beyond CSV)
- Photo/file attachments on issue reports
- Drone feed / multimodal AI analysis

---

## 10. Success Metrics (MVP)
- Coordinator can log an issue and receive AI triage in under 10 seconds
- Volunteer matching suggestion appears on AI Insights page within 5 seconds
- All 6 pages render without errors on Vercel production deployment
- Firestore real-time sync reflects issue status changes within 3 seconds across browser tabs
