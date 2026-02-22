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
				return JSON.parse(cached) as T;
			}

			const data = await fetcher();
			await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
			return data;
		} catch {
			// Redis failure — fall through to fetcher
		}
	}

	return fetcher();
}
