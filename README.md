# VolunteerIQ 🧠⚡

> **AI-powered NGO command center** — intelligently triage community issues, match the right volunteers by skill and location, and dispatch missions via WhatsApp in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 📖 Overview

NGOs and emergency coordinators waste critical hours manually sorting incoming reports, figuring out which volunteer to call, and chasing responses over phone. During a crisis, that delay costs lives.

**VolunteerIQ** solves this by automating the entire intake-to-dispatch pipeline:

- Community members **report issues** (accidents, food shortages, infrastructure failures, public safety threats)
- **Gemini AI** instantly **triages** each report — validating the category, escalating priority, and explaining why
- Coordinators use the **AI Insights engine** to get an instant match recommendation — the single best volunteer based on skills, location, and availability
- A **WhatsApp deep-link** is generated so the coordinator can send a pre-formatted dispatch message in one tap — no Twilio required

---

## ✨ Features

### 🤖 AI-Powered Triage
- On every issue submission, a **Gemini 2.0 Flash** call validates and corrects the reporter's category and urgency
- Returns `suggestedCategory`, `suggestedPriority`, and a human-readable `priorityReason`
- Built-in **API key rotation** across up to 5 keys to handle free-tier quotas gracefully

### 🎯 Intelligent Volunteer Matching
- The AI Insights page runs a **two-stage matching pipeline**:
  1. **Local scorer** — ranks all volunteers by skill-to-category relevance + string-based proximity distance; guaranteed to always return a result
  2. **Gemini reasoning layer** — receives the full volunteer list, issue details, and priority context; selects the single best candidate with a rationale
- If Gemini returns an invalid/empty UID, the local match patches it automatically (zero failure states)
- Supports **12 skill domains**: Medical Response, Emergency Response, Logistics, Food Preparation, Construction, Mental Health, Legal Aid, IT Support, Teaching, Translation, Childcare, Elder Care

### 📡 Real-time Data (Firebase Firestore)
- Dashboard, volunteer list, and issue feeds use **Firestore `onSnapshot`** listeners — content updates without refreshing
- Animated stat counters (eased cubic animation) on the coordinator dashboard

### 🗺️ Interactive Incident Map
- **Leaflet.js + OpenStreetMap** — fully free, no Google Maps API key needed
- Coordinators see all reported incidents as map markers, filterable by category and urgency level
- Issues are **geocoded at submission time** via Nominatim (OSM free geocoding)
- Embedded mini-map on the dashboard for a quick geographic overview

### 📋 Issue Feed with Status Lifecycle
Full paginated issue feed on `/report` with:
- **Status filtering**: Open → In Progress → Volunteers Assigned → Closed
- Coordinator status management inline (no separate screen)
- Paginated with Firestore cursors (no over-fetching)
- Relative timestamps using `date-fns`

### 📱 WhatsApp Dispatch (wa.me Links)
- After the AI selects a volunteer, one click generates a `wa.me` deep-link with the **full mission briefing pre-filled**
- Works with any WhatsApp number — no sandbox, no Twilio account, no opt-in required
- Dispatch message includes: mission title, location, priority, category, description snippet, and ticket number
- On acceptance, a **confirmation link** is generated to notify the assigned volunteer

### 🔐 Role-Based Auth & Route Protection
Two distinct roles with hard middleware guards:

| Role | Access |
|---|---|
| **Coordinator** | Dashboard, AI Insights, Map, Issue Management, Volunteer Network |
| **Volunteer** | Personal dashboard, Mission feed, Profile management |

Middleware reads `viq_uid` / `viq_role` cookies — no server-side session overhead.

### 📞 Phone Number Collection on Signup
- A **PhoneModal** appears after account creation
- Searchable country dropdown with flags + dial codes (29 countries pre-loaded)
- Stores number in E.164 format (`+91XXXXXXXXXX`) to Firestore

