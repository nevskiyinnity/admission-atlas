import { describe, it, expect } from 'vitest';
import {
  clampPercent,
  ensureStringArray,
  buildMockResponse,
  normalizeResult,
} from '@/lib/analysis-utils';

// ── clampPercent ────────────────────────────────────────

describe('clampPercent', () => {
  it('returns the rounded value when within 0-100', () => {
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(0)).toBe(0);
    expect(clampPercent(100)).toBe(100);
  });

  it('clamps values below 0 to 0', () => {
    expect(clampPercent(-10)).toBe(0);
    expect(clampPercent(-999)).toBe(0);
  });

  it('clamps values above 100 to 100', () => {
    expect(clampPercent(150)).toBe(100);
    expect(clampPercent(999)).toBe(100);
  });

  it('rounds fractional values', () => {
    expect(clampPercent(72.4)).toBe(72);
    expect(clampPercent(72.6)).toBe(73);
    expect(clampPercent(99.5)).toBe(100);
  });

  it('returns fallback for NaN inputs', () => {
    expect(clampPercent('abc')).toBe(0);
    expect(clampPercent(undefined)).toBe(0);
    expect(clampPercent(null)).toBe(0);
    expect(clampPercent(NaN)).toBe(0);
  });

  it('uses custom fallback when provided', () => {
    expect(clampPercent('abc', 42)).toBe(42);
    expect(clampPercent(undefined, 70)).toBe(70);
  });

  it('parses numeric strings', () => {
    expect(clampPercent('85')).toBe(85);
    expect(clampPercent('0')).toBe(0);
    expect(clampPercent('-5')).toBe(0);
    expect(clampPercent('200')).toBe(100);
  });
});

// ── ensureStringArray ───────────────────────────────────

describe('ensureStringArray', () => {
  const fallback = ['default item'];

  it('returns fallback when input is not an array', () => {
    expect(ensureStringArray(null, fallback)).toEqual(fallback);
    expect(ensureStringArray(undefined, fallback)).toEqual(fallback);
    expect(ensureStringArray('string', fallback)).toEqual(fallback);
    expect(ensureStringArray(42, fallback)).toEqual(fallback);
    expect(ensureStringArray({}, fallback)).toEqual(fallback);
  });

  it('returns fallback when input is an empty array', () => {
    expect(ensureStringArray([], fallback)).toEqual(fallback);
  });

  it('converts items to trimmed strings', () => {
    expect(ensureStringArray(['  hello  ', '  world  '], fallback)).toEqual(['hello', 'world']);
  });

  it('filters out empty/falsy items after trimming', () => {
    expect(
      ensureStringArray(['valid', '', '   ', null, undefined, 'also valid'], fallback),
    ).toEqual(['valid', 'also valid']);
  });

  it('coerces non-string items to strings', () => {
    expect(ensureStringArray([123, true], fallback)).toEqual(['123', 'true']);
  });

  it('limits output to 6 items', () => {
    const input = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const result = ensureStringArray(input, fallback);
    expect(result).toHaveLength(6);
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });
});

// ── buildMockResponse ───────────────────────────────────

