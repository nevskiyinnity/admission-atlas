/**
 * Deterministic scoring engine for the SAJU Neural Engine.
 *
 * Given the same applicant payload, this module returns identical outputs every
 * time — no randomness, no LLM input into the score. The LLM is reserved for
 * narrative rendering around deterministic numbers.
 *
 * Implements spec items 4, 5, 6, 7, 8, 10 from SAJU Neural Engine spec v1:
 *   4. Academic cap multiplier by European ranking tier
 *   5. Differentiation classification + tier-based penalty
 *   6. Final-score risk label + message
 *   7. Expectation gap between student tier and target tier
 *   8. Summary-message case selector (11 cases)
 *  10. Pinned "Next Steps" block
 */

import type { AnalysisPayload } from '@/lib/prompts';
import { EuropeTier, RankedUniversity, benchmarkUniversity, tierForTarget, tierForRank } from './rankings';

export type Differentiation = 'low' | 'medium' | 'high';
export type AcademicBand = 'low' | 'medium' | 'high';
export type RiskLabel = 'safe' | 'balanced' | 'high-risk';
export type ExpectationCase = 'below' | 'match' | 'above';

/* ───────────────────────────────────────────────────────────────
   Academic strength — deterministic 0–100 band from GPA + tests
   ─────────────────────────────────────────────────────────────── */

function parseGpaScore(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(String(raw).trim());
  if (Number.isNaN(n) || n <= 0) return null;
  // Normalize to a 0–100 academic contribution:
  // 3.90+ → 92, 3.70-3.89 → 85, 3.50-3.69 → 76, 3.20-3.49 → 66, below → 55
  if (n >= 3.9) return 92;
  if (n >= 3.7) return 85;
  if (n >= 3.5) return 76;
  if (n >= 3.2) return 66;
  return 55;
}

/** Extract a SAT/ACT/IB/A-Level signal from the loose text the user typed. */
function parseTestBoost(sat: string | undefined, intlExams: string | undefined): number {
  const text = `${sat ?? ''} ${intlExams ?? ''}`.toLowerCase();

  // SAT (400–1600). Pull the first 4-digit number in that range.
  const satMatch = text.match(/\b(1[0-6]\d\d|[4-9]\d\d)\b/);
  if (satMatch) {
    const s = Number(satMatch[1]);
    if (s >= 1500) return 8;
    if (s >= 1400) return 5;
    if (s >= 1300) return 2;
    if (s >= 1200) return -2;
    if (s) return -6;
  }

  // ACT 1-36
  const actMatch = text.match(/act[^\d]*(\d{1,2})/);
  if (actMatch) {
    const a = Number(actMatch[1]);
    if (a >= 34) return 8;
    if (a >= 31) return 5;
    if (a >= 28) return 2;
    if (a) return -2;
  }

  // IB total score (out of 45)
  const ibMatch = text.match(/ib[^\d]*(\d{2})(?:\s*\/?\s*45)?/);
  if (ibMatch) {
    const ib = Number(ibMatch[1]);
    if (ib >= 42) return 8;
    if (ib >= 38) return 5;
    if (ib >= 34) return 2;
    if (ib) return -2;
  }

  // A-Levels (A*, A, B…). Count A*s and As in an "AAA", "A*A*A" string.
  if (/a\s*\*|a-level|alevel/.test(text)) {
    const starCount = (text.match(/a\s*\*/g) ?? []).length;
    const aOnlyCount = (text.match(/(?<!\*)a(?![a-z])/gi) ?? []).length;
    if (starCount >= 3) return 8;
    if (starCount + aOnlyCount >= 3) return 5;
    if (starCount + aOnlyCount >= 2) return 2;
  }

  return 0;
}

/** Returns a 0–100 academic strength value (before tier cap is applied). */
export function scoreAcademicStrength(payload: AnalysisPayload): number {
  const base = parseGpaScore(payload.gpa) ?? 70; // no GPA → assume middle-ish baseline
  const boost = parseTestBoost(payload.sat, payload.internationalExams);
  return Math.max(0, Math.min(100, base + boost));
}

/** Bucket academic strength into low/medium/high bands for case selection. */
export function academicBand(strength: number): AcademicBand {
  if (strength >= 85) return 'high';
  if (strength >= 65) return 'medium';
  return 'low';
}

