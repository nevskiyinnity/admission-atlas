import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { OpenAI } from 'openai';
import { Redis } from '@upstash/redis';
import { isNeuralEngineRateLimited } from '@/lib/neural-engine-rate-limit';
import { analyzeProfileSchema, parseBody } from '@/lib/validations';
import { buildNarrativePrompt, NARRATIVE_SYSTEM_MESSAGE } from '@/lib/prompts';
import { analyzeDeterministic } from '@/lib/neural-engine/scoring';
import { PINNED_NEXT_STEPS } from '@/lib/neural-engine/scoring';
import type { AnalysisPayload } from '@/lib/prompts';
import type { AnalysisResult, Alternative } from '@/lib/analysis-utils';
import { buildMockNarrative, mergeNextSteps } from '@/lib/analysis-utils';
import { logger } from '@/lib/logger';

const NARRATIVE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const NARRATIVE_CACHE_PREFIX = 'saju:neural-engine:narrative:';

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

type Narrative = {
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
  alternatives: Alternative[];
  categoryScores: { label: string; score: number }[];
  logs: string[];
};

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

/**
 * Canonical hash of the sorted payload — used as both the OpenAI `seed` (int)
 * and the Upstash cache key (hex) so identical inputs map to a single cached
 * narrative.
 */
function canonicalHash(payload: AnalysisPayload): { seed: number; key: string } {
  const keys = Object.keys(payload).sort();
  const canonical = JSON.stringify(payload, keys);
  const hash = createHash('sha256').update(canonical).digest();
  return {
    seed: hash.readUInt32BE(0) & 0x7fffffff,
    key: hash.toString('hex').slice(0, 32),
  };
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

    // 1. Deterministic engine: score, tiers, risk, expectation, summary, pinned steps
    const deterministic = analyzeDeterministic(payload);

    // 2. LLM narrative layer — strengths, concerns, alternatives. The score +
    //    summary + risk are NOT AI outputs. We cache by a hash of the payload so
    //    identical inputs return byte-identical narratives (spec §1).
    const hasRealKey =
      process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE';

    const { seed, key: payloadKey } = canonicalHash(payload);
    const cacheKey = `${NARRATIVE_CACHE_PREFIX}${payloadKey}`;

    let narrative: Narrative | null = null;

    if (redis) {
      try {
        const cached = (await redis.get(cacheKey)) as Narrative | null;
        if (cached && cached.strengths && cached.alternatives) {
          narrative = cached;
        }
      } catch (cacheError) {
        logger.error('Neural engine cache read failed', cacheError, { endpoint: '/api/neural-engine' });
      }
    }

    if (!narrative) {
      if (hasRealKey) {
        const completion = await getOpenAI().chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0,
          seed,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: NARRATIVE_SYSTEM_MESSAGE },
            { role: 'user', content: buildNarrativePrompt(payload, deterministic) },
          ],
        });
        narrative = JSON.parse(completion.choices[0].message.content!) as Narrative;
      } else {
        narrative = buildMockNarrative(payload, deterministic);
      }

      if (redis) {
        try {
          await redis.set(cacheKey, narrative, { ex: NARRATIVE_CACHE_TTL_SECONDS });
        } catch (cacheError) {
          logger.error('Neural engine cache write failed', cacheError, { endpoint: '/api/neural-engine' });
        }
      }
    }

    // 3. Merge: enforce pinned next steps (de-duped against LLM's list)
    const mergedNextSteps = mergeNextSteps(narrative.nextSteps ?? [], PINNED_NEXT_STEPS);

    const result: AnalysisResult & {
      risk: { label: string; message: string };
      expectation: { case: string; message: string };
      disclaimer: string;
      differentiation: string;
      academicBand: string;
      targetTier: string;
      studentTier: string;
    } = {
      institution: deterministic.resolvedUniversity?.name ?? payload.university,
      userTyped: payload.university,
      targetMatchPercent: deterministic.targetMatchPercent,
      summary: deterministic.summary,
      strengths: Array.isArray(narrative.strengths) ? narrative.strengths.slice(0, 5) : [],
      concerns: Array.isArray(narrative.concerns) ? narrative.concerns.slice(0, 4) : [],
      nextSteps: mergedNextSteps,
      categoryScores: Array.isArray(narrative.categoryScores) ? narrative.categoryScores : [],
      alternatives: Array.isArray(narrative.alternatives) ? narrative.alternatives.slice(0, 6) : [],
      logs: Array.isArray(narrative.logs) ? narrative.logs : [],
      risk: deterministic.risk,
      expectation: deterministic.expectation,
      disclaimer: deterministic.disclaimer,
      differentiation: deterministic.differentiation,
      academicBand: deterministic.academicBand,
      targetTier: deterministic.targetTier,
      studentTier: deterministic.studentTier,
    };

    return NextResponse.json({ ...result, mock: !hasRealKey });
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
