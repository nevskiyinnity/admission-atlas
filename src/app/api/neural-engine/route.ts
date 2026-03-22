import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { isNeuralEngineRateLimited } from '@/lib/neural-engine-rate-limit';
import { analyzeProfileSchema, parseBody } from '@/lib/validations';
import { SYSTEM_MESSAGE, buildAnalysisPrompt } from '@/lib/prompts';
import { buildMockResponse, normalizeResult } from '@/lib/analysis-utils';
import { logger } from '@/lib/logger';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export async function POST(req: NextRequest) {
  // Rate limit by IP (public endpoint, no auth)
  const ip = getClientIp(req);
  if (await isNeuralEngineRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in 60 seconds.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  try {
    const body = await req.json();
    const parsed = parseBody(analyzeProfileSchema, body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const payload = parsed.data;

    // Mock fallback when no real API key is configured
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE'
    ) {
      return NextResponse.json({ ...buildMockResponse(payload), mock: true });
    }

    const completion = await getOpenAI().chat.completions.create({
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
    logger.error('Neural engine analysis failed', error, {
      endpoint: '/api/neural-engine',
    });
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 },
    );
  }
}
