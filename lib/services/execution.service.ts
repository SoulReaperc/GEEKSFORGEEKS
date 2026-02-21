import type { CodingTestCase, PistonExecuteResponse } from '@/types';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

/**
 * Language configuration for Piston API
 */
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  js: { language: 'javascript', version: '18.15.0' },
  py: { language: 'python', version: '3.10.0' },
  'c++': { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
};

/**
 * Result of executing a single test case
 */
export interface TestCaseExecResult {
  testCase: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  runtime: number;
  stderr?: string;
  error?: string;
}

/**
 * Result of executing all test cases
 */
export interface ExecutionResult {
  results: TestCaseExecResult[];
  allPassed: boolean;
  avgRuntime: number;
}

/**
 * Resolves a language string to a Piston-compatible config.
 * Returns null if the language is unsupported.
 */
export function getLanguageConfig(language: string): { language: string; version: string } | null {
  return LANGUAGE_MAP[language.toLowerCase()] ?? null;
}

/**
 * Executes code against test cases using the Piston API.
 * Uses Promise.allSettled() for concurrent execution.
 */
export async function executeTestCases(
  code: string,
  language: string,
  version: string,
  testCases: CodingTestCase[],
): Promise<ExecutionResult> {
  const promises = testCases.map((testCase, index) =>
    executeSingleTestCase(code, language, version, testCase, index)
  );

  const settled = await Promise.allSettled(promises);

  const results: TestCaseExecResult[] = settled.map((result, index) => {
    const testCase = testCases[index]!;
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      testCase: index + 1,
      input: testCase.input,
      expected: testCase.output,
      actual: 'Execution Error',
      passed: false,
      runtime: 0,
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
    };
  });

  const allPassed = results.every(r => r.passed);
  const executionTimes = results.filter(r => r.runtime > 0).map(r => r.runtime);
  const avgRuntime = executionTimes.length > 0
    ? Math.round(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length)
    : 0;

  return { results, allPassed, avgRuntime };
}

/**
 * Executes a single test case against the Piston API.
 */
async function executeSingleTestCase(
  code: string,
  language: string,
  version: string,
  testCase: CodingTestCase,
  index: number,
): Promise<TestCaseExecResult> {
  const startTime = Date.now();

  const runRes = await fetch(PISTON_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: code }],
      stdin: testCase.input || '',
    }),
  });

  const runtime = Date.now() - startTime;

  if (!runRes.ok) {
    throw new Error(`Piston API Error: ${runRes.status} ${runRes.statusText}`);
  }

  const runData: PistonExecuteResponse = await runRes.json();
  const runOutput = runData.run ?? { stdout: '', stderr: '', output: '', code: 1, signal: null };

  const actualOutput = (runOutput.stdout ?? '').trim();
  const expectedOutput = (testCase.output ?? '').trim();
  const passed = actualOutput === expectedOutput;

  return {
    testCase: index + 1,
    input: testCase.input,
    expected: expectedOutput,
    actual: actualOutput,
    passed,
    runtime,
    stderr: runOutput.stderr ?? '',
  };
}

/**
 * Quick check: runs code against all test cases and returns true/false.
 * Used by the submit route to verify before grading.
 */
export async function verifyAllTestCases(
  code: string,
  language: string,
  version: string,
  testCases: CodingTestCase[],
): Promise<boolean> {
  for (const testCase of testCases) {
    const runRes = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        version,
        files: [{ content: code }],
        stdin: testCase.input || '',
      }),
    });

    const runData = await runRes.json();
    const actual = (runData?.run?.output ?? '').trim();
    const expected = (testCase.output ?? '').trim();

    if (actual !== expected) {
      return false;
    }
  }
  return true;
}
