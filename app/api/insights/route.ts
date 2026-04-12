import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateWithFallback } from '@/lib/gemini';

// ── Skill ID → Label map (matches SKILL_OPTIONS in types.ts) ─────────────────
const SKILL_ID_TO_LABEL: Record<string, string> = {
  medical:      'Medical Response',
  logistics:    'Logistics & Supply',
  teaching:     'Teaching & Mentorship',
  food:         'Food Preparation',
  emergency:    'Emergency Response',
  mentalhealth: 'Mental Health Support',
  construction: 'Construction & Repair',
  tech:         'IT & Tech Support',
  legal:        'Legal Aid',
  translation:  'Translation & Interpretation',
  childcare:    'Childcare',
  eldercare:    'Elder Care',
};

function normaliseSkill(s: string): string {
  return SKILL_ID_TO_LABEL[s.toLowerCase().trim()] ?? s;
}

const CATEGORY_SKILL_MAP: Record<string, string[]> = {
  'Infrastructure':    ['Construction & Repair', 'IT & Tech Support', 'Logistics & Supply'],
  'Environment':       ['Construction & Repair', 'Logistics & Supply'],
  'Public Safety':     ['Emergency Response', 'Medical Response', 'Mental Health Support'],
  'Health & Welfare':  ['Medical Response', 'Mental Health Support', 'Elder Care', 'Childcare'],
  'Emergency Response':['Medical Response', 'Emergency Response', 'Logistics & Supply'],
  'Food Supply':       ['Food Preparation', 'Logistics & Supply'],
  'Other':             [],
};

function proximityLabel(issueLocation: string, volLocation: string): string {
  if (!volLocation) return 'Nearby';
  const iWords = issueLocation.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
  const vWords = volLocation.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
  if (iWords.some((w) => vWords.includes(w))) return '< 5km away';
  const iState = issueLocation.split(',').pop()?.trim().toLowerCase() ?? '';
  const vState = volLocation.split(',').pop()?.trim().toLowerCase() ?? '';
  if (iState && vState && iState === vState) return '< 50km away';
  return 'Nearby';
}

function skillScore(volSkills: string[], category: string): number {
  const relevant = CATEGORY_SKILL_MAP[category] ?? [];
  if (relevant.length === 0) return 5;
  const normVol = volSkills.map(normaliseSkill);
  const matches = normVol.filter((s) =>
    relevant.some((r) => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase()))
  );
  return matches.length > 0 ? 5 + Math.min(matches.length * 2, 5) : 3;
}

function localBestMatch(
  volList: Array<{ uid: string; name: string; skills: string[]; location: string; proximity: string }>,
  category: string
) {
  if (volList.length === 0) return null;
  return [...volList].sort((a, b) => {
    const scoreDiff = skillScore(b.skills, category) - skillScore(a.skills, category);
    if (scoreDiff !== 0) return scoreDiff;
    const prox = (p: string) => p.includes('5km') ? 0 : p.includes('50km') ? 1 : 2;
    return prox(a.proximity) - prox(b.proximity);
  })[0];
}

const BASE_RESPONSE = {
  forecastText: 'Deploying the matched volunteer is estimated to reduce resolution time significantly.',
  sentimentText: 'Community feedback trending positive in areas with active volunteer presence.',
  satisfactionScore: 8.4,
};

