// Utility functions for normalizing / mocking college analysis results.
// Ported from admission-atlas-landing/lib/utils.js

import type { AnalysisPayload } from '@/lib/prompts';

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

export function ensureStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function buildMockResponse(payload: AnalysisPayload): AnalysisResult {
  const gpa = Number(payload.gpa || 0);
  const majorBoost = /computer|engineering|data|science/i.test(payload.major || '') ? 3 : 0;
  const hasGlobalExamSignals = Boolean(payload.internationalExams || payload.otherExams);
  const base = gpa >= 3.8 ? 83 : gpa >= 3.5 ? 76 : hasGlobalExamSignals ? 74 : 68;
  const variance = Math.floor(Math.random() * 10);
  const targetMatchPercent = clampPercent(base + majorBoost + variance, 74);

  const alternatives: Alternative[] = [
    { name: 'University of Toronto', country: 'Canada', matchPercent: clampPercent(targetMatchPercent + 5), why: 'Strong computing research, global employer pipeline, and broad program flexibility.' },
    { name: 'University College London', country: 'United Kingdom', matchPercent: clampPercent(targetMatchPercent + 4), why: 'High academic rigor and strong outcomes in technology and quantitative disciplines.' },
    { name: 'National University of Singapore', country: 'Singapore', matchPercent: clampPercent(targetMatchPercent + 3), why: 'Top-tier engineering and computing ecosystem with strong regional industry access.' },
    { name: 'University of Melbourne', country: 'Australia', matchPercent: clampPercent(targetMatchPercent + 2), why: 'Well-rounded global degree structure with strong postgraduate pathways.' },
    { name: 'Delft University of Technology', country: 'Netherlands', matchPercent: clampPercent(targetMatchPercent + 4), why: 'Applied STEM focus with excellent technical depth and international student support.' },
  ];

  return {
    institution: payload.university,
    targetMatchPercent,
    summary: `${payload.name} has a competitive profile for ${payload.major} with strongest leverage in academics and technical impact.`,
    strengths: [
      'High-rigor coursework aligns with admissions expectations for competitive majors.',
      'Activities demonstrate leadership plus execution, not just participation.',
      'Narrative responses show clear career direction and outcome focus.',
    ],
    concerns: [
      'Target institution remains highly selective even for strong applicants.',
      'Application essays should connect accomplishments to specific campus resources and budget fit.',
    ],
    nextSteps: [
      'Finalize a balanced school list including reach, target, and likely options.',
      'Tailor essays to program-specific labs, tracks, or faculty interests.',
      'Quantify project outcomes in activities section with concrete metrics.',
      'Prioritize scholarships and lower-cost pathways that align with budget targets.',
    ],
    categoryScores: [
      { label: 'Academics', score: clampPercent(targetMatchPercent + 2) },
      { label: 'Activities', score: clampPercent(targetMatchPercent - 4) },
      { label: 'Major Fit', score: clampPercent(targetMatchPercent + 3) },
      { label: 'Campus Fit', score: clampPercent(targetMatchPercent - 2) },
      { label: 'Affordability', score: clampPercent(targetMatchPercent - 6) },
    ],
    alternatives,
    logs: [
      'Ingesting full applicant profile and narrative responses...',
      'Scoring academic rigor against target-major expectations...',
      'Converting SAT/ACT, A Levels, IB, and other exam formats into a normalized profile...',
      'Applying annual budget and aid constraints to shortlist filtering...',
      'Estimating admit competitiveness versus school selectivity...',
      'Comparing preference signals with campus and region characteristics...',
      'Building ranked worldwide university shortlist...',
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeResult(raw: any, payload: AnalysisPayload): AnalysisResult {
  const categoryScores: unknown[] = Array.isArray(raw.categoryScores) ? raw.categoryScores : [];
  const normalizedCategories = categoryScores
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => ({
      label: String(item?.label || '').trim(),
      score: clampPercent(item?.score, 70),
    }))
    .filter((item) => item.label)
    .slice(0, 6);

  const alternatives: Alternative[] = Array.isArray(raw.alternatives)
    ? raw.alternatives
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => ({
          name: String(item?.name || '').trim(),
          country: String(item?.country || '').trim(),
          matchPercent: clampPercent(item?.matchPercent, 70),
          why: String(item?.why || '').trim(),
        }))
        .filter((item: Alternative) => item.name)
        .slice(0, 6)
    : [];

  return {
    institution: String(raw.institution || payload.university),
    userTyped: String(raw.userTyped || payload.university),
    targetMatchPercent: clampPercent(raw.targetMatchPercent ?? raw.compatibilityScore, 70),
    summary: String(raw.summary || `${payload.name}'s profile has a moderate-to-strong fit for ${payload.university}.`),
    strengths: ensureStringArray(raw.strengths, ['Competitive academics for the target major.']),
    concerns: ensureStringArray(raw.concerns, ['Selective admissions uncertainty remains high.']),
    nextSteps: ensureStringArray(raw.nextSteps, ['Strengthen application narrative with school-specific fit.']),
    categoryScores: normalizedCategories.length
      ? normalizedCategories
      : [
          { label: 'Academics', score: 78 },
          { label: 'Activities', score: 74 },
          { label: 'Major Fit', score: 77 },
          { label: 'Campus Fit', score: 72 },
          { label: 'Affordability', score: 69 },
        ],
    alternatives,
    logs: ensureStringArray(raw.logs, ['Generating admissions analysis...']),
  };
}
