# Contributing to VolunteerIQ

Thank you for your interest in contributing to **VolunteerIQ**! This project is part of the Google Solution Challenge 2026 and is built to help NGOs respond faster to community crises. Every contribution — no matter how small — makes a real-world difference.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Area-Specific Guidelines](#area-specific-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project with Firestore and Authentication enabled
- A Google Gemini API key ([free tier](https://aistudio.google.com/apikey) works fine)

### Local Setup

1. **Fork** this repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/volunteeriq.git
   cd volunteeriq/client
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Firebase + Gemini credentials
   ```
5. **Start the dev server:**
   ```bash
   npm run dev
   ```

Full details are in [docs/SETUP.md](docs/SETUP.md).

---

## Development Workflow

1. Check the [Issues](https://github.com/your-org/volunteeriq/issues) tab for open tasks
2. Comment on an issue to claim it before starting work
3. Create a branch from `main` (see [Branching Strategy](#branching-strategy))
4. Make your changes following the [Coding Standards](#coding-standards)
5. Test your changes locally — all pages should load without console errors
6. Open a Pull Request against `main`

---

## Branching Strategy

| Branch pattern | Purpose |
|---|---|
| `main` | Production-ready code — always deployable |
| `feat/<short-description>` | New features |
| `fix/<short-description>` | Bug fixes |
| `docs/<short-description>` | Documentation only changes |
| `refactor/<short-description>` | Code refactoring without behavior change |
| `chore/<short-description>` | Dependency updates, config changes |

**Examples:**
```bash
git checkout -b feat/export-csv-issues
git checkout -b fix/map-pin-color-high-urgency
git checkout -b docs/improve-api-docs
```

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build, dependency, or config updates |
| `ci` | CI/CD pipeline changes |

### Scopes (optional but helpful)

`api`, `auth`, `dashboard`, `map`, `volunteer`, `ai`, `report`, `ui`, `gemini`, `firebase`, `docs`

### Examples

```bash
feat(ai): add fallback to local matching when Gemini quota exceeded
fix(map): correct pin color for high urgency issues
docs(api): add dispatch-volunteer endpoint documentation
chore(deps): upgrade firebase-admin to 12.2.0
```

---

## Pull Request Process

1. **Ensure your branch is up-to-date** with `main` before opening a PR:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Complete the PR template** — fill in all sections (description, type of change, testing done, screenshots if applicable)

3. **Self-review** your diff before requesting a review — check for:
   - No hardcoded secrets or API keys
   - No `console.log` statements left in production paths (use `console.warn`/`console.error` with `[module]` prefixes)
   - All new environment variables added to `.env.local.example`
   - TypeScript — no use of `any` unless absolutely necessary and commented

4. **Request a review** from at least one team member

5. **Address review comments** promptly — PRs inactive for 7 days will be marked stale

6. PRs are merged using **squash and merge** to keep `main` history clean

---

## Coding Standards

### TypeScript

- Use the shared types in `lib/types.ts` — do not duplicate interface definitions
- Prefer explicit return types on exported functions
- Avoid `any` — use `unknown` and narrow the type with guards
- Always type API request bodies and responses

### React / Next.js

- Use the App Router patterns — no legacy `pages/` directory
- All server-side Firestore access goes through Firebase Admin SDK API routes
- Client components fetch data via `fetch('/api/...')` — never import `firebase-admin` on the client
- Use `'use client'` directive only when necessary (interactivity, hooks, browser APIs)
- Firestore real-time data on client pages must use `onSnapshot` with proper cleanup in `useEffect` return

### Styling (Tailwind CSS)

- Use the Tailwind utility classes defined in `tailwind.config.js`
- Prefer the `globals.css` CSS variables for brand colors (`--accent`, `--bg-primary`, etc.)
- Do not add inline `style={{}}` blocks for anything that Tailwind handles
- Keep component-specific styles in the component file using Tailwind — no separate CSS modules

### API Routes

- All API routes live in `app/api/<route-name>/route.ts`
- Always return `NextResponse.json()` — never throw unhandled errors to the client
- Use Firebase Admin SDK (`lib/firebase-admin.ts`) for all server-side database access
- Include proper HTTP status codes (400 for bad input, 404 for not found, 500 for server errors)
- Log errors with a `[module-name]` prefix: `console.error('[dispatch-volunteer] Error:', err)`

### AI (Gemini)

- All Gemini calls go through `lib/gemini.ts` → `generateWithFallback(prompt)`
- Never call the Gemini API directly from client components
- Always handle JSON parse failures with a graceful fallback to reporter-provided values
- Strip markdown fences from Gemini responses before `JSON.parse()`

---

## Area-Specific Guidelines

### Working on the Map (`app/map/`, `components/LeafletMapComponent.tsx`)

- Leaflet cannot be rendered server-side — always import it inside a `useEffect` or use `dynamic(() => import(...), { ssr: false })`
- Use CartoDB Dark Matter tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- Pin colors: `#ef4444` = high, `#f59e0b` = medium, `#6366f1` = low urgency

### Working on AI Routes (`app/api/triage/`, `app/api/insights/`)

- Always implement a local fallback before calling Gemini (see `localBestMatch` in `insights/route.ts`)
- Validate that Gemini-returned UIDs actually exist in our volunteer list
- Cache the insights response for 60 seconds client-side to avoid redundant API calls

### Working on Firebase Rules

- Volunteers: read/write only their own `/users/{uid}` document
- Coordinators: read all `/users`, read/write `/issues`, write `/broadcasts`
- All authenticated users: read `/issues`
- No anonymous access to any collection

---

## Reporting Bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template. Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS
- Relevant console errors
- Screenshots if applicable

---

## Requesting Features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template. Include:
- The problem this solves
- How it fits the NGO / volunteer use case
- Whether it falls within MVP scope or future roadmap

---

## Questions?

Open a [Discussion](https://github.com/your-org/volunteeriq/discussions) or reach out to the team via the issue tracker. We're happy to help!

---

*Thank you for helping build tools that matter. 🙏*
