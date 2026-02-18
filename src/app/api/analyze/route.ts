import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { requireAuth, isAuthError } from '@/lib/api-auth';
import { analyzeProfileSchema, parseBody } from '@/lib/validations';
import { SYSTEM_MESSAGE, buildAnalysisPrompt } from '@/lib/prompts';
import { buildMockResponse, normalizeResult } from '@/lib/analysis-utils';
import { logger } from '@/lib/logger';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await req.json();
    const parsed = parseBody(analyzeProfileSchema, body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const payload = parsed.data;

    // When no real API key is configured, return a mock response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      return NextResponse.json(buildMockResponse(payload));
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: buildAnalysisPrompt(payload) },
      ],
    });

    const raw = JSON.parse(completion.choices[0].message.content!);
    const normalized = normalizeResult(raw, payload);

    // Ensure at least mock alternatives if the AI returned none
    if (!normalized.alternatives.length) {
      normalized.alternatives = buildMockResponse(payload).alternatives;
    }

    return NextResponse.json(normalized);
  } catch (error) {
    logger.error('Analysis failed', error, { endpoint: '/api/analyze' });
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 },
    );
  }
}
