# VolunteerIQ — Demo Guide

A complete walkthrough for judges, evaluators, and first-time users of the VolunteerIQ platform.

---

## 🔑 Demo Credentials

> **Note for judges:** Use these pre-seeded accounts on the live demo deployment. All data shown is sample data — no real NGO or volunteer information.

### NGO Coordinator Account

| Field | Value |
|---|---|
| **Email** | `coordinator@demo.volunteeriq.app` |
| **Password** | `Demo@2026!` |
| **Role** | NGO Coordinator |
| **Access** | Dashboard, AI Insights, Map, Report Issue, Volunteer Portal, Settings |

### Volunteer Accounts

| Name | Email | Password | Skills | Location |
|---|---|---|---|---|
| Priya Sharma | `priya@demo.volunteeriq.app` | `Demo@2026!` | Medical Response, Mental Health Support | Delhi, India |
| Rahul Mehta | `rahul@demo.volunteeriq.app` | `Demo@2026!` | Construction & Repair, Logistics & Supply | Delhi, India |
| Ananya Iyer | `ananya@demo.volunteeriq.app` | `Demo@2026!` | Food Preparation, Teaching & Mentorship | Mumbai, India |

> If the above accounts are unavailable on your deployment, create your own using the signup flow described below.

---

## 🎬 Demo Walkthrough

### Step 1 — Landing Page

**URL:** `https://your-deployment.vercel.app/`

**What to show:**
- The **3D animated hero section** — a particle network visualizing the VolunteerIQ coordination mesh
- Smooth scroll to the **Features section** — AI Triage, WhatsApp Dispatch, Real-Time Map
- The **How It Works** timeline — Issue Reported → AI Analyzes → Volunteer Matched → Mission Deployed
- Glassmorphism design and Framer Motion micro-animations throughout

**Talking point:** *"This is the public-facing landing page that explains VolunteerIQ's value prop. NGO coordinators sign up, volunteers sign up — and immediately they're brought into a role-specific experience."*

---

### Step 2 — Coordinator Login & Dashboard

**URL:** `/login` → Login as Coordinator

**What to show after login:**
- Auto-redirect to `/dashboard`
- **4 live stat cards:** Total Issues, Pending Action, Currently Assigned, Completed Tasks — all powered by Firestore `onSnapshot` (real-time, no manual refresh)
- **Impact Distribution chart** — horizontal bars showing issues by category (Infrastructure, Environment, Public Safety, Health & Welfare)
- **Recent Submissions table** — click any row to open the Issue Detail Modal
- **Issue Detail Modal** — shows full issue details, AI triage result (suggested category + priority + reason), and the "Assign & Dispatch" button

**Talking point:** *"This is the coordinator's command center. Everything updates in real-time — if a volunteer accepts a mission in another tab, the status changes here within 3 seconds."*

---

### Step 3 — Report an Issue (with AI Triage)

**URL:** `/report`

**Demo script:**

1. Fill in the form:
   - **Problem Title:** `Flooding near main road blocking ambulance access`
   - **Category:** `Emergency Response`
   - **Incident Location:** `Sector 7, Delhi`
   - **Urgency Level:** `Medium`
   - **Detailed Description:** `Heavy rainfall has caused severe flooding on the main artery road near Sector 7. An ambulance was unable to reach a patient due to blocked roads. At least 500 residents are stranded. Local drainage systems are overwhelmed.`

2. Click **"Report Issue"**

3. Show the **success toast:** *"Issue reported. AI triage in progress."*

4. Navigate to `/dashboard` → the new issue appears in "Recent Submissions"

5. Click the issue row → **Issue Detail Modal** → note the AI-enhanced fields:
   - `Suggested Category: Emergency Response` ✓
   - `Suggested Priority: urgent` ← Gemini escalated from Medium to Urgent
   - `Priority Reason: Flooding blocking ambulance access constitutes an urgent life-safety emergency...`

**Talking point:** *"The coordinator selected 'Medium' urgency — but Gemini recognized the life-safety implications and escalated it to 'Urgent' automatically. This is the AI triage working in real-time."*

---

### Step 4 — AI Insights & Volunteer Matching

**URL:** `/ai-insights`

**What to show:**
1. Page loads and automatically calls Gemini with the most critical unresolved issue
2. **Gemini Intelligence Report card** appears with:
   - `Suggested Priority: URGENT`
   - `Suggested Category: Emergency Response`
   - **Best Volunteer Match:** Priya Sharma — Medical Response — `< 5km away`
   - `94% Accuracy` label (static display for MVP)
3. **Impact Forecast card** — "Deploying Priya Sharma is estimated to restore road access within 2 hours..."
4. **Sentiment Analysis card** — Average Satisfaction Score: 8.7
5. **Network Health sidebar** — shows live counts: Active Volunteers, Open Tickets
6. Click **"Dispatch Request"** button → opens the **Phone Modal**

**Phone Modal flow:**
- Shows volunteer name and phone number
- "Open WhatsApp" button → generates `wa.me` deep link
- Click it → WhatsApp opens (on mobile) or WhatsApp Web opens (on desktop) with pre-filled mission details message

**Talking point:** *"This is the full pipeline — from raw field report, to AI analysis, to one-click volunteer dispatch via WhatsApp. No verbal coordination, no manual matching. The AI handles it all."*

