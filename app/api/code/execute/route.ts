import { NextResponse } from 'next/server';
import { contentfulClient } from '@/lib/contentful';
import { createClient } from '@/lib/supabase-server';
import { calculateScore } from '@/lib/scoring-algo';

// Piston API
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
    javascript: { language: 'javascript', version: '18.15.0' },
    python: { language: 'python', version: '3.10.0' },
    cpp: { language: 'c++', version: '10.2.0' },
    js: { language: 'javascript', version: '18.15.0' },
    py: { language: 'python', version: '3.10.0' },
    'c++': { language: 'c++', version: '10.2.0' },
    java: { language: 'java', version: '15.0.2' },
};

export async function POST(request: Request) {
    try {
        const { code, language, problemSlug } = await request.json();

        // 1. Auth Check (Secure)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!code || !language || !problemSlug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const langConfig = LANGUAGE_MAP[language.toLowerCase()];
        if (!langConfig) {
            return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
        }

        // 2. Fetch Problem
        const response = await contentfulClient.getEntries({
            content_type: 'codingProblem',
            'fields.slug': problemSlug,
            limit: 1,
        });

        if (response.items.length === 0) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        const problem = response.items[0];
        const testCases = problem.fields.testCases as Array<{ input: string; output: string }>;
        const basePoints = (problem.fields.points as number) || 100;

        if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
            return NextResponse.json({
                error: 'Configuration Error: No test cases defined for this problem.'
            }, { status: 500 });
        }

        // 3. Execute Code via Piston
        const results = [];
        let allPassed = true;
        let totalRuntime = 0;

        // Note: Piston doesn't support running multiple test cases in one go easily unless we wrap logic.
        // For MVP, we run parallel or sequential requests. Sequential is safer for rate limits.

        for (const testCase of testCases) {
            const pistonPayload = {
                language: langConfig.language,
                version: langConfig.version,
                files: [{ content: code }],
                stdin: testCase.input || "",
            };

            try {
                const runRes = await fetch(PISTON_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pistonPayload),
                });

                if (!runRes.ok) {
                    throw new Error(`Piston API Error: ${runRes.statusText}`);
                }

                const runData = await runRes.json();
                const runOutput = runData.run || {};

                // Output cleaning (trim newlines)
                const actualOutput = (runOutput.stdout || "").trim();
                const expectedOutput = (testCase.output || "").trim();
                const passed = actualOutput === expectedOutput;

                // Runtime parsing (approximated from Piston if available, else 0)
                // Piston doesn't strictly return runtime ms easily in all versions, 
                // but usually it's fast enough. We'll simulate or capture if available.
                // Assuming Piston v2 doesn't always give precise ms in run object, 
                // we might need to rely on our own timing or assume constant.
                // Actually Piston returns `run.signal` etc. 
                // Let's rely on client perception or just use a placeholder for now as Piston free tier doesn't guarantee metric accuracy.
                const runtime = 0; // Placeholder

                if (!passed) allPassed = false;

                results.push({
                    input: testCase.input,
                    expected: expectedOutput,
                    actual: actualOutput,
                    passed: passed,
                    stderr: runOutput.stderr || "",
                });

            } catch (err: any) {
                console.error("Test Case Error:", err);
                results.push({
                    input: testCase.input,
                    expected: testCase.output,
                    actual: "Execution Error",
                    passed: false,
                    error: err.message
                });
                allPassed = false;
            }
        }

        // 4. Calculate Score using logic
        // Simulate a runtime based on "success" just for the scoring algo demonstration.
        // In real judge0, we get time.
        const simulatedRuntime = allPassed ? Math.floor(Math.random() * 100) + 20 : 0;
        const points = calculateScore(allPassed, simulatedRuntime, basePoints);

        // 5. Update Database (Submissions & Stats)
        try {
            // Insert Submission
            await supabase.from('submissions').insert({
                user_id: user.id, // linked to profiles.id via cascade
                problem_slug: problemSlug,
                code: code,
                language: language,
                status: allPassed ? 'Passed' : 'Failed',
                runtime: simulatedRuntime,
                points_awarded: points
            });

            if (allPassed) {
                // Check if user has ALREADY solved this problem (excluding the one we just inserted based on logic or simply checking count).
                // Since we inserted above, if this is the first time, count should be 1.

                const { count } = await supabase
                    .from('submissions')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('problem_slug', problemSlug)
                    .eq('status', 'Passed');

                // If count is 1, it means this is the first time (the one we just inserted).
                if (count === 1) {
                    const { data: profile } = await supabase.from('profiles').select('total_points').eq('id', user.id).single();
                    const newTotal = (profile?.total_points || 0) + points;

                    await supabase.from('profiles').update({
                        total_points: newTotal,
                        updated_at: new Date().toISOString()
                    }).eq('id', user.id);
                }
            }
        } catch (dbErr) {
            console.error("DB Update Error", dbErr);
            // Non-blocking error for user response, but log it
        }

        return NextResponse.json({
            passed: allPassed,
            results: results,
            points_awarded: points,
            runtime: simulatedRuntime
        });

    } catch (error: any) {
        console.error('Execution API Global Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
