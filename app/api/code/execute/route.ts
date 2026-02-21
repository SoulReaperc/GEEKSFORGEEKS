import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { getProblemBySlug } from '@/lib/services/contentful.service';
import { getLanguageConfig, executeTestCases } from '@/lib/services/execution.service';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/middleware/error.middleware';

export async function POST(request: Request) {
    try {
        const { code, language, problemSlug } = await request.json();

        // 1. Authentication
        await requireAuth();

        // 2. Input Validation
        if (!code || !language || !problemSlug) {
            throw new ValidationError(
                'Missing required fields: code, language, and problemSlug are required'
            );
        }

        const langConfig = getLanguageConfig(language);
        if (!langConfig) {
            throw new ValidationError(
                `Unsupported language: ${language}`
            );
        }

        // 3. Fetch Problem from Contentful
        const problem = await getProblemBySlug(problemSlug);
        if (!problem) {
            throw new NotFoundError(`Problem: ${problemSlug}`);
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            throw new ValidationError(
                'Configuration Error: No test cases defined for this problem.'
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
                : `${results.filter(r => r.passed).length}/${problem.testCases.length} test cases passed. Keep trying!`
        });

    } catch (error: unknown) {
        return handleApiError(error);
    }
}