import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/services/auth.service';
import { getProblemBySlug } from '@/lib/services/contentful.service';
import { getLanguageConfig, verifyAllTestCases } from '@/lib/services/execution.service';
import { countEffectiveLOC, calculateScore } from '@/lib/services/grading.service';
import { findSubmission, createSubmission, updateSubmission } from '@/lib/repositories/submission.repository';
import { handlePointsUpdate } from '@/lib/repositories/profile.repository';
import { handleApiError, ValidationError, NotFoundError } from '@/lib/middleware/error.middleware';
import { codeRequestSchema } from '@/lib/validation/code.schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Input Validation (Zod)
        const parsed = codeRequestSchema.safeParse(body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid request');
        }
        const { code, language, problemSlug } = parsed.data;

        const langConfig = getLanguageConfig(language);
        if (!langConfig) {
            throw new ValidationError('Unsupported language');
        }

        // Fetch problem from Contentful
        const problem = await getProblemBySlug(problemSlug);
        if (!problem) {
            throw new NotFoundError('Problem');
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return NextResponse.json(
                {
                    status: 'Failed',
                    message: 'Configuration Error: No test cases found for this problem.',
                },
                { status: 200 }
            );
        }

        // Verify all test cases (sequential, fail-fast)
        const allPassed = await verifyAllTestCases(
            code,
            langConfig.language,
            langConfig.version,
            problem.testCases,
        );

        if (!allPassed) {
            return NextResponse.json(
                {
                    status: 'Failed',
                    message: 'Your solution did not pass all test cases.',
                },
                { status: 200 }
            );
        }

        // Grade submission
        const currentLOC = countEffectiveLOC(code);
        const mockExecutionTime = Math.floor(Math.random() * 5);

        const gradingResult = await calculateScore({
            difficulty: problem.difficulty || 'Medium',
            execution_time_ms: mockExecutionTime,
            code,
            optimal_loc: problem.optimalLOC,
        });

        // Save submission (if authenticated)
        const user = await validateSession();

        if (user) {
            const newPoints = Math.floor(gradingResult.total_score || 0);
            const existing = await findSubmission(user.id, problemSlug);
            const existingPoints = existing?.points_awarded ?? null;

            if (existing) {
                if (newPoints > (existingPoints ?? 0)) {
                    await updateSubmission({
                        userId: user.id,
                        problemSlug,
                        code,
                        language,
                        runtime: mockExecutionTime,
                        pointsAwarded: newPoints,
                    });
                }
            } else {
                await createSubmission({
                    userId: user.id,
                    problemSlug,
                    code,
                    language,
                    runtime: mockExecutionTime,
                    pointsAwarded: newPoints,
                });
            }

            await handlePointsUpdate(user.id, problemSlug, newPoints, existingPoints);
        }

        return NextResponse.json({
            status: 'Success',
            message: 'Congratulations! Your solution passed all test cases.',
            gradingResult,
        });

    } catch (error: unknown) {
        return handleApiError(error);
    }
}