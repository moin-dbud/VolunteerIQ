import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { buildWaLink } from '@/lib/whatsapp';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dispatchId, response, issueId, volunteerUid } = body as {
      dispatchId: string;
      response: 'accepted' | 'rejected';
      issueId: string;
      volunteerUid: string;
    };

    if (!dispatchId || !response || !issueId || !volunteerUid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    if (response === 'accepted') {
      await adminDb.collection('dispatches').doc(dispatchId).update({ status: 'accepted', respondedAt: now });
      await adminDb.collection('issues').doc(issueId).update({
        status: 'assigned',
        ticketStatus: 'volunteers_assigned',
        assignedVolunteers: FieldValue.arrayUnion(volunteerUid),
        updatedAt: now,
      });

      // Build confirmation wa.me link
      const issueDoc = await adminDb.collection('issues').doc(issueId).get();
      const issue = issueDoc.data() ?? {};
      const volDoc = await adminDb.collection('users').doc(volunteerUid).get();
      const vol = volDoc.data() ?? {};
      const ticketNum = `VIQ-${issueId.slice(-4).toUpperCase()}`;

      const confirmText = [
        `✅ *Assignment Confirmed — VolunteerIQ*`,
        ``,
        `Hi ${vol.name || 'Volunteer'}, you have been officially assigned to this mission.`,
        ``,
        `📋 *Mission:* ${issue.title}`,
        `📍 *Location:* ${issue.location}`,
        `🎫 *Ticket:* ${ticketNum}`,
        ``,
        `Please proceed to the mission location at the earliest.`,
        ``,
        `Thank you for making a difference! 🙏`,
        `_VolunteerIQ Command Center_`,
      ].join('\n');

      const waLink = vol.phone ? buildWaLink(vol.phone as string, confirmText) : null;

      await adminDb.collection('notifications').add({
        issueId, sentTo: [volunteerUid],
        sentAt: now, type: 'assignment_confirmed',
        message: confirmText, waLink,
      });

      return NextResponse.json({ success: true, status: 'accepted', waLink });
    } else {
      await adminDb.collection('dispatches').doc(dispatchId).update({ status: 'rejected', respondedAt: now });
      await adminDb.collection('issues').doc(issueId).update({
        rejectedVolunteers: FieldValue.arrayUnion(volunteerUid),
        updatedAt: now,
      });
      return NextResponse.json({ success: true, status: 'rejected', waLink: null });
    }
  } catch (err) {
    console.error('[dispatch-response] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