describe('buildMockResponse', () => {
  const basePayload = {
    name: 'Jordan',
    university: 'MIT',
    major: 'Computer Science',
    gpa: '3.9',
    question6: '$50,000',
  };

  it('returns an object with all required fields', () => {
    const result = buildMockResponse(basePayload);

    expect(result).toHaveProperty('institution', 'MIT');
    expect(result).toHaveProperty('targetMatchPercent');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('concerns');
    expect(result).toHaveProperty('nextSteps');
    expect(result).toHaveProperty('categoryScores');
    expect(result).toHaveProperty('alternatives');
    expect(result).toHaveProperty('logs');
  });

  it('uses the university name as institution', () => {
    const result = buildMockResponse({ ...basePayload, university: 'Stanford' });
    expect(result.institution).toBe('Stanford');
  });

  it('includes the student name in the summary', () => {
    const result = buildMockResponse(basePayload);
    expect(result.summary).toContain('Jordan');
  });

  it('includes the major in the summary', () => {
    const result = buildMockResponse(basePayload);
    expect(result.summary).toContain('Computer Science');
  });

  it('returns a targetMatchPercent clamped between 0 and 100', () => {
    const result = buildMockResponse(basePayload);
    expect(result.targetMatchPercent).toBeGreaterThanOrEqual(0);
    expect(result.targetMatchPercent).toBeLessThanOrEqual(100);
  });

  it('gives a higher base score for GPA >= 3.8', () => {
    const highGpaResults = Array.from({ length: 20 }, () =>
      buildMockResponse({ ...basePayload, gpa: '3.9' }).targetMatchPercent,
    );
    const lowGpaResults = Array.from({ length: 20 }, () =>
      buildMockResponse({ ...basePayload, gpa: '3.0' }).targetMatchPercent,
    );
    const avgHigh = highGpaResults.reduce((a, b) => a + b, 0) / highGpaResults.length;
    const avgLow = lowGpaResults.reduce((a, b) => a + b, 0) / lowGpaResults.length;
    expect(avgHigh).toBeGreaterThan(avgLow);
  });

  it('applies a major boost for STEM-related majors', () => {
    const stemResults = Array.from({ length: 20 }, () =>
      buildMockResponse({ ...basePayload, major: 'Computer Science' }).targetMatchPercent,
    );
    const nonStemResults = Array.from({ length: 20 }, () =>
      buildMockResponse({ ...basePayload, major: 'Art History' }).targetMatchPercent,
    );
    const avgStem = stemResults.reduce((a, b) => a + b, 0) / stemResults.length;
    const avgNonStem = nonStemResults.reduce((a, b) => a + b, 0) / nonStemResults.length;
    expect(avgStem).toBeGreaterThan(avgNonStem);
  });

  it('returns exactly 5 alternatives', () => {
    const result = buildMockResponse(basePayload);
    expect(result.alternatives).toHaveLength(5);
  });

  it('alternatives have name, country, matchPercent, and why', () => {
    const result = buildMockResponse(basePayload);
    result.alternatives.forEach((alt) => {
      expect(alt).toHaveProperty('name');
      expect(alt).toHaveProperty('country');
      expect(alt).toHaveProperty('matchPercent');
      expect(alt).toHaveProperty('why');
      expect(typeof alt.name).toBe('string');
      expect(typeof alt.country).toBe('string');
      expect(typeof alt.matchPercent).toBe('number');
      expect(alt.matchPercent).toBeGreaterThanOrEqual(0);
      expect(alt.matchPercent).toBeLessThanOrEqual(100);
    });
  });

  it('returns 5 category scores', () => {
    const result = buildMockResponse(basePayload);
    expect(result.categoryScores).toHaveLength(5);
    const labels = result.categoryScores.map((c) => c.label);
    expect(labels).toContain('Academics');
    expect(labels).toContain('Activities');
    expect(labels).toContain('Major Fit');
    expect(labels).toContain('Campus Fit');
    expect(labels).toContain('Affordability');
  });

  it('returns an array of log strings', () => {
    const result = buildMockResponse(basePayload);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs.length).toBeGreaterThan(0);
    result.logs.forEach((log) => expect(typeof log).toBe('string'));
  });

  it('handles missing gpa gracefully', () => {
    const result = buildMockResponse({ ...basePayload, gpa: undefined });
    expect(result.targetMatchPercent).toBeGreaterThanOrEqual(0);
    expect(result.targetMatchPercent).toBeLessThanOrEqual(100);
  });
});

// ── normalizeResult ─────────────────────────────────────

