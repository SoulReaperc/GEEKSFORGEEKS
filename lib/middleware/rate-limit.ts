import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function createRedis(): Redis | null {
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	return new Redis({ url, token });
}

const redis = createRedis();

function createLimiter(
	requests: number,
	windowSeconds: number,
): Ratelimit | null {
	if (!redis) return null;
	return new Ratelimit({
		redis,
		limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
	});
}

/** 10 req / 60 s — code execute & submit */
export const codeRatelimit = createLimiter(10, 60);

/** 30 req / 60 s — admin routes */
export const adminRatelimit = createLimiter(30, 60);

/** 5 req / 60 s — newsletter subscribe */
export const newsletterRatelimit = createLimiter(5, 60);

/**
 * Applies a rate limiter for the given identifier.
 * Returns a 429 NextResponse when the limit is exceeded, or null if the
 * request is allowed (including when Redis is unavailable — graceful degradation).
 */
export async function applyRateLimit(
	limiter: Ratelimit | null,
	identifier: string,
): Promise<NextResponse | null> {
	if (!limiter) return null;

	const { success, limit, remaining, reset } = await limiter.limit(identifier);

	if (!success) {
		return NextResponse.json(
			{ success: false, error: "Too many requests. Please try again later." },
			{
				status: 429,
				headers: {
					"X-RateLimit-Limit": String(limit),
					"X-RateLimit-Remaining": String(remaining),
					"X-RateLimit-Reset": String(reset),
					"Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
				},
			},
		);
	}

	return null;
}
