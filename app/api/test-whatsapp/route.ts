import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/whatsapp';

/**
 * Quick diagnostic endpoint — sends a test WhatsApp message.
 * Usage: POST /api/test-whatsapp  { "to": "+917249339058" }
 * Remove this route before going to production.
 */
export async function POST(req: NextRequest) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json({ error: 'Missing "to" field. Example: { "to": "+917249339058" }' }, { status: 400 });
    }

    const message =
      `✅ *VolunteerIQ WhatsApp Test*\n\n` +
      `If you received this message, WhatsApp integration is working correctly.\n\n` +
      `🕐 Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
      `📍 Sent to: ${to}\n\n` +
      `_VolunteerIQ Command Center_`;

    const result = await sendWhatsApp(to, message);

    return NextResponse.json({
      success: result.success,
      sid: (result as any).sid ?? null,
      sentTo: `whatsapp:${to}`,
      from: process.env.TWILIO_WHATSAPP_FROM,
      error: result.success ? null : result.error,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
