<div align="center">
<img src="../public/VolunteerIQ-icon.png" alt="VolunteerIQ" width="60" />
</div>

# VolunteerIQ — API Documentation

All API routes are **Next.js Route Handlers** located in `app/api/`. They run as serverless functions on Vercel.


**Base URL:** `https://your-deployment.vercel.app` (or `http://localhost:3000` locally)

> **Authentication Note:** In the MVP, API routes trust same-origin requests. Production hardening should add Firebase ID token verification headers.

---

## Table of Contents

1. [POST /api/triage](#1-post-apitriage)
2. [POST /api/insights](#2-post-apiinsights)
3. [POST /api/dispatch-volunteer](#3-post-apidispatch-volunteer)
4. [POST /api/dispatch-response](#4-post-apidispatch-response)
5. [POST /api/notify-volunteers](#5-post-apinotify-volunteers)
6. [Error Response Format](#6-error-response-format)

---

## 1. `POST /api/triage`

Triggers Gemini AI to categorize and prioritize a newly reported community issue. Also fires-and-forgets a volunteer notification if `issueId` and `issueData` are provided.

### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | ✅ | Issue title / brief summary |
| `category` | `string` | ✅ | Reporter-selected category |
| `location` | `string` | ✅ | Free-text address or area name |
| `urgency` | `string` | ✅ | Reporter-selected urgency: `low`, `medium`, `high` |
| `description` | `string` | ✅ | Detailed issue description |
| `issueId` | `string` | ❌ | Firestore issue document ID — triggers notify-volunteers if provided |
| `issueData` | `object` | ❌ | Full issue data object — passed to notify-volunteers |

**Example Request:**

```json
{
  "title": "Broken water pipe flooding residential area",
  "category": "Infrastructure",
  "location": "Sector 4, Delhi",
  "urgency": "high",
  "description": "A major water pipe has burst on MG Road, flooding 3 residential buildings. Approximately 200 residents are affected. Water supply to the entire sector is disrupted.",
  "issueId": "abc123xyz",
  "issueData": {
    "title": "Broken water pipe flooding residential area",
    "location": "Sector 4, Delhi",
    "urgency": "high",
    "description": "..."
  }
}
```

### Response

**Content-Type:** `application/json`

| Field | Type | Description |
|---|---|---|
| `suggestedCategory` | `string` | Gemini-confirmed or corrected category |
| `suggestedPriority` | `string` | Escalated priority: `low`, `medium`, `high`, or `urgent` |
| `priorityReason` | `string` | One-sentence reasoning for the priority decision |

**Example Response (200):**

```json
{
  "suggestedCategory": "Infrastructure",
  "suggestedPriority": "urgent",
  "priorityReason": "A burst water main affecting 200+ residents with disrupted supply constitutes an urgent infrastructure emergency requiring immediate response."
}
```

**Fallback Response (if Gemini fails):**

```json
{
  "suggestedCategory": "Infrastructure",
  "suggestedPriority": "high",
  "priorityReason": ""
}
```

> The triage API **never returns an error response** — it always falls back to the reporter's original values on AI failure. This is by design (silent fallback).

---

## 2. `POST /api/insights`

Fetches AI-powered volunteer matching for a specific open issue. Uses Gemini 2.0 Flash Lite with a local skill-scoring fallback.

### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `issueId` | `string` | ✅ | Firestore issue document ID to match volunteers for |
| `excludeVolunteers` | `string[]` | ❌ | Array of volunteer UIDs to exclude (already dispatched / declined) |

**Example Request:**

```json
{
  "issueId": "abc123xyz",
  "excludeVolunteers": ["vol_uid_1", "vol_uid_2"]
}
```

### Response

**Content-Type:** `application/json`

| Field | Type | Description |
|---|---|---|
| `bestVolunteerMatchUid` | `string` | UID of the recommended volunteer |
| `bestVolunteerMatchName` | `string` | Display name of the recommended volunteer |
| `bestVolunteerMatchSkill` | `string` | Most relevant skill of the matched volunteer |
| `bestVolunteerProximity` | `string` | Proximity label: `"< 5km away"`, `"< 50km away"`, or `"Nearby"` |
| `forecastText` | `string` | One-sentence impact forecast |
| `sentimentText` | `string` | One-sentence community sentiment observation |
| `satisfactionScore` | `number` | Estimated satisfaction score (1.0–10.0) |

**Example Response (200):**

```json
{
  "bestVolunteerMatchUid": "Xk2mN9qLpTr4vW8sA1bC",
  "bestVolunteerMatchName": "Priya Sharma",
  "bestVolunteerMatchSkill": "Construction & Repair",
  "bestVolunteerProximity": "< 5km away",
  "forecastText": "Deploying Priya Sharma with repair skills is estimated to restore water supply within 4 hours, reducing affected residents' disruption significantly.",
  "sentimentText": "Community feedback in Sector 4 has been trending positive with infrastructure volunteers active in the area.",
  "satisfactionScore": 8.7
}
```

**No Volunteers Available (200):**

```json
{
  "bestVolunteerMatchUid": "",
  "bestVolunteerMatchName": "No volunteers available",
  "bestVolunteerMatchSkill": "",
  "bestVolunteerProximity": "N/A",
  "forecastText": "Deploying the matched volunteer is estimated to reduce resolution time significantly.",
  "sentimentText": "Community feedback trending positive in areas with active volunteer presence.",
  "satisfactionScore": 8.4
}
```

**Error Response (500):**

```json
{
  "bestVolunteerMatchUid": "",
  "bestVolunteerMatchName": "Error generating report",
  "bestVolunteerMatchSkill": "",
  "bestVolunteerProximity": "Nearby",
  "forecastText": "...",
  "sentimentText": "...",
  "satisfactionScore": 8.4
}
```

---

## 3. `POST /api/dispatch-volunteer`

Dispatches a specific volunteer to a mission. Generates a WhatsApp `wa.me` deep link, creates a dispatch record in Firestore, and logs the notification.

### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `issueId` | `string` | ✅ | Firestore issue document ID |
| `volunteerUid` | `string` | ✅ | UID of the volunteer to dispatch |
| `coordinatorUid` | `string` | ✅ | UID of the coordinator initiating the dispatch |

**Example Request:**

```json
{
  "issueId": "abc123xyz",
  "volunteerUid": "Xk2mN9qLpTr4vW8sA1bC",
  "coordinatorUid": "coord_uid_here"
}
```

### Response

**Content-Type:** `application/json`

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | `true` if dispatch was created |
| `dispatchId` | `string` | Firestore dispatch document ID |
| `waLink` | `string \| null` | `wa.me` link with pre-filled mission message. `null` if volunteer has no phone. |
| `volunteerName` | `string` | Volunteer's display name |
| `volunteerPhone` | `string \| null` | Volunteer's phone number (for display) |
| `hasPhone` | `boolean` | Whether the volunteer has a phone number registered |

**Example Response (200):**

```json
{
  "success": true,
  "dispatchId": "dispatch_doc_id",
  "waLink": "https://wa.me/919876543210?text=%F0%9F%8E%AF%20*VolunteerIQ+Dispatch+Request*...",
  "volunteerName": "Priya Sharma",
  "volunteerPhone": "+919876543210",
  "hasPhone": true
}
```

**Error Responses:**

```json
// 400 — missing fields
{ "error": "Missing required fields" }

// 404 — volunteer not found
{ "error": "Volunteer not found" }

// 404 — issue not found
{ "error": "Issue not found" }

// 500 — server error
{ "error": "Internal server error" }
```

### WhatsApp Message Format

The pre-filled WhatsApp message contains:
- Volunteer's name
- Mission title and location
- Priority level (uppercase)
- Category
- Description (first 150 characters)
- Ticket number (`VIQ-XXXX`)
- Instructions to reply `ACCEPT` or `DECLINE`

---

## 4. `POST /api/dispatch-response`

Records a volunteer's response (ACCEPT / DECLINE) to a dispatch request. On ACCEPT, updates the issue status to `assigned` and sends a WhatsApp confirmation link.

### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `dispatchId` | `string` | ✅ | Firestore dispatch document ID |
| `response` | `"accepted" \| "rejected"` | ✅ | Volunteer's response |
| `issueId` | `string` | ✅ | Firestore issue document ID |
| `volunteerUid` | `string` | ✅ | UID of the responding volunteer |

**Example Request:**

```json
{
  "dispatchId": "dispatch_doc_id",
  "response": "accepted",
  "issueId": "abc123xyz",
  "volunteerUid": "Xk2mN9qLpTr4vW8sA1bC"
}
```

### Response

**For `"accepted"`:**

```json
{
  "success": true,
  "status": "accepted",
  "waLink": "https://wa.me/919876543210?text=%E2%9C%85+*Assignment+Confirmed..."
}
```

**For `"rejected"`:**

```json
{
  "success": true,
  "status": "rejected",
  "waLink": null
}
```

**Side Effects on Accept:**
- Firestore `/dispatches/{dispatchId}` → `status: "accepted"`, `respondedAt: <now>`
- Firestore `/issues/{issueId}` → `status: "assigned"`, `assignedVolunteers: arrayUnion(volunteerUid)`
- New `/notifications` document with confirmation WhatsApp link

**Error Responses:**

```json
// 400
{ "error": "Missing required fields" }

// 500
{ "error": "Internal server error" }
```

---

## 5. `POST /api/notify-volunteers`

Generates WhatsApp `wa.me` links for all volunteers who match the issue's skill requirements and location. Called internally (fire-and-forget) from `/api/triage`.

### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `issueId` | `string` | ✅ | Firestore issue document ID |
| `suggestedCategory` | `string` | ✅ | AI-confirmed category (used for skill matching) |
| `issueData` | `object` | ✅ | Full issue data object (title, location, urgency, description) |

**Example Request:**

```json
{
  "issueId": "abc123xyz",
  "suggestedCategory": "Infrastructure",
  "issueData": {
    "title": "Broken water pipe",
    "location": "Sector 4, Delhi",
    "urgency": "high",
    "description": "Major water pipe burst...",
    "suggestedPriority": "urgent"
  }
}
```

### Volunteer Matching Logic

1. Fetch all volunteers (`role == 'volunteer'`)
2. Filter to `availabilityStatus == 'available'` (or no status set)
3. Map category → required skills via `CATEGORY_SKILL_MAP`
4. Keep volunteers whose skills overlap with required skills
5. Filter by location overlap (word-level tokenization of city/area strings)
6. Generate `wa.me` link for each matched volunteer who has a phone number
7. Cap at 20 links per notification batch

### Response

```json
{
  "count": 3,
  "waLinks": [
    {
      "uid": "vol_uid_1",
      "name": "Priya Sharma",
      "phone": "+919876543210",
      "waLink": "https://wa.me/919876543210?text=..."
    }
  ]
}
```

**Error Responses:**

```json
// 400
{ "error": "Missing required fields" }

// 500
{ "error": "Internal server error" }
```

---

## 6. Error Response Format

All API routes return errors in this format:

```json
{
  "error": "Human-readable error message"
}
```

| HTTP Status | Meaning |
|---|---|
| `200` | Success |
| `400` | Bad Request — missing or invalid input fields |
| `404` | Not Found — Firestore document does not exist |
| `500` | Internal Server Error — unexpected failure |

### Logging Convention

All server-side errors are logged with a `[module-name]` prefix:

```
[triage API Error] ...
[Insights API Error] ...
[dispatch-volunteer] Error: ...
[dispatch-response] Error: ...
[notify-volunteers] Error: ...
```

---

## Firestore Collections (API Write Summary)

| Route | Collections Written |
|---|---|
| `/api/triage` | (client writes to `/issues` after response) |
| `/api/insights` | Read-only |
| `/api/dispatch-volunteer` | `/dispatches`, `/notifications` |
| `/api/dispatch-response` | `/dispatches`, `/issues`, `/notifications` |
| `/api/notify-volunteers` | `/notifications` |
