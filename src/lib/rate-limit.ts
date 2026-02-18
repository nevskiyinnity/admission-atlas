import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Upstash Redis rate limiter (serverless-compatible, persists across invocations) ──

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      analytics: true,
      prefix: "admission-atlas:ratelimit",
    })
  : null;

// ── In-memory fallback (used when Upstash is not configured) ─────────

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX_ENTRIES = 10_000;
const WINDOW_MS = 60_000; // 1 minute

function cleanup(now: number) {
  for (const [key, entry] of Array.from(rateLimitMap.entries())) {
    if (now - entry.windowStart >= WINDOW_MS) rateLimitMap.delete(key);
  }
  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    const entries = Array.from(rateLimitMap.entries()).sort((a, b) => a[1].windowStart - b[1].windowStart);
    for (let i = 0; i < entries.length / 2; i++) {
      rateLimitMap.delete(entries[i][0]);
    }
  }
}

function isRateLimitedInMemory(key: string, maxRequests: number): boolean {
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

// ── Public API (unchanged interface) ─────────────────────────────────

export async function isRateLimited(key: string, maxRequests: number): Promise<boolean> {
  if (!ratelimit) {
    return isRateLimitedInMemory(key, maxRequests);
  }

  try {
    const { success } = await ratelimit.limit(key);
    return !success;
  } catch {
    // If Redis fails, fall back to in-memory so the app stays available
    return isRateLimitedInMemory(key, maxRequests);
  }
}
