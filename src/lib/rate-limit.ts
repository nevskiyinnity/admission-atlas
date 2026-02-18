const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX_ENTRIES = 10_000;
const WINDOW_MS = 60_000; // 1 minute

function cleanup(now: number) {
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart >= WINDOW_MS) rateLimitMap.delete(key);
  }
  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    const entries = [...rateLimitMap.entries()].sort((a, b) => a[1].windowStart - b[1].windowStart);
    for (let i = 0; i < entries.length / 2; i++) {
      rateLimitMap.delete(entries[i][0]);
    }
  }
}

export function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now();
  cleanup(now);
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}