/* ───────────────────────────────────────────────────────────────
   Differentiation — leadership + initiative + awards + impact
   ─────────────────────────────────────────────────────────────── */

const LEADERSHIP_PATTERNS = [
  /\bfound(er|ed)\b/i,
  /\bco[- ]?founder\b/i,
  /\bpresident\b/i,
  /\bcaptain\b/i,
  /\blead(s|er|ership)?\b/i,
  /\borganiz(ed|er)\b/i,
  /\bchair(ed|man|person)?\b/i,
];

const INITIATIVE_PATTERNS = [
  /\bproject\b/i,
  /\bbuilt\b/i,
  /\bcreated\b/i,
  /\bdevelop(ed|ing)?\b/i,
  /\binitiative\b/i,
  /\blaunched\b/i,
  /\bresearch\b/i,
  /\bpublish(ed|ing)?\b/i,
];

const AWARD_PATTERNS = [
  /\bnational\b/i,
  /\binternational\b/i,
  /\bolympiad\b/i,
  /\bfinalist\b/i,
  /\bwinner\b/i,
  /\bchampion\b/i,
  /\bscholarship\b/i,
  /\bgold\b/i,
  /\bsilver\b/i,
  /\bfellow(ship)?\b/i,
];

const IMPACT_PATTERNS = [
  /\b\d{2,}\s*(?:students|members|people|hours|users|followers)\b/i,
  /\b\d{3,}\b/,                 // any 3+ digit number → tangible scale
  /\bfund(ed|raised|raising)\b/i,
  /\bstart[- ]?up\b/i,
];

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((acc, re) => acc + (re.test(text) ? 1 : 0), 0);
}

/** Deterministic Low/Medium/High differentiation based on activities + awards + projects. */
export function scoreDifferentiation(payload: AnalysisPayload): Differentiation {
  const narrative = [
    payload.activities,
    payload.awards,
    payload.question2,  // "best project / achievement"
    payload.question9,  // "extracurricular preferences"
  ]
    .filter(Boolean)
    .join(' \n ');

  if (!narrative.trim()) return 'low';

  const leadership = countMatches(narrative, LEADERSHIP_PATTERNS);
  const initiative = countMatches(narrative, INITIATIVE_PATTERNS);
  const awards = countMatches(narrative, AWARD_PATTERNS);
  const impact = countMatches(narrative, IMPACT_PATTERNS);

  const total = leadership + initiative + awards + impact;

  // Thresholds tuned so that genuinely scattered profiles fall to Low
  // and profiles with ≥2 categories represented reach Medium+.
  if (total >= 6 || (awards >= 2 && leadership >= 1)) return 'high';
  if (total >= 3) return 'medium';
  return 'low';
}

/* ───────────────────────────────────────────────────────────────
   Fit score — academic cap + differentiation penalty
   ─────────────────────────────────────────────────────────────── */

const ACADEMIC_CAP: Record<EuropeTier, number> = {
  top10:   0.7,
  top30:   0.8,
  top50:   0.9,
  broader: 1.0,
};

const DIFFERENTIATION_PENALTY: Record<EuropeTier, Record<Differentiation, number>> = {
  top10:   { low: 20, medium: 15, high: 10 },
  top30:   { low: 15, medium: 5,  high: 0 },
  top50:   { low: 5,  medium: 0,  high: 0 },
  broader: { low: 0,  medium: 0,  high: 0 },
};

/**
 * Compute the final Target School Match percentage.
 *
 * Formula (spec §4, §5):
 *   coreFit = academicStrength × academicCap(tier)      // spec §4: academic cap
 *   final   = coreFit − differentiationPenalty(tier, differentiation)   // spec §5: penalty after core
 *
 * The spec defines only penalties, not bonuses. High differentiation helps an
 * applicant by *avoiding* penalties that Low differentiation would incur — it
 * doesn't inflate the score on its own. Clamped to [0, 100].
 */
export function computeFitScore(
  academicStrength: number,
  differentiation: Differentiation,
  tier: EuropeTier,
): number {
  const coreFit = academicStrength * ACADEMIC_CAP[tier];
  const penalty = DIFFERENTIATION_PENALTY[tier][differentiation];
  const final = coreFit - penalty;
  return Math.max(0, Math.min(100, Math.round(final)));
}

/* ───────────────────────────────────────────────────────────────
   Risk label — spec §6
   ─────────────────────────────────────────────────────────────── */

