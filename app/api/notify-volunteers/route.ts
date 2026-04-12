import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { buildWaLink } from '@/lib/whatsapp';
import { FieldValue } from 'firebase-admin/firestore';

const SKILL_ID_TO_LABEL: Record<string, string> = {
  medical: 'Medical Response', logistics: 'Logistics & Supply',
  teaching: 'Teaching & Mentorship', food: 'Food Preparation',
  emergency: 'Emergency Response', mentalhealth: 'Mental Health Support',
  construction: 'Construction & Repair', tech: 'IT & Tech Support',
  legal: 'Legal Aid', translation: 'Translation & Interpretation',
  childcare: 'Childcare', eldercare: 'Elder Care',
};
const normalise = (s: string) => SKILL_ID_TO_LABEL[s.toLowerCase().trim()] ?? s;

const CATEGORY_SKILL_MAP: Record<string, string[]> = {
  'Infrastructure':    ['Construction & Repair', 'IT & Tech Support', 'Logistics & Supply'],
  'Environment':       ['Construction & Repair', 'Logistics & Supply'],
  'Public Safety':     ['Emergency Response', 'Medical Response', 'Mental Health Support'],
  'Health & Welfare':  ['Medical Response', 'Mental Health Support', 'Elder Care', 'Childcare'],
  'Emergency Response':['Medical Response', 'Emergency Response', 'Logistics & Supply'],
  'Food Supply':       ['Food Preparation', 'Logistics & Supply'],
  'Other':             [],
};

function locationOverlap(loc1: string, loc2: string): boolean {
  if (!loc2) return true;
  const w1 = loc1.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
  const w2 = loc2.toLowerCase().split(/[\s,]+/).filter((w) => w.length > 2);
  return w1.some((w) => w2.includes(w));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { issueId, suggestedCategory, issueData } = body as {
      issueId: string;
      suggestedCategory: string;
      issueData: Record<string, any>;
    };

    if (!issueId || !issueData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const volSnap = await adminDb.collection('users').where('role', '==', 'volunteer').get();

    const matchingSkills = CATEGORY_SKILL_MAP[suggestedCategory] ?? [];
    const notifyAll = matchingSkills.length === 0;
    const ticketNum = `VIQ-${issueId.slice(-4).toUpperCase()}`;

    const messageText = [
      `🚨 *VolunteerIQ Alert*`,
      ``,
      `A new community issue has been reported that matches your skills.`,
      ``,
      `📋 *Issue:* ${issueData.title}`,
      `📍 *Location:* ${issueData.location}`,
      `⚡ *Priority:* ${(issueData.suggestedPriority || issueData.urgency || '').toUpperCase()}`,
      `🏷️ *Category:* ${suggestedCategory}`,
      ``,
      `📝 *Details:*`,
      `${(issueData.description ?? '').substring(0, 200)}`,
      ``,
      `🎫 *Ticket:* ${ticketNum}`,
      ``,
      `Reply *ACCEPT* to take this mission or *DECLINE* to pass.`,
      ``,
      `_VolunteerIQ Command Center_`,
    ].join('\n');

    const waLinks: Array<{ uid: string; name: string; phone: string; waLink: string }> = [];

    for (const docSnap of volSnap.docs) {
      if (waLinks.length >= 20) break;
      const vol = docSnap.data();
      if (!vol.phone) continue;

      const status = vol.availabilityStatus;
      if (status && status !== 'available') continue;

      const volSkills: string[] = (vol.skills ?? []).map(normalise);
      const skillOk = notifyAll || volSkills.some((s) =>
        matchingSkills.some((r) => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase()))
      );
      if (!skillOk) continue;
      if (!locationOverlap(issueData.location ?? '', vol.location ?? '')) continue;

      waLinks.push({
        uid: docSnap.id,
        name: vol.name,
        phone: vol.phone,
        waLink: buildWaLink(vol.phone, messageText),
      });
    }

    // Save notification log with all generated links
    await adminDb.collection('notifications').add({
      issueId,
      sentTo: waLinks.map((v) => v.uid),
      sentAt: FieldValue.serverTimestamp(),
      type: 'new_issue_alert',
      message: messageText,
      waLinks: waLinks.map(({ uid, name, waLink }) => ({ uid, name, waLink })),
    });

    console.log(`[NotifyVolunteers] Generated ${waLinks.length} wa.me links`);
    return NextResponse.json({ count: waLinks.length, waLinks });
  } catch (err) {
    console.error('[notify-volunteers] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
