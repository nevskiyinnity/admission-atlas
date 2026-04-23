// Utility functions for normalizing / mocking college analysis results.

import type { AnalysisPayload } from '@/lib/prompts';
import type { DeterministicAnalysis } from '@/lib/neural-engine/scoring';

export interface CategoryScore {
  label: string;
  score: number;
}

export interface Alternative {
  name: string;
  country: string;
  matchPercent: number;
  why: string;
}

export interface AnalysisResult {
  institution: string;
  userTyped?: string;
  targetMatchPercent: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
  categoryScores: CategoryScore[];
  alternatives: Alternative[];
  logs: string[];
}

export function clampPercent(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

/**
 * Build a mock narrative when OPENAI_API_KEY is not configured.
 * Fully deterministic given the payload — no Math.random() anywhere.
 */
export function buildMockNarrative(
  payload: AnalysisPayload,
  det: DeterministicAnalysis,
): {
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
  alternatives: Alternative[];
  categoryScores: CategoryScore[];
  logs: string[];
} {
  const institution = det.resolvedUniversity?.name ?? payload.university;

  // Deterministic category scores derived from deterministic inputs.
  const base = det.targetMatchPercent;
  const categoryScores: CategoryScore[] = [
    { label: 'Academics',   score: clampPercent(det.academicStrength) },
    { label: 'Activities',  score: clampPercent(det.differentiation === 'high' ? base + 8 : det.differentiation === 'medium' ? base : base - 8) },
    { label: 'Major Fit',   score: clampPercent(base + 2) },
    { label: 'Campus Fit',  score: clampPercent(base - 2) },
    { label: 'Affordability', score: clampPercent(base - 6) },
  ];

  // Deterministic alternatives (European bias, no randomness).
  const alternatives: Alternative[] = [
    { name: 'University of Amsterdam', country: 'Netherlands', matchPercent: clampPercent(base + 3), why: `Strong research environment aligned with ${payload.major || 'your major'}; international-friendly academic culture.` },
    { name: 'KU Leuven', country: 'Belgium', matchPercent: clampPercent(base + 2), why: 'Broad program catalog and notable research output — a balanced option across selectivity and cost.' },
    { name: 'University of Edinburgh', country: 'United Kingdom', matchPercent: clampPercent(base + 1), why: 'Research-intensive environment with strong humanities–STEM integration.' },
    { name: 'Trinity College Dublin', country: 'Ireland', matchPercent: clampPercent(base), why: 'Reputable across law, business, and technical fields; anglophone environment for international students.' },
    { name: 'University of Bologna', country: 'Italy', matchPercent: clampPercent(base - 2), why: 'Strong Europe-wide reputation and lower cost of attendance than UK/Swiss counterparts.' },
  ];

  return {
    strengths: [
      `${payload.name}'s coursework aligns with expectations for ${payload.major || 'the intended major'}.`,
      'Narrative responses show clear direction and career orientation.',
      'Activities demonstrate execution alongside participation.',
    ],
    concerns: [
      `${institution} remains highly selective — admissions are non-linear even at this match percentage.`,
      det.differentiation === 'low'
        ? 'Current profile lacks differentiating signals (leadership depth, awards, initiatives).'
        : 'Essay-specific positioning will determine how this profile is received.',
    ],
    nextSteps: [
      'Tailor essays to program-specific labs, faculty, or tracks.',
      'Quantify extracurricular outcomes with concrete metrics.',
    ],
    categoryScores,
    alternatives,
    logs: [
      `Ingesting ${payload.name}'s profile and narrative responses...`,
      `Normalizing academic metrics (GPA, exams) into a 0–100 academic strength...`,
      `Classifying differentiation level from activities, awards, and projects...`,
      `Resolving target university "${payload.university}" → ${institution} (${det.targetTier})`,
      `Applying academic cap (${det.targetTier}) and differentiation penalty...`,
      `Computing target school match = ${det.targetMatchPercent}%`,
      `Classifying risk (${det.risk.label}) and expectation gap (${det.expectation.case})...`,
      'Generating fit breakdown, alternatives, and recommendations...',
    ],
  };
}

/**
 * Merge LLM-generated next steps with the pinned items, de-duping by
 * first-80-char fuzzy similarity so phrased-differently duplicates are filtered.
 */
export function mergeNextSteps(llmSteps: string[], pinned: string[]): string[] {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const step of llmSteps) {
    const key = norm(step);
    if (!key || seen.has(key)) continue;
    // Skip LLM steps that clearly overlap with a pinned one.
    const overlapsPinned = pinned.some((p) => {
      const pKey = norm(p);
      return key.includes(pKey.slice(0, 30)) || pKey.includes(key.slice(0, 30));
    });
    if (overlapsPinned) continue;
    seen.add(key);
    result.push(step);
  }

  for (const p of pinned) {
    const key = norm(p);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(p);
    }
  }

  return result.slice(0, 6);
}