export const RISK_MESSAGES: Record<RiskLabel, string> = {
  'safe':
    'Your current target university falls into a safe option category. It is strongly advised to consider other more competitive options to create a more balanced application list.',
  'balanced':
    'Your current target university falls into the balanced option category. It is recommended to consider a mix of safer and more competitive options to create a balanced application list.',
  'high-risk':
    'Your current target university falls into a higher-risk category. It is strongly advised to consider other safer options that better match your profile.',
};

export function riskLabelFor(score: number): RiskLabel {
  if (score > 85) return 'safe';
  if (score >= 65) return 'balanced';
  return 'high-risk';
}

/* ───────────────────────────────────────────────────────────────
   Expectation gap — spec §7
   ─────────────────────────────────────────────────────────────── */

/**
 * Classify the student's profile tier by computing the fit score against a
 * benchmark university at each tier and returning the first tier whose score
 * is ≥ 85 (spec §7). If none reach 85, the student is Broader Europe.
 */
export function classifyStudentTier(
  academicStrength: number,
  differentiation: Differentiation,
): EuropeTier {
  const top10Bench = benchmarkUniversity('top10');  // ~rank 5
  if (computeFitScore(academicStrength, differentiation, tierForRank(top10Bench.rank)) >= 85) return 'top10';

  const top30Bench = benchmarkUniversity('top30');  // ~rank 20
  if (computeFitScore(academicStrength, differentiation, tierForRank(top30Bench.rank)) >= 85) return 'top30';

  const top50Bench = benchmarkUniversity('top50');  // ~rank 40
  if (computeFitScore(academicStrength, differentiation, tierForRank(top50Bench.rank)) >= 85) return 'top50';

  return 'broader';
}

const TIER_ORDER: Record<EuropeTier, number> = {
  top10: 4,
  top30: 3,
  top50: 2,
  broader: 1,
};

export const EXPECTATION_MESSAGES: Record<ExpectationCase, string> = {
  below:
    'There is a gap between your current profile positioning and your target university level. This does not mean your goal is impossible, but your application strategy must be highly competitive and your university list should be diversified to account for safer options.',
  match:
    'Your current profile is consistent with the tier of your target university. However, at this level, admissions will depend on applicant positioning and differentiation from other students.',
  above:
    'Your current profile appears stronger than the level of your target university. This may indicate that you should consider more competitive options within your application strategy.',
};

export function expectationCaseFor(studentTier: EuropeTier, targetTier: EuropeTier): ExpectationCase {
  const s = TIER_ORDER[studentTier];
  const t = TIER_ORDER[targetTier];
  if (s < t) return 'below';
  if (s === t) return 'match';
  return 'above';
}

/* ───────────────────────────────────────────────────────────────
   Summary case — spec §8 (11 cases)
   ─────────────────────────────────────────────────────────────── */

/** Case 1 is Top 30 for spec purposes: ranks 1..30 inclusive. */
function isTop30(tier: EuropeTier): boolean {
  return tier === 'top10' || tier === 'top30';
}

/**
 * Select the deterministic summary copy for this applicant/target pair.
 *
 * Resolution order matters — more-specific cases first so `medium|low`
 * combinations don't accidentally match a `low` case.
 */