export async function POST(req: NextRequest) {
  let body: { issueId?: string; excludeVolunteers?: string[] } = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const { issueId, excludeVolunteers = [] } = body;
  if (!issueId) {
    return NextResponse.json({ ...BASE_RESPONSE, bestVolunteerMatchUid: '', bestVolunteerMatchName: 'No issue selected', bestVolunteerMatchSkill: '', bestVolunteerProximity: 'Nearby' });
  }

  try {
    // 1. Fetch issue
    const issueDoc = await adminDb.collection('issues').doc(issueId).get();
    if (!issueDoc.exists) {
      return NextResponse.json({ ...BASE_RESPONSE, bestVolunteerMatchUid: '', bestVolunteerMatchName: 'Issue not found', bestVolunteerMatchSkill: '', bestVolunteerProximity: 'Nearby' });
    }
    const issue = { issueId, ...issueDoc.data() } as Record<string, any>;
    const category = issue.suggestedCategory || issue.category || 'Other';

    // 2. Fetch all volunteers (single where — no composite index needed)
    const volSnap = await adminDb.collection('users').where('role', '==', 'volunteer').get();
    console.log(`[Insights] Total volunteers found: ${volSnap.size}`);

    const volunteers = volSnap.docs
      .map((d) => ({ uid: d.id, ...d.data() } as Record<string, any>))
      .filter((v) => {
        if (excludeVolunteers.includes(v.uid)) return false;
        const status = v.availabilityStatus;
        return !status || status === 'available';
      });

    console.log(`[Insights] Eligible: ${volunteers.length}, excluded: ${excludeVolunteers.length}`);

    // 3. Build enriched list
    const volList = volunteers.map((v) => {
      const rawSkills: string[] = v.skills ?? [];
      const normalisedSkills = rawSkills.map(normaliseSkill);
      return {
        uid: v.uid,
        name: v.name ?? 'Unknown',
        skills: normalisedSkills,
        rawSkills,
        location: v.location ?? '',
        proximity: proximityLabel(issue.location ?? '', v.location ?? ''),
        availabilityStatus: v.availabilityStatus ?? 'available',
      };
    });

    if (volList.length === 0) {
      return NextResponse.json({ ...BASE_RESPONSE, bestVolunteerMatchUid: '', bestVolunteerMatchName: 'No volunteers available', bestVolunteerMatchSkill: '', bestVolunteerProximity: 'N/A' });
    }

    // 4. Local best match (guaranteed fallback)
    const localMatch = localBestMatch(volList, category)!;

    if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY_2) {
      return NextResponse.json({ ...BASE_RESPONSE, bestVolunteerMatchUid: localMatch.uid, bestVolunteerMatchName: localMatch.name, bestVolunteerMatchSkill: localMatch.skills[0] ?? 'General', bestVolunteerProximity: localMatch.proximity });
    }

    // 5. Call Gemini via key-rotating helper
    const geminiVolList = volList.map(({ uid, name, skills, location, proximity, availabilityStatus }) => ({ uid, name, skills, location, proximity, availabilityStatus }));

    const prompt = `You are a volunteer dispatch AI for an NGO command center.

ISSUE TO RESOLVE:
- Title: ${issue.title}
- Category: ${category}
- Location: ${issue.location}
- Priority: ${issue.suggestedPriority || issue.urgency}
- Description: ${issue.description}
- Priority Reason: ${issue.priorityReason || 'N/A'}

AVAILABLE VOLUNTEERS (${geminiVolList.length} total):
${JSON.stringify(geminiVolList, null, 2)}

INSTRUCTIONS:
1. Select exactly ONE volunteer from the list. Use their uid field exactly.
2. Prefer volunteers whose skills match category "${category}".
3. Prefer volunteers with closer proximity.
4. Write a 1-sentence impact forecast.
5. Write a 1-sentence community sentiment observation.
6. Give a satisfaction score 1.0–10.0.

IMPORTANT: bestVolunteerMatchUid MUST be one of: ${geminiVolList.map((v) => v.uid).join(', ')}

Respond ONLY with valid JSON (no markdown):
{
  "bestVolunteerMatchUid": "<exact uid>",
  "bestVolunteerMatchName": "<name>",
  "bestVolunteerMatchSkill": "<most relevant skill>",
  "bestVolunteerProximity": "<proximity>",
  "forecastText": "<1 sentence>",
  "sentimentText": "<1 sentence>",
  "satisfactionScore": 8.5
}`;

    let parsed: Record<string, any> | null = null;
    try {
      const text = await generateWithFallback(prompt);
      console.log('[Insights] Gemini response:', text.substring(0, 200));
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (geminiErr) {
      console.error('[Insights] All Gemini keys exhausted:', geminiErr);
      // Fall through to local match
    }

    // 6. Validate UID, patch with local match if invalid
    const validUids = new Set(volList.map((v) => v.uid));
    if (parsed && !validUids.has(parsed.bestVolunteerMatchUid)) {
      console.warn(`[Insights] Invalid Gemini UID "${parsed.bestVolunteerMatchUid}" — using local match`);
      parsed.bestVolunteerMatchUid   = localMatch.uid;
      parsed.bestVolunteerMatchName  = localMatch.name;
      parsed.bestVolunteerMatchSkill = localMatch.skills[0] ?? 'General';
      parsed.bestVolunteerProximity  = localMatch.proximity;
    }

    if (!parsed) {
      parsed = { ...BASE_RESPONSE, bestVolunteerMatchUid: localMatch.uid, bestVolunteerMatchName: localMatch.name, bestVolunteerMatchSkill: localMatch.skills[0] ?? 'General', bestVolunteerProximity: localMatch.proximity };
    }

    if (!parsed.bestVolunteerProximity) {
      parsed.bestVolunteerProximity = volList.find((v) => v.uid === parsed!.bestVolunteerMatchUid)?.proximity ?? 'Nearby';
    }

    console.log(`[Insights] Final: ${parsed.bestVolunteerMatchName} (${parsed.bestVolunteerMatchUid})`);
    return NextResponse.json(parsed);

  } catch (err) {
    console.error('[Insights API Error]', err);
    return NextResponse.json({ ...BASE_RESPONSE, bestVolunteerMatchUid: '', bestVolunteerMatchName: 'Error generating report', bestVolunteerMatchSkill: '', bestVolunteerProximity: 'Nearby' });
  }
}
