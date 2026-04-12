import { NextRequest, NextResponse } from 'next/server';
import { buildWaLink } from '@/lib/whatsapp';

/**
 * Diagnostic endpoint — returns a wa.me test link.
 * Usage: POST /api/test-whatsapp  { "to": "+917249339058" }
 * Remove this route before going to production.
 */
export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: 'Missing "to" field. Example: { "to": "+917249339058" }' },
        { status: 400 }
      );
    }

    const message =
      `✅ *VolunteerIQ WhatsApp Test*\n\n` +
      `If you can open this link, WhatsApp dispatch is working correctly.\n\n` +
      `🕐 Generated at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
      `📍 Recipient: ${to}\n\n` +
      `_VolunteerIQ Command Center_`;

    const waLink = buildWaLink(to, message);

    return NextResponse.json({
      success: true,
      waLink,
      message: 'Open the waLink in a browser to send the test message via WhatsApp.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
