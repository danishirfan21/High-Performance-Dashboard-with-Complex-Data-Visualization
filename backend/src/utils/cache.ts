import { redisClient } from '../config/redis';

const PREFIX = 'cache:';
const DEFAULT_TTL_SECONDS = 60;

/**
 * Read-through Redis cache. Falls back to calling `fn` directly if Redis is
 * unavailable or errors, so caching never breaks a request.
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<T> {
  const fullKey = PREFIX + key;

  if (redisClient.isReady) {
    try {
      const hit = await redisClient.get(fullKey);
      if (hit !== null) return JSON.parse(hit) as T;
    } catch (error) {
      console.error('Cache read error:', error);
    }
  }

  const result = await fn();

  if (redisClient.isReady) {
    try {
      await redisClient.set(fullKey, JSON.stringify(result), { EX: ttlSeconds });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  return result;
}

/** Delete all cached entries whose key starts with `cache:<prefix>`. */
export async function invalidateCache(prefix = ''): Promise<void> {
  if (!redisClient.isReady) return;
  try {
    const keys: string[] = [];
    for await (const key of redisClient.scanIterator({ MATCH: `${PREFIX}${prefix}*`, COUNT: 100 })) {
      // node-redis v4 yields strings, v5 yields string[] batches
      if (Array.isArray(key)) keys.push(...key);
      else keys.push(key as string);
    }
    if (keys.length) await redisClient.del(keys);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}
