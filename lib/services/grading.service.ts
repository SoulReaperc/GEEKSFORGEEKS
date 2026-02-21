import { spawn } from 'child_process';
import path from 'path';
import type { GradingScriptInput, GradingScriptOutput } from '@/types';

/**
 * Count non-empty, non-comment lines of code.
 * Consolidated from duplicate implementations in submit and execute routes.
 */
export function countEffectiveLOC(code: string): number {
  if (!code) return 0;

  return code
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      line !== '' &&
      !line.startsWith('//') &&
      !line.startsWith('#') &&
      !line.startsWith('/*') &&
      !line.startsWith('*')
    ).length;
}

/**
 * Runs the Python grading script via child_process.spawn.
 * Sends JSON input via stdin, receives JSON output via stdout.
 */
export function runGradingScript(input: GradingScriptInput): Promise<GradingScriptOutput> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      'python',
      [path.join(process.cwd(), 'scripts', 'grade_submission.py')]
    );

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Grading script exited with code ${code}: ${stderr}`));
      }
      try {
        resolve(JSON.parse(stdout) as GradingScriptOutput);
      } catch {
        reject(new Error(`Failed to parse grading output: ${stdout}`));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to spawn grading process: ${err.message}`));
    });

    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();
  });
}

/**
 * Calculates a score with fallback if the Python script is unavailable.
 */
export async function calculateScore(input: GradingScriptInput): Promise<GradingScriptOutput> {
  try {
    return await runGradingScript(input);
  } catch (error) {
    console.error('Grading script failed, using fallback:', error);
    return getFallbackScore(input.difficulty);
  }
}

/**
 * Returns a basic fallback score when the Python grading script is unavailable.
 */
function getFallbackScore(difficulty: string): GradingScriptOutput {
  const basePoints = difficulty === 'easy' ? 10 :
    difficulty === 'medium' ? 20 : 30;

  return {
    total_score: basePoints,
    max_marks: basePoints,
    details: {
      error: 'Grading algorithm unavailable, using fallback scoring',
      execution_speed: { score: 0, max: 0 },
      lines_of_code: { score: 0, max: 0 },
    },
  };
}
