import { Redis } from "@upstash/redis";

export function getRedis(): Redis | null {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	return new Redis({ url, token });
}

/**
 * Wraps a Contentful fetcher with Redis caching.
 * Falls back to calling the fetcher directly when Redis is unavailable.
 */
export async function withCache<T>(
	key: string,
	ttlSeconds: number,
	fetcher: () => Promise<T>,
): Promise<T> {
	const redis = getRedis();

	if (redis) {
		try {
			const cached = await redis.get<string>(key);
			if (cached !== null) {
				console.log(`[Cache] HIT  ${key}`);
				return JSON.parse(cached) as T;
			}

			const data = await fetcher();
			await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
			console.log(`[Cache] MISS ${key} — stored for ${ttlSeconds}s`);
			return data;
		} catch (err) {
			console.warn(`[Cache] Redis error for key "${key}":`, err);
			// Redis failure — fall through to fetcher
		}
	} else {
		console.log(`[Cache] SKIP ${key} — Redis not configured`);
	}

	return fetcher();
}