### ⚙️ Role-Specific Settings
- **Coordinators**: organization profile, dashboard preferences (default city, issues per page, auto-refresh)
- **Volunteers**: bio, preferred mission types, max distance, hours per week, notification preferences

---

## 🧠 How It Works

```
1. REPORT
   └─ Community member submits issue (title, category, location, urgency, description)
   └─ Nominatim geocodes the location → lat/lng stored in Firestore
   └─ POST /api/triage → Gemini validates category + escalates priority

2. TRIAGE (Gemini)
   └─ Prompt includes: title, category, location, urgency, description
   └─ Returns: suggestedCategory, suggestedPriority, priorityReason
   └─ Issue stored in Firestore with AI fields attached

3. INSIGHTS (Coordinator Action)
   └─ Coordinator picks an issue from the AI Insights selector
   └─ POST /api/insights → fetches all volunteers (single Firestore query)
   └─ Local scorer ranks by: skill match score (0–10) + proximity label
   └─ Gemini receives ranked list → selects #1 with forecast + sentiment
   └─ If Gemini UID is invalid/empty → local best match patches the result

4. DISPATCH
   └─ Coordinator clicks "Dispatch Request"
   └─ POST /api/dispatch-volunteer → builds wa.me link with pre-filled message
   └─ Coordinator clicks "Open WhatsApp" → sends dispatch from their own phone
   └─ Marks response as Accepted → POST /api/dispatch-response
   └─ Issue status → "assigned" in Firestore
   └─ Confirmation wa.me link generated for the assigned volunteer
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Vanilla CSS (custom dark design system with CSS variables) |
| **Icons** | Lucide React |
| **Auth** | Firebase Authentication (email/password) |
| **Database** | Firebase Firestore (real-time listeners) |
| **Backend** | Firebase Admin SDK (server-side API routes) |
| **AI** | Google Gemini 2.0 Flash Lite via `@google/generative-ai` |
| **Maps** | Leaflet.js + React-Leaflet + OpenStreetMap (CartoDb dark tiles) |
| **Geocoding** | Nominatim (OSM) — free, no API key |
| **WhatsApp** | wa.me deep-links (no SDK, no credentials) |
| **Date formatting** | date-fns |
| **Deployment** | Vercel (recommended) |

---

## 📁 Project Structure

```
client/
├── app/
│   ├── ai-insights/        # 3-step AI workflow: select → generate → dispatch
│   ├── api/
│   │   ├── dispatch-response/   # Accept/reject a volunteer assignment
│   │   ├── dispatch-volunteer/  # Build wa.me dispatch link + save to Firestore
│   │   ├── insights/            # Gemini volunteer matching engine
│   │   ├── notify-volunteers/   # Generate wa.me bulk notification links
│   │   └── triage/              # Gemini AI triage on issue submission
│   ├── dashboard/          # Coordinator real-time overview + mini map
│   ├── login/ signup/      # Auth pages with PhoneModal on signup
│   ├── map/                # Full-page interactive Leaflet map + filters
│   ├── report/             # Issue submission + paginated issue feed
│   ├── settings/
│   │   ├── coordinator/    # Org profile, dashboard preferences
│   │   └── volunteer/      # Bio, mission types, availability preferences
│   └── volunteer/          # Role-aware: Volunteer dashboard OR Coordinator network view
│
├── components/
│   ├── AppShell.tsx        # Layout wrapper with auth + role guard
│   ├── BroadcastModal.tsx  # Coordinator mass-message modal
│   ├── IssueDetailModal.tsx # Issue detail slide-over
│   ├── LeafletMapComponent.tsx # Core Leaflet map with markers
│   ├── MapWrapper.tsx      # SSR-safe dynamic import wrapper
│   ├── Navbar.tsx          # Top navigation bar
│   ├── PhoneModal.tsx      # Country flag + phone number collection
│   └── Sidebar.tsx         # Role-based navigation sidebar
│
├── lib/
│   ├── auth-context.tsx    # Firebase auth state + signUp/signIn/logOut
│   ├── firebase.ts         # Client-side Firebase init
│   ├── firebase-admin.ts   # Server-side Admin SDK init
│   ├── gemini.ts           # Gemini client with multi-key rotation
│   ├── toast-context.tsx   # Global toast notification system
│   ├── types.ts            # Shared TypeScript interfaces + constants
│   └── whatsapp.ts         # wa.me link builder utility
│
├── middleware.ts            # Cookie-based role guards for all routes
└── .env.local.example      # Environment variable template
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- A Gemini API key ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 1. Clone the repository