export function summaryCopyFor(
  academic: AcademicBand,
  diff: Differentiation,
  tier: EuropeTier,
): string {
  const top30 = isTop30(tier);

  // Case 1: high + high + Top30
  if (academic === 'high' && diff === 'high' && top30) {
    return 'You present a strong and well-balanced profile for this university, combining both academic performance and clear differentiation. However, due to this university’s tier, success will still depend on how the student positions themselves through their application.';
  }
  // Case 2: high + high + non-Top30
  if (academic === 'high' && diff === 'high' && !top30) {
    return 'You present a strong and well-balanced profile for this university, combining both academic performance and clear differentiation. You should consider balancing your university list by applying to more competitive universities.';
  }
  // Case 3: high + (medium|low) + Top30
  if (academic === 'high' && (diff === 'medium' || diff === 'low') && top30) {
    return 'You are academically competitive for this university, but your current profile lacks the level of differentiation typically required for admission.';
  }
  // Case 4: medium + high + non-Top30
  if (academic === 'medium' && diff === 'high' && !top30) {
    return 'Your profile is reasonably aligned with this university, though strengthening academics could significantly improve your positioning.';
  }
  // Case 5: high + medium + non-Top30
  if (academic === 'high' && diff === 'medium' && !top30) {
    return 'Your profile is reasonably aligned with this university, though strengthening the level of differentiation could significantly improve your positioning.';
  }
  // Case 6: high + low + non-Top30
  if (academic === 'high' && diff === 'low' && !top30) {
    return 'Your academic profile is well aligned with the expectations of this university. However, your level of differentiation needs to be strengthened to reduce application risk.';
  }
  // Case 7: (medium|low) + high + Top30
  if ((academic === 'medium' || academic === 'low') && diff === 'high' && top30) {
    return 'Your current academic profile may not yet meet the standards typically expected by this university, making this a high-risk option within your application strategy.';
  }
  // Case 8: low + high + non-Top30
  if (academic === 'low' && diff === 'high' && !top30) {
    return 'Your current academic profile may fall below the typical standards for this university, suggesting this might be a higher-risk option, despite your strong level of differentiation.';
  }
  // Case 9: (medium|low) + (medium|low) + Top30
  if ((academic === 'medium' || academic === 'low') && (diff === 'medium' || diff === 'low') && top30) {
    return 'Your current academic profile and level of differentiation may not yet meet the standards typically expected by this university, making this a high-risk option within your application strategy.';
  }
  // Case 10: medium + (medium|low) + non-Top30
  if (academic === 'medium' && (diff === 'medium' || diff === 'low') && !top30) {
    return 'Your profile is reasonably aligned with this university. However, academic performance and differentiating factors need to be strengthened for you to stand out and be a more competitive applicant.';
  }
  // Case 11: low + (medium|low) + non-Top30
  return 'Your current academic profile may fall below the typical standards for this university, suggesting this might be a higher-risk option.';
}

/* ───────────────────────────────────────────────────────────────
   Pinned next steps — spec §10
   Always included in every report. Caller should de-dup against
   any LLM-generated next steps before merging.
   ─────────────────────────────────────────────────────────────── */

export const PINNED_NEXT_STEPS = [
  'Strengthen your differentiation through high-impact, field-relevant projects or initiatives.',
  'Rebalance your university list to include a mix of high-risk, balanced, and safer options.',
  'Develop a clearer positioning strategy to present your profile effectively within highly competitive admissions contexts.',
];

/** Post-report disclaimer (spec §8 closing). */
export const REPORT_DISCLAIMER =
  'This report is based on surface data and therefore may not represent reality with full accuracy. For a more detailed analysis, book your Initial Consultation with one of our experts.';

/* ───────────────────────────────────────────────────────────────
   Top-level: one pass to compute every deterministic field
   ─────────────────────────────────────────────────────────────── */

export interface DeterministicAnalysis {
  academicStrength: number;           // 0-100, pre-cap
  academicBand: AcademicBand;
  differentiation: Differentiation;
  targetTier: EuropeTier;
  studentTier: EuropeTier;
  resolvedUniversity: RankedUniversity | null;
  targetMatchPercent: number;
  risk: { label: RiskLabel; message: string };
  expectation: { case: ExpectationCase; message: string };
  summary: string;                    // one of the 11 summary cases
  pinnedNextSteps: string[];
  disclaimer: string;
}

export function analyzeDeterministic(payload: AnalysisPayload): DeterministicAnalysis {
  const academicStrength = scoreAcademicStrength(payload);
  const band = academicBand(academicStrength);
  const differentiation = scoreDifferentiation(payload);
  const { tier: targetTier, resolved: resolvedUniversity } = tierForTarget(payload.university);
  const targetMatchPercent = computeFitScore(academicStrength, differentiation, targetTier);
  const studentTier = classifyStudentTier(academicStrength, differentiation);
  const riskLabel = riskLabelFor(targetMatchPercent);
  const expectationCase = expectationCaseFor(studentTier, targetTier);

  return {
    academicStrength,
    academicBand: band,
    differentiation,
    targetTier,
    studentTier,
    resolvedUniversity,
    targetMatchPercent,
    risk: { label: riskLabel, message: RISK_MESSAGES[riskLabel] },
    expectation: { case: expectationCase, message: EXPECTATION_MESSAGES[expectationCase] },
    summary: summaryCopyFor(band, differentiation, targetTier),
    pinnedNextSteps: PINNED_NEXT_STEPS,
    disclaimer: REPORT_DISCLAIMER,
  };
}
