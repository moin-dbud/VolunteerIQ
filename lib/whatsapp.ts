/**
 * WhatsApp helper — generates wa.me deep-links with pre-filled messages.
 * No server-side credentials required. Works with any WhatsApp number.
 *
 * Usage:
 *   buildWaLink("+917249339058", "Hello!\nThis is a test.")
 *   → "https://wa.me/917249339058?text=Hello!%0AThis%20is%20a%20test."
 */

/**
 * Strips non-digit characters + leading zeros, keeps country code digits.
 * "+91 7249-339058" → "917249339058"
 */
export function sanitisePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0+/, '');
}

/**
 * Returns a wa.me link that opens WhatsApp with a pre-filled message.
 * @param phone  E.164 format: "+917249339058" or plain "917249339058"
 * @param text   Plain text message (newlines supported)
 */
export function buildWaLink(phone: string, text: string): string {
  const digits = sanitisePhone(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${encoded}`;
}
