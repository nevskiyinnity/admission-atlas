// Prompt builders for the college analysis endpoint.
//
// After the deterministic scoring refactor, the LLM's job is limited to narrative
// rendering: strengths, concerns, alternatives, category breakdown, and logs.
// The targetMatchPercent, summary copy, risk label, and expectation-gap message
// are all computed in code (see src/lib/neural-engine/scoring.ts) and passed to
// the LLM as context so it can write around them coherently.

import type { DeterministicAnalysis } from '@/lib/neural-engine/scoring';

export interface AnalysisPayload {
  name: string;
  residency?: string;
  gpa?: string;
  sat?: string;
  internationalExams?: string;
  otherExams?: string;
  coursework?: string;
  activities?: string;
  awards?: string;
  university: string;
  major: string;
  preferredRegions?: string;
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
  question6?: string;
  question7?: string;
  question8?: string;
  question9?: string;
}

/**
 * Sanitize a user-supplied string for safe embedding into an LLM prompt.
 */
export function sanitizeField(value: unknown, maxLength = 500): string {
  if (!value || typeof value !== 'string') return 'Not provided';
  const truncated = value.slice(0, maxLength);
  return JSON.stringify(truncated).slice(1, -1);
}

export const NARRATIVE_SYSTEM_MESSAGE =
  'You are a precise JSON generator for a university admissions analysis engine. ' +
  'You have expert-level knowledge of top-tier universities worldwide — US, UK, Europe, Canada, and Asia-Pacific — including their acceptance rates, costs, program strengths, and admissions requirements. ' +
  'The target-university match percentage, risk label, and summary sentence have already been computed deterministically — do not recalculate them. ' +
  'Your only job is to render specific, grounded strengths, concerns, alternatives, and process logs around the numbers you are given. ' +
  'Return only valid JSON with no markdown formatting.';

export function buildNarrativePrompt(payload: AnalysisPayload, det: DeterministicAnalysis): string {
  const resolvedName = det.resolvedUniversity?.name ?? payload.university;
  return `
You are an expert university admissions strategy analyst with global coverage (US, UK, Europe, Canada, Asia-Pacific).

The deterministic scoring pipeline has ALREADY computed:
- Target institution (resolved from user input): ${sanitizeField(resolvedName)}
- Target school match: ${det.targetMatchPercent}% (do NOT change this number)
- Target tier: ${det.targetTier}
- Student profile tier: ${det.studentTier}
- Academic band: ${det.academicBand}
- Differentiation level: ${det.differentiation}

Return a single valid JSON object with this exact shape:
{
  "strengths": string[],            // 3-5 items, each referencing specific profile details
  "concerns": string[],             // 2-4 items, honest and specific
  "nextSteps": string[],            // 2-4 additional steps — DO NOT duplicate these pinned items: "${det.pinnedNextSteps.join(' | ')}"
  "categoryScores": [{"label": string, "score": integer 0-100}],
  "alternatives": [{"name": string, "country": string, "matchPercent": integer 0-100, "why": string}],
  "logs": string[]
}

RULES:
1. CATEGORY SCORES: Use exactly these labels — Academics, Activities, Major Fit, Campus Fit, Affordability.
   Differentiate meaningfully (not clustered at 75). Affordability must reflect the student's stated budget.

2. ALTERNATIVES: Suggest 5-6 universities with match % REALISTIC vs the target (${det.targetMatchPercent}%).
   Prioritise institutions in the same region as the target (US, UK, Europe, Canada, or Asia-Pacific).
   If preferredRegions names specific countries, weight toward those.
   Each "why" must explain fit for THIS specific student (budget, major, constraints).
   Do NOT include the target institution itself.

3. LOGS: Generate 8-12 processing log entries referencing the student's specific data — name, scores, target, major.

4. HONESTY: Concerns should reflect real gaps. Don't soften. If the student is below the bar, say so specifically.

Applicant profile:
- Name: ${sanitizeField(payload.name)}
- Residency: ${sanitizeField(payload.residency)}
- GPA (4.0 scale): ${sanitizeField(payload.gpa)}
- SAT/ACT/standardized tests: ${sanitizeField(payload.sat)}
- A Levels / IB / AP / national qualifications: ${sanitizeField(payload.internationalExams)}
- Other exam systems: ${sanitizeField(payload.otherExams)}
- Advanced coursework: ${sanitizeField(payload.coursework)}
- Activities & leadership: ${sanitizeField(payload.activities)}
- Awards & honors: ${sanitizeField(payload.awards)}
- Target university (user-typed): ${sanitizeField(payload.university)}
- Intended major: ${sanitizeField(payload.major)}
- Preferred countries/regions: ${sanitizeField(payload.preferredRegions)}

Counseling responses:
1) Learning environment: ${sanitizeField(payload.question1)}
2) Best project/achievement: ${sanitizeField(payload.question2)}
3) Campus/location preference: ${sanitizeField(payload.question3)}
4) Affordability vs prestige: ${sanitizeField(payload.question4)}
5) Career goals: ${sanitizeField(payload.question5)}
6) Annual budget (tuition + living): ${sanitizeField(payload.question6)}
7) Scholarship/aid needs: ${sanitizeField(payload.question7)}
8) Support priorities: ${sanitizeField(payload.question8)}
9) Extracurricular preferences: ${sanitizeField(payload.question9)}
`;
}
