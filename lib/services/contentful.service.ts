import { contentfulClient } from "@/lib/contentful";
import type { CodingTestCase } from "@/types";

/**
 * Fetched coding problem data
 */
export interface FetchedProblem {
	id: string;
	title: string;
	slug: string;
	difficulty: string;
	testCases: CodingTestCase[];
	expectedComplexity: string;
	optimalLOC: number;
}

/**
 * Fetches a coding problem by slug from Contentful.
 * Returns null if not found.
 */
export async function getProblemBySlug(
	slug: string,
): Promise<FetchedProblem | null> {
	const response = await contentfulClient.getEntries({
		content_type: "codingProblem",
		"fields.slug": slug,
		limit: 1,
	});

	if (response.items.length === 0) {
		return null;
	}

	const entry = response.items[0]!;
	const fields = entry.fields;

	return {
		id: entry.sys.id,
		title: (fields.title as string) ?? "",
		slug: (fields.slug as string) ?? "",
		difficulty: (fields.difficulty as string) ?? "Medium",
		testCases: (fields.testCases as unknown as CodingTestCase[]) ?? [],
		expectedComplexity: (fields.expectedComplexity as string) ?? "O(n)",
		optimalLOC: (fields.optimalLOC as number) ?? 20,
	};
}

/**
 * Fetches a member profile by email from Contentful.
 * Returns the raw entry for management API operations.
 */
export async function getMemberByEmail(email: string) {
	const response = await contentfulClient.getEntries({
		content_type: "memberProfile",
		"fields.email": email,
		limit: 1,
	});

	if (response.items.length === 0) {
		return null;
	}

	return response.items[0]!;
}
