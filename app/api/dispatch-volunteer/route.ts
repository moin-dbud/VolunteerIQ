import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { buildWaLink } from '@/lib/whatsapp';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { issueId, volunteerUid, coordinatorUid } = body as {
      issueId: string;
      volunteerUid: string;
      coordinatorUid: string;
    };

    if (!issueId || !volunteerUid || !coordinatorUid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch volunteer
    const volDoc = await adminDb.collection('users').doc(volunteerUid).get();
    if (!volDoc.exists) return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    const vol = volDoc.data()!;

    // Fetch issue
    const issueDoc = await adminDb.collection('issues').doc(issueId).get();
    if (!issueDoc.exists) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    const issue = issueDoc.data()!;

    const ticketNum = `VIQ-${issueId.slice(-4).toUpperCase()}`;

    const messageText = [
      `🎯 *VolunteerIQ Dispatch Request*`,
      ``,
      `Hi ${vol.name || 'Volunteer'},`,
      `You have been selected as the best match for an urgent mission.`,
      ``,
      `📋 *Mission:* ${issue.title}`,
      `📍 *Location:* ${issue.location}`,
      `⚡ *Priority:* ${(issue.suggestedPriority || issue.urgency || '').toUpperCase()}`,
      `🏷️ *Category:* ${issue.suggestedCategory || issue.category}`,
      ``,
      `📝 *Details:*`,
      `${(issue.description ?? '').substring(0, 150)}`,
      ``,
      `🎫 *Ticket:* ${ticketNum}`,
      ``,
      `Please reply with *ACCEPT* or *DECLINE* to confirm your availability.`,
      ``,
      `_VolunteerIQ Command Center_`,
    ].join('\n');

    // Build wa.me link (if volunteer has phone)
    const waLink = vol.phone ? buildWaLink(vol.phone, messageText) : null;

    // Save dispatch record
    const dispatchRef = await adminDb.collection('dispatches').add({
      issueId,
      volunteerUid,
      coordinatorUid,
      status: 'pending',
      dispatchedAt: FieldValue.serverTimestamp(),
      respondedAt: null,
    });

    // Log notification
    await adminDb.collection('notifications').add({
      issueId,
      sentTo: [volunteerUid],
      sentAt: FieldValue.serverTimestamp(),
      type: 'dispatch_request',
      message: messageText,
      waLink,
    });

    return NextResponse.json({
      success: true,
      dispatchId: dispatchRef.id,
      waLink,
      volunteerName: vol.name,
      volunteerPhone: vol.phone ?? null,
      hasPhone: !!vol.phone,
    });
  } catch (err) {
    console.error('[dispatch-volunteer] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
