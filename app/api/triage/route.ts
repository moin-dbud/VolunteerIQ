import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  let body: Record<string, string> & { issueId?: string; issueData?: Record<string, any> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ suggestedCategory: '', suggestedPriority: '', priorityReason: '' });
  }

  const { title, category, location, urgency, description, issueId, issueData } = body;

  // Fire-and-forget WhatsApp notifications
  if (issueId && issueData) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    fetch(`${baseUrl}/api/notify-volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId, suggestedCategory: category, issueData }),
    }).catch(console.error);
  }

  const prompt = `You are an AI triage system for an NGO command center.

An issue has been reported with these details:
- Title: ${title}
- Category selected by reporter: ${category}
- Location: ${location}
- Urgency selected by reporter: ${urgency}
- Description: ${description}

Based on this information:
1. Confirm or correct the category. Options: Infrastructure, Environment, Public Safety, Health & Welfare, Emergency Response.
2. Confirm or escalate the urgency. Options: low, medium, high, urgent.
3. Provide a 1-sentence reason for your urgency decision.

Respond ONLY in this JSON format (no markdown):
{
  "suggestedCategory": "",
  "suggestedPriority": "",
  "priorityReason": ""
}`;

  try {
    const text = await generateWithFallback(prompt);

    let parsed: Record<string, string> | null = null;
    try {
      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.warn('[Triage] JSON parse failed, using fallback', parseErr);
    }

    return NextResponse.json(parsed ?? { suggestedCategory: category, suggestedPriority: urgency, priorityReason: '' });
  } catch (err) {
    console.error('[Triage API Error]', err);
    return NextResponse.json({ suggestedCategory: category || '', suggestedPriority: urgency || '', priorityReason: '' });
  }
}
