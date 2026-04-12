<div align="center">
<img src="../public/VolunteerIQ-icon.png" alt="VolunteerIQ" width="60" />
</div>

# VolunteerIQ — Local Setup Guide


This guide walks you through getting **VolunteerIQ** running locally from scratch, including Firebase project setup, Gemini API configuration, and Vercel deployment.

**Estimated setup time:** 20–30 minutes

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Repository Setup](#2-repository-setup)
3. [Firebase Project Setup](#3-firebase-project-setup)
4. [Firestore Database Setup](#4-firestore-database-setup)
5. [Firebase Authentication Setup](#5-firebase-authentication-setup)
6. [Firebase Admin SDK (Service Account)](#6-firebase-admin-sdk-service-account)
7. [Gemini API Key](#7-gemini-api-key)
8. [Environment Variables](#8-environment-variables)
9. [Running Locally](#9-running-locally)
10. [Firestore Security Rules](#10-firestore-security-rules)
11. [Seeding Demo Data](#11-seeding-demo-data)
12. [Deploying to Vercel](#12-deploying-to-vercel)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Prerequisites

Install these tools before starting:

| Tool | Version | Link |
|---|---|---|
| **Node.js** | 18+ | https://nodejs.org/ |
| **npm** | 9+ | Comes with Node.js |
| **Git** | Any | https://git-scm.com/ |
| **A Google Account** | — | For Firebase + Gemini |

Verify your Node.js version:

```bash
node --version   # Should output v18.x.x or higher
npm --version    # Should output 9.x.x or higher
```

---

## 2. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/volunteeriq.git

# Navigate into the client app
cd volunteeriq/client

# Install all dependencies
npm install
```

> **Windows note:** If you see peer dependency warnings related to React/Three.js, run `npm install --legacy-peer-deps` instead.

---

## 3. Firebase Project Setup

### 3.1 Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it `volunteeriq` (or any name you prefer)
4. Disable Google Analytics (not needed for this project)
5. Click **"Create project"** and wait for provisioning

### 3.2 Register a Web App

1. In your Firebase project, click the **Web icon** (`</>`) on the project overview page
2. App nickname: `VolunteerIQ Web`
3. **Do not** check "Set up Firebase Hosting" (we use Vercel)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object — you'll need these values for your `.env.local`

```javascript
// You'll see something like this:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 4. Firestore Database Setup

1. In the Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. **Start in production mode** (we'll configure rules in Step 10)
4. Select the closest server location to your users (e.g., `asia-south1` for India)
5. Click **"Enable"**

### 4.1 Create Required Collections

Firestore creates collections automatically when you first write a document, but you can manually create them for clarity:

1. Click **"Start collection"**
2. Create: `users`, `issues`, `broadcasts`, `dispatches`, `notifications`

---

## 5. Firebase Authentication Setup

1. In the Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Under **"Sign-in method"** tab, click **"Email/Password"**
4. Enable **"Email/Password"** (first toggle)
5. Leave "Email link (passwordless sign-in)" disabled
6. Click **"Save"**

---

## 6. Firebase Admin SDK (Service Account)

The server-side API routes use the Firebase Admin SDK, which requires a service account private key.

### 6.1 Generate a Private Key

1. In Firebase Console, go to **Project Settings** (gear icon) → **"Service accounts"** tab
2. Select **"Firebase Admin SDK"**
3. Click **"Generate new private key"**
4. A JSON file will download — **keep this file secret, never commit it to Git**

### 6.2 Extract Values

Open the downloaded JSON file. You need three values:

```json
{
  "project_id": "your-project-id",           ← FIREBASE_ADMIN_PROJECT_ID
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",  ← FIREBASE_ADMIN_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"  ← FIREBASE_ADMIN_PRIVATE_KEY
}
```

> ⚠️ The `private_key` field contains literal `\n` characters. When pasting into `.env.local`, keep the `\n` sequences — do not convert them to real newlines.

---

## 7. Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Select your Firebase project (or create a new project)
5. Copy the generated key

### Free Tier Limits

`gemini-2.0-flash-lite` free tier provides:
- **30 requests per minute (RPM)**
- **1,500 requests per day (RPD)**

This is sufficient for development and NGO-scale MVP usage.

### Multiple Keys (Optional)

If you expect higher load or hit quota limits, you can add up to 5 Gemini API keys. The system automatically rotates to the next key on quota errors:

```
GEMINI_API_KEY=key_1
GEMINI_API_KEY_2=key_2
GEMINI_API_KEY_3=key_3
```

---

## 8. Environment Variables

### 8.1 Create `.env.local`

```bash
# From the client/ directory:
cp .env.local.example .env.local
```

### 8.2 Fill in All Values

Open `.env.local` and populate every field:

```env
# ─── Firebase Client SDK (safe for browser) ──────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ─── Firebase Admin SDK (server-side only — NEVER commit this) ───────────────
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIB...\n-----END PRIVATE KEY-----\n"

# ─── Google Gemini AI ─────────────────────────────────────────────────────────
GEMINI_API_KEY=AIzaSy...
# Optional extras for key rotation:
# GEMINI_API_KEY_2=AIzaSy...
# GEMINI_API_KEY_3=AIzaSy...

# ─── App URL (used by triage to call notify-volunteers internally) ─────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 8.3 Important Notes

- **Never commit `.env.local`** — it is already in `.gitignore`
- The `FIREBASE_ADMIN_PRIVATE_KEY` must be wrapped in double quotes with literal `\n` characters
- `NEXT_PUBLIC_*` variables are safe to expose to the browser; all others are server-only

---

## 9. Running Locally

```bash
# From the client/ directory:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the VolunteerIQ landing page with the 3D network animation.

### Creating Your First Admin Account

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in the form — select **"NGO Coordinator"** as your role
3. After signup, you'll be redirected to `/dashboard`

### Creating a Test Volunteer Account

1. Open a private/incognito browser window
2. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
3. Create an account with role **"Volunteer"**
4. Go to `/volunteer` and fill in your profile with skills and location

---

## 10. Firestore Security Rules

Deploy these rules from the Firebase Console → Firestore Database → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check if current user is a coordinator
    function isCoordinator() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role == 'coordinator';
    }

    // Users collection
    match /users/{uid} {
      allow read: if request.auth != null &&
        (request.auth.uid == uid || isCoordinator());
      allow create: if request.auth != null &&
        request.auth.uid == uid;
      allow update: if request.auth != null &&
        request.auth.uid == uid;
    }

    // Issues collection
    match /issues/{issueId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && isCoordinator();
    }

    // Broadcasts collection
    match /broadcasts/{id} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isCoordinator();
    }

    // Dispatches — server manages via Admin SDK
    match /dispatches/{id} {
      allow read: if request.auth != null;
      allow write: if false; // Admin SDK only
    }

    // Notifications — server manages via Admin SDK
    match /notifications/{id} {
      allow read: if request.auth != null && isCoordinator();
      allow write: if false; // Admin SDK only
    }
  }
}
```

> Click **"Publish"** after pasting the rules.

---

## 11. Seeding Demo Data

For a quick demo without manual data entry, open your browser console on the dashboard page and run these Firestore writes, or use the app's UI to create sample data:

### Recommended Demo Setup

1. **Create 1 Coordinator account** via `/signup`
2. **Create 3–5 Volunteer accounts** via `/signup` with different skills and locations:
   - Volunteer 1: Skills: Medical Response, Emergency Response | Location: Delhi
   - Volunteer 2: Skills: Logistics & Supply, Food Preparation | Location: Delhi
   - Volunteer 3: Skills: Construction & Repair, IT & Tech Support | Location: Mumbai
3. **Fill volunteer profiles** — go to `/volunteer` as each volunteer and add phone numbers (format: `+91XXXXXXXXXX`) to enable WhatsApp dispatch
4. **Create 5–10 issues** via `/report` as the coordinator:
   - Mix of categories: Infrastructure, Health & Welfare, Emergency Response
   - Mix of urgencies: Low, Medium, High
   - Use real or fictional Delhi/Mumbai area names for locations

---

## 12. Deploying to Vercel

### 12.1 Vercel Account Setup

1. Go to [vercel.com](https://vercel.com/) and sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Set the **Root Directory** to `client`
5. Framework Preset will auto-detect as **Next.js**

### 12.2 Environment Variables

In Vercel dashboard → Project → Settings → Environment Variables, add all variables from your `.env.local`:

| Variable | Environment |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Production, Preview, Development |
| `FIREBASE_ADMIN_PROJECT_ID` | Production, Preview, Development |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Production, Preview, Development |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Production, Preview, Development |
| `GEMINI_API_KEY` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Production: your Vercel URL |

> For `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel, paste the raw value without surrounding quotes — Vercel handles escaping automatically.

### 12.3 Update App URL

After getting your Vercel deployment URL, update `NEXT_PUBLIC_APP_URL`:

```
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### 12.4 Deploy

Click **"Deploy"** — Vercel will build and deploy the app. Subsequent pushes to `main` will auto-deploy.

---

## 13. Troubleshooting

### `Error: Firebase Admin initialization failed`

**Cause:** `FIREBASE_ADMIN_PRIVATE_KEY` is not formatted correctly.

**Fix:** Ensure the key is wrapped in double quotes and uses literal `\n` (not real newlines):
```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

---

### `Hydration error` on Map page

**Cause:** Leaflet.js is being SSR'd by Next.js.

**Fix:** Ensure `MapWrapper.tsx` uses `dynamic import` with `{ ssr: false }`:
```typescript
const Map = dynamic(() => import('./LeafletMapComponent'), { ssr: false });
```

---

### `Gemini API returned 429`

**Cause:** Free tier rate limit exceeded.

**Fix:** Add a second Gemini API key: `GEMINI_API_KEY_2=...`. The system will automatically fail over.

---

### `Leaflet marker icons not showing`

**Cause:** Leaflet marker assets not copied to `/public/leaflet/`.

**Fix:** Run:
```bash
npm run copy-leaflet-assets
npm run dev
```

---

### `onSnapshot not updating in real-time`

**Cause:** Firestore rules may be blocking reads.

**Fix:** Check the Firebase Console → Firestore → Rules → Monitor tab for rule denials. Ensure you're logged in as an authenticated user.

---

### `wa.me link opens WhatsApp but message is empty`

**Cause:** URL encoding issue in the message text.

**Fix:** Ensure `lib/whatsapp.ts` uses `encodeURIComponent()` on the message body. Check the generated link in browser dev tools.

---

### Volunteer not appearing in AI Insights

**Cause:** Volunteer's `availabilityStatus` may be set to `"busy"` or `"offline"`, or they have no skills set.

**Fix:** Go to the volunteer's profile (`/volunteer`), ensure `availabilityStatus` is `"available"` and at least one skill is selected.
