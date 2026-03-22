import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

const neuralEngineLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'saju:neural-engine',
    })
  : null;

const memoryMap = new Map<string, { count: number; start: number }>();

export async function isNeuralEngineRateLimited(ip: string): Promise<boolean> {
  if (neuralEngineLimiter) {
    try {
      const { success } = await neuralEngineLimiter.limit(ip);
      return !success;
    } catch { /* fall through */ }
  }
  const now = Date.now();
  const entry = memoryMap.get(ip);
  if (!entry || now - entry.start >= 60_000) {
    memoryMap.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}
