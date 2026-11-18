import { ApolloError } from 'apollo-server-express';
import { redisClient } from '../config/redis';

interface Limit {
  /** Max attempts allowed per window */
  max: number;
  /** Window length in seconds */
  windowSeconds: number;
}

export const LIMITS = {
  loginIp: { max: 20, windowSeconds: 15 * 60 },
  loginEmail: { max: 5, windowSeconds: 15 * 60 },
  registerIp: { max: 5, windowSeconds: 60 * 60 },
} satisfies Record<string, Limit>;

// In-memory fallback (used when Redis is unavailable). Single-instance only.
const memory = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memory) {
    if (entry.resetAt <= now) memory.delete(key);
  }
}, 60_000).unref();

async function increment(key: string, windowSeconds: number): Promise<{ count: number; retryAfter: number }> {
  if (redisClient.isReady) {
    try {
      const redisKey = `ratelimit:${key}`;
      const count = await redisClient.incr(redisKey);
      if (count === 1) await redisClient.expire(redisKey, windowSeconds);
      const ttl = await redisClient.ttl(redisKey);
      if (ttl < 0) await redisClient.expire(redisKey, windowSeconds); // never leave a key without expiry
      return { count, retryAfter: ttl > 0 ? ttl : windowSeconds };
    } catch (error) {
      console.error('Rate limit Redis error, using memory fallback:', error);
    }
  }

  const now = Date.now();
  let entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowSeconds * 1000 };
    memory.set(key, entry);
  }
  entry.count += 1;
  return { count: entry.count, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
}

/** Throws a RATE_LIMITED error once `key` exceeds the limit within its window. */
export async function enforceRateLimit(key: string, limit: Limit): Promise<void> {
  const { count, retryAfter } = await increment(key, limit.windowSeconds);
  if (count > limit.max) {
    throw new ApolloError(
      `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      'RATE_LIMITED',
      { retryAfter }
    );
  }
}

/** Clear a counter, e.g. after a successful login. */
export async function resetRateLimit(key: string): Promise<void> {
  memory.delete(key);
  if (redisClient.isReady) {
    try {
      await redisClient.del(`ratelimit:${key}`);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }
}
