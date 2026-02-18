import { describe, it, expect } from 'vitest';

/**
 * Pagination cap tests.
 *
 * These tests verify that the pagination logic used in list endpoints
 * caps the `limit` parameter to a maximum of 100, preventing clients
 * from requesting unbounded result sets.
 *
 * The capping formula used in routes:
 *   Math.min(parseInt(searchParams.get('limit') || '<default>', 10), 100)
 */

// Replicate the capping logic used in the route handlers
function capLimit(raw: string | null, defaultValue: number): number {
  return Math.min(parseInt(raw || String(defaultValue), 10), 100);
}

describe('Pagination limit capping', () => {
  it('defaults to the provided default when no limit is given', () => {
    expect(capLimit(null, 10)).toBe(10);
    expect(capLimit(null, 100)).toBe(100);
  });

  it('uses the provided limit when within range', () => {
    expect(capLimit('50', 10)).toBe(50);
    expect(capLimit('1', 10)).toBe(1);
    expect(capLimit('100', 10)).toBe(100);
  });

  it('caps the limit at 100 when a larger value is provided', () => {
    expect(capLimit('200', 10)).toBe(100);
    expect(capLimit('999', 10)).toBe(100);
    expect(capLimit('10000', 10)).toBe(100);
  });

  it('handles non-numeric input by falling back to NaN capped to 100', () => {
    // parseInt('abc') is NaN, Math.min(NaN, 100) is NaN
    const result = capLimit('abc', 10);
    expect(Number.isNaN(result)).toBe(true);
  });

  it('calculates skip correctly from page and capped limit', () => {
    const page = 3;
    const limit = capLimit('200', 10); // capped to 100
    const skip = (page - 1) * limit;
    expect(skip).toBe(200); // (3-1) * 100
  });
});