```bash
git clone https://github.com/moin-dbud/VolunteerIQ.git
cd VolunteerIQ/client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` (see [Environment Variables](#-environment-variables) below).

### 4. Set up Firebase

1. Create a Firestore database in **Native mode**
2. Enable **Email/Password** authentication
3. Download a **service account key** (Project Settings → Service Accounts → Generate new private key)
4. Set Firestore rules to allow authenticated reads/writes

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```env
# Firebase Client SDK (safe to use in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-side only — never expose to client)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Gemini AI — https://aistudio.google.com/apikey
GEMINI_API_KEY=
# Optional: add up to 5 keys for automatic rotation on quota exhaustion
GEMINI_API_KEY_2=

# App URL (used in wa.me message links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note:** Google Maps has been replaced with **Leaflet.js + OpenStreetMap**. No Maps API key is required. Leaflet uses free CartoDb dark tiles.

---

## 🎥 Demo Flow

### Volunteer Signup
1. Sign up with role **Volunteer**
2. Phone modal appears — select country flag, enter mobile number
3. Redirected to volunteer dashboard showing real-time pending missions

### Issue Reporting
1. Log in as a **Coordinator**
2. Navigate to `/report` → fill in issue title, category, location, urgency, and description
3. Submit → Gemini AI automatically re-classifies category and escalates priority if needed
4. Issue appears on the dashboard, map, and feed instantly

### AI Dispatch Workflow
1. Go to **AI Insights** (`/ai-insights`)
2. Select an open issue from the dropdown
3. Click **Generate Intelligence Report** → Gemini analyzes the issue and all available volunteers
4. Report shows: best volunteer match (name, skill, proximity), impact forecast, sentiment score
5. Click **Dispatch Request** → pre-built WhatsApp message is ready
6. Click **Open WhatsApp** → message opens in WhatsApp app, pre-filled with full mission briefing
7. After the volunteer responds, mark **Accepted** → issue status updates to `assigned`
8. Click **Send Confirmation via WhatsApp** → confirmation message sent to volunteer

### Map View
1. Navigate to `/map`
2. See all reported issues as markers on the dark map
3. Filter by category (Health, Food, Infrastructure, Safety, Emergency) or urgency level
4. Click a marker to view issue details and update status

---

## 📊 Future Improvements

- **Real-time volunteer GPS tracking** — show volunteer locations on the coordinator map
- **Push notifications** — browser/PWA push for new issue alerts to volunteers
- **Multi-language support** — Gemini-powered translation for non-English issue reports
- **Issue analytics dashboard** — resolution time trends, category heatmaps, volunteer performance
- **Volunteer availability calendar** — volunteers set recurring available hours
- **WhatsApp Business API** — upgrade from wa.me links to fully automated server-sent messages (requires Meta approval)
- **Clustering on map** — group nearby markers at low zoom levels
- **Firestore offline persistence** — allow coordinators to work without internet

---

## 👨‍💻 Author

**Moin Sheikh**

Built for hackathon use — demonstrating real-world AI integration for social good.

> *VolunteerIQ proves that AI isn't just for tech companies — it can save lives when it helps the right volunteer reach the right place at the right time.*

---

## 📄 License

MIT — free to use, modify, and distribute.