---

### Step 5 — Interactive Incident Map

**URL:** `/map`

**What to show:**
1. **Dark-mode CartoDB map** with colored pins for each open issue:
   - 🔴 Red pins = High/Urgent urgency
   - 🟡 Yellow pins = Medium urgency
   - 🔵 Blue/Indigo pins = Low urgency
2. Click a **red pin** → popup card appears with issue title, description, location, urgency badge, and "Assign Volunteer" button
3. **Filter panel (left)** — filter by category (Health & Med, Food Supply, Shelter, Infrastructure) and urgency level
4. **Live Volunteers list** — shows available volunteers with their proximity to nearest incident
5. **Bottom status bar** — "X Active Emergencies" pulsing dot, "X Volunteers Online"
6. Click **"Focus Hotspots"** — map auto-pans to the densest cluster of incidents

**Talking point:** *"Coordinators get a geographic overview of all active crises. They can filter by type and urgency, click any incident to investigate, and assign volunteers directly from the map."*

---

### Step 6 — Volunteer Portal

**Step 6a — As a Volunteer**

1. Open a new browser tab in **incognito mode**
2. Log in as `priya@demo.volunteeriq.app` → redirected to `/volunteer`
3. **Show:** profile card, skills checklist (Medical Response checked), availability status badge
4. **Available Missions list** — shows pending issues sorted by skill match:
   - URGENT missions with red border
   - MATCHING SKILLS missions with purple border
5. Click **"Apply for Task"** on an URGENT mission → Firestore updates `status: "assigned"`, toast appears: *"You've been assigned to this mission."*
6. Switch to the coordinator tab → dashboard stat card "Currently Assigned" increments in real-time

**Step 6b — As a Coordinator viewing volunteers**

1. Log in as coordinator → go to `/volunteer`
2. Shows a **searchable volunteer roster** — all registered volunteers with skills, location, availability
3. Click **"View Profile"** → drawer opens with full volunteer profile and assigned missions

**Talking point:** *"Volunteers see a curated list of missions matching their skills. Coordinators see the entire volunteer roster. The AI pre-sorts missions so volunteers always see the most relevant ones first."*

---

### Step 7 — Urgent Broadcast

**From any authenticated page:**

1. Click the **"URGENT BROADCAST"** button at the bottom of the sidebar
2. Type a broadcast message: `⚡ All available volunteers: Major flooding in Sector 7. Report to coordination point immediately.`
3. Click **"Send Broadcast"** → saved to Firestore `/broadcasts`

**Talking point:** *"In a real crisis, coordinators can push an urgent message to all volunteers instantly — no WhatsApp groups, no phone calls."*

---

### Step 8 — Settings

**URL:** `/settings`

**Coordinator Settings:**
- Organization name, contact info
- Dashboard preferences (default map city, issues per page, auto-refresh toggle)
- Notification preferences

**Volunteer Settings:**
- Profile info, bio, phone number update
- Mission preferences (preferred types, max distance, hours/week)
- Availability status toggle

---

## 📊 Key Metrics to Highlight

| Metric | Value |
|---|---|
| Issue-to-AI-triage latency | < 3 seconds |
| AI volunteer match latency | < 5 seconds |
| Dashboard real-time sync | < 3 seconds (Firestore `onSnapshot`) |
| WhatsApp dispatch | 1-click — no WhatsApp Business API required |
| Maps cost | $0 — Leaflet + OpenStreetMap (no API key) |
| Deployment cost | $0 — Vercel free tier + Firebase free tier |

---

## 🌐 UN SDG Alignment

VolunteerIQ directly supports:

| SDG | Alignment |
|---|---|
| **SDG 3** — Good Health and Well-Being | Faster emergency medical response matching |
| **SDG 10** — Reduced Inequalities | Ensures resource allocation reaches underserved communities |
| **SDG 11** — Sustainable Cities and Communities | Infrastructure and disaster response coordination |
| **SDG 17** — Partnerships for the Goals | Digital platform enabling NGO-volunteer partnerships at scale |

---

## 💡 Talking Points for Q&A

**"How does the AI matching work?"**
> Gemini analyzes the issue's category and location, then evaluates all available volunteers' skills and proximity. It selects the single best match based on skill overlap and geographic distance. If Gemini fails or returns an invalid response, the system falls back to a local scoring algorithm — so it never breaks.

**"Why WhatsApp instead of push notifications?"**
> WhatsApp has 500 million+ users in India and is already the primary communication tool for NGO field workers. We use standard `wa.me` deep links — no WhatsApp Business API approval, no cost, works on any device.

**"Why Leaflet instead of Google Maps?"**
> Google Maps JavaScript API has significant per-request billing. For an NGO platform meant to be free and forkable, Leaflet + OpenStreetMap provides equivalent geographic functionality at zero cost with no API key requirement.

**"How does it scale?"**
> The entire backend is serverless (Next.js API routes on Vercel). Firestore scales automatically. The only scaling concern is Gemini API rate limits, which we address with automatic key rotation across multiple free-tier API keys.

**"Is the data real?"**
> The demo uses seed data. In production, real NGO staff would create accounts, real volunteers would register with their actual skills and locations, and real community issues would flow through the system.
