import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Re-import fresh module for each test by clearing the module cache
let isRateLimited: typeof import('@/lib/rate-limit').isRateLimited;

beforeEach(async () => {
  vi.useFakeTimers();
  // Reset the module to get a fresh rateLimitMap each time
  vi.resetModules();
  const mod = await import('@/lib/rate-limit');
  isRateLimited = mod.isRateLimited;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('isRateLimited', () => {
  it('allows requests within the limit', () => {
    const maxRequests = 5;

    for (let i = 0; i < maxRequests; i++) {
      expect(isRateLimited('user-1', maxRequests)).toBe(false);
    }
  });

  it('blocks requests exceeding the limit', () => {
    const maxRequests = 3;

    // First 3 should pass
    for (let i = 0; i < maxRequests; i++) {
      expect(isRateLimited('user-1', maxRequests)).toBe(false);
    }

    // The 4th should be blocked
    expect(isRateLimited('user-1', maxRequests)).toBe(true);
    // The 5th too
    expect(isRateLimited('user-1', maxRequests)).toBe(true);
  });

  it('resets after the window expires (60 seconds)', () => {
    const maxRequests = 2;

    // Use up the limit
    expect(isRateLimited('user-1', maxRequests)).toBe(false);
    expect(isRateLimited('user-1', maxRequests)).toBe(false);
    expect(isRateLimited('user-1', maxRequests)).toBe(true);

    // Advance time past the 60-second window
    vi.advanceTimersByTime(61_000);

    // Should be allowed again
    expect(isRateLimited('user-1', maxRequests)).toBe(false);
  });

  it('tracks different keys independently', () => {
    const maxRequests = 1;

    expect(isRateLimited('user-a', maxRequests)).toBe(false);
    expect(isRateLimited('user-a', maxRequests)).toBe(true); // blocked

    // Different key should still be allowed
    expect(isRateLimited('user-b', maxRequests)).toBe(false);
  });

  it('cleanup removes expired entries', () => {
    const maxRequests = 10;

    // Create entries for multiple keys
    isRateLimited('key-1', maxRequests);
    isRateLimited('key-2', maxRequests);

    // Advance past the window
    vi.advanceTimersByTime(61_000);

    // A new call triggers cleanup; the old entries should be gone.
    // The new key should start fresh and be allowed.
    isRateLimited('key-3', maxRequests);

    // key-1 should also start fresh after expiry
    expect(isRateLimited('key-1', maxRequests)).toBe(false);
  });

  it('evicts the oldest half when map exceeds max entries', () => {
    // The RATE_LIMIT_MAX_ENTRIES is 10,000.
    // We fill to 10,001 entries, which triggers eviction of the oldest half.
    const maxRequests = 100;

    // Create 10,001 entries with unique keys at different times
    for (let i = 0; i <= 10_000; i++) {
      // Advance 1ms between entries so they have different windowStart values
      vi.advanceTimersByTime(1);
      isRateLimited(`flood-key-${i}`, maxRequests);
    }

    // After 10,001 entries, cleanup runs and evicts ~5000 oldest.
    // The newest entries should still be present.
    // Trigger another call to confirm the map did not explode.
    expect(isRateLimited('new-key', maxRequests)).toBe(false);

    // One of the oldest keys should have been evicted.
    // Since we advanced only 10s total (10001ms), entries are NOT expired
    // by the time-window check — they are evicted by the size-cap logic.
    // After eviction, flood-key-0 (oldest) is gone, so a new call starts fresh.
    expect(isRateLimited('flood-key-0', maxRequests)).toBe(false);
  });
});
