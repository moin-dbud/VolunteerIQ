## Description

<!-- Provide a clear and concise description of what this PR does and why. Link the related issue. -->

**Closes:** #<!-- issue number -->

---

## Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] ♻️ Refactor (no functional change, code restructuring)
- [ ] 📝 Documentation update
- [ ] 🎨 Style / UI only change
- [ ] ⚡ Performance improvement
- [ ] 🔧 Chore / dependency update / config change

---

## Changes Made

<!-- List the specific changes in this PR -->

-
-
-

---

## Testing Done

<!-- Describe how you tested your changes. Check all that apply. -->

- [ ] Ran `npm run dev` — no build errors
- [ ] Tested the changed page(s) in the browser as **Coordinator** role
- [ ] Tested the changed page(s) in the browser as **Volunteer** role
- [ ] Tested on both light and dark modes (if applicable)
- [ ] Verified Firestore reads/writes work correctly
- [ ] Tested the affected API route(s) with valid and invalid inputs
- [ ] Verified Gemini AI integration still works (triage / insights)
- [ ] Confirmed no secrets or API keys are hardcoded
- [ ] Ran `npm run lint` — no new lint errors

---

## Screenshots / Recordings

<!-- Add screenshots or screen recordings for any UI changes. Before/after comparisons are helpful. -->

| Before | After |
|---|---|
| | |

---

## Firestore / Data Changes

<!-- Does this PR change the Firestore data schema or Firestore Security Rules? -->

- [ ] No Firestore schema changes
- [ ] Added new collection: `___`
- [ ] Added new fields to existing document: `___`
- [ ] Updated Firestore Security Rules
- [ ] Requires Firestore index changes

If Firestore rules or indexes changed, describe the update here:

---

## Environment Variables

<!-- Does this PR require new or changed environment variables? -->

- [ ] No new environment variables
- [ ] Added new variable(s) — listed below and added to `.env.local.example`:

```
NEW_VAR_NAME=description_of_what_it_does
```

---

## Checklist

- [ ] My code follows the [coding standards](../CONTRIBUTING.md#coding-standards) in `CONTRIBUTING.md`
- [ ] I have added/updated comments for complex logic
- [ ] I have not introduced any `console.log` in production code paths
- [ ] I have not used `any` TypeScript type without a comment explaining why
- [ ] All new Gemini calls go through `lib/gemini.ts → generateWithFallback()`
- [ ] All server-side Firebase operations use the Admin SDK (`lib/firebase-admin.ts`)
- [ ] All client-side real-time data uses `onSnapshot` with proper cleanup
- [ ] This PR is based on the latest `main` branch (rebased if needed)

---

## Additional Notes

<!-- Any context for reviewers — e.g. known limitations, follow-up work needed, decisions made. -->
