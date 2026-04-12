# VolunteerIQ — System Architecture

> **Google Solution Challenge 2026** | Team DeepCraft

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Tech Stack Rationale](#3-tech-stack-rationale)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture (API Routes)](#5-backend-architecture-api-routes)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Firestore Data Schema](#7-firestore-data-schema)
8. [AI Integration (Gemini)](#8-ai-integration-gemini)
9. [WhatsApp Dispatch Pipeline](#9-whatsapp-dispatch-pipeline)
10. [Map Architecture](#10-map-architecture)
11. [Data Flow Diagrams](#11-data-flow-diagrams)
12. [Security Model](#12-security-model)
13. [Performance Considerations](#13-performance-considerations)
14. [Deployment Architecture](#14-deployment-architecture)

---

## 1. System Overview

VolunteerIQ is a **serverless, full-stack web application** built on Next.js 14. It operates as a command center for NGO coordinators and a mission portal for volunteers.

The system has three primary flows:

| Flow | Actor | Path |
|---|---|---|
| **Issue Intake + Triage** | Volunteer / Coordinator | Form → API → Gemini → Firestore → WhatsApp alerts |
| **AI Volunteer Matching** | Coordinator | AI Insights page → API → Gemini → Firestore dispatch |
| **Real-Time Monitoring** | Coordinator | Dashboard / Map → Firestore `onSnapshot` |

There is **no separate backend server**. All server-side logic runs as Next.js API Route handlers (Node.js serverless functions deployed on Vercel).

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Landing /   │  │  Dashboard   │  │  Volunteer Portal    │  │
│  │  Auth Pages  │  │  AI Insights │  │  Report Issue / Map  │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬────────────┘  │
│         │                 │                     │               │
│         │    Firebase Auth SDK (client)          │               │
│         │    Firestore onSnapshot (client)       │               │
│         └─────────────────┴─────────────────────┘               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NEXT.JS ON VERCEL (Edge/Node)                  │
│                                                                 │
│  middleware.ts — cookie-based route guard (viq_uid, viq_role)   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  POST /api/triage │  │ POST /api/insights│  │POST /api/    │  │
│  │  (Gemini triage) │  │ (Gemini matching) │  │dispatch-*    │  │
│  └────────┬─────────┘  └────────┬──────────┘  └──────┬───────┘  │
│           │                     │                     │          │
│           └─────────────────────┴─────────────────────┘          │
│                          Firebase Admin SDK                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────────┐
│   GOOGLE FIREBASE        │       │    GOOGLE GEMINI AI          │
│                          │       │                             │
│  Firestore Database      │       │  gemini-2.0-flash-lite      │
│  ├── /users              │       │  (Issue Triage Prompt)      │
│  ├── /issues             │       │  (Volunteer Match Prompt)   │
│  ├── /broadcasts         │       │                             │
│  ├── /dispatches         │       │  Key rotation: up to 5 keys │
│  └── /notifications      │       │                             │
│                          │       └─────────────────────────────┘
│  Firebase Auth           │
│  (Email/Password)        │
└─────────────────────────┘
```

---

## 3. Tech Stack Rationale

| Choice | Rationale |
|---|---|
| **Next.js 14 App Router** | Serverless API routes + SSR/RSC in one framework. No separate Express server needed. |
| **Firebase Firestore** | Real-time `onSnapshot` listeners keep dashboard and map live without polling. Free tier fits NGO use case. |
| **Firebase Auth** | Handles email verification, session persistence, and secure token generation. No custom auth server needed. |
| **Gemini 2.0 Flash Lite** | Highest free-tier quota (30 RPM, 1500 RPD). Fast enough for real-time triage. |
| **Leaflet.js + OpenStreetMap** | Eliminates Google Maps API billing. CartoDB Dark tiles are free and have no key requirement. |
| **WhatsApp `wa.me` links** | No WhatsApp Business API approval needed. Works with any WhatsApp account. Zero cost. |
| **Vercel** | Zero-config Next.js deployment. Environment secrets management. Global CDN. |
| **Tailwind CSS** | Rapid UI development with consistent design tokens. No CSS build step needed beyond PostCSS. |
| **Three.js / R3F** | 3D network visualization on the landing page — high visual impact for the Solution Challenge presentation. |

---

## 4. Frontend Architecture

### 4.1 Page Architecture

```
app/
├── layout.tsx              ← Root layout: AuthProvider + ToastProvider
├── page.tsx               ← Public landing page (no auth required)
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
└── (protected)/            ← All require auth cookie
    ├── dashboard/page.tsx  ← Coordinator only
    ├── report/page.tsx     ← Both roles
    ├── volunteer/page.tsx  ← Both roles
    ├── ai-insights/page.tsx← Coordinator only
    ├── map/page.tsx        ← Coordinator only
    └── settings/page.tsx   ← Both roles (role-specific views)
```

### 4.2 State Management

VolunteerIQ does **not** use Redux or Zustand. State is managed through:

| Mechanism | Used For |
|---|---|
| **React Context** (`AuthContext`) | Current user, role, Firebase Auth state |
| **React Context** (`ToastContext`) | Global toast notifications |
| **Firestore `onSnapshot`** | Live dashboard stats, issues list, volunteer counts |
| **`useState` / `useEffect`** | Local component state, loading indicators |
| **Next.js cookies** | `viq_uid` and `viq_role` for middleware-level route guards |

### 4.3 Component Hierarchy

```
RootLayout (AuthProvider + ToastProvider)
└── AppShell (Sidebar + Navbar)           ← authenticated pages
    ├── Sidebar.tsx                        ← role-aware nav links
    ├── Navbar.tsx                         ← user avatar, search UI
    └── Page Content
        ├── IssueDetailModal.tsx           ← issue details + assign
        ├── BroadcastModal.tsx             ← urgent broadcast composer
        ├── PhoneModal.tsx                 ← WhatsApp dispatch flow
        └── LeafletMapComponent.tsx        ← map (loaded client-only)
```

### 4.4 Auth Flow (Client Side)

```
Firebase Auth.onAuthStateChanged()
  → read Firestore /users/{uid} for role
  → set cookies: viq_uid, viq_role (via document.cookie)
  → update AuthContext: { user, role, loading }
  → middleware uses cookies for edge-level route protection
```

---

## 5. Backend Architecture (API Routes)

All API routes live in `client/app/api/` and run as **Node.js serverless functions** on Vercel.

### Route Summary

| Route | Method | Auth Required | Description |
|---|---|---|---|
| `/api/triage` | POST | No (server-to-server) | AI triage for a new issue |
| `/api/insights` | POST | No (server-to-server) | AI volunteer matching |
| `/api/dispatch-volunteer` | POST | No (server-to-server) | Generate WhatsApp dispatch link |
| `/api/dispatch-response` | POST | No (server-to-server) | Handle ACCEPT/DECLINE response |
| `/api/notify-volunteers` | POST | No (server-to-server) | Broadcast issue to matching volunteers |
| `/api/test-whatsapp` | POST | No | Test WhatsApp link generation |

> **Note on Auth:** API routes in this MVP trust calls from the Next.js client (same origin). Production hardening should add Firebase ID token verification on sensitive routes.

### Error Handling Pattern

All API routes follow this pattern:

```typescript
try {
  // validate input
  // perform Firebase Admin operation
  // call Gemini if needed
  return NextResponse.json({ success: true, ...data });
} catch (err) {
  console.error('[route-name] Error:', err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

---

## 6. Authentication & Authorization

### 6.1 Authentication

Firebase Auth handles user identity. On successful auth:
1. Client receives Firebase `User` object with `uid`
2. Client reads `/users/{uid}` from Firestore to get `role`
3. Client writes `viq_uid` and `viq_role` cookies (accessible to middleware)
4. `AuthContext` exposes `{ user, role, loading }` to all components

### 6.2 Authorization (Route Level)

`middleware.ts` intercepts all non-static requests:

```
Request → middleware.ts
  ├── pathname === '/'  → if uid+role cookie: redirect to role homepage
  ├── PUBLIC route (/login, /signup) → allow
  ├── No uid cookie → redirect to /login?from=<pathname>
  ├── volunteer + COORDINATOR_ONLY route → redirect to /volunteer
  └── coordinator + VOLUNTEER_ONLY route → redirect to /dashboard
```

### 6.3 Authorization (Data Level)

Firestore Security Rules (deploy via Firebase Console or CLI):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own profile; coordinators read all
    match /users/{uid} {
      allow read: if request.auth != null &&
        (request.auth.uid == uid || isCoordinator());
      allow write: if request.auth != null &&
        request.auth.uid == uid;
    }

    // Issues: all authenticated users can read; coordinators write
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && isCoordinator();
    }

    // Broadcasts: coordinators only
    match /broadcasts/{id} {
      allow read, write: if request.auth != null && isCoordinator();
    }

    function isCoordinator() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role == 'coordinator';
    }
  }
}
```

---

## 7. Firestore Data Schema

### Collection: `/users/{uid}`

```typescript
{
  uid: string;
  name: string;
  email: string;
  role: 'coordinator' | 'volunteer';
  phone?: string;                    // Used for WhatsApp dispatch
  location?: string;                 // City/area — used for proximity matching
  organization?: string;
  bio?: string;
  skills?: string[];                 // Skill IDs from SKILL_OPTIONS
  availabilityStatus?: 'available' | 'busy' | 'offline';
  preferredMissionTypes?: string[];
  maxDistance?: string;
  hoursPerWeek?: string;
  notificationPrefs?: {
    newIssue: boolean;
    urgentAlert: boolean;
    volunteerAssignment: boolean;
    dailySummary: boolean;
  };
  dashboardPrefs?: {
    defaultMapCity: string;
    issuesPerPage: number;
    autoRefresh: boolean;
    showCompleted: boolean;
  };
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Collection: `/issues/{issueId}`

```typescript
{
  issueId: string;                   // Firestore auto-ID
  title: string;
  category: string;                  // Reporter-selected category
  location: string;                  // Free-text address / area
  coordinates?: { lat: number; lng: number };
  urgency: 'low' | 'medium' | 'high';
  description: string;
  status: 'pending' | 'assigned' | 'completed';
  reportedBy: string;                // uid
  assignedTo?: string | null;        // uid (legacy single-assign)
  assignedVolunteers?: string[];     // uids (multi-assign via dispatch)
  rejectedVolunteers?: string[];     // uids who declined
  suggestedCategory?: string;        // Gemini output
  suggestedPriority?: string;        // Gemini output: low/medium/high/urgent
  priorityReason?: string;           // Gemini 1-sentence reasoning
  ticketStatus?: string;             // e.g. 'volunteers_assigned'
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Collection: `/broadcasts/{broadcastId}`

```typescript
{
  message: string;
  sentBy: string;                    // coordinator uid
  sentAt: Timestamp;
}
```

### Collection: `/dispatches/{dispatchId}`

```typescript
{
  issueId: string;
  volunteerUid: string;
  coordinatorUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  dispatchedAt: Timestamp;
  respondedAt: Timestamp | null;
}
```

### Collection: `/notifications/{notifId}`

```typescript
{
  issueId: string;
  sentTo: string[];                  // volunteer uids
  sentAt: Timestamp;
  type: 'new_issue_alert' | 'dispatch_request' | 'assignment_confirmed';
  message: string;                   // WhatsApp message text
  waLink?: string | null;            // Single dispatch link
  waLinks?: Array<{                  // Batch notify links
    uid: string;
    name: string;
    waLink: string;
  }>;
}
```

---

## 8. AI Integration (Gemini)

### 8.1 Model

**`gemini-2.0-flash-lite`** — chosen for free-tier quota (30 RPM, 1500 RPD) suitable for NGO usage patterns.

### 8.2 Key Rotation

`lib/gemini.ts` implements `generateWithFallback(prompt)`:

```
GEMINI_API_KEY → try
  429 or 404? → GEMINI_API_KEY_2 → try
    429 or 404? → GEMINI_API_KEY_3 → ...
      All failed → throw lastError
```

Up to 5 keys (`GEMINI_API_KEY` through `GEMINI_API_KEY_5`) can be configured.

### 8.3 Triage Pipeline (`POST /api/triage`)

```
Issue Form Submit
  → POST /api/triage { title, category, location, urgency, description, issueId, issueData }
  → Build Gemini prompt
  → generateWithFallback(prompt)
  → Parse JSON: { suggestedCategory, suggestedPriority, priorityReason }
  → If parse fails → fallback to reporter values
  → Return result to client
  → Client updates Firestore /issues/{id} with AI fields
  → Fire-and-forget: POST /api/notify-volunteers
```

### 8.4 Volunteer Matching Pipeline (`POST /api/insights`)

```
AI Insights page load
  → POST /api/insights { issueId, excludeVolunteers[] }
  → Fetch issue from Firestore (Admin SDK)
  → Fetch all volunteers (role == 'volunteer', status == 'available')
  → Build enriched volunteer list with skillScore + proximityLabel
  → Compute local best match (guaranteed fallback)
  → If Gemini keys available:
      → generateWithFallback(matching prompt)
      → Parse JSON response
      → Validate returned UID exists in our list
      → If invalid UID → patch with local match
  → Return: { bestVolunteerMatchUid, name, skill, proximity, forecastText, sentimentText, satisfactionScore }
```

### 8.5 Skill–Category Mapping

```typescript
CATEGORY_SKILL_MAP = {
  'Infrastructure':    ['Construction & Repair', 'IT & Tech Support', 'Logistics & Supply'],
  'Environment':       ['Construction & Repair', 'Logistics & Supply'],
  'Public Safety':     ['Emergency Response', 'Medical Response', 'Mental Health Support'],
  'Health & Welfare':  ['Medical Response', 'Mental Health Support', 'Elder Care', 'Childcare'],
  'Emergency Response':['Medical Response', 'Emergency Response', 'Logistics & Supply'],
  'Food Supply':       ['Food Preparation', 'Logistics & Supply'],
}
```

---

## 9. WhatsApp Dispatch Pipeline

VolunteerIQ does **not** use the WhatsApp Business API. Instead it generates standard `wa.me` deep links that open WhatsApp with a pre-filled message.

### Flow: New Issue Notification (Broadcast)

```
Reporter submits issue
  → /api/triage completes
  → Fire-and-forget: POST /api/notify-volunteers
      → Fetch all available volunteers
      → Filter: skill match to issue category
      → Filter: location overlap (word matching)
      → Generate wa.me link for each match (up to 20)
      → Save /notifications document with full link list
      → Return { count, waLinks[] } to coordinator UI
```

### Flow: Specific Volunteer Dispatch

```
Coordinator clicks "Dispatch Request" on AI Insights
  → Opens PhoneModal
  → POST /api/dispatch-volunteer { issueId, volunteerUid, coordinatorUid }
      → Fetch volunteer + issue from Firestore
      → Build mission message (name, title, location, priority, ticket #)
      → Generate wa.me link
      → Create /dispatches document (status: pending)
      → Create /notifications document
      → Return { waLink, volunteerName, volunteerPhone }
  → Frontend opens WhatsApp link in new tab
```

### Ticket Number Format

`VIQ-XXXX` — last 4 characters of the Firestore issue document ID, uppercased. Example: `VIQ-3F9A`.

---

## 10. Map Architecture

### Technology

- **Leaflet.js** + **React-Leaflet** v4 — client-only rendering
- **CartoDB Dark Matter** tiles — free, no API key: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- **`dynamic(() => import('./LeafletMapComponent'), { ssr: false })`** — prevents Next.js SSR crash

### Pin Colours

| Urgency | Colour | Hex |
|---|---|---|
| High | Red | `#ef4444` |
| Medium | Amber | `#f59e0b` |
| Low | Indigo | `#6366f1` |

### Map Features

- Issue pins loaded from Firestore `/issues` filtered by status and selected urgency/category filters
- Pin click → `IssueDetailModal` with assign volunteer action
- "Focus Hotspots" — auto-pans to the centroid of the highest-density incident cluster
- Export CSV — client-side CSV generation from current filtered Firestore snapshot

---

## 11. Data Flow Diagrams

### Issue Lifecycle

```
[Reporter fills form]
        │
        ▼
  POST /api/triage
        │
  ┌─────┴──────┐
  │  Gemini    │ ← suggestedCategory, suggestedPriority, priorityReason
  └─────┬──────┘
        │
  Firestore /issues (status: "pending")
        │
        ├──→ notify-volunteers (fire & forget)
        │         │
        │   wa.me links sent via coordinator UI
        │
  [Coordinator opens AI Insights]
        │
        ▼
  POST /api/insights
        │
  ┌─────┴──────┐
  │  Gemini    │ ← bestVolunteerMatch, forecast, sentiment
  └─────┬──────┘
        │
  [Coordinator dispatches]
        │
        ▼
  POST /api/dispatch-volunteer
        │
  Firestore /dispatches (status: "pending")
  WhatsApp link → volunteer's phone
        │
  [Volunteer replies ACCEPT]
        │
        ▼
  POST /api/dispatch-response
        │
  Firestore /issues (status: "assigned")
  Firestore /dispatches (status: "accepted")
```

---

## 12. Security Model

| Layer | Mechanism |
|---|---|
| **Route Access** | `middleware.ts` — cookie check (`viq_uid`, `viq_role`) |
| **Data Access** | Firestore Security Rules — uid and role verification |
| **Server Identity** | Firebase Admin SDK — service account private key |
| **AI Keys** | Server-side only — never in client bundle |
| **Secrets** | Vercel environment variables — not in repository |
| **HTTPS** | Enforced by Vercel — no HTTP access |

### Known Limitations (MVP)

- API routes do not verify Firebase ID tokens on incoming requests (same-origin trust)
- `viq_role` cookie could be tampered with by an advanced user — Firestore rules are the true enforcement layer
- WhatsApp links are open — anyone with the link can open the pre-filled message

---

## 13. Performance Considerations

| Concern | Approach |
|---|---|
| **Dashboard load time** | Firestore `onSnapshot` — no waterfall requests. Stats load < 2s. |
| **Gemini latency** | 60-second client-side cache on insights response. Shows cached data on repeat views. |
| **Map rendering** | `ssr: false` dynamic import — Leaflet loads only on map page, no bundle bloat. |
| **Leaflet assets** | Marker images copied to `/public/leaflet/` at build time via `scripts/copy-leaflet-assets.js` |
| **3D Landing Page** | Three.js scene lazy-loaded. Particle count tuned for 60fps on mid-range hardware. |
| **API Route cold starts** | Vercel keeps frequently-called routes warm. Firebase Admin SDK initialized once per instance. |

---

## 14. Deployment Architecture

```
GitHub main branch
    │
    ▼ (Vercel GitHub integration — auto-deploy on push)
Vercel Build (next build)
    │
    ├── Static assets → Vercel CDN (Edge Network)
    ├── API routes → Vercel Serverless Functions (Node.js 18)
    └── Pages → Server-Side Rendered or Static depending on page

Environment Variables (Vercel Dashboard → Settings → Environment Variables):
  NEXT_PUBLIC_FIREBASE_*     → Client + Server
  FIREBASE_ADMIN_*           → Server only
  GEMINI_API_KEY             → Server only
  GEMINI_API_KEY_2 ... _5   → Server only (optional extras)
```

### Vercel Project Settings

- **Framework Preset:** Next.js
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** 18.x