describe('normalizeResult', () => {
  const payload = {
    name: 'Jordan',
    university: 'MIT',
    major: 'Computer Science',
    question6: '$50,000',
  };

  it('preserves well-formed raw data', () => {
    const raw = {
      institution: 'Massachusetts Institute of Technology',
      userTyped: 'MIT',
      targetMatchPercent: 88,
      summary: 'Strong fit for this student.',
      strengths: ['Great GPA', 'Strong activities'],
      concerns: ['High selectivity'],
      nextSteps: ['Write essays'],
      categoryScores: [
        { label: 'Academics', score: 90 },
        { label: 'Activities', score: 80 },
      ],
      alternatives: [
        { name: 'Stanford', country: 'USA', matchPercent: 85, why: 'Similar profile fit' },
      ],
      logs: ['Processing...'],
    };

    const result = normalizeResult(raw, payload);
    expect(result.institution).toBe('Massachusetts Institute of Technology');
    expect(result.userTyped).toBe('MIT');
    expect(result.targetMatchPercent).toBe(88);
    expect(result.summary).toBe('Strong fit for this student.');
    expect(result.strengths).toEqual(['Great GPA', 'Strong activities']);
    expect(result.concerns).toEqual(['High selectivity']);
    expect(result.nextSteps).toEqual(['Write essays']);
  });

  it('falls back to payload.university when institution is missing', () => {
    const result = normalizeResult({}, payload);
    expect(result.institution).toBe('MIT');
  });

  it('falls back to payload.university when userTyped is missing', () => {
    const result = normalizeResult({}, payload);
    expect(result.userTyped).toBe('MIT');
  });

  it('clamps targetMatchPercent between 0 and 100', () => {
    expect(normalizeResult({ targetMatchPercent: 150 }, payload).targetMatchPercent).toBe(100);
    expect(normalizeResult({ targetMatchPercent: -10 }, payload).targetMatchPercent).toBe(0);
  });

  it('uses compatibilityScore as fallback for targetMatchPercent', () => {
    const result = normalizeResult({ compatibilityScore: 72 }, payload);
    expect(result.targetMatchPercent).toBe(72);
  });

  it('defaults targetMatchPercent to 70 when both are missing', () => {
    const result = normalizeResult({}, payload);
    expect(result.targetMatchPercent).toBe(70);
  });

  it('provides default summary with student name and university', () => {
    const result = normalizeResult({}, payload);
    expect(result.summary).toContain('Jordan');
    expect(result.summary).toContain('MIT');
  });

  it('provides default strengths, concerns, nextSteps when missing', () => {
    const result = normalizeResult({}, payload);
    expect(result.strengths).toEqual(['Competitive academics for the target major.']);
    expect(result.concerns).toEqual(['Selective admissions uncertainty remains high.']);
    expect(result.nextSteps).toEqual(['Strengthen application narrative with school-specific fit.']);
  });

  it('provides default categoryScores when raw has none', () => {
    const result = normalizeResult({}, payload);
    expect(result.categoryScores).toHaveLength(5);
    const labels = result.categoryScores.map((c) => c.label);
    expect(labels).toEqual(['Academics', 'Activities', 'Major Fit', 'Campus Fit', 'Affordability']);
  });

  it('normalizes categoryScores: clamps scores and filters empty labels', () => {
    const raw = {
      categoryScores: [
        { label: 'Academics', score: 150 },
        { label: '', score: 50 },
        { label: 'Activities', score: -10 },
      ],
    };
    const result = normalizeResult(raw, payload);
    expect(result.categoryScores).toHaveLength(2);
    expect(result.categoryScores[0]).toEqual({ label: 'Academics', score: 100 });
    expect(result.categoryScores[1]).toEqual({ label: 'Activities', score: 0 });
  });

  it('limits categoryScores to 6 items', () => {
    const raw = {
      categoryScores: Array.from({ length: 10 }, (_, i) => ({ label: `Cat${i}`, score: 50 })),
    };
    const result = normalizeResult(raw, payload);
    expect(result.categoryScores.length).toBeLessThanOrEqual(6);
  });

  it('normalizes alternatives: clamps matchPercent and filters empty names', () => {
    const raw = {
      alternatives: [
        { name: 'Stanford', country: 'USA', matchPercent: 200, why: 'Great' },
        { name: '', country: 'UK', matchPercent: 50, why: 'Missing name' },
      ],
    };
    const result = normalizeResult(raw, payload);
    expect(result.alternatives).toHaveLength(1);
    expect(result.alternatives[0].matchPercent).toBe(100);
    expect(result.alternatives[0].name).toBe('Stanford');
  });

  it('limits alternatives to 6 items', () => {
    const raw = {
      alternatives: Array.from({ length: 10 }, (_, i) => ({
        name: `Uni${i}`,
        country: 'USA',
        matchPercent: 70,
        why: 'Good fit',
      })),
    };
    const result = normalizeResult(raw, payload);
    expect(result.alternatives.length).toBeLessThanOrEqual(6);
  });

  it('returns empty alternatives array when raw.alternatives is not an array', () => {
    const result = normalizeResult({ alternatives: 'not an array' }, payload);
    expect(result.alternatives).toEqual([]);
  });

  it('provides default logs when missing', () => {
    const result = normalizeResult({}, payload);
    expect(result.logs).toEqual(['Generating admissions analysis...']);
  });
});
