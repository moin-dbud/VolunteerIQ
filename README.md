<div align="center">

<img src="client/public/logo.svg" alt="VolunteerIQ Logo" width="80" />

# VolunteerIQ

**AI-Powered NGO Command Center** — Built for [Google Solution Challenge 2026](https://developers.google.com/community/gdsc-solution-challenge)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange?logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash_Lite-purple?logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com/)

> *Digitizing community crisis response — zero paperwork, zero delay, zero burned-out volunteers.*

</div>

---

## 🌍 The Problem

NGOs and community organizations collect critical data through **scattered, unstructured sources** — WhatsApp messages, paper forms, verbal field reports. This data is siloed, untracked, and unactionable. Coordinators manually attempt to match volunteers to needs, causing:

- ⏰ **Delayed response** to urgent community crises
- 🔁 **Volunteer duplication** — multiple people assigned to the same task
- 🔥 **Volunteer burnout** from mismatched or excessive tasks
- 📊 **Zero visibility** into real-time impact or resource distribution

## 💡 The Solution

**VolunteerIQ** is a web-based command center for NGOs. It:

1. **Digitizes issue intake** through structured, AI-triaged forms
2. **Centralizes data** into a unified real-time dashboard
3. **Uses Gemini AI** to auto-categorize issues, assign urgency levels, and intelligently match the right volunteer to the right task based on skill and proximity
4. **Dispatches volunteers via WhatsApp** — coordinators send missions with a single click, volunteers reply ACCEPT/DECLINE
5. **Visualizes incidents geographically** with an interactive dark-mode map

The result: **faster community response, zero-waste volunteer deployment, and measurable impact visibility**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Auth** | Firebase Auth with cookie-based session. Coordinators and Volunteers see different UIs |
| 📊 **Real-Time Dashboard** | Firestore `onSnapshot` keeps stats, charts, and submissions live |
| 🤖 **AI Triage** | Gemini 2.0 Flash Lite confirms category + escalates urgency on every issue |
| 🧠 **AI Volunteer Matching** | Gemini analyzes skills, proximity, and availability to recommend the best volunteer |
| 💬 **WhatsApp Dispatch** | One-click `wa.me` links notify volunteers with mission details |
| 🗺️ **Incident Map** | Leaflet.js + OpenStreetMap dark tiles — no Google Maps API key needed |
| 📋 **Issue Lifecycle** | `pending → assigned → completed` tracked end-to-end in Firestore |
| 📡 **Urgent Broadcast** | Coordinator sends a broadcast to all volunteers stored in `/broadcasts` |
| 🌐 **Landing Page** | 3D animated hero (Three.js / R3F) with smooth Lenis scroll |
| 🔑 **API Key Rotation** | Automatic failover across up to 5 Gemini API keys |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS 3, Framer Motion, Lenis smooth scroll |
| **3D / Animation** | Three.js, React Three Fiber, @react-three/drei |
| **Backend** | Next.js API Routes (serverless, Edge-compatible) |
| **Database** | Firebase Firestore (real-time listeners) |
| **Authentication** | Firebase Auth — Email/Password |
| **AI** | Google Gemini 2.0 Flash Lite (`@google/generative-ai`) |
| **Maps** | Leaflet.js + React-Leaflet + CartoDB Dark tiles |
| **Notifications** | WhatsApp `wa.me` deep-link generation |
| **Icons** | Lucide React |
| **Hosting** | Vercel |

---

## 🗂️ Project Structure

```
volunteeriq/
├── client/                      # Next.js application
│   ├── app/
│   │   ├── page.tsx             # Landing page (3D hero + sections)
│   │   ├── layout.tsx           # Root layout + providers
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── dashboard/           # Coordinator dashboard
│   │   ├── report/              # Report Issue form
│   │   ├── volunteer/           # Volunteer portal
│   │   ├── ai-insights/         # Gemini AI insights page
│   │   ├── map/                 # Interactive incident map
│   │   ├── settings/            # Role-based settings
│   │   └── api/
│   │       ├── triage/          # POST — AI issue triage
│   │       ├── insights/        # POST — AI volunteer matching
│   │       ├── dispatch-volunteer/  # POST — Send WhatsApp dispatch
│   │       ├── dispatch-response/   # POST — Handle ACCEPT/DECLINE
│   │       └── notify-volunteers/   # POST — Broadcast new issue
│   ├── components/
│   │   ├── landing/             # Landing page sections (3D, features, etc.)
│   │   ├── AppShell.tsx         # Sidebar + Navbar wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── Navbar.tsx           # Top navigation bar
│   │   ├── LeafletMapComponent.tsx  # Map implementation
│   │   ├── IssueDetailModal.tsx # Issue detail + assignment modal
│   │   ├── BroadcastModal.tsx   # Urgent broadcast modal
│   │   └── PhoneModal.tsx       # WhatsApp dispatch modal
│   ├── lib/
│   │   ├── firebase.ts          # Firebase client SDK init
│   │   ├── firebase-admin.ts    # Firebase Admin SDK init
│   │   ├── gemini.ts            # Gemini client + key rotation
│   │   ├── auth-context.tsx     # React Auth context provider
│   │   ├── toast-context.tsx    # Toast notification context
│   │   ├── whatsapp.ts          # wa.me link builder utility
│   │   └── types.ts             # Shared TypeScript types + constants
│   ├── middleware.ts            # Route protection + role-based redirects
│   └── .env.local.example      # Environment variable template
└── docs/                        # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Firebase project (Firestore + Authentication enabled)
- A Google Gemini API key ([get one free](https://aistudio.google.com/apikey))

### 1. Clone the repo

```bash
git clone https://github.com/your-org/volunteeriq.git
cd volunteeriq/client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Firebase and Gemini credentials. See [docs/SETUP.md](docs/SETUP.md) for a detailed walkthrough.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page will load.

---

## 🌐 Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing Page | Public |
| `/login` | Login | Public |
| `/signup` | Sign Up | Public |
| `/dashboard` | Coordinator Dashboard | Coordinator only |
| `/report` | Report Issue | Both roles |
| `/volunteer` | Volunteer Portal | Both roles |
| `/ai-insights` | Gemini AI Insights | Coordinator only |
| `/map` | Interactive Incident Map | Coordinator only |
| `/settings` | Account Settings | Both roles (role-specific views) |

---

## 🤖 AI Integration

VolunteerIQ uses **Gemini 2.0 Flash Lite** at two key points:

**1. Issue Triage** (`POST /api/triage`) — triggered on issue submission:
- Confirms or corrects the issue category
- Escalates urgency if warranted
- Provides a one-sentence reasoning

**2. Volunteer Matching** (`POST /api/insights`) — on AI Insights page load:
- Analyzes all available volunteers' skills and locations
- Recommends the single best match for the most critical open issue
- Generates an impact forecast and community sentiment score

The Gemini client supports **automatic key rotation** — add up to 5 API keys (`GEMINI_API_KEY`, `GEMINI_API_KEY_2` … `GEMINI_API_KEY_5`) to avoid rate limits on the free tier.

---

## 📊 Firestore Data Schema

```
/users/{uid}          — User profiles (coordinators & volunteers)
/issues/{issueId}     — Community issues with AI triage results
/broadcasts/{id}      — Urgent broadcast messages
/dispatches/{id}      — Volunteer dispatch records (pending/accepted/rejected)
/notifications/{id}   — WhatsApp notification logs
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full schema details.

---

## 📖 Documentation

| Document | Description |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Detailed local setup guide |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and data flow |
| [docs/API.md](docs/API.md) | All API routes documented |
| [docs/DEMO.md](docs/DEMO.md) | Demo credentials and walkthrough |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

Quick contribution workflow:
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 🔐 Security

If you discover a security vulnerability, please follow our [SECURITY.md](SECURITY.md) policy. Do **not** open a public issue.

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

---

## 👥 Team

Built with ❤️ by **Team DeepCraft** for the Google Solution Challenge 2026.

---

<div align="center">

*VolunteerIQ — Turning Community Chaos into Coordinated Impact*

</div>
