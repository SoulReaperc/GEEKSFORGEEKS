import { NextResponse } from "next/server";
import {
	handleApiError,
	NotFoundError,
	ValidationError,
} from "@/lib/middleware/error.middleware";
import { withAuth } from "@/lib/middleware/with-auth";
import { getProblemBySlug } from "@/lib/services/contentful.service";
import {
	executeTestCases,
	getLanguageConfig,
} from "@/lib/services/execution.service";
import { codeRequestSchema } from "@/lib/validation/code.schema";

export const POST = withAuth(async (request) => {
	try {
		const body = await request.json();

		// 2. Input Validation (Zod)
		const parsed = codeRequestSchema.safeParse(body);
		if (!parsed.success) {
			throw new ValidationError(
				parsed.error.issues[0]?.message ?? "Invalid request",
			);
		}
		const { code, language, problemSlug } = parsed.data;

		const langConfig = getLanguageConfig(language);
		if (!langConfig) {
			throw new ValidationError(`Unsupported language: ${language}`);
		}

		// 3. Fetch Problem from Contentful
		const problem = await getProblemBySlug(problemSlug);
		if (!problem) {
			throw new NotFoundError(`Problem: ${problemSlug}`);
		}

		if (!problem.testCases || problem.testCases.length === 0) {
			throw new ValidationError(
				"Configuration Error: No test cases defined for this problem.",
			);
		}

		// 4. Execute Code concurrently via Piston API
		const { results, allPassed, avgRuntime } = await executeTestCases(
			code,
			langConfig.language,
			langConfig.version,
			problem.testCases,
		);

		return NextResponse.json({
			success: true,
			passed: allPassed,
			results,
			runtime: avgRuntime,
			message: allPassed
				? `All ${problem.testCases.length} test cases passed! Click Submit to save your solution and earn points.`
				: `${results.filter((r) => r.passed).length}/${problem.testCases.length} test cases passed. Keep trying!`,
		});
	} catch (error: unknown) {
		return handleApiError(error);
	}
});
