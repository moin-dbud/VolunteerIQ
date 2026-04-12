<div align="center">
<img src="public/VolunteerIQ-icon.png" alt="VolunteerIQ" width="60" />

</div>

# Changelog


All notable changes to **VolunteerIQ** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Planned
- Mobile responsiveness (screens < 1280px)
- PWA / offline mode
- SMS intake integration
- Multi-language support (i18n)
- Drone feed / multimodal AI analysis
- Advanced analytics export (PDF reports)
- Flutter mobile companion app

---

## [0.5.0] — 2026-04-12 — Landing Page & 3D Hero

### Added
- **3D animated landing page** — Three.js / React Three Fiber network particle scene (`NetworkScene.tsx`)
- **Lenis smooth scroll** integration across the entire landing page
- **Framer Motion** page transitions and section reveal animations
- Hero section with animated gradient headline and CTA buttons
- Feature sections, social proof, and footer on landing page
- `AppShell` wrapper component — unified Sidebar + Navbar layout for authenticated pages
- React `AuthContext` (`lib/auth-context.tsx`) with cookie sync (`viq_uid`, `viq_role`) for middleware support

### Changed
- Root route `/` now serves the public landing page; authenticated users are redirected to their role dashboard
- Middleware updated to skip redirect for `/` when user is a guest

### Fixed
- React 18 / Three.js peer dependency conflicts resolved using `--legacy-peer-deps`
- Lenis scroll instance cleanup on component unmount

---

## [0.4.0] — 2026-04-12 — WhatsApp Dispatch & Volunteer Matching

### Added
- **`POST /api/dispatch-volunteer`** — Sends a WhatsApp `wa.me` dispatch link to a named volunteer with full mission details (title, location, priority, ticket number)
- **`POST /api/dispatch-response`** — Handles volunteer ACCEPT / DECLINE replies; updates Firestore issue status and dispatch record
- **`POST /api/notify-volunteers`** — On issue creation, generates `wa.me` links for all skill-matched, location-matched, available volunteers
- **`PhoneModal.tsx`** — Coordinator UI to open WhatsApp link for volunteer dispatch
- `lib/whatsapp.ts` — Utility to build pre-filled `wa.me` deep links
- Firestore `/dispatches` collection schema with `pending | accepted | rejected` lifecycle
- Firestore `/notifications` collection for audit trail of all generated WhatsApp links
- Ticket number generation (`VIQ-XXXX` format based on Firestore document suffix)

### Changed
- `POST /api/triage` now fires-and-forgets `notify-volunteers` after AI triage completes
- AI Insights page "Dispatch Request" button now opens `PhoneModal` instead of directly updating Firestore

---

## [0.3.0] — 2026-04-11 — AI Insights & Gemini Key Rotation

### Added
- **AI Insights page** (`/ai-insights`) — Gemini AI volunteer matching with impact forecast and sentiment analysis
- **`POST /api/insights`** — Full volunteer matching pipeline: skill scoring, proximity labeling, Gemini recommendation, UID validation, local fallback
- **Gemini key rotation** (`lib/gemini.ts`) — `generateWithFallback()` cycles through up to 5 API keys on 429 / 404 errors
- Local best-match algorithm (`skillScore` + `proximityLabel`) as Gemini fallback
- `CATEGORY_SKILL_MAP` — Maps issue categories to relevant volunteer skill sets
- Network Health sidebar widget on AI Insights showing live volunteer and ticket counts
- 60-second client-side caching of Gemini insights response

### Changed
- Gemini model switched to `gemini-2.0-flash-lite` (30 RPM, 1500 RPD free tier)
- Insights prompt redesigned to force valid UID output and validate against known volunteer list

### Fixed
- Gemini occasionally returning hallucinated UIDs — added post-response UID validation with local-match patch

---

## [0.2.0] — 2026-04-11 — Map View & Leaflet Migration

### Added
- **Interactive Incident Map** (`/map`) — Full-screen dark-mode map with incident pin overlay
- **`LeafletMapComponent.tsx`** — Leaflet.js + React-Leaflet implementation with CartoDB Dark Matter tiles
- `MapWrapper.tsx` — Dynamic import wrapper (`ssr: false`) to prevent Leaflet SSR crashes
- `scripts/copy-leaflet-assets.js` — Copies Leaflet marker PNGs to `/public/leaflet/` at build time
- Map filter panel — filter by category (Health, Food, Shelter, Infrastructure) and urgency (High, Medium, Low)
- Volunteer list panel on map showing available volunteers with proximity to nearest incident
- Bottom status bar — active emergency count, online volunteer count, Export CSV button, Focus Hotspots button
- Issue detail popup on map pin click with "Assign Volunteer" action

### Changed
- **Google Maps replaced with Leaflet.js + OpenStreetMap** — eliminates need for Google Maps API key
- Map tiles: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/...`)
- Dashboard mini-map updated to use Leaflet embed

### Removed
- Google Maps JavaScript API dependency
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` environment variable requirement

---

## [0.1.0] — 2026-04-10 — MVP Foundation

### Added
- **Next.js 14 App Router** project scaffold with TypeScript and Tailwind CSS
- **Firebase Authentication** — Email/Password signup and login
- **Firestore** real-time database integration (client + admin SDK)
- Role-based routing middleware (`middleware.ts`) — coordinator vs. volunteer access control
- **Dashboard page** (`/dashboard`) — Stat cards, Impact Distribution chart, Recent Submissions table, mini-map
- **Report Issue page** (`/report`) — Structured form with AI triage on submit
- **Volunteer Portal** (`/volunteer`) — Profile management, skill selection, available missions list
- **Settings page** (`/settings`) — Role-specific settings with notification and dashboard preferences
- **`POST /api/triage`** — Gemini AI issue categorization and urgency confirmation
- Firebase Admin SDK integration (`lib/firebase-admin.ts`) for server-side Firestore access
- Shared TypeScript types (`lib/types.ts`) — `User`, `Issue`, `Broadcast`, Gemini response types, skill/category constants
- Toast notification context (`lib/toast-context.tsx`)
- `IssueDetailModal.tsx` — Full issue details with volunteer assignment action
- `BroadcastModal.tsx` — Urgent broadcast message composer
- Sidebar navigation with role-aware link visibility
- Top Navbar with user avatar, search bar (UI only), notifications bell (UI only)
- Firestore collections: `/users`, `/issues`, `/broadcasts`
- `.env.local.example` with all required environment variable keys documented

---

[Unreleased]: https://github.com/your-org/volunteeriq/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/your-org/volunteeriq/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/your-org/volunteeriq/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/your-org/volunteeriq/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/your-org/volunteeriq/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/your-org/volunteeriq/releases/tag/v0.1.0
