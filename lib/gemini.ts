import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from '@google/generative-ai';

/**
 * Free-tier friendly model with the highest quota limits.
 * gemini-2.0-flash-lite: 30 RPM, 1500 RPD on free tier.
 */
export const GEMINI_MODEL = 'gemini-2.0-flash-lite';

/**
 * Returns a GoogleGenerativeAI client, cycling through available API keys.
 * Add GEMINI_API_KEY_2 (and _3, _4…) to .env.local for additional keys.
 */
function getClients(): GoogleGenerativeAI[] {
  const keys: GoogleGenerativeAI[] = [];
  const primary = process.env.GEMINI_API_KEY;
  if (primary) keys.push(new GoogleGenerativeAI(primary));

  // Additional keys: GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.
  for (let i = 2; i <= 5; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k) keys.push(new GoogleGenerativeAI(k));
  }
  return keys;
}

/**
 * Calls Gemini with automatic key rotation on 429 / 404.
 * Tries each API key in order until one succeeds or all fail.
 */
export async function generateWithFallback(prompt: string): Promise<string> {
  const clients = getClients();

  if (clients.length === 0) {
    throw new Error('No GEMINI_API_KEY configured in environment variables.');
  }

  let lastError: unknown;

  for (const client of clients) {
    try {
      const model = client.getGenerativeModel({ model: GEMINI_MODEL });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: unknown) {
      lastError = err;
      // Only rotate key on quota (429) or not-found (404) errors
      if (err instanceof GoogleGenerativeAIFetchError) {
        if (err.status === 429 || err.status === 404) {
          console.warn(`[Gemini] Key failed with ${err.status}, trying next key…`);
          continue; // try the next key
        }
      }
      // Any other error → throw immediately (don't try more keys)
      throw err;
    }
  }

  // All keys exhausted
  throw lastError;
}
